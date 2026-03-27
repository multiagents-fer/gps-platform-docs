# Base de Datos de Cobranza

Esquema principal de cobranza dentro de `cobranza_db` (PostgreSQL :5432).

## Diagrama ER

```mermaid
erDiagram
    CLIENTS {
        serial id PK
        varchar rfc UK
        varchar name
        varchar phone
        varchar email
        varchar address
        float latitude
        float longitude
        decimal total_debt
        int days_overdue
        varchar status
        float priority_score
        date last_payment
        date next_promise
        varchar assigned_collector
        jsonb metadata
        timestamptz created_at
        timestamptz updated_at
    }

    DETECTED_LOCATIONS {
        serial id PK
        int client_id FK
        varchar vehicle_id FK
        float latitude
        float longitude
        varchar address_resolved
        timestamptz detected_at
        varchar detection_source
        float confidence
        boolean is_verified
    }

    DAILY_ROUTES {
        serial id PK
        varchar collector_id
        date route_date
        int total_stops
        float total_distance_km
        float estimated_duration_hours
        varchar status
        jsonb optimization_params
        timestamptz created_at
    }

    ROUTE_STOPS {
        serial id PK
        int route_id FK
        int client_id FK
        int stop_order
        float latitude
        float longitude
        varchar address
        varchar priority
        varchar visit_status
        text notes
        timestamptz scheduled_at
        timestamptz visited_at
        interval actual_duration
    }

    VISIT_LOG {
        serial id PK
        int client_id FK
        int route_stop_id FK
        varchar collector_id
        varchar outcome
        decimal amount_collected
        text notes
        varchar next_action
        date promise_date
        jsonb evidence
        timestamptz visited_at
    }

    PAYMENT_HISTORY {
        serial id PK
        int client_id FK
        decimal amount
        varchar method
        varchar reference
        date payment_date
        varchar status
        timestamptz created_at
    }

    CLIENTS ||--o{ DETECTED_LOCATIONS : tiene
    CLIENTS ||--o{ ROUTE_STOPS : asignado_en
    CLIENTS ||--o{ VISIT_LOG : visitado_en
    CLIENTS ||--o{ PAYMENT_HISTORY : pagos_de
    DAILY_ROUTES ||--o{ ROUTE_STOPS : contiene
    ROUTE_STOPS ||--o| VISIT_LOG : resultado_de
```

## Tabla: clients

Almacena los 794 clientes morosos activos del portafolio de cobranza.

```sql
CREATE TABLE clients (
    id              SERIAL PRIMARY KEY,
    rfc             VARCHAR(13) UNIQUE,
    name            VARCHAR(200) NOT NULL,
    phone           VARCHAR(20),
    email           VARCHAR(100),
    address         TEXT,
    latitude        DOUBLE PRECISION,
    longitude       DOUBLE PRECISION,
    total_debt      DECIMAL(12, 2) NOT NULL DEFAULT 0,
    days_overdue    INTEGER DEFAULT 0,
    status          VARCHAR(20) DEFAULT 'active',
    priority_score  FLOAT DEFAULT 0,
    last_payment    DATE,
    next_promise    DATE,
    assigned_collector VARCHAR(50),
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_clients_priority ON clients (priority_score DESC);
CREATE INDEX idx_clients_status ON clients (status);
CREATE INDEX idx_clients_collector ON clients (assigned_collector);
CREATE INDEX idx_clients_location ON clients (latitude, longitude);
```

## Tabla: detected_locations

Ubicaciones detectadas por GPS donde se ha visto el vehículo del deudor.

```sql
CREATE TABLE detected_locations (
    id               SERIAL PRIMARY KEY,
    client_id        INTEGER REFERENCES clients(id),
    vehicle_id       VARCHAR(50),
    latitude         DOUBLE PRECISION NOT NULL,
    longitude        DOUBLE PRECISION NOT NULL,
    address_resolved TEXT,
    detected_at      TIMESTAMPTZ NOT NULL,
    detection_source VARCHAR(20), -- 'gps', 'manual', 'ai'
    confidence       FLOAT DEFAULT 1.0,
    is_verified      BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_detected_loc_client ON detected_locations (client_id);
CREATE INDEX idx_detected_loc_time ON detected_locations (detected_at DESC);
```

## Tabla: daily_routes

Rutas optimizadas generadas diariamente para cada cobrador.

```sql
CREATE TABLE daily_routes (
    id                      SERIAL PRIMARY KEY,
    collector_id            VARCHAR(50) NOT NULL,
    route_date              DATE NOT NULL,
    total_stops             INTEGER DEFAULT 0,
    total_distance_km       FLOAT,
    estimated_duration_hours FLOAT,
    status                  VARCHAR(20) DEFAULT 'pending',
    optimization_params     JSONB DEFAULT '{}',
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(collector_id, route_date)
);
```

## Flujo de Datos

```mermaid
flowchart TB
    subgraph Ingesta
        ML[ML Pipeline\nNocturno]
        GPS[GPS Detections]
        IMP[Importación CSV]
    end

    subgraph Procesamiento
        SCORE[Cálculo de\npriority_score]
        LOC[Resolución de\nubicaciones]
        OPT[Optimización\nde rutas]
    end

    subgraph Tablas
        C[(clients)]
        DL[(detected_locations)]
        DR[(daily_routes)]
        RS[(route_stops)]
        VL[(visit_log)]
    end

    IMP --> C
    ML --> SCORE --> C
    GPS --> LOC --> DL
    C --> OPT
    DL --> OPT
    OPT --> DR
    OPT --> RS
    RS --> VL
```

## Estadísticas del Portafolio

| Métrica | Valor |
|---------|-------|
| Clientes activos | 794 |
| Deuda total portafolio | ~$45M MXN |
| Deuda promedio | ~$56,700 MXN |
| Días mora promedio | 127 |
| Ubicaciones detectadas | ~15,000 |
| Rutas generadas/día | ~30 |
| Paradas promedio/ruta | ~12 |

## Queries Frecuentes

```sql
-- Top 20 clientes por prioridad
SELECT id, name, total_debt, days_overdue, priority_score
FROM clients
WHERE status = 'active'
ORDER BY priority_score DESC
LIMIT 20;

-- Ubicaciones frecuentes de un cliente
SELECT latitude, longitude, address_resolved,
       COUNT(*) as visit_count,
       MAX(detected_at) as last_seen
FROM detected_locations
WHERE client_id = $1
GROUP BY latitude, longitude, address_resolved
ORDER BY visit_count DESC;

-- Efectividad de cobranza por cobrador
SELECT collector_id,
       COUNT(*) as total_visits,
       SUM(CASE WHEN outcome = 'payment' THEN 1 ELSE 0 END) as payments,
       SUM(amount_collected) as total_collected
FROM visit_log
WHERE visited_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY collector_id;
```

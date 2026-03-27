# Base de Datos de Diagnósticos

Esquema para dossiers vehiculares, diagnósticos OBD-II y valuaciones dentro de `cobranza_db` (:5432).

## Diagrama ER

```mermaid
erDiagram
    VEHICLE_DOSSIERS {
        serial id PK
        varchar vin UK
        varchar make
        varchar model
        int year
        int mileage
        varchar plate
        varchar owner_name
        varchar insurance_status
        float overall_health_score
        jsonb metadata
        timestamptz created_at
        timestamptz updated_at
    }

    DIAGNOSTIC_SCANS {
        serial id PK
        int dossier_id FK
        varchar scanner_type
        varchar scan_source
        varchar pdf_url
        timestamptz scan_date
        float health_score
        int total_dtc_codes
        int critical_faults
        varchar status
        jsonb raw_parsed
        timestamptz created_at
    }

    SENSOR_READINGS {
        serial id PK
        int scan_id FK
        varchar sensor_name
        varchar sensor_category
        float value
        varchar unit
        float min_normal
        float max_normal
        varchar status
        varchar severity
    }

    DTC_FAULTS {
        serial id PK
        int scan_id FK
        varchar code
        varchar description
        varchar system
        varchar severity
        boolean is_active
        varchar recommendation
    }

    SYSTEM_STATUSES {
        serial id PK
        int scan_id FK
        varchar system_name
        varchar status
        float score
        text details
        varchar ai_evaluation
    }

    DEPRECIATION_RULES {
        serial id PK
        varchar make
        varchar model
        int year_from
        int year_to
        float annual_rate
        float mileage_factor
        float condition_factor
        jsonb adjustments
    }

    VALUATION_SNAPSHOTS {
        serial id PK
        int dossier_id FK
        decimal market_value
        decimal adjusted_value
        float depreciation_applied
        float condition_multiplier
        float mechanical_score
        jsonb breakdown
        timestamptz valued_at
    }

    VEHICLE_DOSSIERS ||--o{ DIAGNOSTIC_SCANS : contiene
    DIAGNOSTIC_SCANS ||--o{ SENSOR_READINGS : lecturas
    DIAGNOSTIC_SCANS ||--o{ DTC_FAULTS : fallas
    DIAGNOSTIC_SCANS ||--o{ SYSTEM_STATUSES : sistemas
    VEHICLE_DOSSIERS ||--o{ VALUATION_SNAPSHOTS : valuaciones
    DEPRECIATION_RULES }o--o{ VALUATION_SNAPSHOTS : aplica
```

## Tabla: vehicle_dossiers

Expediente maestro de cada vehículo diagnosticado.

```sql
CREATE TABLE vehicle_dossiers (
    id                  SERIAL PRIMARY KEY,
    vin                 VARCHAR(17) UNIQUE,
    make                VARCHAR(50),
    model               VARCHAR(100),
    year                INTEGER,
    mileage             INTEGER,
    plate               VARCHAR(15),
    owner_name          VARCHAR(200),
    insurance_status    VARCHAR(20),
    overall_health_score FLOAT,
    metadata            JSONB DEFAULT '{}',
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);
```

## Tabla: diagnostic_scans

Cada escaneo OBD-II procesado desde PDF.

```sql
CREATE TABLE diagnostic_scans (
    id              SERIAL PRIMARY KEY,
    dossier_id      INTEGER REFERENCES vehicle_dossiers(id),
    scanner_type    VARCHAR(20) NOT NULL, -- 'thinkcar', 'topdon'
    scan_source     VARCHAR(20),         -- 'email', 'upload', 'sqs'
    pdf_url         TEXT,
    scan_date       TIMESTAMPTZ,
    health_score    FLOAT,
    total_dtc_codes INTEGER DEFAULT 0,
    critical_faults INTEGER DEFAULT 0,
    status          VARCHAR(20) DEFAULT 'processed',
    raw_parsed      JSONB,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

## Tabla: sensor_readings

Las 40+ lecturas de sensores extraídas de cada escaneo.

```sql
CREATE TABLE sensor_readings (
    id               SERIAL PRIMARY KEY,
    scan_id          INTEGER REFERENCES diagnostic_scans(id),
    sensor_name      VARCHAR(100) NOT NULL,
    sensor_category  VARCHAR(50),
    value            DOUBLE PRECISION,
    unit             VARCHAR(20),
    min_normal       DOUBLE PRECISION,
    max_normal       DOUBLE PRECISION,
    status           VARCHAR(20), -- 'normal', 'warning', 'critical'
    severity         VARCHAR(20)
);
```

### Categorías de Sensores

```mermaid
graph TB
    subgraph Motor
        S1[RPM]
        S2[Temperatura Refrigerante]
        S3[Presión Aceite]
        S4[Carga Motor]
        S5[Timing Advance]
    end

    subgraph Combustible
        S6[Presión Combustible]
        S7[Ratio Aire/Combustible]
        S8[Trim Corto Plazo]
        S9[Trim Largo Plazo]
    end

    subgraph Emisiones
        S10[Sensor O2 Banco 1]
        S11[Sensor O2 Banco 2]
        S12[Temperatura Catalizador]
        S13[EGR Flow]
    end

    subgraph Eléctrico
        S14[Voltaje Batería]
        S15[Alternador]
        S16[Sistema Arranque]
    end

    subgraph Transmisión
        S17[Temperatura Trans]
        S18[Presión Trans]
        S19[Velocidad Entrada]
        S20[Velocidad Salida]
    end
```

## Tabla: dtc_faults

Códigos de falla diagnóstica (DTC - Diagnostic Trouble Codes).

```sql
CREATE TABLE dtc_faults (
    id              SERIAL PRIMARY KEY,
    scan_id         INTEGER REFERENCES diagnostic_scans(id),
    code            VARCHAR(10) NOT NULL,  -- P0301, B0100, etc.
    description     TEXT,
    system          VARCHAR(50),
    severity        VARCHAR(20),           -- 'info', 'warning', 'critical'
    is_active       BOOLEAN DEFAULT TRUE,
    recommendation  TEXT
);
```

### Clasificación de Códigos DTC

| Prefijo | Sistema | Ejemplo |
|---------|---------|---------|
| P0xxx | Tren motriz genérico | P0301 - Misfire cilindro 1 |
| P1xxx | Tren motriz fabricante | P1234 - Específico OEM |
| B0xxx | Carrocería genérico | B0100 - Airbag malfunction |
| C0xxx | Chasis genérico | C0035 - ABS sensor fault |
| U0xxx | Red/comunicación | U0100 - Lost ECM comm |

## Flujo de Procesamiento

```mermaid
flowchart TB
    A[PDF Diagnóstico] --> B{Tipo Scanner}
    B -->|ThinkCar| C[ThinkCar Parser]
    B -->|TopDon| D[TopDon Parser]

    C --> E[Extracción Estructurada]
    D --> E

    E --> F[40+ Sensor Readings]
    E --> G[DTC Codes]
    E --> H[System Statuses]

    F --> I[(sensor_readings)]
    G --> J[(dtc_faults)]
    H --> K[(system_statuses)]

    I --> L[AI Agent\nDiagnóstico]
    J --> L
    K --> L

    L --> M[Health Score]
    M --> N[(vehicle_dossiers)]

    N --> O[Valuación]
    O --> P[(valuation_snapshots)]
```

## Tabla: depreciation_rules

Reglas de depreciación por marca, modelo y año.

```sql
CREATE TABLE depreciation_rules (
    id               SERIAL PRIMARY KEY,
    make             VARCHAR(50),
    model            VARCHAR(100),
    year_from        INTEGER,
    year_to          INTEGER,
    annual_rate      FLOAT NOT NULL,      -- 0.15 = 15% anual
    mileage_factor   FLOAT DEFAULT 1.0,   -- Factor por km
    condition_factor FLOAT DEFAULT 1.0,   -- Factor por condición
    adjustments      JSONB DEFAULT '{}'
);
```

## Tabla: valuation_snapshots

Valuaciones calculadas combinando mercado + diagnóstico + depreciación.

```sql
CREATE TABLE valuation_snapshots (
    id                   SERIAL PRIMARY KEY,
    dossier_id           INTEGER REFERENCES vehicle_dossiers(id),
    market_value         DECIMAL(12, 2),
    adjusted_value       DECIMAL(12, 2),
    depreciation_applied FLOAT,
    condition_multiplier FLOAT,
    mechanical_score     FLOAT,
    breakdown            JSONB,
    valued_at            TIMESTAMPTZ DEFAULT NOW()
);
```

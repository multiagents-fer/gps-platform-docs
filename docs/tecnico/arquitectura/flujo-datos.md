# Flujo de Datos

Diagramas detallados de cómo fluyen los datos a través de los distintos subsistemas del ecosistema AgentsMX.

## 1. Flujo GPS

Desde la captura de señales GPS hasta la visualización en el mapa de cobranza.

```mermaid
sequenceDiagram
    participant SW as SeeWorld API
    participant DA as Driver Adapters<br/>:5000
    participant WK as GPS Sync Worker<br/>APScheduler
    participant TS as TimescaleDB<br/>:5432
    participant API as GPS Data API<br/>:5002
    participant FE as Cobranza PWA<br/>:3002

    loop Cada 60 segundos
        WK->>DA: GET /api/v1/positions
        DA->>SW: GET /api/devices/positions
        SW-->>DA: [{lat, lng, speed, ignition}]
        DA-->>WK: Posiciones normalizadas

        WK->>WK: Compresión diferencial<br/>(solo cambios de estado)
        WK->>TS: INSERT vehicle_status_history
        WK->>TS: UPDATE vehicle_state_log
        WK->>TS: Análisis de patrones
    end

    FE->>API: GET /api/v1/vehicles/{id}/history
    API->>TS: SELECT con rango temporal
    TS-->>API: Serie temporal comprimida
    API-->>FE: GeoJSON con track

    FE->>API: GET /api/v1/vehicles/realtime
    API->>TS: SELECT últimas posiciones
    TS-->>API: Estado actual por vehículo
    API-->>FE: Mapa en tiempo real
```

## 2. Flujo de Scraping

Desde la extracción web hasta el dashboard de analytics.

```mermaid
sequenceDiagram
    participant WEB as Sitios Web<br/>(Kavak, Albacar, etc.)
    participant SP as Scrapy Spiders<br/>(18 nacional)
    participant PG as PostgreSQL<br/>:5433
    participant DDB as DynamoDB<br/>(MTY variant)
    participant SQS as AWS SQS
    participant WK as Marketplace Sync
    participant API as Marketplace API<br/>:5050
    participant FE as Dashboard<br/>:4200

    SP->>WEB: HTTP/Playwright requests
    WEB-->>SP: HTML/JSON/XML responses

    SP->>SP: Pipeline normalización<br/>(precio, año, marca, modelo)

    alt Scrapper Nacional
        SP->>PG: INSERT INTO vehicles
        SP->>PG: INSERT kavak_price_history
        PG->>SQS: Evento new_listing
    else Scrapper MTY
        SP->>DDB: PutItem vehicles
        SP->>SQS: Evento new_listing
    end

    SQS->>WK: Consume mensajes
    WK->>WK: Procesa listing<br/>(dedup, enriquecimiento)
    WK->>PG: UPDATE vehicle enriched

    FE->>API: GET /api/v1/analytics/prices
    API->>PG: Query con agregaciones
    PG-->>API: Estadísticas de mercado
    API-->>FE: Charts y tablas
```

## 3. Flujo de Diagnósticos

Desde el escáner OBD-II hasta los reportes de valuación.

```mermaid
sequenceDiagram
    participant SC as Escáner OBD-II<br/>(ThinkCar/TopDon)
    participant PDF as Reporte PDF
    participant EM as Email / Upload
    participant SQS as AWS SQS
    participant WK as Diagnostic Sync
    participant DB as PostgreSQL<br/>cobranza_db
    participant AI as AI Agents<br/>:5001
    participant API as Cobranza API<br/>:8000

    SC->>PDF: Genera reporte PDF
    PDF->>EM: Envío por email/upload
    EM->>SQS: Encola para procesamiento

    SQS->>WK: Consume mensaje
    WK->>WK: Parser PDF<br/>(ThinkCar o TopDon)
    WK->>WK: Extrae 40+ lecturas<br/>de sensores
    WK->>DB: INSERT diagnostic_scans
    WK->>DB: INSERT sensor_readings
    WK->>DB: INSERT dtc_faults

    WK->>AI: POST /api/v1/analyze
    AI->>AI: Agente Diagnóstico<br/>analiza datos
    AI-->>WK: Evaluación + score

    WK->>DB: INSERT system_statuses
    WK->>DB: UPDATE vehicle_dossiers

    API->>DB: GET diagnóstico completo
    DB-->>API: Dossier vehicular
    API-->>API: Cálculo valuación<br/>con depreciación
```

## 4. Flujo de Cobranza

Desde el pipeline ML hasta las rutas diarias del cobrador.

```mermaid
sequenceDiagram
    participant ML as ML Pipeline<br/>(scikit-learn)
    participant DB as PostgreSQL<br/>cobranza_db
    participant REDIS as Redis Cache
    participant API as Cobranza API<br/>:8000
    participant AI as AI Agents<br/>:5001
    participant FE as Cobranza PWA<br/>:3002
    participant COB as Cobrador<br/>(en campo)

    Note over ML,DB: Ejecución nocturna del pipeline

    ML->>DB: SELECT clientes morosos
    DB-->>ML: 794 clientes activos
    ML->>ML: Feature engineering<br/>(días mora, monto, zona)
    ML->>ML: Modelo priorización<br/>(Random Forest)
    ML->>DB: UPDATE priority_scores
    ML->>REDIS: Cache resultados

    API->>DB: GET clientes priorizados
    API->>API: Optimización de rutas<br/>(geográfica + prioridad)
    API->>DB: INSERT daily_routes
    API->>DB: INSERT route_stops

    COB->>FE: Abre app PWA
    FE->>API: GET /api/v1/routes/today
    API->>REDIS: Check cache
    REDIS-->>API: Ruta optimizada
    API-->>FE: Ruta con paradas

    COB->>FE: Registra visita
    FE->>API: POST /api/v1/visits
    API->>DB: INSERT visit_log
    API->>AI: Analiza resultado
    AI-->>API: Sugerencia siguiente acción
```

## Diagrama de Flujo Consolidado

```mermaid
flowchart TB
    subgraph Fuentes Externas
        GPS_HW[Hardware GPS]
        WEB[Sitios Web]
        OBD[Escáner OBD-II]
    end

    subgraph Ingesta
        DA[Driver Adapters]
        SC[Scrapy Spiders]
        SQS[AWS SQS]
    end

    subgraph Procesamiento
        W1[GPS Sync]
        W2[Marketplace Sync]
        W3[Diagnostic Sync]
        ML[ML Pipeline]
    end

    subgraph Almacenamiento
        TSDB[(TimescaleDB)]
        PG1[(cobranza_db)]
        PG2[(scrapper_nacional)]
        REDIS[(Redis)]
    end

    subgraph APIs
        A1[GPS API]
        A2[Cobranza API]
        A3[Marketplace API]
        A4[AI Agents]
    end

    subgraph Frontends
        F1[Cobranza PWA]
        F2[Dashboard]
    end

    GPS_HW --> DA --> W1 --> TSDB --> A1 --> F1
    WEB --> SC --> PG2 --> W2 --> A3 --> F2
    OBD --> SQS --> W3 --> PG1 --> A4 --> A2 --> F1
    PG1 --> ML --> REDIS --> A2
```

## Volúmenes de Datos

| Flujo | Volumen | Frecuencia | Retención |
|-------|---------|------------|-----------|
| GPS Posiciones | ~4,000 vehículos | Cada 60 segundos | 1 año (hypertable) |
| Scraping Nacional | ~11,000 vehículos | Diario | Indefinida |
| Diagnósticos | ~50/semana | Por demanda | Indefinida |
| ML Pipeline | 794 clientes | Diario (nocturno) | Último score |
| Rutas diarias | ~30 rutas/día | Diario 6:00 AM | 90 días |

# Bases de Datos

Panorama de las 3 bases de datos principales del ecosistema AgentsMX.

## Resumen

| Base de Datos | Host | Puerto | Motor | Tamaño | Propósito |
|---------------|------|--------|-------|--------|-----------|
| cobranza_db | localhost | 5432 | PostgreSQL 16 + TimescaleDB | ~60 GB | Cobranza, GPS, diagnósticos |
| scrapper_nacional | localhost | 5433 | PostgreSQL 16 | ~5 GB | Vehículos marketplace |
| Supabase | cloud | 5432 | PostgreSQL 15 (managed) | ~2 GB | Auth, usuarios, configs |

## Diagrama General

```mermaid
graph TB
    subgraph Servidor Local
        subgraph "PostgreSQL :5432 - cobranza_db"
            T1[(Cobranza\nclients, routes, visits)]
            T2[(GPS TimescaleDB\nvehicle_status_history)]
            T3[(Diagnósticos\nvehicle_dossiers, scans)]
        end

        subgraph "PostgreSQL :5433 - scrapper_nacional"
            T4[(Marketplace\nvehicles, price_history)]
        end

        RD[(Redis :6379\nCache)]
    end

    subgraph Nube
        subgraph "Supabase Cloud"
            T5[(Auth & Users\nprofiles, permissions)]
        end

        subgraph "AWS"
            DDB[(DynamoDB\nMTY scrapper)]
            ES[(Elasticsearch\nBúsqueda full-text)]
        end
    end

    S1[Cobranza API :8000] --> T1
    S1 --> RD
    S2[GPS API :5002] --> T2
    S3[AI Agents :5001] --> T3
    S4[Marketplace API :5050] --> T4
    S5[Scrapper MTY] --> DDB
    S5 --> ES
    S6[Frontend Auth] --> T5
```

## Diagrama Entidad-Relación Global

```mermaid
erDiagram
    CLIENTS ||--o{ DETECTED_LOCATIONS : tiene
    CLIENTS ||--o{ DAILY_ROUTES : asignado_en
    CLIENTS ||--o{ ROUTE_STOPS : parada_de
    DAILY_ROUTES ||--o{ ROUTE_STOPS : contiene

    VEHICLE_STATUS_HISTORY }|--|| VEHICLES_GPS : pertenece
    VEHICLE_STATE_LOG }|--|| VEHICLES_GPS : estado_de
    PATTERN_ANALYSIS }|--|| VEHICLES_GPS : patron_de

    VEHICLE_DOSSIERS ||--o{ DIAGNOSTIC_SCANS : tiene
    DIAGNOSTIC_SCANS ||--o{ SENSOR_READINGS : contiene
    DIAGNOSTIC_SCANS ||--o{ DTC_FAULTS : reporta
    DIAGNOSTIC_SCANS ||--o{ SYSTEM_STATUSES : evalua
    VEHICLE_DOSSIERS ||--o{ VALUATION_SNAPSHOTS : valuacion_de

    VEHICLES_MKT ||--o{ KAVAK_PRICE_HISTORY : historial_de
    VEHICLES_MKT ||--o{ VEHICLE_MEDIA : imagenes
    VEHICLES_MKT ||--o{ PURCHASE_INTENTS : compra_de
    USERS_MKT ||--o{ PURCHASE_INTENTS : realiza
    USERS_MKT ||--o{ CREDIT_APPLICATIONS : solicita
    USERS_MKT ||--o{ INSURANCE_POLICIES : contrata
    USERS_MKT ||--o{ KYC_VERIFICATIONS : verifica
    CREDIT_APPLICATIONS ||--o{ LENDER_OFFERS : recibe
    INSURANCE_QUOTES ||--o{ INSURANCE_OFFERS : cotiza
```

## Conexiones por Servicio

```mermaid
graph LR
    subgraph Servicios
        A[Cobranza API\n:8000]
        B[AI Agents\n:5001]
        C[GPS API\n:5002]
        D[Marketplace API\n:5050]
        E[GPS Sync Worker]
        F[Diagnostic Sync]
    end

    subgraph Bases de Datos
        DB1[(cobranza_db\n:5432)]
        DB2[(scrapper_nacional\n:5433)]
        REDIS[(Redis\n:6379)]
    end

    A -->|R/W| DB1
    A -->|R/W| REDIS
    B -->|R/W| DB1
    C -->|R/W| DB1
    D -->|R| DB2
    E -->|W| DB1
    F -->|W| DB1
```

## Migraciones

Todas las bases de datos utilizan **Alembic** para gestión de migraciones.

```bash
# Crear nueva migración
alembic revision --autogenerate -m "add_new_table"

# Aplicar migraciones
alembic upgrade head

# Revertir última migración
alembic downgrade -1

# Ver historial
alembic history
```

## Backups

| Base de Datos | Estrategia | Frecuencia | Retención |
|---------------|-----------|------------|-----------|
| cobranza_db | pg_dump + S3 | Diario 3:00 AM | 30 días |
| scrapper_nacional | pg_dump + S3 | Semanal | 14 días |
| Supabase | Automático (managed) | Diario | 7 días |
| Redis | RDB snapshot | Cada 15 min | 24 horas |

## Siguiente Lectura

- [Marketplace Microservices](/tecnico/base-datos/marketplace-microservices) - ER completo: vehicles, auth, purchase, financing, insurance, KYC, chat, reports
- [GPS Data (TimescaleDB)](/tecnico/base-datos/gps-data) - Hypertables y compresión
- [Cobranza](/tecnico/base-datos/cobranza) - Clientes y rutas
- [Scrapper Nacional](/tecnico/base-datos/scrapper-nacional) - Vehículos marketplace
- [Diagnósticos](/tecnico/base-datos/diagnosticos) - Dossiers y sensores

# Base de Datos - Marketplace Microservices

Esquema de entidades del ecosistema de microservicios del Marketplace AgentsMX. Estos modelos representan el diseño de base de datos objetivo para cada bounded context.

> **Estado actual**: Solo `marketplace.vehicles` tiene tabla SQL (Alembic). El resto son modelos de dominio que serán persistidos conforme se implementen los servicios.

## Diagrama ER Global

```mermaid
erDiagram
    %% ─── Core: Vehicles ───
    VEHICLES ||--o{ VEHICLE_MEDIA : tiene
    VEHICLES ||--o{ PRICE_HISTORY : historial
    VEHICLES ||--o{ PURCHASE_INTENTS : compra_de
    VEHICLES ||--o{ CREDIT_APPLICATIONS : financiamiento_de
    VEHICLES ||--o{ INSURANCE_QUOTES : seguro_de
    VEHICLES ||--o{ KYC_VERIFICATIONS : verificacion_para
    VEHICLES ||--o{ CONVERSATIONS : chat_sobre
    VEHICLES ||--o{ TECHNICAL_REPORTS : reporte_de
    VEHICLES ||--o{ VALUATION_REPORTS : valuacion_de

    %% ─── Users ───
    USERS ||--o{ PURCHASE_INTENTS : realiza
    USERS ||--o{ CREDIT_APPLICATIONS : solicita
    USERS ||--o{ INSURANCE_POLICIES : contrata
    USERS ||--o{ KYC_VERIFICATIONS : verifica
    USERS ||--o{ CONVERSATIONS : participa
    USERS ||--o{ REFRESH_TOKENS : sesion
    USERS ||--o{ AUDIT_EVENTS : genera

    %% ─── Financing ───
    CREDIT_APPLICATIONS ||--o{ LENDER_OFFERS : recibe

    %% ─── Insurance ───
    INSURANCE_QUOTES ||--o{ INSURANCE_OFFERS : cotiza
    INSURANCE_QUOTES ||--o{ INSURANCE_POLICIES : genera

    %% ─── Reports ───
    TECHNICAL_REPORTS ||--o{ DTC_CODES : contiene
    TECHNICAL_REPORTS ||--o{ SYSTEM_HEALTH : evalua

    %% ─── KYC ───
    KYC_VERIFICATIONS ||--o{ KYC_DOCUMENTS : adjunta

    %% ─── Chat ───
    CONVERSATIONS ||--o{ MESSAGES : contiene

    %% ─── Purchase Flow ───
    PURCHASE_INTENTS ||--o| CREDIT_APPLICATIONS : vincula
    PURCHASE_INTENTS ||--o| INSURANCE_POLICIES : vincula
    PURCHASE_INTENTS ||--o| KYC_VERIFICATIONS : requiere
```

---

## 1. Vehicles (svc-vehicles)

Tabla activa en PostgreSQL :5432, schema `marketplace`.

```mermaid
erDiagram
    VEHICLES {
        string id PK "UUID"
        string source "NOT NULL - kavak, seminuevos, etc."
        string brand "NOT NULL, INDEXED"
        string model "NOT NULL"
        int year "NOT NULL, INDEXED"
        decimal price "NOT NULL, INDEXED (14,2)"
        string currency "DEFAULT MXN"
        int mileage_km "NULLABLE"
        string transmission "NULLABLE"
        string fuel_type "NULLABLE"
        string exterior_color "NULLABLE"
        string location "NULLABLE"
        string url "NULLABLE"
        text description "NULLABLE"
        text image_url "NULLABLE"
        string status "DEFAULT active, INDEXED"
        json images "DEFAULT []"
        timestamp created_at "SERVER DEFAULT now()"
        timestamp updated_at "ON UPDATE now()"
        timestamp sold_at "NULLABLE"
    }

    VEHICLE_MEDIA {
        string vehicle_id FK
        string url "NOT NULL"
        string media_type "image, video"
        int position "Orden de despliegue"
        string caption "NULLABLE"
    }

    PRICE_HISTORY {
        string vehicle_id FK
        decimal old_price "NOT NULL"
        decimal new_price "NOT NULL"
        string currency "MXN o USD"
        timestamp changed_at "NOT NULL"
        string reason "price_change, promotion, etc."
    }

    VEHICLES ||--o{ VEHICLE_MEDIA : tiene
    VEHICLES ||--o{ PRICE_HISTORY : historial
```

### Indices

| Indice | Columnas | Tipo |
|--------|----------|------|
| `ix_vehicles_brand` | brand | B-tree |
| `ix_vehicles_year` | year | B-tree |
| `ix_vehicles_price` | price | B-tree |
| `ix_vehicles_status` | status | B-tree |
| `ix_vehicles_brand_model` | brand, model | Compuesto |
| `ix_vehicles_source` | source | B-tree |
| `uq_vehicles_source_id` | source, id | UNIQUE |

---

## 2. Auth & Users (svc-auth, svc-users)

```mermaid
erDiagram
    USERS {
        uuid id PK
        string email UK "NOT NULL"
        string password_hash "NOT NULL"
        string first_name "NOT NULL"
        string last_name "NOT NULL"
        string phone "NULLABLE"
        string avatar_url "NULLABLE"
        enum role "BUYER | SELLER | ADMIN"
        enum auth_provider "EMAIL | GOOGLE | FACEBOOK | APPLE"
        enum kyc_status "PENDING | IN_REVIEW | APPROVED | REJECTED"
        boolean is_active "DEFAULT true"
        boolean is_verified "DEFAULT false"
        int login_attempts "DEFAULT 0"
        timestamp locked_until "NULLABLE"
        json preferences "DEFAULT {}"
        json favorites "vehicle IDs"
        timestamp created_at
        timestamp updated_at
    }

    REFRESH_TOKENS {
        string jti PK "JWT ID"
        uuid user_id FK
        string token_hash "NOT NULL"
        timestamp expires_at "NOT NULL"
        boolean is_revoked "DEFAULT false"
        timestamp created_at
        timestamp revoked_at "NULLABLE"
    }

    AUDIT_EVENTS {
        uuid id PK
        enum event_type "LOGIN_SUCCESS | LOGIN_FAILED | REGISTER | etc."
        uuid user_id FK "NULLABLE"
        string email "NOT NULL"
        string ip_address "NOT NULL"
        string user_agent "NULLABLE"
        json metadata "DEFAULT {}"
        timestamp created_at
    }

    USERS ||--o{ REFRESH_TOKENS : sesion
    USERS ||--o{ AUDIT_EVENTS : genera
```

### Enums

| Enum | Valores |
|------|---------|
| `UserRole` | BUYER, SELLER, ADMIN |
| `KYCStatus` | PENDING, IN_REVIEW, APPROVED, REJECTED |
| `AuthProvider` | EMAIL, GOOGLE, FACEBOOK, APPLE |
| `AuditEventType` | LOGIN_SUCCESS, LOGIN_FAILED, REGISTER, PASSWORD_RESET, LOGOUT, TOKEN_REFRESH, ACCOUNT_LOCKED, PASSWORD_CHANGE |

---

## 3. Purchase Flow (svc-purchase)

```mermaid
erDiagram
    PURCHASE_INTENTS {
        uuid id PK
        uuid user_id FK
        string vehicle_id FK
        enum status "DRAFT -> RESERVED -> KYC -> FINANCING -> PAYMENT -> COMPLETED"
        decimal price "NOT NULL"
        uuid financing_id FK "NULLABLE"
        uuid insurance_id FK "NULLABLE"
        string kyc_reference "NULLABLE"
        text notes "NULLABLE"
        timestamp created_at
        timestamp updated_at
        timestamp expires_at
    }

    USERS ||--o{ PURCHASE_INTENTS : realiza
    VEHICLES ||--o{ PURCHASE_INTENTS : compra_de
```

### Flujo de estados

```mermaid
stateDiagram-v2
    [*] --> DRAFT
    DRAFT --> RESERVED : Usuario reserva
    RESERVED --> KYC_PENDING : Inicia verificacion
    KYC_PENDING --> KYC_APPROVED : KYC aprobado
    KYC_APPROVED --> FINANCING : Solicita credito
    FINANCING --> INSURANCE : Contrata seguro
    INSURANCE --> PAYMENT : Pago pendiente
    PAYMENT --> COMPLETED : Pago confirmado
    RESERVED --> CANCELLED : Usuario cancela
    KYC_PENDING --> CANCELLED : KYC rechazado
    FINANCING --> CANCELLED : Sin ofertas
    DRAFT --> EXPIRED : Timeout
    RESERVED --> EXPIRED : Timeout
```

---

## 4. Financing (svc-financing)

```mermaid
erDiagram
    CREDIT_APPLICATIONS {
        uuid id PK
        uuid user_id FK
        string vehicle_id FK
        decimal vehicle_price "NOT NULL"
        decimal down_payment "NOT NULL"
        float down_payment_percent "Calculado"
        decimal financed_amount "Calculado"
        int term_months "12 | 24 | 36 | 48 | 60"
        decimal income "Ingreso mensual"
        string employment_type "salaried | self_employed | etc."
        enum status "DRAFT -> SUBMITTED -> EVALUATING -> OFFERS_READY"
        boolean bureau_consent "DEFAULT false"
        timestamp created_at
        timestamp updated_at
    }

    LENDER_OFFERS {
        uuid id PK
        uuid application_id FK
        string lender_code "NOT NULL"
        string lender_name "NOT NULL"
        boolean approved "NOT NULL"
        float annual_rate "NULLABLE"
        decimal monthly_payment "NULLABLE"
        decimal total_cost "NULLABLE"
        int term_months "NULLABLE"
        float cat "Costo Anual Total"
        json conditions "Condiciones especiales"
        enum status "PENDING | APPROVED | REJECTED | ACCEPTED"
        timestamp valid_until "NULLABLE"
        timestamp created_at
    }

    CREDIT_APPLICATIONS ||--o{ LENDER_OFFERS : recibe
```

---

## 5. Insurance (svc-insurance)

```mermaid
erDiagram
    INSURANCE_QUOTES {
        uuid id PK
        string vehicle_brand "NOT NULL"
        string vehicle_model "NOT NULL"
        int vehicle_year "NOT NULL"
        decimal vehicle_value "NOT NULL"
        int driver_age "NOT NULL"
        string driver_gender "NULLABLE"
        string driver_postal_code "NULLABLE"
        enum coverage_type "BASIC | STANDARD | FULL | PREMIUM"
        enum status "QUOTING | QUOTED | ERROR"
        timestamp created_at
    }

    INSURANCE_OFFERS {
        uuid id PK
        uuid quote_id FK
        string provider_code "NOT NULL"
        string provider_name "NOT NULL"
        enum status "QUOTING | QUOTED | ERROR | TIMEOUT"
        decimal annual_premium "NOT NULL"
        decimal monthly_premium "Calculado"
        float deductible_pct "NOT NULL"
        json coverages "Lista de coberturas"
        timestamp valid_until "NULLABLE"
    }

    INSURANCE_POLICIES {
        uuid id PK
        uuid user_id FK
        uuid quote_id FK
        uuid offer_id FK
        string insurer_code "NOT NULL"
        string insurer_name "NOT NULL"
        enum coverage_type "BASIC | STANDARD | FULL | PREMIUM"
        decimal annual_premium "NOT NULL"
        decimal monthly_premium "NOT NULL"
        float deductible_pct "NOT NULL"
        json coverages "Coberturas contratadas"
        string payment_method "NULLABLE"
        enum status "ACTIVE | SUSPENDED | CANCELLED | EXPIRED"
        string policy_number "NULLABLE"
        date start_date "NOT NULL"
        date end_date "NOT NULL"
        timestamp created_at
    }

    INSURANCE_QUOTES ||--o{ INSURANCE_OFFERS : cotiza
    INSURANCE_QUOTES ||--o{ INSURANCE_POLICIES : genera
```

---

## 6. KYC (svc-kyc)

```mermaid
erDiagram
    KYC_VERIFICATIONS {
        uuid id PK
        uuid user_id FK
        enum status "PENDING | IN_REVIEW | APPROVED | REJECTED | MANUAL_REVIEW"
        enum provider_used "MOCK | PRIMARY | SECONDARY | MANUAL"
        json provider_response "Respuesta del proveedor"
        string rejection_reason "NULLABLE"
        int retry_count "DEFAULT 0"
        timestamp created_at
        timestamp updated_at
    }

    KYC_DOCUMENTS {
        uuid id PK
        uuid verification_id FK
        enum type "INE | PASSPORT | DRIVERS_LICENSE | SELFIE | PROOF_ADDRESS"
        string url "S3 URL"
        string filename "NOT NULL"
        string content_type "image/jpeg, application/pdf"
        timestamp uploaded_at
    }

    KYC_VERIFICATIONS ||--o{ KYC_DOCUMENTS : adjunta
```

---

## 7. Chat (svc-chat)

```mermaid
erDiagram
    CONVERSATIONS {
        uuid id PK
        string vehicle_id FK "NULLABLE"
        timestamp created_at
        timestamp last_message_at
        string last_message_preview "Truncado 100 chars"
    }

    CONVERSATION_PARTICIPANTS {
        uuid conversation_id FK
        uuid user_id FK
        enum role "buyer | seller | agent"
        timestamp joined_at
    }

    MESSAGES {
        uuid id PK
        uuid conversation_id FK
        uuid sender_id FK
        text content "NOT NULL"
        timestamp created_at
        json read_by "Array de user_ids"
    }

    CONVERSATIONS ||--o{ CONVERSATION_PARTICIPANTS : participantes
    CONVERSATIONS ||--o{ MESSAGES : contiene
```

---

## 8. Reports (svc-reports)

```mermaid
erDiagram
    TECHNICAL_REPORTS {
        uuid id PK
        string vin "NOT NULL"
        timestamp scan_date
        enum status "PENDING | PROCESSING | COMPLETED | FAILED"
        int health_score "0-100"
        int mileage_km "NULLABLE"
        float engine_hours "NULLABLE"
        string scan_tool "NULLABLE"
        text technician_notes "NULLABLE"
        timestamp created_at
        timestamp completed_at
    }

    DTC_CODES {
        uuid report_id FK
        string code "P0301, C0035, etc."
        string description "NOT NULL"
        enum severity "low | medium | high | critical"
        string system "engine | transmission | abs | etc."
    }

    SYSTEM_HEALTH {
        uuid report_id FK
        string name "Motor, Frenos, Suspension, etc."
        enum status "OK | WARNING | CRITICAL | UNKNOWN"
        string value "NULLABLE"
        string unit "NULLABLE"
        text notes "NULLABLE"
    }

    VALUATION_REPORTS {
        uuid id PK
        string vin "NOT NULL"
        enum status "PENDING | PROCESSING | COMPLETED | FAILED"
        decimal estimated_value "NOT NULL"
        decimal value_min "NOT NULL"
        decimal value_max "NOT NULL"
        string currency "DEFAULT MXN"
        float confidence_score "0.0-1.0"
        json market_comparables "Vehiculos comparables"
        float depreciation_rate "Tasa anual"
        string market_trend "up | stable | down"
        text ai_summary "Resumen generado por IA"
        timestamp created_at
        timestamp completed_at
    }

    TECHNICAL_REPORTS ||--o{ DTC_CODES : contiene
    TECHNICAL_REPORTS ||--o{ SYSTEM_HEALTH : evalua
```

---

## 9. Market Analytics (svc-market-analytics)

```mermaid
erDiagram
    PRICE_TRENDS {
        string brand "NOT NULL"
        string model "NOT NULL"
        int period_days "7 | 30 | 90"
        decimal avg_price
        float trend_pct "Cambio porcentual"
    }

    PRICE_TREND_POINTS {
        string brand FK
        string model FK
        date date "NOT NULL"
        decimal avg_price
        decimal min_price
        decimal max_price
        int count "Vehiculos en el periodo"
    }

    MARKET_INDEX {
        string segment "SUV | Sedan | Pickup | etc."
        decimal avg_price
        decimal median_price
        int supply_count
        float demand_velocity
        float days_on_market_avg
        float price_index "Indice normalizado"
    }

    OPPORTUNITIES {
        string vehicle_id FK
        string brand
        string model
        int year
        decimal price
        decimal segment_avg
        float discount_pct "% debajo del promedio"
        string source
        string url
    }

    PRICE_TRENDS ||--o{ PRICE_TREND_POINTS : datapoints
```

---

## 10. Admin (svc-admin)

```mermaid
erDiagram
    ADMIN_USERS {
        uuid id PK
        string email UK
        string name "NOT NULL"
        enum role "BUYER | DEALER | ADMIN | SUPER_ADMIN"
    }

    PARTNERS {
        uuid id PK
        string name "NOT NULL"
        enum type "FINANCIERA | INSURER"
        enum status "ACTIVE | INACTIVE | SUSPENDED"
    }

    AUDIT_LOG {
        uuid id PK
        uuid user_id FK
        string action "NOT NULL"
        string entity_type "NOT NULL"
        string entity_id "NULLABLE"
        json old_values "Antes del cambio"
        json new_values "Despues del cambio"
        string ip_address
        timestamp created_at
    }

    INVENTORY_VEHICLES {
        string vehicle_id FK
        enum status "available | reserved | sold"
        int days_on_market
        int views
        int leads
    }

    ADMIN_USERS ||--o{ AUDIT_LOG : genera
```

---

## Diagrama de Flujo Completo del Usuario

```mermaid
flowchart TB
    subgraph "1. Descubrimiento"
        A[Buscar vehiculo] --> B[Catalogo / Search]
        B --> C[Ver detalle]
    end

    subgraph "2. Interes"
        C --> D[Chat con vendedor]
        C --> E[Solicitar reporte tecnico]
        C --> F[Ver valuacion de mercado]
    end

    subgraph "3. Compra"
        C --> G[Iniciar compra]
        G --> H{KYC Verificacion}
        H -->|Aprobado| I[Solicitar financiamiento]
        H -->|Rechazado| X1[Cancelado]
        I --> J[Recibir ofertas de credito]
        J --> K[Seleccionar oferta]
        K --> L[Cotizar seguro]
        L --> M[Seleccionar poliza]
    end

    subgraph "4. Cierre"
        M --> N[Pago]
        N --> O[Completado]
    end

    subgraph Servicios
        B -.-> SV[svc-vehicles]
        D -.-> SC[svc-chat]
        E -.-> SR[svc-reports]
        F -.-> SMA[svc-market-analytics]
        G -.-> SP[svc-purchase]
        H -.-> SK[svc-kyc]
        I -.-> SF[svc-financing]
        L -.-> SI[svc-insurance]
    end
```

---

## Relacion con BD Existente (scrapper_nacional)

```mermaid
graph LR
    subgraph "scrapper_nacional :5433"
        SN[(vehicles\n11,000+ raw)]
    end

    subgraph "svc-sync-worker"
        SW[Sync Worker\nSQS Consumer]
    end

    subgraph "marketplace :5432"
        MK[(marketplace.vehicles\nNormalizado)]
    end

    subgraph "AWS"
        ES[(Elasticsearch\nFull-text search)]
        RD[(Redis\nCache TTL=300s)]
    end

    SN -->|Scrape events| SW
    SW -->|Normaliza + Upsert| MK
    SW -->|Indexa| ES
    MK -->|Cache| RD
```

## Siguiente Lectura

- [Scrapper Nacional](/tecnico/base-datos/scrapper-nacional) - BD fuente de vehículos
- [Cobranza](/tecnico/base-datos/cobranza) - Clientes y rutas
- [GPS Data](/tecnico/base-datos/gps-data) - TimescaleDB
- [Diagnósticos](/tecnico/base-datos/diagnosticos) - Dossiers y sensores

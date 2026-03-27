# Marketplace Dashboard API

`proj-back-marketplace-dashboard` - API de analytics del marketplace automotriz con chat IA integrado.

## Información General

| Propiedad | Valor |
|-----------|-------|
| Repositorio | `proj-back-marketplace-dashboard` |
| Framework | Flask |
| Puerto | 5050 |
| Base de datos | scrapper_nacional (PostgreSQL :5433) |
| LLM | Claude 3.5 Sonnet |
| Dominio | dashboard.agentsmx.com/api |

## Arquitectura

```mermaid
graph TB
    subgraph Dashboard Angular :4200
        CHARTS[Charts Component]
        TABLE[Data Table]
        CHAT[Chat IA Component]
    end

    subgraph Marketplace API :5050
        R1[Analytics Routes]
        R2[Vehicles Routes]
        R3[Chat Routes]
        R4[Sources Routes]

        AS[Analytics Service]
        VS[Vehicle Service]
        CS[Chat Service\nClaude]
        SS[Source Service]
    end

    subgraph scrapper_nacional :5433
        VH[(vehicles\n11,000+ registros)]
        KP[(kavak_price_history)]
        SR[(sources)]
    end

    CHARTS --> R1
    TABLE --> R2
    CHAT --> R3

    R1 --> AS --> VH
    R2 --> VS --> VH
    R3 --> CS
    R4 --> SS --> SR
    AS --> KP
```

## Endpoints

### Analytics

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/v1/analytics/prices` | Distribución de precios por marca/modelo |
| GET | `/api/v1/analytics/trends` | Tendencias de precios temporales |
| GET | `/api/v1/analytics/sources` | Comparativa por fuente (Kavak, Albacar, etc.) |
| GET | `/api/v1/analytics/market-share` | Participación de mercado por marca |
| GET | `/api/v1/analytics/depreciation` | Curvas de depreciación |
| GET | `/api/v1/analytics/geo` | Distribución geográfica |

### Vehículos

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/v1/vehicles` | Lista con filtros (marca, modelo, año, precio) |
| GET | `/api/v1/vehicles/{id}` | Detalle completo |
| GET | `/api/v1/vehicles/{id}/price-history` | Historial de precio |
| GET | `/api/v1/vehicles/compare` | Comparar vehículos similares |
| GET | `/api/v1/vehicles/search` | Búsqueda full-text |

### Chat IA

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/v1/chat/message` | Enviar mensaje al chat |
| GET | `/api/v1/chat/history` | Historial de conversación |
| POST | `/api/v1/chat/analyze` | Análisis IA de un vehículo |

### Fuentes

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/v1/sources` | Lista de fuentes activas |
| GET | `/api/v1/sources/{name}/stats` | Estadísticas por fuente |
| GET | `/api/v1/sources/health` | Estado de salud de scrapers |

## Chat con Claude

El servicio integra Claude 3.5 Sonnet para responder preguntas sobre el mercado automotriz.

```mermaid
sequenceDiagram
    participant U as Usuario
    participant FE as Dashboard
    participant API as Marketplace API
    participant DB as PostgreSQL
    participant LLM as Claude 3.5

    U->>FE: "Cuál es el precio promedio de un Jetta 2020?"
    FE->>API: POST /chat/message
    API->>DB: Query datos relevantes
    DB-->>API: Estadísticas Jetta 2020
    API->>API: Construir contexto con datos reales
    API->>LLM: Prompt con datos + pregunta
    LLM-->>API: Respuesta natural con datos
    API-->>FE: {message, charts, sources}
    FE-->>U: Respuesta + visualizaciones
```

## Consultas de Analytics

```mermaid
graph LR
    subgraph Queries Principales
        Q1[Precio promedio\npor marca/modelo/año]
        Q2[Tendencia de precio\nserie temporal]
        Q3[Comparativa\nentre fuentes]
        Q4[Distribución\ngeográfica]
    end

    subgraph Agregaciones
        A1["AVG(price)\nGROUP BY make, model"]
        A2["AVG(price)\ntime_bucket por mes"]
        A3["AVG(price)\nGROUP BY source"]
        A4["COUNT(*)\nGROUP BY state"]
    end

    Q1 --> A1
    Q2 --> A2
    Q3 --> A3
    Q4 --> A4
```

## Filtros Disponibles

| Filtro | Tipo | Ejemplo |
|--------|------|---------|
| `make` | string | "volkswagen" |
| `model` | string | "jetta" |
| `year_min` / `year_max` | int | 2018 / 2024 |
| `price_min` / `price_max` | float | 150000 / 500000 |
| `source` | string | "kavak" |
| `state` | string | "nuevo_leon" |
| `mileage_max` | int | 80000 |
| `transmission` | string | "automatic" |

## Fuentes de Datos

| Fuente | Tipo Scraper | Vehículos | Actualización |
|--------|-------------|-----------|---------------|
| Kavak | API JSON | ~3,500 | Diario |
| Albacar | XML Feed | ~1,200 | Diario |
| CarOne | HTML Scraping | ~800 | Diario |
| Seminuevos.com | HTML | ~2,000 | Diario |
| Autocosmos | HTML | ~1,500 | Semanal |
| Otras (13 fuentes) | Mixto | ~2,000 | Variable |

## Variables de Entorno

```bash
FLASK_PORT=5050
DATABASE_URL=postgresql://user:pass@localhost:5433/scrapper_nacional
ANTHROPIC_API_KEY=sk-ant-...
CLAUDE_MODEL=claude-3-5-sonnet-20241022
CORS_ORIGINS=https://dashboard.agentsmx.com
CACHE_TTL=3600
LOG_LEVEL=INFO
```

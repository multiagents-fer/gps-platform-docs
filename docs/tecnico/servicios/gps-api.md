# GPS Data API

`proj-api-gps-data` - API de datos GPS con TimescaleDB para series temporales y análisis de patrones.

## Información General

| Propiedad | Valor |
|-----------|-------|
| Repositorio | `proj-api-gps-data` |
| Framework | Flask |
| Puerto | 5002 |
| Base de datos | TimescaleDB (extensión PostgreSQL :5432) |
| Dominio | time.agentsmx.com |
| Endpoints | 25+ |

## Arquitectura

```mermaid
graph TB
    subgraph Clientes
        FE[Cobranza PWA]
        COB[Cobranza API :8000]
        GRAFANA[Grafana]
    end

    subgraph GPS Data API :5002
        ROUTES[Flask Routes]
        SVC[Query Service]
        CACHE[Response Cache]
        TSVC[TimeSeries Service]
        PSVC[Pattern Service]
    end

    subgraph TimescaleDB
        HT[(vehicle_status_history\nhypertable)]
        SL[(vehicle_state_log)]
        PT[(pattern_* tables)]
        FN[SQL Functions\nhaversine_meters]
    end

    FE --> ROUTES
    COB --> ROUTES
    GRAFANA --> ROUTES

    ROUTES --> SVC
    SVC --> CACHE
    SVC --> TSVC --> HT
    SVC --> PSVC --> PT
    TSVC --> FN
    SVC --> SL
```

## Endpoints

### Tiempo Real

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/v1/vehicles/realtime` | Última posición de todos los vehículos |
| GET | `/api/v1/vehicles/{id}/current` | Posición actual de un vehículo |
| GET | `/api/v1/vehicles/active` | Vehículos con motor encendido |
| GET | `/api/v1/vehicles/idle` | Vehículos detenidos con motor encendido |

### Histórico

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/v1/vehicles/{id}/history` | Historial de posiciones |
| GET | `/api/v1/vehicles/{id}/track` | Track GeoJSON en rango temporal |
| GET | `/api/v1/vehicles/{id}/stops` | Paradas detectadas |
| GET | `/api/v1/vehicles/{id}/trips` | Viajes con inicio/fin |

### Análisis

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/v1/vehicles/{id}/patterns` | Patrones de uso detectados |
| GET | `/api/v1/vehicles/{id}/stats` | Estadísticas (km, horas, velocidad) |
| GET | `/api/v1/vehicles/{id}/geofence` | Zonas frecuentes |
| GET | `/api/v1/analytics/fleet` | Resumen de toda la flota |
| GET | `/api/v1/analytics/heatmap` | Mapa de calor de actividad |

### Alertas

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/v1/alerts/speed` | Alertas de exceso de velocidad |
| GET | `/api/v1/alerts/geofence` | Alertas de geofence |
| GET | `/api/v1/alerts/offline` | Vehículos sin señal |
| GET | `/api/v1/alerts/battery` | Alertas de batería baja |

### Administración

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/v1/devices` | Lista de dispositivos GPS |
| POST | `/api/v1/devices/register` | Registrar nuevo dispositivo |
| GET | `/api/v1/compression/stats` | Estadísticas de compresión |
| POST | `/api/v1/maintenance/cleanup` | Limpieza de datos antiguos |
| GET | `/health` | Health check |

## Consultas TimescaleDB

### Historial con Compresión Temporal

```sql
-- Posiciones en rango temporal con downsampling
SELECT time_bucket('5 minutes', timestamp) AS bucket,
       avg(latitude) as lat,
       avg(longitude) as lng,
       max(speed) as max_speed,
       last(ignition, timestamp) as ignition
FROM vehicle_status_history
WHERE vehicle_id = $1
  AND timestamp BETWEEN $2 AND $3
GROUP BY bucket
ORDER BY bucket;
```

### Función Haversine

```sql
-- Distancia entre dos coordenadas en metros
CREATE OR REPLACE FUNCTION haversine_meters(
    lat1 float, lon1 float,
    lat2 float, lon2 float
) RETURNS float AS $$
    SELECT 6371000 * 2 * asin(sqrt(
        sin(radians(lat2 - lat1) / 2)^2 +
        cos(radians(lat1)) * cos(radians(lat2)) *
        sin(radians(lon2 - lon1) / 2)^2
    ))
$$ LANGUAGE sql IMMUTABLE;
```

## Patrones de Consulta

```mermaid
graph LR
    subgraph CQRS
        direction TB
        W[Escritura\nGPS Sync Worker] --> HT[(Hypertable\nraw data)]
        HT --> MV[Materialized Views]
        MV --> R[Lectura\nAPI Queries]
    end

    subgraph Cache Strategy
        direction TB
        Q[Query] --> CC{Cache\nhit?}
        CC -->|Sí| RES[Response]
        CC -->|No| DB[(TimescaleDB)]
        DB --> RES
        DB --> SET[Set Cache\nTTL: 60s]
    end
```

## Volúmenes de Datos

| Métrica | Valor |
|---------|-------|
| Vehículos activos | ~4,000 |
| Registros/día (sin compresión) | ~35,000,000 |
| Registros/día (con compresión diferencial) | ~2,000,000 |
| Ratio de compresión | ~17:1 |
| Retención | 1 año |
| Tamaño estimado anual | ~50 GB |

## Variables de Entorno

```bash
FLASK_PORT=5002
DATABASE_URL=postgresql://user:pass@localhost:5432/cobranza_db
TIMESCALE_CHUNK_INTERVAL=7 days
CACHE_TTL=60
MAX_QUERY_RANGE_DAYS=90
COMPRESSION_POLICY_DAYS=30
LOG_LEVEL=INFO
```

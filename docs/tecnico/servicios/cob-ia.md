# Cobranza IA API

`proj-back-cob-ia` - Servicio principal de cobranza inteligente con pipeline de Machine Learning.

## Información General

| Propiedad | Valor |
|-----------|-------|
| Repositorio | `proj-back-cob-ia` |
| Framework | FastAPI |
| Puerto | 8000 |
| Base de datos | cobranza_db (PostgreSQL :5432) |
| Cache | Redis :6379 |
| Dominio | api.agentsmx.com |

## Arquitectura del Servicio

```mermaid
graph TB
    subgraph API Layer
        R1[/api/v1/clients]
        R2[/api/v1/routes]
        R3[/api/v1/predictions]
        R4[/api/v1/visits]
        R5[/api/v1/ml/pipeline]
    end

    subgraph Application Layer
        UC1[ClientManagement]
        UC2[RouteOptimization]
        UC3[PredictionEngine]
        UC4[VisitTracking]
        UC5[MLPipeline]
    end

    subgraph Domain Layer
        E1[Client Entity]
        E2[Route Entity]
        E3[PriorityScore VO]
        E4[Location VO]
    end

    subgraph Infrastructure
        PG[(PostgreSQL)]
        RD[(Redis)]
        AI[AI Agents :5001]
    end

    R1 --> UC1 --> E1 --> PG
    R2 --> UC2 --> E2 --> PG
    R3 --> UC3 --> E3 --> RD
    R4 --> UC4 --> PG
    R5 --> UC5 --> AI
```

## ML Pipeline

El pipeline de Machine Learning procesa datos de clientes morosos para generar scores de prioridad.

```mermaid
flowchart LR
    A[Datos Crudos\n794 clientes] --> B[Feature\nEngineering]
    B --> C[Entrenamiento\nRandom Forest]
    C --> D[Scoring\nPriorización]
    D --> E[Optimización\nde Rutas]
    E --> F[Rutas Diarias\npara Cobradores]

    B -->|Features| B1[días_mora]
    B -->|Features| B2[monto_deuda]
    B -->|Features| B3[zona_geográfica]
    B -->|Features| B4[historial_pagos]
    B -->|Features| B5[contactabilidad]
```

## Endpoints Principales

### Clientes

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/v1/clients` | Lista clientes con filtros |
| GET | `/api/v1/clients/{id}` | Detalle de cliente |
| GET | `/api/v1/clients/{id}/history` | Historial de pagos |
| POST | `/api/v1/clients/import` | Importar cartera CSV |
| GET | `/api/v1/clients/stats` | Estadísticas generales |

### Rutas

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/v1/routes/today` | Ruta del día actual |
| GET | `/api/v1/routes/{date}` | Ruta por fecha |
| POST | `/api/v1/routes/generate` | Generar ruta optimizada |
| PUT | `/api/v1/routes/{id}/stops/{stop_id}` | Actualizar parada |

### Predicciones

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/v1/predictions/scores` | Scores de prioridad |
| POST | `/api/v1/predictions/run` | Ejecutar pipeline ML |
| GET | `/api/v1/predictions/features` | Feature importance |

### ML Pipeline

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/v1/ml/pipeline/run` | Ejecutar pipeline completo |
| GET | `/api/v1/ml/pipeline/status` | Estado del pipeline |
| GET | `/api/v1/ml/models/current` | Modelo activo |

## Configuración de Redis

```mermaid
graph LR
    subgraph Redis Cache
        K1[predictions:{client_id}]
        K2[routes:{date}]
        K3[stats:dashboard]
        K4[ml:model:current]
    end

    subgraph TTL
        T1["24 horas"]
        T2["12 horas"]
        T3["1 hora"]
        T4["Sin expiración"]
    end

    K1 --- T1
    K2 --- T2
    K3 --- T3
    K4 --- T4
```

## Variables de Entorno

```bash
# Base de datos
DATABASE_URL=postgresql://user:pass@localhost:5432/cobranza_db

# Redis
REDIS_URL=redis://localhost:6379/0

# AI Agents
AI_AGENTS_URL=http://localhost:5001

# ML
ML_MODEL_PATH=./models/
ML_RETRAIN_SCHEDULE=0 2 * * *  # 2:00 AM diario

# API
API_HOST=0.0.0.0
API_PORT=8000
API_WORKERS=4
CORS_ORIGINS=https://cobranza.agentsmx.com
```

## Docker

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

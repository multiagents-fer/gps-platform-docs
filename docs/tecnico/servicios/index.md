# Servicios Backend

Resumen de los 5 servicios backend que forman el núcleo del ecosistema AgentsMX.

## Tabla de Servicios

| Servicio | Puerto | Framework | Endpoints | Base de Datos | Características Clave |
|----------|--------|-----------|-----------|---------------|----------------------|
| [Cobranza IA](/tecnico/servicios/cob-ia) | 8000 | FastAPI | ~30 | cobranza_db + Redis | ML Pipeline, predicciones, rutas |
| [AI Agents](/tecnico/servicios/ai-agents) | 5001 | Flask | ~15 | cobranza_db | 7 agentes IA, hexagonal |
| [Driver Adapters](/tecnico/servicios/driver-adapters) | 5000 | Flask | ~10 | - | Multi-GPS, SeeWorld/WhatsGPS |
| [GPS Data API](/tecnico/servicios/gps-api) | 5002 | Flask | 25+ | TimescaleDB | Series temporales, patrones |
| [Marketplace API](/tecnico/servicios/marketplace-api) | 5050 | Flask | ~20 | scrapper_nacional | Analytics, chat con Claude |

## Diagrama de Interacción

```mermaid
graph TB
    subgraph Frontends
        FE1[Cobranza PWA :3002]
        FE2[Dashboard :4200]
    end

    subgraph Servicios
        S1[Cobranza IA\nFastAPI :8000]
        S2[AI Agents\nFlask :5001]
        S3[Driver Adapters\nFlask :5000]
        S4[GPS Data API\nFlask :5002]
        S5[Marketplace API\nFlask :5050]
    end

    subgraph Datos
        DB1[(cobranza_db)]
        DB2[(scrapper_nacional)]
        TS[(TimescaleDB)]
        RD[(Redis)]
    end

    FE1 --> S1
    FE1 --> S4
    FE2 --> S5
    S1 --> S2
    S1 --> DB1
    S1 --> RD
    S2 --> DB1
    S3 --> TS
    S4 --> TS
    S5 --> DB2
```

## Configuración de Red

```mermaid
graph LR
    subgraph Red Interna
        S1[":8000 FastAPI"]
        S2[":5001 Flask"]
        S3[":5000 Flask"]
        S4[":5002 Flask"]
        S5[":5050 Flask"]
    end

    subgraph Base de Datos
        P1[":5432 PostgreSQL"]
        P2[":5433 PostgreSQL"]
        R1[":6379 Redis"]
    end

    ALB[ALB / Nginx] --> S1
    ALB --> S4
    ALB --> S5

    S1 --> P1
    S1 --> R1
    S2 --> P1
    S4 --> P1
    S5 --> P2
```

## Patrones Comunes

Todos los servicios comparten estas prácticas:

- **Health Check**: Endpoint `GET /health` en cada servicio
- **CORS**: Configurado para dominios `*.agentsmx.com`
- **Error Handling**: Manejo centralizado de excepciones con códigos HTTP estándar
- **Logging**: Formato estructurado JSON con nivel configurable
- **Environment**: Variables de entorno para configuración (no hardcoded)

## Stack Tecnológico Común

| Componente | Tecnología | Versión |
|------------|-----------|---------|
| Runtime | Python | 3.11+ |
| ORM | SQLAlchemy | 2.0 |
| Migrations | Alembic | 1.12 |
| Serialización | Pydantic (FastAPI) / Marshmallow (Flask) | v2 / v3 |
| Testing | pytest | 7.4 |
| Linting | ruff | 0.1+ |
| Type Checking | mypy | 1.7 |
| Containerización | Docker | Multi-stage builds |

## Dependencias entre Servicios

```mermaid
graph TD
    A[Cobranza IA :8000] -->|HTTP interno| B[AI Agents :5001]
    C[GPS Sync Worker] -->|HTTP interno| D[Driver Adapters :5000]
    C -->|Escritura directa| E[GPS Data API :5002]
    F[Marketplace Sync] -->|SQS| G[Marketplace API :5050]

    style A fill:#e1f5fe
    style B fill:#f3e5f5
    style D fill:#e8f5e9
    style E fill:#e8f5e9
    style G fill:#fff3e0
```

## Estado de Salud

Cada servicio expone un endpoint de salud que verifica:

1. **Conexión a base de datos**: Ping a PostgreSQL/TimescaleDB
2. **Conexión a cache**: Ping a Redis (donde aplica)
3. **Servicios externos**: Status de APIs de terceros
4. **Uso de memoria**: Métricas del proceso

```python
# Ejemplo de health check estándar
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "cob-ia",
        "version": "1.2.0",
        "db": check_db_connection(),
        "redis": check_redis_connection(),
        "uptime": get_uptime()
    }
```

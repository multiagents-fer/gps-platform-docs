# Setup de Desarrollo Local

Guía paso a paso para configurar el entorno de desarrollo local del ecosistema AgentsMX.

## Prerrequisitos

| Herramienta | Versión | Instalación |
|------------|---------|-------------|
| Python | 3.11+ | `brew install python@3.11` |
| Node.js | 20+ | `brew install node` |
| Docker | 24+ | Docker Desktop |
| PostgreSQL | 16 | Via Docker |
| Redis | 7 | Via Docker |
| Git | 2.40+ | `brew install git` |
| Playwright | 1.40+ | `pip install playwright && playwright install` |

## Diagrama del Entorno Local

```mermaid
graph TB
    subgraph Docker Compose
        PG1[(PostgreSQL :5432\ncobranza_db)]
        PG2[(PostgreSQL :5433\nscrapper_nacional)]
        REDIS[(Redis :6379)]
        GRAFANA[Grafana :3000]
    end

    subgraph Procesos Locales
        B1[Cobranza API :8000\nuvicorn]
        B2[AI Agents :5001\nflask run]
        B3[Driver Adapters :5000\nflask run]
        B4[GPS API :5002\nflask run]
        B5[Marketplace API :5050\nflask run]
        F1[Cobranza PWA :3002\nnpm run dev]
        F2[Dashboard :4200\nng serve]
    end

    B1 --> PG1
    B1 --> REDIS
    B2 --> PG1
    B3 --> PG1
    B4 --> PG1
    B5 --> PG2
    F1 --> B1
    F1 --> B4
    F2 --> B5
```

## Paso 1: Clonar Repositorios

```bash
# Crear directorio de trabajo
mkdir -p ~/sandboxes && cd ~/sandboxes

# Clonar todos los repos
REPOS=(
    "proj-back-cob-ia"
    "proj-back-ai-agents"
    "proj-back-driver-adapters"
    "proj-api-gps-data"
    "proj-back-marketplace-dashboard"
    "proj-front-cobranza"
    "proj-front-marketplace-dashboard"
    "proj-worker-gps-sync"
    "proj-worker-marketplace-sync"
    "proj-worker-diagnostic-sync"
    "proj-scrapper-nacional"
    "proj-scrapper-mty"
    "proj-infra-terraform"
    "proj-infra-grafana"
    "gps-platform-docs"
)

for repo in "${REPOS[@]}"; do
    git clone git@github.com:agentsmx/$repo.git
done
```

## Paso 2: Docker Compose

```yaml
# docker-compose.yml (en directorio raíz)
version: '3.8'

services:
  postgres-cobranza:
    image: timescale/timescaledb:latest-pg16
    container_name: cobranza_db
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: cobranza_db
      POSTGRES_USER: agentsmx
      POSTGRES_PASSWORD: local_dev_password
    volumes:
      - pg_cobranza_data:/var/lib/postgresql/data
      - ./init/cobranza.sql:/docker-entrypoint-initdb.d/01-init.sql

  postgres-scrapper:
    image: postgres:16
    container_name: scrapper_nacional
    ports:
      - "5433:5432"
    environment:
      POSTGRES_DB: scrapper_nacional
      POSTGRES_USER: agentsmx
      POSTGRES_PASSWORD: local_dev_password
    volumes:
      - pg_scrapper_data:/var/lib/postgresql/data
      - ./init/scrapper.sql:/docker-entrypoint-initdb.d/01-init.sql

  redis:
    image: redis:7-alpine
    container_name: redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  grafana:
    image: grafana/grafana:11.5.0
    container_name: grafana
    ports:
      - "3000:3000"
    environment:
      GF_SECURITY_ADMIN_PASSWORD: admin
    volumes:
      - grafana_data:/var/lib/grafana

volumes:
  pg_cobranza_data:
  pg_scrapper_data:
  redis_data:
  grafana_data:
```

### Iniciar servicios Docker

```bash
# Levantar todos los contenedores
docker compose up -d

# Verificar estado
docker compose ps

# Ver logs
docker compose logs -f postgres-cobranza
```

## Paso 3: Configurar Variables de Entorno

Cada servicio tiene su archivo `.env`. Crear a partir del template:

```bash
# Para cada servicio backend
for service in proj-back-cob-ia proj-back-ai-agents proj-back-driver-adapters \
               proj-api-gps-data proj-back-marketplace-dashboard; do
    cp ~/sandboxes/$service/.env.example ~/sandboxes/$service/.env
done
```

### Variables comunes (.env)

```bash
# Base de datos principal
DATABASE_URL=postgresql://agentsmx:local_dev_password@localhost:5432/cobranza_db

# Base de datos scrapper
SCRAPPER_DATABASE_URL=postgresql://agentsmx:local_dev_password@localhost:5433/scrapper_nacional

# Redis
REDIS_URL=redis://localhost:6379/0

# AI Keys (opcional para desarrollo)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# GPS Provider (solo si se necesita datos reales)
SEEWORLD_API_URL=https://api.seeworld.com/v1
SEEWORLD_USER=...
SEEWORLD_PASS=...

# Flask/FastAPI
FLASK_ENV=development
FLASK_DEBUG=1
LOG_LEVEL=DEBUG
```

## Paso 4: Instalar Dependencias

```bash
# Para cada servicio Python
for service in proj-back-cob-ia proj-back-ai-agents proj-back-driver-adapters \
               proj-api-gps-data proj-back-marketplace-dashboard \
               proj-worker-gps-sync proj-scrapper-nacional; do
    cd ~/sandboxes/$service
    python -m venv .venv
    source .venv/bin/activate
    pip install -r requirements.txt -r requirements-dev.txt
    deactivate
done

# Para frontends
cd ~/sandboxes/proj-front-cobranza && npm install
cd ~/sandboxes/proj-front-marketplace-dashboard && npm install

# Para documentación
cd ~/sandboxes/gps-platform-docs && npm install
```

## Paso 5: Ejecutar Migraciones

```bash
# Cobranza DB
cd ~/sandboxes/proj-back-cob-ia
source .venv/bin/activate
alembic upgrade head

# GPS tables
cd ~/sandboxes/proj-api-gps-data
source .venv/bin/activate
alembic upgrade head

# Scrapper DB
cd ~/sandboxes/proj-scrapper-nacional
source .venv/bin/activate
alembic upgrade head
```

## Paso 6: Ejecutar Servicios

```mermaid
graph LR
    subgraph "Orden de inicio"
        D[Docker\nPostgreSQL + Redis] --> B1[Driver Adapters\n:5000]
        D --> B2[AI Agents\n:5001]
        D --> B3[GPS API\n:5002]
        D --> B4[Marketplace API\n:5050]
        B2 --> B5[Cobranza API\n:8000]
        B5 --> F1[Frontend Cobranza\n:3002]
        B4 --> F2[Frontend Dashboard\n:4200]
    end
```

### Script de inicio

```bash
#!/bin/bash
# start-all.sh

# Backends
cd ~/sandboxes/proj-back-driver-adapters && source .venv/bin/activate && \
    flask run --port 5000 &

cd ~/sandboxes/proj-back-ai-agents && source .venv/bin/activate && \
    flask run --port 5001 &

cd ~/sandboxes/proj-api-gps-data && source .venv/bin/activate && \
    flask run --port 5002 &

cd ~/sandboxes/proj-back-marketplace-dashboard && source .venv/bin/activate && \
    flask run --port 5050 &

cd ~/sandboxes/proj-back-cob-ia && source .venv/bin/activate && \
    uvicorn main:app --port 8000 --reload &

# Frontends
cd ~/sandboxes/proj-front-cobranza && npm run dev &
cd ~/sandboxes/proj-front-marketplace-dashboard && ng serve &

echo "Todos los servicios iniciados."
echo "Cobranza PWA:  http://localhost:3002"
echo "Dashboard:     http://localhost:4200"
echo "API Cobranza:  http://localhost:8000/docs"
echo "Grafana:       http://localhost:3000"
```

## Verificación

```bash
# Verificar servicios
curl http://localhost:8000/health   # Cobranza API
curl http://localhost:5000/health   # Driver Adapters
curl http://localhost:5001/health   # AI Agents
curl http://localhost:5002/health   # GPS API
curl http://localhost:5050/health   # Marketplace API

# Verificar bases de datos
psql -h localhost -p 5432 -U agentsmx -d cobranza_db -c "SELECT 1"
psql -h localhost -p 5433 -U agentsmx -d scrapper_nacional -c "SELECT 1"

# Verificar Redis
redis-cli ping  # PONG
```

## Troubleshooting

| Problema | Solución |
|----------|----------|
| Puerto ya en uso | `lsof -i :PUERTO` y matar el proceso |
| PostgreSQL no conecta | Verificar Docker: `docker ps` |
| Migraciones fallan | Verificar DATABASE_URL en .env |
| Playwright no funciona | `playwright install chromium` |
| Node modules corrupto | `rm -rf node_modules && npm install` |
| Python venv roto | `rm -rf .venv && python -m venv .venv` |

## IDEs Recomendados

| IDE | Plugins | Configuración |
|-----|---------|---------------|
| VS Code | Python, Pylance, Ruff | `settings.json` con type checking |
| PyCharm | Built-in | Configurar interpreters por proyecto |
| Cursor | Python, Ruff | Similar a VS Code |

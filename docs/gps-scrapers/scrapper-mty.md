# Scrapper MTY

`proj-scrapper-mty` - Variante del scrapper con backend AWS: DynamoDB, Elasticsearch y S3. Orientado al mercado de Monterrey y Nuevo León.

## Información General

| Propiedad | Valor |
|-----------|-------|
| Repositorio | `proj-scrapper-mty` |
| Framework | Scrapy 2.11 |
| Spiders | 17 |
| Backend | AWS (DynamoDB, S3, Elasticsearch) |
| Región | us-east-1 |
| Mercado | Monterrey / Nuevo León |

## Arquitectura AWS

```mermaid
graph TB
    subgraph Scrapper MTY
        SP[17 Spiders\nScrapy]
        PL[Pipelines]
    end

    subgraph AWS
        DDB[(DynamoDB\nvehicles table)]
        S3[(S3 Bucket\nimágenes)]
        ES[(Elasticsearch\nbúsqueda)]
        SQS[SQS\neventos]
        EB[EventBridge\nscheduler]
    end

    subgraph Consumers
        SYNC[Marketplace Sync]
        API[Marketplace API]
    end

    SP --> PL
    PL -->|PutItem| DDB
    PL -->|Upload| S3
    PL -->|Index| ES
    PL -->|SendMessage| SQS

    EB -->|Trigger| SP
    SQS --> SYNC
    DDB --> API
    ES --> API
```

## Diferencias con Scrapper Nacional

| Aspecto | Nacional | MTY |
|---------|----------|-----|
| Base de datos | PostgreSQL local | DynamoDB cloud |
| Imágenes | URL referencia | S3 (copia local) |
| Búsqueda | SQL LIKE/ILIKE | Elasticsearch |
| Scheduling | Cron local | EventBridge |
| Eventos | SQS directo | SQS + EventBridge |
| Región geográfica | Nacional | NL / Monterrey |
| Spiders | 18 | 17 |

## Los 17 Spiders MTY

| # | Spider | Tipo | Vehículos | Especialidad |
|---|--------|------|-----------|-------------|
| 1 | kavak_mty | API JSON | ~800 | Kavak filtrado NL |
| 2 | seminuevos_mty | HTML | ~500 | Seminuevos NL |
| 3 | autocosmos_mty | HTML | ~400 | Autocosmos NL |
| 4 | soloautos_mty | HTML | ~300 | SoloAutos NL |
| 5 | vivanuncios_mty | HTML | ~250 | Vivanuncios NL |
| 6 | autosur | HTML | ~200 | Agencia local |
| 7 | agencias_nl | HTML | ~180 | Agencias agrupadas |
| 8 | superautos_mty | HTML | ~150 | Super Autos MTY |
| 9 | mundocar | HTML | ~120 | MundoCar |
| 10 | autofinanciera | HTML | ~100 | AutoFinanciera |
| 11 | motorzone | Playwright | ~100 | MotorZone |
| 12 | carhouse_mty | Playwright | ~80 | CarHouse MTY |
| 13 | premiummotors | Playwright | ~70 | Premium Motors |
| 14 | nlautos | Playwright | ~60 | NL Autos |
| 15 | totalcar | HTML | ~50 | TotalCar |
| 16 | megaautos | HTML | ~40 | MegaAutos |
| 17 | autos_elite | Playwright | ~30 | Autos Elite |

## Pipeline DynamoDB

```mermaid
sequenceDiagram
    participant SP as Spider
    participant PL as Pipeline
    participant DDB as DynamoDB
    participant S3 as S3
    participant ES as Elasticsearch
    participant SQS as SQS

    SP->>PL: yield item

    PL->>PL: Limpieza y normalización

    PL->>DDB: GetItem(source, source_id)
    alt Existe
        DDB-->>PL: Item existente
        PL->>PL: Detectar cambios
        alt Precio cambió
            PL->>DDB: UpdateItem + price_history
            PL->>SQS: price_changed event
        else Sin cambios
            PL->>DDB: UpdateItem(last_seen)
        end
    else No existe
        DDB-->>PL: None
        PL->>S3: Upload imagen
        S3-->>PL: image_url S3
        PL->>DDB: PutItem (nuevo)
        PL->>ES: Index document
        PL->>SQS: new_listing event
    end
```

## Esquema DynamoDB

```python
# Tabla: vehicles_mty
{
    "TableName": "vehicles_mty",
    "KeySchema": [
        {"AttributeName": "source", "KeyType": "HASH"},
        {"AttributeName": "source_id", "KeyType": "RANGE"}
    ],
    "AttributeDefinitions": [
        {"AttributeName": "source", "AttributeType": "S"},
        {"AttributeName": "source_id", "AttributeType": "S"},
        {"AttributeName": "make_model", "AttributeType": "S"},
        {"AttributeName": "price", "AttributeType": "N"}
    ],
    "GlobalSecondaryIndexes": [
        {
            "IndexName": "make_model-price-index",
            "KeySchema": [
                {"AttributeName": "make_model", "KeyType": "HASH"},
                {"AttributeName": "price", "KeyType": "RANGE"}
            ]
        }
    ],
    "BillingMode": "PAY_PER_REQUEST"
}
```

## Almacenamiento S3

```mermaid
graph LR
    subgraph S3 Bucket: agentsmx-scrapper-mty
        F1[/images/kavak/{source_id}.jpg]
        F2[/images/seminuevos/{source_id}.jpg]
        F3[/exports/daily/{date}.json]
        F4[/logs/{spider}/{date}.log]
    end

    SP[Spider] -->|Upload imágenes| F1
    SP -->|Upload imágenes| F2
    EXPORT[Export Job] -->|Dump diario| F3
    CW[CloudWatch] -->|Logs| F4
```

## Elasticsearch Mapping

```json
{
  "mappings": {
    "properties": {
      "make": { "type": "keyword" },
      "model": { "type": "keyword" },
      "version": { "type": "text", "analyzer": "spanish" },
      "year": { "type": "integer" },
      "price": { "type": "float" },
      "mileage": { "type": "integer" },
      "description": { "type": "text", "analyzer": "spanish" },
      "location": { "type": "geo_point" },
      "source": { "type": "keyword" },
      "last_seen": { "type": "date" }
    }
  }
}
```

## EventBridge Schedule

```mermaid
graph TB
    subgraph EventBridge Rules
        R1["rule: scrapper-mty-daily\ncron(0 3 * * ? *)\nSpiders principales"]
        R2["rule: scrapper-mty-weekly\ncron(0 4 ? * SUN *)\nSpiders secundarios"]
    end

    subgraph Targets
        ECS1[ECS Task\nSpiders diarios]
        ECS2[ECS Task\nSpiders semanales]
    end

    R1 --> ECS1
    R2 --> ECS2
```

## Variables de Entorno

```bash
AWS_REGION=us-east-1
DYNAMODB_TABLE=vehicles_mty
S3_BUCKET=agentsmx-scrapper-mty
ELASTICSEARCH_URL=https://search-agentsmx.us-east-1.es.amazonaws.com
SQS_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/xxx/marketplace-events
CONCURRENT_REQUESTS=8
DOWNLOAD_DELAY=1.5
```

## Costos AWS Estimados

| Servicio | Uso | Costo/mes |
|----------|-----|-----------|
| DynamoDB | ~3,500 items, PAY_PER_REQUEST | ~$2 |
| S3 | ~5 GB imágenes | ~$0.12 |
| Elasticsearch | t3.small.elasticsearch | ~$25 |
| SQS | ~10,000 mensajes/mes | ~$0.01 |
| EventBridge | 30 reglas/mes | ~$0.30 |
| **Total** | | **~$27/mes** |

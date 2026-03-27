# Marketplace Sync Worker

`proj-worker-marketplace-sync` - Consumidor de eventos del marketplace que procesa listings nuevos, cambios de precio y sincroniza datos entre scrapers y la API de analytics.

## Arquitectura

```mermaid
graph TB
    subgraph Productores
        SN[Scrapper Nacional\nPostgreSQL triggers]
        SM[Scrapper MTY\nDynamoDB streams]
        MANUAL[Upload manual]
    end

    subgraph AWS
        SQS[SQS Queue\nmarketplace-events]
        DLQ[Dead Letter Queue\nmarketplace-events-dlq]
        EB[EventBridge\nScheduler]
    end

    subgraph Marketplace Sync Worker
        CONSUMER[SQS Consumer]
        ROUTER[Event Router]
        LP[Listing Processor]
        PP[Price Processor]
        DP[Dedup Processor]
        ENRICH[Enrichment Service]
        WRITER[DB Writer]
    end

    subgraph Destino
        PG[(scrapper_nacional\nPostgreSQL :5433)]
        ES[(Elasticsearch\nBúsqueda)]
    end

    SN --> SQS
    SM --> SQS
    MANUAL --> SQS
    SQS --> CONSUMER
    SQS -.->|3 retries| DLQ

    CONSUMER --> ROUTER
    ROUTER -->|new_listing| LP
    ROUTER -->|price_changed| PP
    ROUTER -->|duplicate_check| DP

    LP --> ENRICH --> WRITER
    PP --> WRITER
    DP --> WRITER

    WRITER --> PG
    WRITER --> ES

    EB -->|Reconciliación diaria| CONSUMER
```

## Tipos de Eventos

```mermaid
graph LR
    subgraph Eventos
        E1[new_listing\nVehículo nuevo detectado]
        E2[price_changed\nCambio de precio]
        E3[listing_removed\nVehículo ya no disponible]
        E4[listing_updated\nDatos actualizados]
        E5[reconciliation\nSincronización completa]
    end

    subgraph Acciones
        A1[Insert + Enrich + Index]
        A2[Update price + History]
        A3[Mark inactive]
        A4[Update fields]
        A5[Full sync check]
    end

    E1 --> A1
    E2 --> A2
    E3 --> A3
    E4 --> A4
    E5 --> A5
```

## Procesador de Listings

```mermaid
sequenceDiagram
    participant SQS as SQS
    participant W as Worker
    participant PG as PostgreSQL
    participant ES as Elasticsearch

    SQS->>W: new_listing event

    W->>PG: Check duplicate\n(source + source_id)
    alt Existe
        PG-->>W: Existing record
        W->>W: Merge data
        W->>PG: UPDATE vehicle
        W->>ES: Update index
    else No existe
        PG-->>W: None
        W->>W: Enrich data
        Note over W: Normalizar marca/modelo<br/>Geocodificar ubicación<br/>Calcular precio estimado
        W->>PG: INSERT vehicle
        W->>ES: Index document
    end

    W->>SQS: DeleteMessage
```

## Procesador de Precios

Cuando se detecta un cambio de precio, se registra en el historial.

```python
class PriceProcessor:
    def process(self, event: dict):
        vehicle_id = event['payload']['vehicle_id']
        new_price = event['payload']['new_price']

        # Obtener precio anterior
        current = self.db.get_vehicle(vehicle_id)
        if not current:
            return

        old_price = current.price
        change = new_price - old_price
        change_pct = (change / old_price) * 100 if old_price > 0 else 0

        # Registrar en historial
        self.db.insert_price_history(
            vehicle_id=vehicle_id,
            price=new_price,
            previous_price=old_price,
            price_change=change,
            change_percent=change_pct
        )

        # Actualizar precio actual
        self.db.update_vehicle_price(vehicle_id, new_price)

        # Re-indexar en Elasticsearch
        self.es.update(vehicle_id, {'price': new_price})
```

## Servicio de Enriquecimiento

```mermaid
flowchart TB
    A[Listing crudo] --> B[Normalización\nmarca/modelo]
    B --> C[Geocodificación\nestado/ciudad → lat/lng]
    C --> D[Estimación precio\nvs mercado]
    D --> E[Clasificación\nsegmento/categoría]
    E --> F[Scoring\nconfiabilidad fuente]
    F --> G[Listing enriquecido]

    B -->|Alias mapping| B1["vw → volkswagen\nchevrolet → chevrolet\ngm → general motors"]
    D -->|Comparación| D1["Precio vs AVG del\nmismo make/model/year\n→ above/below/fair"]
```

## EventBridge - Reconciliación

Proceso diario que verifica consistencia entre scrapers y la base de datos del marketplace.

```mermaid
graph TB
    EB[EventBridge\ncron: 0 6 * * ?] --> RECON[Reconciliation Job]

    RECON --> CHECK1[Verificar listings\nactivos vs fuente]
    RECON --> CHECK2[Detectar listings\ndesaparecidos > 7 días]
    RECON --> CHECK3[Re-calcular\nestadísticas por fuente]

    CHECK1 --> UPDATE[Marcar inactivos]
    CHECK2 --> ARCHIVE[Archivar eliminados]
    CHECK3 --> STATS[Actualizar source_stats]
```

## Formato de Mensajes SQS

### new_listing

```json
{
  "event_type": "new_listing",
  "source": "scrapper_nacional",
  "timestamp": "2024-03-15T02:30:00Z",
  "payload": {
    "source": "kavak",
    "source_id": "kv-98765",
    "make": "volkswagen",
    "model": "jetta",
    "year": 2021,
    "price": 395000.00,
    "mileage": 32000,
    "url": "https://kavak.com/jetta-2021",
    "state": "nuevo_leon"
  }
}
```

### price_changed

```json
{
  "event_type": "price_changed",
  "source": "scrapper_nacional",
  "timestamp": "2024-03-16T02:30:00Z",
  "payload": {
    "vehicle_id": 12345,
    "source": "kavak",
    "old_price": 395000.00,
    "new_price": 379000.00,
    "change_percent": -4.05
  }
}
```

## Dead Letter Queue

Mensajes que fallan después de 3 intentos van a la DLQ para revisión manual.

```mermaid
graph LR
    SQS[Cola principal] -->|Intento 1| PROC[Procesamiento]
    PROC -->|Fallo| SQS
    SQS -->|Intento 2| PROC
    PROC -->|Fallo| SQS
    SQS -->|Intento 3| PROC
    PROC -->|Fallo| DLQ[Dead Letter Queue]
    DLQ --> ALARM[CloudWatch Alarm]
    ALARM --> SNS[Email notificación]
```

## Variables de Entorno

```bash
SQS_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/xxx/marketplace-events
SQS_DLQ_URL=https://sqs.us-east-1.amazonaws.com/xxx/marketplace-events-dlq
DATABASE_URL=postgresql://user:pass@localhost:5433/scrapper_nacional
ELASTICSEARCH_URL=https://search-agentsmx.us-east-1.es.amazonaws.com
MAX_MESSAGES=10
VISIBILITY_TIMEOUT=120
POLL_WAIT_SECONDS=20
RECONCILIATION_DAYS_THRESHOLD=7
LOG_LEVEL=INFO
```

## Métricas

| Métrica | Valor |
|---------|-------|
| Mensajes procesados/día | ~12,000 |
| Nuevos listings/día | ~500 |
| Cambios de precio/día | ~2,000 |
| Listings removidos/día | ~300 |
| Error rate | < 0.5% |
| DLQ messages/día | < 10 |
| Tiempo procesamiento/mensaje | ~200ms |

# Patrones Arquitectónicos

Patrones de diseño y arquitectura aplicados en el ecosistema AgentsMX.

## Resumen de Patrones

```mermaid
mindmap
  root((Patrones))
    Arquitectura
      Hexagonal
      CQRS
      Event-Driven
    Diseño
      Repository
      Port/Adapter
      Strategy
    Dominio
      DDD
      Aggregate Root
      Value Objects
    Infraestructura
      Circuit Breaker
      Retry Pattern
      Cache-Aside
```

## 1. Arquitectura Hexagonal (Ports & Adapters)

Patrón principal usado en `proj-back-ai-agents` y `proj-back-cob-ia`.

```mermaid
graph TB
    subgraph Adaptadores de Entrada
        REST[REST Controller]
        CLI[CLI Commands]
        SQS_IN[SQS Consumer]
    end

    subgraph Puertos de Entrada
        UC1[CreateRouteUseCase]
        UC2[AnalyzeVehicleUseCase]
        UC3[ProcessDiagnosticUseCase]
    end

    subgraph Dominio
        ENT[Entities]
        VO[Value Objects]
        SVC[Domain Services]
    end

    subgraph Puertos de Salida
        REPO[RepositoryPort]
        NOTIF[NotificationPort]
        GPS_PORT[GPSProviderPort]
    end

    subgraph Adaptadores de Salida
        PG[PostgreSQL Adapter]
        EMAIL[Email Adapter]
        SEEWORLD[SeeWorld Adapter]
        REDIS_AD[Redis Adapter]
    end

    REST --> UC1
    CLI --> UC2
    SQS_IN --> UC3
    UC1 --> SVC
    UC2 --> SVC
    UC3 --> SVC
    SVC --> ENT
    SVC --> VO
    SVC --> REPO
    SVC --> NOTIF
    SVC --> GPS_PORT
    REPO --> PG
    REPO --> REDIS_AD
    NOTIF --> EMAIL
    GPS_PORT --> SEEWORLD
```

### Ejemplo: Puerto de Repositorio

```python
# domain/ports/vehicle_repository.py
from abc import ABC, abstractmethod
from domain.entities.vehicle import Vehicle

class VehicleRepositoryPort(ABC):
    @abstractmethod
    def find_by_id(self, vehicle_id: str) -> Vehicle | None:
        ...

    @abstractmethod
    def find_active(self) -> list[Vehicle]:
        ...

    @abstractmethod
    def save(self, vehicle: Vehicle) -> Vehicle:
        ...
```

### Ejemplo: Adaptador de Salida

```python
# infrastructure/adapters/postgres_vehicle_repository.py
from domain.ports.vehicle_repository import VehicleRepositoryPort
from domain.entities.vehicle import Vehicle

class PostgresVehicleRepository(VehicleRepositoryPort):
    def __init__(self, session):
        self._session = session

    def find_by_id(self, vehicle_id: str) -> Vehicle | None:
        row = self._session.execute(
            "SELECT * FROM vehicles WHERE id = %s", (vehicle_id,)
        ).fetchone()
        return Vehicle.from_row(row) if row else None

    def save(self, vehicle: Vehicle) -> Vehicle:
        self._session.execute(
            "INSERT INTO vehicles (...) VALUES (...)",
            vehicle.to_dict()
        )
        return vehicle
```

## 2. CQRS (Command Query Responsibility Segregation)

Separación de lecturas y escrituras en el GPS Data API.

```mermaid
graph LR
    subgraph Commands - Escritura
        CMD1[RegisterPosition]
        CMD2[UpdateVehicleState]
        CMD3[CreatePattern]
    end

    subgraph Write Model
        WM[(TimescaleDB\nHypertable)]
    end

    subgraph Queries - Lectura
        Q1[GetVehicleHistory]
        Q2[GetRealtimePositions]
        Q3[GetPatternAnalysis]
    end

    subgraph Read Model
        RM[(Vistas\nMaterializadas)]
        CACHE[(Redis Cache)]
    end

    CMD1 --> WM
    CMD2 --> WM
    CMD3 --> WM
    WM -->|Refresh| RM

    Q1 --> RM
    Q2 --> CACHE
    Q3 --> RM
```

## 3. Event-Driven Architecture (SQS)

Comunicación asíncrona entre subsistemas mediante eventos en AWS SQS.

```mermaid
graph TB
    subgraph Productores
        S1[Scrapper Nacional]
        S2[Email Receiver]
        S3[GPS Worker]
    end

    subgraph Colas SQS
        Q1[marketplace-listings-queue]
        Q2[diagnostic-scans-queue]
        Q3[gps-alerts-queue]
    end

    subgraph Consumidores
        C1[Marketplace Sync Worker]
        C2[Diagnostic Sync Worker]
        C3[Alert Processor]
    end

    S1 -->|new_listing| Q1
    S2 -->|new_scan| Q2
    S3 -->|vehicle_alert| Q3

    Q1 --> C1
    Q2 --> C2
    Q3 --> C3
```

### Ejemplo: Publicar Evento

```python
# infrastructure/messaging/sqs_publisher.py
import boto3
import json

class SQSPublisher:
    def __init__(self, queue_url: str):
        self._client = boto3.client("sqs")
        self._queue_url = queue_url

    def publish(self, event_type: str, payload: dict):
        self._client.send_message(
            QueueUrl=self._queue_url,
            MessageBody=json.dumps({
                "event_type": event_type,
                "payload": payload,
                "timestamp": datetime.utcnow().isoformat()
            }),
            MessageAttributes={
                "EventType": {
                    "StringValue": event_type,
                    "DataType": "String"
                }
            }
        )
```

## 4. Repository Pattern

Abstracción de acceso a datos usada consistentemente en todos los servicios.

```mermaid
classDiagram
    class RepositoryPort {
        <<interface>>
        +find_by_id(id) Entity
        +find_all() List~Entity~
        +save(entity) Entity
        +delete(id) bool
    }

    class PostgresRepository {
        -session: Session
        +find_by_id(id) Entity
        +find_all() List~Entity~
        +save(entity) Entity
        +delete(id) bool
    }

    class RedisRepository {
        -client: Redis
        +find_by_id(id) Entity
        +save(entity) Entity
    }

    RepositoryPort <|.. PostgresRepository
    RepositoryPort <|.. RedisRepository
```

## 5. Strategy Pattern (Driver Adapters)

Selección dinámica de proveedor GPS según el tipo de dispositivo.

```mermaid
classDiagram
    class GPSProvider {
        <<interface>>
        +get_positions() List~Position~
        +get_device_info() DeviceInfo
        +supports(provider_type) bool
    }

    class SeeWorldProvider {
        -api_key: str
        -base_url: str
        +get_positions() List~Position~
        +supports(type) bool
    }

    class WhatsGPSProvider {
        -credentials: dict
        +get_positions() List~Position~
        +supports(type) bool
    }

    class DatabaseProvider {
        -connection: str
        +get_positions() List~Position~
        +supports(type) bool
    }

    class ProviderFactory {
        -providers: Map
        +get_provider(type) GPSProvider
        +register(provider) void
    }

    GPSProvider <|.. SeeWorldProvider
    GPSProvider <|.. WhatsGPSProvider
    GPSProvider <|.. DatabaseProvider
    ProviderFactory --> GPSProvider
```

## 6. Domain-Driven Design

Organización del código por contextos delimitados (Bounded Contexts).

```mermaid
graph TB
    subgraph Bounded Context: Cobranza
        BC1_E[Entities: Client, Route, Visit]
        BC1_V[Values: Money, Priority, Location]
        BC1_S[Services: RouteOptimizer, PriorityCalculator]
    end

    subgraph Bounded Context: GPS
        BC2_E[Entities: Vehicle, Position, Pattern]
        BC2_V[Values: Coordinate, Speed, EngineState]
        BC2_S[Services: StateCompressor, PatternAnalyzer]
    end

    subgraph Bounded Context: Marketplace
        BC3_E[Entities: Listing, PriceHistory, Source]
        BC3_V[Values: Price, Mileage, Condition]
        BC3_S[Services: PriceAnalyzer, ListingMatcher]
    end

    subgraph Bounded Context: Diagnósticos
        BC4_E[Entities: Scan, SensorReading, DTC]
        BC4_V[Values: SensorValue, FaultCode, Severity]
        BC4_S[Services: PDFParser, HealthScorer]
    end
```

## Resumen de Aplicación por Servicio

| Servicio | Hexagonal | CQRS | Events | Repository | Strategy | DDD |
|----------|-----------|------|--------|------------|----------|-----|
| Cobranza IA | Si | Parcial | Si | Si | No | Si |
| AI Agents | Si | No | Si | Si | Si | Si |
| Driver Adapters | Si | No | No | Si | Si | No |
| GPS API | Parcial | Si | Si | Si | No | Parcial |
| Marketplace API | Parcial | No | Si | Si | No | Parcial |

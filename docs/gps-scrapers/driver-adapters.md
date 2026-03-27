# Driver Adapters

Servicio de adaptadores multi-fuente para integración con proveedores GPS. Abstrae las diferencias entre APIs de distintos proveedores de hardware GPS.

## Tipos de Proveedor

```mermaid
graph TB
    subgraph Proveedores GPS
        REST[REST Provider\nSeeWorld API]
        REST2[REST Provider\nWhatsGPS API]
        DB[Database Provider\nLegacy direct DB]
    end

    subgraph Driver Adapters :5000
        FACTORY[Provider Factory]
        NORM[Normalizador]
        HEALTH[Health Monitor]
        CACHE[Connection Cache]
    end

    subgraph Consumers
        W[GPS Sync Worker]
        API[GPS Data API]
    end

    REST --> FACTORY
    REST2 --> FACTORY
    DB --> FACTORY
    FACTORY --> NORM
    NORM --> W
    NORM --> API
    HEALTH --> REST
    HEALTH --> REST2
    HEALTH --> DB
```

## SeeWorld Provider (Principal)

SeeWorld es el proveedor GPS principal que cubre ~80% de los dispositivos rastreados.

```mermaid
sequenceDiagram
    participant DA as Driver Adapters
    participant AUTH as SeeWorld Auth
    participant API as SeeWorld API

    Note over DA,API: Autenticación (cada 2 horas)
    DA->>AUTH: POST /oauth/token
    AUTH-->>DA: {access_token, expires_in: 7200}

    Note over DA,API: Consulta de posiciones
    DA->>API: GET /api/v1/positions<br/>Authorization: Bearer {token}
    API-->>DA: [{imei, lat, lng, speed, course, ignition, gps_time}]

    Note over DA,API: Consulta de dispositivos
    DA->>API: GET /api/v1/devices
    API-->>DA: [{imei, name, model, sim, group, status}]

    Note over DA,API: Consulta de alertas
    DA->>API: GET /api/v1/alerts?since={timestamp}
    API-->>DA: [{type, imei, lat, lng, timestamp}]
```

### Datos de SeeWorld

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `imei` | string | IMEI del dispositivo |
| `latitude` | float | Latitud WGS84 |
| `longitude` | float | Longitud WGS84 |
| `speed` | float | Velocidad km/h |
| `course` | int | Dirección 0-360 grados |
| `ignition` | bool | Estado del motor |
| `gps_time` | datetime | Timestamp del GPS |
| `battery` | float | Voltaje de batería |
| `satellites` | int | Satélites GPS conectados |
| `gsm_signal` | int | Nivel señal GSM |

## WhatsGPS Provider (Secundario)

Proveedor alternativo para dispositivos de otras marcas.

```mermaid
sequenceDiagram
    participant DA as Driver Adapters
    participant WG as WhatsGPS API

    DA->>WG: POST /api/login
    WG-->>DA: {session_id}

    DA->>WG: GET /api/positions?session={id}
    WG-->>DA: [{device_id, lat, lon, spd, heading, acc_on}]
```

## Database Provider (Legacy)

Acceso directo a bases de datos para dispositivos sin API REST disponible.

```mermaid
graph LR
    DA[Driver Adapters] -->|SQL Query| DB[(Legacy DB\nMySQL/PostgreSQL)]
    DB -->|Raw positions| DA
    DA -->|Normalize| OUT[Posición Normalizada]
```

## Flujo de Conexión

```mermaid
stateDiagram-v2
    [*] --> Init
    Init --> LoadConfig: startup
    LoadConfig --> CreateProviders: para cada cuenta

    state CreateProviders {
        [*] --> Authenticate
        Authenticate --> Connected: success
        Authenticate --> Retry: fail
        Retry --> Authenticate: intento < 3
        Retry --> Disabled: intento >= 3
        Connected --> Ready
    }

    CreateProviders --> Running
    Running --> HealthCheck: cada 30s

    state HealthCheck {
        [*] --> Ping
        Ping --> Healthy: response < 5s
        Ping --> Degraded: response 5-15s
        Ping --> Unhealthy: timeout
        Unhealthy --> Reconnect
        Reconnect --> Healthy: success
        Reconnect --> Disabled: fail
    }
```

## Health Checks

Cada proveedor se monitorea independientemente con un estado de salud.

```mermaid
graph TB
    subgraph Health Status
        H[Health Checker\ncron: 30s]
    end

    subgraph Proveedores
        P1[SeeWorld Cuenta 1\n3,200 devices]
        P2[SeeWorld Cuenta 2\n800 devices]
        P3[WhatsGPS\n150 devices]
        P4[Database Legacy\n50 devices]
    end

    subgraph Estados
        S1((Healthy))
        S2((Degraded))
        S3((Unhealthy))
    end

    H --> P1 --> S1
    H --> P2 --> S1
    H --> P3 --> S2
    H --> P4 --> S1

    style S1 fill:#4caf50,color:white
    style S2 fill:#ff9800,color:white
    style S3 fill:#f44336,color:white
```

## Modelo de Datos Normalizado

Independiente del proveedor, todos los datos se normalizan al siguiente formato:

```python
@dataclass
class NormalizedPosition:
    imei: str
    latitude: float
    longitude: float
    speed: float           # km/h
    course: int            # 0-360 grados
    ignition: bool
    timestamp: datetime    # UTC
    battery_voltage: float # Volts
    satellites: int
    provider: str          # 'seeworld' | 'whatsgps' | 'database'
    account: str           # Identificador de cuenta
    raw_data: dict         # Datos sin normalizar

@dataclass
class ProviderStatus:
    provider: str
    account: str
    status: str            # 'healthy' | 'degraded' | 'unhealthy'
    latency_ms: int
    device_count: int
    last_check: datetime
    error: str | None
```

## Configuración Multi-Tenant

```python
# Ejemplo de configuración de proveedores
PROVIDERS = {
    "seeworld": {
        "type": "rest",
        "accounts": [
            {
                "name": "fleet_main",
                "base_url": "https://api.seeworld.com/v1",
                "credentials": {"user": "...", "pass": "..."},
                "device_count": 3200,
                "poll_interval": 60
            },
            {
                "name": "fleet_secondary",
                "base_url": "https://api.seeworld.com/v1",
                "credentials": {"user": "...", "pass": "..."},
                "device_count": 800,
                "poll_interval": 60
            }
        ]
    },
    "whatsgps": {
        "type": "rest",
        "accounts": [...]
    },
    "database": {
        "type": "database",
        "accounts": [...]
    }
}
```

## Métricas

| Métrica | Valor |
|---------|-------|
| Total dispositivos | ~4,200 |
| Cuentas SeeWorld | 2 |
| Cuentas WhatsGPS | 1 |
| Conexiones Legacy DB | 1 |
| Latencia promedio SeeWorld | ~120ms |
| Latencia promedio WhatsGPS | ~350ms |
| Health check interval | 30 segundos |

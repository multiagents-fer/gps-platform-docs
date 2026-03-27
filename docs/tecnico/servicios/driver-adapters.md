# Driver Adapters Service

`proj-back-driver-adapters` - Adaptador multi-fuente para integración con proveedores GPS.

## Información General

| Propiedad | Valor |
|-----------|-------|
| Repositorio | `proj-back-driver-adapters` |
| Framework | Flask |
| Puerto | 5000 |
| Proveedores | SeeWorld, WhatsGPS, Database |
| Patrón | Strategy + Adapter |

## Arquitectura

```mermaid
graph TB
    subgraph Consumers
        W1[GPS Sync Worker]
        W2[GPS Data API :5002]
        W3[Cobranza API :8000]
    end

    subgraph Driver Adapters :5000
        ROUTER[Provider Router]

        subgraph Estrategias
            S1[SeeWorld\nProvider]
            S2[WhatsGPS\nProvider]
            S3[Database\nProvider]
        end

        NORM[Normalizador\nde Respuestas]
        HEALTH[Health Monitor]
    end

    subgraph Proveedores Externos
        EXT1[SeeWorld API\nREST]
        EXT2[WhatsGPS API\nREST]
        EXT3[DB Legacy\nPostgreSQL]
    end

    W1 --> ROUTER
    W2 --> ROUTER
    W3 --> ROUTER

    ROUTER --> S1 --> EXT1
    ROUTER --> S2 --> EXT2
    ROUTER --> S3 --> EXT3

    S1 --> NORM
    S2 --> NORM
    S3 --> NORM

    HEALTH --> S1
    HEALTH --> S2
    HEALTH --> S3
```

## Tipos de Proveedor

### SeeWorld (Principal)

Proveedor GPS principal utilizado por la mayoría de vehículos en la flota.

```mermaid
sequenceDiagram
    participant DA as Driver Adapters
    participant SW as SeeWorld API

    DA->>SW: POST /api/auth/login
    SW-->>DA: {token, expires_in}

    DA->>SW: GET /api/devices/list
    SW-->>DA: [{imei, name, group}]

    DA->>SW: GET /api/devices/positions?imeis=...
    SW-->>DA: [{lat, lng, speed, course, ignition, timestamp}]

    DA->>DA: Normalizar a formato interno
```

### WhatsGPS (Secundario)

Proveedor alternativo para dispositivos específicos.

### Database (Legacy)

Acceso directo a base de datos para dispositivos sin API REST.

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/v1/positions` | Posiciones actuales de todos los dispositivos |
| GET | `/api/v1/positions/{imei}` | Posición de un dispositivo específico |
| GET | `/api/v1/devices` | Lista de dispositivos registrados |
| GET | `/api/v1/devices/{imei}/info` | Información detallada del dispositivo |
| GET | `/api/v1/providers/status` | Estado de conexión por proveedor |
| POST | `/api/v1/providers/refresh` | Forzar reconexión a proveedores |
| GET | `/health` | Health check del servicio |

## Modelo de Datos Normalizado

Todos los proveedores normalizan su respuesta al siguiente formato:

```python
@dataclass
class NormalizedPosition:
    imei: str              # Identificador único del dispositivo
    latitude: float        # Latitud decimal
    longitude: float       # Longitud decimal
    speed: float           # Velocidad en km/h
    course: int            # Dirección en grados (0-360)
    ignition: bool         # Estado del motor
    timestamp: datetime    # Marca temporal UTC
    provider: str          # "seeworld" | "whatsgps" | "database"
    raw_data: dict         # Datos originales sin procesar
```

## Flujo de Conexión

```mermaid
stateDiagram-v2
    [*] --> Disconnected
    Disconnected --> Authenticating: connect()
    Authenticating --> Connected: auth_success
    Authenticating --> RetryWait: auth_failed
    RetryWait --> Authenticating: retry (3 intentos)
    RetryWait --> Failed: max_retries
    Connected --> Fetching: get_positions()
    Fetching --> Connected: success
    Fetching --> Reconnecting: timeout/error
    Reconnecting --> Authenticating: retry
    Failed --> Disconnected: manual_reset
    Connected --> Disconnected: disconnect()
```

## Health Checks

El servicio monitorea la salud de cada proveedor de forma independiente.

```mermaid
graph LR
    subgraph Health Monitor
        HC[Health Checker\ncada 30s]
    end

    subgraph Status por Proveedor
        S1["SeeWorld: healthy\nlatencia: 120ms\núltimo check: 10s ago"]
        S2["WhatsGPS: degraded\nlatencia: 800ms\núltimo check: 10s ago"]
        S3["Database: healthy\nlatencia: 5ms\núltimo check: 10s ago"]
    end

    HC --> S1
    HC --> S2
    HC --> S3
```

## Configuración Multi-Tenant

El servicio soporta múltiples cuentas GPS, útil para gestionar flotas de diferentes clientes.

```python
# config/providers.yaml
providers:
  seeworld:
    accounts:
      - name: "Flota Principal"
        api_url: "https://api.seeworld.com/v1"
        username: "${SEEWORLD_USER_1}"
        password: "${SEEWORLD_PASS_1}"
        device_count: 3200
      - name: "Flota Secundaria"
        api_url: "https://api.seeworld.com/v1"
        username: "${SEEWORLD_USER_2}"
        password: "${SEEWORLD_PASS_2}"
        device_count: 800
  whatsgps:
    accounts:
      - name: "WhatsGPS Default"
        api_url: "https://api.whatsgps.com"
        token: "${WHATSGPS_TOKEN}"
```

## Variables de Entorno

```bash
FLASK_PORT=5000
SEEWORLD_API_URL=https://api.seeworld.com/v1
SEEWORLD_USER=user
SEEWORLD_PASS=pass
WHATSGPS_API_URL=https://api.whatsgps.com
WHATSGPS_TOKEN=token
HEALTH_CHECK_INTERVAL=30
CONNECTION_TIMEOUT=10
MAX_RETRIES=3
```

# GPS Sync Worker

`proj-worker-gps-sync` - Worker de sincronización GPS con APScheduler, compresión diferencial de estado y análisis de patrones.

## Arquitectura

```mermaid
graph TB
    subgraph GPS Sync Worker
        SCHED[APScheduler\nIntervalTrigger: 60s]
        POOL[ThreadPoolExecutor\nmax_workers: 4]
        DIFF[Compresión Diferencial]
        PATTERN[Analizador de Patrones]
        WRITER[DB Writer\nBatch Insert]
    end

    subgraph Entrada
        DA[Driver Adapters :5000]
    end

    subgraph Salida
        TS[(TimescaleDB\nvehicle_status_history)]
        SL[(vehicle_state_log)]
        PT[(pattern_* tables)]
    end

    DA -->|HTTP| SCHED
    SCHED --> POOL
    POOL --> DIFF
    DIFF -->|Solo cambios| WRITER
    WRITER --> TS
    WRITER --> SL
    DIFF --> PATTERN
    PATTERN --> PT
```

## Ciclo de Sincronización (60 segundos)

```mermaid
sequenceDiagram
    participant SCHED as APScheduler
    participant POOL as ThreadPool
    participant DA as Driver Adapters
    participant DIFF as Diferencial
    participant DB as TimescaleDB

    loop Cada 60 segundos
        SCHED->>POOL: trigger sync_cycle()

        par Consulta paralela por cuenta
            POOL->>DA: GET /positions (cuenta 1)
            DA-->>POOL: 3,200 posiciones
        and
            POOL->>DA: GET /positions (cuenta 2)
            DA-->>POOL: 800 posiciones
        and
            POOL->>DA: GET /positions (cuenta 3)
            DA-->>POOL: 200 posiciones
        end

        POOL->>DIFF: 4,200 posiciones totales

        DIFF->>DIFF: Comparar con último estado conocido
        Note over DIFF: Motor on/off? Movimiento > 50m?<br/>Velocidad delta > 10km/h?

        DIFF->>DB: INSERT ~120K registros<br/>(de 4.2M posibles/día)
        DIFF->>DB: UPDATE vehicle_state_log
    end
```

## Compresión Diferencial de Estado

El mecanismo central del worker que reduce 35M registros/día a ~2M.

```mermaid
flowchart TB
    A[Posición GPS nueva\npara vehículo X] --> B[Obtener último estado\nconocido de X]

    B --> C{Cambió estado\nde motor?}
    C -->|Sí| SAVE[GUARDAR registro]
    C -->|No| D{Distancia > 50m\ndel último punto?}

    D -->|Sí| SAVE
    D -->|No| E{Delta velocidad\n> 10 km/h?}

    E -->|Sí| SAVE
    E -->|No| F{Tiempo desde\núltimo > 5 min?}

    F -->|Sí| SAVE
    F -->|No| DISCARD[DESCARTAR\n registro redundante]

    SAVE --> G[(vehicle_status_history)]
    SAVE --> H[Actualizar\nvehicle_state_log]
    SAVE --> I[Incrementar\ncontador guardados]
    DISCARD --> J[Incrementar\ncontador descartados]

    subgraph Resultado
        K["~4,200 posiciones cada 60s\n= 6,048,000 posiciones/día\nSolo ~350,000 guardadas\nRatio: ~17:1"]
    end
```

## APScheduler Configuración

```python
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from concurrent.futures import ThreadPoolExecutor

scheduler = BackgroundScheduler()
executor = ThreadPoolExecutor(max_workers=4)

scheduler.add_job(
    func=sync_cycle,
    trigger=IntervalTrigger(seconds=60),
    id='gps_sync_main',
    name='GPS Sync Cycle',
    max_instances=1,  # Evitar overlap
    coalesce=True,    # Fusionar ejecuciones perdidas
    misfire_grace_time=30
)
```

## ThreadPoolExecutor

Cada cuenta GPS se consulta en paralelo para maximizar throughput.

```mermaid
graph LR
    subgraph ThreadPool - 4 workers
        T1[Thread 1\nSeeWorld Cuenta 1]
        T2[Thread 2\nSeeWorld Cuenta 2]
        T3[Thread 3\nWhatsGPS]
        T4[Thread 4\nDatabase Legacy]
    end

    subgraph Resultados
        R[Merge + Dedup\n4,200 posiciones]
    end

    T1 -->|3,200| R
    T2 -->|800| R
    T3 -->|150| R
    T4 -->|50| R
```

## Análisis de Patrones

Después de la compresión, el worker analiza patrones de comportamiento vehicular.

```mermaid
flowchart LR
    subgraph Detección de Patrones
        A[Datos comprimidos] --> B[Trip Detection\nInicio/Fin viaje]
        A --> C[Stop Detection\nParadas > 5 min]
        A --> D[Location Clustering\nLugares frecuentes]
        A --> E[Time Analysis\nHoras de actividad]
    end

    subgraph Almacenamiento
        B --> P1[(pattern_daily)]
        C --> P1
        D --> P2[(pattern_locations)]
        E --> P3[(pattern_weekly)]
    end
```

### Detección de Viajes

```python
def detect_trips(positions: list[Position]) -> list[Trip]:
    """Detecta viajes basándose en cambios de estado del motor."""
    trips = []
    current_trip = None

    for pos in positions:
        if pos.ignition and not current_trip:
            # Inicio de viaje
            current_trip = Trip(start=pos)
        elif not pos.ignition and current_trip:
            # Fin de viaje
            current_trip.end = pos
            current_trip.distance = calculate_distance(
                current_trip.positions
            )
            trips.append(current_trip)
            current_trip = None

    return trips
```

## Estado del Worker

```mermaid
stateDiagram-v2
    [*] --> Starting
    Starting --> Running: scheduler.start()
    Running --> Syncing: trigger (60s)
    Syncing --> Running: cycle complete
    Syncing --> Error: exception
    Error --> Running: next cycle
    Running --> Stopping: shutdown signal
    Stopping --> [*]
```

## Métricas de Performance

| Métrica | Valor |
|---------|-------|
| Ciclo de sync | 60 segundos |
| Duración promedio del ciclo | ~8 segundos |
| Posiciones por ciclo | ~4,200 |
| Registros guardados/ciclo | ~350 (promedio) |
| Registros descartados/ciclo | ~3,850 |
| Ratio de compresión | ~17:1 |
| Threads paralelos | 4 |
| Uso de memoria | ~200 MB |
| Uptime target | 99.9% |

## Variables de Entorno

```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/cobranza_db
DRIVER_ADAPTERS_URL=http://localhost:5000
SYNC_INTERVAL_SECONDS=60
THREAD_POOL_SIZE=4
COMPRESSION_DISTANCE_THRESHOLD=50
COMPRESSION_SPEED_THRESHOLD=10
COMPRESSION_TIME_THRESHOLD=300
PATTERN_ANALYSIS_ENABLED=true
LOG_LEVEL=INFO
```

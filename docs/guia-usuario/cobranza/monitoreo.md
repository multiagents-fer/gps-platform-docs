---
title: Monitoreo en Vivo
description: Seguimiento GPS en tiempo real de cobradores en campo
---

# Monitoreo en Vivo

El modulo de monitoreo permite al supervisor rastrear en tiempo real la posicion y actividad de los 17 cobradores en campo mediante GPS y WebSockets.

## Arquitectura del Monitoreo

```mermaid
graph TB
    subgraph Campo["Cobradores en Campo"]
        PWA1["PWA Cobrador 1<br/>GPS cada 30s"]
        PWA2["PWA Cobrador 2<br/>GPS cada 30s"]
        PWAN["PWA Cobrador N<br/>GPS cada 30s"]
    end

    subgraph Backend["Backend"]
        WS["WebSocket Gateway<br/>NestJS"]
        GPS["GPS Service"]
        TSDB["TimescaleDB<br/>Posiciones historicas"]
    end

    subgraph Dashboard["Dashboard Supervisor"]
        MAP["Mapa en Vivo"]
        LIST["Lista de Cobradores"]
        ALERTS["Panel de Alertas"]
    end

    Campo -->|WebSocket| WS
    WS --> GPS
    GPS --> TSDB
    WS -->|Broadcast| Dashboard

    style WS fill:#e3f2fd,stroke:#1976d2
    style MAP fill:#e8f5e9,stroke:#4caf50
    style ALERTS fill:#fff3e0,stroke:#f57c00
```

## Vista de Mapa en Tiempo Real

El mapa central muestra:

### Elementos Visuales

| Elemento | Icono/Color | Significado |
|----------|------------|-------------|
| Cobrador activo | Marcador verde con pulso | GPS reportando, en movimiento |
| Cobrador detenido | Marcador amarillo | GPS activo pero sin movimiento >10 min |
| Cobrador offline | Marcador rojo | Sin reporte GPS >5 minutos |
| Visita completada | Circulo verde | Parada visitada exitosamente |
| Visita pendiente | Circulo azul | Siguiente parada en la ruta |
| Visita no realizada | Circulo gris | Parada aun no visitada |
| Linea de ruta | Linea azul punteada | Ruta optimizada original |
| Ruta recorrida | Linea verde solida | Trayecto real del cobrador |

### Flujo de Actualizacion

```mermaid
sequenceDiagram
    participant C as PWA Cobrador
    participant WS as WebSocket Server
    participant DB as TimescaleDB
    participant D as Dashboard

    loop Cada 30 segundos
        C->>WS: Enviar posicion GPS
        WS->>DB: Almacenar posicion
        WS->>D: Broadcast actualizacion
        D->>D: Actualizar marcador en mapa
    end

    C->>WS: Evento: visita completada
    WS->>D: Notificacion de visita
    D->>D: Actualizar progreso
```

## Estado de Cobradores

Panel lateral con tarjetas por cobrador, ordenadas por estado:

```mermaid
graph TB
    subgraph Estados["Estados de Cobrador"]
        direction TB
        ON["EN CAMPO<br/>GPS activo + agenda asignada"]
        IDLE["INACTIVO<br/>GPS activo pero sin movimiento"]
        OFF["OFFLINE<br/>Sin senal GPS"]
        DONE["COMPLETADO<br/>Todas las visitas realizadas"]
    end

    style ON fill:#e8f5e9,stroke:#4caf50
    style IDLE fill:#fff9c4,stroke:#fbc02d
    style OFF fill:#ffebee,stroke:#f44336
    style DONE fill:#e3f2fd,stroke:#2196f3
```

### Detalle por Cobrador

Al hacer click en un cobrador se despliega:

- **Progreso de visitas**: 8 de 12 completadas (barra de progreso)
- **Cobro acumulado hoy**: $45,200 MXN
- **Tiempo en campo**: 4h 23min
- **Siguiente parada**: Nombre del moroso + ETA
- **Ultima actividad**: Hace 2 minutos — visita completada
- **Adherencia a ruta**: 87% (que tanto siguio la ruta sugerida)

## Adherencia a Ruta

El sistema calcula que tan fielmente el cobrador sigue la ruta optimizada:

```mermaid
graph LR
    subgraph Metricas["Metricas de Adherencia"]
        ORD["Orden de Visitas<br/>Siguio el orden sugerido?"]
        DIST["Distancia Real vs Planeada<br/>Desviacion en km"]
        TIME["Tiempo Real vs Estimado<br/>Desviacion en minutos"]
        SKIP["Paradas Omitidas<br/>Visitas saltadas"]
    end

    ORD --> SCORE["Score de Adherencia<br/>0% - 100%"]
    DIST --> SCORE
    TIME --> SCORE
    SKIP --> SCORE

    style SCORE fill:#e8f5e9,stroke:#4caf50
```

| Rango | Clasificacion | Accion |
|-------|--------------|--------|
| 90-100% | Excelente | Sin accion |
| 70-89% | Buena | Revision opcional |
| 50-69% | Regular | Revisar con cobrador |
| <50% | Baja | Atencion inmediata |

## Alertas en Tiempo Real

El sistema genera alertas automaticas:

| Alerta | Condicion | Prioridad |
|--------|-----------|-----------|
| Cobrador offline | Sin GPS >5 min | Alta |
| Detenido prolongado | Sin movimiento >30 min | Media |
| Fuera de ruta | >2 km de la ruta planeada | Media |
| Visita no registrada | En ubicacion de moroso pero sin registro | Baja |
| Jornada excedida | Mas de 9 horas en campo | Alta |

## Historial de Posiciones

El supervisor puede consultar el recorrido historico de cualquier cobrador:

- **Seleccionar cobrador** y **rango de fechas**
- Ver trayecto completo sobre el mapa
- Identificar paradas, tiempos muertos y desvios
- Exportar datos de recorrido en CSV

::: tip Frecuencia GPS
La PWA envia posicion GPS cada 30 segundos cuando esta en primer plano. En background, la frecuencia baja a cada 60 segundos para ahorrar bateria.
:::

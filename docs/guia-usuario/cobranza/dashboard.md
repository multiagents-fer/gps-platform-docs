---
title: Dashboard Supervisor
description: Panel de control principal para supervisores de cobranza
---

# Dashboard Supervisor

El Dashboard Supervisor es el panel central desde donde se gestiona toda la operacion de cobranza. Presenta KPIs en tiempo real, estado de la cartera y actividad de los cobradores.

## KPIs Principales

El encabezado del dashboard muestra cuatro indicadores clave actualizados en tiempo real:

```mermaid
graph LR
    subgraph KPIs["Panel de KPIs"]
        K1["Total Morosos<br/>794 cuentas"]
        K2["Monto Adeudado<br/>$12.4M MXN"]
        K3["Promesas Activas<br/>127 promesas"]
        K4["Cobradores en Campo<br/>14/17 activos"]
    end

    style K1 fill:#e8f5e9,stroke:#4caf50
    style K2 fill:#fff3e0,stroke:#ff9800
    style K3 fill:#e3f2fd,stroke:#2196f3
    style K4 fill:#f3e5f5,stroke:#9c27b0
```

| KPI | Descripcion | Actualizacion |
|-----|------------|---------------|
| **Total Morosos** | Numero total de cuentas en cartera morosa activa | Al cargar cartera |
| **Monto Total Adeudado** | Suma de saldos vencidos de todas las cuentas | Al cargar cartera |
| **Promesas Activas** | Promesas de pago registradas pendientes de cumplimiento | Tiempo real |
| **Cobradores en Campo** | Cobradores con sesion activa y GPS reportando | Tiempo real |

## Cartera Morosa — Vista General

La seccion principal muestra un resumen visual de la cartera distribuida por buckets:

```mermaid
graph TB
    subgraph Buckets["Distribucion por Bucket"]
        B1["B1<br/>1-30 dias<br/>142 cuentas"]
        B2["B2<br/>31-60 dias<br/>118 cuentas"]
        B3["B3<br/>61-90 dias<br/>95 cuentas"]
        B4["B4<br/>91-120 dias<br/>87 cuentas"]
        B5["B5-B10<br/>121+ dias<br/>352 cuentas"]
    end

    style B1 fill:#e8f5e9,stroke:#4caf50
    style B2 fill:#fff9c4,stroke:#fbc02d
    style B3 fill:#fff3e0,stroke:#ff9800
    style B4 fill:#ffebee,stroke:#f44336
    style B5 fill:#fce4ec,stroke:#e91e63
```

### Filtros Disponibles

- **Bucket**: Seleccion individual o multiple (B1 a B10)
- **Cobrador asignado**: Filtrar por cobrador especifico
- **Rango de monto**: Filtrar por monto adeudado minimo/maximo
- **Zona geografica**: Filtrar por area o cluster
- **Estado de promesa**: Con promesa activa / Sin promesa / Promesa vencida

## Vista de Cobradores

Panel lateral o seccion dedicada que muestra el estado de cada cobrador:

```mermaid
graph TB
    subgraph Cobradores["Estado de Cobradores"]
        direction LR
        C1["Juan Perez<br/>En campo<br/>8/12 visitas"]
        C2["Maria Lopez<br/>En campo<br/>5/10 visitas"]
        C3["Carlos Ruiz<br/>Offline<br/>0/8 visitas"]
        C4["Ana Torres<br/>En campo<br/>11/11 visitas"]
    end

    style C1 fill:#e8f5e9,stroke:#4caf50
    style C2 fill:#e8f5e9,stroke:#4caf50
    style C3 fill:#ffebee,stroke:#f44336
    style C4 fill:#e3f2fd,stroke:#2196f3
```

Cada tarjeta de cobrador muestra:

| Campo | Descripcion |
|-------|------------|
| Nombre | Nombre del cobrador |
| Estado | En campo (GPS activo) / Offline / Sin agenda |
| Progreso | Visitas completadas vs asignadas |
| Ultima posicion | Hora de ultimo reporte GPS |
| Cobro del dia | Monto total cobrado hoy |

## Mapa de Rutas

Vista de mapa interactivo (Leaflet/Google Maps) que muestra:

- **Puntos azules**: Ubicacion de morosos asignados
- **Puntos verdes**: Visitas completadas
- **Puntos rojos**: Visitas pendientes
- **Linea de ruta**: Ruta optimizada generada por OR-Tools
- **Marcador cobrador**: Posicion GPS en tiempo real del cobrador

### Interacciones del Mapa

1. **Click en punto moroso** — Muestra detalle: nombre, monto, dias de atraso, historial
2. **Click en cobrador** — Muestra progreso, siguiente parada, tiempo estimado
3. **Toggle de capas** — Mostrar/ocultar rutas, clusters, zonas

## Navegacion del Dashboard

```mermaid
graph LR
    DASH["Dashboard"] --> AGENDA["Agendas"]
    DASH --> MON["Monitoreo"]
    DASH --> REP["Reportes"]
    DASH --> CART["Cartera"]

    style DASH fill:#e3f2fd,stroke:#1976d2
    style AGENDA fill:#f1f8e9,stroke:#689f38
    style MON fill:#fff3e0,stroke:#f57c00
    style REP fill:#fce4ec,stroke:#c2185b
    style CART fill:#f3e5f5,stroke:#7b1fa2
```

## Acciones Rapidas

Desde el dashboard el supervisor puede:

- **Generar Paquetes** — Iniciar el proceso de generacion de agendas con ML
- **Ver Monitoreo** — Ir a la vista de tracking en tiempo real
- **Exportar Reporte** — Descargar resumen del dia en CSV/Excel
- **Asignar Cobrador** — Reasignar cuentas entre cobradores
- **Cargar Cartera** — Subir nuevo archivo Excel de morosos

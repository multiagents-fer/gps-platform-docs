---
title: Reportes de Cobranza
description: Reportes de rendimiento, eficiencia y seguimiento de promesas de pago
---

# Reportes de Cobranza

El modulo de reportes proporciona analisis detallados del rendimiento de la operacion de cobranza, permitiendo tomar decisiones basadas en datos.

## Tipos de Reportes

```mermaid
graph TB
    subgraph Reportes["Reportes Disponibles"]
        R1["Resumen Diario<br/>de Cobranza"]
        R2["Rendimiento<br/>de Cobradores"]
        R3["Eficiencia<br/>de Rutas"]
        R4["Seguimiento<br/>de Promesas"]
    end

    R1 --> EXP["Exportar<br/>CSV / Excel / PDF"]
    R2 --> EXP
    R3 --> EXP
    R4 --> EXP

    style R1 fill:#e3f2fd,stroke:#1976d2
    style R2 fill:#e8f5e9,stroke:#4caf50
    style R3 fill:#fff3e0,stroke:#f57c00
    style R4 fill:#f3e5f5,stroke:#7b1fa2
    style EXP fill:#f5f5f5,stroke:#9e9e9e
```

## Resumen Diario de Cobranza

Panorama completo de la actividad del dia:

### Metricas del Resumen

| Metrica | Descripcion |
|---------|------------|
| Total visitas programadas | Visitas asignadas en todas las agendas |
| Visitas completadas | Visitas con resultado registrado |
| Tasa de contacto | % de visitas donde se encontro al moroso |
| Monto cobrado | Total recuperado en el dia |
| Promesas obtenidas | Nuevas promesas de pago registradas |
| Monto en promesas | Valor total de las promesas |

### Distribucion de Resultados

```mermaid
pie title Resultados de Visitas del Dia
    "Cobro realizado" : 35
    "Promesa de pago" : 28
    "No encontrado" : 22
    "Rechazo" : 10
    "Domicilio cerrado" : 5
```

### Filtros del Reporte

- **Rango de fechas**: Dia, semana, mes, rango personalizado
- **Cobrador**: Individual o todos
- **Bucket**: B1 a B10
- **Zona**: Por cluster geografico

## Rendimiento de Cobradores

Evaluacion comparativa del desempeño de cada cobrador:

```mermaid
graph LR
    subgraph Metricas["KPIs por Cobrador"]
        V["Visitas<br/>Completadas"]
        C["Monto<br/>Cobrado"]
        P["Promesas<br/>Obtenidas"]
        T["Tasa de<br/>Contacto"]
        A["Adherencia<br/>a Ruta"]
    end

    style V fill:#e8f5e9,stroke:#4caf50
    style C fill:#e3f2fd,stroke:#1976d2
    style P fill:#fff3e0,stroke:#f57c00
    style T fill:#f3e5f5,stroke:#9c27b0
    style A fill:#e0f7fa,stroke:#0097a7
```

### Tabla Comparativa

| Cobrador | Visitas | Cobrado | Promesas | Tasa Contacto | Adherencia |
|----------|---------|---------|----------|---------------|------------|
| Juan Perez | 12/12 | $85,400 | 4 | 92% | 95% |
| Maria Lopez | 10/11 | $62,100 | 3 | 82% | 88% |
| Carlos Ruiz | 8/10 | $45,000 | 5 | 75% | 72% |

### Graficas Disponibles

- **Barras**: Monto cobrado por cobrador (diario, semanal, mensual)
- **Linea**: Tendencia de visitas completadas en el tiempo
- **Ranking**: Top cobradores por monto recuperado
- **Historico**: Evolucion del rendimiento por cobrador

## Eficiencia de Rutas

Analisis de que tan eficientes son las rutas generadas y ejecutadas:

```mermaid
graph TB
    subgraph Eficiencia["Metricas de Eficiencia"]
        KM["Km Planeados<br/>vs Km Reales"]
        TIEMPO["Tiempo Planeado<br/>vs Tiempo Real"]
        ORDEN["Orden Seguido<br/>vs Orden Sugerido"]
        COSTO["Costo por Visita<br/>combustible + tiempo"]
    end

    KM --> INDEX["Indice de<br/>Eficiencia Global"]
    TIEMPO --> INDEX
    ORDEN --> INDEX
    COSTO --> INDEX

    style INDEX fill:#e8f5e9,stroke:#4caf50
```

| Metrica | Descripcion | Meta |
|---------|------------|------|
| Km reales / Km planeados | Ratio de distancia real vs optimizada | < 1.2 |
| Tiempo por visita | Tiempo promedio en cada parada | 15-25 min |
| Visitas por hora | Productividad de visitas | > 2 |
| Costo por cobro | Costo operativo por cobro exitoso | Minimizar |

## Seguimiento de Promesas

Control de promesas de pago obtenidas en campo:

```mermaid
flowchart LR
    PROM["Promesa<br/>Registrada"] --> PEND["Pendiente<br/>de vencimiento"]
    PEND --> VENCE{Fecha de<br/>vencimiento}
    VENCE -->|Pago recibido| CUMPL["Cumplida"]
    VENCE -->|Sin pago| INCUMPL["Incumplida"]
    INCUMPL --> REPROG["Reprogramar<br/>visita"]

    style CUMPL fill:#e8f5e9,stroke:#4caf50
    style INCUMPL fill:#ffebee,stroke:#f44336
    style REPROG fill:#fff3e0,stroke:#f57c00
```

### Metricas de Promesas

| Metrica | Descripcion |
|---------|------------|
| Promesas activas | Promesas pendientes de vencimiento |
| Tasa de cumplimiento | % de promesas que se pagaron |
| Monto comprometido | Total en promesas activas |
| Promesas vencidas hoy | Que vencen hoy sin pago |
| Promedio dias a pago | Dias entre promesa y pago real |

### Vista de Promesas

La tabla de promesas muestra:

- **Moroso**: Nombre y numero de cuenta
- **Monto prometido**: Cantidad comprometida
- **Fecha de promesa**: Cuando se registro
- **Fecha de pago**: Cuando se comprometio a pagar
- **Estado**: Pendiente / Cumplida / Incumplida / Parcial
- **Cobrador**: Quien obtuvo la promesa

## Exportacion

Todos los reportes se pueden exportar en:

| Formato | Uso recomendado |
|---------|----------------|
| CSV | Analisis en Excel o Google Sheets |
| Excel (.xlsx) | Reporte formal con formato |
| PDF | Compartir con gerencia |

::: tip Automatizacion
Los reportes diarios se pueden programar para enviarse automaticamente por correo a las 8:00 PM cada dia.
:::

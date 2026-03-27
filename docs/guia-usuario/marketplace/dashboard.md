---
title: Dashboard Principal
description: Panel principal del Marketplace con KPIs, distribucion por fuente y actividad reciente
---

# Dashboard Principal

El dashboard principal del Marketplace presenta una vista consolidada de los **11,000+ vehiculos** con KPIs clave, distribucion por fuente y actividad reciente del sistema.

## KPIs Principales

```mermaid
graph LR
    subgraph KPIs["Indicadores Clave"]
        K1["Total Vehiculos<br/>11,247"]
        K2["Activos<br/>8,934"]
        K3["Vendidos (30d)<br/>1,156"]
        K4["Precio Promedio<br/>$285,400 MXN"]
    end

    style K1 fill:#e3f2fd,stroke:#1976d2
    style K2 fill:#e8f5e9,stroke:#4caf50
    style K3 fill:#fff3e0,stroke:#f57c00
    style K4 fill:#f3e5f5,stroke:#9c27b0
```

| KPI | Descripcion | Actualizacion |
|-----|------------|---------------|
| **Total Vehiculos** | Vehiculos unicos en la base de datos | Despues de cada scraping |
| **Activos** | Vehiculos actualmente a la venta | Tiempo real |
| **Vendidos (30d)** | Vehiculos que salieron del inventario en los ultimos 30 dias | Diario |
| **Precio Promedio** | Precio promedio de vehiculos activos | Tiempo real |

## Distribucion por Fuente

Grafica de barras horizontales mostrando cuantos vehiculos aporta cada fuente:

```mermaid
graph LR
    subgraph Fuentes["Top Fuentes por Volumen"]
        F1["Kavak — 3,247"]
        F2["Albacar — 1,832"]
        F3["Finakar — 1,418"]
        F4["Seminuevos — 1,205"]
        F5["CarGurus — 812"]
        F6["Otras 13 — 2,733"]
    end

    style F1 fill:#e3f2fd,stroke:#1976d2
    style F2 fill:#e8f5e9,stroke:#4caf50
    style F3 fill:#fff3e0,stroke:#f57c00
    style F4 fill:#f3e5f5,stroke:#9c27b0
    style F5 fill:#e0f7fa,stroke:#0097a7
    style F6 fill:#f5f5f5,stroke:#9e9e9e
```

### Metricas por Fuente

Cada fuente muestra en detalle:

| Metrica | Descripcion |
|---------|------------|
| Vehiculos activos | Cantidad actualmente publicada |
| Ultimo scraping | Fecha y hora del ultimo scraping exitoso |
| Vehiculos nuevos (24h) | Agregados en las ultimas 24 horas |
| Vehiculos removidos (24h) | Que desaparecieron del inventario |
| Precio promedio | Precio promedio de esa fuente |
| Tasa de scraping | Exito del ultimo scraping (%) |

## Distribucion por Marca

Grafica de pie o donut mostrando las marcas mas representadas:

```mermaid
pie title Top 8 Marcas en Inventario
    "Nissan" : 2100
    "Volkswagen" : 1850
    "Chevrolet" : 1600
    "Toyota" : 1200
    "Honda" : 890
    "Mazda" : 750
    "Hyundai" : 680
    "Otras" : 2177
```

## Actividad Reciente

Feed cronologico de eventos del sistema:

| Hora | Evento | Detalle |
|------|--------|---------|
| 14:32 | Scraping completado | Kavak — 3,247 vehiculos, 45 nuevos |
| 14:15 | Scraping completado | Albacar — 1,832 vehiculos, 12 nuevos |
| 13:50 | Reporte generado | "Analisis top selling Nissan Q1 2026" |
| 13:30 | Chat IA | Consulta: "Precio promedio Versa 2022 CDMX" |
| 12:00 | Scraping completado | Finakar — 1,418 vehiculos, 28 nuevos |

## Tendencias

### Grafica de Inventario (30 dias)

Linea de tiempo mostrando la evolucion del inventario total en los ultimos 30 dias:

- **Linea azul**: Vehiculos activos totales
- **Linea verde**: Nuevos agregados por dia
- **Linea roja**: Removidos (vendidos/deslistados) por dia

### Grafica de Precios (30 dias)

Evolucion del precio promedio general y por marca top:

- **Linea principal**: Precio promedio general
- **Lineas secundarias**: Top 5 marcas

## Filtros Globales

El dashboard permite aplicar filtros que afectan todas las secciones:

| Filtro | Opciones |
|--------|---------|
| Fuente | Seleccion multiple de las 18 fuentes |
| Marca | Todas las marcas disponibles |
| Rango de precio | Precio minimo y maximo |
| Ano | Rango de anos del modelo |
| Ubicacion | Estado o ciudad |
| Periodo | 7d, 30d, 90d, personalizado |

## Acciones Rapidas

Desde el dashboard el usuario puede:

- **Ir a Analytics** — Abrir cualquiera de las 6 paginas de analisis
- **Buscar vehiculo** — Busqueda rapida por marca, modelo o ID
- **Abrir Chat IA** — Hacer preguntas en lenguaje natural
- **Generar Reporte** — Crear un reporte rapido del estado actual
- **Ver Scraper Status** — Estado de los 18 scrapers

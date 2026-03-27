---
title: Analytics
description: 6 paginas de analytics del marketplace — Top Selling, Precios, Time to Sell, Price History, Sales History, Inventario
---

# Analytics

El modulo de analytics ofrece **6 paginas especializadas** de analisis del mercado automotriz, cada una con filtros avanzados y visualizaciones interactivas.

## Paginas de Analytics

```mermaid
graph TB
    subgraph Analytics["6 Paginas de Analytics"]
        TS["Top Selling<br/>Mas vendidos"]
        PR["Precios<br/>Analisis de precios"]
        TTS["Time to Sell<br/>Velocidad de venta"]
        PH["Price History<br/>Historial de precios"]
        SH["Sales History<br/>Historial de ventas"]
        INV["Inventario<br/>Stock actual"]
    end

    style TS fill:#e3f2fd,stroke:#1976d2
    style PR fill:#e8f5e9,stroke:#4caf50
    style TTS fill:#fff3e0,stroke:#f57c00
    style PH fill:#f3e5f5,stroke:#9c27b0
    style SH fill:#e0f7fa,stroke:#0097a7
    style INV fill:#f1f8e9,stroke:#689f38
```

## Filtros Comunes

Todas las paginas comparten un panel de filtros:

| Filtro | Descripcion | Opciones |
|--------|------------|---------|
| Fuente | Origen de los datos | 18 fuentes, seleccion multiple |
| Marca | Marca del vehiculo | Nissan, VW, Chevrolet, etc. |
| Modelo | Modelo especifico | Versa, Jetta, Aveo, etc. |
| Ano | Ano del modelo | 2015 - 2026 |
| Ubicacion | Estado o ciudad | 32 estados |
| Rango de precio | Precio min/max | Slider o input numerico |
| Periodo | Rango de fechas | 7d, 30d, 90d, 1y, custom |

## 1. Top Selling

Identifica los vehiculos con mayor rotacion en el mercado.

### Metricas

| Metrica | Descripcion |
|---------|------------|
| Marca/Modelo mas vendido | Combinacion con mayor numero de ventas |
| Unidades vendidas | Conteo de vehiculos que salieron del inventario |
| Tiempo promedio en inventario | Dias promedio antes de venderse |
| Precio promedio de venta | Precio al que se vendieron |

### Visualizaciones

- **Tabla ranking** de top 20 modelos mas vendidos
- **Grafica de barras** comparativa por marca
- **Heatmap** de ventas por marca y rango de precio
- **Tendencia** de ventas por semana/mes

## 2. Precios

Analisis detallado de precios del mercado.

```mermaid
graph LR
    subgraph Precios["Analisis de Precios"]
        AVG["Precio Promedio<br/>por marca/modelo"]
        RANGE["Rango de Precios<br/>min, max, mediana"]
        DIST["Distribucion<br/>histograma de precios"]
        COMP["Comparativa<br/>entre fuentes"]
    end

    style AVG fill:#e3f2fd,stroke:#1976d2
    style RANGE fill:#e8f5e9,stroke:#4caf50
    style DIST fill:#fff3e0,stroke:#f57c00
    style COMP fill:#f3e5f5,stroke:#9c27b0
```

### Visualizaciones

- **Box plot** de precios por marca (mediana, cuartiles, outliers)
- **Histograma** de distribucion de precios
- **Tabla comparativa** de precios entre fuentes para el mismo modelo
- **Scatter plot** precio vs ano del modelo

## 3. Time to Sell

Analiza la velocidad a la que se venden los vehiculos.

### Metricas

| Metrica | Descripcion |
|---------|------------|
| Dias promedio en inventario | Tiempo medio antes de venta |
| Mediana de tiempo | Tiempo mediano (menos afectado por outliers) |
| % vendidos en <7 dias | Proporcion de venta rapida |
| % vendidos en <30 dias | Proporcion de venta en primer mes |
| Vehiculos estancados | Mas de 90 dias sin venderse |

### Visualizaciones

- **Histograma** de distribucion de dias hasta la venta
- **Grafica de barras** por marca — tiempo promedio
- **Linea de tendencia** mensual del tiempo de venta
- **Tabla** de modelos con menor y mayor tiempo de venta

## 4. Price History

Seguimiento de la evolucion de precios en el tiempo.

```mermaid
graph TB
    subgraph PriceHistory["Historial de Precios"]
        SELECT["Seleccionar<br/>Marca + Modelo + Ano"]
        CHART["Grafica de linea<br/>Precio a lo largo del tiempo"]
        EVENTS["Eventos de mercado<br/>caidas, subidas"]
        PREDICT["Tendencia futura<br/>proyeccion"]
    end

    SELECT --> CHART
    CHART --> EVENTS
    CHART --> PREDICT

    style SELECT fill:#e3f2fd,stroke:#1976d2
    style CHART fill:#e8f5e9,stroke:#4caf50
    style PREDICT fill:#fff3e0,stroke:#f57c00
```

### Funcionalidades

- Seleccionar vehiculo especifico (marca + modelo + ano)
- Ver precio promedio por semana/mes
- Comparar hasta 4 vehiculos en la misma grafica
- Identificar tendencias de depreciacion
- Ver variacion entre fuentes para el mismo vehiculo

## 5. Sales History

Historial completo de ventas detectadas.

### Metricas

| Metrica | Descripcion |
|---------|------------|
| Ventas por periodo | Conteo de ventas por dia/semana/mes |
| Monto total vendido | Suma de precios de vehiculos vendidos |
| Ticket promedio | Precio promedio de venta |
| Variacion vs periodo anterior | Cambio porcentual |

### Visualizaciones

- **Grafica de area** de ventas acumuladas por mes
- **Barras apiladas** de ventas por fuente
- **Tabla detallada** de cada venta detectada
- **Comparativo** mes vs mes anterior

## 6. Inventario

Estado actual del stock de vehiculos en todas las fuentes.

```mermaid
graph TB
    subgraph Inventario["Vista de Inventario"]
        TOTAL["Total por Fuente<br/>Distribucion actual"]
        NUEVO["Recien Agregados<br/>Ultimas 24-48h"]
        ANTIGUO["Mayor Antiguedad<br/>Mas de 90 dias"]
        TREND["Tendencia<br/>Creciendo o decreciendo"]
    end

    style TOTAL fill:#e3f2fd,stroke:#1976d2
    style NUEVO fill:#e8f5e9,stroke:#4caf50
    style ANTIGUO fill:#ffebee,stroke:#f44336
    style TREND fill:#fff3e0,stroke:#f57c00
```

### Funcionalidades

- **Vista de tabla** con todos los vehiculos activos, paginada y con busqueda
- **Filtro por antiguedad** en inventario (recientes, >30d, >60d, >90d)
- **Detalle de vehiculo** con todas las fotos, especificaciones y historial de precio
- **Alertas** de vehiculos con precios inusuales (posibles errores de scraping)
- **Exportar** inventario filtrado a CSV/Excel

## Exportacion de Datos

Todas las paginas de analytics permiten exportar:

| Formato | Contenido |
|---------|-----------|
| CSV | Datos tabulares crudos |
| Excel | Tablas con formato y graficas embebidas |
| Imagen PNG | Captura de la grafica actual |

::: tip Filtros Persistentes
Los filtros seleccionados se mantienen al navegar entre paginas de analytics. Para limpiar todos los filtros, usa el boton "Limpiar Filtros".
:::

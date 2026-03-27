# ML Pipeline v5.1 — Optimización Inteligente de Rutas de Cobranza

## Descripción General

El **ML Pipeline v5.1** es un sistema de 5 etapas que transforma datos GPS crudos y registros de cartera vencida en rutas diarias optimizadas para 13 cobradores de campo. Procesa **794 morosos** (172 con datos GPS, 622 sin GPS) y genera itinerarios con ventanas de tiempo personalizadas.

## Arquitectura del Pipeline

```mermaid
flowchart LR
    subgraph Entrada["📥 Entrada"]
        GPS["Datos GPS\n172 clientes"]
        CART["Cartera Vencida\n794 morosos"]
    end

    subgraph Pipeline["⚙️ ML Pipeline v5.1"]
        direction LR
        S1["**Etapa 1**\nDetección de\nResidencia\n`DBSCAN + HDBSCAN`"]
        S2["**Etapa 2**\nPuntaje de\nPredecibilidad\n`4 componentes`"]
        S3["**Etapa 3**\nVentanas de\nTiempo\n`KDE + LightGBM`"]
        S4["**Etapa 4**\nPrioridad de\nCobranza\n`XGBoost`"]
        S5["**Etapa 5**\nOptimización\nde Rutas\n`OR-Tools VRPTW`"]
    end

    subgraph Salida["📤 Salida"]
        ROUTES["Rutas Diarias\n13 cobradores"]
    end

    GPS --> S1
    CART --> S1
    S1 --> S2
    S2 --> S3
    S3 --> S4
    S4 --> S5
    S5 --> ROUTES

    style S1 fill:#e3f2fd,stroke:#1565c0
    style S2 fill:#e8f5e9,stroke:#2e7d32
    style S3 fill:#fff3e0,stroke:#e65100
    style S4 fill:#fce4ec,stroke:#c62828
    style S5 fill:#f3e5f5,stroke:#6a1b9a
```

## Flujo Detallado por Etapa

```mermaid
flowchart TB
    subgraph S1["Etapa 1: Detección de Residencia"]
        S1A["DBSCAN eps=200m"] --> S1B["Stop Detection 150m"]
        S1B --> S1C["Filtro Nocturno 22-06h"]
        S1C --> S1D["Confidence Score 5 factores"]
    end

    subgraph S2["Etapa 2: Predictibilidad"]
        S2A["Varianza Ubicación 25%"]
        S2B["Consistencia Horario 30%"]
        S2C["Repetición Rutas 25%"]
        S2D["Estabilidad Presencia 20%"]
    end

    subgraph S3["Etapa 3: Ventanas de Tiempo"]
        S3A["GPS: LightGBM + KDE"]
        S3B["No-GPS: Heurísticas"]
    end

    subgraph S4["Etapa 4: Prioridad"]
        S4A["XGBoost Clasificador"]
        S4B["Puntaje Compuesto"]
    end

    subgraph S5["Etapa 5: Rutas"]
        S5A["VRPTW OR-Tools"]
        S5B["13 Cobradores"]
    end

    S1 --> S2 --> S3 --> S4 --> S5
```

## Dependencias y Versiones

| Biblioteca | Versión | Uso Principal |
|---|---|---|
| `scikit-learn` | 1.4 | DBSCAN, K-Means, preprocesamiento |
| `hdbscan` | 0.8.39 | Clustering jerárquico (fallback) |
| `xgboost` | 2.0.3 | Modelo de prioridad de cobranza |
| `lightgbm` | 4.3 | Predicción de ventanas de tiempo |
| `ortools` | 9.8 | Optimización VRPTW de rutas |
| `numpy` | 1.26+ | Operaciones numéricas |
| `pandas` | 2.1+ | Manipulación de datos |
| `scipy` | 1.12+ | KDE, estadísticas, Weiszfeld |

## Datos de Entrada

| Concepto | Valor |
|---|---|
| Total morosos en cartera | **794** |
| Morosos con datos GPS | **172** (21.7%) |
| Morosos sin datos GPS | **622** (78.3%) |
| Cobradores disponibles | **13** |
| Municipios cubiertos | **36** (NL, Coahuila, Tamaulipas) |

## Datos de Salida

| Concepto | Valor |
|---|---|
| Residencias detectadas | **165 / 172** (96%) |
| Confianza alta | **87** (52.7%) |
| Confianza media | **78** (47.3%) |
| Confianza baja | **0** (0%) |
| Ventanas MAÑANA | **162** |
| Ventanas TARDE | **91** |
| Ventanas NOCHE | **102** |
| Rutas diarias generadas | **13** (1 por cobrador) |
| Máx. visitas por cobrador | **20** por jornada |
| Jornada laboral | **08:00 – 18:00** |

## Métricas Clave de Rendimiento

```mermaid
pie title Distribución de Confianza de Residencia
    "Alta (>=0.65)" : 87
    "Media (0.35-0.64)" : 78
    "Baja (<0.35)" : 0
```

```mermaid
pie title Ventanas de Tiempo Detectadas
    "MAÑANA" : 162
    "TARDE" : 91
    "NOCHE" : 102
```

## Navegación del Pipeline

| Etapa | Documento | Descripción |
|---|---|---|
| 1 | [Detección de Residencia](./residencia) | DBSCAN, HDBSCAN, Confidence Score |
| 2 | [Predictibilidad](./predictibilidad) | Puntaje de 4 componentes |
| 3 | [Ventanas de Tiempo](./ventanas) | KDE + LightGBM |
| 4 | [Prioridad de Cobranza](./prioridad) | XGBoost + reglas compuestas |
| 5 | [Optimización de Rutas](./rutas) | OR-Tools VRPTW |
| Ref | [Configuración Completa](./configuracion) | Todos los parámetros |
| Ref | [Detección de Cambios](./cambios) | Cambios de comportamiento |

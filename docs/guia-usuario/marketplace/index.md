---
title: Marketplace Dashboard
description: Dashboard de analytics automotriz con 11,000+ vehiculos de 18 fuentes y agentes de IA
---

# Marketplace Dashboard

El **Marketplace Dashboard** es una plataforma de analytics automotriz construida en Angular 18 que consolida datos de **11,000+ vehiculos** de **18 fuentes** de scraping, con inteligencia artificial integrada para analisis, valuacion y generacion de reportes.

## Arquitectura del Marketplace

```mermaid
graph TB
    subgraph Sources["18 Fuentes de Datos"]
        S1["Kavak"]
        S2["Albacar"]
        S3["Finakar"]
        S4["Seminuevos.com"]
        SN["+ 14 fuentes mas"]
    end

    subgraph Scrapers["Scrapy + Playwright"]
        SC["18 Spiders<br/>Scraping periodico"]
        NORM["Normalizacion<br/>Pipeline de datos"]
    end

    subgraph Backend["API NestJS"]
        API["REST API"]
        AGENTS["7 Agentes IA<br/>Claude API"]
        WS["WebSockets"]
    end

    subgraph Dashboard["Angular 18 Dashboard"]
        MAIN["Dashboard Principal"]
        ANALYTICS["6 Paginas de Analytics"]
        VAL["Valuacion con IA"]
        CHAT["Chat IA"]
        REPORT["Report Builder"]
        SCRGEN["Scraper Generator"]
    end

    subgraph Data["Base de Datos"]
        PG["PostgreSQL 16<br/>11,000+ vehiculos"]
        S3DB["S3<br/>Imagenes + Reportes"]
    end

    Sources --> Scrapers
    Scrapers --> Data
    Dashboard --> Backend
    Backend --> Data
    Backend --> AGENTS

    style Dashboard fill:#e3f2fd,stroke:#1976d2
    style AGENTS fill:#fff3e0,stroke:#f57c00
```

## Modulos del Dashboard

```mermaid
graph TB
    HOME["Dashboard Principal<br/>KPIs + Resumen"] --> AN["Analytics<br/>6 paginas de analisis"]
    HOME --> VAL["Valuacion<br/>IA + Mercado"]
    HOME --> CHAT["Chat IA<br/>Consultas en lenguaje natural"]
    HOME --> REP["Report Builder<br/>Reportes con IA"]
    HOME --> SCR["Scraper Generator<br/>Crear spiders con IA"]

    AN --> AN1["Top Selling"]
    AN --> AN2["Precios"]
    AN --> AN3["Time to Sell"]
    AN --> AN4["Historial de Precios"]
    AN --> AN5["Historial de Ventas"]
    AN --> AN6["Inventario"]

    VAL --> VAL1["Valuacion de Mercado"]
    VAL --> VAL2["Oportunidades"]
    VAL --> VAL3["Resumen de Flota"]
    VAL --> VAL4["Comparador"]

    style HOME fill:#e3f2fd,stroke:#1976d2
    style AN fill:#e8f5e9,stroke:#4caf50
    style VAL fill:#fff3e0,stroke:#f57c00
    style CHAT fill:#f3e5f5,stroke:#9c27b0
    style REP fill:#e0f7fa,stroke:#0097a7
    style SCR fill:#fce4ec,stroke:#c2185b
```

## Navegacion

| Seccion | Funcion | Enlace |
|---------|---------|--------|
| Dashboard Principal | KPIs y resumen general | [Dashboard](./dashboard) |
| Analytics | 6 paginas de analisis de mercado | [Analytics](./analytics) |
| Valuacion | Valuacion con IA y oportunidades | [Valuacion](./valuacion) |
| Chat IA | Consultas en lenguaje natural | [Chat IA](./chat-ai) |
| Report Builder | Generacion de reportes con IA | [Reportes](./reportes) |
| Scraper Generator | Crear nuevos spiders con IA | [Scraper Generator](./scraper-generator) |

## Fuentes de Datos

Los datos provienen de 18 fuentes de scraping que se ejecutan periodicamente:

| Fuente | Tipo | Frecuencia | Vehiculos Aprox. |
|--------|------|-----------|-----------------|
| Kavak | Marketplace | Diario | 3,200+ |
| Albacar | Financiera | Diario | 1,800+ |
| Finakar | Financiera | Diario | 1,400+ |
| Seminuevos.com | Clasificados | Diario | 1,200+ |
| CarGurus MX | Marketplace | Semanal | 800+ |
| AutoCosmos | Clasificados | Semanal | 600+ |
| + 12 fuentes | Varios | Variable | 2,000+ |

## 7 Agentes de IA

El marketplace integra 7 agentes de inteligencia artificial potenciados por Claude:

```mermaid
graph LR
    subgraph Agents["Agentes de IA"]
        A1["Depreciation Agent<br/>Calculo de depreciacion"]
        A2["Marketplace Analytics<br/>Analisis de mercado"]
        A3["Report Builder<br/>Generacion de reportes"]
        A4["Chat Agent<br/>Consultas en lenguaje natural"]
        A5["Scraper Generator<br/>Crear spiders"]
        A6["Report Optimizer<br/>Optimizar reportes"]
        A7["Market Discovery<br/>Detectar oportunidades"]
    end

    style A1 fill:#e3f2fd,stroke:#1976d2
    style A2 fill:#e8f5e9,stroke:#4caf50
    style A3 fill:#fff3e0,stroke:#f57c00
    style A4 fill:#f3e5f5,stroke:#9c27b0
    style A5 fill:#e0f7fa,stroke:#0097a7
    style A6 fill:#fce4ec,stroke:#c2185b
    style A7 fill:#f1f8e9,stroke:#689f38
```

## Tecnologias

| Tecnologia | Uso |
|-----------|-----|
| Angular 18 | Frontend SPA |
| NestJS | API Backend |
| PostgreSQL 16 | Base de datos principal |
| Scrapy + Playwright | Web scraping |
| Claude API | 7 agentes de IA |
| Chart.js / ngx-charts | Graficas y visualizaciones |
| WebSockets | Actualizaciones en tiempo real |
| S3 | Almacenamiento de imagenes y reportes |

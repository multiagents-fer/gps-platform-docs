---
title: Cobranza Inteligente
description: Sistema de cobranza con ML para optimizacion de rutas y gestion de cartera morosa
---

# Cobranza Inteligente

El sistema de **Cobranza Inteligente** de AgentsMX gestiona **794 cuentas morosas** distribuidas entre **17 cobradores** en campo, utilizando machine learning para optimizar rutas y priorizar visitas.

## Que es Cobranza Inteligente

Es un sistema dual compuesto por un **Dashboard de Supervisor** y una **PWA para Cobradores** que trabajan en conjunto para maximizar la recuperacion de cartera vencida.

### Arquitectura Dual

```mermaid
graph TB
    subgraph Supervisor["Dashboard Supervisor — Angular 18"]
        DASH["Panel de Control<br/>KPIs en tiempo real"]
        AGENDA["Generador de Agendas<br/>ML + OR-Tools"]
        MON["Monitoreo en Vivo<br/>GPS + WebSockets"]
        REP["Reportes<br/>Rendimiento + Eficiencia"]
        CART["Cartera Morosa<br/>Gestion de cuentas"]
    end

    subgraph Cobrador["PWA Cobrador — Mobile"]
        LOGIN["Login"]
        RUTA["Ruta del Dia"]
        VISITA["Registro de Visita"]
        FOTO["Captura de Fotos"]
    end

    subgraph Backend["Backend"]
        API["API NestJS"]
        ML["ML Pipeline v5.1"]
        OR["OR-Tools<br/>Optimizacion de rutas"]
        GPS["GPS Service<br/>Posiciones en tiempo real"]
    end

    subgraph Data["Datos"]
        PG["PostgreSQL"]
        TS["TimescaleDB<br/>Posiciones GPS"]
    end

    Supervisor --> API
    Cobrador --> API
    API --> ML
    API --> OR
    API --> GPS
    API --> PG
    GPS --> TS
```

## Flujo General del Sistema

```mermaid
sequenceDiagram
    participant S as Supervisor
    participant D as Dashboard
    participant ML as ML Pipeline
    participant OR as OR-Tools
    participant C as Cobrador (PWA)

    S->>D: Carga cartera morosa (Excel)
    D->>D: Clasifica en buckets B1-B10
    S->>D: Click "Generar Paquetes"
    D->>ML: Solicita clustering + scoring
    ML->>ML: HDBSCAN clustering geografico
    ML->>ML: XGBoost scoring de clientes
    ML-->>D: Clusters con scores
    D-->>S: Preview de paquetes
    S->>D: Asigna paquetes a cobradores
    D->>OR: Genera rutas optimizadas
    OR-->>D: Rutas con orden optimo
    D-->>C: Agenda del dia disponible
    C->>C: Sigue ruta parada por parada
    C->>D: Reporta resultado de visita
    S->>D: Monitorea progreso en tiempo real
```

## Componentes Principales

| Componente | Funcion | Seccion |
|-----------|---------|---------|
| Dashboard Supervisor | Panel central de control y gestion | [Dashboard](./dashboard) |
| Generador de Agendas | Creacion de paquetes con ML | [Agendas](./agendas) |
| Monitoreo en Vivo | Tracking GPS de cobradores | [Monitoreo](./monitoreo) |
| Reportes | Analisis de rendimiento | [Reportes](./reportes) |
| PWA Cobrador | App movil para campo | [PWA Cobrador](./pwa-cobrador) |
| Cartera Morosa | Gestion de cuentas morosas | [Cartera Morosa](./cartera-morosa) |

## Datos Clave

- **794** cuentas morosas activas
- **17** cobradores en campo
- **10** buckets de clasificacion (B1 = 1-30 dias, B10 = 270+ dias)
- **5** etapas del ML Pipeline (clustering, KDE, scoring, asignacion, ruteo)
- Rutas optimizadas con **ventanas de tiempo** y **restricciones de distancia**
- Monitoreo GPS **en tiempo real** via WebSockets

## Tecnologias Utilizadas

| Tecnologia | Uso |
|-----------|-----|
| Angular 18 | Dashboard supervisor |
| PWA + Service Workers | App cobrador (offline-first) |
| NestJS | API backend |
| PostgreSQL | Datos de cartera y cobradores |
| TimescaleDB | Posiciones GPS historicas |
| HDBSCAN / K-Means | Clustering geografico |
| XGBoost | Scoring de probabilidad de pago |
| OR-Tools | Optimizacion de rutas TSP/VRP |
| WebSockets | Actualizaciones en tiempo real |

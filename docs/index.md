---
layout: home
hero:
  name: "AgentsMX Docs"
  text: "Plataforma Automotriz Inteligente"
  tagline: "Documentacion completa del ecosistema — 17 repositorios, 7 agentes IA, ML Pipeline v5.1"
  actions:
    - theme: brand
      text: Guia de Usuario
      link: /guia-usuario/cobranza/
    - theme: alt
      text: ML Pipeline
      link: /ml-pipeline/
    - theme: alt
      text: AI Agents
      link: /ai-agents/
features:
  - icon: "\U0001F3AF"
    title: Cobranza Inteligente
    details: ML Pipeline de 5 etapas — HDBSCAN, KDE, XGBoost, OR-Tools — para optimizar rutas de cobranza de 794 morosos con 17 cobradores
  - icon: "\U0001F697"
    title: Marketplace Automotriz
    details: 11,000+ vehiculos de 18 fuentes, analytics en tiempo real, 7 agentes IA con Claude, valuacion automatica
  - icon: "\U0001F4E1"
    title: GPS Tracking
    details: 4,000+ vehiculos rastreados via SeeWorld/WhatsGPS, TimescaleDB, deteccion de residencias, patrones de comportamiento
  - icon: "\U0001F916"
    title: 7 Agentes de IA
    details: Depreciation, Marketplace Analytics, Report Builder, Chat, Scraper Generator, Report Optimizer, Market Discovery
  - icon: "\u2601\uFE0F"
    title: Infraestructura AWS
    details: Terraform IaC, VPC, ALB, ASG, RDS PostgreSQL, CloudFront, S3, ECR, CI/CD con GitHub Actions
  - icon: "\U0001F577\uFE0F"
    title: 18 Scrapers
    details: Scrapy + Playwright scraping kavak, albacar, finakar y 15 fuentes mas, normalizacion y pipeline de datos
---

## Ecosistema AgentsMX

AgentsMX es una plataforma automotriz completa que integra **inteligencia artificial**, **machine learning** y **datos en tiempo real** para transformar la operacion de negocios automotrices en Mexico.

### Arquitectura General

```mermaid
graph TB
    subgraph Frontend["Aplicaciones Frontend"]
        MP["Marketplace Dashboard<br/>Angular 18"]
        COB["Cobranza Dashboard<br/>Angular 18"]
        PWA["PWA Cobrador<br/>Mobile App"]
    end

    subgraph Backend["Servicios Backend"]
        API["API NestJS<br/>REST + WebSockets"]
        ML["ML Pipeline v5.1<br/>Python"]
        AGENTS["7 Agentes IA<br/>Claude API"]
    end

    subgraph Data["Capa de Datos"]
        PG["PostgreSQL 16<br/>11K+ vehiculos"]
        TS["TimescaleDB<br/>GPS 4K+ vehiculos"]
        S3["S3 Storage<br/>Imagenes + Reportes"]
    end

    subgraph Scrapers["Ingesta de Datos"]
        SC["18 Scrapers<br/>Scrapy + Playwright"]
        GPS["GPS Providers<br/>SeeWorld / WhatsGPS"]
    end

    Frontend --> Backend
    Backend --> Data
    Scrapers --> Data
```

### Numeros Clave

| Metrica | Valor |
|---------|-------|
| Repositorios | 17 |
| Vehiculos en base de datos | 11,000+ |
| Fuentes de scraping | 18 |
| Vehiculos con GPS | 4,000+ |
| Agentes de IA | 7 |
| Morosos gestionados | 794 |
| Cobradores en campo | 17 |

### Navegacion Rapida

- **Guia de Usuario** — Manuales paso a paso para operadores y supervisores
- **ML Pipeline** — Documentacion tecnica del pipeline de machine learning
- **AI Agents** — Referencia de los 7 agentes de inteligencia artificial
- **Infraestructura** — Arquitectura AWS y despliegue
- **GPS & Scrapers** — Sistemas de rastreo e ingesta de datos

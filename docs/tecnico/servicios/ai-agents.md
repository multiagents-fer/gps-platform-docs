# AI Agents Service

`proj-back-ai-agents` - Servicio de 7 agentes de inteligencia artificial con arquitectura hexagonal.

## Información General

| Propiedad | Valor |
|-----------|-------|
| Repositorio | `proj-back-ai-agents` |
| Framework | Flask |
| Puerto | 5001 |
| Base de datos | cobranza_db (PostgreSQL :5432) |
| LLMs | OpenAI GPT-4, Claude 3.5 Sonnet |
| Arquitectura | Hexagonal estricta |

## Los 7 Agentes

```mermaid
graph TB
    subgraph Agentes IA
        A1[Agente Negocio\nAnálisis financiero]
        A2[Agente PO\nProduct Owner IA]
        A3[Agente UX\nDiseño de interfaces]
        A4[Agente Diagnóstico\nOBD-II analyzer]
        A5[Agente Valuación\nPrecio de mercado]
        A6[Agente Ruta\nOptimización geográfica]
        A7[Agente Cobranza\nEstrategias de cobro]
    end

    subgraph Servicios Compartidos
        LLM[LLM Gateway\nOpenAI / Claude]
        DB[(PostgreSQL)]
        CACHE[(Redis)]
    end

    A1 --> LLM
    A2 --> LLM
    A3 --> LLM
    A4 --> DB
    A5 --> DB
    A6 --> DB
    A7 --> LLM
    A7 --> CACHE
```

## Tabla de Agentes

| # | Agente | Modelo | Entrada | Salida | Uso |
|---|--------|--------|---------|--------|-----|
| 1 | Negocio | Claude 3.5 | Métricas, KPIs | Análisis, recomendaciones | Reportes ejecutivos |
| 2 | Product Owner | Claude 3.5 | Ideas, feedback | User stories, épicas | Gestión de producto |
| 3 | UX | Claude 3.5 | Requerimientos | Wireframes, flujos | Diseño de interfaces |
| 4 | Diagnóstico | GPT-4 | Datos OBD-II | Evaluación mecánica | Inspección vehicular |
| 5 | Valuación | GPT-4 | Datos vehículo + mercado | Precio estimado | Valor de mercado |
| 6 | Ruta | Algoritmo local | Coordenadas, prioridades | Ruta optimizada | Rutas de cobranza |
| 7 | Cobranza | Claude 3.5 | Perfil deudor | Estrategia de cobro | Guiones de cobranza |

## Arquitectura Hexagonal

```mermaid
graph TB
    subgraph Adaptadores Entrada
        HTTP[Flask Routes]
        INTERNAL[Internal API]
    end

    subgraph Puertos Entrada
        P1[AnalyzePort]
        P2[ValuatePort]
        P3[DiagnosePort]
        P4[OptimizeRoutePort]
    end

    subgraph Dominio
        D1[AgentOrchestrator]
        D2[PromptBuilder]
        D3[ResponseParser]
        D4[DomainRules]
    end

    subgraph Puertos Salida
        P5[LLMPort]
        P6[VehicleDataPort]
        P7[MarketDataPort]
        P8[PersistencePort]
    end

    subgraph Adaptadores Salida
        AD1[OpenAI Adapter]
        AD2[Claude Adapter]
        AD3[PostgreSQL Adapter]
        AD4[Scrapper Data Adapter]
    end

    HTTP --> P1
    HTTP --> P2
    INTERNAL --> P3
    INTERNAL --> P4

    P1 --> D1
    P2 --> D1
    P3 --> D1
    P4 --> D1

    D1 --> D2 --> P5
    D1 --> D3
    D1 --> D4
    D1 --> P6
    D1 --> P7
    D1 --> P8

    P5 --> AD1
    P5 --> AD2
    P6 --> AD3
    P7 --> AD4
    P8 --> AD3
```

## Endpoints

| Método | Ruta | Agente | Descripción |
|--------|------|--------|-------------|
| POST | `/api/v1/agents/business/analyze` | Negocio | Análisis de negocio |
| POST | `/api/v1/agents/po/stories` | PO | Generar user stories |
| POST | `/api/v1/agents/ux/wireframe` | UX | Generar wireframe |
| POST | `/api/v1/agents/diagnostic/evaluate` | Diagnóstico | Evaluar diagnóstico |
| POST | `/api/v1/agents/valuation/estimate` | Valuación | Estimar precio |
| POST | `/api/v1/agents/route/optimize` | Ruta | Optimizar ruta |
| POST | `/api/v1/agents/collection/strategy` | Cobranza | Estrategia de cobro |
| GET | `/api/v1/agents/status` | Todos | Estado de agentes |

## Flujo de Procesamiento

```mermaid
sequenceDiagram
    participant API as Cobranza API :8000
    participant AG as Agent Service :5001
    participant ORCH as Orchestrator
    participant PROMPT as PromptBuilder
    participant LLM as LLM Gateway
    participant PARSER as ResponseParser
    participant DB as PostgreSQL

    API->>AG: POST /agents/diagnostic/evaluate
    AG->>ORCH: execute(DiagnosticAgent, data)
    ORCH->>DB: Fetch vehicle + scan data
    DB-->>ORCH: Raw data
    ORCH->>PROMPT: build_prompt(template, data)
    PROMPT-->>ORCH: Formatted prompt
    ORCH->>LLM: complete(prompt, model="gpt-4")
    LLM-->>ORCH: LLM response
    ORCH->>PARSER: parse(response, schema)
    PARSER-->>ORCH: Structured result
    ORCH->>DB: Save evaluation
    ORCH-->>AG: AgentResponse
    AG-->>API: JSON response
```

## Estructura de Directorios

```
proj-back-ai-agents/
├── app/
│   ├── domain/
│   │   ├── agents/
│   │   │   ├── business_agent.py
│   │   │   ├── diagnostic_agent.py
│   │   │   ├── valuation_agent.py
│   │   │   └── ...
│   │   ├── entities/
│   │   ├── value_objects/
│   │   └── services/
│   ├── application/
│   │   ├── ports/
│   │   │   ├── input/
│   │   │   └── output/
│   │   └── use_cases/
│   ├── infrastructure/
│   │   ├── adapters/
│   │   │   ├── openai_adapter.py
│   │   │   ├── claude_adapter.py
│   │   │   └── postgres_adapter.py
│   │   └── config/
│   └── interfaces/
│       └── http/
│           └── routes/
├── tests/
├── requirements.txt
└── Dockerfile
```

## Variables de Entorno

```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/cobranza_db
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
DEFAULT_LLM_MODEL=claude-3-5-sonnet-20241022
FLASK_PORT=5001
LOG_LEVEL=INFO
```

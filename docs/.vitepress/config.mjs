import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

export default withMermaid(defineConfig({
  lang: 'es-MX',
  title: 'AgentsMX Docs',
  description: 'Documentacion completa del ecosistema AgentsMX — Plataforma automotriz inteligente',
  head: [
    ['link', { rel: 'icon', href: '/favicon.svg' }],
    ['meta', { name: 'theme-color', content: '#3b82f6' }],
    ['meta', { property: 'og:title', content: 'AgentsMX Docs' }],
    ['meta', { property: 'og:description', content: 'Documentacion tecnica y manuales de usuario del ecosistema AgentsMX' }],
  ],

  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'AgentsMX Docs',

    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: 'Buscar', buttonAriaLabel: 'Buscar' },
          modal: {
            noResultsText: 'Sin resultados para',
            resetButtonTitle: 'Limpiar busqueda',
            footer: { selectText: 'Seleccionar', navigateText: 'Navegar', closeText: 'Cerrar' }
          }
        }
      }
    },

    nav: [
      { text: 'Inicio', link: '/' },
      {
        text: 'Guia de Usuario',
        items: [
          { text: 'Manual PWA Cobrador', link: '/guia-usuario/manual-pwa' },
          { text: 'Manual Supervisor', link: '/guia-usuario/manual-supervisor' },
          { text: 'Cobranza Inteligente', link: '/guia-usuario/cobranza/' },
          { text: 'Marketplace Dashboard', link: '/guia-usuario/marketplace/' },
        ]
      },
      {
        text: 'Tecnico',
        items: [
          { text: 'Arquitectura', link: '/tecnico/arquitectura/' },
          { text: 'Servicios', link: '/tecnico/servicios/' },
          { text: 'Base de Datos', link: '/tecnico/base-datos/' },
        ]
      },
      { text: 'ML Pipeline', link: '/ml-pipeline/' },
      { text: 'AI Agents', link: '/ai-agents/' },
      { text: 'Infraestructura', link: '/infraestructura/' },
    ],

    sidebar: {
      '/guia-usuario/manual-': [
        {
          text: 'Guia de Usuario',
          items: [
            { text: 'Introduccion', link: '/guia-usuario/' },
            { text: 'Manual PWA Cobrador', link: '/guia-usuario/manual-pwa' },
            { text: 'Manual Supervisor', link: '/guia-usuario/manual-supervisor' },
          ]
        }
      ],
      '/guia-usuario/cobranza/': [
        {
          text: 'Cobranza Inteligente',
          items: [
            { text: 'Introduccion', link: '/guia-usuario/cobranza/' },
            { text: 'Dashboard Supervisor', link: '/guia-usuario/cobranza/dashboard' },
            { text: 'Generacion de Agendas', link: '/guia-usuario/cobranza/agendas' },
            { text: 'Monitoreo en Vivo', link: '/guia-usuario/cobranza/monitoreo' },
            { text: 'Reportes y Metricas', link: '/guia-usuario/cobranza/reportes' },
            { text: 'App Cobrador (PWA)', link: '/guia-usuario/cobranza/pwa-cobrador' },
            { text: 'Cartera Morosa', link: '/guia-usuario/cobranza/cartera-morosa' },
            { text: 'Estrategia y Reglas', link: '/guia-usuario/cobranza/estrategia-reglas' },
          ]
        }
      ],
      '/guia-usuario/marketplace/': [
        {
          text: 'Marketplace Dashboard',
          items: [
            { text: 'Introduccion', link: '/guia-usuario/marketplace/' },
            { text: 'Dashboard Principal', link: '/guia-usuario/marketplace/dashboard' },
            { text: 'Analytics', link: '/guia-usuario/marketplace/analytics' },
            { text: 'Valuacion de Vehiculos', link: '/guia-usuario/marketplace/valuacion' },
            { text: 'Chat AI', link: '/guia-usuario/marketplace/chat-ai' },
            { text: 'Reportes', link: '/guia-usuario/marketplace/reportes' },
            { text: 'Generador de Scrapers', link: '/guia-usuario/marketplace/scraper-generator' },
          ]
        }
      ],
      '/tecnico/': [
        {
          text: 'Arquitectura',
          items: [
            { text: 'Vision General', link: '/tecnico/arquitectura/' },
            { text: 'Mapa de Repositorios', link: '/tecnico/arquitectura/repositorios' },
            { text: 'Flujo de Datos', link: '/tecnico/arquitectura/flujo-datos' },
            { text: 'Patrones y Convenciones', link: '/tecnico/arquitectura/patrones' },
          ]
        },
        {
          text: 'Servicios Backend',
          items: [
            { text: 'Resumen', link: '/tecnico/servicios/' },
            { text: 'proj-back-cob-ia', link: '/tecnico/servicios/cob-ia' },
            { text: 'proj-back-ai-agents', link: '/tecnico/servicios/ai-agents' },
            { text: 'proj-back-driver-adapters', link: '/tecnico/servicios/driver-adapters' },
            { text: 'proj-api-gps-data', link: '/tecnico/servicios/gps-api' },
            { text: 'proj-back-marketplace-dashboard', link: '/tecnico/servicios/marketplace-api' },
          ]
        },
        {
          text: 'Base de Datos',
          items: [
            { text: 'Resumen de Schemas', link: '/tecnico/base-datos/' },
            { text: 'Marketplace Microservices', link: '/tecnico/base-datos/marketplace-microservices' },
            { text: 'GPS Data (TimescaleDB)', link: '/tecnico/base-datos/gps-data' },
            { text: 'Cobranza', link: '/tecnico/base-datos/cobranza' },
            { text: 'Scrapper Nacional', link: '/tecnico/base-datos/scrapper-nacional' },
            { text: 'Diagnosticos', link: '/tecnico/base-datos/diagnosticos' },
          ]
        },
      ],
      '/ml-pipeline/': [
        {
          text: 'ML Pipeline v5.1',
          items: [
            { text: 'Vision General', link: '/ml-pipeline/' },
            { text: 'Stage 1: Deteccion de Residencia', link: '/ml-pipeline/residencia' },
            { text: 'Stage 2: Predictibilidad', link: '/ml-pipeline/predictibilidad' },
            { text: 'Stage 3: Ventanas de Tiempo', link: '/ml-pipeline/ventanas' },
            { text: 'Stage 4: Prioridad de Cobranza', link: '/ml-pipeline/prioridad' },
            { text: 'Stage 5: Optimizacion de Rutas', link: '/ml-pipeline/rutas' },
            { text: 'Rutas — Referencia Completa', link: '/ml-pipeline/rutas-detalle' },
            { text: 'Configuracion y Pesos', link: '/ml-pipeline/configuracion' },
            { text: 'Deteccion de Cambios', link: '/ml-pipeline/cambios' },
          ]
        }
      ],
      '/ai-agents/': [
        {
          text: '7 Agentes de IA',
          items: [
            { text: 'Vision General', link: '/ai-agents/' },
            { text: 'Depreciation Agent', link: '/ai-agents/depreciation' },
            { text: 'Marketplace Analytics', link: '/ai-agents/marketplace-analytics' },
            { text: 'Report Builder', link: '/ai-agents/report-builder' },
            { text: 'Chat Agent', link: '/ai-agents/chat' },
            { text: 'Scraper Generator', link: '/ai-agents/scraper-generator' },
            { text: 'Report Optimizer', link: '/ai-agents/report-optimizer' },
            { text: 'Market Discovery', link: '/ai-agents/market-discovery' },
          ]
        }
      ],
      '/gps-scrapers/': [
        {
          text: 'GPS y Scrapers',
          items: [
            { text: 'Vision General', link: '/gps-scrapers/' },
            { text: 'Driver Adapters', link: '/gps-scrapers/driver-adapters' },
            { text: 'GPS Sync Worker', link: '/gps-scrapers/gps-sync' },
            { text: 'Scrapper Nacional', link: '/gps-scrapers/scrapper-nacional' },
            { text: 'Scrapper MTY', link: '/gps-scrapers/scrapper-mty' },
            { text: 'Diagnostic Sync', link: '/gps-scrapers/diagnostic-sync' },
            { text: 'Marketplace Sync', link: '/gps-scrapers/marketplace-sync' },
          ]
        }
      ],
      '/infraestructura/': [
        {
          text: 'Infraestructura',
          items: [
            { text: 'Vision General', link: '/infraestructura/' },
            { text: 'AWS con Terraform', link: '/infraestructura/terraform' },
            { text: 'Red y Seguridad', link: '/infraestructura/red' },
            { text: 'CI/CD con GitHub Actions', link: '/infraestructura/cicd' },
            { text: 'Monitoreo (Grafana)', link: '/infraestructura/monitoreo' },
            { text: 'Costos y Escalamiento', link: '/infraestructura/costos' },
          ]
        }
      ],
      '/desarrollo/': [
        {
          text: 'Guia de Desarrollo',
          items: [
            { text: 'Estandares de Codigo', link: '/desarrollo/' },
            { text: 'Arquitectura Hexagonal', link: '/desarrollo/hexagonal' },
            { text: 'Testing (TDD)', link: '/desarrollo/testing' },
            { text: 'Setup Local', link: '/desarrollo/setup' },
          ]
        }
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/multiagents-fer' }
    ],

    footer: {
      message: 'Documentacion interna del ecosistema AgentsMX',
      copyright: 'Copyright 2024-2026 AgentsMX'
    },

    editLink: {
      pattern: 'https://github.com/multiagents-fer/gps-platform-docs/edit/main/docs/:path',
      text: 'Editar esta pagina en GitHub'
    },

    lastUpdated: {
      text: 'Ultima actualizacion',
    },

    outline: {
      label: 'En esta pagina',
      level: [2, 3]
    },

    docFooter: {
      prev: 'Anterior',
      next: 'Siguiente'
    },

    darkModeSwitchLabel: 'Tema',
    returnToTopLabel: 'Volver arriba',
    sidebarMenuLabel: 'Menu',
  },

  mermaid: {
    theme: 'base',
    themeVariables: {
      primaryColor: '#eff6ff',
      primaryBorderColor: '#3b82f6',
      primaryTextColor: '#1e3a5f',
      secondaryColor: '#ecfdf5',
      secondaryBorderColor: '#10b981',
      tertiaryColor: '#fef3c7',
      tertiaryBorderColor: '#f59e0b',
      lineColor: '#64748b',
      fontSize: '14px',
    },
  },
}))

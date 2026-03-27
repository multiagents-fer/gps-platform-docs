# Scrapper Nacional

`proj-scrapper-nacional` - 18 spiders de Scrapy para extracción de datos de vehículos del marketplace automotriz mexicano.

## Resumen de Spiders

| # | Spider | Método | Vehículos | Frecuencia | Tecnología |
|---|--------|--------|-----------|------------|------------|
| 1 | kavak | API JSON | ~3,500 | Diario | requests |
| 2 | albacar | XML Feed | ~1,200 | Diario | lxml |
| 3 | carone | HTML Scraping | ~800 | Diario | CSS selectors |
| 4 | seminuevos | HTML | ~2,000 | Diario | CSS selectors |
| 5 | autocosmos | HTML | ~1,500 | Semanal | CSS selectors |
| 6 | soloautos | HTML | ~600 | Diario | XPath |
| 7 | crautos | HTML | ~400 | Semanal | CSS selectors |
| 8 | viveanuncios | HTML | ~300 | Semanal | CSS selectors |
| 9 | segundamano | HTML | ~250 | Semanal | CSS selectors |
| 10 | carvana_mx | HTML | ~200 | Semanal | CSS selectors |
| 11 | autoplaza | HTML | ~180 | Semanal | XPath |
| 12 | micochero | HTML | ~150 | Semanal | CSS selectors |
| 13 | rada | JS Rendering | ~300 | Diario | Playwright |
| 14 | motoria | JS Rendering | ~250 | Diario | Playwright |
| 15 | gruporio | JS Rendering | ~200 | Semanal | Playwright |
| 16 | novabuys | JS Rendering | ~150 | Semanal | Playwright |
| 17 | autostar | JS Rendering | ~100 | Semanal | Playwright |
| 18 | carmax_mx | JS Rendering | ~80 | Semanal | Playwright |

## Arquitectura de Spiders

```mermaid
graph TB
    subgraph Spiders por Tipo
        subgraph API
            S1[kavak_spider\nJSON API]
        end

        subgraph XML
            S2[albacar_spider\nXML Feed]
        end

        subgraph HTML
            S3[carone_spider]
            S4[seminuevos_spider]
            S5[autocosmos_spider]
            S6[soloautos_spider]
            S7[...6 más]
        end

        subgraph Playwright
            S8[rada_spider]
            S9[motoria_spider]
            S10[gruporio_spider]
            S11[...3 más]
        end
    end

    subgraph Pipeline
        P1[CleaningPipeline\nLimpieza de datos]
        P2[NormalizationPipeline\nNormalización]
        P3[DeduplicationPipeline\nDeduplicación]
        P4[PostgresPipeline\nAlmacenamiento]
        P5[PriceHistoryPipeline\nHistorial precios]
    end

    S1 --> P1
    S2 --> P1
    S3 --> P1
    S8 --> P1

    P1 --> P2 --> P3 --> P4
    P3 --> P5
```

## Spider: Kavak (API JSON)

El spider más productivo, accede directamente a la API JSON de Kavak.

```python
class KavakSpider(scrapy.Spider):
    name = 'kavak'
    allowed_domains = ['www.kavak.com']

    def start_requests(self):
        # API pública de Kavak con paginación
        for page in range(1, 200):
            url = f'https://www.kavak.com/api/inventory?page={page}&country=MX'
            yield scrapy.Request(url, callback=self.parse_api)

    def parse_api(self, response):
        data = json.loads(response.text)
        for vehicle in data.get('results', []):
            yield {
                'source': 'kavak',
                'source_id': vehicle['id'],
                'url': f"https://www.kavak.com/{vehicle['slug']}",
                'make': vehicle['make'],
                'model': vehicle['model'],
                'version': vehicle['trim'],
                'year': vehicle['year'],
                'price': vehicle['price'],
                'mileage': vehicle['km'],
                'transmission': vehicle['transmission'],
                'color': vehicle['color'],
                'state': vehicle.get('location', {}).get('state'),
                'image_url': vehicle.get('images', [None])[0],
                'raw_data': vehicle,
            }
```

## Spider: Albacar (XML)

Consume el feed XML estructurado de Albacar.

```python
class AlbacarSpider(scrapy.Spider):
    name = 'albacar'
    start_urls = ['https://www.albacar.com.mx/feed/vehicles.xml']

    def parse(self, response):
        response.selector.remove_namespaces()
        for vehicle in response.xpath('//vehicle'):
            yield {
                'source': 'albacar',
                'source_id': vehicle.xpath('id/text()').get(),
                'make': vehicle.xpath('make/text()').get(),
                'model': vehicle.xpath('model/text()').get(),
                'year': int(vehicle.xpath('year/text()').get()),
                'price': float(vehicle.xpath('price/text()').get()),
                # ... más campos
            }
```

## Spider: Rada (Playwright)

Sitios con JavaScript dinámico requieren renderizado completo del navegador.

```python
class RadaSpider(scrapy.Spider):
    name = 'rada'
    custom_settings = {
        'DOWNLOAD_HANDLERS': {
            'https': 'scrapy_playwright.handler.ScrapyPlaywrightDownloadHandler',
        },
        'PLAYWRIGHT_BROWSER_TYPE': 'chromium',
        'PLAYWRIGHT_LAUNCH_OPTIONS': {'headless': True},
    }

    def start_requests(self):
        yield scrapy.Request(
            'https://www.rada.mx/seminuevos',
            meta={'playwright': True, 'playwright_page_methods': [
                PageMethod('wait_for_selector', '.vehicle-card'),
            ]},
        )

    def parse(self, response):
        for card in response.css('.vehicle-card'):
            yield {
                'source': 'rada',
                'make': card.css('.make::text').get(),
                'model': card.css('.model::text').get(),
                'price': parse_price(card.css('.price::text').get()),
                # ...
            }
```

## Pipeline de Normalización

```mermaid
flowchart LR
    A[Item crudo] --> B[Cleaning]
    B --> C[Normalization]
    C --> D[Deduplication]
    D --> E[(PostgreSQL)]

    B -->|Pasos| B1["strip(), lower()\nremove HTML\nfix encoding"]
    C -->|Pasos| C1["Normalizar marca\n(vw→volkswagen)\nNormalizar precio\n(MXN, sin formato)\nNormalizar transmisión\n(auto→automatic)"]
    D -->|Pasos| D1["Check source+source_id\nUpdate si existe\nInsert si nuevo"]
```

## Settings de Scrapy

```python
# settings.py
BOT_NAME = 'scrapper_nacional'
SPIDER_MODULES = ['scrapper_nacional.spiders']

# Concurrencia y delays
CONCURRENT_REQUESTS = 8
CONCURRENT_REQUESTS_PER_DOMAIN = 2
DOWNLOAD_DELAY = 1.5
RANDOMIZE_DOWNLOAD_DELAY = True

# Retry
RETRY_TIMES = 3
RETRY_HTTP_CODES = [500, 502, 503, 504, 408, 429]

# User Agent rotación
DOWNLOADER_MIDDLEWARES = {
    'scrapy.downloadermiddlewares.useragent.UserAgentMiddleware': None,
    'scrapy_user_agents.middlewares.RandomUserAgentMiddleware': 400,
}

# Pipelines
ITEM_PIPELINES = {
    'scrapper_nacional.pipelines.CleaningPipeline': 100,
    'scrapper_nacional.pipelines.NormalizationPipeline': 200,
    'scrapper_nacional.pipelines.DeduplicationPipeline': 300,
    'scrapper_nacional.pipelines.PostgresPipeline': 400,
    'scrapper_nacional.pipelines.PriceHistoryPipeline': 500,
}

# Base de datos
DATABASE_URL = 'postgresql://user:pass@localhost:5433/scrapper_nacional'

# Playwright (para spiders JS)
PLAYWRIGHT_BROWSER_TYPE = 'chromium'
PLAYWRIGHT_LAUNCH_OPTIONS = {'headless': True}
```

## Ejecución

```bash
# Ejecutar un spider específico
scrapy crawl kavak

# Ejecutar todos los spiders
for spider in kavak albacar carone seminuevos rada motoria; do
    scrapy crawl $spider &
done
wait

# Con logging a archivo
scrapy crawl kavak -s LOG_FILE=logs/kavak.log

# Exportar a JSON (debug)
scrapy crawl kavak -O output/kavak.json
```

## Métricas de Scraping

| Métrica | Valor |
|---------|-------|
| Total vehículos | 11,000+ |
| Spiders HTML | 12 |
| Spiders Playwright | 6 |
| Requests concurrentes | 8 |
| Delay entre requests | 1.5s +/- random |
| Items procesados/ejecución | ~11,000 |
| Tiempo total ejecución | ~3 horas |
| Tasa de error | < 2% |

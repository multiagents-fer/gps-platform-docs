# Diagnostic Sync Worker

`proj-worker-diagnostic-sync` - Procesador de diagnósticos OBD-II desde PDFs. Consume mensajes SQS, parsea reportes de ThinkCar y TopDon, y extrae 40+ lecturas de sensores.

## Arquitectura

```mermaid
graph TB
    subgraph Entrada
        EMAIL[Email con PDF]
        UPLOAD[Upload directo]
        S3[S3 Bucket]
    end

    subgraph AWS
        SQS[SQS Queue\ndiagnostic-scans]
    end

    subgraph Diagnostic Sync Worker
        CONSUMER[SQS Consumer\nlong polling]
        DETECTOR[Scanner Detector\nThinkCar vs TopDon]
        THINK[ThinkCar Parser]
        TOPDON[TopDon Parser]
        EXTRACT[Sensor Extractor\n40+ readings]
        DTC_EXT[DTC Extractor\nCódigos de falla]
        WRITER[DB Writer]
    end

    subgraph Base de Datos
        DB[(cobranza_db\nPostgreSQL :5432)]
    end

    subgraph AI Processing
        AI[AI Agents :5001\nAgente Diagnóstico]
    end

    EMAIL --> S3
    UPLOAD --> S3
    S3 --> SQS

    SQS --> CONSUMER
    CONSUMER --> DETECTOR
    DETECTOR -->|ThinkCar| THINK
    DETECTOR -->|TopDon| TOPDON
    THINK --> EXTRACT
    TOPDON --> EXTRACT
    THINK --> DTC_EXT
    TOPDON --> DTC_EXT

    EXTRACT --> WRITER --> DB
    DTC_EXT --> WRITER
    DB --> AI
```

## Flujo de Procesamiento

```mermaid
sequenceDiagram
    participant SQS as SQS Queue
    participant W as Worker
    participant S3 as S3
    participant PDF as PDF Parser
    participant DB as PostgreSQL
    participant AI as AI Agent

    loop Long polling
        SQS->>W: ReceiveMessage
        W->>S3: Download PDF
        S3-->>W: PDF binary

        W->>PDF: Detect scanner type
        PDF-->>W: "thinkcar" | "topdon"

        W->>PDF: Parse PDF
        PDF-->>W: Structured data

        W->>W: Extract sensors (40+)
        W->>W: Extract DTC codes
        W->>W: Evaluate systems

        W->>DB: INSERT diagnostic_scans
        W->>DB: INSERT sensor_readings (batch)
        W->>DB: INSERT dtc_faults (batch)
        W->>DB: INSERT system_statuses

        W->>AI: POST /agents/diagnostic/evaluate
        AI-->>W: {health_score, evaluation}

        W->>DB: UPDATE vehicle_dossiers
        W->>SQS: DeleteMessage (ack)
    end
```

## Parsers de Scanner

### ThinkCar Parser

ThinkCar genera PDFs con formato tabular estructurado.

```mermaid
graph LR
    subgraph PDF ThinkCar
        P1[Página 1\nInfo vehículo]
        P2[Página 2-3\nSensor readings]
        P3[Página 4\nDTC codes]
        P4[Página 5\nSystem status]
    end

    subgraph Extracción
        E1[VIN, Make, Model, Year]
        E2[40+ sensor values]
        E3[DTC P/B/C/U codes]
        E4[System evaluations]
    end

    P1 --> E1
    P2 --> E2
    P3 --> E3
    P4 --> E4
```

### TopDon Parser

TopDon usa un formato diferente con gráficos y colores.

```python
class TopDonParser:
    def parse(self, pdf_path: str) -> DiagnosticResult:
        with pdfplumber.open(pdf_path) as pdf:
            # Página 1: información del vehículo
            vehicle_info = self._extract_vehicle_info(pdf.pages[0])

            # Páginas 2+: tablas de sensores
            sensors = []
            for page in pdf.pages[1:]:
                tables = page.extract_tables()
                for table in tables:
                    sensors.extend(self._parse_sensor_table(table))

            # Extraer DTC codes del texto
            full_text = '\n'.join(p.extract_text() for p in pdf.pages)
            dtc_codes = self._extract_dtc_codes(full_text)

            return DiagnosticResult(
                vehicle=vehicle_info,
                sensors=sensors,
                dtc_codes=dtc_codes
            )
```

## Las 40+ Lecturas de Sensores

| Categoría | Sensores | Cantidad |
|-----------|----------|----------|
| Motor | RPM, carga, temperatura, presión aceite, timing | 8 |
| Combustible | Presión, ratio A/F, fuel trim (short/long), flow | 6 |
| Emisiones | O2 sensors (banco 1/2), catalizador temp, EGR | 7 |
| Eléctrico | Voltaje batería, alternador, sistema arranque | 4 |
| Transmisión | Temperatura, presión, velocidad entrada/salida | 5 |
| Frenos | Presión, temperatura disco, ABS status | 4 |
| Dirección | Ángulo, presión asistida, sensor velocidad | 3 |
| Varios | Velocidad vehículo, odómetro, temperatura ambiente | 5+ |

## Evaluación de Sistemas

```mermaid
graph TB
    subgraph Sistemas Evaluados
        SYS1[Motor\nEngine]
        SYS2[Transmisión\nTransmission]
        SYS3[Frenos\nBrakes]
        SYS4[Emisiones\nEmissions]
        SYS5[Eléctrico\nElectrical]
        SYS6[Dirección\nSteering]
        SYS7[Suspensión\nSuspension]
        SYS8[HVAC\nClima]
    end

    subgraph Scoring
        S[Score 0-100]
        C1((Verde\n80-100))
        C2((Amarillo\n50-79))
        C3((Rojo\n0-49))
    end

    SYS1 --> S
    SYS2 --> S
    SYS3 --> S
    SYS4 --> S

    S --> C1
    S --> C2
    S --> C3

    style C1 fill:#4caf50,color:white
    style C2 fill:#ff9800,color:white
    style C3 fill:#f44336,color:white
```

## Consumidor SQS

```python
import boto3
import time

class DiagnosticSQSConsumer:
    def __init__(self, queue_url: str):
        self.sqs = boto3.client('sqs')
        self.queue_url = queue_url
        self.parsers = {
            'thinkcar': ThinkCarParser(),
            'topdon': TopDonParser(),
        }

    def run(self):
        """Loop principal con long polling."""
        while True:
            response = self.sqs.receive_message(
                QueueUrl=self.queue_url,
                MaxNumberOfMessages=10,
                WaitTimeSeconds=20,  # Long polling
                MessageAttributeNames=['All']
            )

            for message in response.get('Messages', []):
                try:
                    self.process_message(message)
                    self.sqs.delete_message(
                        QueueUrl=self.queue_url,
                        ReceiptHandle=message['ReceiptHandle']
                    )
                except Exception as e:
                    logger.error(f"Error processing: {e}")
                    # Mensaje vuelve a la cola después de visibility timeout
```

## Formato de Mensaje SQS

```json
{
  "event_type": "new_diagnostic_scan",
  "payload": {
    "s3_bucket": "agentsmx-diagnostics",
    "s3_key": "scans/2024/03/scan_12345.pdf",
    "vin": "1HGBH41JXMN109186",
    "scanner_hint": "thinkcar",
    "uploaded_by": "inspector@agentsmx.com",
    "timestamp": "2024-03-15T10:30:00Z"
  }
}
```

## Variables de Entorno

```bash
SQS_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/xxx/diagnostic-scans
S3_BUCKET=agentsmx-diagnostics
DATABASE_URL=postgresql://user:pass@localhost:5432/cobranza_db
AI_AGENTS_URL=http://localhost:5001
VISIBILITY_TIMEOUT=300
MAX_MESSAGES=10
POLL_WAIT_SECONDS=20
LOG_LEVEL=INFO
```

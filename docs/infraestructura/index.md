# Infraestructura

Panorama de la infraestructura AWS y local del ecosistema AgentsMX.

## Diagrama de Arquitectura AWS

```mermaid
graph TB
    subgraph Internet
        USER[Usuarios]
        DNS[Route 53\n*.agentsmx.com]
    end

    subgraph AWS Cloud
        CF[CloudFront\nCDN]

        subgraph VPC["VPC 10.0.0.0/16"]
            subgraph Public Subnets
                ALB[Application\nLoad Balancer]
                NAT[NAT Gateway]
                BASTION[Bastion Host]
            end

            subgraph Private Subnets
                subgraph ASG["Auto Scaling Group"]
                    EC2_1[EC2 Instance\nt3.medium]
                    EC2_2[EC2 Instance\nt3.medium]
                end
                RDS[(RDS PostgreSQL\ndb.t3.medium)]
                REDIS[(ElastiCache\nRedis)]
            end
        end

        S3_FE[(S3\nFrontend Assets)]
        S3_DATA[(S3\nData / Backups)]
        ECR[ECR\nDocker Registry]
        SQS[SQS\nColas de mensajes]
        DDB[(DynamoDB)]
        ES[(Elasticsearch)]
        CW[CloudWatch\nMonitoreo]
    end

    subgraph Local
        MAC[Mac Mini\nServidor desarrollo]
        GRAF[Grafana :3000]
    end

    USER --> DNS --> CF
    CF --> S3_FE
    CF --> ALB
    ALB --> EC2_1
    ALB --> EC2_2
    EC2_1 --> RDS
    EC2_1 --> REDIS
    EC2_2 --> RDS
    EC2_2 --> REDIS
    EC2_1 --> SQS
    EC2_2 --> SQS

    MAC --> GRAF
    MAC --> CW
```

## Componentes Principales

| Componente | Servicio AWS | Propósito | Costo/mes |
|-----------|-------------|-----------|-----------|
| VPC | VPC | Red privada | $0 |
| Load Balancer | ALB | Distribución de tráfico | ~$18 |
| Compute | EC2 (ASG) | Servidores de aplicación | ~$30 |
| Base de datos | RDS PostgreSQL | Base de datos principal | ~$25 |
| Cache | ElastiCache Redis | Cache y sesiones | ~$13 |
| CDN | CloudFront | Distribución de contenido | ~$5 |
| Almacenamiento | S3 | Assets, backups, datos | ~$3 |
| DNS | Route 53 | Dominios y resolución | ~$1 |
| Contenedores | ECR | Registro Docker | ~$1 |
| Colas | SQS | Mensajería asíncrona | ~$0.50 |
| Monitoreo | CloudWatch | Logs y métricas | ~$5 |
| Búsqueda | Elasticsearch | Full-text search | ~$25 |
| NoSQL | DynamoDB | Scrapper MTY | ~$2 |
| **Total** | | | **~$108/mes** |

## Dominios y DNS

```mermaid
graph LR
    subgraph Route 53
        R53[agentsmx.com]
    end

    subgraph Registros
        A1["api.agentsmx.com\nA → ALB"]
        A2["time.agentsmx.com\nA → ALB"]
        A3["dashboard.agentsmx.com\nCNAME → CloudFront"]
        A4["doc.agentsmx.com\nCNAME → CloudFront"]
    end

    subgraph Destinos
        ALB[ALB\nBackends]
        CF1[CloudFront\nDashboard SPA]
        CF2[CloudFront\nDocs VitePress]
    end

    R53 --> A1 --> ALB
    R53 --> A2 --> ALB
    R53 --> A3 --> CF1
    R53 --> A4 --> CF2
```

## Entornos

| Entorno | Infraestructura | Propósito |
|---------|----------------|-----------|
| Desarrollo | Mac Mini local | Desarrollo y pruebas |
| Staging | AWS (reducido) | Pre-producción |
| Producción | AWS (completo) | Usuarios finales |

## Siguiente Lectura

- [Terraform](/infraestructura/terraform) - Infrastructure as Code
- [Red](/infraestructura/red) - VPC, subnets, seguridad
- [CI/CD](/infraestructura/cicd) - GitHub Actions pipelines
- [Monitoreo](/infraestructura/monitoreo) - Grafana y CloudWatch
- [Costos](/infraestructura/costos) - Desglose detallado

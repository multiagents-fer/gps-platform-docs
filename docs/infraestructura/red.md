# Red y Seguridad

Configuración de VPC, subnets, seguridad y acceso SSH del ecosistema AgentsMX en AWS.

## Arquitectura de Red

```mermaid
graph TB
    INTERNET[Internet]

    subgraph VPC["VPC 10.0.0.0/16"]
        IGW[Internet Gateway]

        subgraph AZ_A["Availability Zone us-east-1a"]
            subgraph PUB_A["Public Subnet 10.0.1.0/24"]
                ALB_A[ALB Node]
                NAT_A[NAT Gateway]
                BASTION[Bastion Host\nt3.micro]
            end
            subgraph PRV_A["Private Subnet 10.0.3.0/24"]
                EC2_A[EC2 App Server]
                RDS_A[(RDS Primary)]
            end
        end

        subgraph AZ_B["Availability Zone us-east-1b"]
            subgraph PUB_B["Public Subnet 10.0.2.0/24"]
                ALB_B[ALB Node]
            end
            subgraph PRV_B["Private Subnet 10.0.4.0/24"]
                EC2_B[EC2 App Server]
                RDS_B[(RDS Standby)]
                REDIS[(ElastiCache)]
            end
        end
    end

    INTERNET --> IGW
    IGW --> ALB_A & ALB_B
    IGW --> BASTION
    NAT_A --> EC2_A & EC2_B
    EC2_A --> RDS_A
    EC2_B --> RDS_B
    EC2_B --> REDIS
    BASTION -->|SSH| EC2_A & EC2_B
```

## Tabla de Subnets

| Subnet | CIDR | AZ | Tipo | Uso |
|--------|------|-----|------|-----|
| public-1 | 10.0.1.0/24 | us-east-1a | Pública | ALB, NAT, Bastion |
| public-2 | 10.0.2.0/24 | us-east-1b | Pública | ALB |
| private-1 | 10.0.3.0/24 | us-east-1a | Privada | EC2, RDS Primary |
| private-2 | 10.0.4.0/24 | us-east-1b | Privada | EC2, RDS Standby, Redis |

## Route Tables

```mermaid
graph LR
    subgraph RT Pública
        R1["0.0.0.0/0 → IGW"]
        R2["10.0.0.0/16 → local"]
    end

    subgraph RT Privada
        R3["0.0.0.0/0 → NAT GW"]
        R4["10.0.0.0/16 → local"]
    end
```

## Security Groups

### SG: ALB

```mermaid
graph LR
    subgraph "sg-alb"
        direction TB
        IN1["Inbound: 80/tcp desde 0.0.0.0/0"]
        IN2["Inbound: 443/tcp desde 0.0.0.0/0"]
        OUT1["Outbound: Todo → sg-app"]
    end
```

| Dirección | Puerto | Protocolo | Origen | Descripción |
|-----------|--------|-----------|--------|-------------|
| Inbound | 80 | TCP | 0.0.0.0/0 | HTTP (redirect a HTTPS) |
| Inbound | 443 | TCP | 0.0.0.0/0 | HTTPS |
| Outbound | 8000 | TCP | sg-app | FastAPI |
| Outbound | 5002 | TCP | sg-app | GPS API |

### SG: Aplicación

| Dirección | Puerto | Protocolo | Origen | Descripción |
|-----------|--------|-----------|--------|-------------|
| Inbound | 8000 | TCP | sg-alb | FastAPI |
| Inbound | 5000-5002 | TCP | sg-alb | Flask services |
| Inbound | 5050 | TCP | sg-alb | Marketplace API |
| Inbound | 22 | TCP | sg-bastion | SSH desde bastion |
| Outbound | 5432 | TCP | sg-rds | PostgreSQL |
| Outbound | 6379 | TCP | sg-redis | Redis |
| Outbound | 443 | TCP | 0.0.0.0/0 | HTTPS saliente |

### SG: Base de Datos

| Dirección | Puerto | Protocolo | Origen | Descripción |
|-----------|--------|-----------|--------|-------------|
| Inbound | 5432 | TCP | sg-app | PostgreSQL |
| Inbound | 5432 | TCP | sg-bastion | Acceso admin |

### SG: Redis

| Dirección | Puerto | Protocolo | Origen | Descripción |
|-----------|--------|-----------|--------|-------------|
| Inbound | 6379 | TCP | sg-app | Redis |

### SG: Bastion

| Dirección | Puerto | Protocolo | Origen | Descripción |
|-----------|--------|-----------|--------|-------------|
| Inbound | 22 | TCP | IP oficina | SSH |
| Outbound | 22 | TCP | sg-app | SSH a instancias |
| Outbound | 5432 | TCP | sg-rds | Admin DB |

## Diagrama de Security Groups

```mermaid
graph LR
    INET[Internet\n0.0.0.0/0] -->|443| SG_ALB[sg-alb\nALB]
    SG_ALB -->|8000,5000-5002| SG_APP[sg-app\nEC2 Instances]
    SG_APP -->|5432| SG_RDS[sg-rds\nPostgreSQL]
    SG_APP -->|6379| SG_REDIS[sg-redis\nRedis]

    IP_OFFICE[IP Oficina] -->|22| SG_BASTION[sg-bastion\nBastion]
    SG_BASTION -->|22| SG_APP
    SG_BASTION -->|5432| SG_RDS
```

## Acceso SSH via Bastion

```mermaid
sequenceDiagram
    participant DEV as Developer
    participant BASTION as Bastion Host<br/>10.0.1.x (público)
    participant EC2 as EC2 Instance<br/>10.0.3.x (privado)

    DEV->>BASTION: ssh -i key.pem ec2-user@bastion-ip
    BASTION->>EC2: ssh -i key.pem ec2-user@10.0.3.x
    Note over DEV,EC2: O usando SSH ProxyJump
    DEV->>EC2: ssh -J bastion ec2-user@10.0.3.x
```

### Configuración SSH (~/.ssh/config)

```
Host bastion-agentsmx
    HostName <bastion-public-ip>
    User ec2-user
    IdentityFile ~/.ssh/agentsmx-key.pem

Host app-server-*
    User ec2-user
    IdentityFile ~/.ssh/agentsmx-key.pem
    ProxyJump bastion-agentsmx

Host app-server-1
    HostName 10.0.3.10

Host app-server-2
    HostName 10.0.4.10
```

## NACLs (Network ACLs)

| Regla | Tipo | Puerto | CIDR | Acción |
|-------|------|--------|------|--------|
| 100 | Inbound | 443 | 0.0.0.0/0 | Allow |
| 110 | Inbound | 80 | 0.0.0.0/0 | Allow |
| 120 | Inbound | 22 | IP oficina/32 | Allow |
| 130 | Inbound | 1024-65535 | 0.0.0.0/0 | Allow |
| * | Inbound | Todo | 0.0.0.0/0 | Deny |
| 100 | Outbound | Todo | 0.0.0.0/0 | Allow |

## Flujo de Tráfico

```mermaid
flowchart LR
    U[Usuario] -->|HTTPS| CF[CloudFront]
    CF -->|Static| S3[S3 Frontend]
    CF -->|API| ALB[ALB]
    ALB -->|Health Check| EC2[EC2 Instances]
    EC2 -->|Query| RDS[RDS PostgreSQL]
    EC2 -->|Cache| REDIS[ElastiCache]
    EC2 -->|NAT GW| EXT[APIs Externas\nSeeWorld, OpenAI]
```

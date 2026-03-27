---
title: Cartera Morosa
description: Gestion de la cartera de cuentas morosas, carga de Excel y clasificacion por buckets
---

# Cartera Morosa

El modulo de cartera morosa permite gestionar las **794 cuentas morosas** activas: carga desde Excel, clasificacion automatica en buckets, detalle de clientes y correlacion con datos GPS.

## Flujo de Gestion de Cartera

```mermaid
flowchart TD
    UPLOAD["Supervisor sube<br/>archivo Excel"] --> PARSE["Sistema parsea<br/>y valida datos"]
    PARSE --> VALID{Datos<br/>validos?}
    VALID -->|Si| GEO["Geocodificacion<br/>de direcciones"]
    VALID -->|No| ERROR["Muestra errores<br/>filas con problema"]
    ERROR --> FIX["Supervisor corrige<br/>y reintenta"]
    FIX --> UPLOAD
    GEO --> BUCKET["Clasificacion<br/>automatica en Buckets"]
    BUCKET --> GPS["Correlacion<br/>con datos GPS"]
    GPS --> ACTIVE["Cartera activa<br/>lista para agendas"]

    style UPLOAD fill:#e3f2fd,stroke:#1976d2
    style BUCKET fill:#f1f8e9,stroke:#689f38
    style GPS fill:#fff3e0,stroke:#f57c00
    style ACTIVE fill:#e8f5e9,stroke:#4caf50
    style ERROR fill:#ffebee,stroke:#f44336
```

## Carga de Excel

El supervisor sube un archivo Excel (.xlsx) con la cartera actualizada. El sistema espera las siguientes columnas:

### Columnas Requeridas

| Columna | Tipo | Descripcion |
|---------|------|------------|
| numero_cuenta | String | Identificador unico de la cuenta |
| nombre_cliente | String | Nombre completo del moroso |
| telefono | String | Numero de telefono principal |
| direccion | String | Direccion completa |
| colonia | String | Colonia |
| municipio | String | Municipio o delegacion |
| estado | String | Estado de la republica |
| codigo_postal | String | Codigo postal |
| monto_adeudado | Number | Saldo vencido en MXN |
| dias_atraso | Number | Dias desde el ultimo pago |
| fecha_ultimo_pago | Date | Fecha del ultimo pago registrado |
| numero_serie | String | Numero de serie del vehiculo (VIN) |

### Columnas Opcionales

| Columna | Tipo | Descripcion |
|---------|------|------------|
| telefono_2 | String | Telefono alternativo |
| email | String | Correo electronico |
| referencia_domicilio | String | Referencias para llegar |
| monto_mensualidad | Number | Monto de la mensualidad |
| notas | String | Observaciones adicionales |

### Validaciones

El sistema verifica automaticamente:

- Columnas requeridas presentes
- Formatos de datos correctos
- Numeros de cuenta sin duplicados
- Montos positivos
- Direcciones con datos minimos para geocodificacion

## Clasificacion por Buckets

Los morosos se clasifican automaticamente segun los **dias de atraso**:

```mermaid
graph LR
    subgraph Buckets["Clasificacion por Dias de Atraso"]
        B1["B1<br/>1-30 dias<br/>Mora temprana"]
        B2["B2<br/>31-60 dias"]
        B3["B3<br/>61-90 dias"]
        B4["B4<br/>91-120 dias"]
        B5["B5<br/>121-150 dias"]
        B6["B6<br/>151-180 dias"]
        B7["B7<br/>181-210 dias"]
        B8["B8<br/>211-240 dias"]
        B9["B9<br/>241-270 dias"]
        B10["B10<br/>270+ dias<br/>Mora critica"]
    end

    style B1 fill:#e8f5e9,stroke:#4caf50
    style B2 fill:#f1f8e9,stroke:#8bc34a
    style B3 fill:#fff9c4,stroke:#fbc02d
    style B4 fill:#fff3e0,stroke:#ff9800
    style B5 fill:#ffe0b2,stroke:#f57c00
    style B6 fill:#ffccbc,stroke:#ff5722
    style B7 fill:#ffcdd2,stroke:#f44336
    style B8 fill:#f8bbd0,stroke:#e91e63
    style B9 fill:#e1bee7,stroke:#9c27b0
    style B10 fill:#d1c4e9,stroke:#673ab7
```

### Detalle de Buckets

| Bucket | Dias | Prioridad | Estrategia |
|--------|------|-----------|-----------|
| B1 | 1-30 | Baja | Recordatorio amigable |
| B2 | 31-60 | Baja-Media | Contacto telefonico + visita |
| B3 | 61-90 | Media | Visita presencial prioritaria |
| B4 | 91-120 | Media-Alta | Visita con negociacion |
| B5 | 121-150 | Alta | Cobro firme + plan de pagos |
| B6 | 151-180 | Alta | Escalamiento a legal |
| B7 | 181-210 | Muy Alta | Proceso pre-juridico |
| B8 | 211-240 | Muy Alta | Aviso legal formal |
| B9 | 241-270 | Critica | Proceso juridico |
| B10 | 270+ | Critica | Recuperacion de vehiculo |

## Detalle de Cliente

Al seleccionar un moroso de la tabla se muestra su perfil completo:

### Informacion Disponible

```mermaid
graph TB
    subgraph Cliente["Perfil del Moroso"]
        DATOS["Datos Personales<br/>Nombre, telefono, direccion"]
        FIN["Datos Financieros<br/>Monto, bucket, historial"]
        GPS_DATA["Datos GPS<br/>Vehiculo rastreado"]
        HIST["Historial de Visitas<br/>Visitas previas, resultados"]
        PROM["Promesas<br/>Activas e historicas"]
    end

    style DATOS fill:#e3f2fd,stroke:#1976d2
    style FIN fill:#e8f5e9,stroke:#4caf50
    style GPS_DATA fill:#fff3e0,stroke:#f57c00
    style HIST fill:#f3e5f5,stroke:#9c27b0
    style PROM fill:#e0f7fa,stroke:#0097a7
```

## Correlacion GPS

Cuando el numero de serie (VIN) del vehiculo coincide con un vehiculo rastreado por GPS, el sistema enriquece los datos:

| Dato GPS | Descripcion |
|----------|------------|
| Ultima posicion | Donde se ubica el vehiculo ahora |
| Residencia detectada | Direccion donde pernocta regularmente |
| Patron de movimiento | Horarios y rutas habituales |
| Coincidencia de domicilio | Si la residencia GPS coincide con la direccion registrada |
| Estado del GPS | Online / Offline / Sin dispositivo |

```mermaid
flowchart LR
    VIN["Numero de Serie<br/>del Moroso"] --> MATCH{Coincide con<br/>vehiculo GPS?}
    MATCH -->|Si| ENRICH["Enriquecer con<br/>datos GPS"]
    MATCH -->|No| BASIC["Solo datos<br/>del Excel"]
    ENRICH --> RES["Residencia detectada<br/>Patrones de movimiento"]

    style ENRICH fill:#e8f5e9,stroke:#4caf50
    style RES fill:#e3f2fd,stroke:#1976d2
```

::: tip Direccion Real vs Registrada
La correlacion GPS permite detectar cuando el moroso ya no vive en la direccion registrada. Si el vehiculo pernocta consistentemente en otra ubicacion, el sistema sugiere actualizar la direccion de visita.
:::

## Acciones sobre la Cartera

| Accion | Descripcion |
|--------|------------|
| Actualizar cartera | Subir nuevo Excel para reemplazar o agregar cuentas |
| Exportar cartera | Descargar la cartera actual con todos los datos enriquecidos |
| Asignar cobrador | Asignar manualmente un moroso a un cobrador |
| Cambiar bucket | Reclasificar manualmente una cuenta |
| Agregar nota | Escribir observaciones sobre una cuenta |
| Desactivar cuenta | Marcar como pagada, reestructurada o incobrable |

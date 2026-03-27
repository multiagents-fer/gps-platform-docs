---
title: PWA Cobrador
description: Aplicacion movil progresiva para cobradores en campo
---

# PWA Cobrador

La PWA (Progressive Web App) del cobrador es la aplicacion movil que utilizan los **17 cobradores** en campo para recibir sus agendas, navegar por la ruta optimizada y reportar el resultado de cada visita.

## Flujo del Cobrador

```mermaid
flowchart TD
    LOGIN["Inicio de Sesion<br/>Usuario + Contrasena"] --> AGENDA["Ver Agenda del Dia<br/>Lista de paradas"]
    AGENDA --> NAV["Iniciar Navegacion<br/>Primera parada"]
    NAV --> ARRIVE["Llegar a Destino<br/>GPS confirma proximidad"]
    ARRIVE --> VISIT["Registrar Visita"]
    VISIT --> RESULT{Resultado}
    RESULT -->|Cobro| COBRO["Registrar Monto<br/>+ Forma de pago"]
    RESULT -->|Promesa| PROMESA["Registrar Promesa<br/>+ Fecha de pago"]
    RESULT -->|No encontrado| NOFOUND["Marcar como<br/>No Encontrado"]
    RESULT -->|Rechazo| RECHAZO["Registrar Motivo<br/>de Rechazo"]
    COBRO --> FOTO["Capturar Foto<br/>Evidencia"]
    PROMESA --> FOTO
    NOFOUND --> FOTO
    RECHAZO --> FOTO
    FOTO --> NEXT{Mas paradas?}
    NEXT -->|Si| NAV
    NEXT -->|No| DONE["Fin de Jornada<br/>Resumen del dia"]

    style LOGIN fill:#e3f2fd,stroke:#1976d2
    style COBRO fill:#e8f5e9,stroke:#4caf50
    style PROMESA fill:#fff3e0,stroke:#f57c00
    style NOFOUND fill:#ffebee,stroke:#f44336
    style DONE fill:#f3e5f5,stroke:#7b1fa2
```

## Inicio de Sesion

Al abrir la app, el cobrador ingresa:

- **Usuario**: Asignado por el supervisor
- **Contrasena**: Personal e intransferible
- La sesion persiste hasta cierre de jornada
- El GPS se activa automaticamente al iniciar sesion

::: warning Permisos Requeridos
La PWA requiere permiso de **ubicacion GPS** y **camara** para funcionar correctamente. Sin GPS no se registran visitas.
:::

## Agenda del Dia

La pantalla principal muestra la lista de visitas del dia en el orden optimizado:

### Informacion por Parada

| Campo | Descripcion |
|-------|------------|
| Numero de parada | Orden en la ruta (1, 2, 3...) |
| Nombre del cliente | Nombre completo del moroso |
| Direccion | Direccion completa con referencia |
| Monto adeudado | Total que debe el moroso |
| Dias de atraso | Dias desde el ultimo pago |
| Bucket | Clasificacion B1-B10 |
| Hora sugerida | Ventana horaria optima de visita |
| Estado | Pendiente / Visitado / En progreso |

### Indicadores Visuales

```mermaid
graph LR
    subgraph Estados["Estado de Paradas"]
        PEND["Pendiente<br/>Circulo gris"]
        CURR["En Curso<br/>Circulo azul pulsante"]
        OK["Cobro Exitoso<br/>Circulo verde"]
        PROM["Promesa<br/>Circulo amarillo"]
        FAIL["No Encontrado<br/>Circulo rojo"]
    end

    style PEND fill:#f5f5f5,stroke:#9e9e9e
    style CURR fill:#e3f2fd,stroke:#1976d2
    style OK fill:#e8f5e9,stroke:#4caf50
    style PROM fill:#fff9c4,stroke:#fbc02d
    style FAIL fill:#ffebee,stroke:#f44336
```

## Navegacion Paso a Paso

Al tocar una parada, se abre la navegacion:

1. **Boton "Navegar"** abre Google Maps con la direccion como destino
2. Google Maps calcula la ruta desde la ubicacion actual
3. Al llegar (radio de 100m del destino), la PWA muestra notificacion
4. Se habilita el boton **"Registrar Visita"**

## Registro de Visita

El formulario de registro de visita tiene cuatro resultados posibles:

### Cobro Realizado

- **Monto cobrado**: Cantidad recibida
- **Forma de pago**: Efectivo / Transferencia / Cheque
- **Referencia**: Numero de referencia o folio
- **Notas**: Observaciones opcionales

### Promesa de Pago

- **Monto prometido**: Cantidad comprometida por el moroso
- **Fecha de pago**: Cuando se comprometio a pagar
- **Medio de pago**: Como va a pagar
- **Notas**: Detalle de la conversacion

### No Encontrado

- **Motivo**: Domicilio cerrado / No vive ahi / Direccion incorrecta
- **Observaciones**: Detalle de la situacion
- **Vecinos contactados**: Si se pregunto a vecinos

### Rechazo

- **Motivo del rechazo**: No quiere pagar / Disputa el monto / Otro
- **Detalle**: Razon especifica
- **Actitud**: Cooperativo / Hostil / Indiferente

## Captura de Fotos

Despues de cada visita, el cobrador puede capturar fotos como evidencia:

- **Foto de fachada**: Confirma que se visito la direccion correcta
- **Foto de comprobante**: Recibo de pago o nota de promesa
- **Foto adicional**: Cualquier evidencia relevante

Las fotos se suben automaticamente al servidor cuando hay conexion. En modo offline, se almacenan localmente y se sincronizan despues.

## Resumen del Dia

Al completar todas las visitas o al cerrar jornada:

```mermaid
graph TB
    subgraph Resumen["Resumen de Jornada"]
        V["Visitas: 12/12<br/>100% completadas"]
        C["Cobrado: $85,400<br/>3 cobros exitosos"]
        P["Promesas: 4<br/>$62,000 comprometidos"]
        T["Tiempo en campo<br/>6h 45min"]
        K["Km recorridos<br/>48 km"]
    end

    style V fill:#e3f2fd,stroke:#1976d2
    style C fill:#e8f5e9,stroke:#4caf50
    style P fill:#fff3e0,stroke:#f57c00
    style T fill:#f3e5f5,stroke:#9c27b0
    style K fill:#e0f7fa,stroke:#0097a7
```

## Modo Offline

La PWA funciona sin conexion a internet:

| Funcionalidad | Offline | Observacion |
|--------------|---------|-------------|
| Ver agenda del dia | Si | Se precarga al inicio |
| Registrar visitas | Si | Se sincroniza al reconectar |
| Capturar fotos | Si | Se suben al reconectar |
| GPS tracking | Si | Se almacena localmente |
| Navegacion Google Maps | Parcial | Requiere conexion para nuevas rutas |
| Notificaciones push | No | Requiere conexion |

::: tip Sincronizacion
Los datos se sincronizan automaticamente cuando la PWA detecta conexion a internet. El cobrador no necesita hacer nada manual.
:::

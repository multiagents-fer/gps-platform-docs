# Manual PWA Cobrador

Manual de uso de la aplicacion movil para cobradores de campo. Esta guia cubre todas las funciones disponibles en **time.agentsmx.com/mi-agenda/**.

## Flujo General — Tu Dia de Trabajo

```mermaid
flowchart TD
    A["1. Abrir la App en time.agentsmx.com"]:::blue
    A --> B["2. Ingresar credenciales: COB-GPS-XX + Contrasena"]:::blue
    B --> C["3. Ver pantalla Mi Agenda con mapa y lista de clientes"]:::blue
    C --> D{"Presionar el boton Iniciar Ruta?"}:::decision
    D -->|"Si — Recomendado"| E["El sistema detecta tu ubicacion GPS y reordena las paradas automaticamente"]:::green
    D -->|"No"| G["Las paradas se mantienen en el orden asignado por el supervisor"]:::gray
    E --> H["4. Navegar al siguiente cliente con Google Maps"]:::blue
    G --> H
    H --> I["5. Llegar al domicilio del cliente"]:::blue
    I --> J["6. Registrar el resultado de la visita en 4 pasos"]:::amber
    J --> K{"Quedan clientes pendientes?"}:::decision
    K -->|"Si — siguiente cliente"| H
    K -->|"No — todos visitados"| L["7. RUTA COMPLETADA — Ver reporte del dia"]:::green

    M["ALERTA: Tu celular vibra cuando pasas cerca de un cliente en ventana horaria"]:::alert -.->|"Aviso automatico"| I

    classDef blue fill:#dbeafe,stroke:#2563eb,stroke-width:2px,color:#1e3a5f
    classDef green fill:#d1fae5,stroke:#059669,stroke-width:2px,color:#064e3b
    classDef amber fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#78350f
    classDef gray fill:#f1f5f9,stroke:#94a3b8,stroke-width:1px,color:#475569
    classDef alert fill:#fef9c3,stroke:#ca8a04,stroke-width:2px,color:#713f12
    classDef decision fill:#f0f9ff,stroke:#0284c7,stroke-width:2px,color:#0c4a6e
```

## Ventajas del Sistema

| Ventaja | Descripcion |
|---------|-------------|
| Rutas inteligentes | Las paradas se reordenan automaticamente desde tu ubicacion para minimizar tiempo de viaje |
| Ventanas horarias | El sistema sabe cuando es mas probable encontrar al cliente en casa |
| Alertas en tiempo real | Te avisa cuando pasas cerca de un cliente en ventana activa |
| GPS vehicular como respaldo | Si tu celular no obtiene ubicacion, usa el GPS del vehiculo |
| Vista 360 del cliente | Toda la informacion del cliente en un solo lugar |
| Registro inmediato | Tus visitas llegan al supervisor en tiempo real |

## Limitaciones a Considerar

| Limitacion | Impacto |
|------------|---------|
| Requiere internet | Sin conexion no puedes cargar ruta ni enviar visitas |
| Consumo de bateria | El GPS activo consume bateria — carga tu celular antes de salir |
| Precision GPS | En interiores o zonas con senal debil, el GPS puede ser impreciso |
| Sin modo offline completo | Las fotos y visitas necesitan internet para enviarse |

---

## 1. Acceso al Sistema

### Pantalla de Login

![Login PWA Cobrador](/screens/01-pwa-login.png)

### Ingresar a la aplicacion

1. Abre el navegador de tu celular (Chrome o Safari).
2. Escribe la direccion: **time.agentsmx.com**
3. Ingresa tus credenciales:

| Campo | Que escribir | Ejemplo |
|-------|-------------|---------|
| Codigo de cobrador | Tu codigo asignado | COB-GPS-01 |
| Contrasena | La contrasena que te dieron | ******** |

4. Presiona **Iniciar sesion**.

### Instalar como aplicacion en tu celular

Para acceder mas rapido sin abrir el navegador cada vez:

**En Android (Chrome):**
1. Abre **time.agentsmx.com** en Chrome.
2. Toca el menu de tres puntos (arriba a la derecha).
3. Selecciona **"Agregar a pantalla de inicio"** o **"Instalar aplicacion"**.
4. Confirma. Aparecera un icono en tu pantalla como cualquier otra app.

**En iPhone (Safari):**
1. Abre **time.agentsmx.com** en Safari.
2. Toca el boton de compartir (cuadro con flecha hacia arriba).
3. Selecciona **"Agregar a pantalla de inicio"**.
4. Confirma. Aparecera el icono en tu pantalla.

::: tip Recomendacion
Instalar la app en tu celular te permite abrirla mas rapido y funciona mejor con las alertas de proximidad.
:::

---

## 2. Pantalla Principal — Mi Agenda

Al entrar veras la pantalla **Mi Agenda**, que es tu centro de trabajo diario. En la parte inferior tienes una barra de navegacion con cuatro secciones.

### Barra de navegacion inferior

| Boton | Para que sirve |
|-------|---------------|
| Mapa | Ver tus clientes en un mapa con marcadores de colores |
| Lista | Ver tus clientes en tarjetas con filtros |
| Reporte | Ver tus estadisticas del dia, semana o mes |
| Inspeccion | Acceder a funciones de inspeccion vehicular |

### Vista de Mapa (pantalla por defecto)

El mapa muestra la ubicacion de cada cliente que debes visitar. Cada marcador tiene un color que te indica el estado del cliente:

| Color del marcador | Que significa |
|-------------------|--------------|
| **Verde** | El cliente esta en ventana horaria activa. Es el mejor momento para visitarlo. |
| **Ambar** | Hay un conflicto de horario. Otro cliente cercano tambien tiene ventana activa. |
| **Azul** | Tiene ventana optima definida, pero no esta activa en este momento. |
| **Gris** | No hay datos de ventana horaria. Puedes visitarlo cuando consideres conveniente. |

::: tip Prioridad
Siempre intenta visitar primero los marcadores **verdes** — son los clientes con mayor probabilidad de estar en casa en ese momento.
:::

### Vista de Lista

Muestra los clientes como tarjetas individuales. Cada tarjeta incluye:
- Nombre del cliente
- Monto adeudado
- Numero de dias de mora
- Direccion
- Estado de la visita (pendiente, completada, etc.)

Puedes usar los filtros en la parte superior para mostrar solo ciertos clientes:
- Por estado de visita
- Por bucket (nivel de morosidad)
- Por proximidad

### Vista de Reporte

Te muestra un resumen de tu trabajo:
- **Dia:** visitas realizadas hoy, promesas obtenidas, resultados negativos
- **Semana:** acumulado semanal con comparacion contra la semana anterior
- **Mes:** totales del mes y porcentaje de cumplimiento

---

## 3. Iniciar Ruta

Al comenzar tu jornada de trabajo:

1. Abre la aplicacion en **time.agentsmx.com/mi-agenda/**.
2. En la pantalla principal veras el boton **"Iniciar ruta"**.
3. Presiona el boton. El sistema hara lo siguiente:
   - Obtendra tu ubicacion GPS (del celular o del vehiculo asignado).
   - Reordenara automaticamente las paradas de tu ruta desde tu posicion actual, para que visites primero al cliente mas cercano.
4. El mapa se actualizara mostrando el orden optimizado.

::: info Opcion alternativa
Si no quieres que se reordene tu ruta (por ejemplo, ya tienes un plan especifico), puedes presionar **"Continuar sin iniciar"**. Tus clientes apareceran en el orden original asignado por tu supervisor.
:::

---

## 4. Navegar a un Cliente

Para llegar a la ubicacion de un cliente:

1. Selecciona al cliente en el mapa o en la lista.
2. Presiona el boton **"Navegar"**.
3. Se abrira **Google Maps** automaticamente con la direccion del cliente.
4. Sigue las indicaciones de Google Maps para llegar.

### Dos direcciones disponibles

El sistema te muestra dos direcciones para cada cliente:

| Tipo | Descripcion |
|------|-------------|
| **Direccion GPS** | Detectada automaticamente por el GPS del vehiculo. Generalmente es mas precisa. |
| **Direccion del credito** | La que aparece en el contrato original. Puede estar desactualizada. |

Si la direccion GPS esta disponible, el boton "Navegar" usara esa por defecto, ya que es la ubicacion donde realmente se ha detectado el vehiculo.

---

## 5. Registrar una Visita (Paso a Paso)

### Flujo de Registro de Visita

```mermaid
flowchart TD
    A["PASO 1: Tocar al cliente y presionar Registrar"]:::blue
    A --> B{"Seleccionar tipo de resultado"}:::decision
    B -->|"Resultado Positivo"| C["Promesa de pago / Entrega auto garantia / Entrega auto definitiva"]:::green
    B -->|"Accion Realizada"| D["Carta visita / Carta juridico / Cita despacho externo"]:::amber
    B -->|"Resultado Negativo"| E["No dan acceso / No vive ahi / Casa abandonada / No se localizo"]:::red
    C --> F["PASO 2: Capturar fecha de pago, monto prometido y notas"]:::amber
    F --> G["PASO 3: Tomar fotos de evidencia y escribir observaciones"]:::purple
    D --> G
    E --> G
    G --> H["PASO 4: Revisar toda la informacion y presionar Enviar"]:::blue
    H --> I["VISITA REGISTRADA — Tu supervisor la ve en tiempo real"]:::green

    classDef blue fill:#dbeafe,stroke:#2563eb,stroke-width:2px,color:#1e3a5f
    classDef green fill:#d1fae5,stroke:#059669,stroke-width:2px,color:#064e3b
    classDef amber fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#78350f
    classDef red fill:#fee2e2,stroke:#dc2626,stroke-width:2px,color:#7f1d1d
    classDef purple fill:#f3e8ff,stroke:#7c3aed,stroke-width:2px,color:#4c1d95
    classDef decision fill:#f0f9ff,stroke:#0284c7,stroke-width:2px,color:#0c4a6e
```

Cuando llegas con un cliente o a una direccion, debes registrar el resultado de la visita. Sigue estos pasos:

### Paso 1: Seleccionar resultado

Toca al cliente y presiona **"Registrar visita"**. Selecciona el resultado que corresponda:

**Resultados positivos (verde):**

| Resultado | Cuando usarlo |
|-----------|--------------|
| Promesa de pago | El cliente se compromete a pagar en una fecha especifica |
| Entrega auto garantia | El cliente entrega el vehiculo como garantia |
| Entrega auto definitiva | El cliente entrega el vehiculo de forma definitiva |

**Accion realizada (ambar):**

| Resultado | Cuando usarlo |
|-----------|--------------|
| Carta visita | Dejaste una carta de aviso en la direccion |
| Carta juridico | Dejaste una carta de accion legal |
| Cita despacho | Acordaste una cita en el despacho |

**Resultados negativos (rojo):**

| Resultado | Cuando usarlo |
|-----------|--------------|
| No dan acceso | Alguien abrio pero no te permitieron hablar con el titular |
| No vive ahi | El cliente ya no vive en esa direccion |
| Casa abandonada | La propiedad esta desocupada |
| No se localizo | Nadie abrio la puerta |
| Domicilio no encontrado | No existe la direccion o no pudiste localizarla |

### Paso 2: Detalles de promesa (si aplica)

Si seleccionaste **"Promesa de pago"**, el sistema te pedira:

1. **Fecha de pago** — Cuando se compromete a pagar el cliente.
2. **Monto prometido** — Cuanto va a pagar.
3. **Notas** — Cualquier detalle adicional (por ejemplo: "Paga el viernes despues de cobrar").

### Paso 3: Fotos y observaciones

1. Toma fotos si es necesario (fachada, carta dejada, vehiculo encontrado).
2. Escribe observaciones relevantes sobre la visita.

### Paso 4: Confirmar y enviar

1. Revisa que toda la informacion este correcta.
2. Presiona **"Confirmar y enviar"**.
3. La visita quedara registrada y tu supervisor podra verla en tiempo real.

::: warning Importante
Asegurate de tener senal de internet al momento de enviar. Si no tienes senal, la visita se guardara localmente y se enviara cuando recuperes conexion.
:::

---

## 6. Alertas de Proximidad

Tu celular puede avisarte automaticamente cuando estes cerca de un cliente importante. Recibiras una vibracion y una notificacion.

### Tipos de alerta

| Alerta | Que significa |
|--------|--------------|
| **Vehiculo en casa** | El GPS del vehiculo del cliente indica que esta en su domicilio ahora mismo |
| **Promesa por vencer** | Un cliente cercano tiene una promesa de pago que vence pronto |
| **En ventana ahora** | Un cliente cercano esta en su ventana horaria optima (alta probabilidad de estar en casa) |

### Que hacer cuando recibes una alerta

La notificacion te ofrece dos botones:
- **Navegar** — Abre Google Maps para ir directamente a ese cliente.
- **Registrar visita** — Si ya estas ahi, registra el resultado directamente.

::: tip
Para que las alertas funcionen correctamente, mantiene activado el GPS de tu celular y los permisos de ubicacion de la aplicacion.
:::

---

## 7. Vista 360 del Cliente

Cuando tocas un cliente en el mapa o en la lista y seleccionas **"Ver detalle"**, accedes a su vista completa con toda la informacion disponible.

### Informacion personal y del credito

- Nombre completo
- Numero de credito
- Monto adeudado y dias de mora
- Bucket asignado (nivel de morosidad)

### Historial de visitas y promesas

- Lista de todas las visitas anteriores con fecha, resultado y observaciones
- Promesas registradas: fecha prometida, monto, si se cumplio o no

### Ventanas horarias optimas

El sistema analiza los datos del GPS del vehiculo para determinar en que horarios es mas probable encontrar al cliente en su domicilio. Veras algo como:

| Dia | Ventana optima | Confianza |
|-----|---------------|-----------|
| Lunes a Viernes | 7:00 - 9:00 AM | Alta |
| Sabado | 10:00 AM - 1:00 PM | Media |
| Domingo | Todo el dia | Baja |

### Estado del GPS vehicular

- Si el vehiculo tiene GPS activo o no
- Ultima ubicacion conocida
- Si esta en movimiento o estacionado

### Direccion detectada vs direccion del credito

- **Direccion detectada:** Donde el GPS ha registrado que el vehiculo pernocta con mayor frecuencia.
- **Direccion del credito:** La direccion que aparece en el contrato.
- Si son diferentes, puede significar que el cliente cambio de domicilio.

---

## 8. Sistema GPS — Como Funciona

El sistema utiliza **dos fuentes de GPS independientes** que trabajan juntas para maximizar la eficiencia de la cobranza.

### Fuente 1: GPS del Celular del Cobrador

Tu celular envia tu ubicacion al sistema mientras tienes la app abierta y la ruta iniciada.

```mermaid
flowchart LR
    A["Tu celular detecta tu posicion via GPS satelital"]:::blue
    A --> B["La app envia tu ubicacion al servidor cada 15 segundos"]:::blue
    B --> C["El servidor actualiza tu posicion en el mapa del supervisor"]:::green
    C --> D["El sistema calcula si estas cerca de algun cliente"]:::green
    D --> E["Si estas en rango: te envia una alerta de proximidad"]:::alert

    classDef blue fill:#dbeafe,stroke:#2563eb,stroke-width:2px,color:#1e3a5f
    classDef green fill:#d1fae5,stroke:#059669,stroke-width:2px,color:#064e3b
    classDef alert fill:#fef9c3,stroke:#ca8a04,stroke-width:2px,color:#713f12
```

| Caracteristica | Detalle |
|---------------|---------|
| Frecuencia de envio | Cada 15 segundos (solo si te moviste mas de 10 metros) |
| Precision | 5-15 metros (exterior), 20-50 metros (interior) |
| Consumo de bateria | Moderado — se recomienda cargar el celular antes de salir |
| Requiere | GPS activado + permisos de ubicacion en el navegador |
| Se usa para | Iniciar ruta, reordenar paradas, alertas de proximidad, tracking en mapa del supervisor |

**Cuando se activa:**
1. Al presionar **"Iniciar ruta"** — toma tu posicion para reordenar paradas
2. **Durante toda la ruta** — envia tu posicion cada 15 segundos al servidor
3. **Al registrar una visita** — adjunta tu ubicacion GPS como evidencia

**Cuando NO funciona bien:**
- Dentro de edificios con techo de concreto
- En sotanos o estacionamientos subterraneos
- Con el GPS del celular apagado
- Sin permisos de ubicacion en el navegador

### Fuente 2: GPS del Vehiculo del Cliente (Moroso)

Cada vehiculo financiado tiene un dispositivo GPS fisico instalado (SeeWorld/WhatsGPS). Este GPS reporta la ubicacion del vehiculo al sistema de forma independiente.

```mermaid
flowchart LR
    A["Dispositivo GPS fisico instalado en el vehiculo del cliente"]:::blue
    A --> B["Reporta ubicacion del vehiculo al servidor cada 60 segundos"]:::blue
    B --> C["El sistema almacena la posicion en vehicle_latest_positions"]:::green
    C --> D["ML Pipeline analiza el historial para detectar residencia y ventanas horarias"]:::amber
    D --> E["El cobrador recibe: direccion de casa detectada + mejor horario para visitar"]:::green

    classDef blue fill:#dbeafe,stroke:#2563eb,stroke-width:2px,color:#1e3a5f
    classDef green fill:#d1fae5,stroke:#059669,stroke-width:2px,color:#064e3b
    classDef amber fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#78350f
```

| Caracteristica | Detalle |
|---------------|---------|
| Dispositivo | SeeWorld / WhatsGPS (fisico, instalado en el vehiculo) |
| Frecuencia | Cada 60 segundos (cuando el vehiculo esta encendido) |
| Cobertura | 4,000+ vehiculos rastreados en 3 estados (NL, Coahuila, Tamaulipas) |
| Precision | 3-10 metros (GPS satelital puro, sin depender del celular) |
| Estado | Online (vehiculo encendido o ACC activo) / Offline (vehiculo apagado) |
| Se usa para | Detectar residencia, ventanas horarias, verificar si el vehiculo esta en casa |

**Que informacion te da como cobrador:**
- **Marcador verde** en el mapa = el GPS del vehiculo dice que esta en casa ahora
- **Ventana horaria** = el sistema analizo meses de datos GPS y sabe a que hora llega a casa
- **Direccion detectada** = donde el vehiculo pernocta con mayor frecuencia (puede diferir del credito)
- **Alerta "Vehiculo en casa"** = el vehiculo acaba de llegar a la residencia detectada

### Como trabajan juntos los dos GPS

```mermaid
flowchart TD
    subgraph COBRADOR["GPS DEL COBRADOR (tu celular)"]
        A1["Tu posicion actual"]:::blue
    end

    subgraph CLIENTE["GPS DEL VEHICULO (dispositivo fisico)"]
        B1["Posicion del vehiculo del cliente"]:::amber
    end

    A1 --> C["El sistema calcula la DISTANCIA entre tu posicion y la del vehiculo del cliente"]:::green
    B1 --> C
    C --> D{"Esta el vehiculo en la residencia detectada y tu estas a menos de 1 km?"}:::decision
    D -->|"Si"| E["ALERTA: Vehiculo en casa — Tu celular vibra con la notificacion"]:::alert
    D -->|"No"| F["Sin alerta — el sistema sigue monitoreando cada 15 segundos"]:::gray

    classDef blue fill:#dbeafe,stroke:#2563eb,stroke-width:2px,color:#1e3a5f
    classDef amber fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#78350f
    classDef green fill:#d1fae5,stroke:#059669,stroke-width:2px,color:#064e3b
    classDef alert fill:#fef9c3,stroke:#ca8a04,stroke-width:2px,color:#713f12
    classDef gray fill:#f1f5f9,stroke:#94a3b8,stroke-width:1px,color:#475569
    classDef decision fill:#f0f9ff,stroke:#0284c7,stroke-width:2px,color:#0c4a6e
```

### Fallback GPS: Que pasa si tu celular no tiene senal

```mermaid
flowchart TD
    A["Presionas Iniciar Ruta"]:::blue
    A --> B{"Tu celular obtiene GPS en 3 segundos?"}:::decision
    B -->|"Si"| C["Usa las coordenadas de tu celular para reordenar la ruta"]:::green
    B -->|"No — timeout"| D["El sistema busca el GPS del vehiculo asignado al cobrador"]:::amber
    D --> E{"El GPS vehicular tiene posicion reciente?"}:::decision
    E -->|"Si"| F["Usa las coordenadas del vehiculo para reordenar la ruta"]:::green
    E -->|"No"| G["Error: No se pudo determinar ubicacion — verificar GPS"]:::red

    classDef blue fill:#dbeafe,stroke:#2563eb,stroke-width:2px,color:#1e3a5f
    classDef green fill:#d1fae5,stroke:#059669,stroke-width:2px,color:#064e3b
    classDef amber fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#78350f
    classDef red fill:#fee2e2,stroke:#dc2626,stroke-width:2px,color:#7f1d1d
    classDef decision fill:#f0f9ff,stroke:#0284c7,stroke-width:2px,color:#0c4a6e
```

### Resumen de los dos GPS

| Aspecto | GPS Celular (Cobrador) | GPS Vehiculo (Cliente) |
|---------|:---:|:---:|
| Dispositivo | Tu telefono celular | Aparato fisico en el vehiculo |
| Quien lo porta | Tu (cobrador) | El cliente (moroso) |
| Para que se usa | Saber DONDE ESTAS TU | Saber DONDE ESTA EL CLIENTE |
| Frecuencia | Cada 15 seg (app abierta) | Cada 60 seg (siempre) |
| Depende de | Bateria del celular + internet | Bateria del vehiculo |
| Funciona sin internet | No | Si (el dispositivo almacena y envia despues) |
| Precision | 5-50 metros | 3-10 metros |
| Se activa cuando | Inicias ruta en la app | Siempre (24/7) |

---

## 9. Tips y Solucion de Problemas

### Problemas frecuentes

| Problema | Solucion |
|----------|---------|
| "No me carga la ruta" | Verifica tu conexion a internet. Si tienes senal debil, intenta en un lugar con mejor cobertura. |
| "No se inicia la ruta" | El sistema necesita tu ubicacion GPS. Activa el GPS del celular. Si no funciona, el sistema usara la ubicacion del GPS del vehiculo como respaldo. |
| "No aparecen las notificaciones" | Actualiza la aplicacion deslizando hacia abajo en la pantalla (pull to refresh). Verifica que los permisos de notificacion esten activos. |
| "La app se ve rara o no actualiza" | Cierra la app completamente y vuelvela a abrir. Si sigue igual, borra la cache del navegador. |
| "No puedo tomar fotos" | Verifica que la app tenga permiso para usar la camara del celular. |

### Recomendaciones generales

1. **Mantiene el GPS del celular activado** durante toda tu jornada para una mejor experiencia.
2. **Carga tu celular** antes de salir. El GPS consume bateria.
3. **Instala la app** en tu pantalla de inicio para acceder mas rapido.
4. **Revisa tu agenda** cada manana antes de iniciar ruta. Tu supervisor puede haber agregado o quitado clientes.
5. **Registra cada visita** inmediatamente al terminarla, para que la informacion este siempre actualizada.
6. **Prioriza los marcadores verdes** en el mapa. Son clientes con alta probabilidad de estar disponibles.

---

## Credenciales de acceso rapido

| Dato | Valor |
|------|-------|
| URL | **time.agentsmx.com** |
| Pantalla principal | **time.agentsmx.com/mi-agenda/** |
| Formato de usuario | COB-GPS-XX (ejemplo: COB-GPS-01) |
| Contrasena | Proporcionada por tu supervisor |
| Soporte | Contacta a tu supervisor directo |

# Manual Sistema Supervisor

Manual de uso del dashboard de supervision para la plataforma de Cobranza Inteligente. Esta guia cubre todas las funciones disponibles en **time.agentsmx.com/dashboard/**.

## Flujo de Operacion Diaria del Supervisor

### Flujo General del Supervisor

```mermaid
flowchart TD
    A["Iniciar Sesion como SUP-CENTRAL en time.agentsmx.com/dashboard"]:::blue
    A --> B["Dashboard Principal — KPIs: morosos totales, asignados, monto recuperado, efectividad"]:::blue
    B --> C["ASIGNACION DE AGENDA"]:::amber
    B --> D["MONITOREO EN VIVO"]:::green
    B --> E["REPORTES"]:::purple
    B --> F["PIPELINE ML"]:::yellow

    classDef blue fill:#dbeafe,stroke:#2563eb,stroke-width:2px,color:#1e3a5f
    classDef green fill:#d1fae5,stroke:#059669,stroke-width:2px,color:#064e3b
    classDef amber fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#78350f
    classDef purple fill:#f3e8ff,stroke:#7c3aed,stroke-width:2px,color:#4c1d95
    classDef yellow fill:#fef9c3,stroke:#ca8a04,stroke-width:2px,color:#713f12
```

### Wizard de Asignacion (4 pasos)

```mermaid
flowchart LR
    A["Paso 1: Seleccionar Bucket B1 a B10"]:::amber
    A --> B["Paso 2: Generar Paquetes con K-Means geografico"]:::amber
    B --> C["Paso 3: Elegir Estrategia de priorizacion"]:::amber
    C --> D["Paso 4: Asignar paquete al cobrador verificando capacidad"]:::amber
    D --> E["Rutas generadas y listas para los cobradores"]:::green

    classDef amber fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#78350f
    classDef green fill:#d1fae5,stroke:#059669,stroke-width:2px,color:#064e3b
```

### Modulos del Sistema

```mermaid
flowchart TD
    subgraph MON["MONITOREO EN VIVO"]
        E1["Mapa con ubicacion de todos los cobradores en tiempo real"]:::green
        E2["Estado de cada ruta: pendiente, en progreso o completada"]:::green
        E3["Alertas automaticas cuando el sistema re-optimiza una ruta"]:::green
    end

    subgraph REP["REPORTES"]
        F1["Ejecutivo: KPIs generales, tendencias y comparativas"]:::purple
        F2["Por Cobrador: visitas realizadas, promesas obtenidas, efectividad"]:::purple
        F3["GPS y ML: residencias detectadas, trails vehiculares, predicciones"]:::purple
        F4["Promesas: cumplimiento, vencimientos proximos, montos comprometidos"]:::purple
    end

    subgraph MLP["PIPELINE ML"]
        G1["Ejecutar deteccion automatica de residencias con datos GPS"]:::yellow
        G1 --> G2["Ver residencias detectadas con nivel de confianza"]:::yellow
        G2 --> G3["Ver ventanas horarias optimas por cliente"]:::yellow
    end

    classDef green fill:#d1fae5,stroke:#059669,stroke-width:2px,color:#064e3b
    classDef purple fill:#f3e8ff,stroke:#7c3aed,stroke-width:2px,color:#4c1d95
    classDef yellow fill:#fef9c3,stroke:#ca8a04,stroke-width:2px,color:#713f12
```

## Ventajas del Sistema

| Ventaja | Descripcion |
|---------|-------------|
| Asignacion inteligente | K-Means agrupa morosos por zona geografica automaticamente |
| Rutas optimizadas | Dos modos: por reglas de bucket o por IA (K-Means + scoring) |
| Monitoreo en tiempo real | Ubicacion de cobradores y estado de visitas en vivo |
| ML Pipeline | Deteccion automatica de residencias y ventanas horarias con GPS |
| Scoring multi-nivel | 3 niveles de puntuacion (deuda, GPS, subfactores) con multiplicadores |
| Re-optimizacion automatica | Cada 5 minutos el sistema reordena paradas basado en condiciones actuales |

## Diferencias Supervisor vs Cobrador

| Funcion | Supervisor | Cobrador |
|---------|:---:|:---:|
| Dashboard con KPIs | Si | No |
| Wizard de asignacion | Si | No |
| Mapa en vivo de todos los cobradores | Si | No |
| Generar/modificar rutas | Si | No |
| Ver todas las visitas | Si | Solo las suyas |
| Ejecutar ML Pipeline | Si | No |
| Registrar visitas | No | Si |
| Navegar a clientes | No | Si |
| Alertas de proximidad | No | Si |
| Iniciar ruta desde su ubicacion | No | Si |

---

## 1. Acceso al Sistema

### Pantalla de Login

![Login Supervisor](/screens/02-sup-login.png)

### Ingresar al dashboard

1. Abre tu navegador y ve a **time.agentsmx.com/dashboard/login**.
2. Ingresa tus credenciales:

| Campo | Valor |
|-------|-------|
| Usuario | SUP-CENTRAL |
| Contrasena | Proporcionada por administracion |

3. Presiona **Iniciar sesion**.

### Diferencias entre roles

| Caracteristica | Supervisor | Cobrador |
|---------------|-----------|---------|
| URL de acceso | time.agentsmx.com/dashboard/ | time.agentsmx.com/mi-agenda/ |
| Asignar agendas | Si | No |
| Generar rutas | Si | No |
| Ver todos los cobradores | Si | No |
| Registrar visitas | No | Si |
| Ver reportes globales | Si | Solo los propios |
| Ejecutar pipeline ML | Si | No |
| Monitoreo en tiempo real | Si | No |

---

## 2. Dashboard Principal

Al ingresar veras el panel con los indicadores clave de operacion.

### KPIs generales

| Indicador | Descripcion |
|-----------|-------------|
| Morosos totales | Numero total de cuentas morosas en cartera |
| Asignados | Cuentas que ya tienen cobrador asignado |
| Completados | Visitas realizadas en el periodo actual |
| Monto recuperado | Suma total de pagos recibidos y promesas cumplidas |

### Graficas de rendimiento

- **Efectividad diaria:** Porcentaje de visitas con resultado positivo vs negativo.
- **Tendencia semanal:** Comparacion de rendimiento semana a semana.
- **Distribucion por bucket:** Cuantas cuentas hay en cada nivel de morosidad.
- **Mapa de calor:** Zonas con mayor concentracion de morosos.

---

## 3. Gestion de Agenda (Wizard de Asignacion)

El wizard te guia paso a paso para asignar cuentas a los cobradores de campo.

### Paso 1: Seleccionar bucket

Selecciona el bucket de morosidad que deseas trabajar. El sistema muestra las estadisticas de cada uno:

| Bucket | Dias de mora | Cuentas | Sin asignar |
|--------|-------------|---------|-------------|
| B1 | 1-15 | Variable | Variable |
| B2 | 16-30 | Variable | Variable |
| B3 | 31-60 | Variable | Variable |
| B4 | 61-90 | Variable | Variable |
| B5 | 91-120 | Variable | Variable |
| B6 | 121-150 | Variable | Variable |
| B7 | 151-180 | Variable | Variable |
| B8 | 181-270 | Variable | Variable |
| B9 | 271-360 | Variable | Variable |
| B10 | 360+ | Variable | Variable |

### Paso 2: Generar paquetes K-Means

1. Presiona **"Generar paquetes"**.
2. El sistema agrupa geograficamente las cuentas usando el algoritmo K-Means.
3. Cada paquete contiene cuentas cercanas entre si para minimizar tiempos de traslado.
4. Veras los paquetes representados como clusters en el mapa.

### Paso 3: Seleccionar estrategia de priorizacion

Elige como quieres que se ordenen las cuentas dentro de cada paquete:

| Estrategia | Descripcion | Cuando usarla |
|-----------|-------------|--------------|
| `debt_focused` | Prioriza cuentas con mayor monto adeudado | Cuando el objetivo es maximizar monto recuperado |
| `gps_online` | Prioriza cuentas con GPS vehicular activo | Cuando se quiere aprovechar la ubicacion en tiempo real |
| `time_window` | Prioriza cuentas con ventana horaria activa | Para maximizar la probabilidad de contacto |
| `balanced` | Combina todos los factores con pesos iguales | Para operacion general del dia a dia |
| `early_bucket` | Prioriza buckets bajos (B1-B3) | Para prevencion de escalamiento |

### Paso 4: Asignar paquete a cobrador

1. Selecciona un paquete del mapa.
2. Selecciona un cobrador de la lista disponible.
3. El sistema muestra la **capacidad del cobrador**: cuantas cuentas tiene asignadas actualmente vs su limite diario.
4. Confirma la asignacion.

::: warning Verificar capacidad
Antes de asignar, revisa que el cobrador no exceda su capacidad diaria recomendada. Un cobrador sobrecargado reduce la calidad de las visitas.
:::

---

## 4. Generacion de Rutas Diarias

### Modos de generacion

| Modo | Descripcion | Ventaja |
|------|-------------|---------|
| **Bucket (reglas)** | Genera rutas siguiendo las reglas de negocio de cada bucket | Predecible, basado en politicas establecidas |
| **AI Optimizado (K-Means)** | Genera rutas usando agrupacion geografica inteligente | Reduce tiempos de traslado, mayor cobertura |

### Generacion automatica

- El sistema genera rutas automaticamente a las **6:00 AM** cada dia.
- Usa el modo configurado como predeterminado (bucket o AI).
- Las rutas se asignan a los cobradores que ya tienen cuentas asignadas.

### Generacion manual

1. Ve a la seccion **"Rutas"** en el menu lateral.
2. Presiona **"Generar ruta manual"**.
3. Selecciona el cobrador.
4. Selecciona el modo (Bucket o AI Optimizado).
5. Presiona **"Generar"**.
6. Revisa la ruta en el mapa y confirma.

### Activar modo AI por defecto

1. Ve a **Configuracion > Generacion de rutas**.
2. Activa el toggle **"Modo AI por defecto"**.
3. A partir de ahora, la generacion automatica de las 6 AM usara K-Means.

---

## 5. Monitoreo en Tiempo Real

### Mapa en vivo

La seccion de monitoreo muestra un mapa con la ubicacion actual de todos los cobradores. Cada cobrador aparece como un marcador con su codigo (COB-GPS-XX).

### Estado de cada ruta

| Estado | Significado |
|--------|------------|
| Pendiente | La ruta fue generada pero el cobrador no la ha iniciado |
| En progreso | El cobrador inicio la ruta y esta visitando clientes |
| Completada | El cobrador termino todas las visitas de su ruta |
| Parcial | El cobrador finalizo su jornada sin completar todas las visitas |

### Alertas de re-optimizacion

El sistema puede sugerir cambios en las rutas durante el dia:
- Si un cobrador esta atrasado, puede redistribuir visitas a otro cobrador cercano.
- Si se detecta un vehiculo en casa (via GPS), el sistema alerta al cobrador mas cercano.
- Las alertas aparecen como notificaciones en la parte superior del dashboard.

---

## 6. Gestion de Cobradores

### Ver lista de cobradores

En la seccion **"Cobradores"** del menu lateral puedes ver:

| Columna | Descripcion |
|---------|-------------|
| Codigo | Identificador del cobrador (COB-GPS-XX) |
| Nombre | Nombre completo |
| Estado | Activo / Inactivo |
| Cuentas asignadas | Numero actual de cuentas en su agenda |
| Capacidad diaria | Limite de visitas por dia |
| GPS vehicular | Dispositivo GPS asignado a su vehiculo |

### Asignar y desasignar buckets

1. Selecciona un cobrador de la lista.
2. En la seccion **"Buckets asignados"**, agrega o quita los buckets que debe trabajar.
3. Guarda los cambios.

### Ver capacidad y carga

Cada cobrador tiene una vista de capacidad que muestra:
- Visitas pendientes para hoy
- Visitas completadas hoy
- Porcentaje de avance
- Carga acumulada de la semana

### Dispositivos GPS asignados

Lista de dispositivos GPS instalados en los vehiculos de los cobradores, con:
- Modelo del dispositivo
- Ultima conexion
- Estado (en linea / fuera de linea)

---

## 7. Reportes

### Reporte ejecutivo

Resumen de alto nivel con:
- Efectividad general (porcentaje de visitas positivas)
- Montos recuperados vs meta
- Tendencias de los ultimos 30 dias
- Comparacion entre cobradores

### Reporte por cobrador

Detalle individual para cada cobrador:

| Metrica | Descripcion |
|---------|-------------|
| Visitas realizadas | Total de visitas en el periodo |
| Promesas obtenidas | Numero de promesas de pago |
| Tasa de contacto | Porcentaje de visitas donde se contacto al titular |
| Rutas completadas | Porcentaje de rutas terminadas al 100% |
| Tiempo promedio por visita | Minutos promedio en cada parada |

### Reporte de GPS

Informacion derivada de los dispositivos GPS vehiculares:
- **Trails:** Rutas de movimiento de los vehiculos de los morosos.
- **Residencias detectadas:** Direcciones donde el vehiculo pernocta frecuentemente.
- **Patrones de movimiento:** Horarios en que el vehiculo se mueve o permanece estacionado.

### Reporte de promesas

Seguimiento de todas las promesas de pago:

| Columna | Descripcion |
|---------|-------------|
| Cliente | Nombre y numero de credito |
| Fecha prometida | Cuando se comprometio a pagar |
| Monto prometido | Cuanto va a pagar |
| Estado | Cumplida / Pendiente / Vencida / Incumplida |
| Cobrador | Quien registro la promesa |

---

## 8. Pipeline ML

El pipeline de Machine Learning analiza los datos GPS para generar inteligencia sobre los morosos.

### Ejecutar pipeline

1. Ve a la seccion **"ML Pipeline"** en el menu lateral.
2. Presiona **"Ejecutar pipeline"**.
3. El proceso tarda entre 5 y 30 minutos dependiendo del volumen de datos.
4. Al terminar, los resultados se actualizan automaticamente en las agendas de los cobradores.

### Resultados del pipeline

| Resultado | Descripcion |
|-----------|-------------|
| Residencias detectadas | Direcciones donde el vehiculo pernocta, diferentes a la del credito |
| Ventanas horarias | Franjas de tiempo en que el vehiculo esta estacionado en la residencia |
| Predicciones de presencia | Probabilidad de encontrar el vehiculo en la residencia por dia y hora |

### Niveles de confianza

| Nivel | Significado | Criterio |
|-------|------------|---------|
| **Alta** | El sistema tiene certeza razonable | Mas de 20 noches detectadas en la misma ubicacion |
| **Media** | Patron identificado pero con variaciones | Entre 10 y 20 noches detectadas |
| **Baja** | Datos insuficientes o patron irregular | Menos de 10 noches detectadas |

Los niveles de confianza se muestran en la vista 360 de cada cliente y afectan la priorizacion en las agendas.

---

## 9. Sistema GPS — Vision del Supervisor

Como supervisor, tienes acceso a toda la infraestructura GPS del sistema. Aqui se explica como funciona cada componente.

### Arquitectura GPS Completa

```mermaid
flowchart TD
    subgraph VEHICULOS["GPS VEHICULOS (4,000+ dispositivos)"]
        V1["Dispositivo GPS fisico SeeWorld/WhatsGPS instalado en cada vehiculo financiado"]:::blue
        V1 --> V2["Reporta posicion cada 60 segundos al servidor central"]:::blue
        V2 --> V3["Se almacena en vehicle_latest_positions y TimescaleDB"]:::blue
    end

    subgraph COBRADORES["GPS COBRADORES (9 celulares)"]
        C1["PWA en el celular del cobrador con GPS activado"]:::amber
        C1 --> C2["Envia posicion cada 15 segundos durante la ruta"]:::amber
        C2 --> C3["Se almacena en collector_positions"]:::amber
    end

    subgraph ML["PIPELINE ML — Analisis"]
        M1["HDBSCAN: detecta residencia del cliente analizando donde pernocta el vehiculo"]:::green
        M2["KDE: detecta ventanas horarias analizando a que hora llega y sale"]:::green
        M3["Scoring: calcula probabilidad de encontrar al cliente en cada horario"]:::green
        M1 --> M2 --> M3
    end

    subgraph ROUTING["SMART ROUTE ENGINE"]
        R1["Combina posicion del cobrador + posicion del vehiculo + ventanas ML"]:::purple
        R2["Genera ruta optimizada priorizando paradas en ventana horaria activa"]:::purple
        R3["Re-optimiza cada 5 minutos si cambian las condiciones"]:::purple
        R1 --> R2 --> R3
    end

    V3 --> M1
    V3 --> R1
    C3 --> R1
    M3 --> R1

    classDef blue fill:#dbeafe,stroke:#2563eb,stroke-width:2px,color:#1e3a5f
    classDef amber fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#78350f
    classDef green fill:#d1fae5,stroke:#059669,stroke-width:2px,color:#064e3b
    classDef purple fill:#f3e8ff,stroke:#7c3aed,stroke-width:2px,color:#4c1d95
```

### GPS de Vehiculos — Lo que ve el supervisor

| Dato | Donde verlo | Para que sirve |
|------|-------------|---------------|
| Vehiculo online/offline | Mapa en vivo + detalle de cliente | Saber si el vehiculo tiene GPS activo |
| Ultima posicion conocida | Mapa en vivo | Localizar el vehiculo en tiempo real |
| Residencia detectada (ML) | Detalle de cliente, seccion ML | Saber donde vive realmente el moroso |
| Ventanas horarias | Detalle de cliente, seccion ventanas | Saber a que hora visitar |
| Confianza de deteccion | Pipeline ML, resultados | Alta, Media o Baja — que tan seguro es el dato |
| Trail vehicular | Reportes GPS | Historial de movimientos del vehiculo |

### GPS de Cobradores — Lo que ve el supervisor

| Dato | Donde verlo | Para que sirve |
|------|-------------|---------------|
| Posicion actual del cobrador | Mapa en vivo | Monitorear donde esta cada cobrador |
| Ruta recorrida | Reportes por cobrador, trail | Verificar que el cobrador fue a las direcciones |
| Hora de inicio de ruta | Estado de rutas | Verificar puntualidad |
| Distancia recorrida | Reporte diario | Medir eficiencia del cobrador |
| Visitas con GPS | Historial de visitas | Evidencia de que el cobrador estuvo en el domicilio |

### Flujo de Datos GPS — De la fuente al cobrador

```mermaid
flowchart LR
    A["GPS fisico en vehiculo del cliente"]:::blue
    A -->|"Cada 60s"| B["Backend: vehicle_latest_positions"]:::blue
    B -->|"Semanal"| C["ML Pipeline: detecta residencia + ventanas"]:::green
    C --> D["detected_locations + time_windows en BD"]:::green
    D -->|"Diario 6AM"| E["Generador de rutas: usa ventanas para ordenar paradas"]:::amber
    E --> F["Ruta optimizada aparece en la PWA del cobrador"]:::amber
    F -->|"Cada 5 min"| G["Smart Optimizer: re-ordena si el vehiculo aparece en casa"]:::purple

    classDef blue fill:#dbeafe,stroke:#2563eb,stroke-width:2px,color:#1e3a5f
    classDef green fill:#d1fae5,stroke:#059669,stroke-width:2px,color:#064e3b
    classDef amber fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#78350f
    classDef purple fill:#f3e8ff,stroke:#7c3aed,stroke-width:2px,color:#4c1d95
```

### Estadisticas del GPS

| Metrica | Valor actual |
|---------|:---:|
| Vehiculos con GPS | 4,000+ |
| Cuentas GPS (Datamovil) | 4 cuentas (1000+499+1000+1000) |
| Morosos con GPS activo | 172 de 794 (21.7%) |
| Residencias detectadas | 165 de 172 (96%) |
| Cobradores con tracking | 9 activos |
| Frecuencia vehiculos | Cada 60 segundos |
| Frecuencia cobradores | Cada 15 segundos |

### Situaciones comunes del GPS

| Situacion | Que indica | Que hacer |
|-----------|-----------|-----------|
| Vehiculo online en casa | El moroso esta probablemente en su domicilio | Priorizar esta visita — alta probabilidad de contacto |
| Vehiculo online pero lejos | El moroso salio de casa | Esperar a que regrese o visitar en la ventana horaria |
| Vehiculo offline >7 dias | GPS desconectado, posible bateria desconectada | Marcar como visita prioritaria para verificar fisicamente |
| Vehiculo en taller conocido | GPS detecta ubicacion en taller de adjudicacion | No visitar — vehiculo en proceso de adjudicacion |
| Cobrador sin GPS | Celular sin senal o GPS apagado | El sistema usa la posicion del GPS del vehiculo como fallback |

---

## 10. Reglas de Negocio por Bucket

Cada bucket tiene reglas especificas que determinan la frecuencia de visitas, promesas permitidas y montos minimos.

### Tabla de reglas B1-B10

| Bucket | Dias mora | Frecuencia de visita | Promesas permitidas | Monto minimo de pago | Tipo de visita |
|--------|----------|---------------------|--------------------|--------------------|---------------|
| B1 | 1-15 | 1 vez por semana | 2 | 1 mensualidad | Preventiva |
| B2 | 16-30 | 2 veces por semana | 2 | 1 mensualidad | Preventiva |
| B3 | 31-60 | 2 veces por semana | 1 | 2 mensualidades | Gestion |
| B4 | 61-90 | 3 veces por semana | 1 | 2 mensualidades | Gestion |
| B5 | 91-120 | Diaria | 1 | 3 mensualidades | Intensiva |
| B6 | 121-150 | Diaria | 1 | Liquidacion o convenio | Intensiva |
| B7 | 151-180 | Diaria | 0 | Liquidacion | Juridica |
| B8 | 181-270 | Oportunista | 0 | Liquidacion | Juridica |
| B9 | 271-360 | Oportunista | 0 | Liquidacion | Juridica |
| B10 | 360+ | Oportunista | 0 | Recuperacion vehicular | Recuperacion |

### Escalamiento entre buckets

Un cliente escala automaticamente al siguiente bucket cuando:
- Se cumple el rango de dias de mora del siguiente nivel.
- Incumple una promesa de pago.
- No se logra contacto en el periodo establecido.

El escalamiento ocurre de forma automatica en el sistema. El supervisor es notificado cuando un cliente cambia de bucket.

### Visitas oportunistas (B5-B10)

Para buckets altos (B5 en adelante), el sistema genera **visitas oportunistas**:
- No se programan en la ruta regular.
- Aparecen como alertas cuando el cobrador pasa cerca de la direccion del moroso.
- Se activan solo si el GPS vehicular indica que el vehiculo del moroso esta en la ubicacion.
- El cobrador decide si realiza la visita o continua con su ruta.

::: info Nota
Las visitas oportunistas son especialmente efectivas en B8-B10 donde los clientes son dificiles de localizar. El GPS vehicular permite detectar cuando estan disponibles sin gastar recursos en visitas programadas.
:::

---

## Credenciales de acceso rapido

| Dato | Valor |
|------|-------|
| URL Dashboard | **time.agentsmx.com/dashboard/** |
| Login | **time.agentsmx.com/dashboard/login** |
| Formato de usuario supervisor | SUP-CENTRAL |
| Contrasena | Proporcionada por administracion |
| URL PWA Cobrador | **time.agentsmx.com/mi-agenda/** |
| Formato de usuario cobrador | COB-GPS-XX |
| Soporte | Contactar al administrador del sistema |

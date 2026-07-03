# Examen DeliverUS - Modelo E - Control de Saturación de Pedidos

Recuerde que DeliverUS está descrito en: <https://github.com/IISSI2-IS>

## Enunciado del examen

Se ha detectado que algunos restaurantes se saturan con demasiados pedidos simultáneos. Para solucionar esto, vamos a introducir un sistema de **Control de Saturación de Pedidos** basado en una ventana temporal de 2 horas.

### El Requisito de Negocio

1. **Restaurantes Ilimitados**: Un propietario puede marcar hasta **3** de sus restaurantes como "Ilimitados" (`isUnlimited`). Estos restaurantes pueden recibir tantos pedidos como quieran sin restricciones.
2. **Restaurantes Estándar (Límite)**: El resto de restaurantes se consideran "saturados" si han recibido **algún pedido en las últimas 2 horas**.
3. **Visibilidad en el Frontend**: El sistema debe informar de cuántos pedidos lleva cada restaurante en las últimas 2h y si está saturado.

Es necesaria la implementación de los siguientes requisitos funcionales:

### **RF1. Gestión de Restaurantes Ilimitados**
**Como** propietario, 

**quiero** poder establecer algunos de mis restaurantes como ilimitados 

**para** que no se vean afectados por la saturación, sabiendo que mi cuenta está limitada a un máximo de **3** restaurantes con esta condición.

**Pruebas de aceptación:**
- Si un propietario intenta establecer un cuarto restaurante como ilimitado, el sistema debe devolver un error `409 Conflict`.

---

## Ejercicios

### 1. Migraciones y Modelos (1 punto)
Cree o modifique las migraciones necesarias para implementar los requisitos, así como cree o modifique los modelos necesarios.

Tenga en cuenta que los atributos han de llamarse `isUnlimited`, `ordersInLastTwoHours` y `isClosedByLimit`.


### 2. Conteo de pedidos (2.5 puntos)
Implemente el método `getOrdersInLastTwoHours()` en `src/models/Restaurant.js`. Para facilitar la tarea, se le proporciona el esqueleto de la función incluyendo el acceso al ID del restaurante actual (`const restaurantId = this.id`), y una variable que contiene la fecha/hora de hace dos horas.

### 3. Estado de Saturación (1.5 puntos)
Implemente el método `getIsClosedByLimit()` en `src/models/Restaurant.js`.

### 4. Límite de Restaurantes Ilimitados (2.5 puntos)
Devuelva el error `409 Conflict` si un propietario intenta establecer un cuarto restaurante como ilimitado.

### 5. Conmutar límite de Restaurante (2.5 puntos)
Implemente el endpoint `PATCH /restaurants/:restaurantId/toggleIsUnlimited`.
El controlador debe conmutar el estado de `isUnlimited` teniendo en cuenta las restricciones y devolver el restaurante actualizado en formato JSON.

---

## Código Proporcionado

Para este examen, se le entrega el siguiente código ya implementado para asegurar el correcto funcionamiento del sistema:

1. **Esqueletos de funciones**: En `Restaurant.js` encontrará los nombres de las funciones y la línea `const restaurantId = this.id` ya escrita.

2. Se le propocionan las siguientes propiedades derivadas (virtuales) ya incluidas en el modelo `Restaurant.js`
```javascript
ordersInLastTwoHours: {
      type: DataTypes.VIRTUAL
    },
    isClosedByLimit: {
      type: DataTypes.VIRTUAL
    },
```

3. No se preocupe por el procedimiento para asignar valor a dichos atributos cuando se hacen consultas con find, esa lógica se le ha proporcionado en el proyecto.


## Procedimiento de entrega

1. Borrar la carpeta **node_modules** de backend.
1. Crear un ZIP que incluya todo el proyecto. **Importante: Comprueba que el ZIP no es el mismo que te has descargado e incluye tu solución**
1. Avisa al profesor antes de entregar.
1. Cuando el profesor te dé el visto bueno, puedes subir el ZIP a la plataforma de Enseñanza Virtual. **Es muy importante esperar a que la plataforma te muestre un enlace al ZIP antes de pulsar el botón de enviar**. Se recomienda descargar ese ZIP para comprobar lo que se ha subido. Un vez realizada la comprobación, puedes enviar el examen.

## Preparación del entorno

### a) Windows

* Abra un terminal y ejecute el comando `npm run install:all:win`.

### b) Linux/MacOS

* Abra un terminal y ejecute el comando `npm run install:all:bash`.

## Ejecución

### 1. Backend

* Para **rehacer las migraciones y seeders**, abra un terminal y ejecute el comando

    ```Bash
    npm run migrate:backend
    ```

* Para **ejecutarlo**, abra un terminal y ejecute el comando

    ```Bash
    npm run start:backend
    ```
    
## Depuración

* Para **depurar el backend**, asegúrese de que **NO** existe una instancia en ejecución, pulse en el botón `Run and Debug` de la barra lateral, seleccione `Debug Backend` en la lista desplegable, y pulse el botón de *Play*.


## Test

* Como ayuda puede ejecutar el conjunto de tests incluido `unlimitedOrders.test.js`. También se incluye un seeder específico para estas pruebas  `20260319121000-unlimited-orders-seeder.js`. Para ello ejecute el siguiente comando:

    ```Bash
    npm run test:backend
    ```

**Advertencia: Los tests no pueden ser modificados.**

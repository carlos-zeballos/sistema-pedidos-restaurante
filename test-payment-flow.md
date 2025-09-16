# Flujo de Pagos - Guía de Pruebas

## Resumen de Cambios

### 1. Base de Datos
- ✅ Función `process_payment()` creada
- ✅ Estados de pedidos sincronizados
- ✅ Campo `isPaid` sincronizado con pagos

### 2. Backend
- ✅ Servicio `PaymentsService` creado
- ✅ Controlador `PaymentsController` creado
- ✅ Módulo `PaymentsModule` creado
- ✅ Estado "PAGADO" agregado a las interfaces

## Nuevo Flujo de Pagos

### 1. Crear Pedido
```bash
POST /orders
{
  "spaceid": "uuid-del-espacio",
  "createdby": "uuid-del-usuario",
  "customername": "Cliente Test",
  "items": [...],
  "totalamount": 59.90
}
```
**Resultado:** Pedido creado con estado `PENDIENTE`

### 2. Confirmar Pago
```bash
POST /payments/confirm
{
  "orderId": "uuid-del-pedido",
  "paymentMethodId": "uuid-del-metodo-pago",
  "amount": 59.90,
  "baseAmount": 59.90,
  "surchargeAmount": 0,
  "isDeliveryService": false
}
```
**Resultado:** 
- ✅ Pago insertado en `OrderPayment`
- ✅ Estado del pedido cambia a `PAGADO`
- ✅ Campo `isPaid` se marca como `true`
- ✅ Historial registrado

### 3. Finalizar Pedido
```bash
PUT /orders/{id}/status
{
  "status": "PAGADO"
}
```
**Resultado:** Estado cambia a `PAGADO` (proceso finalizado)

## Endpoints Disponibles

### Pagos
- `POST /payments/confirm` - Confirmar pago
- `GET /payments/order/{orderId}` - Ver pagos de una orden
- `GET /payments/methods` - Listar métodos de pago

### Órdenes
- `POST /orders` - Crear pedido
- `PUT /orders/{id}/status` - Cambiar estado (incluye PAGADO)

## Estados de Pedidos

1. **PENDIENTE** - Pedido creado, no pagado
2. **EN_PREPARACION** - En cocina, no pagado
3. **LISTO** - Listo para entregar, no pagado
4. **PAGADO** - Pedido finalizado (sin importar método de pago)
5. **CANCELADO** - Pedido cancelado

## Reportes

Los reportes de métodos de pago ahora mostrarán:
- ✅ Todos los pedidos con estado `PAGADO`
- ✅ Todos los pedidos con `isPaid = true`
- ✅ Todos los pedidos que tienen registros en `OrderPayment`

## Pruebas Recomendadas

1. **Crear pedido** → Verificar estado `PENDIENTE`
2. **Confirmar pago** → Verificar estado `PAGADO` y `isPaid = true`
3. **Finalizar pedido** → Verificar estado `PAGADO` (proceso completado)
4. **Ver reportes** → Verificar que aparezcan en métodos de pago
5. **Crear pedido sin pagar** → Verificar que NO aparezca en reportes

## Notas Importantes

- **La función `process_payment()` maneja todo automáticamente**
- **No más inconsistencias entre estados y pagos**
- **Los reportes funcionarán correctamente**
- **Los pedidos nuevos seguirán la lógica correcta**

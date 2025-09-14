require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugOrderTimer() {
  console.log('🔍 Diagnosticando cronómetro de órdenes...\n');

  try {
    // 1. Obtener órdenes activas
    console.log('1️⃣ Obteniendo órdenes activas...');
    const { data: orders, error: ordersError } = await supabase
      .from('Order')
      .select(`
        *,
        items:OrderItem(
          *,
          components:OrderItemComponent(*)
        ),
        space:Space(*)
      `)
      .in('status', ['PENDIENTE', 'EN_PREPARACION'])
      .order('createdAt', { ascending: true });

    if (ordersError) {
      console.error('❌ Error obteniendo órdenes:', ordersError.message);
      return;
    }

    console.log(`   ✅ Órdenes activas encontradas: ${orders.length}`);

    if (orders.length === 0) {
      console.log('   ⚠️  No hay órdenes activas para probar el cronómetro');
      console.log('   💡 Creando una orden de prueba...');
      
      // Crear una orden de prueba
      const testOrder = {
        spaceid: '9c82ca4e-b15f-4f96-ad82-aa423dd0c28c', // Delivery 1
        createdby: '1a8a16ea-b645-457c-a3d1-86ca00159b7b',
        customername: 'Cliente Cronómetro Test',
        customerphone: '123456789',
        items: [
          {
            productId: 'c015c69d-2212-46b4-9594-8d97905b3116',
            name: 'Producto Test Cronómetro',
            unitPrice: 20.00,
            totalPrice: 20.00,
            quantity: 1,
            notes: 'Orden para probar cronómetro'
          }
        ],
        notes: 'Orden de prueba para cronómetro',
        totalamount: 20.00,
        subtotal: 20.00,
        tax: 0.00,
        discount: 0.00
      };

      const { data: newOrder, error: createError } = await supabase
        .rpc('create_order_with_items', {
          p_space_id: testOrder.spaceid,
          p_customer_name: testOrder.customername,
          p_customer_phone: testOrder.customerphone,
          p_total_amount: testOrder.totalamount,
          p_items: testOrder.items,
          p_notes: testOrder.notes,
          p_created_by: testOrder.createdby,
          p_tax: testOrder.tax,
          p_discount: testOrder.discount
        });

      if (createError) {
        console.error('❌ Error creando orden de prueba:', createError.message);
        return;
      }

      console.log(`   ✅ Orden de prueba creada: ${newOrder[0].ordernumber}`);
      
      // Obtener la orden creada
      const { data: createdOrder, error: getError } = await supabase
        .from('Order')
        .select(`
          *,
          items:OrderItem(
            *,
            components:OrderItemComponent(*)
          ),
          space:Space(*)
        `)
        .eq('id', newOrder[0].id)
        .single();

      if (getError) {
        console.error('❌ Error obteniendo orden creada:', getError.message);
        return;
      }

      orders.push(createdOrder);
    }

    // 2. Analizar cada orden
    console.log('\n2️⃣ Analizando cronómetros de órdenes...');
    const now = new Date();
    
    orders.forEach((order, index) => {
      console.log(`\n   📋 Orden ${index + 1}: ${order.orderNumber}`);
      console.log(`      - ID: ${order.id}`);
      console.log(`      - Estado: ${order.status}`);
      console.log(`      - Mesa: ${order.space?.name || 'N/A'}`);
      console.log(`      - Items: ${order.items?.length || 0}`);
      
      // Verificar createdAt
      if (!order.createdAt) {
        console.log(`      ❌ PROBLEMA: No tiene createdAt`);
        return;
      }
      
      const createdAt = new Date(order.createdAt);
      const elapsedMs = now.getTime() - createdAt.getTime();
      const elapsedSeconds = Math.floor(elapsedMs / 1000);
      
      console.log(`      - Creada: ${order.createdAt}`);
      console.log(`      - Creada (parsed): ${createdAt.toISOString()}`);
      console.log(`      - Tiempo actual: ${now.toISOString()}`);
      console.log(`      - Diferencia (ms): ${elapsedMs}`);
      console.log(`      - Tiempo transcurrido: ${elapsedSeconds} segundos`);
      
      // Formatear tiempo
      const hours = Math.floor(elapsedSeconds / 3600);
      const minutes = Math.floor((elapsedSeconds % 3600) / 60);
      const seconds = elapsedSeconds % 60;
      const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      
      console.log(`      - Formato cronómetro: ${formattedTime}`);
      
      // Verificar si hay problema de zona horaria
      if (elapsedMs < 0) {
        console.log(`      ❌ PROBLEMA: Tiempo negativo (zona horaria)`);
      } else if (elapsedMs === 0) {
        console.log(`      ⚠️  ADVERTENCIA: Tiempo 0 (puede ser problema de precisión)`);
      } else {
        console.log(`      ✅ Cronómetro debería funcionar correctamente`);
      }
      
      // Verificar items
      if (order.items && order.items.length > 0) {
        console.log(`      - Items detallados:`);
        order.items.forEach((item, itemIndex) => {
          console.log(`         ${itemIndex + 1}. ${item.name} - $${item.totalprice}`);
          console.log(`            - Creado: ${item.createdat || 'N/A'}`);
          console.log(`            - Estado: ${item.status}`);
        });
      }
    });

    // 3. Verificar si el problema está en el frontend
    console.log('\n3️⃣ Verificando datos para el frontend...');
    console.log('   📋 Datos que debería recibir el frontend:');
    console.log(`   - Total órdenes: ${orders.length}`);
    console.log(`   - Órdenes con createdAt válido: ${orders.filter(o => o.createdAt).length}`);
    console.log(`   - Órdenes con items: ${orders.filter(o => o.items && o.items.length > 0).length}`);
    
    // 4. Simular cálculo del frontend
    console.log('\n4️⃣ Simulando cálculo del frontend...');
    orders.forEach((order, index) => {
      if (!order.createdAt) return;
      
      const startTime = order.createdAt;
      const startTimeDate = new Date(startTime);
      const currentTime = new Date();
      const elapsedSeconds = Math.max(0, Math.floor((currentTime.getTime() - startTimeDate.getTime()) / 1000));
      
      const hours = Math.floor(elapsedSeconds / 3600);
      const minutes = Math.floor((elapsedSeconds % 3600) / 60);
      const seconds = elapsedSeconds % 60;
      
      console.log(`   Orden ${order.orderNumber}:`);
      console.log(`      - startTime: ${startTime}`);
      console.log(`      - startTimeDate: ${startTimeDate.toISOString()}`);
      console.log(`      - currentTime: ${currentTime.toISOString()}`);
      console.log(`      - elapsedSeconds: ${elapsedSeconds}`);
      console.log(`      - Formato: ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    });

    console.log('\n🎯 Diagnóstico completado!');
    console.log('💡 Revisa la consola del navegador para ver los logs del frontend');

  } catch (error) {
    console.error('❌ Error durante el diagnóstico:', error);
  }
}

debugOrderTimer();












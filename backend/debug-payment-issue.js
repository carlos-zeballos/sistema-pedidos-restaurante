require('dotenv').config();
const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

async function debugPaymentIssue() {
  console.log('🔍 Diagnosticando problema de pago...\n');

  try {
    // 1. Obtener una orden activa
    console.log('1️⃣ Obteniendo orden activa...');
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    const { data: orders, error: ordersError } = await supabase
      .from('Order')
      .select('*')
      .in('status', ['PENDIENTE', 'EN_PREPARACION'])
      .limit(1);

    if (ordersError) {
      console.error('❌ Error obteniendo órdenes:', ordersError.message);
      return;
    }

    if (orders.length === 0) {
      console.log('⚠️  No hay órdenes activas para probar');
      return;
    }

    const order = orders[0];
    console.log(`   ✅ Orden encontrada: ${order.orderNumber}`);
    console.log(`   📋 ID: ${order.id}`);
    console.log(`   📊 Estado: ${order.status}`);

    // 2. Probar endpoint de pago
    console.log('\n2️⃣ Probando endpoint de pago...');
    try {
      const paymentResponse = await axios.put(`${API_BASE_URL}/orders/test/${order.id}/status`, {
        status: 'PAGADO'
      });
      console.log('   ✅ Pago exitoso:', paymentResponse.data);
    } catch (error) {
      console.log('   ❌ Error en pago:', error.response?.status);
      console.log('   📋 Mensaje:', error.response?.data?.message || error.message);
      console.log('   📋 Datos completos:', error.response?.data);
    }

    // 3. Verificar si el endpoint existe
    console.log('\n3️⃣ Verificando si el endpoint existe...');
    try {
      const testResponse = await axios.put(`${API_BASE_URL}/orders/test/${order.id}/status`, {
        status: 'PAGADO'
      }, {
        timeout: 5000
      });
      console.log('   ✅ Endpoint responde:', testResponse.status);
    } catch (error) {
      console.log('   ❌ Endpoint no responde:', error.code);
      console.log('   📋 Error:', error.message);
    }

    // 4. Probar con método diferente
    console.log('\n4️⃣ Probando método alternativo...');
    try {
      // Usar Supabase directamente
      const { data: updatedOrder, error: updateError } = await supabase
        .from('Order')
        .update({ status: 'PAGADO' })
        .eq('id', order.id)
        .select()
        .single();

      if (updateError) {
        console.log('   ❌ Error actualizando orden:', updateError.message);
      } else {
        console.log('   ✅ Orden actualizada directamente:', updatedOrder.status);
        
        // Liberar espacio
        const { error: spaceError } = await supabase
          .from('Space')
          .update({ status: 'LIBRE' })
          .eq('id', order.spaceId);

        if (spaceError) {
          console.log('   ❌ Error liberando espacio:', spaceError.message);
        } else {
          console.log('   ✅ Espacio liberado');
        }
      }
    } catch (error) {
      console.log('   ❌ Error en método alternativo:', error.message);
    }

  } catch (error) {
    console.error('❌ Error durante el diagnóstico:', error);
  }
}

debugPaymentIssue();











const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function runPaymentFixes() {
  console.log('🚀 Iniciando corrección de sistema de pagos...\n');
  
  try {
    // Paso 1: Verificar estado actual
    console.log('=== PASO 1: Verificando estado actual ===');
    
    const { data: paidOrders, error: paidError } = await supabase
      .from('Order')
      .select('id, orderNumber, status, finalTotal, totalAmount')
      .eq('status', 'PAGADO')
      .order('createdAt', { ascending: false });
      
    if (paidError) {
      console.error('❌ Error obteniendo órdenes PAGADO:', paidError);
      return;
    }
    
    console.log(`📊 Órdenes PAGADO encontradas: ${paidOrders?.length || 0}`);
    
    // Paso 2: Verificar métodos de pago
    console.log('\n=== PASO 2: Verificando métodos de pago ===');
    
    const { data: paymentMethod, error: methodError } = await supabase
      .from('PaymentMethod')
      .select('id, name')
      .eq('name', 'EFECTIVO')
      .eq('isActive', true)
      .single();
      
    if (methodError || !paymentMethod) {
      console.error('❌ Error obteniendo método EFECTIVO:', methodError);
      return;
    }
    
    console.log(`✅ Método EFECTIVO encontrado: ${paymentMethod.id}`);
    
    // Paso 3: Corregir órdenes sin pagos
    console.log('\n=== PASO 3: Corrigiendo órdenes sin pagos ===');
    
    if (!paidOrders || paidOrders.length === 0) {
      console.log('ℹ️ No hay órdenes PAGADO para corregir');
    } else {
      let fixedCount = 0;
      let skippedCount = 0;
      
      for (const order of paidOrders) {
        // Verificar si ya tiene pagos
        const { data: existingPayments, error: checkError } = await supabase
          .from('OrderPayment')
          .select('id')
          .eq('orderId', order.id);
          
        if (checkError) {
          console.error(`❌ Error verificando pagos para ${order.orderNumber}:`, checkError);
          continue;
        }
        
        if (existingPayments && existingPayments.length > 0) {
          console.log(`⏭️ ${order.orderNumber}: Ya tiene pagos registrados`);
          skippedCount++;
          continue;
        }
        
        // Registrar pago automático
        const amount = order.finalTotal || order.totalAmount || 0;
        const { error: paymentError } = await supabase
          .from('OrderPayment')
          .insert({
            orderId: order.id,
            paymentMethodId: paymentMethod.id,
            amount: amount,
            baseAmount: amount,
            surchargeAmount: 0,
            isDeliveryService: false,
            notes: 'Pago automático - corrección de datos históricos',
            paymentDate: new Date().toISOString()
          });
          
        if (paymentError) {
          console.error(`❌ Error registrando pago para ${order.orderNumber}:`, paymentError);
        } else {
          console.log(`✅ ${order.orderNumber}: Pago S/ ${amount} registrado`);
          fixedCount++;
        }
      }
      
      console.log(`\n📈 Resumen de corrección:`);
      console.log(`   - Órdenes corregidas: ${fixedCount}`);
      console.log(`   - Órdenes saltadas: ${skippedCount}`);
      console.log(`   - Total procesadas: ${paidOrders.length}`);
    }
    
    // Paso 4: Verificar corrección
    console.log('\n=== PASO 4: Verificando corrección ===');
    
    const { data: reportData, error: reportError } = await supabase
      .rpc('get_orders_report_by_date', {
        p_from_date: null,
        p_to_date: null,
        p_status: 'PAGADO',
        p_space_type: null,
        p_limit: 5,
        p_offset: 0
      });
      
    if (reportError) {
      console.error('❌ Error en función de reportes:', reportError);
      return;
    }
    
    if (reportData && reportData.length > 0) {
      const result = reportData[0];
      console.log(`📊 Órdenes PAGADO en reporte: ${result.total_count}`);
      
      if (result.orders && result.orders.length > 0) {
        console.log('\n🔍 Verificando primeras 5 órdenes PAGADO:');
        result.orders.forEach((order, index) => {
          const hasPayments = order.payments && order.payments.length > 0;
          const status = hasPayments ? '✅' : '❌';
          console.log(`${status} ${order.orderNumber}: S/ ${order.finalTotal} - Pagos: ${order.paidTotal} (${order.payments?.length || 0} registros)`);
        });
      }
    }
    
    console.log('\n🎉 Corrección completada exitosamente!');
    console.log('\n📝 Próximos pasos:');
    console.log('   1. Las nuevas órdenes marcadas como PAGADO registrarán pagos automáticamente');
    console.log('   2. Los reportes ahora mostrarán los montos pagados correctamente');
    console.log('   3. Reinicia el backend para aplicar los cambios');
    
  } catch (error) {
    console.error('💥 Error general:', error);
  }
}

runPaymentFixes().catch(console.error);

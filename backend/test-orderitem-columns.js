require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function testOrderItemColumns() {
  console.log('🔍 Probando columnas de OrderItem...');

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    // Primero, crear una orden de prueba
    console.log('📝 Creando orden de prueba...');
    const { data: orderData, error: orderError } = await supabase
      .from('Order')
      .insert({
        "spaceId": "aa09d6a3-f05c-4f14-8f72-92139f5a42cf",
        "customerName": "Test Cliente",
        "customerPhone": "123456789",
        status: "PENDIENTE",
        "totalAmount": 15.9,
        subtotal: 15.9,
        tax: 0,
        discount: 0,
        notes: "Test para verificar columnas",
        "createdBy": "1a8a16ea-b645-457c-a3d1-86ca00159b7b"
      })
      .select()
      .single();

    if (orderError) {
      console.log('❌ Error al crear orden:', orderError);
      return;
    }

    console.log('✅ Orden creada:', orderData.id);

    // Probar inserción mínima en OrderItem
    console.log('\n🧪 Probando inserción mínima en OrderItem...');
    
    const minimalData = {
      name: "Test Product",
      quantity: 1,
      notes: "Test"
    };

    try {
      const { data, error } = await supabase
        .from('OrderItem')
        .insert(minimalData)
        .select()
        .single();

      if (error) {
        console.log('❌ Error con datos mínimos:', error.message);
        
        // Si falla, probar con diferentes variaciones de orderId
        const variations = [
          { "orderId": orderData.id },
          { "order_id": orderData.id },
          { "orderid": orderData.id },
          { "OrderId": orderData.id }
        ];

        for (const variation of variations) {
          console.log(`\n🧪 Probando con: ${Object.keys(variation)[0]}`);
          try {
            const testData = { ...minimalData, ...variation };
            const { data: testResult, error: testError } = await supabase
              .from('OrderItem')
              .insert(testData)
              .select()
              .single();

            if (testError) {
              console.log(`❌ Error: ${testError.message}`);
            } else {
              console.log(`✅ Éxito con ${Object.keys(variation)[0]}:`, testResult);
              break;
            }
          } catch (err) {
            console.log(`❌ Excepción: ${err.message}`);
          }
        }
      } else {
        console.log('✅ Éxito con datos mínimos:', data);
      }
    } catch (err) {
      console.log('❌ Excepción general:', err.message);
    }

    // Limpiar orden de prueba
    console.log('\n🧹 Limpiando orden de prueba...');
    await supabase.from('Order').delete().eq('id', orderData.id);

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

testOrderItemColumns().catch(console.error);















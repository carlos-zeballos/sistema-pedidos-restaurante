require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function testOrderItemInsert() {
  console.log('🔍 Probando inserción en OrderItem para ver estructura...');

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
        notes: "Test para verificar estructura",
        "createdBy": "1a8a16ea-b645-457c-a3d1-86ca00159b7b"
      })
      .select()
      .single();

    if (orderError) {
      console.log('❌ Error al crear orden:', orderError);
      return;
    }

    console.log('✅ Orden creada:', orderData.id);

    // Ahora probar diferentes variaciones de columnas para OrderItem
    const testCases = [
      {
        name: "Test con orderId (camelCase)",
        data: {
          "orderId": orderData.id,
          "productId": "c015c69d-2212-46b4-9594-8d97905b3116",
          name: "Test Product",
          quantity: 1,
          "unitPrice": 15.9,
          "totalPrice": 15.9,
          notes: "Test",
          status: "PENDIENTE"
        }
      },
      {
        name: "Test con order_id (snake_case)",
        data: {
          "order_id": orderData.id,
          "product_id": "c015c69d-2212-46b4-9594-8d97905b3116",
          name: "Test Product",
          quantity: 1,
          "unit_price": 15.9,
          "total_price": 15.9,
          notes: "Test",
          status: "PENDIENTE"
        }
      }
    ];

    for (const testCase of testCases) {
      console.log(`\n🧪 ${testCase.name}...`);
      try {
        const { data, error } = await supabase
          .from('OrderItem')
          .insert(testCase.data)
          .select()
          .single();

        if (error) {
          console.log(`❌ Error: ${error.message}`);
        } else {
          console.log(`✅ Éxito: ${JSON.stringify(data, null, 2)}`);
          break; // Si funciona, no necesitamos probar más
        }
      } catch (err) {
        console.log(`❌ Excepción: ${err.message}`);
      }
    }

    // Limpiar orden de prueba
    console.log('\n🧹 Limpiando orden de prueba...');
    await supabase.from('Order').delete().eq('id', orderData.id);

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

testOrderItemInsert().catch(console.error);








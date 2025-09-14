require('dotenv').config();
const axios = require('axios');

async function testFrontendOrder() {
  console.log('🧪 Probando creación de orden como lo haría el frontend...');
  
  const API_BASE_URL = 'http://localhost:3001';
  
  try {
    // Simular exactamente lo que envía el frontend
    const frontendOrderData = {
      spaceId: "aa09d6a3-f05c-4f14-8f72-92139f5a42cf",
      createdBy: "1a8a16ea-b645-457c-a3d1-86ca00159b7b",
      customerName: "Cliente Frontend",
      customerPhone: "987654321",
      notes: "Orden desde frontend",
      items: [
        {
          productId: "c015c69d-2212-46b4-9594-8d97905b3116",
          name: "Gyozas (8 unidades)",
          unitPrice: 15.9,
          totalPrice: 15.9,
          quantity: 1,
          notes: "Item desde frontend",
          status: "PENDIENTE"
        }
      ]
    };

    console.log('📋 Datos que envía el frontend:');
    console.log(JSON.stringify(frontendOrderData, null, 2));

    console.log('\n📡 Enviando petición a /orders/test...');
    
    const response = await axios.post(`${API_BASE_URL}/orders/test`, frontendOrderData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Respuesta exitosa del backend:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));

    // Verificar que se creó en la base de datos
    console.log('\n🔍 Verificando en la base de datos...');
    
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Obtener la orden más reciente
    const { data: orders, error: ordersError } = await supabase
      .from('Order')
      .select('*')
      .order('createdAt', { ascending: false })
      .limit(1);

    if (ordersError) {
      console.log('❌ Error al verificar en BD:', ordersError);
    } else if (orders.length > 0) {
      const latestOrder = orders[0];
      console.log('✅ Orden creada en BD:');
      console.log('  - ID:', latestOrder.id);
      console.log('  - Número:', latestOrder.orderNumber);
      console.log('  - Cliente:', latestOrder.customerName);
      console.log('  - Total:', latestOrder.totalAmount);
      
      // Verificar items
      const { data: items, error: itemsError } = await supabase
        .from('OrderItem')
        .select('*')
        .eq('orderid', latestOrder.id);

      if (itemsError) {
        console.log('❌ Error al verificar items:', itemsError);
      } else {
        console.log('✅ Items creados en BD:', items.length);
        items.forEach((item, index) => {
          console.log(`  ${index + 1}. ${item.name} - Cantidad: ${item.quantity} - Precio: $${item.totalprice}`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
    if (error.response) {
      console.error('❌ Status:', error.response.status);
      console.error('❌ Data:', error.response.data);
    }
  }
}

testFrontendOrder().catch(console.error);















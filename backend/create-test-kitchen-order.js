const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

async function createTestKitchenOrder() {
  console.log('🍳 Creando orden de prueba para vista de cocina...\n');

  try {
    // 1. Login
    console.log('1️⃣ Iniciando sesión...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@restaurant.com',
      password: 'admin123'
    });

    const token = loginResponse.data.access_token;
    const userId = loginResponse.data.user.id;
    console.log('✅ Login exitoso');

    // 2. Obtener espacios y productos
    console.log('\n2️⃣ Obteniendo datos necesarios...');
    const spacesResponse = await axios.get(`${API_BASE_URL}/tables/spaces/all`);
    const productsResponse = await axios.get(`${API_BASE_URL}/catalog/products`);
    
    const space = spacesResponse.data[0];
    const product = productsResponse.data[0];
    
    console.log('✅ Datos obtenidos:');
    console.log('   Espacio:', space.name);
    console.log('   Producto:', product.name);

    // 3. Crear orden de prueba
    console.log('\n3️⃣ Creando orden de prueba...');
    const orderData = {
      spaceid: space.id,
      createdby: userId,
      customername: 'Cliente Cocina Test',
      customerphone: '123456789',
      totalamount: 25.00,
      subtotal: 25.00,
      tax: 0,
      discount: 0,
      notes: 'Orden de prueba para vista de cocina',
      items: [
        {
          productid: product.id,
          name: product.name,
          unitprice: 12.50,
          totalprice: 25.00,
          quantity: 2,
          status: 'PENDIENTE'
        }
      ]
    };

    const createResponse = await axios.post(`${API_BASE_URL}/orders`, orderData, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log('✅ Orden creada exitosamente:');
    console.log('   Número:', createResponse.data.ordernumber);
    console.log('   Estado:', createResponse.data.status);
    console.log('   Cliente:', createResponse.data.customername);

    // 4. Verificar que aparece en la vista de cocina
    console.log('\n4️⃣ Verificando vista de cocina...');
    const kitchenResponse = await axios.get(`${API_BASE_URL}/orders/kitchen`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('✅ Órdenes en cocina:', kitchenResponse.data.length);
    
    if (kitchenResponse.data.length > 0) {
      console.log('\n📋 Órdenes en cocina:');
      kitchenResponse.data.forEach((order, index) => {
        console.log(`   ${index + 1}. ${order.ordernumber} - ${order.status} - ${order.customername}`);
      });
    }

    // 5. Probar actualización de estado
    if (kitchenResponse.data.length > 0) {
      const orderToUpdate = kitchenResponse.data[0];
      console.log(`\n5️⃣ Probando actualización de estado: ${orderToUpdate.ordernumber}`);
      
      const updateResponse = await axios.put(
        `${API_BASE_URL}/orders/${orderToUpdate.id}/status`,
        { status: 'EN_PREPARACION' },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      console.log('✅ Estado actualizado:', updateResponse.data.status);
      
      // Verificar que sigue apareciendo en cocina
      const kitchenResponse2 = await axios.get(`${API_BASE_URL}/orders/kitchen`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('✅ Órdenes en cocina después de actualizar:', kitchenResponse2.data.length);
    }

    console.log('\n🎉 ¡Orden de prueba creada exitosamente!');
    console.log('💡 Ahora la vista de cocina debería mostrar órdenes');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

createTestKitchenOrder();

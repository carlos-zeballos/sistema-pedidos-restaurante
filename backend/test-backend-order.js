require('dotenv').config();
const axios = require('axios');

async function testBackendOrderCreation() {
  console.log('🧪 Probando creación de orden en el backend...');
  
  try {
    // Datos de prueba con IDs reales de la base de datos
    const testOrderData = {
      spaceId: 'aa09d6a3-f05c-4f14-8f72-92139f5a42cf', // Mesa 2
      createdBy: '1a8a16ea-b645-457c-a3d1-86ca00159b7b', // caja1
      customerName: 'Cliente de Prueba',
      customerPhone: '123456789',
      notes: 'Orden de prueba desde backend',
      items: [
        {
          productId: 'c015c69d-2212-46b4-9594-8d97905b3116', // Gyozas
          name: 'Gyozas (8 unidades)',
          unitPrice: 15.9,
          totalPrice: 15.9,
          quantity: 1,
          notes: 'Item de prueba'
        }
      ]
    };

    console.log('📋 Datos de prueba:', JSON.stringify(testOrderData, null, 2));

    // Hacer la petición al endpoint de prueba (sin autenticación)
    const response = await axios.post('http://localhost:3001/orders/test', testOrderData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Respuesta del backend:', response.data);
    console.log('✅ Orden creada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error al crear orden:', error.response?.data || error.message);
    
    if (error.response) {
      console.error('📊 Detalles del error:');
      console.error('  - Status:', error.response.status);
      console.error('  - Headers:', error.response.headers);
      console.error('  - Data:', error.response.data);
    }
  }
}

testBackendOrderCreation().catch(console.error);

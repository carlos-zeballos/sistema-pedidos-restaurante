const axios = require('axios');

async function testBackendEndpoint() {
  try {
    console.log('🧪 Testing backend endpoint...');
    
    const testData = {
      code: 'TEST003',
      name: 'Test Product 3',
      categoryId: 'e4d355fc-fd94-4094-8651-7f5f396cf274',
      price: 25.99,
      type: 'COMIDA',
      description: 'Test description',
      preparationTime: 25
    };

    console.log('📋 Sending data:', JSON.stringify(testData, null, 2));

    const response = await axios.post('http://localhost:3001/catalog/products', testData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Success! Response:', response.data);
  } catch (error) {
    console.error('❌ Error:', error.response?.status, error.response?.data);
    console.error('❌ Full error:', error.message);
  }
}

testBackendEndpoint();













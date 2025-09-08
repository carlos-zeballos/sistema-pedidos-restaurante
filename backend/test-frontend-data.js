const axios = require('axios');

async function testWithFrontendData() {
  try {
    console.log('🧪 Testing with frontend-like data...');
    
    // First, login to get a token
    console.log('🔐 Logging in...');
    const loginResponse = await axios.post('http://localhost:3001/auth/login', {
      username: 'admin',
      password: 'Admin123!'
    });
    
    const token = loginResponse.data.access_token;
    console.log('✅ Login successful, token obtained');
    
    // Test data that matches what the frontend sends
    const frontendData = {
      code: 'FRONTEND001',
      name: 'Test Frontend Product',
      categoryId: 'e4d355fc-fd94-4094-8651-7f5f396cf274', // Real category ID
      price: 25.99,
      type: 'COMIDA',
      description: 'Test description from frontend',
      preparationTime: 20,
      isEnabled: true,
      isAvailable: true,
      allergens: [],
      nutritionalInfo: {}
    };

    console.log('📋 Frontend data being sent:', JSON.stringify(frontendData, null, 2));
    console.log('📋 Data types:');
    console.log('  - code:', typeof frontendData.code);
    console.log('  - name:', typeof frontendData.name);
    console.log('  - categoryId:', typeof frontendData.categoryId);
    console.log('  - price:', typeof frontendData.price);
    console.log('  - type:', typeof frontendData.type);
    console.log('  - preparationTime:', typeof frontendData.preparationTime);
    console.log('  - isEnabled:', typeof frontendData.isEnabled);
    console.log('  - isAvailable:', typeof frontendData.isAvailable);

    const response = await axios.post('http://localhost:3001/catalog/products', frontendData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Success! Response:', response.data);
  } catch (error) {
    console.error('❌ Error:', error.response?.status);
    console.error('❌ Error data:', JSON.stringify(error.response?.data, null, 2));
    console.error('❌ Full error:', error.message);
    
    if (error.response?.data?.error?.validationErrors) {
      console.error('❌ Validation errors:', error.response.data.error.validationErrors);
    }
  }
}

testWithFrontendData();





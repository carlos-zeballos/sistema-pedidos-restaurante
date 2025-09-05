const axios = require('axios');

async function testWithAuth() {
  try {
    console.log('🧪 Testing with authentication...');
    
    // First, login to get a token
    console.log('🔐 Logging in...');
    const loginResponse = await axios.post('http://localhost:3001/auth/login', {
      username: 'admin',
      password: 'Admin123!'
    });
    
    console.log('✅ Login successful');
    console.log('📥 Login response:', loginResponse.data);
    const token = loginResponse.data.token || loginResponse.data.access_token;
    if (token) {
      console.log('🎫 Token:', token.substring(0, 20) + '...');
    } else {
      console.error('❌ No token in login response');
      return;
    }
    
    // Now test product creation with the token
    const testData = {
      code: 'TEST004',
      name: 'Test Product 4',
      categoryId: 'e4d355fc-fd94-4094-8651-7f5f396cf274',
      price: 35.99,
      type: 'COMIDA',
      description: 'Test description with auth',
      preparationTime: 30
    };

    console.log('📋 Sending data:', JSON.stringify(testData, null, 2));

    const response = await axios.post('http://localhost:3001/catalog/products', testData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Success! Response:', response.data);
  } catch (error) {
    console.error('❌ Error:', error.response?.status, error.response?.data);
    console.error('❌ Full error:', error.message);
  }
}

testWithAuth();
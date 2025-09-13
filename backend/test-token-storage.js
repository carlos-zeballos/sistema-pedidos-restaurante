const axios = require('axios');

async function testTokenStorage() {
  try {
    console.log('🔍 Testing token storage and retrieval...');
    
    // Simulate frontend login flow
    console.log('\n1️⃣ Simulating frontend login...');
    const loginResponse = await axios.post('http://localhost:3001/auth/login', {
      username: 'admin',
      password: 'Admin123!'
    });
    
    console.log('📥 Login response structure:');
    console.log('  - access_token:', loginResponse.data.access_token ? '✅ Present' : '❌ Missing');
    console.log('  - token:', loginResponse.data.token ? '✅ Present' : '❌ Missing');
    console.log('  - user:', loginResponse.data.user ? '✅ Present' : '❌ Missing');
    
    // Check what the frontend would store
    const tokenToStore = loginResponse.data.access_token || loginResponse.data.token;
    console.log('\n2️⃣ Token that should be stored:', tokenToStore ? '✅ Found' : '❌ Not found');
    
    if (tokenToStore) {
      console.log('🎫 Token preview:', tokenToStore.substring(0, 50) + '...');
      
      // Test the token
      console.log('\n3️⃣ Testing stored token...');
      const testData = {
        code: 'TOKEN001',
        name: 'Token Test Product',
        categoryId: 'e4d355fc-fd94-4094-8651-7f5f396cf274',
        price: 12.99,
        type: 'COMIDA'
      };
      
      const response = await axios.post('http://localhost:3001/catalog/products', testData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenToStore}`
        }
      });
      
      console.log('✅ Token works correctly');
      console.log('📦 Created product:', response.data.name);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.status, error.response?.data);
  }
}

testTokenStorage();












const axios = require('axios');

async function comprehensiveDiagnosis() {
  console.log('🔍 DIAGNÓSTICO COMPLETO DE ENDPOINTS');
  console.log('=====================================\n');
  
  // 1. Probar health endpoint
  console.log('1. 🏥 PROBANDO HEALTH ENDPOINT...');
  try {
    const healthResponse = await axios.get('http://localhost:3001/health');
    console.log(`   ✅ Health: ${healthResponse.status} - ${JSON.stringify(healthResponse.data)}`);
  } catch (error) {
    console.log(`   ❌ Health: Error - ${error.message}`);
    return;
  }
  
  // 2. Probar endpoints sin autenticación
  console.log('\n2. 🔓 PROBANDO ENDPOINTS SIN AUTENTICACIÓN...');
  const publicEndpoints = [
    { name: 'Categories', url: 'http://localhost:3001/catalog/categories' },
    { name: 'Products', url: 'http://localhost:3001/catalog/products' },
    { name: 'Spaces', url: 'http://localhost:3001/catalog/spaces' },
    { name: 'Combos', url: 'http://localhost:3001/catalog/combos' },
    { name: 'Users', url: 'http://localhost:3001/users' },
    { name: 'Orders', url: 'http://localhost:3001/orders' },
    { name: 'Tables', url: 'http://localhost:3001/tables' }
  ];
  
  for (const endpoint of publicEndpoints) {
    try {
      const response = await axios.get(endpoint.url, {
        timeout: 5000,
        validateStatus: () => true
      });
      
      if (response.status === 200) {
        const dataLength = Array.isArray(response.data) ? response.data.length : 'N/A';
        console.log(`   ✅ ${endpoint.name}: ${response.status} (${dataLength} elementos)`);
      } else if (response.status === 401) {
        console.log(`   🔐 ${endpoint.name}: ${response.status} (Requiere autenticación)`);
      } else if (response.status === 500) {
        console.log(`   ❌ ${endpoint.name}: ${response.status} (Error interno)`);
        console.log(`       📋 Error: ${JSON.stringify(response.data)}`);
      } else {
        console.log(`   ⚠️  ${endpoint.name}: ${response.status} (Estado inesperado)`);
      }
    } catch (error) {
      console.log(`   ❌ ${endpoint.name}: Error de conexión - ${error.message}`);
    }
  }
  
  // 3. Intentar hacer login
  console.log('\n3. 🔐 PROBANDO AUTENTICACIÓN...');
  let token = null;
  try {
    const loginResponse = await axios.post('http://localhost:3001/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    
    token = loginResponse.data.access_token;
    console.log(`   ✅ Login exitoso - Token obtenido (${token.substring(0, 20)}...)`);
  } catch (error) {
    console.log(`   ❌ Login falló: ${error.response?.status} - ${JSON.stringify(error.response?.data)}`);
    
    // Intentar con otras credenciales
    console.log('\n   🔄 Intentando con credenciales alternativas...');
    const altCredentials = [
      { username: 'admin', password: 'admin' },
      { username: 'admin', password: 'password' },
      { username: 'user', password: 'user123' }
    ];
    
    for (const cred of altCredentials) {
      try {
        const altResponse = await axios.post('http://localhost:3001/auth/login', cred);
        token = altResponse.data.access_token;
        console.log(`   ✅ Login exitoso con ${cred.username}/${cred.password}`);
        break;
      } catch (altError) {
        console.log(`   ❌ ${cred.username}/${cred.password}: ${altError.response?.status}`);
      }
    }
  }
  
  // 4. Probar endpoints con autenticación (si tenemos token)
  if (token) {
    console.log('\n4. 🔒 PROBANDO ENDPOINTS CON AUTENTICACIÓN...');
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    for (const endpoint of publicEndpoints) {
      try {
        const response = await axios.get(endpoint.url, { 
          headers,
          timeout: 5000,
          validateStatus: () => true
        });
        
        if (response.status === 200) {
          const dataLength = Array.isArray(response.data) ? response.data.length : 'N/A';
          console.log(`   ✅ ${endpoint.name}: ${response.status} (${dataLength} elementos)`);
        } else if (response.status === 500) {
          console.log(`   ❌ ${endpoint.name}: ${response.status} (Error interno con auth)`);
          console.log(`       📋 Error: ${JSON.stringify(response.data)}`);
        } else {
          console.log(`   ⚠️  ${endpoint.name}: ${response.status} (Estado inesperado con auth)`);
        }
      } catch (error) {
        console.log(`   ❌ ${endpoint.name}: Error con auth - ${error.message}`);
      }
    }
  }
  
  // 5. Probar creación de datos
  if (token) {
    console.log('\n5. 📝 PROBANDO CREACIÓN DE DATOS...');
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    try {
      const createResponse = await axios.post('http://localhost:3001/catalog/categories', {
        name: 'Test Category',
        ord: 999,
        description: 'Test category for diagnosis'
      }, { 
        headers,
        timeout: 5000,
        validateStatus: () => true
      });
      
      if (createResponse.status === 201 || createResponse.status === 200) {
        console.log(`   ✅ Create Category: ${createResponse.status} - Categoría creada`);
      } else {
        console.log(`   ❌ Create Category: ${createResponse.status} - ${JSON.stringify(createResponse.data)}`);
      }
    } catch (error) {
      console.log(`   ❌ Create Category: Error - ${error.message}`);
    }
  }
  
  console.log('\n=====================================');
  console.log('🏁 DIAGNÓSTICO COMPLETADO');
  console.log('\n💡 PRÓXIMOS PASOS:');
  console.log('   1. Si hay errores 500, revisa los logs del backend');
  console.log('   2. Si hay errores 401, verifica la autenticación');
  console.log('   3. Si hay errores de conexión, verifica que el backend esté corriendo');
}

comprehensiveDiagnosis();
















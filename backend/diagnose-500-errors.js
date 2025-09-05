const axios = require('axios');

async function diagnose500Errors() {
  console.log('🔍 DIAGNÓSTICO COMPLETO DE ERRORES 500');
  console.log('=====================================');
  
  const baseURL = 'http://localhost:3001';
  
  // Función para probar un endpoint con detalles completos
  async function testEndpoint(name, url, method = 'GET', data = null) {
    console.log(`\n📡 Probando ${name}...`);
    console.log(`   URL: ${url}`);
    
    try {
      const config = {
        method,
        url,
        timeout: 10000,
        validateStatus: () => true // Aceptar cualquier status code
      };
      
      if (data) {
        config.data = data;
        config.headers = { 'Content-Type': 'application/json' };
      }
      
      const response = await axios(config);
      
      console.log(`   Status: ${response.status}`);
      
      if (response.status === 200) {
        console.log(`   ✅ ${name} - OK`);
        if (response.data && Array.isArray(response.data)) {
          console.log(`   📊 Datos: ${response.data.length} elementos`);
        }
      } else if (response.status === 500) {
        console.log(`   ❌ ${name} - ERROR 500`);
        console.log(`   📋 Response:`, JSON.stringify(response.data, null, 2));
      } else {
        console.log(`   ⚠️  ${name} - Status ${response.status}`);
        console.log(`   📋 Response:`, JSON.stringify(response.data, null, 2));
      }
      
    } catch (error) {
      console.log(`   💥 ${name} - Error de conexión`);
      console.log(`   📋 Error:`, error.message);
      if (error.response) {
        console.log(`   📋 Status:`, error.response.status);
        console.log(`   📋 Data:`, error.response.data);
      }
    }
  }
  
  // 1. Verificar que el backend esté corriendo
  console.log('\n1. 🔍 VERIFICANDO BACKEND...');
  try {
    const healthResponse = await axios.get(`${baseURL}/health`, { timeout: 5000 });
    console.log('   ✅ Backend está corriendo');
    console.log(`   📊 Health Status: ${healthResponse.status}`);
  } catch (error) {
    console.log('   ❌ Backend NO está corriendo');
    console.log('   💡 Asegúrate de que el backend esté ejecutándose en puerto 3001');
    return;
  }
  
  // 2. Probar endpoints del catálogo uno por uno
  console.log('\n2. 🍽️ PROBANDO ENDPOINTS DEL CATÁLOGO...');
  
  await testEndpoint('Categories', `${baseURL}/catalog/categories`);
  await testEndpoint('Products', `${baseURL}/catalog/products`);
  await testEndpoint('Spaces', `${baseURL}/catalog/spaces`);
  await testEndpoint('Combos', `${baseURL}/catalog/combos`);
  
  // 3. Probar endpoints de otros módulos
  console.log('\n3. 🔐 PROBANDO OTROS ENDPOINTS...');
  
  await testEndpoint('Users', `${baseURL}/users`);
  await testEndpoint('Orders', `${baseURL}/orders`);
  await testEndpoint('Tables', `${baseURL}/tables`);
  
  // 4. Probar con datos de prueba
  console.log('\n4. 🧪 PROBANDO CON DATOS DE PRUEBA...');
  
  const testCategory = {
    name: 'Test Category',
    ord: 999,
    description: 'Categoría de prueba',
    isActive: true
  };
  
  await testEndpoint('Create Category', `${baseURL}/catalog/categories`, 'POST', testCategory);
  
  // 5. Verificar configuración de Supabase
  console.log('\n5. 🔧 VERIFICANDO CONFIGURACIÓN...');
  
  try {
    const { createClient } = require('@supabase/supabase-js');
    require('dotenv').config();
    
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.log('   ❌ Variables de entorno de Supabase faltantes');
    } else {
      console.log('   ✅ Variables de entorno de Supabase presentes');
      
      // Probar conexión directa
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data, error } = await supabase
        .from('Category')
        .select('id, name')
        .limit(1);
      
      if (error) {
        console.log('   ❌ Error en conexión directa a Supabase:', error.message);
      } else {
        console.log('   ✅ Conexión directa a Supabase OK');
      }
    }
  } catch (e) {
    console.log('   ❌ Error verificando configuración:', e.message);
  }
  
  console.log('\n=====================================');
  console.log('🏁 DIAGNÓSTICO COMPLETADO');
  console.log('\n💡 PRÓXIMOS PASOS:');
  console.log('   1. Revisa los logs del backend para errores específicos');
  console.log('   2. Verifica la consola del navegador para errores del frontend');
  console.log('   3. Compara los errores 500 con los logs del backend');
}

diagnose500Errors();





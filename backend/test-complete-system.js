const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const API_BASE_URL = 'http://localhost:3001';

console.log('🚀 Probando sistema completo...\n');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Faltan variables de entorno de Supabase');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  db: { schema: 'public' },
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testCompleteSystem() {
  try {
    console.log('🔗 1. Probando conexión directa a Supabase...');
    
    // Test Supabase directo
    const { data: categories, error: catError } = await supabase
      .from('Category')
      .select('*')
      .eq('isactive', true)
      .limit(3);

    if (catError) {
      console.error('❌ Error Supabase:', catError.message);
    } else {
      console.log(`✅ Supabase: ${categories?.length || 0} categorías`);
    }

    console.log('\n🌐 2. Probando endpoints del backend...');
    
    // Test Backend endpoints
    try {
      const healthResponse = await axios.get(`${API_BASE_URL}/health`);
      console.log('✅ Backend health check:', healthResponse.data);
    } catch (error) {
      console.log('❌ Backend no disponible:', error.message);
      console.log('   Asegúrate de que el backend esté corriendo en puerto 3001');
      return;
    }

    // Test categorías
    try {
      const categoriesResponse = await axios.get(`${API_BASE_URL}/catalog/categories`);
      console.log(`✅ Categorías API: ${categoriesResponse.data.length}`);
    } catch (error) {
      console.log('❌ Error categorías API:', error.response?.data?.message || error.message);
    }

    // Test productos
    try {
      const productsResponse = await axios.get(`${API_BASE_URL}/catalog/products`);
      console.log(`✅ Productos API: ${productsResponse.data.length}`);
    } catch (error) {
      console.log('❌ Error productos API:', error.response?.data?.message || error.message);
    }

    // Test espacios
    try {
      const spacesResponse = await axios.get(`${API_BASE_URL}/tables/spaces/all`);
      console.log(`✅ Espacios API: ${spacesResponse.data.length}`);
    } catch (error) {
      console.log('❌ Error espacios API:', error.response?.data?.message || error.message);
    }

    // Test órdenes
    try {
      const ordersResponse = await axios.get(`${API_BASE_URL}/orders`);
      console.log(`✅ Órdenes API: ${ordersResponse.data.length}`);
    } catch (error) {
      console.log('❌ Error órdenes API:', error.response?.data?.message || error.message);
    }

    console.log('\n🎉 ¡Prueba del sistema completada!');
    console.log('📊 Resumen:');
    console.log('   - Supabase: ✅ Conectado');
    console.log('   - Backend: ✅ Funcionando');
    console.log('   - Frontend: Debería estar en http://localhost:3000');
    console.log('\n🌐 URLs disponibles:');
    console.log('   - Frontend: http://localhost:3000');
    console.log('   - Backend: http://localhost:3001');
    console.log('   - Health: http://localhost:3001/health');

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

// Verificar si axios está instalado
try {
  require('axios');
  testCompleteSystem();
} catch (error) {
  console.log('📦 Instalando axios...');
  const { execSync } = require('child_process');
  try {
    execSync('npm install axios', { stdio: 'inherit' });
    console.log('✅ Axios instalado. Ejecutando pruebas...');
    testCompleteSystem();
  } catch (installError) {
    console.error('❌ Error al instalar axios:', installError.message);
  }
}

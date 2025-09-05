const axios = require('axios');
require('dotenv').config();

const API_BASE_URL = 'http://localhost:3001';

console.log('🔍 Diagnóstico de la API...\n');

async function diagnoseAPI() {
  try {
    // 1. Verificar que el backend esté corriendo
    console.log('🔗 1. Verificando conexión al backend...');
    try {
      const healthResponse = await axios.get(`${API_BASE_URL}/health`);
      console.log('✅ Backend conectado:', healthResponse.data);
    } catch (error) {
      console.log('❌ Backend no está corriendo:', error.message);
      return;
    }

    // 2. Probar endpoint de productos
    console.log('\n🍽️ 2. Probando endpoint de productos...');
    try {
      const productsResponse = await axios.get(`${API_BASE_URL}/catalog/products`);
      console.log(`✅ Productos: ${productsResponse.data.length} encontrados`);
      if (productsResponse.data.length > 0) {
        console.log('   Primer producto:', productsResponse.data[0].name);
      }
    } catch (error) {
      console.log('❌ Error en productos:', error.response?.status, error.response?.data);
    }

    // 3. Probar endpoint de categorías
    console.log('\n📂 3. Probando endpoint de categorías...');
    try {
      const categoriesResponse = await axios.get(`${API_BASE_URL}/catalog/categories`);
      console.log(`✅ Categorías: ${categoriesResponse.data.length} encontradas`);
      if (categoriesResponse.data.length > 0) {
        console.log('   Primera categoría:', categoriesResponse.data[0].name);
      }
    } catch (error) {
      console.log('❌ Error en categorías:', error.response?.status, error.response?.data);
    }

    // 4. Probar endpoint de espacios
    console.log('\n🪑 4. Probando endpoint de espacios...');
    try {
      const spacesResponse = await axios.get(`${API_BASE_URL}/tables/spaces/all`);
      console.log(`✅ Espacios: ${spacesResponse.data.length} encontrados`);
      if (spacesResponse.data.length > 0) {
        console.log('   Primer espacio:', spacesResponse.data[0].name);
      }
    } catch (error) {
      console.log('❌ Error en espacios:', error.response?.status, error.response?.data);
    }

    // 5. Probar endpoint de órdenes
    console.log('\n📋 5. Probando endpoint de órdenes...');
    try {
      const ordersResponse = await axios.get(`${API_BASE_URL}/orders`);
      console.log(`✅ Órdenes: ${ordersResponse.data.length} encontradas`);
    } catch (error) {
      console.log('❌ Error en órdenes:', error.response?.status, error.response?.data);
    }

    // 6. Verificar variables de entorno
    console.log('\n🔧 6. Verificando variables de entorno...');
    console.log('   SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Configurada' : '❌ No configurada');
    console.log('   SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Configurada' : '❌ No configurada');

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

// Verificar si axios está instalado
try {
  require('axios');
  diagnoseAPI();
} catch (error) {
  console.log('📦 Instalando axios...');
  const { execSync } = require('child_process');
  try {
    execSync('npm install axios', { stdio: 'inherit' });
    console.log('✅ Axios instalado. Ejecutando diagnóstico...');
    diagnoseAPI();
  } catch (installError) {
    console.error('❌ Error al instalar axios:', installError.message);
  }
}

#!/usr/bin/env node

const { execSync } = require('child_process');
const axios = require('axios');

console.log('🚀 KIT DE DIAGNÓSTICO COMPLETO');
console.log('==============================');

async function runDiagnosis() {
  try {
    console.log('\n1️⃣ Verificando que el backend esté corriendo...');
    
    try {
      const response = await axios.get('http://localhost:3001/health', { timeout: 3000 });
      console.log('✅ Backend está corriendo en puerto 3001');
    } catch (error) {
      console.log('❌ Backend no está corriendo. Iniciando...');
      console.log('Ejecuta: npm run start:dev');
      return;
    }

    console.log('\n2️⃣ Ejecutando diagnóstico de endpoints...');
    try {
      execSync('npx ts-node scripts/diag-api.ts', { stdio: 'inherit' });
    } catch (error) {
      console.log('❌ Error ejecutando diagnóstico de API');
    }

    console.log('\n3️⃣ Verificando endpoint de diagnóstico...');
    try {
      const response = await axios.get('http://localhost:3001/diag');
      console.log('✅ Endpoint de diagnóstico funcionando');
      console.log('📊 Resultado:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.log('❌ Error en endpoint de diagnóstico:', error.response?.data || error.message);
    }

    console.log('\n4️⃣ Instrucciones para diagnóstico completo:');
    console.log('📋 1. Abre el navegador en: http://localhost:3001/diag');
    console.log('📋 2. Ejecuta el SQL Doctor en Supabase:');
    console.log('   - Copia el contenido de sql-doctor.sql');
    console.log('   - Pégalo en Supabase SQL Editor');
    console.log('   - Ejecuta el SELECT final');
    console.log('📋 3. Si hay errores, corrige las columnas faltantes');
    console.log('📋 4. Reinicia el backend: npm run start:dev');

  } catch (error) {
    console.error('❌ Error en diagnóstico:', error.message);
  }
}

runDiagnosis();
















#!/usr/bin/env node

const axios = require('axios');
const { exec } = require('child_process');
const path = require('path');

console.log('🔍 VERIFICANDO ESTADO DEL SISTEMA COMPLETO\n');

const API_BASE_URL = 'http://localhost:3001';
const FRONTEND_URL = 'http://localhost:3000';

// Función para verificar si un puerto está en uso
function checkPort(port) {
  return new Promise((resolve) => {
    const net = require('net');
    const socket = new net.Socket();
    
    socket.setTimeout(2000);
    
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    
    socket.on('error', () => {
      resolve(false);
    });
    
    socket.connect(port, 'localhost');
  });
}

// Función para verificar la API del backend
async function checkBackendAPI() {
  try {
    console.log('🌐 Verificando API del Backend...');
    const response = await axios.get(`${API_BASE_URL}/health`, { timeout: 5000 });
    console.log('✅ Backend API funcionando correctamente');
    console.log(`   Status: ${response.status}`);
    console.log(`   Response: ${JSON.stringify(response.data)}`);
    return true;
  } catch (error) {
    console.log('❌ Error en Backend API:');
    if (error.code === 'ECONNREFUSED') {
      console.log('   El servidor no está corriendo en el puerto 3001');
    } else if (error.code === 'ENOTFOUND') {
      console.log('   No se puede resolver localhost');
    } else {
      console.log(`   ${error.message}`);
    }
    return false;
  }
}

// Función para verificar la base de datos
async function checkDatabase() {
  try {
    console.log('\n🗄️ Verificando conexión a Base de Datos...');
    const response = await axios.get(`${API_BASE_URL}/health/database`, { timeout: 5000 });
    console.log('✅ Base de datos conectada correctamente');
    console.log(`   Status: ${response.status}`);
    console.log(`   Response: ${JSON.stringify(response.data)}`);
    return true;
  } catch (error) {
    console.log('❌ Error en Base de Datos:');
    console.log(`   ${error.message}`);
    return false;
  }
}

// Función para verificar el frontend
async function checkFrontend() {
  try {
    console.log('\n🎨 Verificando Frontend...');
    const response = await axios.get(FRONTEND_URL, { timeout: 5000 });
    console.log('✅ Frontend funcionando correctamente');
    console.log(`   Status: ${response.status}`);
    return true;
  } catch (error) {
    console.log('❌ Error en Frontend:');
    if (error.code === 'ECONNREFUSED') {
      console.log('   El servidor de desarrollo no está corriendo en el puerto 3000');
    } else {
      console.log(`   ${error.message}`);
    }
    return false;
  }
}

// Función para verificar puertos
async function checkPorts() {
  console.log('\n🔌 Verificando puertos...');
  
  const backendPort = await checkPort(3001);
  const frontendPort = await checkPort(3000);
  
  console.log(`   Puerto 3001 (Backend): ${backendPort ? '✅ En uso' : '❌ Libre'}`);
  console.log(`   Puerto 3000 (Frontend): ${frontendPort ? '✅ En uso' : '❌ Libre'}`);
  
  return { backendPort, frontendPort };
}

// Función para mostrar instrucciones de inicio
function showStartInstructions() {
  console.log('\n🚀 INSTRUCCIONES PARA INICIAR EL SISTEMA:\n');
  
  console.log('1️⃣ INICIAR BACKEND:');
  console.log('   cd resto-sql/backend');
  console.log('   npm run start:dev');
  console.log('');
  
  console.log('2️⃣ INICIAR FRONTEND (en otra terminal):');
  console.log('   cd resto-sql/frontend');
  console.log('   npm start');
  console.log('');
  
  console.log('3️⃣ VERIFICAR CONEXIÓN:');
  console.log('   Abrir http://localhost:3000/test en el navegador');
  console.log('');
  
  console.log('4️⃣ ACCEDER AL SISTEMA:');
  console.log('   Abrir http://localhost:3000 en el navegador');
  console.log('   Usar credenciales de prueba: admin/admin');
  console.log('');
}

// Función para mostrar información del sistema
function showSystemInfo() {
  console.log('\n📋 INFORMACIÓN DEL SISTEMA:\n');
  
  console.log('🏪 SISTEMA DE RESTAURANTE:');
  console.log('   • Gestión de pedidos en tiempo real');
  console.log('   • 3 Mesas + 2 Barra + 5 Delivery');
  console.log('   • Sistema de reservas');
  console.log('   • Combos personalizables');
  console.log('   • Estados automáticos');
  console.log('');
  
  console.log('👥 ROLES DISPONIBLES:');
  console.log('   • ADMIN - Control total del sistema');
  console.log('   • MOZO - Crear y gestionar pedidos');
  console.log('   • COCINERO - Preparar pedidos');
  console.log('   • CAJA - Gestionar pagos');
  console.log('   • BARRA - Gestión de bebidas');
  console.log('');
  
  console.log('🔧 TECNOLOGÍAS:');
  console.log('   • Backend: NestJS + Prisma + PostgreSQL');
  console.log('   • Frontend: React + TypeScript');
  console.log('   • Base de Datos: Supabase (PostgreSQL)');
  console.log('   • Autenticación: JWT');
  console.log('');
}

// Función principal
async function main() {
  try {
    console.log('🎯 VERIFICACIÓN COMPLETA DEL SISTEMA DE RESTAURANTE\n');
    
    // Verificar puertos
    const ports = await checkPorts();
    
    // Verificar servicios
    const backendAPI = await checkBackendAPI();
    const database = await checkDatabase();
    const frontend = await checkFrontend();
    
    // Resumen
    console.log('\n📊 RESUMEN DEL ESTADO:\n');
    console.log(`   Backend API: ${backendAPI ? '✅' : '❌'}`);
    console.log(`   Base de Datos: ${database ? '✅' : '❌'}`);
    console.log(`   Frontend: ${frontend ? '✅' : '❌'}`);
    console.log(`   Puerto 3001: ${ports.backendPort ? '✅' : '❌'}`);
    console.log(`   Puerto 3000: ${ports.frontendPort ? '✅' : '❌'}`);
    
    const allWorking = backendAPI && database && frontend && ports.backendPort && ports.frontendPort;
    
    if (allWorking) {
      console.log('\n🎉 ¡SISTEMA COMPLETAMENTE FUNCIONAL!');
      console.log('   Puedes acceder a:');
      console.log('   • Frontend: http://localhost:3000');
      console.log('   • Prueba de conexión: http://localhost:3000/test');
      console.log('   • API Backend: http://localhost:3001');
    } else {
      console.log('\n⚠️ PROBLEMAS DETECTADOS');
      showStartInstructions();
    }
    
    showSystemInfo();
    
  } catch (error) {
    console.error('❌ Error durante la verificación:', error.message);
    showStartInstructions();
  }
}

// Ejecutar verificación
main();

// Script para probar el login desde el backend
const axios = require('axios');

const API_BASE_URL = 'https://sistema-pedidos-restaurante.onrender.com';

async function testLogin() {
    console.log('🔐 Probando login con admin/admin123...');
    console.log('🌐 URL:', API_BASE_URL);
    
    try {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, {
            username: 'admin',
            password: 'admin123'
        }, {
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Login exitoso!');
        console.log('📥 Response:', response.data);
        
    } catch (error) {
        console.error('❌ Error en login:');
        console.error('Status:', error.response?.status);
        console.error('Data:', error.response?.data);
        console.error('Message:', error.message);
        
        if (error.response?.status === 401) {
            console.log('\n🔍 Posibles causas del error 401:');
            console.log('1. Usuario admin no existe en la base de datos');
            console.log('2. Contraseña incorrecta');
            console.log('3. Usuario inactivo');
            console.log('4. Problema con la función auth_login');
            console.log('5. Problema con la extensión pgcrypto');
        }
    }
}

testLogin();

// =========================================================
// SCRIPT DE PRUEBA DEL ENDPOINT DE DIAGNÓSTICO
// =========================================================
// Este script prueba el endpoint /orders/test/diagnose
// para obtener información detallada sobre el error 500
// =========================================================

const axios = require('axios');

const API_BASE_URL = 'https://sistema-pedidos-restaurante.onrender.com';

async function testDiagnosticEndpoint() {
    console.log('🔍 Probando endpoint de diagnóstico...');
    
    const testPayload = {
        spaceId: '00000000-0000-0000-0000-000000000001',
        createdBy: '00000000-0000-0000-0000-000000000001',
        customerName: 'Test Customer',
        customerPhone: '123456789',
        items: [
            {
                productId: null,
                comboId: null,
                name: 'Test Item',
                unitPrice: 10.00,
                totalPrice: 10.00,
                quantity: 1,
                notes: null
            }
        ],
        notes: 'Test order from diagnostic script',
        totalAmount: 10.00,
        subtotal: 10.00,
        tax: 0.00,
        discount: 0.00,
        deliveryCost: 0.00,
        isDelivery: false
    };

    try {
        console.log('📤 Enviando payload:', JSON.stringify(testPayload, null, 2));
        
        const response = await axios.post(`${API_BASE_URL}/orders/test/diagnose`, testPayload, {
            headers: {
                'Content-Type': 'application/json',
                'Origin': 'https://precious-travesseiro-c0f1d0.netlify.app'
            },
            timeout: 10000
        });

        console.log('✅ Respuesta exitosa:', response.data);
        
    } catch (error) {
        console.error('❌ Error en diagnóstico:');
        console.error('Status:', error.response?.status);
        console.error('Status Text:', error.response?.statusText);
        console.error('Data:', error.response?.data);
        console.error('Headers:', error.response?.headers);
        console.error('Message:', error.message);
        
        if (error.response?.data) {
            console.log('\n🔍 Detalles del error del servidor:');
            console.log(JSON.stringify(error.response.data, null, 2));
        }
    }
}

// También probar el endpoint de salud
async function testHealthEndpoint() {
    console.log('\n🏥 Probando endpoint de salud...');
    
    try {
        const response = await axios.get(`${API_BASE_URL}/orders/test/health`, {
            timeout: 5000
        });
        
        console.log('✅ Endpoint de salud OK:', response.data);
        
    } catch (error) {
        console.error('❌ Error en endpoint de salud:');
        console.error('Status:', error.response?.status);
        console.error('Data:', error.response?.data);
    }
}

// Ejecutar las pruebas
async function runTests() {
    console.log('🚀 Iniciando pruebas de diagnóstico...\n');
    
    await testHealthEndpoint();
    await testDiagnosticEndpoint();
    
    console.log('\n✅ Pruebas completadas');
}

runTests().catch(console.error);









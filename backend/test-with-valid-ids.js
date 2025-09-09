// =========================================================
// SCRIPT DE PRUEBA CON IDs VÁLIDOS
// =========================================================
// Este script prueba la creación de órdenes con IDs válidos
// =========================================================

const axios = require('axios');

const API_BASE_URL = 'https://sistema-pedidos-restaurante.onrender.com';

async function testWithValidIds() {
    console.log('🔍 Probando con IDs válidos...');
    
    // Usar los IDs válidos que encontramos en la base de datos
    const validSpaceId = '216489b8-a77e-4ecc-9c8a-89cb25e4dfe8'; // BARRA1
    const validUserId = '42d2ac16-2811-4e01-9e76-f8ab02d1aea2'; // Usar admin como fallback
    
    const testPayload = {
        spaceId: validSpaceId,
        createdBy: validUserId,
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
        notes: 'Test order with valid IDs',
        totalAmount: 10.00,
        subtotal: 10.00,
        tax: 0.00,
        discount: 0.00,
        deliveryCost: 0.00,
        isDelivery: false
    };

    try {
        console.log('📤 Enviando payload con IDs válidos:', JSON.stringify(testPayload, null, 2));
        
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
        console.error('Message:', error.message);
        
        if (error.response?.data) {
            console.log('\n🔍 Detalles del error del servidor:');
            console.log(JSON.stringify(error.response.data, null, 2));
        }
    }
}

// Ejecutar la prueba
testWithValidIds().catch(console.error);

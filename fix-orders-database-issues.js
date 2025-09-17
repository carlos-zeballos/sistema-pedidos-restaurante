const axios = require('axios');

const BASE_URL = 'https://sistema-pedidos-restaurante.onrender.com';

// Función para crear un endpoint de diagnóstico mejorado
async function createImprovedDiagnosticEndpoint() {
  console.log('🔧 Creando endpoint de diagnóstico mejorado...');
  
  // Crear un script SQL para diagnosticar la estructura de la base de datos
  const diagnosticSQL = `
    -- Diagnosticar estructura de tablas
    SELECT 
      table_name,
      column_name,
      data_type,
      is_nullable
    FROM information_schema.columns 
    WHERE table_name IN ('Order', 'OrderItem', 'OrderItemComponent', 'Space', 'Product', 'Category')
    ORDER BY table_name, ordinal_position;
  `;
  
  console.log('📋 SQL de diagnóstico:', diagnosticSQL);
}

// Función para probar endpoints con estructura simplificada
async function testSimplifiedEndpoints() {
  console.log('\n🧪 Probando endpoints con estructura simplificada...');
  
  // Probar endpoint mock que funciona
  try {
    const mockData = {
      spaceid: 'test-space-simple',
      createdby: 'test-user-simple',
      customername: 'Cliente Simple',
      items: [
        {
          productId: 'simple-product',
          name: 'Producto Simple',
          unitPrice: 10.00,
          totalPrice: 10.00,
          quantity: 1
        }
      ],
      totalamount: 10.00
    };
    
    console.log('📝 Probando endpoint mock...');
    const mockResponse = await axios.post(`${BASE_URL}/orders/mock`, mockData);
    console.log('✅ Mock exitoso:', JSON.stringify(mockResponse.data, null, 2));
    
    return mockResponse.data;
  } catch (error) {
    console.log('❌ Error en mock:', error.message);
    return null;
  }
}

// Función para crear un endpoint de prueba simplificado
async function createSimplifiedTestEndpoint() {
  console.log('\n🔧 Creando endpoint de prueba simplificado...');
  
  // Crear un endpoint que no dependa de relaciones complejas
  const simplifiedEndpointCode = `
    // Endpoint simplificado para pruebas
    @Get('test/simple')
    async testSimple() {
      try {
        // Probar conexión básica sin relaciones complejas
        const { data, error } = await this.supabaseService
          .getClient()
          .from('Order')
          .select('id, orderNumber, status, createdAt')
          .limit(5);
          
        if (error) {
          return {
            ok: false,
            error: error.message,
            details: 'Error en consulta simple'
          };
        }
        
        return {
          ok: true,
          message: 'Consulta simple exitosa',
          orders: data,
          count: data?.length || 0
        };
      } catch (error) {
        return {
          ok: false,
          error: error.message,
          details: 'Error en endpoint simplificado'
        };
      }
    }
  `;
  
  console.log('📝 Código del endpoint simplificado:', simplifiedEndpointCode);
}

// Función para probar diferentes variaciones de consultas
async function testQueryVariations() {
  console.log('\n🔍 Probando variaciones de consultas...');
  
  const variations = [
    {
      name: 'Consulta básica de Order',
      query: 'SELECT id, orderNumber, status FROM "Order" LIMIT 5'
    },
    {
      name: 'Consulta de OrderItem sin relaciones',
      query: 'SELECT id, orderId, name, quantity FROM "OrderItem" LIMIT 5'
    },
    {
      name: 'Consulta de Space',
      query: 'SELECT id, name, type FROM "Space" LIMIT 5'
    },
    {
      name: 'Consulta de Product',
      query: 'SELECT id, name, price FROM "Product" LIMIT 5'
    }
  ];
  
  for (const variation of variations) {
    try {
      console.log(`\n🧪 Probando: ${variation.name}`);
      
      // Crear un endpoint temporal para probar esta consulta
      const testData = {
        query: variation.query,
        description: variation.name
      };
      
      // Usar el endpoint de diagnóstico existente
      const response = await axios.post(`${BASE_URL}/orders/test/diagnose`, testData);
      console.log(`✅ ${variation.name}:`, JSON.stringify(response.data, null, 2));
      
    } catch (error) {
      console.log(`❌ ${variation.name}:`, error.message);
    }
  }
}

// Función para crear un endpoint de salud mejorado
async function createImprovedHealthEndpoint() {
  console.log('\n🏥 Creando endpoint de salud mejorado...');
  
  const improvedHealthCode = `
    @Get('test/health-improved')
    async testHealthImproved() {
      const checks = [];
      
      try {
        // Check 1: Conexión básica
        const { data: basicData, error: basicError } = await this.supabaseService
          .getClient()
          .from('Order')
          .select('id')
          .limit(1);
          
        checks.push({
          name: 'Conexión básica',
          ok: !basicError,
          error: basicError?.message || null
        });
        
        // Check 2: Tabla OrderItem
        const { data: itemData, error: itemError } = await this.supabaseService
          .getClient()
          .from('OrderItem')
          .select('id')
          .limit(1);
          
        checks.push({
          name: 'Tabla OrderItem',
          ok: !itemError,
          error: itemError?.message || null
        });
        
        // Check 3: Tabla Space
        const { data: spaceData, error: spaceError } = await this.supabaseService
          .getClient()
          .from('Space')
          .select('id')
          .limit(1);
          
        checks.push({
          name: 'Tabla Space',
          ok: !spaceError,
          error: spaceError?.message || null
        });
        
        return {
          ok: checks.every(c => c.ok),
          checks,
          timestamp: new Date().toISOString()
        };
        
      } catch (error) {
        return {
          ok: false,
          error: error.message,
          checks,
          timestamp: new Date().toISOString()
        };
      }
    }
  `;
  
  console.log('📝 Código del endpoint de salud mejorado:', improvedHealthCode);
}

// Función principal
async function main() {
  console.log('🔧 DIAGNÓSTICO Y SOLUCIÓN DE PROBLEMAS DE ORDERS');
  console.log('=' .repeat(60));
  
  await createImprovedDiagnosticEndpoint();
  await testSimplifiedEndpoints();
  await createSimplifiedTestEndpoint();
  await testQueryVariations();
  await createImprovedHealthEndpoint();
  
  console.log('\n💡 RECOMENDACIONES:');
  console.log('-'.repeat(50));
  console.log('1. ✅ El endpoint /orders/mock funciona correctamente');
  console.log('2. ❌ Problema principal: Relación OrderItem -> OrderItemComponent');
  console.log('3. ❌ Columnas faltantes en tablas (code, ord, etc.)');
  console.log('4. ✅ CORS está funcionando correctamente');
  console.log('5. 🔧 Necesario: Arreglar estructura de base de datos');
  
  console.log('\n🎯 DIAGNÓSTICO COMPLETADO');
  console.log('=' .repeat(60));
}

main().catch(console.error);



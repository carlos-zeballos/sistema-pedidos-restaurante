require('dotenv').config();
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testProductAnalysis() {
  console.log('🧪 Probando análisis de productos...\n');

  try {
    // 1. Verificar que hay órdenes en la BD
    console.log('1️⃣ VERIFICANDO ÓRDENES EN LA BD:');
    const { data: orders, error: ordersError } = await supabase
      .from('Order')
      .select(`
        *,
        items:OrderItem(
          *,
          components:OrderItemComponent(*)
        ),
        space:Space(*)
      `)
      .gte('createdAt', new Date().toISOString().split('T')[0]);

    if (ordersError) {
      console.error('❌ Error obteniendo órdenes:', ordersError.message);
      return;
    }

    console.log(`   📦 Órdenes encontradas: ${orders.length}`);
    
    if (orders.length === 0) {
      console.log('   ⚠️  No hay órdenes para analizar');
      return;
    }

    // 2. Verificar que las órdenes tienen items
    console.log('\n2️⃣ VERIFICANDO ITEMS EN LAS ÓRDENES:');
    let totalItems = 0;
    orders.forEach((order, index) => {
      const itemsCount = order.items ? order.items.length : 0;
      totalItems += itemsCount;
      console.log(`   ${index + 1}. Orden ${order.orderNumber}: ${itemsCount} items`);
      
      if (order.items && order.items.length > 0) {
        order.items.forEach((item, itemIndex) => {
          console.log(`      ${itemIndex + 1}. ${item.name} - $${item.totalprice} (x${item.quantity})`);
        });
      }
    });

    console.log(`   📊 Total de items: ${totalItems}`);

    // 3. Probar el endpoint de órdenes
    console.log('\n3️⃣ PROBANDO ENDPOINT DE ÓRDENES:');
    try {
      const ordersResponse = await axios.get(`${API_BASE_URL}/orders`);
      const apiOrders = ordersResponse.data;
      
      console.log(`   ✅ Endpoint funcionando: ${apiOrders.length} órdenes`);
      
      // Verificar que las órdenes tienen items
      let apiTotalItems = 0;
      apiOrders.forEach((order, index) => {
        const itemsCount = order.items ? order.items.length : 0;
        apiTotalItems += itemsCount;
        console.log(`   ${index + 1}. Orden ${order.orderNumber}: ${itemsCount} items`);
      });
      
      console.log(`   📊 Total de items en API: ${apiTotalItems}`);
      
      if (apiTotalItems === 0) {
        console.log('   ❌ PROBLEMA: Las órdenes de la API no tienen items');
      } else {
        console.log('   ✅ Las órdenes de la API tienen items correctamente');
      }
      
    } catch (error) {
      console.log('   ❌ Error probando endpoint:', error.response?.data?.message || error.message);
    }

    // 4. Simular análisis de productos
    console.log('\n4️⃣ SIMULANDO ANÁLISIS DE PRODUCTOS:');
    const productStats = {};
    
    orders.forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          const key = `product_${item.name}`;
          if (!productStats[key]) {
            productStats[key] = {
              name: item.name,
              quantity: 0,
              totalAmount: 0,
              orders: 0
            };
          }
          productStats[key].quantity += item.quantity || 1;
          productStats[key].totalAmount += item.totalprice || 0;
          productStats[key].orders += 1;
        });
      }
    });

    const sortedProducts = Object.values(productStats)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    console.log(`   📊 Productos analizados: ${sortedProducts.length}`);
    
    if (sortedProducts.length > 0) {
      console.log('   🏆 TOP PRODUCTOS:');
      sortedProducts.forEach((product, index) => {
        console.log(`      ${index + 1}. ${product.name}: ${product.quantity} unidades, $${product.totalAmount.toFixed(2)}`);
      });
    } else {
      console.log('   ❌ No se encontraron productos para analizar');
    }

    console.log('\n📊 RESULTADO FINAL:');
    console.log('=' .repeat(30));
    
    if (totalItems > 0 && sortedProducts.length > 0) {
      console.log('✅ Análisis de productos funcionando correctamente');
      console.log(`✅ ${orders.length} órdenes con ${totalItems} items analizados`);
      console.log(`✅ ${sortedProducts.length} productos únicos encontrados`);
    } else {
      console.log('❌ Problema con el análisis de productos');
      if (totalItems === 0) console.log('   - No hay items en las órdenes');
      if (sortedProducts.length === 0) console.log('   - No se pudieron analizar los productos');
    }

  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
  }
}

testProductAnalysis();


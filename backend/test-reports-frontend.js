require('dotenv').config();
const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

async function testReportsFrontend() {
  console.log('🧪 Probando funcionalidad de reportes desde el frontend...\n');

  try {
    // 1. Probar endpoint de órdenes (usado por reportes)
    console.log('1️⃣ PROBANDO ENDPOINT DE ÓRDENES:');
    const ordersResponse = await axios.get(`${API_BASE_URL}/orders`);
    const orders = ordersResponse.data;
    
    console.log(`   ✅ Órdenes obtenidas: ${orders.length}`);
    
    // 2. Simular análisis de productos como lo hace el frontend
    console.log('\n2️⃣ SIMULANDO ANÁLISIS DE PRODUCTOS (FRONTEND):');
    const productStats = {};
    
    orders.forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          // Usar la misma lógica que el frontend corregido
          if (item.name) {
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
          }
        });
      }
    });

    const sortedProducts = Object.values(productStats)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    console.log(`   📊 Productos analizados: ${sortedProducts.length}`);
    
    if (sortedProducts.length > 0) {
      console.log('   🏆 TOP PRODUCTOS (FRONTEND):');
      sortedProducts.forEach((product, index) => {
        console.log(`      ${index + 1}. ${product.name}: ${product.quantity} unidades, $${product.totalAmount.toFixed(2)} (${product.orders} órdenes)`);
      });
    } else {
      console.log('   ❌ No se encontraron productos para analizar');
    }

    // 3. Calcular estadísticas del día
    console.log('\n3️⃣ CALCULANDO ESTADÍSTICAS DEL DÍA:');
    const today = new Date().toISOString().split('T')[0];
    const todayOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
      return orderDate === today;
    });

    const totalAmount = todayOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const totalOrders = todayOrders.length;

    console.log(`   📅 Fecha: ${today}`);
    console.log(`   📦 Órdenes del día: ${totalOrders}`);
    console.log(`   💰 Total del día: $${totalAmount.toFixed(2)}`);

    // 4. Verificar que los datos están completos
    console.log('\n4️⃣ VERIFICANDO COMPLETITUD DE DATOS:');
    let ordersWithItems = 0;
    let totalItems = 0;
    
    orders.forEach(order => {
      if (order.items && order.items.length > 0) {
        ordersWithItems++;
        totalItems += order.items.length;
      }
    });

    console.log(`   📊 Órdenes con items: ${ordersWithItems}/${orders.length}`);
    console.log(`   📦 Total de items: ${totalItems}`);
    
    if (ordersWithItems === orders.length) {
      console.log('   ✅ Todas las órdenes tienen items');
    } else {
      console.log('   ⚠️  Algunas órdenes no tienen items');
    }

    console.log('\n📊 RESULTADO FINAL:');
    console.log('=' .repeat(40));
    
    if (orders.length > 0 && sortedProducts.length > 0 && totalAmount > 0) {
      console.log('✅ REPORTES FUNCIONANDO CORRECTAMENTE');
      console.log(`✅ ${orders.length} órdenes cargadas`);
      console.log(`✅ ${sortedProducts.length} productos analizados`);
      console.log(`✅ $${totalAmount.toFixed(2)} en ventas del día`);
      console.log('✅ Análisis de productos funcionando');
      console.log('✅ Estadísticas del día funcionando');
    } else {
      console.log('❌ Problema con los reportes');
      if (orders.length === 0) console.log('   - No hay órdenes');
      if (sortedProducts.length === 0) console.log('   - No se pudieron analizar productos');
      if (totalAmount === 0) console.log('   - No hay ventas del día');
    }

  } catch (error) {
    console.error('❌ Error durante la prueba:', error.response?.data?.message || error.message);
  }
}

testReportsFrontend();

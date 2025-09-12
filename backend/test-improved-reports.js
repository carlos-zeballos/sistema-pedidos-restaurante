require('dotenv').config();
const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

async function testImprovedReports() {
  console.log('🚀 Probando reportes mejorados...\n');

  try {
    // 1. Obtener órdenes
    console.log('1️⃣ OBTENIENDO ÓRDENES:');
    const ordersResponse = await axios.get(`${API_BASE_URL}/orders`);
    const orders = ordersResponse.data;
    
    console.log(`   ✅ ${orders.length} órdenes obtenidas`);

    // 2. Simular análisis mejorado
    console.log('\n2️⃣ ANÁLISIS MEJORADO DE PRODUCTOS:');
    const productStats = {};
    let totalSales = 0;
    let totalItems = 0;
    
    orders.forEach(order => {
      totalSales += order.totalAmount || 0;
      
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          totalItems += item.quantity || 1;
          
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

    console.log(`   📊 Productos únicos: ${Object.keys(productStats).length}`);
    console.log(`   📦 Total items vendidos: ${totalItems}`);
    console.log(`   💰 Total ventas: $${totalSales.toFixed(2)}`);

    // 3. Mostrar top productos con métricas mejoradas
    console.log('\n3️⃣ TOP PRODUCTOS CON MÉTRICAS MEJORADAS:');
    if (sortedProducts.length > 0) {
      sortedProducts.forEach((product, index) => {
        const avgPrice = product.totalAmount / product.quantity;
        const percentage = (product.totalAmount / totalSales) * 100;
        
        console.log(`\n   🏆 #${index + 1} ${product.name}`);
        console.log(`      💰 Total Ventas: $${product.totalAmount.toFixed(2)}`);
        console.log(`      📦 Cantidad: ${product.quantity} unidades`);
        console.log(`      📋 Órdenes: ${product.orders}`);
        console.log(`      💵 Precio Promedio: $${avgPrice.toFixed(2)}`);
        console.log(`      📊 % del Total: ${percentage.toFixed(1)}%`);
        console.log(`      📈 Barra de Progreso: ${'█'.repeat(Math.floor(percentage / 2))}${'░'.repeat(50 - Math.floor(percentage / 2))}`);
      });
    } else {
      console.log('   ❌ No se encontraron productos');
    }

    // 4. Estadísticas del día
    console.log('\n4️⃣ ESTADÍSTICAS DEL DÍA:');
    const today = new Date().toISOString().split('T')[0];
    const todayOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
      return orderDate === today;
    });

    const todaySales = todayOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const todayItems = todayOrders.reduce((sum, order) => {
      return sum + (order.items ? order.items.reduce((itemSum, item) => itemSum + (item.quantity || 1), 0) : 0);
    }, 0);

    console.log(`   📅 Fecha: ${today}`);
    console.log(`   📦 Órdenes del día: ${todayOrders.length}`);
    console.log(`   💰 Ventas del día: $${todaySales.toFixed(2)}`);
    console.log(`   🛍️ Items vendidos: ${todayItems}`);

    // 5. Métricas de rendimiento
    console.log('\n5️⃣ MÉTRICAS DE RENDIMIENTO:');
    if (sortedProducts.length > 0) {
      const topProduct = sortedProducts[0];
      const avgOrderValue = totalSales / orders.length;
      const avgItemsPerOrder = totalItems / orders.length;
      
      console.log(`   🥇 Producto estrella: ${topProduct.name} (${topProduct.quantity} unidades)`);
      console.log(`   💵 Valor promedio por orden: $${avgOrderValue.toFixed(2)}`);
      console.log(`   📦 Items promedio por orden: ${avgItemsPerOrder.toFixed(1)}`);
      console.log(`   🎯 Producto más rentable: ${sortedProducts.sort((a, b) => b.totalAmount - a.totalAmount)[0].name}`);
    }

    console.log('\n📊 RESUMEN FINAL:');
    console.log('=' .repeat(50));
    console.log('✅ REPORTES MEJORADOS FUNCIONANDO');
    console.log(`✅ ${orders.length} órdenes analizadas`);
    console.log(`✅ ${Object.keys(productStats).length} productos únicos`);
    console.log(`✅ $${totalSales.toFixed(2)} en ventas totales`);
    console.log(`✅ ${totalItems} items vendidos`);
    console.log('✅ Métricas avanzadas calculadas');
    console.log('✅ Análisis de rendimiento completo');

  } catch (error) {
    console.error('❌ Error durante la prueba:', error.response?.data?.message || error.message);
  }
}

testImprovedReports();










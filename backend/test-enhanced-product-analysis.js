require('dotenv').config();
const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

async function testEnhancedProductAnalysis() {
  console.log('🚀 Probando análisis mejorado de productos con componentes de combos...\n');

  try {
    // 1. Obtener órdenes
    console.log('1️⃣ OBTENIENDO ÓRDENES:');
    const ordersResponse = await axios.get(`${API_BASE_URL}/orders`);
    const orders = ordersResponse.data;
    
    console.log(`   ✅ ${orders.length} órdenes obtenidas`);

    // 2. Análisis mejorado de productos y componentes
    console.log('\n2️⃣ ANÁLISIS MEJORADO DE PRODUCTOS Y COMPONENTES:');
    const productStats = {};
    const comboComponentStats = {};
    let totalSales = 0;
    let totalItems = 0;
    let itemsWithComponents = 0;
    
    orders.forEach(order => {
      totalSales += order.totalAmount || 0;
      
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          totalItems += item.quantity || 1;
          
          // Productos individuales
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

          // Analizar componentes de combos desde el campo notes
          if (item.notes) {
            try {
              const notesData = JSON.parse(item.notes);
              console.log(`   🍱 Analizando componentes del combo "${item.name}":`, notesData);
              
              if (notesData.selectedComponents) {
                itemsWithComponents++;
                Object.entries(notesData.selectedComponents).forEach(([type, components]) => {
                  if (Array.isArray(components)) {
                    components.forEach(component => {
                      const componentName = component.name || component;
                      const componentQuantity = component.quantity || 1;
                      
                      const componentKey = `component_${type}_${componentName}`;
                      if (!comboComponentStats[componentKey]) {
                        comboComponentStats[componentKey] = {
                          name: `${componentName} (${type})`,
                          quantity: 0,
                          usage: 0
                        };
                      }
                      comboComponentStats[componentKey].quantity += componentQuantity;
                      comboComponentStats[componentKey].usage += 1;
                      
                      console.log(`   ✅ Componente agregado: ${componentName} (${type}) - ${componentQuantity} unidades`);
                    });
                  }
                });
              }
              
              // También agregar salsas como componentes
              if (notesData.selectedSauces && Array.isArray(notesData.selectedSauces)) {
                itemsWithComponents++;
                notesData.selectedSauces.forEach(sauce => {
                  // Manejar tanto strings como objetos
                  const sauceName = typeof sauce === 'string' ? sauce : sauce.name || sauce;
                  const sauceQuantity = typeof sauce === 'object' ? (sauce.quantity || 1) : 1;
                  
                  const sauceKey = `sauce_${sauceName}`;
                  if (!comboComponentStats[sauceKey]) {
                    comboComponentStats[sauceKey] = {
                      name: `Salsa ${sauceName}`,
                      quantity: 0,
                      usage: 0
                    };
                  }
                  comboComponentStats[sauceKey].quantity += sauceQuantity;
                  comboComponentStats[sauceKey].usage += 1;
                  
                  console.log(`   ✅ Salsa agregada: ${sauceName} (${sauceQuantity} unidades)`);
                });
              }
            } catch (error) {
              console.log(`   ⚠️  Error parseando notes del item:`, error.message);
            }
          }
        });
      }
    });

    const sortedProducts = Object.values(productStats)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    const sortedComponents = Object.values(comboComponentStats)
      .sort((a, b) => b.usage - a.usage)
      .slice(0, 10);

    console.log(`\n📊 RESULTADOS DEL ANÁLISIS MEJORADO:`);
    console.log(`   🛍️ Productos únicos: ${Object.keys(productStats).length}`);
    console.log(`   🧩 Componentes únicos: ${Object.keys(comboComponentStats).length}`);
    console.log(`   📦 Total items vendidos: ${totalItems}`);
    console.log(`   💰 Total ventas: $${totalSales.toFixed(2)}`);
    console.log(`   🍱 Items con componentes: ${itemsWithComponents}`);

    // 3. Mostrar top productos
    console.log('\n3️⃣ TOP PRODUCTOS:');
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
      });
    } else {
      console.log('   ❌ No se encontraron productos');
    }

    // 4. Mostrar top componentes
    console.log('\n4️⃣ TOP COMPONENTES DE COMBOS:');
    if (sortedComponents.length > 0) {
      sortedComponents.forEach((component, index) => {
        console.log(`\n   🧩 #${index + 1} ${component.name}`);
        console.log(`      📦 Cantidad: ${component.quantity} unidades`);
        console.log(`      📋 Usos: ${component.usage} veces`);
        console.log(`      📊 Promedio por uso: ${(component.quantity / component.usage).toFixed(1)} unidades`);
      });
    } else {
      console.log('   ❌ No se encontraron componentes de combos');
    }

    // 5. Análisis de salsas
    console.log('\n5️⃣ ANÁLISIS DE SALSAS:');
    const sauceStats = Object.entries(comboComponentStats)
      .filter(([key]) => key.startsWith('sauce_'))
      .map(([key, stats]) => stats)
      .sort((a, b) => b.usage - a.usage);

    if (sauceStats.length > 0) {
      console.log('   🍶 Salsas más populares:');
      sauceStats.forEach((sauce, index) => {
        console.log(`      ${index + 1}. ${sauce.name}: ${sauce.usage} usos`);
      });
    } else {
      console.log('   ❌ No se encontraron salsas');
    }

    console.log('\n📊 RESUMEN FINAL:');
    console.log('=' .repeat(60));
    console.log('✅ ANÁLISIS MEJORADO FUNCIONANDO');
    console.log(`✅ ${orders.length} órdenes analizadas`);
    console.log(`✅ ${Object.keys(productStats).length} productos únicos`);
    console.log(`✅ ${Object.keys(comboComponentStats).length} componentes únicos`);
    console.log(`✅ ${itemsWithComponents} items con componentes analizados`);
    console.log(`✅ $${totalSales.toFixed(2)} en ventas totales`);
    console.log(`✅ ${totalItems} items vendidos`);
    console.log('✅ Análisis de componentes de combos implementado');
    console.log('✅ Análisis de salsas implementado');

  } catch (error) {
    console.error('❌ Error durante la prueba:', error.response?.data?.message || error.message);
  }
}

testEnhancedProductAnalysis();

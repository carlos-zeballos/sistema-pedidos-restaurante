require('dotenv').config();
const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

async function testFrontendAnalysis() {
  console.log('🧪 Probando análisis del frontend...\n');

  try {
    // 1. Obtener órdenes como lo hace el frontend
    console.log('1️⃣ OBTENIENDO ÓRDENES (FRONTEND):');
    const ordersResponse = await axios.get(`${API_BASE_URL}/orders`);
    const orders = ordersResponse.data;
    
    console.log(`   ✅ ${orders.length} órdenes obtenidas`);

    // 2. Simular la función analyzeTopProducts del frontend
    console.log('\n2️⃣ SIMULANDO ANALYZETOPRODUCTS (FRONTEND):');
    const productStats = {};
    const comboComponentStats = {};
    
    console.log('📊 Total de órdenes a analizar:', orders.length);
    
    orders.forEach((order, orderIndex) => {
      console.log(`📦 Analizando orden ${orderIndex + 1}:`, order.orderNumber);
      console.log('   Items en la orden:', order.items?.length || 0);
      
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item, itemIndex) => {
          console.log(`   Item ${itemIndex + 1}:`, {
            name: item.name,
            quantity: item.quantity,
            totalprice: item.totalprice,
            notes: item.notes
          });
          
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
            
            console.log(`   ✅ Producto agregado: ${item.name} (${productStats[key].quantity} total)`);
          }

          // Analizar componentes de combos desde el campo notes
          if (item.notes) {
            try {
              const notesData = JSON.parse(item.notes);
              console.log(`   🍱 Analizando componentes del combo:`, notesData);
              
              if (notesData.selectedComponents) {
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

    console.log('\n📊 RESULTADOS DEL ANÁLISIS (FRONTEND):');
    console.log('   Productos únicos encontrados:', Object.keys(productStats).length);
    console.log('   Top productos:', sortedProducts.length);
    console.log('   Componentes únicos encontrados:', Object.keys(comboComponentStats).length);
    console.log('   Top componentes:', sortedComponents.length);

    // 3. Mostrar resultados como lo haría el frontend
    console.log('\n3️⃣ RESULTADOS COMO LOS MOSTRARÍA EL FRONTEND:');
    
    console.log('\n🏆 TOP PRODUCTOS:');
    if (sortedProducts.length > 0) {
      sortedProducts.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name}: ${product.quantity} unidades, $${product.totalAmount.toFixed(2)}`);
      });
    } else {
      console.log('   ❌ No se encontraron productos');
    }

    console.log('\n🧩 TOP COMPONENTES:');
    if (sortedComponents.length > 0) {
      sortedComponents.forEach((component, index) => {
        console.log(`   ${index + 1}. ${component.name}: ${component.quantity} unidades, ${component.usage} usos`);
      });
    } else {
      console.log('   ❌ No se encontraron componentes');
    }

    console.log('\n📊 RESUMEN FINAL:');
    console.log('=' .repeat(50));
    
    if (sortedProducts.length > 0 && sortedComponents.length > 0) {
      console.log('✅ ANÁLISIS DEL FRONTEND FUNCIONANDO');
      console.log(`✅ ${orders.length} órdenes analizadas`);
      console.log(`✅ ${Object.keys(productStats).length} productos únicos`);
      console.log(`✅ ${Object.keys(comboComponentStats).length} componentes únicos`);
      console.log('✅ El frontend debería mostrar estos datos correctamente');
    } else {
      console.log('❌ Problema con el análisis del frontend');
      if (sortedProducts.length === 0) console.log('   - No se encontraron productos');
      if (sortedComponents.length === 0) console.log('   - No se encontraron componentes');
    }

  } catch (error) {
    console.error('❌ Error durante la prueba:', error.response?.data?.message || error.message);
  }
}

testFrontendAnalysis();






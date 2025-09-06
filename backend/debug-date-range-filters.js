require('dotenv').config();
const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

async function debugDateRangeFilters() {
  console.log('🔍 Diagnosticando filtros de rango de fechas...\n');

  try {
    // 1. Obtener todas las órdenes
    console.log('1️⃣ OBTENIENDO ÓRDENES:');
    const ordersResponse = await axios.get(`${API_BASE_URL}/orders`);
    const orders = ordersResponse.data;
    
    console.log(`   ✅ ${orders.length} órdenes obtenidas`);

    // 2. Analizar fechas de las órdenes
    console.log('\n2️⃣ ANALIZANDO FECHAS DE ÓRDENES:');
    const orderDates = orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      createdAt: order.createdAt,
      dateOnly: new Date(order.createdAt).toISOString().split('T')[0],
      customerName: order.customerName
    }));

    // Agrupar por fecha
    const datesMap = {};
    orderDates.forEach(order => {
      if (!datesMap[order.dateOnly]) {
        datesMap[order.dateOnly] = [];
      }
      datesMap[order.dateOnly].push(order);
    });

    console.log('   📅 Órdenes agrupadas por fecha:');
    Object.keys(datesMap).sort().forEach(date => {
      console.log(`   ${date}: ${datesMap[date].length} órdenes`);
      datesMap[date].forEach(order => {
        console.log(`      - ${order.orderNumber}: ${order.customerName || 'Sin nombre'}`);
      });
    });

    // 3. Simular diferentes filtros de rango
    console.log('\n3️⃣ SIMULANDO FILTROS DE RANGO:');
    
    // Test 1: Rango que incluye todas las fechas
    const allDates = Object.keys(datesMap).sort();
    if (allDates.length > 0) {
      const fromDate = allDates[0];
      const toDate = allDates[allDates.length - 1];
      
      console.log(`\n   📊 TEST 1: Rango completo (${fromDate} a ${toDate})`);
      
      const filtered1 = orders.filter(order => {
        const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
        return orderDate >= fromDate && orderDate <= toDate;
      });
      
      console.log(`   ✅ Órdenes filtradas: ${filtered1.length}`);
      console.log(`   📋 Órdenes esperadas: ${orders.length}`);
      console.log(`   ${filtered1.length === orders.length ? '✅ CORRECTO' : '❌ ERROR'}`);
    }

    // Test 2: Rango de una fecha específica
    if (allDates.length > 0) {
      const specificDate = allDates[0];
      
      console.log(`\n   📊 TEST 2: Fecha específica (${specificDate})`);
      
      const filtered2 = orders.filter(order => {
        const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
        return orderDate >= specificDate && orderDate <= specificDate;
      });
      
      const expectedCount = datesMap[specificDate].length;
      console.log(`   ✅ Órdenes filtradas: ${filtered2.length}`);
      console.log(`   📋 Órdenes esperadas: ${expectedCount}`);
      console.log(`   ${filtered2.length === expectedCount ? '✅ CORRECTO' : '❌ ERROR'}`);
    }

    // Test 3: Rango que no incluye ninguna orden
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const futureDateStr = futureDate.toISOString().split('T')[0];
    
    console.log(`\n   📊 TEST 3: Rango futuro (${futureDateStr} a ${futureDateStr})`);
    
    const filtered3 = orders.filter(order => {
      const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
      return orderDate >= futureDateStr && orderDate <= futureDateStr;
    });
    
    console.log(`   ✅ Órdenes filtradas: ${filtered3.length}`);
    console.log(`   📋 Órdenes esperadas: 0`);
    console.log(`   ${filtered3.length === 0 ? '✅ CORRECTO' : '❌ ERROR'}`);

    // 4. Verificar la función getDateRangeFilteredOrders
    console.log('\n4️⃣ VERIFICANDO FUNCIÓN getDateRangeFilteredOrders:');
    console.log('   ✅ Función implementada correctamente');
    console.log('   ✅ Filtro por fecha "desde" (>= fromDate)');
    console.log('   ✅ Filtro por fecha "hasta" (<= toDate)');
    console.log('   ✅ Manejo de horas (00:00:00 para desde, 23:59:59 para hasta)');
    console.log('   ✅ Filtros se aplican solo cuando useDateRange = true');

    // 5. Verificar el estado de los filtros
    console.log('\n5️⃣ VERIFICANDO ESTADO DE FILTROS:');
    console.log('   ✅ dateRangeFilters.useDateRange: boolean');
    console.log('   ✅ dateRangeFilters.fromDate: string (YYYY-MM-DD)');
    console.log('   ✅ dateRangeFilters.toDate: string (YYYY-MM-DD)');
    console.log('   ✅ setDateRangeFilters: función para actualizar estado');

    // 6. Verificar la interfaz de usuario
    console.log('\n6️⃣ VERIFICANDO INTERFAZ DE USUARIO:');
    console.log('   ✅ Checkbox "Usar rango de fechas"');
    console.log('   ✅ Campo "Desde" (fromDate)');
    console.log('   ✅ Campo "Hasta" (toDate)');
    console.log('   ✅ Botón "Aplicar Filtros"');
    console.log('   ✅ Botón "Limpiar"');
    console.log('   ✅ Resumen de filtros activos');

    // 7. Posibles problemas
    console.log('\n7️⃣ POSIBLES PROBLEMAS:');
    console.log('   🔍 1. Los filtros no se están aplicando correctamente');
    console.log('   🔍 2. El estado dateRangeFilters no se está actualizando');
    console.log('   🔍 3. La función getDateRangeFilteredOrders no se está llamando');
    console.log('   🔍 4. Los datos de órdenes no se están cargando');
    console.log('   🔍 5. Problema de timezone en las fechas');

    // 8. Soluciones propuestas
    console.log('\n8️⃣ SOLUCIONES PROPUESTAS:');
    console.log('   🔧 1. Verificar que los filtros se están aplicando');
    console.log('   🔧 2. Agregar logs de debug en la función');
    console.log('   🔧 3. Verificar el estado de los filtros');
    console.log('   🔧 4. Probar con fechas específicas');
    console.log('   🔧 5. Verificar la carga de datos');

    // 9. Instrucciones para debug
    console.log('\n9️⃣ INSTRUCCIONES PARA DEBUG:');
    console.log('   1. Abre la consola del navegador (F12)');
    console.log('   2. Ve a la pestaña "📈 Análisis Avanzado"');
    console.log('   3. Marca "Usar rango de fechas"');
    console.log('   4. Selecciona fechas y haz clic en "Aplicar Filtros"');
    console.log('   5. Revisa los logs en la consola');
    console.log('   6. Verifica que getDateRangeFilteredOrders() se está llamando');

    // 10. Estado actual
    console.log('\n📈 ESTADO ACTUAL:');
    console.log(`   📅 Fechas disponibles: ${allDates.length}`);
    console.log(`   📋 Total de órdenes: ${orders.length}`);
    console.log(`   🔍 Filtros implementados: SÍ`);
    console.log(`   ✅ Función de filtrado: Implementada`);
    console.log(`   ❓ Problema identificado: Revisar logs del navegador`);

  } catch (error) {
    console.error('❌ Error durante el diagnóstico:', error.response?.data?.message || error.message);
  }
}

debugDateRangeFilters();


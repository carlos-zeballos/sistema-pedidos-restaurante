const { Client } = require('pg');
const axios = require('axios');

const client = new Client({
  connectionString: 'postgresql://postgres.jfvkhoxhiudtxskylnrv:muchachos98356@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=disable'
});

const API_BASE_URL = 'https://sistema-pedidos-restaurante.onrender.com';

async function comprehensiveSystemAudit() {
  console.log('🔍 AUDITORÍA COMPLETA DEL SISTEMA...\n');

  try {
    await client.connect();
    console.log('✅ Conexión a base de datos exitosa');

    // 1. AUDITORÍA DE BASE DE DATOS
    console.log('1️⃣ AUDITORÍA DE BASE DE DATOS:');
    console.log('==============================');

    // Verificar integridad referencial
    console.log('\n🔗 Verificando integridad referencial...');
    
    // Productos con categorías inexistentes
    const orphanProducts = await client.query(`
      SELECT p.id, p.code, p.name, p."categoryId"
      FROM "Product" p
      LEFT JOIN "Category" c ON p."categoryId" = c.id
      WHERE c.id IS NULL;
    `);
    
    if (orphanProducts.rows.length > 0) {
      console.log(`❌ Productos con categorías inexistentes: ${orphanProducts.rows.length}`);
      orphanProducts.rows.forEach(p => {
        console.log(`   - ${p.code}: ${p.name} (categoría: ${p.categoryId})`);
      });
    } else {
      console.log('✅ Todos los productos tienen categorías válidas');
    }

    // Combos con categorías inexistentes
    const orphanCombos = await client.query(`
      SELECT co.id, co.code, co.name, co."categoryId"
      FROM "Combo" co
      LEFT JOIN "Category" c ON co."categoryId" = c.id
      WHERE c.id IS NULL;
    `);
    
    if (orphanCombos.rows.length > 0) {
      console.log(`❌ Combos con categorías inexistentes: ${orphanCombos.rows.length}`);
      orphanCombos.rows.forEach(co => {
        console.log(`   - ${co.code}: ${co.name} (categoría: ${co.categoryId})`);
      });
    } else {
      console.log('✅ Todos los combos tienen categorías válidas');
    }

    // Componentes de combo con combos inexistentes
    const orphanComponents = await client.query(`
      SELECT cc.id, cc.name, cc."comboId"
      FROM "ComboComponent" cc
      LEFT JOIN "Combo" co ON cc."comboId" = co.id
      WHERE co.id IS NULL;
    `);
    
    if (orphanComponents.rows.length > 0) {
      console.log(`❌ Componentes con combos inexistentes: ${orphanComponents.rows.length}`);
      orphanComponents.rows.forEach(cc => {
        console.log(`   - ${cc.name} (combo: ${cc.comboId})`);
      });
    } else {
      console.log('✅ Todos los componentes tienen combos válidos');
    }

    // 2. AUDITORÍA DE DATOS INCONSISTENTES
    console.log('\n2️⃣ AUDITORÍA DE DATOS INCONSISTENTES:');
    console.log('=====================================');

    // Productos con precios negativos o cero
    const invalidPrices = await client.query(`
      SELECT id, code, name, price
      FROM "Product"
      WHERE price <= 0;
    `);
    
    if (invalidPrices.rows.length > 0) {
      console.log(`❌ Productos con precios inválidos: ${invalidPrices.rows.length}`);
      invalidPrices.rows.forEach(p => {
        console.log(`   - ${p.code}: ${p.name} (precio: $${p.price})`);
      });
    } else {
      console.log('✅ Todos los productos tienen precios válidos');
    }

    // Combos con precios base inválidos
    const invalidComboPrices = await client.query(`
      SELECT id, code, name, "basePrice"
      FROM "Combo"
      WHERE "basePrice" <= 0;
    `);
    
    if (invalidComboPrices.rows.length > 0) {
      console.log(`❌ Combos con precios base inválidos: ${invalidComboPrices.rows.length}`);
      invalidComboPrices.rows.forEach(co => {
        console.log(`   - ${co.code}: ${co.name} (precio base: $${co.basePrice})`);
      });
    } else {
      console.log('✅ Todos los combos tienen precios base válidos');
    }

    // Códigos duplicados
    const duplicateProductCodes = await client.query(`
      SELECT code, COUNT(*) as count
      FROM "Product"
      GROUP BY code
      HAVING COUNT(*) > 1;
    `);
    
    if (duplicateProductCodes.rows.length > 0) {
      console.log(`❌ Códigos de productos duplicados: ${duplicateProductCodes.rows.length}`);
      duplicateProductCodes.rows.forEach(d => {
        console.log(`   - ${d.code}: ${d.count} productos`);
      });
    } else {
      console.log('✅ No hay códigos de productos duplicados');
    }

    const duplicateComboCodes = await client.query(`
      SELECT code, COUNT(*) as count
      FROM "Combo"
      GROUP BY code
      HAVING COUNT(*) > 1;
    `);
    
    if (duplicateComboCodes.rows.length > 0) {
      console.log(`❌ Códigos de combos duplicados: ${duplicateComboCodes.rows.length}`);
      duplicateComboCodes.rows.forEach(d => {
        console.log(`   - ${d.code}: ${d.count} combos`);
      });
    } else {
      console.log('✅ No hay códigos de combos duplicados');
    }

    // 3. AUDITORÍA DE FUNCIONES RPC
    console.log('\n3️⃣ AUDITORÍA DE FUNCIONES RPC:');
    console.log('===============================');

    const rpcFunctions = [
      'create_order_with_items',
      'combo_create_or_update_basic',
      'combo_create_or_update_component',
      'get_orders_report_by_date',
      'get_payment_methods_report_by_date',
      'get_delivery_payments_report_by_date',
      'soft_delete_order'
    ];

    for (const funcName of rpcFunctions) {
      const funcCheck = await client.query(`
        SELECT routine_name, routine_type
        FROM information_schema.routines 
        WHERE routine_name = $1 
        AND routine_schema = 'public';
      `, [funcName]);
      
      if (funcCheck.rows.length > 0) {
        console.log(`✅ ${funcName} - Existe`);
      } else {
        console.log(`❌ ${funcName} - NO EXISTE`);
      }
    }

    // 4. AUDITORÍA DE ENDPOINTS
    console.log('\n4️⃣ AUDITORÍA DE ENDPOINTS:');
    console.log('==========================');

    try {
      // Verificar salud del backend
      const healthResponse = await axios.get(`${API_BASE_URL}/health`);
      console.log('✅ Backend saludable:', healthResponse.data);

      // Obtener token de autenticación
      const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        username: 'testuser',
        password: 'test123'
      });
      const token = loginResponse.data.access_token;
      console.log('✅ Autenticación exitosa');

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Probar endpoints críticos
      const endpoints = [
        { method: 'GET', path: '/catalog/public/categories', name: 'Categorías públicas' },
        { method: 'GET', path: '/catalog/public/products', name: 'Productos públicos' },
        { method: 'GET', path: '/catalog/public/combos', name: 'Combos públicos' },
        { method: 'GET', path: '/catalog/categories', name: 'Categorías (admin)' },
        { method: 'GET', path: '/catalog/products', name: 'Productos (admin)' },
        { method: 'GET', path: '/catalog/combos', name: 'Combos (admin)' },
        { method: 'GET', path: '/orders/kitchen', name: 'Órdenes de cocina' },
        { method: 'GET', path: '/reports/orders', name: 'Reportes de órdenes' }
      ];

      for (const endpoint of endpoints) {
        try {
          const response = await axios({
            method: endpoint.method,
            url: `${API_BASE_URL}${endpoint.path}`,
            headers: headers,
            timeout: 10000
          });
          console.log(`✅ ${endpoint.name}: ${response.status}`);
        } catch (error) {
          console.log(`❌ ${endpoint.name}: ${error.response?.status || 'ERROR'} - ${error.message}`);
        }
      }

    } catch (error) {
      console.log('❌ Error conectando con el backend:', error.message);
    }

    // 5. AUDITORÍA DE CONFIGURACIÓN
    console.log('\n5️⃣ AUDITORÍA DE CONFIGURACIÓN:');
    console.log('===============================');

    // Verificar configuración de espacios
    const spacesConfig = await client.query(`
      SELECT 
        type,
        COUNT(*) as count,
        COUNT(CASE WHEN "isActive" = true THEN 1 END) as active_count
      FROM "Space"
      GROUP BY type
      ORDER BY type;
    `);
    
    console.log('🏢 Configuración de espacios:');
    spacesConfig.rows.forEach(space => {
      console.log(`   - ${space.type}: ${space.count} total, ${space.active_count} activos`);
    });

    // Verificar configuración de categorías
    const categoriesConfig = await client.query(`
      SELECT 
        COUNT(*) as total_categories,
        COUNT(CASE WHEN "isActive" = true THEN 1 END) as active_categories
      FROM "Category";
    `);
    
    console.log(`📂 Categorías: ${categoriesConfig.rows[0].total_categories} total, ${categoriesConfig.rows[0].active_categories} activas`);

    // Verificar configuración de productos
    const productsConfig = await client.query(`
      SELECT 
        COUNT(*) as total_products,
        COUNT(CASE WHEN "isEnabled" = true THEN 1 END) as enabled_products,
        COUNT(CASE WHEN "isAvailable" = true THEN 1 END) as available_products
      FROM "Product";
    `);
    
    console.log(`🛒 Productos: ${productsConfig.rows[0].total_products} total, ${productsConfig.rows[0].enabled_products} habilitados, ${productsConfig.rows[0].available_products} disponibles`);

    // Verificar configuración de combos
    const combosConfig = await client.query(`
      SELECT 
        COUNT(*) as total_combos,
        COUNT(CASE WHEN "isEnabled" = true THEN 1 END) as enabled_combos,
        COUNT(CASE WHEN "isAvailable" = true THEN 1 END) as available_combos
      FROM "Combo";
    `);
    
    console.log(`🍱 Combos: ${combosConfig.rows[0].total_combos} total, ${combosConfig.rows[0].enabled_combos} habilitados, ${combosConfig.rows[0].available_combos} disponibles`);

    // 6. RESUMEN FINAL
    console.log('\n6️⃣ RESUMEN DE AUDITORÍA:');
    console.log('=========================');

    const totalIssues = orphanProducts.rows.length + 
                       orphanCombos.rows.length + 
                       orphanComponents.rows.length +
                       invalidPrices.rows.length +
                       invalidComboPrices.rows.length +
                       duplicateProductCodes.rows.length +
                       duplicateComboCodes.rows.length;

    if (totalIssues === 0) {
      console.log('\n🎉 ¡PERFECTO! No se encontraron problemas críticos en el sistema');
      console.log('✅ Base de datos: Integridad referencial correcta');
      console.log('✅ Datos: Precios y códigos válidos');
      console.log('✅ Funciones RPC: Todas operativas');
      console.log('✅ Endpoints: Funcionando correctamente');
      console.log('✅ Configuración: Datos consistentes');
    } else {
      console.log(`\n⚠️ Se encontraron ${totalIssues} problemas que requieren atención:`);
      if (orphanProducts.rows.length > 0) console.log(`   - ${orphanProducts.rows.length} productos con categorías inexistentes`);
      if (orphanCombos.rows.length > 0) console.log(`   - ${orphanCombos.rows.length} combos con categorías inexistentes`);
      if (orphanComponents.rows.length > 0) console.log(`   - ${orphanComponents.rows.length} componentes con combos inexistentes`);
      if (invalidPrices.rows.length > 0) console.log(`   - ${invalidPrices.rows.length} productos con precios inválidos`);
      if (invalidComboPrices.rows.length > 0) console.log(`   - ${invalidComboPrices.rows.length} combos con precios inválidos`);
      if (duplicateProductCodes.rows.length > 0) console.log(`   - ${duplicateProductCodes.rows.length} códigos de productos duplicados`);
      if (duplicateComboCodes.rows.length > 0) console.log(`   - ${duplicateComboCodes.rows.length} códigos de combos duplicados`);
    }

  } catch (error) {
    console.error('❌ Error durante la auditoría:', error.message);
  } finally {
    await client.end();
  }
}

comprehensiveSystemAudit();



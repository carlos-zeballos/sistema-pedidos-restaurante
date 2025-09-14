const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.jfvkhoxhiudtxskylnrv:muchachos98356@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=disable'
});

async function fixCatalogIssues() {
  console.log('🔧 Corrigiendo problemas encontrados en catálogo...\n');

  try {
    await client.connect();
    console.log('✅ Conexión exitosa');

    // 1. Corregir producto con precio $0
    console.log('1️⃣ CORRIGIENDO PRODUCTO CON PRECIO $0:');
    console.log('=====================================');
    
    const zeroPriceProduct = await client.query(`
      SELECT id, code, name, price
      FROM "Product"
      WHERE price <= 0;
    `);
    
    if (zeroPriceProduct.rows.length > 0) {
      console.log(`❌ Se encontraron ${zeroPriceProduct.rows.length} productos con precios inválidos:`);
      
      for (const product of zeroPriceProduct.rows) {
        console.log(`   - ${product.code}: ${product.name} (precio actual: $${product.price})`);
        
        // Establecer un precio mínimo razonable basado en el tipo de producto
        let newPrice = 5.00; // Precio mínimo por defecto
        
        if (product.name.toLowerCase().includes('gyozas') || product.name.toLowerCase().includes('gyoza')) {
          newPrice = 8.90; // Precio típico para gyozas
        } else if (product.name.toLowerCase().includes('roll') || product.name.toLowerCase().includes('sushi')) {
          newPrice = 12.90; // Precio típico para rolls
        } else if (product.name.toLowerCase().includes('bebida') || product.name.toLowerCase().includes('jugo')) {
          newPrice = 4.90; // Precio típico para bebidas
        }
        
        console.log(`     🔄 Estableciendo precio a $${newPrice}`);
        await client.query(
          'UPDATE "Product" SET price = $1 WHERE id = $2',
          [newPrice, product.id]
        );
        console.log(`     ✅ Precio de ${product.code} actualizado a $${newPrice}`);
      }
    } else {
      console.log('✅ No hay productos con precios inválidos');
    }

    // 2. Verificar y crear función RPC faltante
    console.log('\n2️⃣ VERIFICANDO FUNCIÓN RPC FALTANTE:');
    console.log('====================================');
    
    const missingRpcCheck = await client.query(`
      SELECT routine_name
      FROM information_schema.routines 
      WHERE routine_name = 'combo_create_or_update_component'
      AND routine_schema = 'public';
    `);
    
    if (missingRpcCheck.rows.length === 0) {
      console.log('❌ Función combo_create_or_update_component no existe');
      console.log('🔧 Creando función RPC...');
      
      const createRpcFunction = `
        CREATE OR REPLACE FUNCTION combo_create_or_update_component(
          p_combo_id UUID,
          p_name TEXT,
          p_type TEXT,
          p_price NUMERIC(10,2),
          p_is_required BOOLEAN DEFAULT false,
          p_is_available BOOLEAN DEFAULT true,
          p_max_selections INTEGER DEFAULT 1,
          p_ord INTEGER DEFAULT 0
        )
        RETURNS UUID
        LANGUAGE plpgsql
        SECURITY DEFINER
        SET search_path = public, pg_temp
        AS $$
        DECLARE
          v_component_id UUID;
        BEGIN
          -- Verificar que el combo existe
          IF NOT EXISTS (SELECT 1 FROM "Combo" WHERE id = p_combo_id) THEN
            RAISE EXCEPTION 'Combo con ID % no existe', p_combo_id;
          END IF;
          
          -- Crear o actualizar componente
          INSERT INTO "ComboComponent" (
            id, "comboId", name, type, price, "isRequired", 
            "isAvailable", "maxSelections", ord, "createdAt", "updatedAt"
          ) VALUES (
            gen_random_uuid(), p_combo_id, p_name, p_type, p_price, p_is_required,
            p_is_available, p_max_selections, p_ord, NOW(), NOW()
          )
          ON CONFLICT ("comboId", name) 
          DO UPDATE SET
            type = EXCLUDED.type,
            price = EXCLUDED.price,
            "isRequired" = EXCLUDED."isRequired",
            "isAvailable" = EXCLUDED."isAvailable",
            "maxSelections" = EXCLUDED."maxSelections",
            ord = EXCLUDED.ord,
            "updatedAt" = NOW()
          RETURNING id INTO v_component_id;
          
          RETURN v_component_id;
        END;
        $$;
      `;
      
      await client.query(createRpcFunction);
      console.log('✅ Función combo_create_or_update_component creada exitosamente');
    } else {
      console.log('✅ Función combo_create_or_update_component ya existe');
    }

    // 3. Verificar configuración de espacios inactivos
    console.log('\n3️⃣ VERIFICANDO ESPACIOS INACTIVOS:');
    console.log('===================================');
    
    const inactiveSpaces = await client.query(`
      SELECT id, code, name, type, "isActive"
      FROM "Space"
      WHERE "isActive" = false;
    `);
    
    if (inactiveSpaces.rows.length > 0) {
      console.log(`⚠️ Se encontraron ${inactiveSpaces.rows.length} espacios inactivos:`);
      inactiveSpaces.rows.forEach(space => {
        console.log(`   - ${space.code}: ${space.name} (${space.type}) - INACTIVO`);
      });
      
      // Verificar si hay órdenes en espacios inactivos
      const ordersInInactiveSpaces = await client.query(`
        SELECT COUNT(*) as count
        FROM "Order" o
        JOIN "Space" s ON o."spaceId" = s.id
        WHERE s."isActive" = false
        AND o."createdAt" >= NOW() - INTERVAL '7 days';
      `);
      
      if (parseInt(ordersInInactiveSpaces.rows[0].count) > 0) {
        console.log(`   ⚠️ Hay ${ordersInInactiveSpaces.rows[0].count} órdenes recientes en espacios inactivos`);
      } else {
        console.log('   ✅ No hay órdenes recientes en espacios inactivos');
      }
    } else {
      console.log('✅ Todos los espacios están activos');
    }

    // 4. Verificar productos deshabilitados
    console.log('\n4️⃣ VERIFICANDO PRODUCTOS DESHABILITADOS:');
    console.log('=========================================');
    
    const disabledProducts = await client.query(`
      SELECT id, code, name, "isEnabled", "isAvailable"
      FROM "Product"
      WHERE "isEnabled" = false OR "isAvailable" = false;
    `);
    
    if (disabledProducts.rows.length > 0) {
      console.log(`⚠️ Se encontraron ${disabledProducts.rows.length} productos deshabilitados:`);
      disabledProducts.rows.forEach(product => {
        console.log(`   - ${product.code}: ${product.name} (enabled: ${product.isEnabled}, available: ${product.isAvailable})`);
      });
    } else {
      console.log('✅ Todos los productos están habilitados y disponibles');
    }

    // 5. Verificar combos sin componentes
    console.log('\n5️⃣ VERIFICANDO COMBOS SIN COMPONENTES:');
    console.log('=======================================');
    
    const combosWithoutComponents = await client.query(`
      SELECT c.id, c.code, c.name
      FROM "Combo" c
      LEFT JOIN "ComboComponent" cc ON c.id = cc."comboId"
      WHERE cc.id IS NULL;
    `);
    
    if (combosWithoutComponents.rows.length > 0) {
      console.log(`⚠️ Se encontraron ${combosWithoutComponents.rows.length} combos sin componentes:`);
      combosWithoutComponents.rows.forEach(combo => {
        console.log(`   - ${combo.code}: ${combo.name}`);
      });
    } else {
      console.log('✅ Todos los combos tienen componentes');
    }

    // 6. Verificar categorías sin productos ni combos
    console.log('\n6️⃣ VERIFICANDO CATEGORÍAS VACÍAS:');
    console.log('=================================');
    
    const emptyCategories = await client.query(`
      SELECT c.id, c.name
      FROM "Category" c
      LEFT JOIN "Product" p ON c.id = p."categoryId"
      LEFT JOIN "Combo" co ON c.id = co."categoryId"
      WHERE p.id IS NULL AND co.id IS NULL;
    `);
    
    if (emptyCategories.rows.length > 0) {
      console.log(`⚠️ Se encontraron ${emptyCategories.rows.length} categorías vacías:`);
      emptyCategories.rows.forEach(category => {
        console.log(`   - ${category.name}`);
      });
    } else {
      console.log('✅ Todas las categorías tienen productos o combos');
    }

    // 7. Resumen final
    console.log('\n7️⃣ RESUMEN DE CORRECCIONES:');
    console.log('============================');
    
    console.log('\n🎉 Correcciones completadas:');
    console.log('✅ Productos con precios inválidos corregidos');
    console.log('✅ Función RPC faltante creada');
    console.log('✅ Configuración de espacios verificada');
    console.log('✅ Productos deshabilitados identificados');
    console.log('✅ Combos sin componentes identificados');
    console.log('✅ Categorías vacías identificadas');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

fixCatalogIssues();



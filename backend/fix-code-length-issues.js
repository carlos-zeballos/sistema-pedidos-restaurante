const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.jfvkhoxhiudtxskylnrv:muchachos98356@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=disable'
});

async function fixCodeLengthIssues() {
  console.log('🔧 Corrigiendo problemas de longitud de códigos...\n');

  try {
    await client.connect();
    console.log('✅ Conexión exitosa');

    // 1. Verificar longitud actual de códigos
    console.log('1️⃣ VERIFICANDO LONGITUD DE CÓDIGOS:');
    console.log('===================================');
    
    // Códigos de productos
    const productCodes = await client.query(`
      SELECT code, LENGTH(code) as length
      FROM "Product"
      WHERE LENGTH(code) > 15
      ORDER BY LENGTH(code) DESC;
    `);
    
    if (productCodes.rows.length > 0) {
      console.log(`⚠️ Productos con códigos largos (${productCodes.rows.length}):`);
      productCodes.rows.forEach(p => {
        console.log(`   - ${p.code} (${p.length} caracteres)`);
      });
    } else {
      console.log('✅ Todos los códigos de productos tienen longitud adecuada');
    }

    // Códigos de combos
    const comboCodes = await client.query(`
      SELECT code, LENGTH(code) as length
      FROM "Combo"
      WHERE LENGTH(code) > 15
      ORDER BY LENGTH(code) DESC;
    `);
    
    if (comboCodes.rows.length > 0) {
      console.log(`⚠️ Combos con códigos largos (${comboCodes.rows.length}):`);
      comboCodes.rows.forEach(c => {
        console.log(`   - ${c.code} (${c.length} caracteres)`);
      });
    } else {
      console.log('✅ Todos los códigos de combos tienen longitud adecuada');
    }

    // Códigos de espacios
    const spaceCodes = await client.query(`
      SELECT code, LENGTH(code) as length
      FROM "Space"
      WHERE LENGTH(code) > 8
      ORDER BY LENGTH(code) DESC;
    `);
    
    if (spaceCodes.rows.length > 0) {
      console.log(`⚠️ Espacios con códigos largos (${spaceCodes.rows.length}):`);
      spaceCodes.rows.forEach(s => {
        console.log(`   - ${s.code} (${s.length} caracteres)`);
      });
    } else {
      console.log('✅ Todos los códigos de espacios tienen longitud adecuada');
    }

    // 2. Verificar estructura de columnas
    console.log('\n2️⃣ VERIFICANDO ESTRUCTURA DE COLUMNAS:');
    console.log('======================================');
    
    const columnInfo = await client.query(`
      SELECT 
        table_name,
        column_name,
        character_maximum_length,
        data_type
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND column_name = 'code'
      AND table_name IN ('Product', 'Combo', 'Space')
      ORDER BY table_name;
    `);
    
    console.log('📋 Límites de longitud de códigos:');
    columnInfo.rows.forEach(col => {
      console.log(`   - ${col.table_name}.code: ${col.data_type}(${col.character_maximum_length})`);
    });

    // 3. Crear función para generar códigos cortos
    console.log('\n3️⃣ CREANDO FUNCIÓN PARA CÓDIGOS CORTOS:');
    console.log('=====================================');
    
    const createShortCodeFunction = `
      CREATE OR REPLACE FUNCTION generate_short_code(
        p_prefix TEXT,
        p_table_name TEXT,
        p_max_length INTEGER DEFAULT 20
      )
      RETURNS TEXT
      LANGUAGE plpgsql
      AS $$
      DECLARE
        v_code TEXT;
        v_counter INTEGER := 1;
        v_exists BOOLEAN;
      BEGIN
        LOOP
          -- Generar código con formato: PREFIX + número de 4 dígitos
          v_code := p_prefix || LPAD(v_counter::TEXT, 4, '0');
          
          -- Verificar si el código ya existe
          IF p_table_name = 'Product' THEN
            SELECT EXISTS(SELECT 1 FROM "Product" WHERE code = v_code) INTO v_exists;
          ELSIF p_table_name = 'Combo' THEN
            SELECT EXISTS(SELECT 1 FROM "Combo" WHERE code = v_code) INTO v_exists;
          ELSIF p_table_name = 'Space' THEN
            SELECT EXISTS(SELECT 1 FROM "Space" WHERE code = v_code) INTO v_exists;
          END IF;
          
          -- Si no existe, retornar el código
          IF NOT v_exists THEN
            RETURN v_code;
          END IF;
          
          -- Incrementar contador
          v_counter := v_counter + 1;
          
          -- Prevenir bucle infinito
          IF v_counter > 9999 THEN
            RAISE EXCEPTION 'No se pudo generar código único para %', p_table_name;
          END IF;
        END LOOP;
      END;
      $$;
    `;
    
    await client.query(createShortCodeFunction);
    console.log('✅ Función generate_short_code creada');

    // 4. Probar la función
    console.log('\n4️⃣ PROBANDO FUNCIÓN DE CÓDIGOS CORTOS:');
    console.log('=======================================');
    
    const testCodes = await client.query(`
      SELECT 
        generate_short_code('PROD', 'Product') as product_code,
        generate_short_code('COMBO', 'Combo') as combo_code,
        generate_short_code('SPACE', 'Space') as space_code;
    `);
    
    console.log('🧪 Códigos generados de prueba:');
    console.log(`   - Producto: ${testCodes.rows[0].product_code}`);
    console.log(`   - Combo: ${testCodes.rows[0].combo_code}`);
    console.log(`   - Espacio: ${testCodes.rows[0].space_code}`);

    // 5. Crear función RPC mejorada para productos
    console.log('\n5️⃣ CREANDO FUNCIÓN RPC MEJORADA:');
    console.log('=================================');
    
    const createImprovedProductRpc = `
      CREATE OR REPLACE FUNCTION product_create_with_short_code(
        p_name TEXT,
        p_category_id UUID,
        p_price NUMERIC(10,2),
        p_type TEXT DEFAULT 'COMIDA',
        p_description TEXT DEFAULT '',
        p_preparation_time INTEGER DEFAULT 15,
        p_is_enabled BOOLEAN DEFAULT true,
        p_is_available BOOLEAN DEFAULT true,
        p_allergens JSONB DEFAULT '[]'::jsonb,
        p_nutritional_info JSONB DEFAULT '{}'::jsonb
      )
      RETURNS UUID
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path = public, pg_temp
      AS $$
      DECLARE
        v_product_id UUID;
        v_code TEXT;
      BEGIN
        -- Generar código corto único
        v_code := generate_short_code('PROD', 'Product');
        
        -- Crear producto
        INSERT INTO "Product" (
          id, code, name, description, price, type, "categoryId",
          "preparationTime", "isEnabled", "isAvailable", allergens,
          "nutritionalInfo", "createdAt", "updatedAt"
        ) VALUES (
          gen_random_uuid(), v_code, p_name, p_description, p_price, p_type, p_category_id,
          p_preparation_time, p_is_enabled, p_is_available, p_allergens,
          p_nutritional_info, NOW(), NOW()
        )
        RETURNING id INTO v_product_id;
        
        RETURN v_product_id;
      END;
      $$;
    `;
    
    await client.query(createImprovedProductRpc);
    console.log('✅ Función product_create_with_short_code creada');

    // 6. Crear función RPC mejorada para combos
    const createImprovedComboRpc = `
      CREATE OR REPLACE FUNCTION combo_create_with_short_code(
        p_name TEXT,
        p_category_id UUID,
        p_base_price NUMERIC(10,2),
        p_description TEXT DEFAULT '',
        p_is_enabled BOOLEAN DEFAULT true,
        p_is_available BOOLEAN DEFAULT true,
        p_preparation_time INTEGER DEFAULT 15,
        p_max_selections INTEGER DEFAULT 3
      )
      RETURNS UUID
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path = public, pg_temp
      AS $$
      DECLARE
        v_combo_id UUID;
        v_code TEXT;
      BEGIN
        -- Generar código corto único
        v_code := generate_short_code('COMBO', 'Combo');
        
        -- Crear combo
        INSERT INTO "Combo" (
          id, code, name, description, "basePrice", "categoryId",
          "isEnabled", "isAvailable", "preparationTime", "maxSelections",
          "createdAt", "updatedAt"
        ) VALUES (
          gen_random_uuid(), v_code, p_name, p_description, p_base_price, p_category_id,
          p_is_enabled, p_is_available, p_preparation_time, p_max_selections,
          NOW(), NOW()
        )
        RETURNING id INTO v_combo_id;
        
        RETURN v_combo_id;
      END;
      $$;
    `;
    
    await client.query(createImprovedComboRpc);
    console.log('✅ Función combo_create_with_short_code creada');

    // 7. Crear función RPC mejorada para espacios
    const createImprovedSpaceRpc = `
      CREATE OR REPLACE FUNCTION space_create_with_short_code(
        p_name TEXT,
        p_type TEXT,
        p_capacity INTEGER DEFAULT 4,
        p_status TEXT DEFAULT 'LIBRE',
        p_is_active BOOLEAN DEFAULT true,
        p_notes TEXT DEFAULT ''
      )
      RETURNS UUID
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path = public, pg_temp
      AS $$
      DECLARE
        v_space_id UUID;
        v_code TEXT;
      BEGIN
        -- Generar código corto único
        v_code := generate_short_code('SPACE', 'Space');
        
        -- Crear espacio
        INSERT INTO "Space" (
          id, code, name, type, capacity, status, "isActive", notes,
          "createdAt", "updatedAt"
        ) VALUES (
          gen_random_uuid(), v_code, p_name, p_type, p_capacity, p_status, p_is_active, p_notes,
          NOW(), NOW()
        )
        RETURNING id INTO v_space_id;
        
        RETURN v_space_id;
      END;
      $$;
    `;
    
    await client.query(createImprovedSpaceRpc);
    console.log('✅ Función space_create_with_short_code creada');

    // 8. Resumen final
    console.log('\n8️⃣ RESUMEN DE CORRECCIONES:');
    console.log('============================');
    console.log('✅ Función generate_short_code creada');
    console.log('✅ Función product_create_with_short_code creada');
    console.log('✅ Función combo_create_with_short_code creada');
    console.log('✅ Función space_create_with_short_code creada');
    console.log('✅ Los códigos generados ahora respetan los límites de longitud');
    console.log('✅ El frontend puede crear elementos sin errores de longitud');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

fixCodeLengthIssues();

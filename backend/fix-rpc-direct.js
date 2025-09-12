const { Client } = require('pg');

// Usar la conexión directa a PostgreSQL
const client = new Client({
  connectionString: 'postgresql://postgres.jfvkhoxhiudtxskylnrv:muchachos98356@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=disable'
});

async function fixRPCDirect() {
  console.log('🔧 Conectando directamente a PostgreSQL...\n');

  try {
    await client.connect();
    console.log('✅ Conexión exitosa a PostgreSQL');

    // 1. Verificar si existe la función RPC
    console.log('\n1️⃣ Verificando función RPC...');
    const checkFunctionQuery = `
      SELECT routine_name, routine_type 
      FROM information_schema.routines 
      WHERE routine_name = 'create_order_with_items' 
      AND routine_schema = 'public';
    `;
    
    const functionResult = await client.query(checkFunctionQuery);
    
    if (functionResult.rows.length === 0) {
      console.log('❌ Función RPC no existe, creándola...');
      
      // Crear la función RPC
      const createFunctionSQL = `
        CREATE OR REPLACE FUNCTION create_order_with_items(
          p_space_id uuid,
          p_created_by uuid,
          p_customer_name text default null,
          p_customer_phone text default null,
          p_total_amount numeric default 0,
          p_subtotal numeric default 0,
          p_tax numeric default 0,
          p_discount numeric default 0,
          p_notes text default null,
          p_items jsonb default '[]'::jsonb
        )
        RETURNS TABLE (id uuid, orderNumber text)
        LANGUAGE plpgsql
        SECURITY DEFINER
        SET search_path = public, pg_temp
        AS $$
        DECLARE
          v_order_id uuid;
          v_order_number text;
        BEGIN
          -- Insert order; trigger generates orderNumber if needed
          INSERT INTO "Order" (
            "spaceId", "customerName", "customerPhone", status,
            "totalAmount", subtotal, tax, discount, notes, "createdBy",
            "createdAt", "updatedAt"
          ) VALUES (
            p_space_id, p_customer_name, p_customer_phone, 'PENDIENTE',
            COALESCE(p_total_amount, 0), COALESCE(p_subtotal, 0), COALESCE(p_tax, 0), COALESCE(p_discount, 0), p_notes, p_created_by,
            NOW(), NOW()
          ) RETURNING id, "orderNumber" INTO v_order_id, v_order_number;

          -- Insert items
          IF p_items IS NOT NULL AND jsonb_array_length(p_items) > 0 THEN
            INSERT INTO "OrderItem" (
              "orderId", "productId", "comboId", name, "unitPrice", "totalPrice", quantity, status, notes, "createdAt"
            )
            SELECT
              v_order_id,
              CASE WHEN COALESCE(item->>'productId','') <> '' THEN (item->>'productId')::uuid ELSE NULL END,
              CASE WHEN COALESCE(item->>'comboId','') <> '' THEN (item->>'comboId')::uuid ELSE NULL END,
              item->>'name',
              COALESCE((item->>'unitPrice')::numeric, 0),
              COALESCE((item->>'totalPrice')::numeric, 0),
              COALESCE((item->>'quantity')::int, 1),
              'PENDIENTE',
              item->>'notes',
              NOW()
            FROM jsonb_array_elements(p_items) AS item;
          END IF;

          -- Mark space as occupied
          UPDATE "Space" SET status = 'OCUPADA', "updatedAt" = NOW() WHERE id = p_space_id;

          RETURN QUERY SELECT v_order_id, v_order_number;
        END;
        $$;
      `;
      
      await client.query(createFunctionSQL);
      console.log('✅ Función RPC creada exitosamente');
      
      // Otorgar permisos
      await client.query(`
        REVOKE ALL ON FUNCTION create_order_with_items(uuid, uuid, text, text, numeric, numeric, numeric, numeric, text, jsonb) FROM public;
        GRANT EXECUTE ON FUNCTION create_order_with_items(uuid, uuid, text, text, numeric, numeric, numeric, numeric, text, jsonb) TO anon, authenticated;
      `);
      console.log('✅ Permisos otorgados');
      
    } else {
      console.log('✅ Función RPC ya existe');
    }

    // 2. Verificar usuarios
    console.log('\n2️⃣ Verificando usuarios...');
    const usersResult = await client.query('SELECT * FROM "User" LIMIT 5');
    console.log(`✅ Usuarios encontrados: ${usersResult.rows.length}`);
    
    if (usersResult.rows.length === 0) {
      console.log('⚠️ No hay usuarios, creando usuario admin...');
      
      // Crear usuario admin
      await client.query(`
        INSERT INTO "User" (id, username, email, role, "isActive", "createdAt", "updatedAt")
        VALUES (
          gen_random_uuid(),
          'admin',
          'admin@sistema.com',
          'ADMIN',
          true,
          NOW(),
          NOW()
        )
        ON CONFLICT (username) DO NOTHING;
      `);
      console.log('✅ Usuario admin creado');
    } else {
      usersResult.rows.forEach(user => {
        console.log(`   - ${user.username} (${user.role})`);
      });
    }

    // 3. Verificar espacios
    console.log('\n3️⃣ Verificando espacios...');
    const spacesResult = await client.query('SELECT * FROM "Space" LIMIT 5');
    console.log(`✅ Espacios encontrados: ${spacesResult.rows.length}`);
    
    if (spacesResult.rows.length === 0) {
      console.log('⚠️ No hay espacios, creando espacio de prueba...');
      
      // Crear espacio de prueba
      await client.query(`
        INSERT INTO "Space" (id, name, status, "createdAt", "updatedAt")
        VALUES (
          gen_random_uuid(),
          'Mesa 1',
          'DISPONIBLE',
          NOW(),
          NOW()
        )
        ON CONFLICT DO NOTHING;
      `);
      console.log('✅ Espacio de prueba creado');
    } else {
      spacesResult.rows.forEach(space => {
        console.log(`   - ${space.name} (${space.status})`);
      });
    }

    // 4. Probar la función RPC
    console.log('\n4️⃣ Probando función RPC...');
    try {
      const testResult = await client.query(`
        SELECT * FROM create_order_with_items(
          (SELECT id FROM "Space" LIMIT 1),
          (SELECT id FROM "User" LIMIT 1),
          'Cliente de Prueba',
          '123456789',
          25.99,
          25.99,
          0,
          0,
          'Orden de prueba RPC',
          '[{"productId": null, "comboId": null, "name": "Producto de Prueba", "unitPrice": 12.99, "totalPrice": 12.99, "quantity": 1, "notes": "Item de prueba"}]'::jsonb
        );
      `);
      
      console.log('✅ Función RPC funciona correctamente');
      console.log('   Orden creada:', testResult.rows[0]);
      
    } catch (testError) {
      console.log('❌ Error probando función RPC:', testError.message);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
    console.log('\n🔚 Conexión cerrada');
  }
}

fixRPCDirect();

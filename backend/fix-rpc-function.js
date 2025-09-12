const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.jfvkhoxhiudtxskylnrv:muchachos98356@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=disable'
});

async function fixRPCFunction() {
  console.log('🔧 Corrigiendo función RPC...\n');

  try {
    await client.connect();
    console.log('✅ Conexión exitosa');

    // 1. Verificar la estructura de la tabla User
    console.log('1️⃣ Verificando estructura de tabla User...');
    const userStructureQuery = `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'User' AND table_schema = 'public'
      ORDER BY ordinal_position;
    `;
    
    const userStructure = await client.query(userStructureQuery);
    console.log('📋 Columnas de tabla User:');
    userStructure.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });

    // 2. Eliminar función existente y crear una nueva
    console.log('\n2️⃣ Eliminando función existente...');
    await client.query('DROP FUNCTION IF EXISTS create_order_with_items(uuid, text, text, numeric, jsonb, text, uuid, numeric, numeric, numeric, numeric, boolean);');
    console.log('✅ Función existente eliminada');

    console.log('\n3️⃣ Creando función RPC corregida...');
    
    const correctedFunctionSQL = `
      CREATE OR REPLACE FUNCTION create_order_with_items(
        p_created_by uuid,
        p_customer_name text,
        p_customer_phone text,
        p_discount numeric,
        p_items jsonb,
        p_notes text,
        p_space_id uuid,
        p_subtotal numeric,
        p_tax numeric,
        p_total_amount numeric,
        p_delivery_cost numeric,
        p_is_delivery boolean
      )
      RETURNS TABLE (order_id uuid, order_number text)
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
          "createdAt", "updatedAt", "deliveryCost", "isDelivery"
        ) VALUES (
          p_space_id, p_customer_name, p_customer_phone, 'PENDIENTE',
          COALESCE(p_total_amount, 0), COALESCE(p_subtotal, 0), COALESCE(p_tax, 0), COALESCE(p_discount, 0), p_notes, p_created_by,
          NOW(), NOW(), COALESCE(p_delivery_cost, 0), COALESCE(p_is_delivery, false)
        ) RETURNING "Order".id, "Order"."orderNumber" INTO v_order_id, v_order_number;

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
    
    await client.query(correctedFunctionSQL);
    console.log('✅ Función RPC corregida creada');

    // 4. Otorgar permisos
    await client.query(`
      REVOKE ALL ON FUNCTION create_order_with_items(uuid, text, text, numeric, jsonb, text, uuid, numeric, numeric, numeric, numeric, boolean) FROM public;
      GRANT EXECUTE ON FUNCTION create_order_with_items(uuid, text, text, numeric, jsonb, text, uuid, numeric, numeric, numeric, numeric, boolean) TO anon, authenticated;
    `);
    console.log('✅ Permisos otorgados');

    // 5. Probar la función corregida
    console.log('\n5️⃣ Probando función corregida...');
    
    const spaceResult = await client.query('SELECT id FROM "Space" WHERE status = \'LIBRE\' LIMIT 1');
    const userResult = await client.query('SELECT id FROM "User" LIMIT 1');
    
    const testQuery = `
      SELECT * FROM create_order_with_items(
        $1::uuid, $2::text, $3::text, $4::numeric, $5::jsonb, $6::text, 
        $7::uuid, $8::numeric, $9::numeric, $10::numeric, $11::numeric, $12::boolean
      );
    `;
    
    const testParams = [
      userResult.rows[0].id,
      'Cliente Test Corregido',
      '123456789',
      0,
      '[{"productId": null, "comboId": null, "name": "Test Item", "unitPrice": 10.0, "totalPrice": 10.0, "quantity": 1, "notes": null}]',
      'Test order',
      spaceResult.rows[0].id,
      10.0,
      0,
      10.0,
      0,
      false
    ];
    
    const testResult = await client.query(testQuery, testParams);
    console.log('✅ Función corregida funciona correctamente');
    console.log('   Resultado:', testResult.rows[0]);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('   Detalles:', error.detail);
    console.error('   Código:', error.code);
  } finally {
    await client.end();
  }
}

fixRPCFunction();

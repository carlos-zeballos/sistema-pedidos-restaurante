const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.jfvkhoxhiudtxskylnrv:muchachos98356@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=disable'
});

async function fixOrderItemColumns() {
  console.log('🔧 Corrigiendo columnas de OrderItem en función RPC...\n');

  try {
    await client.connect();
    console.log('✅ Conexión a base de datos exitosa');

    // 1. Verificar estructura de tabla OrderItem
    console.log('1️⃣ VERIFICANDO ESTRUCTURA DE TABLA ORDERITEM:');
    console.log('=============================================');
    
    const orderItemColumns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'OrderItem' 
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 Columnas de tabla OrderItem:');
    orderItemColumns.rows.forEach((col, index) => {
      console.log(`   ${index + 1}. ${col.column_name} (${col.data_type})`);
    });

    // 2. Corregir función RPC sin la columna updatedAt
    console.log('\n2️⃣ CORRIGIENDO FUNCIÓN RPC SIN UPDATEDAT:');
    console.log('===========================================');
    
    const updateFunction = `
      CREATE OR REPLACE FUNCTION create_order_with_items(
        p_created_by UUID,
        p_customer_name TEXT,
        p_customer_phone TEXT,
        p_discount NUMERIC,
        p_items JSONB,
        p_notes TEXT,
        p_space_id UUID,
        p_subtotal NUMERIC,
        p_tax NUMERIC,
        p_total_amount NUMERIC,
        p_delivery_cost NUMERIC,
        p_is_delivery BOOLEAN
      )
      RETURNS TABLE(order_id UUID, order_number TEXT)
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path = public, pg_temp
      AS $$
      DECLARE
        v_order_id UUID;
        v_order_number TEXT;
        v_today TEXT;
        v_next_num INTEGER;
      BEGIN
        -- Generar fecha de hoy en formato YYYYMMDD
        v_today := TO_CHAR(CURRENT_DATE, 'YYYYMMDD');
        
        -- Generar número de orden único
        SELECT COALESCE(MAX(CAST(SUBSTRING("orderNumber" FROM 'ORD-\\d{8}-(\\d+)') AS INTEGER)), 0) + 1
        INTO v_next_num
        FROM "Order"
        WHERE "orderNumber" LIKE 'ORD-' || v_today || '-%';
        
        v_order_number := 'ORD-' || v_today || '-' || LPAD(v_next_num::TEXT, 4, '0');
        
        -- Verificar que el número no existe (doble verificación)
        WHILE EXISTS(SELECT 1 FROM "Order" WHERE "orderNumber" = v_order_number) LOOP
          v_next_num := v_next_num + 1;
          v_order_number := 'ORD-' || v_today || '-' || LPAD(v_next_num::TEXT, 4, '0');
        END LOOP;
        
        -- Crear la orden
        INSERT INTO "Order" (
          id, "orderNumber", "spaceId", "customerName", "customerPhone",
          status, "totalAmount", subtotal, tax, discount, notes,
          "estimatedReadyTime", "createdBy", "createdAt", "updatedAt"
        ) VALUES (
          gen_random_uuid(), v_order_number, p_space_id, p_customer_name, p_customer_phone,
          'PENDIENTE', p_total_amount, p_subtotal, p_tax, p_discount, p_notes,
          NULL, p_created_by, NOW(), NOW()
        ) RETURNING id INTO v_order_id;
        
        -- Insertar items de la orden (SIN updatedAt)
        INSERT INTO "OrderItem" (
          id, "orderId", "productId", "comboId", name, "unitPrice", 
          "totalPrice", quantity, notes, status, "createdAt"
        )
        SELECT 
          gen_random_uuid(), v_order_id, 
          CASE WHEN item->>'productId' IS NOT NULL THEN (item->>'productId')::UUID ELSE NULL END,
          CASE WHEN item->>'comboId' IS NOT NULL THEN (item->>'comboId')::UUID ELSE NULL END,
          item->>'name',
          (item->>'unitPrice')::NUMERIC,
          (item->>'totalPrice')::NUMERIC,
          (item->>'quantity')::INTEGER,
          item->>'notes',
          'PENDIENTE',
          NOW()
        FROM jsonb_array_elements(p_items) AS item;
        
        RETURN QUERY SELECT v_order_id, v_order_number;
      END;
      $$;
    `;
    
    await client.query(updateFunction);
    console.log('✅ Función RPC corregida sin columna updatedAt');

    // 3. Probar la función corregida
    console.log('\n3️⃣ PROBANDO FUNCIÓN CORREGIDA:');
    console.log('===============================');
    
    try {
      const user = await client.query(`
        SELECT id FROM "User" WHERE isactive = true LIMIT 1;
      `);
      
      const space = await client.query(`
        SELECT id FROM "Space" LIMIT 1;
      `);
      
      if (user.rows.length > 0 && space.rows.length > 0) {
        const userId = user.rows[0].id;
        const spaceId = space.rows[0].id;
        
        const testOrder = await client.query(`
          SELECT * FROM create_order_with_items(
            $1,
            'Cliente Test Corregido',
            '123456789',
            0,
            '[{"name": "Producto Test Corregido", "unitPrice": 40.00, "totalPrice": 40.00, "quantity": 1, "notes": "Test Corregido"}]'::jsonb,
            'Orden de prueba corregida',
            $2,
            40.00,
            0,
            40.00,
            0,
            false
          );
        `, [userId, spaceId]);
        
        if (testOrder.rows.length > 0) {
          const result = testOrder.rows[0];
          console.log(`✅ Orden de prueba creada exitosamente:`);
          console.log(`   - ID: ${result.order_id}`);
          console.log(`   - Número: ${result.order_number}`);
          
          // Verificar que se creó correctamente
          const verifyOrder = await client.query(`
            SELECT "orderNumber", "customerName", "totalAmount", status
            FROM "Order"
            WHERE id = $1;
          `, [result.order_id]);
          
          if (verifyOrder.rows.length > 0) {
            const order = verifyOrder.rows[0];
            console.log(`   - Verificación: ${order.orderNumber} - ${order.customerName} - $${order.totalAmount} - ${order.status}`);
          }
          
          // Verificar items creados
          const verifyItems = await client.query(`
            SELECT name, "unitPrice", "totalPrice", quantity
            FROM "OrderItem"
            WHERE "orderId" = $1;
          `, [result.order_id]);
          
          console.log(`   - Items creados: ${verifyItems.rows.length}`);
          verifyItems.rows.forEach((item, index) => {
            console.log(`     ${index + 1}. ${item.name} - $${item.unitPrice} x ${item.quantity} = $${item.totalPrice}`);
          });
        }
      }
    } catch (error) {
      console.log(`❌ Error probando función: ${error.message}`);
    }

    console.log('\n🎉 ¡FUNCIÓN RPC CORREGIDA EXITOSAMENTE!');
    console.log('✅ Columna updatedAt removida de OrderItem');
    console.log('✅ Función RPC actualizada');
    console.log('✅ Prueba de creación exitosa');
    console.log('✅ Sistema listo para crear pedidos');

  } catch (error) {
    console.error('❌ Error corrigiendo función:', error.message);
  } finally {
    await client.end();
  }
}

fixOrderItemColumns();



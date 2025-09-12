const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.jfvkhoxhiudtxskylnrv:muchachos98356@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=disable'
});

async function testCorrectedRPC() {
  console.log('🧪 Probando función RPC con orden correcto de parámetros...\n');

  try {
    await client.connect();
    console.log('✅ Conexión exitosa');

    // 1. Obtener un espacio disponible
    console.log('1️⃣ Obteniendo espacio disponible...');
    const spaceResult = await client.query('SELECT id, name FROM "Space" WHERE status = \'LIBRE\' LIMIT 1');
    
    if (spaceResult.rows.length === 0) {
      console.log('❌ No hay espacios libres');
      return;
    }
    
    const space = spaceResult.rows[0];
    console.log(`✅ Usando espacio: ${space.name} (${space.id})`);

    // 2. Obtener un usuario
    console.log('\n2️⃣ Obteniendo usuario...');
    const userResult = await client.query('SELECT id, username FROM "User" LIMIT 1');
    const user = userResult.rows[0];
    console.log(`✅ Usando usuario: ${user.username} (${user.id})`);

    // 3. Probar la función RPC con el orden correcto
    console.log('\n3️⃣ Probando función RPC con orden correcto...');
    
    const testItems = [
      {
        productId: null,
        comboId: null,
        name: 'Producto de Prueba Corregido',
        unitPrice: 12.99,
        totalPrice: 12.99,
        quantity: 1,
        notes: 'Item de prueba corregido'
      }
    ];

    // Orden correcto según la firma de la función:
    // 1. p_created_by, 2. p_customer_name, 3. p_customer_phone, 4. p_discount, 
    // 5. p_items, 6. p_notes, 7. p_space_id, 8. p_subtotal, 9. p_tax, 10. p_total_amount,
    // 11. p_delivery_cost, 12. p_is_delivery
    const rpcQuery = `
      SELECT * FROM create_order_with_items(
        $1::uuid,  -- p_created_by
        $2::text,  -- p_customer_name
        $3::text,  -- p_customer_phone
        $4::numeric, -- p_discount
        $5::jsonb, -- p_items
        $6::text,  -- p_notes
        $7::uuid,  -- p_space_id
        $8::numeric, -- p_subtotal
        $9::numeric, -- p_tax
        $10::numeric, -- p_total_amount
        $11::numeric, -- p_delivery_cost
        $12::boolean  -- p_is_delivery
      );
    `;

    const rpcParams = [
      user.id,                     // 1. p_created_by
      'Cliente Prueba Corregido',  // 2. p_customer_name
      '123456789',                 // 3. p_customer_phone
      0,                           // 4. p_discount
      JSON.stringify(testItems),    // 5. p_items
      'Orden de prueba corregida', // 6. p_notes
      space.id,                    // 7. p_space_id
      12.99,                       // 8. p_subtotal
      0,                           // 9. p_tax
      12.99,                       // 10. p_total_amount
      0,                           // 11. p_delivery_cost
      false                        // 12. p_is_delivery
    ];

    console.log('📤 Parámetros RPC en orden correcto:');
    rpcParams.forEach((param, index) => {
      console.log(`   ${index + 1}: ${typeof param} = ${param}`);
    });

    const rpcResult = await client.query(rpcQuery, rpcParams);
    
    console.log('✅ Función RPC ejecutada exitosamente');
    console.log('   Resultado:', rpcResult.rows[0]);

    // 4. Verificar que la orden se creó correctamente
    console.log('\n4️⃣ Verificando orden creada...');
    const orderResult = await client.query(`
      SELECT o.*, COUNT(oi.id) as item_count
      FROM "Order" o
      LEFT JOIN "OrderItem" oi ON o.id = oi."orderId"
      WHERE o.id = $1
      GROUP BY o.id
    `, [rpcResult.rows[0].id]);

    if (orderResult.rows.length > 0) {
      const order = orderResult.rows[0];
      console.log('✅ Orden verificada:');
      console.log(`   ID: ${order.id}`);
      console.log(`   Número: ${order.orderNumber}`);
      console.log(`   Estado: ${order.status}`);
      console.log(`   Total: ${order.totalAmount}`);
      console.log(`   Items: ${order.item_count}`);
      console.log(`   Es delivery: ${order.isDelivery}`);
      console.log(`   Costo delivery: ${order.deliveryCost}`);
    }

    // 5. Probar con orden de delivery
    console.log('\n5️⃣ Probando orden de delivery...');
    const deliveryItems = [
      {
        productId: null,
        comboId: null,
        name: 'Sushi Roll Delivery',
        unitPrice: 15.99,
        totalPrice: 15.99,
        quantity: 1,
        notes: 'Para delivery'
      }
    ];

    const deliveryParams = [
      user.id,                     // 1. p_created_by
      'Cliente Delivery',          // 2. p_customer_name
      '987654321',                 // 3. p_customer_phone
      0,                           // 4. p_discount
      JSON.stringify(deliveryItems), // 5. p_items
      'Orden de delivery',         // 6. p_notes
      space.id,                    // 7. p_space_id
      15.99,                       // 8. p_subtotal
      0,                           // 9. p_tax
      20.99,                       // 10. p_total_amount (incluye delivery)
      5.00,                        // 11. p_delivery_cost
      true                         // 12. p_is_delivery
    ];

    const deliveryResult = await client.query(rpcQuery, deliveryParams);
    console.log('✅ Orden de delivery creada exitosamente');
    console.log('   Resultado:', deliveryResult.rows[0]);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('   Detalles:', error.detail);
    console.error('   Código:', error.code);
  } finally {
    await client.end();
  }
}

testCorrectedRPC();
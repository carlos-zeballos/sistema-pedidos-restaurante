const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.jfvkhoxhiudtxskylnrv:muchachos98356@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=disable'
});

async function testRPCDirectly() {
  console.log('🧪 Probando función RPC directamente en la base de datos...\n');

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

    // 3. Probar la función RPC directamente
    console.log('\n3️⃣ Probando función RPC directamente...');
    
    const testItems = [
      {
        productId: null,
        comboId: null,
        name: 'Producto de Prueba Directa',
        unitPrice: 12.99,
        totalPrice: 12.99,
        quantity: 1,
        notes: 'Item de prueba directa'
      }
    ];

    const rpcQuery = `
      SELECT * FROM create_order_with_items(
        $1::uuid,  -- p_space_id
        $2::uuid,  -- p_created_by
        $3::text,  -- p_customer_name
        $4::text,  -- p_customer_phone
        $5::numeric, -- p_total_amount
        $6::numeric, -- p_subtotal
        $7::numeric, -- p_tax
        $8::numeric, -- p_discount
        $9::text,  -- p_notes
        $10::jsonb, -- p_items
        $11::numeric, -- p_delivery_cost
        $12::boolean  -- p_is_delivery
      );
    `;

    const rpcParams = [
      space.id,                    // p_space_id
      user.id,                     // p_created_by
      'Cliente Prueba Directa',    // p_customer_name
      '123456789',                 // p_customer_phone
      12.99,                       // p_total_amount
      12.99,                       // p_subtotal
      0,                           // p_tax
      0,                           // p_discount
      'Orden de prueba directa',   // p_notes
      JSON.stringify(testItems),   // p_items
      0,                           // p_delivery_cost
      false                        // p_is_delivery
    ];

    console.log('📤 Parámetros RPC:');
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

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('   Detalles:', error.detail);
    console.error('   Código:', error.code);
  } finally {
    await client.end();
  }
}

testRPCDirectly();



const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.jfvkhoxhiudtxskylnrv:muchachos98356@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=disable'
});

async function fixOrdersDataIssues() {
  console.log('🔧 Corrigiendo problemas en los datos de órdenes...\n');

  try {
    await client.connect();
    console.log('✅ Conexión exitosa');

    // 1. Corregir órdenes sin items (eliminar órdenes huérfanas)
    console.log('1️⃣ CORRIGIENDO ÓRDENES SIN ITEMS:');
    console.log('==================================');
    
    const ordersWithoutItemsQuery = `
      SELECT 
        o.id,
        o."orderNumber",
        o."createdAt",
        o."customerName",
        o."totalAmount",
        o.status,
        s.name as space_name
      FROM "Order" o
      LEFT JOIN "OrderItem" oi ON o.id = oi."orderId"
      JOIN "Space" s ON o."spaceId" = s.id
      WHERE oi.id IS NULL
      ORDER BY o."createdAt" DESC;
    `;
    
    const ordersWithoutItems = await client.query(ordersWithoutItemsQuery);
    
    if (ordersWithoutItems.rows.length > 0) {
      console.log(`❌ Se encontraron ${ordersWithoutItems.rows.length} órdenes sin items:`);
      
      for (const order of ordersWithoutItems.rows) {
        console.log(`   - ${order.orderNumber}: ${order.customerName || 'Sin cliente'} ($${order.totalAmount}) - ${order.status} - ${order.space_name}`);
        
        // Eliminar órdenes sin items que no tienen pagos
        const hasPayments = await client.query(
          'SELECT COUNT(*) as count FROM "OrderPayment" WHERE "orderId" = $1',
          [order.id]
        );
        
        if (parseInt(hasPayments.rows[0].count) === 0) {
          console.log(`     🗑️ Eliminando orden sin items ni pagos: ${order.orderNumber}`);
          
          // Eliminar la orden
          await client.query('DELETE FROM "Order" WHERE id = $1', [order.id]);
          console.log(`     ✅ Orden ${order.orderNumber} eliminada`);
        } else {
          console.log(`     ⚠️ Orden ${order.orderNumber} tiene pagos pero no items - requiere revisión manual`);
        }
      }
    } else {
      console.log('✅ No hay órdenes sin items');
    }

    // 2. Corregir órdenes marcadas como pagadas pero sin pagos
    console.log('\n2️⃣ CORRIGIENDO ÓRDENES SIN PAGOS:');
    console.log('===================================');
    
    const ordersWithoutPaymentsQuery = `
      SELECT 
        o.id,
        o."orderNumber",
        o."createdAt",
        o."customerName",
        o."totalAmount",
        o.status,
        s.name as space_name
      FROM "Order" o
      LEFT JOIN "OrderPayment" op ON o.id = op."orderId"
      JOIN "Space" s ON o."spaceId" = s.id
      WHERE op.id IS NULL
      AND o.status IN ('PAGADO', 'ENTREGADO')
      ORDER BY o."createdAt" DESC;
    `;
    
    const ordersWithoutPayments = await client.query(ordersWithoutPaymentsQuery);
    
    if (ordersWithoutPayments.rows.length > 0) {
      console.log(`❌ Se encontraron ${ordersWithoutPayments.rows.length} órdenes marcadas como pagadas pero sin pagos:`);
      
      for (const order of ordersWithoutPayments.rows) {
        console.log(`   - ${order.orderNumber}: ${order.customerName || 'Sin cliente'} ($${order.totalAmount}) - ${order.status} - ${order.space_name}`);
        
        // Cambiar status a PENDIENTE si no tiene pagos
        console.log(`     🔄 Cambiando status de ${order.status} a PENDIENTE`);
        await client.query(
          'UPDATE "Order" SET status = $1 WHERE id = $2',
          ['PENDIENTE', order.id]
        );
        console.log(`     ✅ Status de ${order.orderNumber} cambiado a PENDIENTE`);
      }
    } else {
      console.log('✅ No hay órdenes sin pagos');
    }

    // 3. Corregir órdenes con total $0
    console.log('\n3️⃣ CORRIGIENDO ÓRDENES CON TOTAL $0:');
    console.log('=====================================');
    
    const zeroTotalOrdersQuery = `
      SELECT 
        o.id,
        o."orderNumber",
        o."createdAt",
        o."customerName",
        o."totalAmount",
        o.status,
        s.name as space_name,
        COUNT(oi.id) as item_count
      FROM "Order" o
      JOIN "Space" s ON o."spaceId" = s.id
      LEFT JOIN "OrderItem" oi ON o.id = oi."orderId"
      WHERE o."totalAmount" = 0
      GROUP BY o.id, o."orderNumber", o."createdAt", o."customerName", o."totalAmount", o.status, s.name
      ORDER BY o."createdAt" DESC;
    `;
    
    const zeroTotalOrders = await client.query(zeroTotalOrdersQuery);
    
    if (zeroTotalOrders.rows.length > 0) {
      console.log(`⚠️ Se encontraron ${zeroTotalOrders.rows.length} órdenes con total $0:`);
      
      for (const order of zeroTotalOrders.rows) {
        console.log(`   - ${order.orderNumber}: ${order.customerName || 'Sin cliente'} - ${order.status} - ${order.space_name} - Items: ${order.item_count}`);
        
        if (parseInt(order.item_count) === 0) {
          console.log(`     🗑️ Eliminando orden sin items y con total $0: ${order.orderNumber}`);
          await client.query('DELETE FROM "Order" WHERE id = $1', [order.id]);
          console.log(`     ✅ Orden ${order.orderNumber} eliminada`);
        } else {
          console.log(`     ⚠️ Orden ${order.orderNumber} tiene items pero total $0 - requiere revisión manual`);
        }
      }
    } else {
      console.log('✅ No hay órdenes con total $0');
    }

    // 4. Verificar y corregir inconsistencias en totales
    console.log('\n4️⃣ VERIFICANDO INCONSISTENCIAS EN TOTALES:');
    console.log('===========================================');
    
    const totalInconsistenciesQuery = `
      SELECT 
        o.id,
        o."orderNumber",
        o."totalAmount" as order_total,
        COALESCE(SUM(op.amount), 0) as paid_total,
        o."totalAmount" - COALESCE(SUM(op.amount), 0) as difference,
        o.status,
        s.name as space_name
      FROM "Order" o
      LEFT JOIN "OrderPayment" op ON o.id = op."orderId"
      JOIN "Space" s ON o."spaceId" = s.id
      WHERE o.status IN ('PAGADO', 'ENTREGADO')
      GROUP BY o.id, o."orderNumber", o."totalAmount", o.status, s.name
      HAVING ABS(o."totalAmount" - COALESCE(SUM(op.amount), 0)) > 0.01
      ORDER BY ABS(o."totalAmount" - COALESCE(SUM(op.amount), 0)) DESC;
    `;
    
    const totalInconsistencies = await client.query(totalInconsistenciesQuery);
    
    if (totalInconsistencies.rows.length > 0) {
      console.log(`❌ Se encontraron ${totalInconsistencies.rows.length} órdenes con inconsistencias en totales:`);
      
      for (const order of totalInconsistencies.rows) {
        console.log(`   - ${order.orderNumber}: Total orden $${order.order_total}, Total pagado $${order.paid_total}, Diferencia $${order.difference}`);
        
        // Si la diferencia es pequeña (menos de $1), ajustar el total de la orden
        if (Math.abs(order.difference) < 1.00) {
          console.log(`     🔄 Ajustando total de orden a $${order.paid_total}`);
          await client.query(
            'UPDATE "Order" SET "totalAmount" = $1 WHERE id = $2',
            [order.paid_total, order.id]
          );
          console.log(`     ✅ Total de ${order.orderNumber} ajustado`);
        } else {
          console.log(`     ⚠️ Diferencia grande en ${order.orderNumber} - requiere revisión manual`);
        }
      }
    } else {
      console.log('✅ No hay inconsistencias en totales');
    }

    // 5. Verificar órdenes duplicadas
    console.log('\n5️⃣ VERIFICANDO ÓRDENES DUPLICADAS:');
    console.log('===================================');
    
    const duplicateOrdersQuery = `
      SELECT 
        "orderNumber",
        COUNT(*) as count,
        array_agg(id) as order_ids,
        array_agg("createdAt") as created_dates
      FROM "Order"
      GROUP BY "orderNumber"
      HAVING COUNT(*) > 1
      ORDER BY count DESC;
    `;
    
    const duplicateOrders = await client.query(duplicateOrdersQuery);
    
    if (duplicateOrders.rows.length > 0) {
      console.log(`❌ Se encontraron ${duplicateOrders.rows.length} números de orden duplicados:`);
      
      for (const dup of duplicateOrders.rows) {
        console.log(`   - ${dup.orderNumber}: ${dup.count} órdenes (IDs: ${dup.order_ids.join(', ')})`);
        
        // Mantener solo la orden más reciente
        const orderIds = dup.order_ids;
        const keepOrderId = orderIds[0]; // La primera (más reciente por ORDER BY)
        const deleteOrderIds = orderIds.slice(1);
        
        console.log(`     🗑️ Eliminando órdenes duplicadas, manteniendo ${keepOrderId}`);
        
        for (const deleteId of deleteOrderIds) {
          await client.query('DELETE FROM "Order" WHERE id = $1', [deleteId]);
          console.log(`     ✅ Orden duplicada ${deleteId} eliminada`);
        }
      }
    } else {
      console.log('✅ No hay órdenes duplicadas');
    }

    // 6. Resumen final
    console.log('\n6️⃣ RESUMEN DE CORRECCIONES:');
    console.log('============================');
    
    const totalOrders = await client.query('SELECT COUNT(*) as count FROM "Order"');
    const totalItems = await client.query('SELECT COUNT(*) as count FROM "OrderItem"');
    const totalPayments = await client.query('SELECT COUNT(*) as count FROM "OrderPayment"');
    
    console.log(`\n📊 ESTADÍSTICAS DESPUÉS DE CORRECCIONES:`);
    console.log(`   📦 Total órdenes: ${totalOrders.rows[0].count}`);
    console.log(`   🛒 Total items: ${totalItems.rows[0].count}`);
    console.log(`   💳 Total pagos: ${totalPayments.rows[0].count}`);
    
    console.log(`\n🎉 ¡Correcciones completadas! Los datos ahora están más limpios y consistentes.`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

fixOrdersDataIssues();



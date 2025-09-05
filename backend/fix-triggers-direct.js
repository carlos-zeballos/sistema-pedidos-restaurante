const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Variables de entorno de Supabase no configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixTriggers() {
  console.log('🔧 Corrigiendo triggers problemáticos...\n');

  try {
    // 1. Deshabilitar todos los triggers en la tabla Order
    console.log('1️⃣ Deshabilitando triggers...');
    const { error: disableError } = await supabase
      .rpc('exec_sql', { 
        sql: 'ALTER TABLE "Order" DISABLE TRIGGER ALL;' 
      });

    if (disableError) {
      console.log('⚠️ No se pudieron deshabilitar triggers:', disableError);
    } else {
      console.log('✅ Triggers deshabilitados');
    }

    // 2. Probar inserción sin triggers
    console.log('\n2️⃣ Probando inserción sin triggers...');
    
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 999).toString().padStart(3, '0');
    const orderNumber = `ORD${timestamp}${random}`;
    
    const orderData = {
      ordernumber: orderNumber,
      spaceid: '94cc46a7-4c65-4a35-bb37-d3a1fa9e1c35',
      customername: 'Cliente Test',
      customerphone: '123456789',
      status: 'PENDIENTE',
      totalamount: 10.00,
      subtotal: 10.00,
      tax: 0,
      discount: 0,
      notes: 'Test sin triggers',
      createdby: '42d2ac16-2811-4e01-9e76-f8ab02d1aea2'
    };

    console.log('📤 Datos a insertar:', JSON.stringify(orderData, null, 2));

    const { data: order, error: orderError } = await supabase
      .from('Order')
      .insert([orderData])
      .select()
      .single();

    if (orderError) {
      console.error('❌ Error al crear orden:', orderError);
      
      // Intentar con SQL directo
      console.log('\n3️⃣ Intentando con SQL directo...');
      const insertSQL = `
        INSERT INTO "Order" (
          ordernumber, spaceid, customername, customerphone, 
          status, totalamount, subtotal, tax, discount, notes, createdby
        ) VALUES (
          '${orderNumber}', '${orderData.spaceid}', '${orderData.customername}', 
          '${orderData.customerphone}', '${orderData.status}', ${orderData.totalamount}, 
          ${orderData.subtotal}, ${orderData.tax}, ${orderData.discount}, 
          '${orderData.notes}', '${orderData.createdby}'
        ) RETURNING *;
      `;
      
      const { data: sqlResult, error: sqlError } = await supabase
        .rpc('exec_sql', { sql: insertSQL });

      if (sqlError) {
        console.error('❌ Error con SQL directo:', sqlError);
      } else {
        console.log('✅ Orden creada con SQL directo:', sqlResult);
      }
      
    } else {
      console.log('✅ Orden creada exitosamente:', order.id);
      
      // Limpiar la orden de prueba
      await supabase
        .from('Order')
        .delete()
        .eq('id', order.id);
      
      console.log('🧹 Orden de prueba eliminada');
    }

    // 4. Habilitar triggers nuevamente (comentado por seguridad)
    console.log('\n4️⃣ Habilitando triggers nuevamente...');
    const { error: enableError } = await supabase
      .rpc('exec_sql', { 
        sql: 'ALTER TABLE "Order" ENABLE TRIGGER ALL;' 
      });

    if (enableError) {
      console.log('⚠️ No se pudieron habilitar triggers:', enableError);
    } else {
      console.log('✅ Triggers habilitados nuevamente');
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

fixTriggers();

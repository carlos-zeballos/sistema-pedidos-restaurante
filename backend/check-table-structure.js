require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTableStructure() {
  console.log('🔍 Verificando estructura de la tabla OrderItem...\n');

  try {
    // Intentar insertar un item de prueba para ver qué columnas faltan
    console.log('1️⃣ Intentando insertar un item de prueba...');
    
    const testItem = {
      orderid: '000f45b7-087b-4a81-b2ac-98ba6c843953', // ID de la orden más reciente
      productid: 'test-product-id',
      comboid: null,
      name: 'Item de Prueba',
      unitprice: 10.00,
      totalprice: 10.00,
      quantity: 1,
      status: 'PENDIENTE',
      notes: 'Prueba de estructura',
      createdat: new Date().toISOString()
    };

    console.log('   📝 Datos de prueba:', testItem);

    const { data, error } = await supabase
      .from('OrderItem')
      .insert([testItem])
      .select();

    if (error) {
      console.log('   ❌ Error al insertar:', error.message);
      console.log('   📋 Detalles del error:', error);
      
      // Si el error es sobre columnas, intentar con nombres diferentes
      if (error.message.includes('column') && error.message.includes('does not exist')) {
        console.log('\n2️⃣ Probando con nombres de columna alternativos...');
        
        // Probar con camelCase
        const testItemCamel = {
          orderId: '000f45b7-087b-4a81-b2ac-98ba6c843953',
          productId: 'test-product-id',
          comboId: null,
          name: 'Item de Prueba CamelCase',
          unitPrice: 10.00,
          totalPrice: 10.00,
          quantity: 1,
          status: 'PENDIENTE',
          notes: 'Prueba camelCase',
          createdAt: new Date().toISOString()
        };

        const { data: data2, error: error2 } = await supabase
          .from('OrderItem')
          .insert([testItemCamel])
          .select();

        if (error2) {
          console.log('   ❌ Error con camelCase:', error2.message);
        } else {
          console.log('   ✅ Éxito con camelCase:', data2);
        }
      }
    } else {
      console.log('   ✅ Item insertado exitosamente:', data);
    }

    // Verificar qué columnas existen consultando un item existente
    console.log('\n3️⃣ Verificando estructura consultando items existentes...');
    const { data: existingItems, error: queryError } = await supabase
      .from('OrderItem')
      .select('*')
      .limit(1);

    if (queryError) {
      console.log('   ❌ Error al consultar:', queryError.message);
    } else if (existingItems && existingItems.length > 0) {
      console.log('   ✅ Estructura encontrada:');
      const item = existingItems[0];
      Object.keys(item).forEach(key => {
        console.log(`      - ${key}: ${typeof item[key]} = ${item[key]}`);
      });
    } else {
      console.log('   ⚠️  No hay items en la tabla');
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

checkTableStructure();









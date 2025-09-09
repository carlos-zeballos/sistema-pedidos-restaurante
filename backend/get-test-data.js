require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function getTestData() {
  console.log('🔍 Obteniendo datos de prueba de la base de datos...');
  
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    // Obtener un espacio activo
    const { data: spaces, error: spacesError } = await supabase
      .from('Space')
      .select('id, name, status')
      .eq('isActive', true)
      .limit(1);

    if (spacesError) throw spacesError;
    
    // Obtener un usuario activo
    const { data: users, error: usersError } = await supabase
      .from('User')
      .select('id, username, isactive')
      .eq('isactive', true)
      .limit(1);

    if (usersError) throw usersError;
    
    // Obtener un producto activo
    const { data: products, error: productsError } = await supabase
      .from('Product')
      .select('id, name, price, "isEnabled", "isAvailable"')
      .eq('isEnabled', true)
      .eq('isAvailable', true)
      .limit(1);

    if (productsError) throw productsError;

    console.log('📋 Datos obtenidos:');
    console.log('  - Espacio:', spaces[0]);
    console.log('  - Usuario:', users[0]);
    console.log('  - Producto:', products[0]);

    // Crear objeto de prueba
    const testData = {
      spaceId: spaces[0]?.id,
      createdBy: users[0]?.id,
      productId: products[0]?.id,
      orderData: {
        spaceId: spaces[0]?.id,
        createdBy: users[0]?.id,
        customerName: 'Cliente de Prueba',
        customerPhone: '123456789',
        notes: 'Orden de prueba desde backend',
        items: [
          {
            productId: products[0]?.id,
            name: products[0]?.name || 'Producto de Prueba',
            unitPrice: products[0]?.price || 25.90,
            totalPrice: (products[0]?.price || 25.90) * 1,
            quantity: 1,
            notes: 'Item de prueba'
          }
        ]
      }
    };

    console.log('🎯 Datos de prueba para usar:');
    console.log(JSON.stringify(testData, null, 2));

    return testData;
    
  } catch (error) {
    console.error('❌ Error obteniendo datos:', error);
    throw error;
  }
}

getTestData().catch(console.error);








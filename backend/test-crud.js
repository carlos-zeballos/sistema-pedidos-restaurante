const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configurar Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Faltan variables de entorno de Supabase');
  console.log('Asegúrate de tener SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en tu .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  db: { schema: 'public' },
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testCRUD() {
  console.log('🚀 Iniciando pruebas CRUD con Supabase...\n');

  try {
    // 1. PROBAR LECTURA DE CATEGORÍAS
    console.log('📋 1. Probando lectura de categorías...');
    const { data: categories, error: catError } = await supabase
      .from('Category')
      .select('*')
      .eq('isActive', true)
      .order('ord', { ascending: true });

    if (catError) {
      console.error('❌ Error al obtener categorías:', catError.message);
    } else {
      console.log(`✅ Categorías obtenidas: ${categories?.length || 0}`);
      if (categories && categories.length > 0) {
        console.log('   Primera categoría:', categories[0].name);
      }
    }

    // 2. PROBAR LECTURA DE PRODUCTOS
    console.log('\n🍔 2. Probando lectura de productos...');
    const { data: products, error: prodError } = await supabase
      .from('Product')
      .select('*, category:Category(*)')
      .eq('isEnabled', true)
      .order('name', { ascending: true });

    if (prodError) {
      console.error('❌ Error al obtener productos:', prodError.message);
    } else {
      console.log(`✅ Productos obtenidos: ${products?.length || 0}`);
      if (products && products.length > 0) {
        console.log('   Primer producto:', products[0].name, '- $', products[0].price);
      }
    }

    // 3. PROBAR LECTURA DE ESPACIOS
    console.log('\n🪑 3. Probando lectura de espacios...');
    const { data: spaces, error: spaceError } = await supabase
      .from('Space')
      .select('*')
      .eq('isActive', true)
      .order('code', { ascending: true });

    if (spaceError) {
      console.error('❌ Error al obtener espacios:', spaceError.message);
    } else {
      console.log(`✅ Espacios obtenidos: ${spaces?.length || 0}`);
      if (spaces && spaces.length > 0) {
        console.log('   Primer espacio:', spaces[0].code, '-', spaces[0].name);
      }
    }

    // 4. PROBAR LECTURA DE USUARIOS
    console.log('\n👤 4. Probando lectura de usuarios...');
    const { data: users, error: userError } = await supabase
      .from('User')
      .select('*')
      .eq('isActive', true)
      .limit(5);

    if (userError) {
      console.error('❌ Error al obtener usuarios:', userError.message);
    } else {
      console.log(`✅ Usuarios obtenidos: ${users?.length || 0}`);
      if (users && users.length > 0) {
        console.log('   Primer usuario:', users[0].username, '-', users[0].role);
      }
    }

    // 5. PROBAR LECTURA DE ÓRDENES
    console.log('\n📦 5. Probando lectura de órdenes...');
    const { data: orders, error: orderError } = await supabase
      .from('Order')
      .select('*, space:Space(*), items:OrderItem(*)')
      .order('createdAt', { ascending: false })
      .limit(5);

    if (orderError) {
      console.error('❌ Error al obtener órdenes:', orderError.message);
    } else {
      console.log(`✅ Órdenes obtenidas: ${orders?.length || 0}`);
      if (orders && orders.length > 0) {
        console.log('   Primera orden:', orders[0].orderNumber, '-', orders[0].status);
      }
    }

    // 6. PROBAR CREACIÓN DE CATEGORÍA (si no hay errores previos)
    console.log('\n➕ 6. Probando creación de categoría de prueba...');
    const testCategory = {
      name: 'Categoría de Prueba',
      description: 'Categoría creada para pruebas CRUD',
      ord: 999,
      isActive: true
    };

    const { data: newCategory, error: createError } = await supabase
      .from('Category')
      .insert([testCategory])
      .select()
      .single();

    if (createError) {
      console.error('❌ Error al crear categoría:', createError.message);
    } else {
      console.log('✅ Categoría creada:', newCategory.name, '(ID:', newCategory.id + ')');

      // 7. PROBAR ACTUALIZACIÓN
      console.log('\n✏️ 7. Probando actualización de categoría...');
      const { data: updatedCategory, error: updateError } = await supabase
        .from('Category')
        .update({ name: 'Categoría Actualizada', description: 'Descripción actualizada' })
        .eq('id', newCategory.id)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Error al actualizar categoría:', updateError.message);
      } else {
        console.log('✅ Categoría actualizada:', updatedCategory.name);

        // 8. PROBAR ELIMINACIÓN
        console.log('\n🗑️ 8. Probando eliminación de categoría...');
        const { error: deleteError } = await supabase
          .from('Category')
          .delete()
          .eq('id', newCategory.id);

        if (deleteError) {
          console.error('❌ Error al eliminar categoría:', deleteError.message);
        } else {
          console.log('✅ Categoría eliminada correctamente');
        }
      }
    }

    console.log('\n🎉 ¡Pruebas CRUD completadas!');
    console.log('📊 Resumen:');
    console.log(`   - Categorías: ${categories?.length || 0}`);
    console.log(`   - Productos: ${products?.length || 0}`);
    console.log(`   - Espacios: ${spaces?.length || 0}`);
    console.log(`   - Usuarios: ${users?.length || 0}`);
    console.log(`   - Órdenes: ${orders?.length || 0}`);

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

// Ejecutar pruebas
testCRUD();

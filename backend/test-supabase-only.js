const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔗 Probando conexión directa a Supabase...\n');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Faltan variables de entorno de Supabase');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  db: { schema: 'public' },
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testSupabaseConnection() {
  try {
    console.log('📋 1. Probando categorías...');
    const { data: categories, error: catError } = await supabase
      .from('Category')
      .select('*')
      .eq('isactive', true)
      .limit(3);

    if (catError) {
      console.error('❌ Error categorías:', catError.message);
    } else {
      console.log(`✅ Categorías: ${categories?.length || 0}`);
      if (categories && categories.length > 0) {
        console.log('   Primera:', categories[0].name);
      }
    }

    console.log('\n🍔 2. Probando productos...');
    const { data: products, error: prodError } = await supabase
      .from('Product')
      .select('*')
      .eq('isenabled', true)
      .limit(3);

    if (prodError) {
      console.error('❌ Error productos:', prodError.message);
    } else {
      console.log(`✅ Productos: ${products?.length || 0}`);
      if (products && products.length > 0) {
        console.log('   Primero:', products[0].name, '- $', products[0].price);
      }
    }

    console.log('\n🪑 3. Probando espacios...');
    const { data: spaces, error: spaceError } = await supabase
      .from('Space')
      .select('*')
      .eq('isactive', true)
      .limit(3);

    if (spaceError) {
      console.error('❌ Error espacios:', spaceError.message);
    } else {
      console.log(`✅ Espacios: ${spaces?.length || 0}`);
      if (spaces && spaces.length > 0) {
        console.log('   Primero:', spaces[0].code, '-', spaces[0].name);
      }
    }

    console.log('\n👤 4. Probando usuarios...');
    const { data: users, error: userError } = await supabase
      .from('User')
      .select('*')
      .eq('isactive', true)
      .limit(3);

    if (userError) {
      console.error('❌ Error usuarios:', userError.message);
    } else {
      console.log(`✅ Usuarios: ${users?.length || 0}`);
      if (users && users.length > 0) {
        console.log('   Primero:', users[0].username, '-', users[0].role);
      }
    }

    console.log('\n🎉 ¡Conexión a Supabase funcionando correctamente!');
    console.log('📊 Resumen:');
    console.log(`   - Categorías: ${categories?.length || 0}`);
    console.log(`   - Productos: ${products?.length || 0}`);
    console.log(`   - Espacios: ${spaces?.length || 0}`);
    console.log(`   - Usuarios: ${users?.length || 0}`);

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

testSupabaseConnection();

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY no encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableStructures() {
  try {
    console.log('🔧 Verificando estructura de las tablas...');
    
    // Verificar estructura de Space
    console.log('\n📋 Tabla Space:');
    const { data: spaceData, error: spaceError } = await supabase
      .from('Space')
      .select('*')
      .limit(1);
    
    if (spaceError) {
      console.error('❌ Error al obtener datos de Space:', spaceError);
    } else if (spaceData && spaceData.length > 0) {
      const space = spaceData[0];
      Object.keys(space).forEach(key => {
        console.log(`   - ${key}: ${typeof space[key]} = ${space[key]}`);
      });
    } else {
      console.log('⚠️ No hay espacios en la tabla');
    }
    
    // Verificar estructura de User
    console.log('\n📋 Tabla User:');
    const { data: userData, error: userError } = await supabase
      .from('User')
      .select('*')
      .limit(1);
    
    if (userError) {
      console.error('❌ Error al obtener datos de User:', userError);
    } else if (userData && userData.length > 0) {
      const user = userData[0];
      Object.keys(user).forEach(key => {
        console.log(`   - ${key}: ${typeof user[key]} = ${user[key]}`);
      });
    } else {
      console.log('⚠️ No hay usuarios en la tabla');
    }
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

checkTableStructures();















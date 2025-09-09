const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function debugCatalog() {
  console.log('🔍 Diagnosticando problemas del catálogo...');
  console.log('=====================================');
  
  // 1. Probar conexión básica
  console.log('\n1. Probando conexión básica...');
  try {
    const { data, error } = await supabase
      .from('Category')
      .select('id, name')
      .limit(1);
    
    if (error) {
      console.log('❌ Error en conexión básica:', error.message);
      return;
    }
    console.log('✅ Conexión básica OK');
  } catch (e) {
    console.log('❌ Error inesperado:', e.message);
    return;
  }

  // 2. Probar query exacta del servicio
  console.log('\n2. Probando query exacta del servicio...');
  try {
    const { data, error } = await supabase
      .from('Category')
      .select('id,name,description,image,ord,isActive,createdAt,updatedAt')
      .eq('isActive', true)
      .order('ord', { ascending: true });
    
    if (error) {
      console.log('❌ Error en query del servicio:', error.message);
      console.log('   - Code:', error.code);
      console.log('   - Details:', error.details);
      console.log('   - Hint:', error.hint);
    } else {
      console.log('✅ Query del servicio OK');
      console.log('   - Categorías encontradas:', data.length);
      if (data.length > 0) {
        console.log('   - Primera categoría:', data[0]);
      }
    }
  } catch (e) {
    console.log('❌ Error inesperado en query:', e.message);
  }

  // 3. Probar productos
  console.log('\n3. Probando productos...');
  try {
    const { data, error } = await supabase
      .from('Product')
      .select('id,code,name,description,price,image,type,categoryId,preparationTime,isEnabled,isAvailable,allergens,nutritionalInfo,createdAt,updatedAt')
      .limit(1);
    
    if (error) {
      console.log('❌ Error en productos:', error.message);
    } else {
      console.log('✅ Productos OK');
      console.log('   - Productos encontrados:', data.length);
    }
  } catch (e) {
    console.log('❌ Error inesperado en productos:', e.message);
  }

  // 4. Probar espacios
  console.log('\n4. Probando espacios...');
  try {
    const { data, error } = await supabase
      .from('Space')
      .select('id,code,name,type,capacity,status,isActive,notes,createdAt,updatedAt')
      .limit(1);
    
    if (error) {
      console.log('❌ Error en espacios:', error.message);
    } else {
      console.log('✅ Espacios OK');
      console.log('   - Espacios encontrados:', data.length);
    }
  } catch (e) {
    console.log('❌ Error inesperado en espacios:', e.message);
  }

  // 5. Probar combos
  console.log('\n5. Probando combos...');
  try {
    const { data, error } = await supabase
      .from('Combo')
      .select('id,code,name,description,basePrice,image,isEnabled,isAvailable,preparationTime,categoryId,createdAt,updatedAt')
      .limit(1);
    
    if (error) {
      console.log('❌ Error en combos:', error.message);
    } else {
      console.log('✅ Combos OK');
      console.log('   - Combos encontrados:', data.length);
    }
  } catch (e) {
    console.log('❌ Error inesperado en combos:', e.message);
  }

  console.log('\n=====================================');
  console.log('🏁 Diagnóstico completado');
}

debugCatalog();









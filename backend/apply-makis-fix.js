const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

console.log('🔧 Configuración Supabase:');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey ? '✅ Configurada' : '❌ No configurada');

if (!supabaseUrl || !supabaseKey || supabaseUrl === 'https://your-project.supabase.co') {
  console.error('❌ Error: Configura las variables de entorno SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en el archivo .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMakisFix() {
  try {
    console.log('\n🔧 Iniciando corrección de makis clásicos...');
    
    // 1) Buscar la categoría "Makis clásicos"
    console.log('📝 Buscando categoría "Makis clásicos"...');
    const { data: categoryData, error: categoryError } = await supabase
      .from('Category')
      .select('id, name')
      .ilike('name', 'Makis clásicos')
      .limit(1);
    
    if (categoryError) {
      console.error('❌ Error al buscar categoría:', categoryError);
      return;
    }
    
    if (!categoryData || categoryData.length === 0) {
      console.log('⚠️ No se encontró la categoría "Makis clásicos"');
      return;
    }
    
    const categoryId = categoryData[0].id;
    console.log(`✅ Categoría encontrada: ${categoryData[0].name} (ID: ${categoryId})`);
    
    // 2) Actualizar productos por categoría
    console.log('\n📝 Actualizando makis por categoría...');
    const { data: updateData1, error: updateError1 } = await supabase
      .from('Product')
      .update({
        price: 25.90,
        isEnabled: true,
        isAvailable: true,
        updatedAt: new Date().toISOString()
      })
      .eq('categoryId', categoryId)
      .or('price.is.null,price.eq.0');
    
    if (updateError1) {
      console.error('❌ Error al actualizar por categoría:', updateError1);
    } else {
      console.log(`✅ Makis actualizados por categoría: ${updateData1?.length || 0}`);
    }
    
    // 3) Actualizar productos por código MKC-%
    console.log('\n📝 Actualizando makis por código MKC-%...');
    const { data: updateData2, error: updateError2 } = await supabase
      .from('Product')
      .update({
        price: 25.90,
        isEnabled: true,
        isAvailable: true,
        updatedAt: new Date().toISOString()
      })
      .ilike('code', 'MKC-%')
      .or('price.is.null,price.eq.0');
    
    if (updateError2) {
      console.error('❌ Error al actualizar por código:', updateError2);
    } else {
      console.log(`✅ Makis actualizados por código: ${updateData2?.length || 0}`);
    }
    
    // 4) Verificación final
    console.log('\n🔍 Verificando resultados...');
    const { data: verificationData, error: verificationError } = await supabase
      .from('Product')
      .select('code, name, price, isEnabled, isAvailable')
      .or(`code.ilike.MKC-%,categoryId.eq.${categoryId}`)
      .gt('price', 0)
      .order('name');
    
    if (verificationError) {
      console.error('❌ Error en verificación:', verificationError);
    } else {
      const conPrecio2590 = verificationData?.filter(p => p.price === 25.90).length || 0;
      const habilitados = verificationData?.filter(p => p.isEnabled).length || 0;
      const disponibles = verificationData?.filter(p => p.isAvailable).length || 0;
      
      console.log('\n📊 RESUMEN MAKIS CLÁSICOS:');
      console.log(`   - Con precio 25.90: ${conPrecio2590}`);
      console.log(`   - Habilitados: ${habilitados}`);
      console.log(`   - Disponibles: ${disponibles}`);
      console.log(`   - Total encontrados: ${verificationData?.length || 0}`);
      
      // 5) Listado detallado
      console.log('\n📋 LISTADO DE MAKIS CLÁSICOS:');
      verificationData?.forEach(product => {
        const status = product.isEnabled && product.isAvailable ? '✅' : '❌';
        console.log(`   ${status} ${product.code}: ${product.name} | $${product.price} | Habilitado: ${product.isEnabled} | Disponible: ${product.isAvailable}`);
      });
    }
    
    console.log('\n✅ Corrección de makis clásicos completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

applyMakisFix();






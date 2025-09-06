const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY no encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixMakisClasicos() {
  try {
    console.log('🔧 Iniciando corrección de makis clásicos...');
    
    // 1) Actualizar por categoría
    console.log('📝 Actualizando makis por categoría...');
    const { data: categoryData, error: categoryError } = await supabase
      .from('Category')
      .select('id')
      .ilike('name', 'Makis clásicos')
      .limit(1);
    
    if (categoryError) {
      console.error('❌ Error al buscar categoría:', categoryError);
      return;
    }
    
    if (categoryData && categoryData.length > 0) {
      const categoryId = categoryData[0].id;
      
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
        console.log('✅ Makis actualizados por categoría:', updateData1?.length || 0);
      }
    }
    
    // 2) Actualizar por código
    console.log('📝 Actualizando makis por código...');
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
      console.log('✅ Makis actualizados por código:', updateData2?.length || 0);
    }
    
    // 3) Verificación
    console.log('🔍 Verificando resultados...');
    const { data: verificationData, error: verificationError } = await supabase
      .from('Product')
      .select('*')
      .or('code.ilike.MKC-%,categoryId.eq.' + (categoryData?.[0]?.id || 0))
      .gt('price', 0);
    
    if (verificationError) {
      console.error('❌ Error en verificación:', verificationError);
    } else {
      const conPrecio2590 = verificationData?.filter(p => p.price === 25.90).length || 0;
      const habilitados = verificationData?.filter(p => p.isEnabled).length || 0;
      const disponibles = verificationData?.filter(p => p.isAvailable).length || 0;
      
      console.log('📊 RESUMEN MAKIS CLÁSICOS:');
      console.log(`   - Con precio 25.90: ${conPrecio2590}`);
      console.log(`   - Habilitados: ${habilitados}`);
      console.log(`   - Disponibles: ${disponibles}`);
      console.log(`   - Total encontrados: ${verificationData?.length || 0}`);
      
      // 4) Listado detallado
      console.log('\n📋 LISTADO DE MAKIS CLÁSICOS:');
      verificationData?.forEach(product => {
        console.log(`   - ${product.code}: ${product.name} | $${product.price} | Habilitado: ${product.isEnabled} | Disponible: ${product.isAvailable}`);
      });
    }
    
    console.log('✅ Corrección de makis clásicos completada');
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

fixMakisClasicos();






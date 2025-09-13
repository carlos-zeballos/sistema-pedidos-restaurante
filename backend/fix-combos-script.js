// Script para arreglar combos sin componentes en la base de datos
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan variables de entorno SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixCombosWithoutComponents() {
  try {
    console.log('🔍 Verificando combos sin componentes...');
    
    // 1. Ver combos sin componentes
    const { data: combosWithoutComponents, error: checkError } = await supabase
      .from('Combo')
      .select(`
        id, code, name, "basePrice",
        ComboComponent(id)
      `)
      .eq('isEnabled', true);

    if (checkError) {
      console.error('❌ Error verificando combos:', checkError);
      return;
    }

    console.log('📊 Combos encontrados:', combosWithoutComponents.length);
    
    const combosToFix = combosWithoutComponents.filter(combo => 
      !combo.ComboComponent || combo.ComboComponent.length === 0
    );
    
    console.log('🔧 Combos sin componentes a arreglar:', combosToFix.length);
    
    if (combosToFix.length === 0) {
      console.log('✅ Todos los combos ya tienen componentes');
      return;
    }

    // 2. Agregar componentes básicos a cada combo sin componentes
    for (const combo of combosToFix) {
      console.log(`\n🍱 Arreglando combo: ${combo.name} (${combo.code})`);
      
      const components = [
        {
          comboId: combo.id,
          name: 'Acevichado',
          description: 'Roll de salmón con salsa acevichada',
          type: 'SABOR',
          price: 25.90,
          isRequired: true,
          isAvailable: true,
          maxSelections: 1,
          ord: 1
        },
        {
          comboId: combo.id,
          name: 'California',
          description: 'Roll de cangrejo con aguacate',
          type: 'SABOR',
          price: 25.90,
          isRequired: false,
          isAvailable: true,
          maxSelections: 1,
          ord: 2
        },
        {
          comboId: combo.id,
          name: 'Furai',
          description: 'Roll de camarón empanizado',
          type: 'SABOR',
          price: 25.90,
          isRequired: false,
          isAvailable: true,
          maxSelections: 1,
          ord: 3
        }
      ];

      // Agregar más componentes según el tipo de combo
      if (combo.code.includes('BARCO') || combo.code.includes('PUENTE')) {
        components.push(
          {
            comboId: combo.id,
            name: 'Olivo',
            description: 'Roll de salmón con aceitunas',
            type: 'SABOR',
            price: 25.90,
            isRequired: false,
            isAvailable: true,
            maxSelections: 1,
            ord: 4
          },
          {
            comboId: combo.id,
            name: 'Shiro',
            description: 'Roll de salmón blanco',
            type: 'SABOR',
            price: 25.90,
            isRequired: false,
            isAvailable: true,
            maxSelections: 1,
            ord: 5
          }
        );
      }

      if (combo.code.includes('30_ROLLS')) {
        components.push(
          {
            comboId: combo.id,
            name: 'Olivo',
            description: 'Roll de salmón con aceitunas',
            type: 'SABOR',
            price: 25.90,
            isRequired: false,
            isAvailable: true,
            maxSelections: 1,
            ord: 4
          },
          {
            comboId: combo.id,
            name: 'Shiro',
            description: 'Roll de salmón blanco',
            type: 'SABOR',
            price: 25.90,
            isRequired: false,
            isAvailable: true,
            maxSelections: 1,
            ord: 5
          },
          {
            comboId: combo.id,
            name: 'Tataki',
            description: 'Roll de atún sellado',
            type: 'SABOR',
            price: 25.90,
            isRequired: false,
            isAvailable: true,
            maxSelections: 1,
            ord: 6
          }
        );
      }

      // Insertar componentes
      const { error: insertError } = await supabase
        .from('ComboComponent')
        .insert(components);

      if (insertError) {
        console.error(`❌ Error insertando componentes para ${combo.name}:`, insertError);
      } else {
        console.log(`✅ Agregados ${components.length} componentes a ${combo.name}`);
      }
    }

    // 3. Verificar resultado final
    console.log('\n🔍 Verificando resultado final...');
    const { data: finalCheck, error: finalError } = await supabase
      .from('Combo')
      .select(`
        id, code, name, "basePrice",
        ComboComponent(id, name, type)
      `)
      .eq('isEnabled', true);

    if (finalError) {
      console.error('❌ Error en verificación final:', finalError);
      return;
    }

    console.log('\n📊 RESULTADO FINAL:');
    finalCheck.forEach(combo => {
      const componentCount = combo.ComboComponent?.length || 0;
      console.log(`🍱 ${combo.name} (${combo.code}): ${componentCount} componentes`);
    });

    console.log('\n✅ Script completado exitosamente');

  } catch (error) {
    console.error('💥 Error en el script:', error);
  }
}

// Ejecutar el script
fixCombosWithoutComponents();









const { Client } = require('pg');
require('dotenv').config();

async function fixSupabaseColumns() {
  console.log('🔧 Agregando columnas faltantes en Supabase...');

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Conectado a Supabase');

    // 1. Agregar columna actualReadyTime a la tabla Order
    console.log('📝 Agregando columna actualReadyTime a la tabla Order...');
    await client.query(`
      ALTER TABLE "Order" 
      ADD COLUMN IF NOT EXISTS "actualReadyTime" TIMESTAMP WITH TIME ZONE
    `);
    console.log('✅ Columna actualReadyTime agregada');

    // 2. Agregar columna changedBy a la tabla OrderStatusHistory
    console.log('📝 Agregando columna changedBy a la tabla OrderStatusHistory...');
    await client.query(`
      ALTER TABLE "OrderStatusHistory" 
      ADD COLUMN IF NOT EXISTS "changedBy" UUID REFERENCES "User"(id)
    `);
    console.log('✅ Columna changedBy agregada');

    // 3. Verificar que las columnas se agregaron correctamente
    console.log('🔍 Verificando columnas agregadas...');
    const columnsResult = await client.query(`
      SELECT 
          table_name, 
          column_name, 
          data_type 
      FROM information_schema.columns 
      WHERE table_name IN ('Order', 'OrderStatusHistory') 
          AND column_name IN ('actualReadyTime', 'changedBy')
      ORDER BY table_name, column_name
    `);

    console.log('📋 Columnas encontradas:');
    columnsResult.rows.forEach(row => {
      console.log(`   ✅ ${row.table_name}.${row.column_name} (${row.data_type})`);
    });

    // 4. Actualizar registros existentes si es necesario
    console.log('🔄 Actualizando registros existentes...');
    const updateResult = await client.query(`
      UPDATE "OrderStatusHistory" 
      SET "changedBy" = (SELECT id FROM "User" WHERE username = 'admin' LIMIT 1)
      WHERE "changedBy" IS NULL
    `);
    console.log(`✅ ${updateResult.rowCount} registros actualizados`);

    console.log('\n🎉 ¡Columnas agregadas exitosamente!');
    console.log('💡 El backend ahora debería funcionar correctamente');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

fixSupabaseColumns();














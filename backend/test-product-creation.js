const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function testProductCreation() {
  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos');
    
    // Primero, obtener una categoría válida
    const categories = await client.query(`
      SELECT id, name FROM "Category" 
      WHERE "isActive" = true 
      LIMIT 1
    `);
    
    if (categories.rows.length === 0) {
      console.log('❌ No hay categorías activas disponibles');
      return;
    }
    
    const category = categories.rows[0];
    console.log(`📋 Usando categoría: ${category.name} (${category.id})`);
    
    // Datos de prueba para crear un producto
    const testProduct = {
      p_code: 'TEST-' + Date.now(),
      p_name: 'Producto de Prueba',
      p_price: 25.50,
      p_category_id: category.id,
      p_id: null,
      p_type: 'COMIDA',
      p_description: 'Descripción de prueba',
      p_image: null,
      p_preparation_time: 15,
      p_is_enabled: true,
      p_is_available: true,
      p_allergens: null,
      p_nutritional_info: null
    };
    
    console.log('📤 Probando creación de producto con datos:');
    console.log(JSON.stringify(testProduct, null, 2));
    
    // Llamar a la función RPC
    const result = await client.query(`
      SELECT product_upsert(
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
      ) as product_id
    `, [
      testProduct.p_code,
      testProduct.p_name,
      testProduct.p_price,
      testProduct.p_category_id,
      testProduct.p_id,
      testProduct.p_type,
      testProduct.p_description,
      testProduct.p_image,
      testProduct.p_preparation_time,
      testProduct.p_is_enabled,
      testProduct.p_is_available,
      testProduct.p_allergens,
      testProduct.p_nutritional_info
    ]);
    
    console.log('✅ Producto creado exitosamente!');
    console.log('📋 ID del producto:', result.rows[0].product_id);
    
    // Verificar que el producto se creó correctamente
    const product = await client.query(`
      SELECT * FROM "Product" WHERE id = $1
    `, [result.rows[0].product_id]);
    
    console.log('📋 Producto creado:');
    console.log(JSON.stringify(product.rows[0], null, 2));
    
  } catch (error) {
    console.error('❌ Error creando producto:', error.message);
    console.error('❌ Detalles del error:', error);
  } finally {
    await client.end();
  }
}

testProductCreation();







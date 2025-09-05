const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Variables de entorno de Supabase no configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testOrderById() {
  console.log('🔍 Probando getOrderById...\n');

  try {
    // ID de la orden que sabemos que existe
    const orderId = '38a231f4-f438-4474-bbe4-bf2c83c131d2';
    
    console.log('1️⃣ Probando consulta directa a Supabase...');
    const { data, error } = await supabase
      .from('Order')
      .select(`
        *,
        space:Space(*),
        items:OrderItem(*)
      `)
      .eq('id', orderId)
      .single();

    if (error) {
      console.error('❌ Error en consulta directa:', error);
    } else {
      console.log('✅ Consulta directa exitosa');
      console.log('   Orden encontrada:', data.ordernumber);
      console.log('   Estado:', data.status);
      console.log('   Cliente:', data.customername);
    }

    // Probar con axios al backend
    console.log('\n2️⃣ Probando consulta al backend...');
    const axios = require('axios');
    
    try {
      const response = await axios.get(`http://localhost:3001/orders/${orderId}`);
      console.log('✅ Consulta al backend exitosa');
      console.log('   Orden encontrada:', response.data.ordernumber);
      console.log('   Estado:', response.data.status);
    } catch (backendError) {
      console.error('❌ Error en consulta al backend:', backendError.response?.data || backendError.message);
    }

    // Probar actualización de estado
    console.log('\n3️⃣ Probando actualización de estado...');
    try {
      const updateResponse = await axios.put(
        `http://localhost:3001/orders/${orderId}/status`,
        { status: 'EN_PREPARACION' }
      );
      console.log('✅ Actualización exitosa');
      console.log('   Nuevo estado:', updateResponse.data.status);
    } catch (updateError) {
      console.error('❌ Error en actualización:', updateError.response?.data || updateError.message);
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

testOrderById();

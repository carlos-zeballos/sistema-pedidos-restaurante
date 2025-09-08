const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testProductCreation() {
  try {
    console.log('🧪 Testing product_upsert RPC function...');
    
    // Test data that matches what the frontend sends
    const testData = {
      p_code: 'TEST001',
      p_name: 'Test Product',
      p_price: 10.50,
      p_category_id: null, // We'll get a real category ID first
      p_id: null,
      p_type: 'COMIDA',
      p_description: 'Test description',
      p_image: null,
      p_preparation_time: 15,
      p_is_enabled: true,
      p_is_available: true,
      p_allergens: null,
      p_nutritional_info: null
    };

    // First, get a category ID
    console.log('🔍 Getting a category ID...');
    const { data: categories, error: catError } = await supabase
      .from('Category')
      .select('id')
      .eq('isActive', true)
      .limit(1);

    if (catError) {
      console.error('❌ Error getting categories:', catError);
      return;
    }

    if (!categories || categories.length === 0) {
      console.error('❌ No categories found');
      return;
    }

    testData.p_category_id = categories[0].id;
    console.log('✅ Using category ID:', testData.p_category_id);

    console.log('📋 Test data:', JSON.stringify(testData, null, 2));

    // Test the RPC function
    console.log('🚀 Calling product_upsert RPC...');
    const { data, error } = await supabase
      .rpc('product_upsert', testData);

    console.log('📊 RPC Response:');
    console.log('   - Data:', data);
    console.log('   - Error:', error);

    if (error) {
      console.error('❌ RPC Error Details:');
      console.error('   - Code:', error.code);
      console.error('   - Message:', error.message);
      console.error('   - Details:', error.details);
      console.error('   - Hint:', error.hint);
    } else {
      console.log('✅ Product created successfully with ID:', data);
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

testProductCreation();





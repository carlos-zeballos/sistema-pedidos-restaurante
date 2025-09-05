const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function listUsers() {
  try {
    console.log('👤 Listando usuarios...\n');

    const { data, error } = await supabase
      .from('User')
      .select('username, firstname, lastname, role, isactive')
      .eq('isactive', true);

    if (error) {
      console.error('Error:', error);
      return;
    }

    console.log('Usuarios disponibles:');
    data.forEach((user, i) => {
      console.log(`${i + 1}. ${user.username} (${user.role}) - ${user.firstname} ${user.lastname}`);
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

listUsers();

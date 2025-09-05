#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔧 ACTUALIZADOR DE CONFIGURACIÓN .ENV\n');

console.log('📋 INSTRUCCIONES:');
console.log('1. Ve a tu proyecto en Supabase Dashboard');
console.log('2. Ve a Settings → Database');
console.log('3. Copia la "Connection string" completa');
console.log('4. Pégalo aquí cuando te lo pida\n');

console.log('📝 FORMATO ESPERADO:');
console.log('postgresql://postgres:TU_CONTRASEÑA@db.TU_PROYECTO.supabase.co:5432/postgres\n');

rl.question('🔗 Pega tu connection string aquí: ', (connectionString) => {
  // Validar el formato
  if (!connectionString.includes('postgresql://') || !connectionString.includes('supabase.co')) {
    console.log('❌ Error: El formato de la connection string no es válido');
    console.log('   Debe ser: postgresql://postgres:CONTRASEÑA@db.PROYECTO.supabase.co:5432/postgres');
    rl.close();
    return;
  }

  // Leer el archivo .env actual
  const envPath = path.join(__dirname, '..', '.env');
  let envContent = '';

  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  } else {
    // Si no existe, crear con contenido base
    envContent = `# Database Configuration
DATABASE_URL=""

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Server Configuration
PORT=3001
NODE_ENV=development

# Supabase Configuration (Optional)
# SUPABASE_URL=""
# SUPABASE_ANON_KEY=""
# SUPABASE_SERVICE_ROLE_KEY=""
`;
  }

  // Actualizar o agregar DATABASE_URL
  if (envContent.includes('DATABASE_URL=')) {
    // Reemplazar la línea existente
    envContent = envContent.replace(
      /DATABASE_URL="[^"]*"/,
      `DATABASE_URL="${connectionString}"`
    );
  } else {
    // Agregar al final
    envContent += `\nDATABASE_URL="${connectionString}"`;
  }

  // Escribir el archivo actualizado
  try {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Archivo .env actualizado correctamente');
    console.log(`📁 Ubicación: ${envPath}`);
    
    // Mostrar la URL sin la contraseña
    const maskedUrl = connectionString.replace(/:[^:@]*@/, ':****@');
    console.log(`🔗 Connection string: ${maskedUrl}`);
    
    console.log('\n🎯 PRÓXIMOS PASOS:');
    console.log('1. Ejecuta: npm run supabase:diagnostic');
    console.log('2. Si la conexión es exitosa: npm run db:generate');
    console.log('3. Luego: npm run db:push');
    console.log('4. Finalmente: npm run db:seed');
    
  } catch (error) {
    console.log('❌ Error al actualizar el archivo .env:');
    console.log(`   ${error.message}`);
  }

  rl.close();
});

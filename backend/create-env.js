const fs = require('fs');
const path = require('path');

const envContent = `# Database Configuration
DATABASE_URL="postgresql://postgres.jfvkhoxhiudtxskylnrv:muchachos98356@aws-1-sa-east-1.pooler.supabase.com:6543/postgres"

# JWT Configuration
JWT_SECRET="tu-super-secreto-jwt-muy-seguro-2024"

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN="http://localhost:3000"

# Logging
LOG_LEVEL=debug
`;

const envPath = path.join(__dirname, '.env');

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Archivo .env creado exitosamente');
  console.log('📁 Ubicación:', envPath);
  console.log('🔗 URL de la base de datos configurada');
} catch (error) {
  console.error('❌ Error al crear el archivo .env:', error.message);
}

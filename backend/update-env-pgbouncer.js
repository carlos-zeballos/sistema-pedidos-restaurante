const fs = require('fs');
const path = require('path');

const envContent = `# Database Configuration - PgBouncer Pooled
DATABASE_URL="postgresql://postgres.jfvkhoxhiudtxskylnrv:muchachos98356@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true&connection_limit=1"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Server Configuration
PORT=3001
NODE_ENV=development

# Supabase Configuration (if using Supabase)
# SUPABASE_URL="https://your-project.supabase.co"
# SUPABASE_ANON_KEY="your-anon-key"
# SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
`;

const envPath = path.join(__dirname, '.env');

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Archivo .env actualizado con configuración PgBouncer');
  console.log('📁 Ubicación:', envPath);
  console.log('🔗 URL configurada para pooler con pgbouncer=true');
  console.log('🔒 connection_limit=1 para evitar conflictos');
} catch (error) {
  console.error('❌ Error al actualizar el archivo .env:', error.message);
}

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

try {
  console.log('🔍 Probando conexión con Prisma...');
  
  // Test simple de conexión
  const result = await prisma.$queryRaw`SELECT 1 as ok, NOW() as current_time`;
  console.log('✅ Conexión exitosa con Prisma!');
  console.log('📊 Resultado:', result);
  
  // Verificar si hay tablas
  const tables = await prisma.$queryRaw`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
  `;
  console.log('📋 Tablas encontradas:', tables.length);
  console.log('📋 Nombres de tablas:', tables.map(t => t.table_name));
  
  await prisma.$disconnect();
} catch (error) {
  console.error('❌ Error de conexión con Prisma:', error.message);
  await prisma.$disconnect();
}

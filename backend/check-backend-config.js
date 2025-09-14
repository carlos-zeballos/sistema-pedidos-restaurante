const fs = require('fs');
const path = require('path');

function checkBackendConfig() {
  console.log('🔍 VERIFICANDO CONFIGURACIÓN DEL BACKEND');
  console.log('=========================================');
  
  // 1. Verificar archivo .env
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    console.log('✅ Archivo .env encontrado');
    
    try {
      const envContent = fs.readFileSync(envPath, 'utf8');
      
      const requiredVars = [
        'SUPABASE_URL',
        'SUPABASE_SERVICE_ROLE_KEY',
        'JWT_SECRET',
        'PORT',
        'NODE_ENV'
      ];
      
      requiredVars.forEach(varName => {
        if (envContent.includes(varName)) {
          console.log(`✅ Variable ${varName} encontrada`);
        } else {
          console.log(`❌ Variable ${varName} NO encontrada`);
        }
      });
      
    } catch (e) {
      console.log('❌ Error leyendo archivo .env');
    }
  } else {
    console.log('❌ Archivo .env NO encontrado');
  }
  
  // 2. Verificar package.json
  const packageJsonPath = path.join(__dirname, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    console.log('✅ package.json encontrado');
    
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      console.log(`   📦 Nombre: ${packageJson.name}`);
      console.log(`   📦 Versión: ${packageJson.version}`);
      
      // Verificar scripts importantes
      const importantScripts = ['start:dev', 'start:prod', 'build'];
      importantScripts.forEach(script => {
        if (packageJson.scripts && packageJson.scripts[script]) {
          console.log(`✅ Script ${script} encontrado`);
        } else {
          console.log(`❌ Script ${script} NO encontrado`);
        }
      });
      
    } catch (e) {
      console.log('❌ Error leyendo package.json');
    }
  } else {
    console.log('❌ package.json NO encontrado');
  }
  
  // 3. Verificar estructura de directorios
  const requiredDirs = [
    'src',
    'src/catalog',
    'src/lib',
    'dist'
  ];
  
  requiredDirs.forEach(dir => {
    const dirPath = path.join(__dirname, dir);
    if (fs.existsSync(dirPath)) {
      console.log(`✅ Directorio ${dir} encontrado`);
    } else {
      console.log(`❌ Directorio ${dir} NO encontrado`);
    }
  });
  
  // 4. Verificar archivos importantes del catálogo
  const catalogFiles = [
    'src/catalog/catalog.service.ts',
    'src/catalog/catalog.controller.ts',
    'src/catalog/catalog.module.ts',
    'src/lib/supabase.service.ts'
  ];
  
  catalogFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      console.log(`✅ Archivo ${file} encontrado`);
      
      // Verificar contenido específico
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        
        if (file.includes('catalog.service.ts')) {
          if (content.includes('getCategories')) {
            console.log(`   ✅ Método getCategories encontrado`);
          } else {
            console.log(`   ❌ Método getCategories NO encontrado`);
          }
          
          if (content.includes('SupabaseService')) {
            console.log(`   ✅ Usa SupabaseService`);
          } else {
            console.log(`   ❌ NO usa SupabaseService`);
          }
        }
        
        if (file.includes('supabase.service.ts')) {
          if (content.includes('createClient')) {
            console.log(`   ✅ createClient encontrado`);
          } else {
            console.log(`   ❌ createClient NO encontrado`);
          }
        }
        
      } catch (e) {
        console.log(`   ❌ Error leyendo ${file}`);
      }
    } else {
      console.log(`❌ Archivo ${file} NO encontrado`);
    }
  });
  
  // 5. Verificar archivos compilados
  const distFiles = [
    'dist/src/catalog/catalog.service.js',
    'dist/src/catalog/catalog.controller.js',
    'dist/src/lib/supabase.service.js'
  ];
  
  distFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      console.log(`✅ Archivo compilado ${file} encontrado`);
    } else {
      console.log(`❌ Archivo compilado ${file} NO encontrado`);
    }
  });
  
  console.log('\n=========================================');
  console.log('🏁 VERIFICACIÓN DEL BACKEND COMPLETADA');
}

checkBackendConfig();
















const fs = require('fs');
const path = require('path');

function checkFrontendConfig() {
  console.log('🔍 VERIFICANDO CONFIGURACIÓN DEL FRONTEND');
  console.log('==========================================');
  
  const frontendPath = path.join(__dirname, '..', 'frontend');
  
  // 1. Verificar que el directorio del frontend existe
  if (!fs.existsSync(frontendPath)) {
    console.log('❌ Directorio del frontend no encontrado');
    return;
  }
  
  console.log('✅ Directorio del frontend encontrado');
  
  // 2. Verificar package.json del frontend
  const packageJsonPath = path.join(frontendPath, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    console.log('✅ package.json del frontend encontrado');
    
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      console.log(`   📦 Nombre: ${packageJson.name}`);
      console.log(`   📦 Versión: ${packageJson.version}`);
    } catch (e) {
      console.log('❌ Error leyendo package.json del frontend');
    }
  } else {
    console.log('❌ package.json del frontend no encontrado');
  }
  
  // 3. Verificar archivo de configuración de API
  const apiServicePath = path.join(frontendPath, 'src', 'services', 'api.ts');
  if (fs.existsSync(apiServicePath)) {
    console.log('✅ Servicio de API encontrado');
    
    try {
      const apiContent = fs.readFileSync(apiServicePath, 'utf8');
      
      // Verificar configuración de URL
      if (apiContent.includes('localhost:3001')) {
        console.log('✅ URL del backend configurada correctamente (localhost:3001)');
      } else {
        console.log('⚠️  URL del backend podría no estar configurada correctamente');
      }
      
      // Verificar métodos del catálogo
      const catalogMethods = [
        'getCategories',
        'getProducts', 
        'getSpaces',
        'getCombos'
      ];
      
      catalogMethods.forEach(method => {
        if (apiContent.includes(method)) {
          console.log(`✅ Método ${method} encontrado`);
        } else {
          console.log(`❌ Método ${method} NO encontrado`);
        }
      });
      
    } catch (e) {
      console.log('❌ Error leyendo servicio de API');
    }
  } else {
    console.log('❌ Servicio de API no encontrado');
  }
  
  // 4. Verificar componente CatalogManagement
  const catalogManagementPath = path.join(frontendPath, 'src', 'components', 'CatalogManagement.tsx');
  if (fs.existsSync(catalogManagementPath)) {
    console.log('✅ Componente CatalogManagement encontrado');
    
    try {
      const componentContent = fs.readFileSync(catalogManagementPath, 'utf8');
      
      // Verificar que tiene las pestañas
      if (componentContent.includes('combos')) {
        console.log('✅ Pestaña de combos encontrada');
      } else {
        console.log('❌ Pestaña de combos NO encontrada');
      }
      
      // Verificar que usa catalogService
      if (componentContent.includes('catalogService')) {
        console.log('✅ Usa catalogService correctamente');
      } else {
        console.log('❌ NO usa catalogService');
      }
      
    } catch (e) {
      console.log('❌ Error leyendo CatalogManagement');
    }
  } else {
    console.log('❌ Componente CatalogManagement no encontrado');
  }
  
  // 5. Verificar tipos TypeScript
  const typesPath = path.join(frontendPath, 'src', 'types', 'index.ts');
  if (fs.existsSync(typesPath)) {
    console.log('✅ Tipos TypeScript encontrados');
    
    try {
      const typesContent = fs.readFileSync(typesPath, 'utf8');
      
      const requiredTypes = ['Category', 'Product', 'Space', 'Combo'];
      requiredTypes.forEach(type => {
        if (typesContent.includes(`interface ${type}`)) {
          console.log(`✅ Interfaz ${type} encontrada`);
        } else {
          console.log(`❌ Interfaz ${type} NO encontrada`);
        }
      });
      
    } catch (e) {
      console.log('❌ Error leyendo tipos TypeScript');
    }
  } else {
    console.log('❌ Tipos TypeScript no encontrados');
  }
  
  console.log('\n==========================================');
  console.log('🏁 VERIFICACIÓN DEL FRONTEND COMPLETADA');
}

checkFrontendConfig();
















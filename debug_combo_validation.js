// Script de debug para el problema de validación de combos
// Ejecuta esto en la consola del navegador cuando estés en la página del combo

console.log('🔍 DEBUG: Validación de Combo');
console.log('============================');

// 1. Verificar si hay un combo seleccionado
const comboElement = document.querySelector('[data-combo-id]');
console.log('Combo seleccionado:', comboElement);

// 2. Verificar el estado del formulario
const formElement = document.querySelector('form');
console.log('Formulario:', formElement);

// 3. Verificar botones de salsas
const sauceButtons = document.querySelectorAll('.sauce-option');
console.log('Botones de salsas encontrados:', sauceButtons.length);
sauceButtons.forEach((btn, index) => {
  console.log(`Salsa ${index + 1}:`, btn.textContent.trim(), 'Seleccionada:', btn.classList.contains('selected'));
});

// 4. Verificar botón de agregar al carrito
const addToCartBtn = document.querySelector('button[type="submit"]');
console.log('Botón agregar al carrito:', addToCartBtn);
console.log('Botón deshabilitado:', addToCartBtn?.disabled);

// 5. Verificar mensaje de error
const errorElement = document.querySelector('.error-message, [class*="error"], [class*="invalid"]');
console.log('Mensaje de error:', errorElement?.textContent);

// 6. Verificar componentes seleccionados
const componentSections = document.querySelectorAll('.component-section');
console.log('Secciones de componentes:', componentSections.length);

// 7. Función para simular clic en salsa
function selectSauce(sauceName) {
  const sauceBtn = Array.from(sauceButtons).find(btn => 
    btn.textContent.includes(sauceName)
  );
  if (sauceBtn) {
    console.log(`🌶️ Simulando clic en salsa: ${sauceName}`);
    sauceBtn.click();
    return true;
  } else {
    console.log(`❌ No se encontró la salsa: ${sauceName}`);
    return false;
  }
}

// 8. Función para verificar validación
function checkValidation() {
  console.log('🔍 Verificando validación...');
  
  // Verificar salsas seleccionadas
  const selectedSauces = document.querySelectorAll('.sauce-option.selected');
  console.log('Salsas seleccionadas:', selectedSauces.length);
  
  // Verificar componentes seleccionados
  const selectedComponents = document.querySelectorAll('.component-option.selected');
  console.log('Componentes seleccionados:', selectedComponents.length);
  
  // Verificar si el botón está habilitado
  const isEnabled = !addToCartBtn?.disabled;
  console.log('Botón habilitado:', isEnabled);
  
  return {
    sauces: selectedSauces.length,
    components: selectedComponents.length,
    enabled: isEnabled
  };
}

// 9. Función para probar selección automática
function testAutoSelection() {
  console.log('🧪 Probando selección automática...');
  
  // Seleccionar la primera salsa disponible
  if (sauceButtons.length > 0) {
    const firstSauce = sauceButtons[0];
    const sauceName = firstSauce.textContent.trim();
    console.log(`🌶️ Seleccionando primera salsa: ${sauceName}`);
    firstSauce.click();
    
    // Esperar un momento y verificar
    setTimeout(() => {
      const result = checkValidation();
      console.log('✅ Resultado después de seleccionar salsa:', result);
    }, 500);
  } else {
    console.log('❌ No hay salsas disponibles');
  }
}

// Exportar funciones para uso manual
window.debugCombo = {
  selectSauce,
  checkValidation,
  testAutoSelection
};

console.log('✅ Debug functions loaded. Usa:');
console.log('- debugCombo.checkValidation() - Verificar estado actual');
console.log('- debugCombo.selectSauce("ACEVICHADA") - Seleccionar salsa específica');
console.log('- debugCombo.testAutoSelection() - Probar selección automática');







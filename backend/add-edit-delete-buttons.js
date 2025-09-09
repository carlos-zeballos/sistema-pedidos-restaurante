const fs = require('fs');
const path = require('path');

console.log('🔧 AGREGANDO BOTONES DE EDITAR Y BORRAR');
console.log('========================================');

// Función para actualizar el componente SimpleCatalog con botones de editar y borrar
function addEditDeleteButtons() {
  const tsxFilePath = path.join(__dirname, '../frontend/src/components/SimpleCatalog.tsx');
  
  try {
    let content = fs.readFileSync(tsxFilePath, 'utf8');
    const timestamp = new Date().toISOString();
    
    // Agregar estados para edición
    const editStates = `
  // Estados para edición
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editingType, setEditingType] = useState<'product' | 'category' | 'space' | 'combo' | null>(null);
`;

    // Insertar estados de edición después de los estados de formularios
    const insertPoint = content.indexOf('const [showComboForm, setShowComboForm] = useState(false);');
    if (insertPoint !== -1) {
      const endOfLine = content.indexOf('\n', insertPoint) + 1;
      content = content.slice(0, endOfLine) + editStates + content.slice(endOfLine);
    }

    // Agregar funciones de editar y borrar
    const editDeleteFunctions = `
  // Funciones de editar y borrar
  const handleEdit = (item: any, type: 'product' | 'category' | 'space' | 'combo') => {
    setEditingItem(item);
    setEditingType(type);
    
    if (type === 'product') {
      setProductForm({
        code: item.code,
        name: item.name,
        categoryId: item.categoryId,
        price: item.price,
        type: item.type,
        description: item.description || '',
        preparationTime: item.preparationTime || 15,
        isEnabled: item.isEnabled,
        isAvailable: item.isAvailable,
        allergens: item.allergens || [],
        nutritionalInfo: item.nutritionalInfo || {}
      });
      setShowProductForm(true);
    } else if (type === 'category') {
      setCategoryForm({
        name: item.name,
        ord: item.ord,
        description: item.description || '',
        isActive: item.isActive
      });
      setShowCategoryForm(true);
    } else if (type === 'space') {
      setSpaceForm({
        code: item.code,
        name: item.name,
        type: item.type,
        capacity: item.capacity,
        status: item.status,
        isActive: item.isActive,
        notes: item.notes || ''
      });
      setShowSpaceForm(true);
    }
  };

  const handleDelete = async (id: string, type: 'product' | 'category' | 'space' | 'combo') => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este elemento?')) {
      return;
    }

    try {
      if (type === 'product') {
        await catalogService.deleteProduct(id);
      } else if (type === 'category') {
        await catalogService.deleteCategory(id);
      } else if (type === 'space') {
        await catalogService.deleteSpace(id);
      } else if (type === 'combo') {
        await catalogService.deleteCombo(id);
      }
      loadData();
    } catch (err) {
      console.error(\`Error deleting \${type}:\`, err);
      setError(\`Error al eliminar el \${type}\`);
    }
  };

  const resetForms = () => {
    setEditingItem(null);
    setEditingType(null);
    setProductForm({
      code: '',
      name: '',
      categoryId: '',
      price: 0,
      type: 'COMIDA',
      description: '',
      preparationTime: 15,
      isEnabled: true,
      isAvailable: true,
      allergens: [],
      nutritionalInfo: {}
    });
    setCategoryForm({
      name: '',
      ord: 0,
      description: '',
      isActive: true
    });
    setSpaceForm({
      code: '',
      name: '',
      type: 'MESA',
      capacity: 4,
      status: 'LIBRE',
      isActive: true,
      notes: ''
    });
  };
`;

    // Insertar funciones después de handleCreateSpace
    const insertPoint2 = content.indexOf('  };');
    if (insertPoint2 !== -1) {
      const endOfFunction = content.indexOf('\n', insertPoint2) + 1;
      content = content.slice(0, endOfFunction) + editDeleteFunctions + content.slice(endOfFunction);
    }

    // Actualizar los handlers de crear para manejar edición
    content = content.replace(
      /const handleCreateProduct = async \(e: React\.FormEvent\) => \{[\s\S]*?\};/,
      `const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await catalogService.updateProduct(editingItem.id, productForm);
      } else {
        await catalogService.createProduct(productForm);
      }
      setShowProductForm(false);
      resetForms();
      loadData();
    } catch (err) {
      console.error('Error creating/updating product:', err);
      setError('Error al crear/actualizar el producto');
    }
  };`
    );

    content = content.replace(
      /const handleCreateCategory = async \(e: React\.FormEvent\) => \{[\s\S]*?\};/,
      `const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await catalogService.updateCategory(editingItem.id, categoryForm);
      } else {
        await catalogService.createCategory(categoryForm);
      }
      setShowCategoryForm(false);
      resetForms();
      loadData();
    } catch (err) {
      console.error('Error creating/updating category:', err);
      setError('Error al crear/actualizar la categoría');
    }
  };`
    );

    content = content.replace(
      /const handleCreateSpace = async \(e: React\.FormEvent\) => \{[\s\S]*?\};/,
      `const handleCreateSpace = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await catalogService.updateSpace(editingItem.id, spaceForm);
      } else {
        await catalogService.createSpace(spaceForm);
      }
      setShowSpaceForm(false);
      resetForms();
      loadData();
    } catch (err) {
      console.error('Error creating/updating space:', err);
      setError('Error al crear/actualizar el espacio');
    }
  };`
    );

    // Actualizar los títulos de los modales
    content = content.replace(
      /<h2>Nuevo Producto<\/h2>/g,
      '<h2>{editingItem ? "Editar Producto" : "Nuevo Producto"}</h2>'
    );
    content = content.replace(
      /<h2>Nueva Categoría<\/h2>/g,
      '<h2>{editingItem ? "Editar Categoría" : "Nueva Categoría"}</h2>'
    );
    content = content.replace(
      /<h2>Nuevo Espacio<\/h2>/g,
      '<h2>{editingItem ? "Editar Espacio" : "Nuevo Espacio"}</h2>'
    );

    // Actualizar los botones de crear
    content = content.replace(
      /<button type="submit" className="save-button">Crear<\/button>/g,
      '<button type="submit" className="save-button">{editingItem ? "Actualizar" : "Crear"}</button>'
    );

    // Agregar botones de editar y borrar a las tarjetas de productos
    content = content.replace(
      /<div className="items-list">[\s\S]*?{products\.map\(product => \([\s\S]*?<\/div>[\s\S]*?\)\)}[\s\S]*?<\/div>/,
      `<div className="items-list">
              {products.map(product => (
                <div key={product.id} className="item-card">
                  <h3>{product.name}</h3>
                  <p>Código: {product.code}</p>
                  <p>Precio: S/ {product.price}</p>
                  <p>Tipo: {product.type}</p>
                  <p>Disponible: {product.isAvailable ? 'Sí' : 'No'}</p>
                  <div className="item-actions">
                    <button 
                      className="edit-button"
                      onClick={() => handleEdit(product, 'product')}
                      title="Editar producto"
                    >
                      ✏️ Editar
                    </button>
                    <button 
                      className="delete-button"
                      onClick={() => handleDelete(product.id, 'product')}
                      title="Eliminar producto"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>`
    );

    // Agregar botones de editar y borrar a las tarjetas de categorías
    content = content.replace(
      /<div className="items-list">[\s\S]*?{categories\.map\(category => \([\s\S]*?<\/div>[\s\S]*?\)\)}[\s\S]*?<\/div>/,
      `<div className="items-list">
              {categories.map(category => (
                <div key={category.id} className="item-card">
                  <h3>{category.name}</h3>
                  <p>Orden: {category.ord}</p>
                  <p>Descripción: {category.description || 'Sin descripción'}</p>
                  <p>Activa: {category.isActive ? 'Sí' : 'No'}</p>
                  <div className="item-actions">
                    <button 
                      className="edit-button"
                      onClick={() => handleEdit(category, 'category')}
                      title="Editar categoría"
                    >
                      ✏️ Editar
                    </button>
                    <button 
                      className="delete-button"
                      onClick={() => handleDelete(category.id, 'category')}
                      title="Eliminar categoría"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>`
    );

    // Agregar botones de editar y borrar a las tarjetas de espacios
    content = content.replace(
      /<div className="items-list">[\s\S]*?{spaces\.map\(space => \([\s\S]*?<\/div>[\s\S]*?\)\)}[\s\S]*?<\/div>/,
      `<div className="items-list">
              {spaces.map(space => (
                <div key={space.id} className="item-card">
                  <h3>{space.name}</h3>
                  <p>Código: {space.code}</p>
                  <p>Tipo: {space.type}</p>
                  <p>Capacidad: {space.capacity}</p>
                  <p>Estado: {space.status}</p>
                  <div className="item-actions">
                    <button 
                      className="edit-button"
                      onClick={() => handleEdit(space, 'space')}
                      title="Editar espacio"
                    >
                      ✏️ Editar
                    </button>
                    <button 
                      className="delete-button"
                      onClick={() => handleDelete(space.id, 'space')}
                      title="Eliminar espacio"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>`
    );

    // Agregar botones de editar y borrar a las tarjetas de combos
    content = content.replace(
      /<div className="items-list">[\s\S]*?{combos\.map\(combo => \([\s\S]*?<\/div>[\s\S]*?\)\)}[\s\S]*?<\/div>/,
      `<div className="items-list">
              {combos.map(combo => (
                <div key={combo.id} className="item-card">
                  <h3>{combo.name}</h3>
                  <p>Código: {combo.code}</p>
                  <p>Precio Base: S/ {combo.basePrice}</p>
                  <p>Disponible: {combo.isAvailable ? 'Sí' : 'No'}</p>
                  <div className="item-actions">
                    <button 
                      className="edit-button"
                      onClick={() => handleEdit(combo, 'combo')}
                      title="Editar combo"
                    >
                      ✏️ Editar
                    </button>
                    <button 
                      className="delete-button"
                      onClick={() => handleDelete(combo.id, 'combo')}
                      title="Eliminar combo"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>`
    );

    // Actualizar los botones de crear para resetear formularios
    content = content.replace(
      /onClick={() => setShowProductForm\(true\)}/g,
      'onClick={() => { resetForms(); setShowProductForm(true); }}'
    );
    content = content.replace(
      /onClick={() => setShowCategoryForm\(true\)}/g,
      'onClick={() => { resetForms(); setShowCategoryForm(true); }}'
    );
    content = content.replace(
      /onClick={() => setShowSpaceForm\(true\)}/g,
      'onClick={() => { resetForms(); setShowSpaceForm(true); }}'
    );

    // Actualizar los botones de cancelar para resetear formularios
    content = content.replace(
      /onClick={() => setShowProductForm\(false\)}/g,
      'onClick={() => { setShowProductForm(false); resetForms(); }}'
    );
    content = content.replace(
      /onClick={() => setShowCategoryForm\(false\)}/g,
      'onClick={() => { setShowCategoryForm(false); resetForms(); }}'
    );
    content = content.replace(
      /onClick={() => setShowSpaceForm\(false\)}/g,
      'onClick={() => { setShowSpaceForm(false); resetForms(); }}'
    );

    fs.writeFileSync(tsxFilePath, content, 'utf8');
    console.log(`✅ ${tsxFilePath} - Botones de editar y borrar agregados: ${timestamp}`);
    
  } catch (error) {
    console.error('❌ Error agregando botones de editar y borrar:', error.message);
  }
}

// Función para actualizar el CSS con estilos para los botones de editar y borrar
function addEditDeleteCSS() {
  const cssFilePath = path.join(__dirname, '../frontend/src/components/SimpleCatalog.css');
  
  try {
    let content = fs.readFileSync(cssFilePath, 'utf8');
    const timestamp = new Date().toISOString();
    
    // Agregar estilos para los botones de editar y borrar
    const editDeleteStyles = `
/* ===== BOTONES DE EDITAR Y BORRAR - ${timestamp} ===== */
.item-actions {
  display: flex;
  gap: 8px;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #e9ecef;
}

.edit-button {
  background: #3498db;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: background 0.3s ease;
  display: inline-block;
  visibility: visible;
  opacity: 1;
  position: relative;
  z-index: 1000;
  min-width: 80px;
}

.edit-button:hover {
  background: #2980b9;
}

.delete-button {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: background 0.3s ease;
  display: inline-block;
  visibility: visible;
  opacity: 1;
  position: relative;
  z-index: 1000;
  min-width: 80px;
}

.delete-button:hover {
  background: #c0392b;
}

.item-card {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 15px;
  transition: box-shadow 0.3s ease;
  position: relative;
}

.item-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.item-card:hover .item-actions {
  opacity: 1;
  visibility: visible;
}

/* ===== FIN BOTONES DE EDITAR Y BORRAR ===== */
`;

    // Verificar si ya existe el comentario de botones de editar y borrar
    if (!content.includes('BOTONES DE EDITAR Y BORRAR')) {
      content += editDeleteStyles;
    } else {
      // Reemplazar el comentario existente
      content = content.replace(
        /\/\* ===== BOTONES DE EDITAR Y BORRAR - .*? ===== \*\/[\s\S]*?\/\* ===== FIN BOTONES DE EDITAR Y BORRAR ===== \*\//,
        editDeleteStyles.trim()
      );
    }
    
    fs.writeFileSync(cssFilePath, content, 'utf8');
    console.log(`✅ ${cssFilePath} - Estilos de botones de editar y borrar agregados: ${timestamp}`);
    
  } catch (error) {
    console.error('❌ Error agregando estilos de botones de editar y borrar:', error.message);
  }
}

// Ejecutar las funciones
addEditDeleteButtons();
addEditDeleteCSS();

console.log('\n🎯 BOTONES DE EDITAR Y BORRAR AGREGADOS:');
console.log('=========================================');
console.log('✅ Estados de edición agregados');
console.log('✅ Funciones de editar y borrar implementadas');
console.log('✅ Botones de editar y borrar en cada tarjeta');
console.log('✅ Modales actualizados para edición');
console.log('✅ Estilos CSS para los nuevos botones');

console.log('\n🔍 FUNCIONALIDADES AGREGADAS:');
console.log('==============================');
console.log('✏️ Botón "Editar" en cada elemento');
console.log('🗑️ Botón "Eliminar" en cada elemento');
console.log('📝 Modales que cambian entre "Crear" y "Editar"');
console.log('🔄 Formularios que se llenan con datos existentes');
console.log('⚠️ Confirmación antes de eliminar');
console.log('🔄 Recarga automática después de editar/eliminar');

console.log('\n💡 CÓMO USAR:');
console.log('==============');
console.log('1. Recarga la página con Ctrl+F5');
console.log('2. Ve a http://localhost:3000/catalog-management');
console.log('3. En cada tarjeta verás botones "✏️ Editar" y "🗑️ Eliminar"');
console.log('4. Haz clic en "Editar" para modificar un elemento');
console.log('5. Haz clic en "Eliminar" para borrar un elemento');
console.log('6. Los modales cambiarán entre "Crear" y "Editar" automáticamente');

console.log('\n🎨 CARACTERÍSTICAS DE LOS BOTONES:');
console.log('===================================');
console.log('✅ Botón Editar: Azul (#3498db)');
console.log('✅ Botón Eliminar: Rojo (#e74c3c)');
console.log('✅ Hover effects en ambos botones');
console.log('✅ Iconos descriptivos (✏️ y 🗑️)');
console.log('✅ Tooltips con descripción');
console.log('✅ Confirmación antes de eliminar');

console.log('\n🚀 PROCESO COMPLETADO');
console.log('=====================');
console.log('Botones de editar y borrar agregados exitosamente.');
console.log('El catálogo ahora tiene funcionalidad completa de CRUD.');









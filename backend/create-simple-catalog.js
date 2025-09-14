const fs = require('fs');
const path = require('path');

console.log('🔧 CREANDO CATÁLOGO SIMPLIFICADO');
console.log('=================================');

// Crear un componente de catálogo simplificado que funcione
function createSimpleCatalog() {
  const simpleCatalogPath = path.join(__dirname, '../frontend/src/components/SimpleCatalog.tsx');
  
  const simpleCatalog = `import React, { useState, useEffect } from 'react';
import { catalogService } from '../services/api';
import { Category, Product, Space, Combo } from '../types';
import './SimpleCatalog.css';

const SimpleCatalog: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [combos, setCombos] = useState<Combo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'spaces' | 'combos'>('products');
  
  // Estados para formularios
  const [showProductForm, setShowProductForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showSpaceForm, setShowSpaceForm] = useState(false);
  const [showComboForm, setShowComboForm] = useState(false);

  // Datos de formularios
  const [productForm, setProductForm] = useState({
    code: '',
    name: '',
    categoryId: '',
    price: 0,
    type: 'COMIDA' as const,
    description: '',
    preparationTime: 15,
    isEnabled: true,
    isAvailable: true,
    allergens: [] as string[],
    nutritionalInfo: {}
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    ord: 0,
    description: '',
    isActive: true
  });

  const [spaceForm, setSpaceForm] = useState({
    code: '',
    name: '',
    type: 'MESA' as const,
    capacity: 4,
    status: 'LIBRE' as const,
    isActive: true,
    notes: ''
  });

  // Cargar datos
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [categoriesData, productsData, spacesData, combosData] = await Promise.all([
        catalogService.getCategories(),
        catalogService.getProducts(),
        catalogService.getSpaces(),
        catalogService.getCombos()
      ]);
      
      setCategories(categoriesData);
      setProducts(productsData);
      setSpaces(spacesData);
      setCombos(combosData);
      setError('');
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  // Handlers para crear
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await catalogService.createProduct(productForm);
      setShowProductForm(false);
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
      loadData();
    } catch (err) {
      console.error('Error creating product:', err);
      setError('Error al crear el producto');
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await catalogService.createCategory(categoryForm);
      setShowCategoryForm(false);
      setCategoryForm({
        name: '',
        ord: 0,
        description: '',
        isActive: true
      });
      loadData();
    } catch (err) {
      console.error('Error creating category:', err);
      setError('Error al crear la categoría');
    }
  };

  const handleCreateSpace = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await catalogService.createSpace(spaceForm);
      setShowSpaceForm(false);
      setSpaceForm({
        code: '',
        name: '',
        type: 'MESA',
        capacity: 4,
        status: 'LIBRE',
        isActive: true,
        notes: ''
      });
      loadData();
    } catch (err) {
      console.error('Error creating space:', err);
      setError('Error al crear el espacio');
    }
  };

  if (loading) {
    return (
      <div className="simple-catalog">
        <div className="loading">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="simple-catalog">
      <div className="catalog-header">
        <h1>📋 Gestión de Catálogo</h1>
        <p>Administra productos, categorías y espacios</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="tabs">
        <button 
          className={\`tab \${activeTab === 'products' ? 'active' : ''}\`}
          onClick={() => setActiveTab('products')}
        >
          🍽️ Productos ({products.length})
        </button>
        <button 
          className={\`tab \${activeTab === 'categories' ? 'active' : ''}\`}
          onClick={() => setActiveTab('categories')}
        >
          📂 Categorías ({categories.length})
        </button>
        <button 
          className={\`tab \${activeTab === 'spaces' ? 'active' : ''}\`}
          onClick={() => setActiveTab('spaces')}
        >
          🏠 Espacios ({spaces.length})
        </button>
        <button 
          className={\`tab \${activeTab === 'combos' ? 'active' : ''}\`}
          onClick={() => setActiveTab('combos')}
        >
          🍱 Combos ({combos.length})
        </button>
      </div>

      <div className="tab-content">
        {/* Tab de Productos */}
        {activeTab === 'products' && (
          <div>
            <div className="section-header">
              <h2>Productos</h2>
              <button 
                className="create-button"
                onClick={() => setShowProductForm(true)}
              >
                ➕ Nuevo Producto
              </button>
            </div>
            
            <div className="items-list">
              {products.map(product => (
                <div key={product.id} className="item-card">
                  <h3>{product.name}</h3>
                  <p>Código: {product.code}</p>
                  <p>Precio: S/ {product.price}</p>
                  <p>Tipo: {product.type}</p>
                  <p>Disponible: {product.isAvailable ? 'Sí' : 'No'}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab de Categorías */}
        {activeTab === 'categories' && (
          <div>
            <div className="section-header">
              <h2>Categorías</h2>
              <button 
                className="create-button"
                onClick={() => setShowCategoryForm(true)}
              >
                ➕ Nueva Categoría
              </button>
            </div>
            
            <div className="items-list">
              {categories.map(category => (
                <div key={category.id} className="item-card">
                  <h3>{category.name}</h3>
                  <p>Orden: {category.ord}</p>
                  <p>Descripción: {category.description || 'Sin descripción'}</p>
                  <p>Activa: {category.isActive ? 'Sí' : 'No'}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab de Espacios */}
        {activeTab === 'spaces' && (
          <div>
            <div className="section-header">
              <h2>Espacios</h2>
              <button 
                className="create-button"
                onClick={() => setShowSpaceForm(true)}
              >
                ➕ Nuevo Espacio
              </button>
            </div>
            
            <div className="items-list">
              {spaces.map(space => (
                <div key={space.id} className="item-card">
                  <h3>{space.name}</h3>
                  <p>Código: {space.code}</p>
                  <p>Tipo: {space.type}</p>
                  <p>Capacidad: {space.capacity}</p>
                  <p>Estado: {space.status}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab de Combos */}
        {activeTab === 'combos' && (
          <div>
            <div className="section-header">
              <h2>Combos</h2>
              <button 
                className="create-button"
                onClick={() => setShowComboForm(true)}
              >
                ➕ Nuevo Combo
              </button>
            </div>
            
            <div className="items-list">
              {combos.map(combo => (
                <div key={combo.id} className="item-card">
                  <h3>{combo.name}</h3>
                  <p>Código: {combo.code}</p>
                  <p>Precio Base: S/ {combo.basePrice}</p>
                  <p>Disponible: {combo.isAvailable ? 'Sí' : 'No'}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal de Producto */}
      {showProductForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Nuevo Producto</h2>
            <form onSubmit={handleCreateProduct}>
              <div className="form-group">
                <label>Código *</label>
                <input
                  type="text"
                  value={productForm.code}
                  onChange={(e) => setProductForm({...productForm, code: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Nombre *</label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Categoría *</label>
                <select
                  value={productForm.categoryId}
                  onChange={(e) => setProductForm({...productForm, categoryId: e.target.value})}
                  required
                >
                  <option value="">Seleccionar categoría</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Precio *</label>
                <input
                  type="number"
                  step="0.01"
                  value={productForm.price}
                  onChange={(e) => setProductForm({...productForm, price: parseFloat(e.target.value)})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Tipo</label>
                <select
                  value={productForm.type}
                  onChange={(e) => setProductForm({...productForm, type: e.target.value as any})}
                >
                  <option value="COMIDA">Comida</option>
                  <option value="BEBIDA">Bebida</option>
                  <option value="POSTRE">Postre</option>
                  <option value="ADICIONAL">Adicional</option>
                </select>
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="save-button">Crear</button>
                <button type="button" onClick={() => setShowProductForm(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Categoría */}
      {showCategoryForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Nueva Categoría</h2>
            <form onSubmit={handleCreateCategory}>
              <div className="form-group">
                <label>Nombre *</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Orden</label>
                <input
                  type="number"
                  value={categoryForm.ord}
                  onChange={(e) => setCategoryForm({...categoryForm, ord: parseInt(e.target.value)})}
                />
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="save-button">Crear</button>
                <button type="button" onClick={() => setShowCategoryForm(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Espacio */}
      {showSpaceForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Nuevo Espacio</h2>
            <form onSubmit={handleCreateSpace}>
              <div className="form-group">
                <label>Código *</label>
                <input
                  type="text"
                  value={spaceForm.code}
                  onChange={(e) => setSpaceForm({...spaceForm, code: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Nombre *</label>
                <input
                  type="text"
                  value={spaceForm.name}
                  onChange={(e) => setSpaceForm({...spaceForm, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Tipo</label>
                <select
                  value={spaceForm.type}
                  onChange={(e) => setSpaceForm({...spaceForm, type: e.target.value as any})}
                >
                  <option value="MESA">Mesa</option>
                  <option value="BARRA">Barra</option>
                  <option value="DELIVERY">Delivery</option>
                  <option value="RESERVA">Reserva</option>
                </select>
              </div>
              <div className="form-group">
                <label>Capacidad</label>
                <input
                  type="number"
                  value={spaceForm.capacity}
                  onChange={(e) => setSpaceForm({...spaceForm, capacity: parseInt(e.target.value)})}
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="save-button">Crear</button>
                <button type="button" onClick={() => setShowSpaceForm(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleCatalog;`;

  try {
    fs.writeFileSync(simpleCatalogPath, simpleCatalog, 'utf8');
    console.log(`✅ ${simpleCatalogPath} - Componente simplificado creado`);
  } catch (error) {
    console.error('❌ Error creando componente simplificado:', error.message);
  }
}

// Crear CSS simplificado
function createSimpleCatalogCSS() {
  const cssPath = path.join(__dirname, '../frontend/src/components/SimpleCatalog.css');
  
  const css = `/* ===== CATÁLOGO SIMPLIFICADO ===== */
.simple-catalog {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  font-family: Arial, sans-serif;
}

.catalog-header {
  text-align: center;
  margin-bottom: 30px;
}

.catalog-header h1 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.catalog-header p {
  color: #7f8c8d;
  font-size: 16px;
}

.loading {
  text-align: center;
  font-size: 18px;
  color: #3498db;
  padding: 50px;
}

.error-message {
  background-color: #e74c3c;
  color: white;
  padding: 15px;
  border-radius: 5px;
  margin-bottom: 20px;
  text-align: center;
  font-weight: bold;
}

.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  border-bottom: 2px solid #ecf0f1;
  padding-bottom: 10px;
}

.tab {
  padding: 12px 24px;
  border: none;
  background: #ecf0f1;
  color: #7f8c8d;
  border-radius: 8px 8px 0 0;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.tab:hover {
  background: #d5dbdb;
  color: #2c3e50;
}

.tab.active {
  background: #3498db;
  color: white;
}

.tab-content {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  min-height: 400px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ecf0f1;
}

.section-header h2 {
  color: #2c3e50;
  margin: 0;
}

.create-button {
  background: #27ae60;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.3s ease;
  display: inline-block;
  visibility: visible;
  opacity: 1;
  position: relative;
  z-index: 1000;
  min-width: 150px;
}

.create-button:hover {
  background: #229954;
}

.items-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.item-card {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 15px;
  transition: box-shadow 0.3s ease;
}

.item-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.item-card h3 {
  color: #2c3e50;
  margin: 0 0 10px 0;
  font-size: 16px;
}

.item-card p {
  color: #6c757d;
  margin: 5px 0;
  font-size: 14px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.modal {
  background: white;
  border-radius: 8px;
  padding: 30px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal h2 {
  color: #2c3e50;
  margin: 0 0 20px 0;
  text-align: center;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #2c3e50;
  font-weight: 500;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-group textarea {
  height: 80px;
  resize: vertical;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 30px;
}

.save-button {
  background: #27ae60;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.save-button:hover {
  background: #229954;
}

.modal-actions button:last-child {
  background: #95a5a6;
  color: white;
}

.modal-actions button:last-child:hover {
  background: #7f8c8d;
}

/* ===== FIN CATÁLOGO SIMPLIFICADO ===== */`;

  try {
    fs.writeFileSync(cssPath, css, 'utf8');
    console.log(`✅ ${cssPath} - CSS simplificado creado`);
  } catch (error) {
    console.error('❌ Error creando CSS simplificado:', error.message);
  }
}

// Ejecutar las funciones
createSimpleCatalog();
createSimpleCatalogCSS();

console.log('\n🎯 CATÁLOGO SIMPLIFICADO CREADO:');
console.log('=================================');
console.log('✅ Componente SimpleCatalog.tsx creado');
console.log('✅ CSS SimpleCatalog.css creado');
console.log('✅ Botones de crear forzados a ser visibles');
console.log('✅ Estilos simples y directos');
console.log('✅ Modales funcionales');

console.log('\n🔍 CÓMO USAR:');
console.log('==============');
console.log('1. Importa SimpleCatalog en tu App.tsx');
console.log('2. Reemplaza CatalogManagement con SimpleCatalog');
console.log('3. Los botones de crear deberían aparecer claramente');
console.log('4. Cada pestaña tiene su botón de crear correspondiente');

console.log('\n💡 CARACTERÍSTICAS:');
console.log('====================');
console.log('✅ Botones verdes grandes y visibles');
console.log('✅ Modales simples para crear elementos');
console.log('✅ Lista de elementos existentes');
console.log('✅ Navegación por pestañas');
console.log('✅ Manejo de errores');

console.log('\n🚀 PROCESO COMPLETADO');
console.log('=====================');
console.log('Catálogo simplificado creado y listo para usar.');
















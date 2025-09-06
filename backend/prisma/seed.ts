import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  try {
    // Usar transacción para asegurar consistencia
    await prisma.$transaction(async (tx) => {
      // Crear usuarios con contraseña hasheada
      const hashedPassword = await bcrypt.hash('admin', 10);

      const users = await Promise.all([
        tx.user.upsert({
          where: { email: 'admin@restaurant.com' },
          update: {},
          create: {
            firstName: 'Administrador',
            lastName: 'Sistema',
            email: 'admin@restaurant.com',
            phone: '+1234567890',
            password: hashedPassword,
            role: 'ADMIN',
            isActive: true
          }
        }),
        tx.user.upsert({
          where: { email: 'mozo@restaurant.com' },
          update: {},
          create: {
            firstName: 'Mesero',
            lastName: 'Principal',
            email: 'mozo@restaurant.com',
            phone: '+1234567891',
            password: hashedPassword,
            role: 'MOZO',
            isActive: true
          }
        }),
        tx.user.upsert({
          where: { email: 'cocinero@restaurant.com' },
          update: {},
          create: {
            firstName: 'Cocinero',
            lastName: 'Chef',
            email: 'cocinero@restaurant.com',
            phone: '+1234567892',
            password: hashedPassword,
            role: 'COCINERO',
            isActive: true
          }
        }),
        tx.user.upsert({
          where: { email: 'caja@restaurant.com' },
          update: {},
          create: {
            firstName: 'Cajero',
            lastName: 'Sistema',
            email: 'caja@restaurant.com',
            phone: '+1234567893',
            password: hashedPassword,
            role: 'CAJA',
            isActive: true
          }
        }),
        tx.user.upsert({
          where: { email: 'barra@restaurant.com' },
          update: {},
          create: {
            firstName: 'Bartender',
            lastName: 'Barra',
            email: 'barra@restaurant.com',
            phone: '+1234567894',
            password: hashedPassword,
            role: 'BARRA',
            isActive: true
          }
        })
      ]);

      // Crear espacios (mesas, barra, delivery)
      const spaces = await Promise.all([
        // 3 Mesas
        ...Array.from({ length: 3 }, (_, i) => i + 1).map(number =>
          tx.space.upsert({
            where: { code: `MESA_${number}` },
            update: {},
            create: {
              code: `MESA_${number}`,
              name: `Mesa ${number}`,
              type: 'MESA',
              capacity: 4,
              status: 'LIBRE',
              isActive: true
            }
          })
        ),
        // 2 Puestos de barra
        ...Array.from({ length: 2 }, (_, i) => i + 1).map(number =>
          tx.space.upsert({
            where: { code: `BARRA_${number}` },
            update: {},
            create: {
              code: `BARRA_${number}`,
              name: `Barra ${number}`,
              type: 'BARRA',
              capacity: 1,
              status: 'LIBRE',
              isActive: true
            }
          })
        ),
        // 5 Espacios para delivery
        ...Array.from({ length: 5 }, (_, i) => i + 1).map(number =>
          tx.space.upsert({
            where: { code: `DELIVERY_${number}` },
            update: {},
            create: {
              code: `DELIVERY_${number}`,
              name: `Delivery ${number}`,
              type: 'DELIVERY',
              capacity: null,
              status: 'LIBRE',
              isActive: true
            }
          })
        )
      ]);

      // Crear categorías
      const categories = await Promise.all([
        tx.category.upsert({
          where: { code: 'COMIDAS' },
          update: {},
          create: {
            code: 'COMIDAS',
            name: 'Comidas Principales',
            description: 'Platos principales del restaurante',
            ord: 1,
            isActive: true
          }
        }),
        tx.category.upsert({
          where: { code: 'BEBIDAS' },
          update: {},
          create: {
            code: 'BEBIDAS',
            name: 'Bebidas',
            description: 'Bebidas y refrescos',
            ord: 2,
            isActive: true
          }
        }),
        tx.category.upsert({
          where: { code: 'POSTRES' },
          update: {},
          create: {
            code: 'POSTRES',
            name: 'Postres',
            description: 'Postres y dulces',
            ord: 3,
            isActive: true
          }
        }),
        tx.category.upsert({
          where: { code: 'COMBOS' },
          update: {},
          create: {
            code: 'COMBOS',
            name: 'Combos',
            description: 'Combos especiales',
            ord: 4,
            isActive: true
          }
        })
      ]);

      // Crear productos
      const products = await Promise.all([
        tx.product.upsert({
          where: { code: 'HAMBURGUESA' },
          update: {},
          create: {
            code: 'HAMBURGUESA',
            name: 'Hamburguesa Clásica',
            description: 'Hamburguesa con carne, lechuga, tomate y queso',
            price: 12.99,
            type: 'COMIDA',
            categoryId: categories[0].id,
            preparationTime: 15,
            isAvailable: true,
            isEnabled: true,
            allergens: ['gluten', 'lacteos'],
            nutritionalInfo: { calories: 450, protein: 25, carbs: 35, fat: 20 }
          }
        }),
        tx.product.upsert({
          where: { code: 'PAPAS' },
          update: {},
          create: {
            code: 'PAPAS',
            name: 'Papas Fritas',
            description: 'Papas fritas crujientes',
            price: 4.99,
            type: 'COMIDA',
            categoryId: categories[0].id,
            preparationTime: 8,
            isAvailable: true,
            isEnabled: true,
            allergens: ['gluten'],
            nutritionalInfo: { calories: 300, protein: 4, carbs: 40, fat: 15 }
          }
        }),
        tx.product.upsert({
          where: { code: 'COCA' },
          update: {},
          create: {
            code: 'COCA',
            name: 'Coca Cola',
            description: 'Refresco Coca Cola 500ml',
            price: 2.99,
            type: 'BEBIDA',
            categoryId: categories[1].id,
            preparationTime: 1,
            isAvailable: true,
            isEnabled: true,
            allergens: [],
            nutritionalInfo: { calories: 200, protein: 0, carbs: 50, fat: 0 }
          }
        }),
        tx.product.upsert({
          where: { code: 'HELADO' },
          update: {},
          create: {
            code: 'HELADO',
            name: 'Helado de Vainilla',
            description: 'Helado de vainilla con toppings',
            price: 3.99,
            type: 'POSTRE',
            categoryId: categories[2].id,
            preparationTime: 3,
            isAvailable: true,
            isEnabled: true,
            allergens: ['lacteos'],
            nutritionalInfo: { calories: 250, protein: 4, carbs: 30, fat: 12 }
          }
        })
      ]);

      // Crear combos
      const combos = await Promise.all([
        tx.combo.upsert({
          where: { code: 'COMBO_1' },
          update: {},
          create: {
            code: 'COMBO_1',
            name: 'Combo Clásico',
            description: 'Hamburguesa + Papas + Bebida',
            basePrice: 18.99,
            categoryId: categories[3].id,
            preparationTime: 20,
            isAvailable: true,
            isEnabled: true,
            maxSelections: 3
          }
        }),
        tx.combo.upsert({
          where: { code: 'COMBO_2' },
          update: {},
          create: {
            code: 'COMBO_2',
            name: 'Combo Familiar',
            description: '2 Hamburguesas + 2 Papas + 2 Bebidas + Postre',
            basePrice: 32.99,
            categoryId: categories[3].id,
            preparationTime: 25,
            isAvailable: true,
            isEnabled: true,
            maxSelections: 4
          }
        })
      ]);

      // Crear componentes de combos
      const comboComponents = await Promise.all([
        // Componentes del Combo 1
        tx.comboComponent.upsert({
          where: { id: 'temp-1' },
          update: {},
          create: {
            id: 'temp-1',
            comboId: combos[0].id,
            type: 'SABOR',
            name: 'Hamburguesa Clásica',
            description: 'Hamburguesa con carne, lechuga, tomate y queso',
            price: 0,
            isAvailable: true,
            ord: 1
          }
        }),
        tx.comboComponent.upsert({
          where: { id: 'temp-2' },
          update: {},
          create: {
            id: 'temp-2',
            comboId: combos[0].id,
            type: 'COMPLEMENTO',
            name: 'Papas Fritas',
            description: 'Papas fritas crujientes',
            price: 0,
            isAvailable: true,
            ord: 2
          }
        }),
        tx.comboComponent.upsert({
          where: { id: 'temp-3' },
          update: {},
          create: {
            id: 'temp-3',
            comboId: combos[0].id,
            type: 'BEBIDA',
            name: 'Coca Cola',
            description: 'Refresco Coca Cola 500ml',
            price: 0,
            isAvailable: true,
            ord: 3
          }
        })
      ]);

      console.log(`👥 Usuarios creados: ${users.map(u => `${u.firstName} ${u.lastName}`).join(', ')}`);
      console.log(`🪑 Espacios creados: ${spaces.map(s => s.name).join(', ')}`);
      console.log(`📂 Categorías creadas: ${categories.map(c => c.name).join(', ')}`);
      console.log(`🍔 Productos creados: ${products.map(p => p.name).join(', ')}`);
      console.log(`🎁 Combos creados: ${combos.map(c => c.name).join(', ')}`);
      console.log(`🔧 Componentes de combo creados: ${comboComponents.length}`);

    });

    console.log('✅ Seed completado exitosamente!');
  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

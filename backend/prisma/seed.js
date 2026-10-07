import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Users
  const hashedPassword = await bcrypt.hash("admin123", 10);
  const owner = await prisma.user.upsert({
    where: { email: "owner@restaurant.com" },
    update: {},
    create: {
      email: "owner@restaurant.com",
      name: "Owner User",
      password: hashedPassword,
      role: "OWNER",
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: "manager@restaurant.com" },
    update: {},
    create: {
      email: "manager@restaurant.com",
      name: "Manager User",
      password: hashedPassword,
      role: "MANAGER",
    },
  });

  const chef = await prisma.user.upsert({
    where: { email: "chef@restaurant.com" },
    update: {},
    create: {
      email: "chef@restaurant.com",
      name: "Chef Gordon",
      password: hashedPassword,
      role: "CHEF",
    },
  });

  const waiter = await prisma.user.upsert({
    where: { email: "waiter@restaurant.com" },
    update: {},
    create: {
      email: "waiter@restaurant.com",
      name: "John Waiter",
      password: hashedPassword,
      role: "WAITER",
    },
  });

  // 2. Tables
  const tables = [
    { tableNumber: "T-01", capacity: 2, status: "AVAILABLE", location: "Main Dining" },
    { tableNumber: "T-02", capacity: 4, status: "AVAILABLE", location: "Main Dining" },
    { tableNumber: "T-03", capacity: 4, status: "OCCUPIED", location: "Main Dining" },
    { tableNumber: "T-04", capacity: 6, status: "RESERVED", location: "Patio" },
    { tableNumber: "T-05", capacity: 2, status: "AVAILABLE", location: "Patio" },
  ];

  for (const t of tables) {
    await prisma.table.upsert({
      where: { tableNumber: t.tableNumber },
      update: {},
      create: t,
    });
  }

  // 3. Categories
  const catAppetizers = await prisma.category.upsert({
    where: { name: "Appetizers" },
    update: {},
    create: { name: "Appetizers", description: "Starters and snacks" },
  });

  const catMains = await prisma.category.upsert({
    where: { name: "Main Course" },
    update: {},
    create: { name: "Main Course", description: "Hearty main dishes" },
  });

  const catBeverages = await prisma.category.upsert({
    where: { name: "Beverages" },
    update: {},
    create: { name: "Beverages", description: "Hot and cold drinks" },
  });

  // 4. Suppliers
  const supplier1 = await prisma.supplier.create({
    data: {
      name: "Fresh Veggie Corp",
      contactPerson: "Alice Smith",
      email: "alice@freshveggie.com",
      phone: "+1-555-0101",
      address: "123 Farm Rd, Valley",
    },
  }).catch(() => null);

  const supplier2 = await prisma.supplier.create({
    data: {
      name: "Prime Meat Traders",
      contactPerson: "Bob Johnson",
      email: "bob@primemeat.com",
      phone: "+1-555-0202",
      address: "456 Meat Market St",
    },
  }).catch(() => null);

  // 5. Ingredients
  const ingTomato = await prisma.ingredient.upsert({
    where: { name: "Tomatoes" },
    update: {},
    create: { name: "Tomatoes", unit: "kg", currentStock: 25.0, minStockLevel: 5.0, costPerUnit: 2.5 },
  });

  const ingCheese = await prisma.ingredient.upsert({
    where: { name: "Mozzarella Cheese" },
    update: {},
    create: { name: "Mozzarella Cheese", unit: "kg", currentStock: 12.0, minStockLevel: 3.0, costPerUnit: 8.0 },
  });

  const ingFlour = await prisma.ingredient.upsert({
    where: { name: "Pizza Flour" },
    update: {},
    create: { name: "Pizza Flour", unit: "kg", currentStock: 50.0, minStockLevel: 10.0, costPerUnit: 1.2 },
  });

  const ingChicken = await prisma.ingredient.upsert({
    where: { name: "Chicken Breast" },
    update: {},
    create: { name: "Chicken Breast", unit: "kg", currentStock: 18.0, minStockLevel: 5.0, costPerUnit: 6.5 },
  });

  // 6. Menu Items
  const pizza = await prisma.menuItem.create({
    data: {
      name: "Margherita Pizza",
      description: "Classic pizza with fresh mozzarella and tomato sauce",
      price: 12.99,
      prepTimeMinutes: 15,
      categoryId: catMains.id,
    },
  }).catch(() => null);

  const burger = await prisma.menuItem.create({
    data: {
      name: "Grilled Chicken Burger",
      description: "Juicy chicken patty with lettuce and specialty sauce",
      price: 10.99,
      prepTimeMinutes: 12,
      categoryId: catMains.id,
    },
  }).catch(() => null);

  // 7. Recipe Mapping
  if (pizza) {
    await prisma.recipeItem.upsert({
      where: { menuItemId_ingredientId: { menuItemId: pizza.id, ingredientId: ingTomato.id } },
      update: {},
      create: { menuItemId: pizza.id, ingredientId: ingTomato.id, quantityRequired: 0.2, unit: "kg" },
    });
    await prisma.recipeItem.upsert({
      where: { menuItemId_ingredientId: { menuItemId: pizza.id, ingredientId: ingCheese.id } },
      update: {},
      create: { menuItemId: pizza.id, ingredientId: ingCheese.id, quantityRequired: 0.15, unit: "kg" },
    });
    await prisma.recipeItem.upsert({
      where: { menuItemId_ingredientId: { menuItemId: pizza.id, ingredientId: ingFlour.id } },
      update: {},
      create: { menuItemId: pizza.id, ingredientId: ingFlour.id, quantityRequired: 0.25, unit: "kg" },
    });
  }

  // 8. Expense Categories
  const expCatRent = await prisma.expenseCategory.upsert({
    where: { name: "Rent & Utilities" },
    update: {},
    create: { name: "Rent & Utilities", description: "Monthly facility expenses" },
  });

  const expCatSupplies = await prisma.expenseCategory.upsert({
    where: { name: "Supplies" },
    update: {},
    create: { name: "Supplies", description: "Raw ingredients and kitchen supplies" },
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

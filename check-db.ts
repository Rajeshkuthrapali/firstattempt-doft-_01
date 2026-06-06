import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const productCount = await prisma.product.count();
  const customerCount = await prisma.customer.count();
  const orderCount = await prisma.order.count();
  
  console.log(`Products: ${productCount}`);
  console.log(`Customers: ${customerCount}`);
  console.log(`Orders: ${orderCount}`);
  
  if (productCount === 0 && customerCount === 0 && orderCount === 0) {
    console.log("Database appears to be empty.");
  } else {
    console.log("Database is NOT empty.");
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });

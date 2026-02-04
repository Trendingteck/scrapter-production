import { PrismaClient } from "@scrapter/database";

const prisma = new PrismaClient();

async function check() {
  console.log("🔍 Starting API & DB verification...");

  try {
    // 1. Check DB Connection
    await prisma.$connect();
    console.log("✅ Database connection successful.");

    // 2. Check for Admin User
    const adminEmail = "admin@scrapter.com";
    let admin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (admin) {
      console.log("✅ Admin user found: " + adminEmail);
    } else {
      console.log("⚠️  Admin user not found. You might need to signup first.");
    }

    // 3. Check Subscription table
    const subs = await prisma.subscription.count();
    console.log(`📊 Number of subscriptions in DB: ${subs}`);
  } catch (error) {
    console.error("❌ Verification failed:");
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

check();

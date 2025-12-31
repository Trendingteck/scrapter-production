import { prisma } from "../index.js";
import pg from "pg";
import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load .env from root
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

async function verify() {
  console.log("--- NEON DATABASE VERIFICATION ---");

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("❌ ERROR: DATABASE_URL not found in environment.");
    process.exit(1);
  }

  // Hide password in logs
  const maskedUrl = dbUrl.replace(/:([^@]+)@/, ":****@");
  console.log(`Checking connection to: ${maskedUrl}`);

  // 1. Test Raw PG Connection
  console.log("\n1. Testing Raw PG Connection...");
  const pool = new pg.Pool({ connectionString: dbUrl });
  try {
    const client = await pool.connect();
    const result = await client.query(
      "SELECT NOW() as now, current_database() as db, current_user as user",
    );
    console.log("✅ Raw PG Success!");
    console.log(`   Time: ${result.rows[0].now}`);
    console.log(`   Database: ${result.rows[0].db}`);
    console.log(`   User: ${result.rows[0].user}`);
    client.release();
  } catch (err: any) {
    console.error("❌ Raw PG Failed:", err.message);
  } finally {
    await pool.end();
  }

  // 2. Test Prisma Connection
  console.log("\n2. Testing Prisma Connection...");
  try {
    await prisma.$connect();
    console.log("✅ Prisma Connection Success!");
  } catch (err: any) {
    console.error("❌ Prisma Connection Failed:", err.message);
  }

  // 3. Verify Admin User
  console.log("\n3. Verifying Admin User (admin@scrapter.com)...");
  try {
    const admin = await prisma.user.findUnique({
      where: { email: "admin@scrapter.com" },
      include: { subscription: true },
    });

    if (admin) {
      console.log("✅ Admin user found!");
      console.log(`   ID: ${admin.id}`);
      console.log(
        `   Verified: ${admin.emailVerified ? admin.emailVerified.toISOString() : "❌ NOT VERIFIED"}`,
      );
      console.log(`   Plan: ${admin.subscription?.plan || "None"}`);
      console.log(`   Sub Status: ${admin.subscription?.status || "None"}`);
    } else {
      console.error("❌ Admin user NOT FOUND in database.");
    }
  } catch (err: any) {
    console.error("❌ Error querying User table:", err.message);
  }

  // 4. Check Schema Health
  console.log("\n4. Checking Schema Integrity...");
  try {
    const tableMappings: Record<string, string> = {
      User: "user",
      Subscription: "subscription",
      Session: "session",
      ChatSession: "chatSession",
      UsageLog: "usageLog",
    };

    for (const [displayName, prismaName] of Object.entries(tableMappings)) {
      // @ts-ignore
      const count = await prisma[prismaName].count();
      console.log(`   Table '${displayName}': ${count} records`);
    }
    console.log("✅ Schema seems healthy.");
  } catch (err: any) {
    console.error(
      "❌ Schema sanity check failed (maybe tables don't exist?):",
      err.message,
    );
  }

  await prisma.$disconnect();
  console.log("\n--- VERIFICATION COMPLETE ---");
}

verify().catch(console.error);

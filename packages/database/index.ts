import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try to load from current dir, then from root
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ ERROR: DATABASE_URL is missing!");
} else {
  const masked = connectionString.replace(/:([^@]+)@/, ":****@");
  console.log(`✅ Database connection string found: ${masked}`);
}

const isVercel = process.env.VERCEL === "1";

const pool = new pg.Pool({
  connectionString: connectionString || undefined,
  connectionTimeoutMillis: 5000,
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
});

// Use the adapter only if needed. On Vercel Node runtime,
// standard Prisma often works better with fewer moving parts.
export const prisma = isVercel
  ? new PrismaClient({ log: ["error", "warn"] })
  : new PrismaClient({
      adapter: new PrismaPg(pool),
      log: ["error", "warn"],
    });
export { PrismaClient };
export * from "@prisma/client";

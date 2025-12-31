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
  console.error("ERROR: DATABASE_URL is missing in environment variables!");
  // Depending on behavior, we might want to throw to stop execution or handle gracefully
  // For now, let's allow it to continue but it will fail on query
} else {
  console.log("Database connection string found.");
}

const pool = new pg.Pool({
  connectionString: connectionString || undefined,
});
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });
export { PrismaClient };
export * from "@prisma/client";

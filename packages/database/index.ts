import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import PrismaPkg from './generated/client/index.js';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try to load from current dir, then from root
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

console.log('Database index initializing...');
const { PrismaClient } = PrismaPkg;

const connectionString = process.env.DATABASE_URL;
console.log('DATABASE_URL present:', !!connectionString);

if (!connectionString) {
    console.error('DATABASE_URL is missing!');
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });
export { PrismaClient };
export * from './generated/client/index.js';

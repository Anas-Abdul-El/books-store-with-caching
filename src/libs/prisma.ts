// import { PrismaClient } from "../../generated/prisma/client";
// // Import the driver adapter for your specific database (example uses PostgreSQL)
// import { PrismaPg } from "@prisma/adapter-pg";

// // Initialize the adapter according to your driver's requirements
// const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

// // Pass the adapter instance to PrismaClient
// const prisma = new PrismaClient({ adapter });

// export { prisma };

import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;

/**
 * db is the configured PrismaClient instance for database operations.
 * It uses the PrismaPg adapter to connect to the PostgreSQL database.
 */
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export { prisma };

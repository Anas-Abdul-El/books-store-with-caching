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

// The PostgreSQL connection string, read from the environment at import time.
const connectionString = `${process.env.DATABASE_URL}`;

/**
 * adapter is the driver adapter Prisma uses to reach PostgreSQL through the pg
 * pool instead of its own bundled engine.
 */
const adapter = new PrismaPg({ connectionString });

/**
 * prisma is the shared PrismaClient instance every repo talks to. It is created
 * once per process and reused, so all the queries of the app share a single
 * connection pool.
 */
const prisma = new PrismaClient({ adapter });

export { prisma };

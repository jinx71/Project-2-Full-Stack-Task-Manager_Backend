const { PrismaClient } = require('@prisma/client');

// Single shared client — Prisma manages its own connection pool
const prisma = new PrismaClient();

module.exports = prisma;

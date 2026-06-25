require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const password = 'npg_6M2xCQTcivLO';
const host = 'ep-nameless-leaf-ao4wgcm0-pooler.c-2.ap-southeast-1.aws.neon.tech';
const user = 'neondb_owner';

const variations = [
  // 1. Single slash with 'devfolio'
  `postgresql://${user}:${password}@${host}/devfolio?sslmode=require&connection_limit=5&pool_timeout=10`,
  // 2. Single slash with 'neondb'
  `postgresql://${user}:${password}@${host}/neondb?sslmode=require&connection_limit=5&pool_timeout=10`,
  // 3. Single slash with 'neondb' and no extra parameters
  `postgresql://${user}:${password}@${host}/neondb?sslmode=require`,
  // 4. Using unpooled direct host (non-pooler) if applicable
  `postgresql://${user}:${password}@ep-nameless-leaf-ao4wgcm0.ap-southeast-1.aws.neon.tech/neondb?sslmode=require`
];

async function runTest() {
  for (let i = 0; i < variations.length; i++) {
    const url = variations[i];
    console.log(`\n--------------------------------------------`);
    console.log(`Test Option #${i + 1}:`);
    console.log(`URL: ${url.replace(/:[^:@]+@/, ':****@')}`);
    
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: url
        }
      }
    });

    try {
      await prisma.$connect();
      console.log('✅ Success! Connected to this database.');
      const result = await prisma.$queryRaw`SELECT current_database() as db_name`;
      console.log('✅ Query current_database() returned:', result);
      await prisma.$disconnect();
      return url; // Return the working url
    } catch (err) {
      console.error('❌ Failed with error code:', err.code || err.name || 'UNKNOWN');
      console.error(err.message);
    } finally {
      await prisma.$disconnect();
    }
  }
  return null;
}

runTest();

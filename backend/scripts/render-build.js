// scripts/render-build.js
// This script is used by Render to build the backend.
// It strips surrounding quotes from env vars (common copy-paste mistake)
// then runs prisma generate + db push.

const { execSync } = require('child_process');

// ── Sanitize env vars ──────────────────────────────────────────────────────
// Render sometimes gets quoted values if user copies from .env file format
const KEYS = ['DATABASE_URL', 'JWT_SECRET', 'ADMIN_PASSWORD_HASH', 'CLOUDINARY_API_SECRET'];
KEYS.forEach((key) => {
  if (process.env[key]) {
    const cleaned = process.env[key].replace(/^["']|["']$/g, '').trim();
    process.env[key] = cleaned;
  }
});

// Validate DATABASE_URL before running Prisma
const dbUrl = process.env.DATABASE_URL || '';
if (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://')) {
  console.error('\n❌ DATABASE_URL is missing or invalid!');
  console.error('   Current value starts with:', JSON.stringify(dbUrl.slice(0, 30)));
  console.error('   Make sure DATABASE_URL is set on Render WITHOUT quotes.\n');
  process.exit(1);
}

console.log('✔ DATABASE_URL looks valid');
console.log('→ Running: prisma generate...');
execSync('npx prisma generate --schema=src/prisma/schema.prisma', {
  stdio: 'inherit',
  env: process.env,
});

// Only push DB schema on Render (RENDER env var is set automatically by Render)
// Skip on local npm install to avoid accidental schema pushes
if (process.env.RENDER || process.env.CI) {
  console.log('→ Running: prisma db push (Render/CI detected)...');
  execSync('npx prisma db push --schema=src/prisma/schema.prisma --accept-data-loss', {
    stdio: 'inherit',
    env: process.env,
  });
} else {
  console.log('→ Skipping prisma db push (local environment)');
}

console.log('\n✅ Build complete — Prisma client generated and DB synced.\n');

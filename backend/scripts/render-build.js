// scripts/render-build.js
// Render deployment build script.
// Uses a placeholder URL for prisma generate (only needs valid format, not real connection).
// Then sanitizes and uses the real DATABASE_URL for prisma db push.

const { execSync } = require('child_process');

console.log('=== RENDER BUILD SCRIPT RUNNING ===');
console.log('Script version: v2 (directUrl fix + environment diagnostics)');
try {
  const commit = execSync('git rev-parse --short HEAD').toString().trim();
  console.log(`Git Commit: ${commit}`);
} catch (e) {
  console.log('Git Commit: unknown');
}
console.log(`DATABASE_URL env var exists: ${!!process.env.DATABASE_URL}`);
if (process.env.DATABASE_URL) {
  const rawDbUrl = process.env.DATABASE_URL;
  console.log(`DATABASE_URL starts with: "${rawDbUrl.substring(0, 15)}..."`);
  console.log(`DATABASE_URL ends with: "...${rawDbUrl.substring(rawDbUrl.length - 15)}"`);
  console.log(`DATABASE_URL length: ${rawDbUrl.length}`);
  console.log(`DATABASE_URL has quotes: ${rawDbUrl.startsWith('"') || rawDbUrl.startsWith("'") || rawDbUrl.endsWith('"') || rawDbUrl.endsWith("'")}`);
}
console.log(`DIRECT_DATABASE_URL env var exists: ${!!process.env.DIRECT_DATABASE_URL}`);
if (process.env.DIRECT_DATABASE_URL) {
  const rawDirectUrl = process.env.DIRECT_DATABASE_URL;
  console.log(`DIRECT_DATABASE_URL starts with: "${rawDirectUrl.substring(0, 15)}..."`);
  console.log(`DIRECT_DATABASE_URL ends with: "...${rawDirectUrl.substring(rawDirectUrl.length - 15)}"`);
  console.log(`DIRECT_DATABASE_URL length: ${rawDirectUrl.length}`);
  console.log(`DIRECT_DATABASE_URL has quotes: ${rawDirectUrl.startsWith('"') || rawDirectUrl.startsWith("'") || rawDirectUrl.endsWith('"') || rawDirectUrl.endsWith("'")}`);
}
console.log('====================================\n');


// ── Step 1: prisma generate with a dummy URL ──────────────────────────────
// prisma generate only needs a syntactically valid URL — it does NOT connect.
// This avoids failures when DATABASE_URL has surrounding quotes or is malformed.
console.log('→ Running: prisma generate...');
const generateEnv = {
  ...process.env,
  DATABASE_URL: 'postgresql://placeholder:placeholder@placeholder:5432/placeholder',
};
execSync('npx prisma generate --schema=src/prisma/schema.prisma', {
  stdio: 'inherit',
  env: generateEnv,
});
console.log('✔ Prisma Client generated successfully.\n');

// ── Step 2: prisma db push with DIRECT URL ───────────────────────────────
// Only run on Render/CI (RENDER env var is set automatically by Render)
if (process.env.RENDER || process.env.CI) {
  let dbUrl = process.env.DATABASE_URL || '';

  // Strip surrounding quotes (common copy-paste mistake from .env file)
  dbUrl = dbUrl.replace(/^["']|["']$/g, '').trim();

  if (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://')) {
    console.error('\n❌ DATABASE_URL is invalid or missing on Render!');
    console.error('   Go to Render → Environment → DATABASE_URL');
    console.error('   Paste the value WITHOUT any surrounding quotes.\n');
    process.exit(1);
  }

  // Derive Neon direct URL from pooler URL:
  // Pooler:  ep-xxx-pooler.region.aws.neon.tech  (for app connections)
  // Direct:  ep-xxx.region.aws.neon.tech          (for migrations)
  // Also use DIRECT_DATABASE_URL env var if explicitly set
  let directUrl = process.env.DIRECT_DATABASE_URL || '';
  directUrl = directUrl.replace(/^["']|["']$/g, '').trim();

  if (!directUrl.startsWith('postgresql://') && !directUrl.startsWith('postgres://')) {
    // Auto-derive: remove "-pooler" from hostname and strip pooler-specific params
    directUrl = dbUrl
      .replace(/-pooler\./, '.')
      .replace(/&connection_limit=\d+/g, '')
      .replace(/&pool_timeout=\d+/g, '');
    console.log('→ Auto-derived direct URL from pooler URL (removed -pooler)');
  }

  console.log('→ Running: prisma db push (using direct connection)...');
  const pushEnv = {
    ...process.env,
    DATABASE_URL: dbUrl,
    DIRECT_DATABASE_URL: directUrl,
  };
  execSync('npx prisma db push --schema=src/prisma/schema.prisma --accept-data-loss', {
    stdio: 'inherit',
    env: pushEnv,
  });
  console.log('✔ Database synced successfully.\n');
} else {
  console.log('→ Skipping prisma db push (local environment).\n');
}

console.log('✅ Build complete!\n');

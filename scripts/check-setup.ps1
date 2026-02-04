
# Scrapter Development Check Script
Write-Host "🕵️ Checking Scrapter project state..." -ForegroundColor Cyan

# 1. Check if we are in the root
if (!(Test-Path "package.json")) {
    Write-Host "❌ Error: Please run this from the project root." -ForegroundColor Red
    exit
}

# 2. Check dependencies
Write-Host "`n📦 Checking dependencies..." -ForegroundColor Cyan
pnpm --version
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ pnpm is not installed." -ForegroundColor Red
}
else {
    Write-Host "✅ pnpm is ready."
}

# 3. Check Prisma Client
Write-Host "`n💎 Verifying Prisma Client..." -ForegroundColor Cyan
if (Test-Path "node_modules/.prisma") {
    Write-Host "✅ Prisma Client generated."
}
else {
    Write-Host "⚠️  Prisma Client not found. Running generation..." -ForegroundColor Yellow
    pnpm -F @scrapter/database db:generate
}

# 4. Check Environment Variables
Write-Host "`n🔑 Checking .env files..." -ForegroundColor Cyan
if (Test-Path ".env") {
    Write-Host "✅ Root .env found."
}
else {
    Write-Host "❌ Root .env missing!" -ForegroundColor Red
}

# 5. Check Web App API route
Write-Host "`n🌐 Checking API Route Handler..." -ForegroundColor Cyan
if (Test-Path "apps/web/src/app/api/[[...route]]/route.ts") {
    Write-Host "✅ API Route Handler exists."
}
else {
    Write-Host "❌ API Route Handler missing! (Migration failed?)" -ForegroundColor Red
}

Write-Host "`n🚀 Ready to go! To test your API locally:" -ForegroundColor Green
Write-Host "1. Run 'pnpm dev -- --no-daemon'"
Write-Host "2. Use this curl command (Corrected for local HTTP and /api prefix):"
Write-Host "   curl -X POST http://localhost:3000/api/auth/login -H 'Content-Type: application/json' -d '{\`"email\`": \`"admin@scrapter.com\`", \`"password\`": \`"admin@password123\`"}'" -ForegroundColor White

# Fix Admin Password - Clear cache and reset

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ADMIN PASSWORD FIX SCRIPT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Step 1: Clear Next.js cache
Write-Host "`n[1/4] Clearing Next.js cache..." -ForegroundColor Yellow
Remove-Item -Path ".next" -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "✓ Cache cleared" -ForegroundColor Green

# Step 2: Verify .env.local
Write-Host "`n[2/4] Checking .env.local..." -ForegroundColor Yellow
$envContent = Get-Content .env.local | Select-String "ADMIN_PASSWORD"
Write-Host "Current setting: $envContent" -ForegroundColor Cyan

# Step 3: Set simple password
Write-Host "`n[3/4] Setting simple password for development..." -ForegroundColor Yellow
$envFile = Get-Content .env.local
$newEnvFile = $envFile -replace 'ADMIN_PASSWORD=.*', 'ADMIN_PASSWORD=admin123'
$newEnvFile | Set-Content .env.local
Write-Host "✓ Password set to: admin123" -ForegroundColor Green

# Step 4: Instructions
Write-Host "`n[4/4] Next steps:" -ForegroundColor Yellow
Write-Host "  1. Stop your dev server (Ctrl+C)" -ForegroundColor Cyan
Write-Host "  2. Run: npm run dev" -ForegroundColor Cyan
Write-Host "  3. Go to: http://localhost:3000/admin" -ForegroundColor Cyan
Write-Host "  4. Login with password: admin123" -ForegroundColor Cyan

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "✓ SETUP COMPLETE" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

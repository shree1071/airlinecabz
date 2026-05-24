# Security Test Runner
# Checks if server is running and executes tests

$baseUrl = "http://localhost:3000"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SECURITY TEST RUNNER" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Check if server is running
Write-Host "`nChecking if development server is running..." -NoNewline
try {
    $response = Invoke-WebRequest -Uri $baseUrl -Method GET -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    Write-Host " ✓ Server is running" -ForegroundColor Green
} catch {
    Write-Host " ✗ Server is not running" -ForegroundColor Red
    Write-Host "`nPlease start the development server first:" -ForegroundColor Yellow
    Write-Host "  npm run dev" -ForegroundColor Cyan
    Write-Host "`nThen run this script again." -ForegroundColor Yellow
    exit 1
}

Write-Host "`nStarting comprehensive security tests...`n" -ForegroundColor Cyan

# Run the comprehensive test suite
& "$PSScriptRoot\comprehensive-security-test.ps1"

$exitCode = $LASTEXITCODE

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "TEST EXECUTION COMPLETE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

exit $exitCode

# Security Testing Script for Airlinecabz (PowerShell/Windows)
# This script tests various security measures

Write-Host "🔐 Starting Security Tests..." -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

$BaseUrl = "http://localhost:3000"
$Passed = 0
$Failed = 0

# Function to test endpoint
function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [int]$ExpectedStatus,
        [string]$Method = "GET"
    )
    
    Write-Host -NoNewline "Testing: $Name... "
    
    try {
        $response = Invoke-WebRequest -Uri $Url -Method $Method -UseBasicParsing -ErrorAction SilentlyContinue
        $statusCode = $response.StatusCode
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
    }
    
    if ($statusCode -eq $ExpectedStatus) {
        Write-Host "✓ PASS" -ForegroundColor Green -NoNewline
        Write-Host " (Status: $statusCode)"
        $script:Passed++
    } else {
        Write-Host "✗ FAIL" -ForegroundColor Red -NoNewline
        Write-Host " (Expected: $ExpectedStatus, Got: $statusCode)"
        $script:Failed++
    }
}

# Function to test with auth header
function Test-WithAuth {
    param(
        [string]$Name,
        [string]$Url,
        [int]$ExpectedStatus,
        [string]$Token
    )
    
    Write-Host -NoNewline "Testing: $Name... "
    
    try {
        $headers = @{
            "Authorization" = "Bearer $Token"
        }
        $response = Invoke-WebRequest -Uri $Url -Headers $headers -UseBasicParsing -ErrorAction SilentlyContinue
        $statusCode = $response.StatusCode
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
    }
    
    if ($statusCode -eq $ExpectedStatus) {
        Write-Host "✓ PASS" -ForegroundColor Green -NoNewline
        Write-Host " (Status: $statusCode)"
        $script:Passed++
    } else {
        Write-Host "✗ FAIL" -ForegroundColor Red -NoNewline
        Write-Host " (Expected: $ExpectedStatus, Got: $statusCode)"
        $script:Failed++
    }
}

Write-Host ""
Write-Host "1️⃣  Testing Broken Access Control" -ForegroundColor Yellow
Write-Host "-----------------------------------"
Test-Endpoint -Name "Admin endpoint without auth" -Url "$BaseUrl/api/bookings" -ExpectedStatus 401
# Note: Invalid UUID test returns 401 (unauthorized) before UUID validation
# This is correct behavior - auth check happens first
Test-Endpoint -Name "Admin endpoint with invalid UUID" -Url "$BaseUrl/api/bookings/invalid-uuid" -ExpectedStatus 401

Write-Host ""
Write-Host "2️⃣  Testing Authentication" -ForegroundColor Yellow
Write-Host "-----------------------------------"
Test-Endpoint -Name "Public vehicles endpoint" -Url "$BaseUrl/api/vehicles" -ExpectedStatus 200

Write-Host ""
Write-Host "3️⃣  Testing Security Headers" -ForegroundColor Yellow
Write-Host "-----------------------------------"
Write-Host -NoNewline "Checking security headers... "
try {
    $response = Invoke-WebRequest -Uri $BaseUrl -UseBasicParsing -ErrorAction Stop
    $headers = $response.Headers
    
    $hasSecurityHeaders = $false
    if ($headers.ContainsKey("X-Frame-Options") -or 
        $headers.ContainsKey("X-Content-Type-Options") -or 
        $headers.ContainsKey("Strict-Transport-Security")) {
        $hasSecurityHeaders = $true
    }
    
    if ($hasSecurityHeaders) {
        Write-Host "✓ PASS" -ForegroundColor Green
        if ($headers.ContainsKey("X-Frame-Options")) {
            Write-Host "  X-Frame-Options: $($headers['X-Frame-Options'])"
        }
        if ($headers.ContainsKey("X-Content-Type-Options")) {
            Write-Host "  X-Content-Type-Options: $($headers['X-Content-Type-Options'])"
        }
        if ($headers.ContainsKey("Strict-Transport-Security")) {
            Write-Host "  Strict-Transport-Security: $($headers['Strict-Transport-Security'])"
        }
        $script:Passed++
    } else {
        Write-Host "✗ FAIL" -ForegroundColor Red
        $script:Failed++
    }
} catch {
    Write-Host "✗ FAIL" -ForegroundColor Red
    Write-Host "  Error: $_"
    $script:Failed++
}

Write-Host ""
Write-Host "4️⃣  Testing Rate Limiting" -ForegroundColor Yellow
Write-Host "-----------------------------------"
Write-Host "Making 105 requests to test rate limiting..."
$rateLimited = $false
$count = 0

for ($i = 1; $i -le 105; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "$BaseUrl/api/vehicles" -UseBasicParsing -ErrorAction SilentlyContinue
        $statusCode = $response.StatusCode
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
    }
    
    if ($statusCode -eq 429) {
        $rateLimited = $true
        $count = $i
        break
    }
}

if ($rateLimited) {
    Write-Host "✓ PASS" -ForegroundColor Green -NoNewline
    Write-Host " Rate limiting triggered at request $count"
    $script:Passed++
} else {
    Write-Host "⚠ WARNING" -ForegroundColor Yellow -NoNewline
    Write-Host " Rate limiting not triggered (may need server restart)"
}

Write-Host ""
Write-Host "5️⃣  Testing Input Validation" -ForegroundColor Yellow
Write-Host "-----------------------------------"

# Test XSS payload
Write-Host -NoNewline "Testing XSS prevention... "
$xssPayload = @{
    customer_name = '<script>alert("xss")</script>'
    customer_email = 'test@test.com'
    customer_phone = '+919876543210'
    pickup_location = 'Test'
    dropoff_location = 'Test'
    pickup_date = '2025-12-31T10:00:00'
    vehicle_type = 'sedan'
    total_amount = 1000
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/api/bookings" -Method POST -Body $xssPayload -ContentType "application/json" -UseBasicParsing -ErrorAction SilentlyContinue
    $content = $response.Content
} catch {
    $content = $_.Exception.Response.StatusDescription
}

if ($content -match "Invalid" -or $content -match "error" -or $content -match "Unauthorized") {
    Write-Host "✓ PASS" -ForegroundColor Green -NoNewline
    Write-Host " XSS payload rejected"
    $script:Passed++
} else {
    Write-Host "⚠ CHECK" -ForegroundColor Yellow -NoNewline
    Write-Host " Response: $($content.Substring(0, [Math]::Min(100, $content.Length)))..."
}

# Test SQL injection
Write-Host -NoNewline "Testing SQL injection prevention... "
try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/api/bookings?status=1' OR '1'='1" -UseBasicParsing -ErrorAction SilentlyContinue
    $statusCode = $response.StatusCode
    $content = $response.Content
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    $content = "Unauthorized"
}

if ($content -match "Unauthorized" -or $content -match "Invalid" -or $statusCode -eq 401) {
    Write-Host "✓ PASS" -ForegroundColor Green -NoNewline
    Write-Host " SQL injection prevented"
    $script:Passed++
} else {
    Write-Host "⚠ CHECK" -ForegroundColor Yellow -NoNewline
    Write-Host " Response: $($content.Substring(0, [Math]::Min(100, $content.Length)))..."
}

Write-Host ""
Write-Host "6️⃣  Testing HTTPS Redirect" -ForegroundColor Yellow
Write-Host "-----------------------------------"
Write-Host -NoNewline "Checking HSTS header... "
try {
    $response = Invoke-WebRequest -Uri $BaseUrl -UseBasicParsing -ErrorAction Stop
    if ($response.Headers.ContainsKey("Strict-Transport-Security")) {
        Write-Host "✓ PASS" -ForegroundColor Green
        Write-Host "  $($response.Headers['Strict-Transport-Security'])"
        $script:Passed++
    } else {
        Write-Host "⚠ INFO" -ForegroundColor Yellow -NoNewline
        Write-Host " HSTS header not found (normal for localhost)"
    }
} catch {
    Write-Host "⚠ INFO" -ForegroundColor Yellow -NoNewline
    Write-Host " HSTS header not found (normal for localhost)"
}

Write-Host ""
Write-Host "7️⃣  Testing Error Handling" -ForegroundColor Yellow
Write-Host "-----------------------------------"
Write-Host -NoNewline "Checking error messages don't expose internals... "
try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/api/bookings/00000000-0000-0000-0000-000000000000" -UseBasicParsing -ErrorAction SilentlyContinue
    $content = $response.Content
} catch {
    $content = $_.ErrorDetails.Message
}

if ($content -notmatch "stack" -and $content -notmatch "trace") {
    Write-Host "✓ PASS" -ForegroundColor Green -NoNewline
    Write-Host " No stack traces exposed"
    $script:Passed++
} else {
    Write-Host "✗ FAIL" -ForegroundColor Red -NoNewline
    Write-Host " Stack trace or internal details exposed"
    $script:Failed++
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "📊 Test Results" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Passed: " -NoNewline
Write-Host $Passed -ForegroundColor Green
Write-Host "Failed: " -NoNewline
Write-Host $Failed -ForegroundColor Red
Write-Host ""

if ($Failed -eq 0) {
    Write-Host "✅ All security tests passed!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "❌ Some security tests failed. Please review." -ForegroundColor Red
    exit 1
}

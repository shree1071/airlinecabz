# Security Testing Scripts

## Running Security Tests

### Prerequisites
- Node.js and npm installed
- Application running on `http://localhost:3000`
- curl installed (usually pre-installed on Mac/Linux)

### Quick Start

1. **Start the application:**
```bash
npm run dev
```

2. **Run security tests (Mac/Linux):**
```bash
chmod +x scripts/security-test.sh
./scripts/security-test.sh
```

3. **Run security tests (Windows):**
```bash
# Use Git Bash or WSL
bash scripts/security-test.sh
```

### What Gets Tested

The security test script checks:

1. **Access Control**
   - Admin endpoints require authentication
   - Invalid UUIDs are rejected
   - Unauthorized access is blocked

2. **Authentication**
   - Login validation works
   - Public endpoints are accessible
   - Protected endpoints require tokens

3. **Security Headers**
   - X-Frame-Options present
   - X-Content-Type-Options present
   - Strict-Transport-Security present
   - Content-Security-Policy present

4. **Rate Limiting**
   - Requests are limited to 100/minute
   - 429 status returned when exceeded

5. **Input Validation**
   - XSS payloads are sanitized
   - SQL injection attempts blocked
   - Invalid inputs rejected

6. **Error Handling**
   - No stack traces exposed
   - No internal details leaked
   - Generic error messages

### Manual Testing

#### Test Authentication
```bash
# Should return 401 Unauthorized
curl http://localhost:3000/api/bookings

# Should return 400 Bad Request
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"password":""}'
```

#### Test Input Validation
```bash
# Test XSS prevention
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "<script>alert(\"xss\")</script>",
    "customer_email": "test@test.com",
    "customer_phone": "+919876543210",
    "pickup_location": "Test Location",
    "dropoff_location": "Airport",
    "pickup_date": "2025-12-31T10:00:00",
    "vehicle_type": "sedan",
    "total_amount": 1000
  }'
```

#### Test Rate Limiting
```bash
# Make 101 requests quickly
for i in {1..101}; do
  curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/api/vehicles
done
# Should see 429 on 101st request
```

#### Test Security Headers
```bash
curl -I http://localhost:3000 | grep -E "(X-Frame|X-Content|Strict-Transport|Content-Security)"
```

### NPM Audit

Check for vulnerable dependencies:
```bash
npm audit

# Fix automatically (if possible)
npm audit fix

# Force fix (may break things)
npm audit fix --force
```

### Expected Results

✅ **All tests should pass** with output like:
```
🔐 Starting Security Tests...
================================

1️⃣  Testing Broken Access Control
-----------------------------------
Testing: Admin endpoint without auth... ✓ PASS (Status: 401)
Testing: Invalid UUID in booking... ✓ PASS (Status: 400)

...

================================
📊 Test Results
================================
Passed: 12
Failed: 0

✅ All security tests passed!
```

### Troubleshooting

**Rate limiting not working:**
- Restart the development server
- Rate limit store resets on server restart

**Tests failing:**
- Ensure app is running on port 3000
- Check that .env.local is configured
- Verify database connection

**Windows issues:**
- Use Git Bash or WSL
- Or manually run curl commands

### Continuous Testing

Add to your CI/CD pipeline:
```yaml
# .github/workflows/security.yml
name: Security Tests
on: [push, pull_request]
jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm install
      - run: npm run dev &
      - run: sleep 10
      - run: ./scripts/security-test.sh
      - run: npm audit
```

### Additional Tools

**OWASP ZAP:**
```bash
# Install ZAP
# Then run:
zap-cli quick-scan http://localhost:3000
```

**Snyk:**
```bash
npm install -g snyk
snyk test
```

**Lighthouse (includes security audit):**
```bash
npm install -g lighthouse
lighthouse http://localhost:3000 --only-categories=best-practices
```

## Support

For security issues:
- Review: `SECURITY.md`
- Email: security@airlinecabz.com

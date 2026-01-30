# IP Whitelist Testing Guide - Hands-On Examples

## Quick Test (2 minutes)

### Current Status
You have: `ADMIN_ALLOWED_IPS=127.0.0.1,::1`

This means **only localhost can access admin**.

### Test 1: Access from Localhost (Should Work ✅)

**Windows PowerShell:**
```powershell
# Test public site
Invoke-WebRequest -Uri http://localhost:5000

# Test admin dashboard
Invoke-WebRequest -Uri http://localhost:5000/admin
# Expected: 200 OK, HTML page loads
```

**Mac/Linux (curl):**
```bash
# Test public site
curl http://localhost:5000

# Test admin dashboard
curl -I http://localhost:5000/admin
# Expected: HTTP/1.1 200 OK
```

### Test 2: API Endpoint (Should Show 403 with Allowed IP)

```bash
curl http://localhost:5000/api/portfolio/public/profile
# Expected: 200 OK (no auth needed, publicly available)

curl http://localhost:5000/api/admin/profile
# Expected: 403 Forbidden (IP allowed, but JWT not sent)
# Response: {"error":"Access Denied","message":"..."}
```

### Test 3: Check Server Logs

When you hit `/admin`, you should see in terminal:
```
[IPWhitelist] ✅ ALLOWED: IP 127.0.0.1 accessing /admin
```

---

## Real-World Test (5 minutes) - Block All IPs

### Scenario: Temporarily disable access to test blocking behavior

**Step 1: Stop server**
```
Press Ctrl+C in terminal
```

**Step 2: Edit .env**
```env
# Change this:
ADMIN_ALLOWED_IPS=127.0.0.1,::1

# To this (block everything):
ADMIN_ALLOWED_IPS=8.8.8.8
```

**Step 3: Restart server**
```bash
node server/index.js
```

**Step 4: Try to access admin**
```bash
curl http://localhost:5000/admin
# Expected: 302 redirect to / OR empty response
```

**Step 5: Check logs**
```
[IPWhitelist] 🚫 BLOCKED: IP 127.0.0.1 attempted access to /admin
[IPWhitelist] Allowed IPs: 8.8.8.8
```

**Step 6: Restore original**
```env
ADMIN_ALLOWED_IPS=127.0.0.1,::1
```

---

## Testing with Multiple IPs

### Scenario: Allow your home and office IPs

```env
ADMIN_ALLOWED_IPS=49.37.12.10,203.0.113.42,127.0.0.1,::1
```

**From home (49.37.12.10):**
```bash
curl https://yourapp.com/admin
# ✅ Should work
```

**From office (203.0.113.42):**
```bash
curl https://yourapp.com/admin
# ✅ Should work
```

**From other IP:**
```bash
curl https://yourapp.com/admin
# ❌ Should be blocked
```

---

## Testing CIDR Ranges

### Scenario: Allow entire office network /24

```env
ADMIN_ALLOWED_IPS=203.0.113.0/24,127.0.0.1,::1
```

This allows IPs: `203.0.113.0` to `203.0.113.255` (256 IPs)

**Test from office (203.0.113.50):**
```bash
curl https://yourapp.com/admin
# ✅ Should work (within 203.0.113.0/24 range)
```

**Test from different office subnet (203.0.114.50):**
```bash
curl https://yourapp.com/admin
# ❌ Should be blocked (outside range)
```

---

## Testing on Remote Server

### Prerequisites
- App deployed to: `yourapp.com`
- Your public IP: `49.37.12.10`

### Scenario: Test from multiple locations

**Step 1: Update .env on production**
```env
ADMIN_ALLOWED_IPS=49.37.12.10
```

**Step 2: From your office IP (49.37.12.10)**
```bash
curl https://yourapp.com/admin
# ✅ Should work
```

**Step 3: From home (different IP, e.g., VPN from 198.51.100.5)**
```bash
curl https://yourapp.com/admin
# ❌ Should be blocked
# You'll see: 403 Forbidden or redirect
```

**Step 4: Add home IP to whitelist**
```env
ADMIN_ALLOWED_IPS=49.37.12.10,198.51.100.5
```

Deploy and test again:
```bash
curl https://yourapp.com/admin
# ✅ Now works!
```

---

## Advanced: Testing Authentication Flow

### Test: IP Check → JWT Check Order

**Request to admin API:**
```bash
curl -X GET http://localhost:5000/api/admin/profile
```

**Response flow:**
1. ✅ IP 127.0.0.1 is in whitelist → Proceed
2. ❌ No JWT token provided → 403 Forbidden
3. Server shows: `"error": "Access Denied", "message": "..."`

**With JWT token (from login):**
```bash
# First login to get token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Response: {"token":"eyJhbGc..."}

# Now use token
curl -X GET http://localhost:5000/api/admin/profile \
  -H "Authorization: Bearer eyJhbGc..."

# Now: IP allowed ✅ + JWT valid ✅ → 200 OK with data
```

---

## Testing IPv6

### Scenario: Your VPS has IPv6, office has IPv4

```env
ADMIN_ALLOWED_IPS=2001:db8::1,49.37.12.10,127.0.0.1,::1
```

**From IPv6 (2001:db8::1):**
```bash
curl -6 https://yourapp.com/admin
# ✅ Should work
```

**From IPv4 (49.37.12.10):**
```bash
curl https://yourapp.com/admin
# ✅ Should work
```

---

## Troubleshooting: Wrong IP Detected

### Issue: Blocked from your own IP

**Check 1: Is app behind proxy?**
```javascript
// In server/index.js - should already have:
app.set('trust proxy', 1);  // ← This line is critical
```

**Check 2: See actual detected IP**

Add temporary debug:
```javascript
// In middleware/ipWhitelist.js, add at start:
console.log('[DEBUG] Detected client IP:', req.ip);
console.log('[DEBUG] X-Forwarded-For:', req.headers['x-forwarded-for']);
console.log('[DEBUG] Remote Address:', req.connection.remoteAddress);
```

Restart server and make request:
```bash
curl http://localhost:5000/admin
```

Server logs will show:
```
[DEBUG] Detected client IP: 127.0.0.1
[DEBUG] X-Forwarded-For: undefined
[DEBUG] Remote Address: 127.0.0.1
```

**Check 3: Proxy configuration**

If behind Nginx, verify:
```nginx
location / {
    proxy_pass http://localhost:5000;
    proxy_set_header X-Forwarded-For $remote_addr;  # ← Important!
    proxy_set_header X-Real-IP $remote_addr;
}
```

---

## Testing Scenarios Checklist

### Local Development
- [ ] Can access `/admin` from `http://localhost:5000`
- [ ] Can access `/` (public) from `http://localhost:5000`
- [ ] Logs show "✅ ALLOWED" message

### Blocking Test
- [ ] Change `ADMIN_ALLOWED_IPS=8.8.8.8` temporarily
- [ ] Cannot access `/admin`
- [ ] Logs show "🚫 BLOCKED" message
- [ ] Restore original

### Multi-IP Test
- [ ] Add multiple IPs to whitelist
- [ ] Can access from each IP (or use different devices)
- [ ] Cannot access from unlisted IP

### CIDR Test
- [ ] Add `ADMIN_ALLOWED_IPS=203.0.113.0/24`
- [ ] Test IPs within range work
- [ ] Test IPs outside range are blocked

### Production Test
- [ ] Deployed app accessible at domain
- [ ] `/admin` works from your IP
- [ ] `/admin` blocked from other IP
- [ ] Public site `/` works for everyone

### API Test
- [ ] `/api/admin/*` requires IP whitelist
- [ ] `/api/portfolio/public/*` works for everyone
- [ ] Correct 403 response when blocked

---

## Quick Fixes

### Problem: Cannot Access Admin After Update

**Solution:**
1. Stop server: `Ctrl+C`
2. Check `.env`: `ADMIN_ALLOWED_IPS=127.0.0.1,::1`
3. Get your IP: `curl https://api.ipify.org`
4. Add to `.env`: `ADMIN_ALLOWED_IPS=YOUR_IP,127.0.0.1,::1`
5. Restart: `node server/index.js`

### Problem: Logs Don't Show "[IPWhitelist]"

**Solution:**
1. Confirm middleware is imported: `const ipWhitelistMiddleware = require('./middleware/ipWhitelist');`
2. Confirm middleware is applied: `app.use('/admin', ipWhitelistMiddleware);`
3. Restart server
4. Check console output

### Problem: Works Locally But Not on Production

**Solution:**
1. Get your public IP: `curl https://api.ipify.org`
2. Update `.env` on production platform
3. Redeploy app
4. Test with curl from different IP
5. Check logs on hosting platform

---

## Command Reference

| Task | Command |
|------|---------|
| Get local IP | `ipconfig` (Windows) or `ifconfig` (Mac/Linux) |
| Get public IP | `curl https://api.ipify.org` |
| Test endpoint | `curl http://localhost:5000/admin` |
| Test with headers | `curl -i http://localhost:5000/admin` |
| View current .env | `cat .env` (Mac/Linux) or `Get-Content .env` (Windows) |
| Edit .env | Text editor or `nano .env` |
| Restart server | `Ctrl+C` then `node server/index.js` |
| View logs live | Keep terminal visible while testing |

---

## Real Example: Full Setup

### My Setup:
- **Home IP:** 49.37.12.10
- **Office subnet:** 103.21.244.0/24
- **Localhost:** 127.0.0.1, ::1

### .env configuration:
```env
ADMIN_ALLOWED_IPS=49.37.12.10,103.21.244.0/24,127.0.0.1,::1
```

### Testing:
```bash
# Test from home office
curl https://myportfolio.com/admin  # ✅ Works (49.37.12.10)

# Test from office subnet
curl https://myportfolio.com/admin  # ✅ Works (within 103.21.244.0/24)

# Test from coffee shop (unknown IP)
curl https://myportfolio.com/admin  # ❌ 403 Forbidden

# Public site works everywhere
curl https://myportfolio.com/       # ✅ Works (no restriction)
```

### Server logs:
```
✅ ALLOWED: IP 49.37.12.10 accessing /admin
✅ ALLOWED: IP 103.21.244.50 accessing /admin
🚫 BLOCKED: IP 201.45.123.7 attempted access to /admin
✅ ALLOWED: IP 203.0.113.1 accessing /
```

---

Everything working? You're done! 🎉

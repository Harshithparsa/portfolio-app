# 🚀 IP Whitelist - Quick Reference

## What Changed

Your admin panel (`/admin`) and admin APIs (`/api/admin/*`) are now **IP-protected**.

**Public site** (`/`) is still accessible to everyone.

---

## 3-Step Setup

### Step 1: Get Your IP
```bash
curl https://api.ipify.org
# Output: 49.37.12.10
```

### Step 2: Update .env
```env
ADMIN_ALLOWED_IPS=49.37.12.10,127.0.0.1,::1
```

### Step 3: Restart Server
```bash
# Stop: Ctrl+C
# Start: node server/index.js
```

---

## Verify It Works

```bash
node test-ip-whitelist.js
```

Expected output:
```
✅ Public site accessible
✅ Admin dashboard accessible (from localhost)
✅ Admin API blocked without JWT
```

---

## Server Logs

**Allowed:**
```
[IPWhitelist] ✅ ALLOWED: IP 127.0.0.1 accessing /admin
```

**Blocked:**
```
[IPWhitelist] 🚫 BLOCKED: IP 201.45.123.7 attempted access to /admin
```

---

## Configuration Examples

| Setup | .env Value |
|-------|-----------|
| Dev (localhost) | `127.0.0.1,::1` |
| Home only | `49.37.12.10` |
| Home + office | `49.37.12.10,203.0.113.42` |
| Office subnet | `103.21.244.0/24` |
| Multiple | `49.37.12.10,103.21.244.0/24,127.0.0.1,::1` |

---

## Access Results

| Route | IP Allowed | IP Blocked |
|-------|-----------|-----------|
| `/` (public) | ✅ | ✅ |
| `/admin` | ✅ | 🚫 redirect |
| `/api/admin/*` | ✅ (with JWT) | 🚫 403 JSON |
| `/api/portfolio/public/*` | ✅ | ✅ |

---

## Common Actions

### Reset to Localhost Only
```env
ADMIN_ALLOWED_IPS=127.0.0.1,::1
```

### Add Another IP
```env
# Current:
ADMIN_ALLOWED_IPS=49.37.12.10,127.0.0.1,::1

# After adding office:
ADMIN_ALLOWED_IPS=49.37.12.10,203.0.113.5,127.0.0.1,::1
```

### Use CIDR Range for Subnet
```env
# Office subnet /24 (256 IPs)
ADMIN_ALLOWED_IPS=103.21.244.0/24,127.0.0.1,::1

# OR /25 (128 IPs)
ADMIN_ALLOWED_IPS=103.21.244.0/25,127.0.0.1,::1
```

### Emergency: Block All Access
```env
ADMIN_ALLOWED_IPS=8.8.8.8
```

---

## Troubleshooting

### Can't Access Admin?
1. Check your IP: `curl https://api.ipify.org`
2. Update `.env` with your IP
3. Restart server
4. Check logs: `[IPWhitelist] ✅ ALLOWED`

### Wrong IP Detected?
- You're likely behind a proxy
- Already configured in `server/index.js`: `app.set('trust proxy', 1)`
- Check `X-Forwarded-For` header if issues persist

### CIDR Range Not Working?
- Use `/24` (not `0-255`)
- Test at: https://mxtoolbox.com/cidr.html
- Example: `203.0.113.0/24` = `203.0.113.0` to `203.0.113.255`

---

## Files Reference

✅ **Created:**
- `server/middleware/ipWhitelist.js` - IP whitelist logic
- `IP_WHITELIST_GUIDE.md` - Full documentation
- `IP_WHITELIST_TESTING.md` - Test scenarios
- `test-ip-whitelist.js` - Automated tests

✅ **Modified:**
- `server/index.js` - Added middleware + trust proxy
- `.env` - Added ADMIN_ALLOWED_IPS config

---

## Production Deployment

### Render.com / Railway.app / Heroku

1. Get your IP:
   ```bash
   curl https://api.ipify.org
   ```

2. Add Environment Variable:
   ```
   ADMIN_ALLOWED_IPS=YOUR_IP,127.0.0.1,::1
   ```

3. Redeploy

4. Test:
   ```bash
   curl https://yourapp.com/admin
   # From your IP: ✅ Works
   # From other IP: ❌ 403 or redirect
   ```

---

## Behind Nginx? (VPS)

Already configured! No changes needed:
```javascript
app.set('trust proxy', 1);  // In server/index.js
```

Just make sure nginx has:
```nginx
proxy_set_header X-Forwarded-For $remote_addr;
```

---

## Tips

- **Always include localhost:** `127.0.0.1,::1`
- **Use CIDR for subnets:** Easier than listing 256 IPs
- **Check logs:** Shows exactly what's happening
- **Test from different IPs:** Verify blocking works
- **Keep JWT enabled:** Defense in depth

---

**Everything working?** You're done! 🎉

Check IP_WHITELIST_GUIDE.md for advanced topics.

# 🔧 Troubleshooting Guide

## Startup Issues

### "MongoDB connection error"

**Error in terminal:**
```
MongoDB connection error: connect ECONNREFUSED 127.0.0.1:27017
```

**Cause:** MongoDB service is not running

**Solution:**
```bash
# Windows - Open Services app and start MongoDB
# Or run in PowerShell as Administrator:
Set-Service -Name MongoDB -StartupType Automatic -Status Running

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
sudo systemctl enable mongod  # Auto-start on boot
```

**Verify MongoDB is running:**
```bash
# Should return "1" if running
# Windows (PowerShell)
(Get-Service MongoDB).Status

# macOS/Linux
mongosh --version  # If mongosh installed
```

---

### "Port 5000 already in use"

**Error:**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution 1: Change port in .env**
```
PORT=5001
```

Then restart server.

**Solution 2: Kill process using port 5000**
```bash
# Windows (PowerShell as Administrator)
netstat -ano | findstr :5000  # Find PID
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5000  # Find PID
kill -9 <PID>
```

---

### "npm: command not found"

**Cause:** Node.js/npm not installed

**Solution:**
1. Download Node.js from https://nodejs.org
2. Install LTS version
3. Verify installation:
```bash
node --version
npm --version
```

---

### "Cannot find module 'express'"

**Cause:** Dependencies not installed

**Solution:**
```bash
cd portfolio-app
npm install
```

---

## Login Issues

### "Admin login not working"

**Check 1: Verify credentials in .env**
```
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

**Check 2: Clear browser storage**
```javascript
localStorage.clear()
sessionStorage.clear()
```
Then refresh page.

**Check 3: Check browser console for errors**
- Open DevTools (F12)
- Go to Console tab
- Look for error messages
- Check Network tab to see API response

**Check 4: Server logs**
Look at terminal where server is running for error messages.

**Check 5: Reset credentials**

Edit `.env`:
```
ADMIN_USERNAME=newadmin
ADMIN_PASSWORD=newpassword123
```

Restart server.

---

## Public Site Issues

### "Data not loading on portfolio"

**Error:** Blank sections or "undefined" values

**Check 1: Server is running**
```bash
# Terminal should show:
✅ MongoDB connected
🚀 Server running on http://localhost:5000
```

**Check 2: CORS error in browser console**
```
Access to XMLHttpRequest has been blocked by CORS policy
```

Solution:
- Make sure accessing from `http://localhost:5000`
- NOT `http://127.0.0.1:5000` or `http://localhost:5001`
- CORS is configured for all origins in `.env`

**Check 3: API endpoint not responding**

In browser console:
```javascript
fetch('http://localhost:5000/api/portfolio/public/profile')
  .then(r => r.json())
  .then(d => console.log(d))
```

Check if you get data back.

**Check 4: MongoDB empty**

No data saved yet. Go to admin dashboard and add content.

---

### "Images not showing"

**Problem:** Profile image, project images, badges showing 404

**Check 1: File uploaded**

In browser DevTools Network tab, check:
- URL is `/uploads/filename`
- Status is 200 (not 404)
- Image loads when accessed directly

**Check 2: MongoDB has URL**

```javascript
// In browser console
fetch('http://localhost:5000/api/portfolio/public/profile')
  .then(r => r.json())
  .then(d => console.log(d.profileImage))
```

Should return `/uploads/...`, not empty.

**Check 3: File exists**

Check if file in `C:\Users\parsa\portfolio-app\server\uploads\`

---

### "Theme toggle not working"

**Check:** localStorage is enabled

In browser console:
```javascript
localStorage.setItem('test', 'value')
localStorage.getItem('test')  // Should return 'value'
```

If not working, clear browser cache and cookies.

---

## Admin Dashboard Issues

### "Can't save changes"

**Check 1: Token still valid**

```javascript
// Browser console
localStorage.getItem('token')  // Should have a value
```

If missing or empty, login again.

**Check 2: Network error**

In DevTools Network tab:
- Look for PUT requests to `/api/portfolio/admin/*`
- Check status: should be 200
- Check response: should have `"success": true`

**Check 3: API error**

Response shows:
```json
{ "error": "Invalid token" }
```

Solution: Logout and login again

**Check 4: MongoDB connection lost**

Look at server terminal for errors.
Make sure MongoDB is still running.

---

### "File upload fails"

**Error:** "Upload error" message

**Check 1: File size too large**

Multer default limit is 50MB. For larger files, edit `server/routes/portfolio.js`:
```javascript
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB
});
```

**Check 2: Wrong file type**

Frontend limits to:
- Images: `accept="image/*"`
- PDFs: `accept=".pdf"`

**Check 3: Uploads folder permissions**

Windows:
- Right-click `server/uploads/`
- Properties → Security → Edit
- Give your user full permissions

Linux/Mac:
```bash
chmod 755 server/uploads
```

**Check 4: Disk space**

Make sure your computer has free space for uploads.

---

### "Admin dashboard not loading"

**Check 1: Correct URL**

Should be: `http://localhost:5000/admin`

**Check 2: Browser cached old version**

Hard refresh:
- Windows/Linux: Ctrl + Shift + R
- Mac: Cmd + Shift + R

**Check 3: JavaScript error**

Open DevTools (F12) → Console tab
Look for red error messages

---

## Database Issues

### "Data disappears after restart"

**Check 1: MongoDB data not persisted**

MongoDB needs to save data to disk. Make sure:
- MongoDB is shutting down cleanly (not forced killed)
- Disk has free space
- No permission issues

**Check 2: MongoDB default data path**

Windows: `C:\Program Files\MongoDB\Server\<version>\data`

Check if this folder exists and has files.

**Check 3: Custom MongoDB path**

Edit `.env`:
```
MONGODB_URI=mongodb:///home/user/mongodb
```

Make sure path exists.

---

### "MongoDB won't connect after restart"

Sometimes MongoDB needs repair after crash:

```bash
# Windows
mongod --repair

# macOS
mongod --repair --storageEngine=mmapv1

# Linux
sudo mongod --repair
```

---

## Performance Issues

### "Site is slow to load"

**Check 1: Network tab**

- DevTools → Network tab
- Reload page
- Check load times
- Identify slowest requests

**Check 2: Large files**

If images are very large:
- Compress before uploading
- Recommended: < 500KB per image

**Check 3: Many projects**

If 100+ projects:
- May need pagination
- Or database indexing
- Add MongoDB index:

```javascript
// In Portfolio.js model
portfolioSchema.index({ 'projects.tags': 1 });
```

---

### "Memory usage keeps increasing"

**Cause:** Memory leak in server

**Solution:**
- Restart server periodically
- Check for infinite loops
- Ensure file handles are closed

For production, use:
```bash
pm2 start server/index.js --max-memory-restart 500M
```

---

## Deployment Issues

### "Can't deploy to Heroku"

**Check 1: .gitignore**

Make sure `.env` is in .gitignore (never commit credentials)

**Check 2: Buildpack**

Heroku should auto-detect Node.js, but if not:
```bash
heroku buildpacks:add heroku/nodejs
```

**Check 3: MongoDB**

Use MongoDB Atlas (cloud) instead of local:
```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/portfolio_db
```

**Check 4: Environment variables**

Set all .env variables on Heroku:
```bash
heroku config:set JWT_SECRET=your_secret_key
heroku config:set ADMIN_PASSWORD=your_password
```

---

## Debugging Tips

### 1. Check Server Logs
```bash
# Should show:
✅ MongoDB connected
🚀 Server running on http://localhost:5000
```

If errors appear, read them carefully.

### 2. Browser Console (F12)
- Network tab: Check API responses
- Console tab: Check error messages
- Storage: Check localStorage for token

### 3. MongoDB Shell
```bash
mongosh
> show dbs
> use portfolio_db
> db.portfolios.findOne()  # See your data
> db.portfolios.deleteMany({})  # Clear all data
```

### 4. Test API with cURL
```bash
curl http://localhost:5000/api/portfolio/public/profile
```

### 5. Add console.log statements
```javascript
// In server/routes/portfolio.js
console.log('Update request received:', req.body);
```

---

## Common Mistakes

❌ **Don't:**
- Commit `.env` file to Git
- Use weak JWT secret
- Run server without MongoDB
- Delete `/server/uploads/` folder
- Edit database directly (use API)

✅ **Do:**
- Add `.env` to `.gitignore`
- Use strong JWT secret in production
- Verify MongoDB running before starting server
- Make backups of uploads folder
- Use API for all changes

---

## Getting Help

### Step 1: Read Error Message
- Most errors are clear
- Google the error if unsure

### Step 2: Check Logs
- Server terminal logs
- Browser console (F12)
- MongoDB logs

### Step 3: Restart Everything
```bash
# Kill server (Ctrl+C in terminal)
# Stop MongoDB
# Restart MongoDB
# Restart server
```

### Step 4: Check Documentation
- README.md - Overview
- API.md - API reference
- QUICKSTART.md - Setup help
- ARCHITECTURE.md - System design

---

## Still Stuck?

Try this:

1. **Fresh start:**
```bash
# Delete node_modules
rmdir node_modules /s /q  # Windows
rm -rf node_modules       # Mac/Linux

# Reinstall
npm install

# Restart server
npm start
```

2. **Reset database:**
```javascript
// In mongosh
db.portfolios.deleteMany({})
```

3. **Clear browser:**
- Clear cache (Ctrl+Shift+Delete)
- Clear localStorage
- Hard refresh (Ctrl+Shift+R)

4. **Check documentation** at least 3x before asking for help 😄

---

Good luck! Most issues are solved by checking logs and restarting.

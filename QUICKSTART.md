# 🚀 Quick Start Guide

## Windows Setup (5 minutes)

### Step 1: Install MongoDB

1. Download: https://www.mongodb.com/try/download/community
2. Run installer (msi file)
3. Follow installation wizard
4. MongoDB will auto-start as a service

### Step 2: Install Dependencies

```powershell
# Open PowerShell in portfolio-app folder
cd C:\Users\parsa\portfolio-app
npm install
```

### Step 3: Start Server

```powershell
npm start
```

You should see:
```
✅ MongoDB connected
🚀 Server running on http://localhost:5000
```

### Step 4: Open Applications

- Public: http://localhost:5000
- Admin: http://localhost:5000/admin
- Login: admin / admin123

---

## macOS Setup (5 minutes)

```bash
# Install MongoDB
brew install mongodb-community
brew services start mongodb-community

# Install dependencies
cd ~/portfolio-app
npm install

# Start server
npm start
```

---

## Linux Setup (Ubuntu/Debian)

```bash
# Install MongoDB
sudo apt-get update
sudo apt-get install -y mongodb
sudo systemctl start mongod

# Install dependencies
cd ~/portfolio-app
npm install

# Start server
npm start
```

---

## Common Issues & Solutions

**Problem**: "npm: command not found"
- Solution: Install Node.js from https://nodejs.org

**Problem**: MongoDB connection error
- Solution: Make sure MongoDB service is running
  - Windows: Services app → MongoDB
  - Mac: `brew services list`
  - Linux: `sudo systemctl status mongod`

**Problem**: Port 5000 already in use
- Solution: Edit `.env` and change PORT to 5001 or higher

**Problem**: CORS errors
- Solution: Make sure you're accessing from http://localhost:5000 (not 127.0.0.1)

---

## Development

### Auto-reload on file changes

```bash
npm install -g nodemon
npm run dev
```

### View MongoDB data

```bash
# Windows: Open MongoDB Compass
# https://www.mongodb.com/products/compass

# Or use mongosh CLI
mongosh
> show dbs
> use portfolio_db
> db.portfolios.findOne()
```

---

## First Time Setup Checklist

- [ ] MongoDB installed and running
- [ ] Node.js installed
- [ ] `npm install` completed
- [ ] `.env` file configured
- [ ] Server starts without errors
- [ ] Can access http://localhost:5000
- [ ] Admin login works
- [ ] Can edit profile and save

---

## What Next?

1. **Edit your profile**: Go to admin dashboard
2. **Add projects**: Upload images and add links
3. **Upload resume**: PDF file in profile section
4. **Customize theme**: Edit colors in CSS
5. **Deploy**: Host on Heroku, Railway, or Vercel

---

For detailed info, see README.md

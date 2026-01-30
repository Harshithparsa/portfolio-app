# 🚀 QUICK START - File Upload System

## Start Server
```bash
cd C:\Users\parsa\portfolio-app
node server/index.js
```

## Access Upload Page

### Step 1: Login
```
URL: http://localhost:5000/admin-parsa-7734
Username: admin
Password: admin123
```

### Step 2: Go to Uploads
```
URL: http://localhost:5000/admin-uploads.html
```

### Step 3: Upload Files
- Click **"📁 Choose File"** button
- **Select file** from your PC
- **Watch progress** bar
- See **✓ Success** message

---

## Upload Requirements

### Profile Photo
- ✅ Formats: JPG, PNG, WEBP
- ✅ Size: Max 5MB
- ✅ Shows preview image

### Resume
- ✅ Format: PDF only
- ✅ Size: Max 5MB
- ✅ Shows filename

### CV
- ✅ Format: PDF only
- ✅ Size: Max 5MB
- ✅ Shows filename

---

## Test Upload with Curl

```bash
# 1. Get token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Copy the "token" from response

# 2. Upload profile photo
curl -X POST http://localhost:5000/api/uploads/profile-photo \
  -H "Authorization: Bearer TOKEN_HERE" \
  -F "profilePhoto=@C:\path\to\photo.jpg"

# 3. Upload resume
curl -X POST http://localhost:5000/api/uploads/resume \
  -H "Authorization: Bearer TOKEN_HERE" \
  -F "resume=@C:\path\to\resume.pdf"

# 4. Upload CV
curl -X POST http://localhost:5000/api/uploads/cv \
  -H "Authorization: Bearer TOKEN_HERE" \
  -F "cv=@C:\path\to\cv.pdf"
```

---

## Files Uploaded To

```
C:\Users\parsa\portfolio-app\server\uploads\
├── profile\              [Profile photos]
└── docs\                 [Resume & CV PDFs]
```

## Access Uploaded Files

**Profile Photo:**
```
http://localhost:5000/uploads/profile/profile-*.jpg
```

**Resume:**
```
http://localhost:5000/uploads/docs/resume-*.pdf
```

**CV:**
```
http://localhost:5000/uploads/docs/cv-*.pdf
```

---

## Error Messages

| Error | Cause | Fix |
|-------|-------|-----|
| "Your IP is not authorized" | IP blocked | Add to `ADMIN_ALLOWED_IPS` in `.env` |
| "Session expired" | No/invalid token | Login again |
| "File too large" | > 5MB | Use smaller file |
| "Wrong file type" | Wrong format | Use correct format (JPG/PNG for photo, PDF for docs) |
| "No file uploaded" | Empty upload | Select a file |

---

## MongoDB Fields

After upload, check MongoDB for:

```javascript
{
  profileImage: "/uploads/profile/profile-1705962540123-547391089.jpg",
  resumeUrl: "/uploads/docs/resume-1705962541234-987654321.pdf",
  cvUrl: "/uploads/docs/cv-1705962542345-456789123.pdf"
}
```

---

## Server Output

When running, you should see:

```
🔐 SECRET ADMIN ROUTE: /admin-parsa-7734
🚀 Server running on http://localhost:5000
✅ MongoDB connected
```

---

## Key Features

✅ File picker (opens Windows file explorer)
✅ Automatic upload on file select
✅ Progress bar with percentage
✅ Success message & preview
✅ JWT token validation
✅ IP whitelist protection
✅ File type validation
✅ File size validation
✅ Delete option
✅ Responsive design

---

## Configuration

### Change Admin Credentials
Edit `.env`:
```env
ADMIN_USERNAME=newusername
ADMIN_PASSWORD=newpassword
```

### Change Secret Route
Edit `.env`:
```env
ADMIN_SECRET_ROUTE=/my-secret-admin-path
```

### Add Your IP
Edit `.env`:
```env
ADMIN_ALLOWED_IPS=127.0.0.1,::1,YOUR_IP_HERE
```

To find your IP:
```bash
# Windows
ipconfig

# Mac/Linux
ifconfig
```

---

## Full Documentation

For complete details, see:
- `FILE_UPLOAD_SETUP.md` - Full setup guide
- `UPLOADS_READY.md` - Complete feature overview
- `CODE_REFERENCE.md` - API & code examples

---

## Browser Console Debugging

If upload fails, check browser console (F12):

```javascript
// Test token
console.log(localStorage.getItem('adminToken'))

// Test API
fetch('/api/uploads/profile-photo', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer TOKEN' },
  body: formData
})
```

---

## That's It! 🎉

You now have a complete file upload system.
Start uploading at: **http://localhost:5000/admin-uploads.html**

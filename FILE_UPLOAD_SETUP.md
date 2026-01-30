# 📤 File Upload System - Complete Setup Guide

## Overview

Your portfolio now has a complete file upload system with:
- ✅ Profile photo upload (JPG, PNG, WEBP)
- ✅ Resume PDF upload
- ✅ CV PDF upload
- ✅ File picker (opens Windows/Mac file explorer)
- ✅ File validation (size + type)
- ✅ JWT protection
- ✅ IP whitelist protection
- ✅ MongoDB persistence
- ✅ Progress indicators
- ✅ Delete functionality

---

## 🚀 Quick Start

### 1. Files Created/Updated

#### Backend Routes
- **File:** `server/routes/uploads.js` (NEW)
  - POST `/api/uploads/profile-photo` - Upload profile picture
  - POST `/api/uploads/resume` - Upload resume PDF
  - POST `/api/uploads/cv` - Upload CV PDF
  - DELETE `/api/uploads/:type/:filename` - Delete uploaded file

#### Frontend Upload Page
- **File:** `public/admin-uploads.html` (NEW)
  - Beautiful upload UI
  - File preview + status
  - Upload progress bar
  - Responsive design

#### Server Configuration
- **File:** `server/index.js` (UPDATED)
  - Registered `/api/uploads` route
  - Applied IP whitelist middleware
  - Added uploads static file serving

#### Upload Routes (Separate Files)
- `server/uploads/profile/` - Profile photos stored here
- `server/uploads/docs/` - Resume & CV PDFs stored here
- Both created automatically on first server start

### 2. Start Server

```bash
cd C:\Users\parsa\portfolio-app
node server/index.js
```

Expected output:
```
🔐 SECRET ADMIN ROUTE: /admin-parsa-7734
🚀 Server running on http://localhost:5000
✅ MongoDB connected
```

### 3. Access Upload Page

After logging in at `/admin-parsa-7734`, go to:
```
http://localhost:5000/admin-uploads.html
```

---

## 📋 File Structure

```
server/
├── routes/
│   ├── uploads.js              [NEW] Upload endpoints
│   ├── portfolio.js            [EXISTING] Portfolio data
│   └── auth.js                 [EXISTING] Login
├── middleware/
│   ├── ipWhitelist.js         [EXISTING] IP validation
│   ├── authAdmin.js           [EXISTING] JWT validation
│   └── auth.js                [EXISTING] Legacy auth
├── uploads/                    [NEW - Created automatically]
│   ├── profile/               [Profile photos]
│   └── docs/                  [Resume & CV PDFs]
├── models/
│   └── Portfolio.js           [Has profileImage, resumeUrl, cvUrl fields]
└── index.js                   [UPDATED] Route registration

public/
├── admin-uploads.html         [NEW] File upload UI
├── admin.html                 [EXISTING] Main dashboard
└── index.html                 [EXISTING] Public portfolio
```

---

## 🔒 Security Features

### 1. IP Whitelist Check
- Applied to `/api/uploads/*` routes
- Blocks uploads from unauthorized IPs
- Returns 403 Forbidden if IP not allowed

### 2. JWT Authentication
- Required in `Authorization: Bearer <token>` header
- Token generated after successful login
- Expires after 24 hours (configurable)
- Returns 401 Unauthorized if invalid/expired

### 3. File Type Validation
- **Frontend:** Accept attributes on file inputs
- **Backend:** MIME type checking in Multer
  - Profile: `image/jpeg`, `image/png`, `image/webp`
  - Docs: `application/pdf`

### 4. File Size Validation
- **Max size:** 5MB per file
- Checked by Multer limits
- Returns 413 Payload Too Large if exceeded

### 5. Filename Safety
- Unique filenames: `type-timestamp-randomId.ext`
- Prevents collisions and path traversal
- Example: `profile-1705962540123-547391089.jpg`

### 6. Directory Traversal Protection
- DELETE endpoint validates file path
- Ensures deletion only within `/uploads/` directory
- Prevents access to system files

---

## 🧪 Testing Steps (Windows)

### Test 1: Basic Upload (Profile Photo)

```bash
# 1. Login to get token
$response = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" `
  -Method POST `
  -Headers @{"Content-Type" = "application/json"} `
  -Body '{"username":"admin","password":"admin123"}'

$token = ($response.Content | ConvertFrom-Json).token
Write-Host "Token: $token"

# 2. Upload profile photo
$file = Get-Item "C:\Path\To\Your\photo.jpg"
$fileBytes = [System.IO.File]::ReadAllBytes($file.FullName)

$response = Invoke-WebRequest -Uri "http://localhost:5000/api/uploads/profile-photo" `
  -Method POST `
  -Headers @{"Authorization" = "Bearer $token"} `
  -InFile $file.FullName

$response.Content | ConvertFrom-Json | ConvertTo-Json
```

Expected response:
```json
{
  "success": true,
  "message": "Profile photo uploaded successfully",
  "url": "/uploads/profile/profile-1705962540123-547391089.jpg",
  "filename": "photo.jpg"
}
```

### Test 2: Resume Upload (PDF)

```bash
$token = "eyJ..." # From previous login

$response = Invoke-WebRequest -Uri "http://localhost:5000/api/uploads/resume" `
  -Method POST `
  -Headers @{"Authorization" = "Bearer $token"} `
  -InFile "C:\Path\To\Your\resume.pdf"

$response.Content | ConvertFrom-Json | ConvertTo-Json
```

### Test 3: File Size Validation

```bash
# Try uploading file > 5MB
# Expected: 400 error - File too large
```

### Test 4: Wrong File Type

```bash
# Try uploading .doc for resume (expects .pdf)
# Expected: 400 error - Only PDF files are allowed
```

### Test 5: Missing JWT Token

```bash
# Upload without Authorization header
$response = Invoke-WebRequest -Uri "http://localhost:5000/api/uploads/profile-photo" `
  -Method POST `
  -InFile "photo.jpg" `
  -ErrorAction SilentlyContinue

# Expected: 401 Unauthorized
```

### Test 6: IP Blocked

```bash
# If your IP is NOT in ADMIN_ALLOWED_IPS:
# Expected: 403 Access Denied

# Check .env:
# ADMIN_ALLOWED_IPS=127.0.0.1,::1,YOUR_IP_HERE
```

### Test 7: Browser Upload (Recommended)

1. **Login:** `http://localhost:5000/admin-parsa-7734`
   - Username: `admin`
   - Password: `admin123`

2. **Go to:** `http://localhost:5000/admin-uploads.html`

3. **Upload Profile Photo:**
   - Click "📁 Choose File"
   - File explorer opens automatically
   - Select a JPG, PNG, or WEBP image
   - Watch progress bar fill up
   - See "✓ Uploaded successfully!" message
   - Preview shows the uploaded image

4. **Upload Resume:**
   - Click "📁 Choose File"
   - Select a PDF file
   - Shows filename and file size
   - Click "🗑️ Remove" to delete

5. **Upload CV:**
   - Same as resume
   - Stores as `cv-*.pdf`

---

## 📊 MongoDB Schema

Profile document fields for uploads:

```javascript
{
  _id: ObjectId,
  name: "Parsa Khan",
  tagline: "Full-Stack Developer",
  about: "...",
  email: "parsa@example.com",
  
  // New upload fields
  profileImage: "/uploads/profile/profile-1705962540123-547391089.jpg",
  resumeUrl: "/uploads/docs/resume-1705962541234-987654321.pdf",
  cvUrl: "/uploads/docs/cv-1705962542345-456789123.pdf",
  
  updatedAt: ISODate("2024-01-22T...")
}
```

---

## 🛠️ API Endpoints Reference

### Upload Endpoints

#### POST /api/uploads/profile-photo
Upload profile picture

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: multipart/form-data
```

**Body:**
```
profilePhoto: <FILE>
```

**Success (200):**
```json
{
  "success": true,
  "message": "Profile photo uploaded successfully",
  "url": "/uploads/profile/profile-*.jpg",
  "filename": "original-name.jpg"
}
```

**Errors:**
- 400: No file / Wrong type / Too large
- 401: Missing/invalid token
- 403: IP not allowed

---

#### POST /api/uploads/resume
Upload resume PDF

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: multipart/form-data
```

**Body:**
```
resume: <FILE.PDF>
```

**Success (200):**
```json
{
  "success": true,
  "message": "Resume uploaded successfully",
  "url": "/uploads/docs/resume-*.pdf",
  "filename": "resume.pdf"
}
```

---

#### POST /api/uploads/cv
Upload CV PDF

Same as `/resume` but for CV files

---

#### DELETE /api/uploads/:type/:filename
Delete uploaded file

**Parameters:**
- `type`: "profile" or "docs"
- `filename`: Full filename including extension

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Success (200):**
```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

---

## 🎯 Frontend Integration

### Include in Admin Dashboard

To add uploads to your main admin dashboard, add this link:

```html
<a href="/admin-uploads.html" class="btn btn-primary">
  📤 Manage Uploads
</a>
```

### Programmatic Upload

```javascript
async function uploadProfilePhoto(file, token) {
  const formData = new FormData();
  formData.append('profilePhoto', file);

  const response = await fetch('/api/uploads/profile-photo', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  if (response.status === 403) {
    alert('Your IP is not authorized');
    return;
  }

  if (response.status === 401) {
    alert('Session expired');
    return;
  }

  const data = await response.json();
  console.log('Uploaded:', data.url);
  return data.url;
}
```

---

## ⚙️ Configuration

### File Size Limit

Edit `server/routes/uploads.js` to change 5MB limit:

```javascript
limits: { fileSize: 10 * 1024 * 1024 }  // 10MB
```

### Allowed File Types

**Profile photo:**
```javascript
const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
```

**Documents:**
```javascript
// Add more types:
if (file.mimetype === 'application/pdf' || file.mimetype === 'application/msword') {
  cb(null, true);
}
```

### Upload Directory

Change storage paths in `server/routes/uploads.js`:

```javascript
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '/var/uploads/profile/');  // Custom path
  }
});
```

---

## 🚨 Troubleshooting

### "File not uploading"
- ✅ Check JWT token is valid (hasn't expired)
- ✅ Check IP is in `ADMIN_ALLOWED_IPS`
- ✅ Check file size < 5MB
- ✅ Check browser console for error messages

### "File type rejected"
- ✅ Profile: Only JPG, PNG, WEBP
- ✅ Resume: Only PDF
- ✅ CV: Only PDF

### "Upload folders not created"
- ✅ They're auto-created on first upload
- ✅ Or manually: `mkdir -p server/uploads/profile server/uploads/docs`

### "Files not persisting"
- ✅ Check MongoDB connection
- ✅ Check file is being saved to `/uploads/`
- ✅ Check URL is correctly stored in database

### "Preview not showing"
- ✅ Wait for upload to complete (100%)
- ✅ Refresh page to see latest from database
- ✅ Check browser console for errors

---

## 📱 Public Display

On the public portfolio, display uploads:

```html
<!-- Profile Photo -->
<img src="{{ profileImage }}" alt="Profile">

<!-- Resume Link -->
<a href="{{ resumeUrl }}" target="_blank">Download Resume</a>

<!-- CV Link -->
<a href="{{ cvUrl }}" target="_blank">Download CV</a>
```

Fetch via:
```javascript
const portfolio = await fetch('/api/portfolio/public/profile').then(r => r.json());
console.log(portfolio.profileImage);
console.log(portfolio.resumeUrl);
console.log(portfolio.cvUrl);
```

---

## 🎉 You're All Set!

Your file upload system is now:
- ✅ Secure (JWT + IP whitelist)
- ✅ Validated (file type + size)
- ✅ Persistent (saved to MongoDB)
- ✅ User-friendly (file picker + progress)
- ✅ Production-ready (error handling + cleanup)

**Next Steps:**
1. Test uploads at `http://localhost:5000/admin-uploads.html`
2. Check `/public/uploads/` folders for uploaded files
3. View URLs in MongoDB portfolio document
4. Display on public portfolio page

Happy uploading! 🚀

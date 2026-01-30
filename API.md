# 📡 API Reference & Examples

## Base URL
```
http://localhost:5000
```

## Authentication

### Login (Get JWT Token)

**Endpoint:**
```
POST /api/auth/login
```

**Request:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response (Success):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "success": true
}
```

**Response (Failure):**
```json
{
  "error": "Invalid credentials",
  "success": false
}
```

**Usage:**
```javascript
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'admin',
    password: 'admin123'
  })
});
const data = await response.json();
const token = data.token; // Use in subsequent requests
localStorage.setItem('token', token);
```

---

## Portfolio API (Protected - Requires JWT)

### Add Authorization Header
All protected endpoints require:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Example:**
```javascript
headers: {
  'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
}
```

---

## Public Endpoints (No Auth Required)

### Get All Portfolio Data

**Endpoint:**
```
GET /api/portfolio/public/profile
```

**Response:**
```json
{
  "_id": "...",
  "name": "Parsa",
  "tagline": "Full-Stack Developer",
  "about": "I build web experiences...",
  "email": "parsa@example.com",
  "location": "Telangana, India",
  "profileImage": "/uploads/profile.jpg",
  "resumeUrl": "/uploads/resume.pdf",
  "cvUrl": "/uploads/cv.pdf",
  "socials": [
    { "platform": "GitHub", "url": "https://github.com/..." },
    { "platform": "LinkedIn", "url": "https://linkedin.com/..." }
  ],
  "skills": [
    {
      "category": "Frontend",
      "items": ["HTML", "CSS", "JavaScript", "React"]
    },
    {
      "category": "Backend",
      "items": ["Node.js", "Express", "MongoDB"]
    }
  ],
  "projects": [
    {
      "title": "E-commerce Site",
      "description": "Full-stack shop with MongoDB",
      "tags": ["React", "Node.js", "MongoDB"],
      "imageUrl": "/uploads/project1.jpg",
      "githubLink": "https://github.com/...",
      "liveLink": "https://demo.com",
      "featured": true
    }
  ],
  "achievements": [
    {
      "date": "2025",
      "title": "Hackathon Winner",
      "detail": "Won at tech hackathon"
    }
  ],
  "certificates": [
    {
      "title": "Full-Stack Web Developer",
      "issuer": "Udacity",
      "date": "2024",
      "link": "https://certificate.com",
      "badgeImage": "/uploads/badge.png"
    }
  ],
  "updatedAt": "2025-01-22T10:00:00Z"
}
```

**Usage:**
```javascript
const response = await fetch('http://localhost:5000/api/portfolio/public/profile');
const portfolio = await response.json();
console.log(portfolio.name); // "Parsa"
```

---

## Admin Endpoints (Requires JWT)

### Update Profile

**Endpoint:**
```
PUT /api/portfolio/admin/profile
```

**Request:**
```json
{
  "name": "Parsa",
  "tagline": "Full-Stack Developer",
  "about": "I build amazing web experiences...",
  "email": "parsa@example.com",
  "location": "Telangana, India"
}
```

**Response:**
```json
{
  "success": true,
  "data": { /* updated document */ }
}
```

**Example:**
```javascript
const token = localStorage.getItem('token');
const response = await fetch('http://localhost:5000/api/portfolio/admin/profile', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: 'Parsa',
    tagline: 'Full-Stack Developer',
    about: 'Building amazing web experiences...',
    email: 'parsa@example.com',
    location: 'Telangana, India'
  })
});
const result = await response.json();
if (result.success) {
  console.log('Profile updated!');
}
```

---

### Update Skills

**Endpoint:**
```
PUT /api/portfolio/admin/skills
```

**Request:**
```json
{
  "skills": [
    {
      "category": "Frontend",
      "items": ["HTML", "CSS", "JavaScript", "React", "Tailwind"]
    },
    {
      "category": "Backend",
      "items": ["Node.js", "Express", "MongoDB"]
    },
    {
      "category": "Tools",
      "items": ["Git", "GitHub", "VS Code"]
    }
  ]
}
```

---

### Update Projects

**Endpoint:**
```
PUT /api/portfolio/admin/projects
```

**Request:**
```json
{
  "projects": [
    {
      "title": "E-commerce Website",
      "description": "Full-stack shop with cart and checkout",
      "tags": ["React", "Node.js", "MongoDB"],
      "imageUrl": "/uploads/ecommerce.jpg",
      "githubLink": "https://github.com/parsa/ecommerce",
      "liveLink": "https://ecommerce-demo.vercel.app",
      "featured": true
    },
    {
      "title": "Weather App",
      "description": "Real-time weather and flood prediction",
      "tags": ["React", "API", "Real-time"],
      "imageUrl": "/uploads/weather.jpg",
      "githubLink": "https://github.com/parsa/weather",
      "liveLink": "https://weather-app.vercel.app",
      "featured": false
    }
  ]
}
```

---

### Update Certificates

**Endpoint:**
```
PUT /api/portfolio/admin/certificates
```

**Request:**
```json
{
  "certificates": [
    {
      "title": "Full-Stack Web Development",
      "issuer": "Udacity",
      "date": "2024",
      "link": "https://udacity.com/certificate/123",
      "badgeImage": "/uploads/badge1.png"
    }
  ]
}
```

---

### Update Achievements

**Endpoint:**
```
PUT /api/portfolio/admin/achievements
```

**Request:**
```json
{
  "achievements": [
    {
      "date": "2025",
      "title": "Hackathon Winner",
      "detail": "Won first prize in national hackathon"
    },
    {
      "date": "2024",
      "title": "GitHub Star",
      "detail": "Project reached 100+ stars on GitHub"
    }
  ]
}
```

---

### Update Socials

**Endpoint:**
```
PUT /api/portfolio/admin/socials
```

**Request:**
```json
{
  "socials": [
    { "platform": "GitHub", "url": "https://github.com/parsa" },
    { "platform": "LinkedIn", "url": "https://linkedin.com/in/parsa" },
    { "platform": "Twitter", "url": "https://twitter.com/parsa" },
    { "platform": "Email", "url": "mailto:parsa@example.com" }
  ]
}
```

---

## File Upload Endpoints (Requires JWT)

### Upload Profile Image

**Endpoint:**
```
POST /api/portfolio/admin/upload/profileImage
```

**Request (Form Data):**
```
Content-Type: multipart/form-data

Field: profileImage
Value: [binary image file]
```

**Response:**
```json
{
  "success": true,
  "url": "/uploads/1705913400000.jpg"
}
```

**Example:**
```javascript
const fileInput = document.getElementById('imageInput');
const file = fileInput.files[0];
const formData = new FormData();
formData.append('profileImage', file);

const token = localStorage.getItem('token');
const response = await fetch('http://localhost:5000/api/portfolio/admin/upload/profileImage', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
const result = await response.json();
console.log(result.url); // "/uploads/1705913400000.jpg"
```

---

### Upload Resume

**Endpoint:**
```
POST /api/portfolio/admin/upload/resume
```

**Request (Form Data):**
```
Content-Type: multipart/form-data

Field: resume
Value: [binary PDF file]
```

**Response:**
```json
{
  "success": true,
  "url": "/uploads/1705913400001.pdf"
}
```

---

### Upload CV

**Endpoint:**
```
POST /api/portfolio/admin/upload/cv
```

**Request (Form Data):**
```
Content-Type: multipart/form-data

Field: cv
Value: [binary PDF file]
```

**Response:**
```json
{
  "success": true,
  "url": "/uploads/1705913400002.pdf"
}
```

---

## Complete JavaScript Example

### Full Workflow

```javascript
// 1. Login
async function login() {
  const response = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'admin',
      password: 'admin123'
    })
  });
  
  const data = await response.json();
  if (data.success) {
    localStorage.setItem('token', data.token);
    console.log('✓ Logged in');
  }
}

// 2. Get token
function getToken() {
  return localStorage.getItem('token');
}

// 3. Update profile
async function updateProfile(name, email, about) {
  const response = await fetch('http://localhost:5000/api/portfolio/admin/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify({ name, email, about })
  });
  
  const data = await response.json();
  if (data.success) {
    console.log('✓ Profile updated');
  }
}

// 4. Upload image
async function uploadImage(file) {
  const formData = new FormData();
  formData.append('profileImage', file);
  
  const response = await fetch('http://localhost:5000/api/portfolio/admin/upload/profileImage', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${getToken()}` },
    body: formData
  });
  
  const data = await response.json();
  if (data.success) {
    console.log('✓ Image uploaded:', data.url);
  }
}

// 5. Get portfolio (public)
async function getPortfolio() {
  const response = await fetch('http://localhost:5000/api/portfolio/public/profile');
  const portfolio = await response.json();
  console.log('Portfolio:', portfolio);
}

// Run
await login();
await updateProfile('Parsa', 'parsa@email.com', 'Full-stack developer...');
// await uploadImage(fileFromInput);
await getPortfolio();
```

---

## Error Responses

### 401 Unauthorized (Missing/Invalid JWT)
```json
{
  "error": "No token provided"
}
```

### 401 Invalid Token
```json
{
  "error": "Invalid token"
}
```

### 500 Server Error
```json
{
  "error": "Error message"
}
```

---

## Testing with cURL

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Get portfolio (public)
curl http://localhost:5000/api/portfolio/public/profile

# Update profile (with token)
curl -X PUT http://localhost:5000/api/portfolio/admin/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"name":"Parsa","email":"test@email.com"}'

# Upload file
curl -X POST http://localhost:5000/api/portfolio/admin/upload/profileImage \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "profileImage=@/path/to/image.jpg"
```

---

## Rate Limiting Recommendation

For production, add rate limiting:

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // 100 requests per window
});

app.use(limiter);
```

---

## CORS Configuration

Currently enabled for all origins. For production:

```javascript
app.use(cors({
  origin: 'https://yourdomain.com'
}));
```

---

This API is RESTful and follows standard HTTP conventions. All responses are JSON.

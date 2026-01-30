# 📋 Architecture Overview

## System Design

```
┌─────────────────────────────────────────────────────────────┐
│                      USER BROWSER                           │
├─────────────────────────────────────────────────────────────┤
│  PUBLIC SITE (index.html)    │    ADMIN DASHBOARD (admin.html)  │
│  ✓ Read-only portfolio       │    ✓ Login form                  │
│  ✓ Display data from API     │    ✓ Edit forms                  │
│  ✓ No edit controls          │    ✓ File uploads                │
│  ✓ Theme toggle              │    ✓ Save changes                │
└─────────────────┬────────────────────────────────────────────┘
                  │ HTTP Requests
                  ↓
┌─────────────────────────────────────────────────────────────┐
│                  EXPRESS SERVER (PORT 5000)                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Routes:                                                    │
│  ├─ GET  /           → Serve index.html (public)           │
│  ├─ GET  /admin      → Serve admin.html                    │
│  ├─ GET  /uploads/*  → Serve uploaded files                │
│  │                                                         │
│  ├─ POST /api/auth/login                                   │
│  │   └─ Return JWT token                                   │
│  │                                                         │
│  ├─ GET  /api/portfolio/public/profile    (NO AUTH)        │
│  │   └─ Return all portfolio data                          │
│  │                                                         │
│  ├─ PUT  /api/portfolio/admin/*            (JWT AUTH)      │
│  │   ├─ Update profile, skills, projects, etc.             │
│  │   └─ Save to database                                   │
│  │                                                         │
│  ├─ POST /api/portfolio/admin/upload/*     (JWT AUTH)      │
│  │   ├─ Store files in /server/uploads/                    │
│  │   └─ Save URLs in database                              │
│  │                                                         │
│  Middleware:                                               │
│  ├─ CORS enabled                                           │
│  ├─ JWT verification for admin routes                      │
│  └─ Multer for file uploads                                │
│                                                             │
└─────────────────┬────────────────────────────────────────────┘
                  │ Database Operations
                  ↓
┌─────────────────────────────────────────────────────────────┐
│                      MONGODB                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Database: portfolio_db                                     │
│  Collection: portfolios                                     │
│                                                             │
│  Document Schema:                                           │
│  {                                                          │
│    _id: ObjectId,                                           │
│    name: "Parsa",                                           │
│    tagline: "Full-Stack Developer",                         │
│    about: "...",                                            │
│    email: "parsa@example.com",                              │
│    location: "Telangana, India",                            │
│    profileImage: "/uploads/...",                            │
│    resumeUrl: "/uploads/resume.pdf",                        │
│    cvUrl: "/uploads/cv.pdf",                                │
│    socials: [                                               │
│      { platform: "GitHub", url: "..." },                    │
│      ...                                                    │
│    ],                                                       │
│    skills: [                                                │
│      { category: "Frontend", items: ["React", ...] },       │
│      ...                                                    │
│    ],                                                       │
│    projects: [                                              │
│      { title: "...", description: "...", tags: [...], ...}, │
│      ...                                                    │
│    ],                                                       │
│    achievements: [                                          │
│      { date: "2025", title: "...", detail: "..." },         │
│      ...                                                    │
│    ],                                                       │
│    certificates: [                                          │
│      { title: "...", issuer: "...", date: "...", ... },     │
│      ...                                                    │
│    ],                                                       │
│    updatedAt: Timestamp                                     │
│  }                                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### Public User Views Portfolio
1. Browser loads `http://localhost:5000`
2. Server serves `public/index.html`
3. JavaScript fetches `GET /api/portfolio/public/profile`
4. API returns all saved data
5. Page renders portfolio from data
6. No edit buttons visible

### Admin Edits Content
1. Browser loads `http://localhost:5000/admin`
2. Shows login form
3. Admin enters credentials
4. JavaScript sends `POST /api/auth/login`
5. Server returns JWT token
6. Token stored in localStorage
7. Dashboard loads with edit forms
8. Admin edits content
9. JavaScript sends `PUT /api/portfolio/admin/profile` with JWT
10. Middleware verifies JWT
11. Server updates MongoDB
12. Response sent to admin
13. Admin sees success message
14. Public site automatically reflects changes (next page load)

### File Upload
1. Admin selects file in dashboard
2. JavaScript sends `POST /api/portfolio/admin/upload/*`
3. Multer intercepts, stores in `/server/uploads/`
4. Server updates database with file URL
5. Frontend shows preview
6. Public site fetches URL and displays file

## Security Layers

### JWT Authentication
- Only admin can login
- Token required for all admin API endpoints
- Token expires after 24 hours
- Verified by middleware before processing request

### Protected Routes
```javascript
// Public - anyone can access
GET /api/portfolio/public/profile

// Protected - admin only
PUT  /api/portfolio/admin/*       (requires valid JWT)
POST /api/portfolio/admin/upload/* (requires valid JWT)
```

### File Upload Security
- Stored outside public folder initially
- Served with proper MIME types
- Filenames randomized to prevent conflicts

## Editing Workflow

### Before Changes
Database State: A
Public Site: Displays A
Admin Dashboard: Shows A

### Admin Edits
1. Changes form fields
2. Clicks "Save"
3. Sends updated data to server

### After Save
Database State: B (Updated)
Public Site: Still shows A (until page refresh)
Admin Dashboard: Shows B (instant update in UI)

### Next User Visit
Public Site: Fetches latest data
Displays B automatically

## File Structure in Detail

```
portfolio-app/
│
├── server/
│   │
│   ├── index.js
│   │   └─ Main server: Express setup, middleware, routes
│   │
│   ├── models/
│   │   └─ Portfolio.js
│   │      └─ MongoDB schema and model
│   │
│   ├── routes/
│   │   ├─ auth.js
│   │   │  └─ POST /api/auth/login (no auth needed)
│   │   │
│   │   └─ portfolio.js
│   │      ├─ GET  /api/portfolio/public/profile
│   │      ├─ PUT  /api/portfolio/admin/profile
│   │      ├─ PUT  /api/portfolio/admin/skills
│   │      ├─ PUT  /api/portfolio/admin/projects
│   │      ├─ POST /api/portfolio/admin/upload/*
│   │      └─ (etc.)
│   │
│   ├── middleware/
│   │   └─ auth.js
│   │      └─ JWT verification middleware
│   │
│   └── uploads/
│       └─ Stores uploaded files (images, PDFs)
│
├── public/
│   │
│   ├── index.html
│   │   ├─ Public portfolio page
│   │   ├─ Fetches data with GET /api/portfolio/public/profile
│   │   ├─ Displays: Profile, About, Projects, etc.
│   │   └─ NO edit controls
│   │
│   └── admin.html
│       ├─ Admin dashboard page
│       ├─ Login form (POST /api/auth/login)
│       ├─ Edit forms (PUT /api/portfolio/admin/*)
│       ├─ File uploads (POST /api/portfolio/admin/upload/*)
│       └─ Real-time success/error messages
│
├── package.json
│   └─ Dependencies: express, mongoose, jsonwebtoken, bcryptjs, multer, cors
│
├── .env
│   ├─ MONGODB_URI=mongodb://localhost:27017/portfolio_db
│   ├─ JWT_SECRET=your_secret_key
│   ├─ ADMIN_USERNAME=admin
│   ├─ ADMIN_PASSWORD=admin123
│   └─ PORT=5000
│
└── README.md
    └─ Full documentation
```

## Key Technologies

### Node.js + Express
- HTTP server
- Routing
- Middleware
- Static file serving

### MongoDB
- Document database
- Stores all portfolio data
- Single collection model
- Scalable and flexible

### JWT (JSON Web Tokens)
- Authentication
- Secure admin access
- Token-based instead of sessions
- No password sent with each request

### Multer
- File upload handling
- Multipart form-data
- File validation
- Storage configuration

### Bcrypt
- Password hashing
- Secure credential storage
- Already used in credentials check

## Best Practices Implemented

✅ **Security**
- JWT for API protection
- Password stored securely (in .env, not database)
- Separate admin and public endpoints
- CORS properly configured

✅ **Code Organization**
- Modular routes
- Separate models
- Middleware for auth
- Clear file structure

✅ **User Experience**
- Instant updates in admin dashboard
- Real-time success/error messages
- File upload previews
- Form validation

✅ **Maintainability**
- Clear comments
- Consistent naming
- Documented APIs
- Easy to extend

## Scaling Considerations

### Currently
- Single MongoDB document
- Local file storage
- Basic authentication

### Future Enhancements
- Multiple collections (blog, testimonials, etc.)
- Cloud storage (AWS S3, Cloudinary)
- Database backups
- API rate limiting
- Cache layer (Redis)
- CDN for static files
- Email notifications
- Webhook integrations

---

This architecture is production-ready for a portfolio site and can be extended as needed.

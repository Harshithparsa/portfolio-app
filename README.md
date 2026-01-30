# 🚀 Full-Stack Portfolio App

A professional portfolio website with an admin dashboard for managing content. Built with Node.js, Express, MongoDB, and vanilla JavaScript.

## Features

✅ **Public Portfolio Website**
- Read-only for visitors
- Fetches data from backend API
- Dark/light theme toggle
- Responsive design
- Displays: Profile, About, Skills, Projects, Achievements, Certificates, Contact

✅ **Admin Dashboard**
- Secure login (JWT authentication)
- Edit all portfolio content
- Upload profile picture, resume, and CV
- Manage: Profile, Skills, Certificates, Projects, Achievements, Social Links
- Changes appear instantly on public site

✅ **Security**
- JWT authentication
- Protected admin routes
- Password hashing with bcrypt
- No edit controls visible to public users

## Tech Stack

- **Backend**: Node.js + Express.js
- **Database**: MongoDB
- **Authentication**: JWT + bcrypt
- **File Uploads**: Multer
- **Frontend**: HTML + CSS + Vanilla JavaScript

## Folder Structure

```
portfolio-app/
├── server/
│   ├── index.js              (Main server file)
│   ├── models/
│   │   └── Portfolio.js      (MongoDB schema)
│   ├── routes/
│   │   ├── auth.js           (Login endpoint)
│   │   └── portfolio.js      (API endpoints)
│   ├── middleware/
│   │   └── auth.js           (JWT verification)
│   └── uploads/              (Uploaded files stored here)
├── public/
│   ├── index.html            (Public portfolio)
│   └── admin.html            (Admin dashboard)
├── package.json
├── .env                      (Configuration)
└── README.md
```

## Setup Instructions

### 1. Install MongoDB

**Windows:**
- Download from: https://www.mongodb.com/try/download/community
- Install and run MongoDB service
- Or use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas

**macOS/Linux:**
```bash
# macOS
brew install mongodb-community
brew services start mongodb-community

# Linux
sudo apt-get install -y mongodb
sudo systemctl start mongod
```

### 2. Install Node.js Dependencies

```bash
cd portfolio-app
npm install
```

### 3. Configure Environment

Edit `.env` file and update if needed:
```
MONGODB_URI=mongodb://localhost:27017/portfolio_db
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
PORT=5000
NODE_ENV=development
```

### 4. Start the Server

```bash
npm start
```

Or for development (auto-reload):
```bash
npm install -g nodemon  # Install once globally
npm run dev
```

Server will run on: http://localhost:5000

### 5. Access the Applications

- **Public Portfolio**: http://localhost:5000
- **Admin Dashboard**: http://localhost:5000/admin
  - Username: `admin`
  - Password: `admin123`

## How to Use

### For Visitors (Public Site)

1. Open http://localhost:5000
2. View your portfolio (read-only)
3. Click "Admin" link to access dashboard

### For Admin (Dashboard)

1. Go to http://localhost:5000/admin
2. Login with credentials (default: admin/admin123)
3. Edit any section using the tabs:
   - **Profile**: Name, tagline, about, email, location, profile picture
   - **Skills**: Add skill categories with items
   - **Certificates**: Add certifications with issuer and link
   - **Projects**: Add projects with GitHub and live demo links
   - **Achievements**: Add timeline achievements

4. Upload files:
   - Profile image (in Profile tab)
   - Resume PDF
   - CV PDF

5. Click "Save" button for each section
6. Changes appear instantly on public site

## API Endpoints

### Public (No Auth Required)
- `GET /api/portfolio/public/profile` - Get all portfolio data

### Admin (JWT Required)
- `POST /api/auth/login` - Login to admin
- `PUT /api/portfolio/admin/profile` - Update profile
- `PUT /api/portfolio/admin/skills` - Update skills
- `PUT /api/portfolio/admin/certificates` - Update certificates
- `PUT /api/portfolio/admin/projects` - Update projects
- `PUT /api/portfolio/admin/achievements` - Update achievements
- `POST /api/portfolio/admin/upload/profileImage` - Upload profile photo
- `POST /api/portfolio/admin/upload/resume` - Upload resume
- `POST /api/portfolio/admin/upload/cv` - Upload CV

## File Upload Locations

All uploaded files are stored in:
```
server/uploads/
```

They're served at:
```
http://localhost:5000/uploads/<filename>
```

## Customization

### Change Admin Credentials

Edit `.env`:
```
ADMIN_USERNAME=your_username
ADMIN_PASSWORD=your_password
```

### Change JWT Secret

Edit `.env` (important for production):
```
JWT_SECRET=very_long_random_secret_key_min_32_chars
```

### Change MongoDB Connection

Edit `.env`:
```
# Local
MONGODB_URI=mongodb://localhost:27017/portfolio_db

# MongoDB Atlas (cloud)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/portfolio_db
```

### Modify Colors/Theme

Edit `public/index.html` and `public/admin.html` CSS variables:
```css
:root {
  --primary: #2563EB;
  --accent: #10B981;
  --bg: #F8FAFC;
  --card: #FFFFFF;
  --text: #0F172A;
  /* ... */
}
```

## Troubleshooting

**"Cannot connect to MongoDB"**
- Make sure MongoDB is running
- Check connection string in `.env`
- If using local: `mongod` service must be running

**"CORS error when loading data"**
- CORS is already enabled in server
- Check browser console for exact error
- Make sure API_BASE URL in frontend matches server port

**"Admin login not working"**
- Check username/password in `.env`
- Refresh page and try again
- Check browser console for error messages

**"Files not uploading"**
- Check `server/uploads/` folder permissions
- Make sure folder exists
- Check browser console and server logs

## Deployment

### For Production

1. Update `.env`:
```
JWT_SECRET=generate_very_long_random_key
NODE_ENV=production
MONGODB_URI=your_production_mongodb_url
ADMIN_PASSWORD=strong_password
```

2. Use Heroku, Vercel, Railway, or any Node.js host

3. Set environment variables on hosting platform

4. Run: `npm start`

## Security Tips

1. **Change default credentials** in `.env`
2. **Use strong JWT secret** (at least 32 characters)
3. **Use HTTPS** in production
4. **Store `.env` in `.gitignore`** (never commit!)
5. **Use environment variables** for sensitive data
6. **Enable CORS only for your domain** in production

## Next Steps

### Enhance your portfolio:
- Add project images
- Add more certificates
- Add social links
- Upload resume/CV
- Customize colors and fonts
- Deploy to web

### Advanced:
- Add email notifications on form submission
- Add analytics
- Add blog section
- Connect to GitHub API for projects
- Add comments/feedback form

## Support

For issues or questions:
1. Check error messages in browser console
2. Check server terminal logs
3. Review `.env` configuration
4. Ensure MongoDB is running

## License

Free to use and modify for personal projects.

---

**Built with ❤️ for portfolio management**

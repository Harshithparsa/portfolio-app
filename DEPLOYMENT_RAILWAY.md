# Railway Deployment Configuration

For Railway.app deployment, follow these steps:

## 1. Connect Your Repository

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub"
4. Connect your GitHub account and select the portfolio repository

## 2. Set Environment Variables

In Railway Dashboard, go to Variables and add:

```env
NODE_ENV=production
MONGODB_URI=your_mongodb_connection_string
REDIS_URL=your_redis_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
ADMIN_EMAIL=admin@parsa.dev
ADMIN_SECRET_ROUTE=/admin-parsa-7734
SITE_URL=https://your-deployed-url.railway.app
```

## 3. Create Services in Railway

Railway will auto-detect the Node.js application, but you can add database services:

### MongoDB Plugin
- Click "Add Service"
- Select "MongoDB"
- Railway auto-provisions and provides connection string

### Redis Plugin
- Click "Add Service"
- Select "Redis"
- Railway auto-provisions and provides connection string

## 4. Configure Start Command

The start command is already configured in package.json:
```json
"start": "node server/index.js"
```

## 5. Deploy

Simply push to your GitHub `main` branch:
```bash
git push origin main
```

Railway automatically:
- Detects Node.js application
- Installs dependencies
- Builds the application
- Deploys to production
- Provides HTTPS SSL certificate

## 6. Custom Domain

1. Go to Railway Dashboard
2. Select your project
3. Click "Settings"
4. Add custom domain (e.g., parsa.dev)
5. Update DNS records to Railway's CNAME

## 7. Monitoring & Logs

- View real-time logs in Railway Dashboard
- Check deployment status
- Monitor resource usage
- Set up alerts for failures

## 8. Backup & Restore

For MongoDB backups in Railway:
```bash
railway mongo --backup
```

To restore:
```bash
railway mongo --restore <backup-id>
```

## Useful Railway Commands

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Link project
railway link

# View logs
railway logs

# View variables
railway variables

# Deploy
railway deploy

# Shell access
railway shell
```

## Cost Estimation

Railway provides free tier with:
- $5/month free credit
- Includes small database instances
- Perfect for portfolio projects

For continuous deployment with generous free tier, Railway is recommended.

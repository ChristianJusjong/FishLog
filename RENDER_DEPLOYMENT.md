# FishLog - Render.com Deployment Guide

Deploy FishLog to Render.com in **under 10 minutes** with free hosting!

## Why Render.com?

✅ **Simple setup** - No complex configuration
✅ **Free tier** - 750 hours/month free (good for testing)
✅ **Free PostgreSQL** - 90 days free, then $7/month
✅ **Auto-deploy** - Push to GitHub = automatic deployment
✅ **Free SSL** - HTTPS included
✅ **Easy to use** - Great dashboard and logs

## Cost Breakdown

### Free Tier (Perfect for Testing)
```
Web Service (Free):         750 hours/month = ~$0
PostgreSQL (Free):          90 days free
After 90 days:              $7/month
---------------------------------
First 90 days:              FREE
After 90 days:              $7/month
```

### Production (Recommended)
```
Web Service (Starter):      $7/month (always-on, faster)
PostgreSQL (Starter):       $7/month (after free trial)
---------------------------------
Total:                      $14/month
```

### Comparison with Other Platforms
- **Render**: $0-14/month
- **Railway**: $10-20/month
- **Google Cloud**: $15-50/month
- **Heroku**: $7-25/month

## Prerequisites

1. **Render.com account** (free)
   - Sign up at: https://render.com/
   - Connect your GitHub account

2. **GitHub repository**
   - Your FishLog code should be in a GitHub repo

3. **That's it!** No CLI tools or Docker required

## Deployment Steps

### Step 1: Push Code to GitHub

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit - ready for Render deployment"

# Create GitHub repo and push
# Go to: https://github.com/new
# Then:
git remote add origin https://github.com/YOUR_USERNAME/fishlog.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Render (Automatic Method)

1. **Click the Deploy Button**

   [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

   Or manually:

2. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com/

3. **Click "New +"** → **"Blueprint"**

4. **Connect GitHub Repository**
   - Select your FishLog repository
   - Render will auto-detect `render.yaml`
   - Click **"Apply"**

5. **Wait for Deployment** (5-10 minutes)
   - Render will create:
     - PostgreSQL database
     - Web service (backend)
     - Configure environment variables
     - Run database migrations
     - Deploy your app

6. **Done!** 🎉
   - Your backend URL: `https://fishlog-backend.onrender.com`

### Step 3: Enable PostGIS Extension

Render's PostgreSQL needs PostGIS manually enabled:

1. **Go to Database Dashboard**
   - Dashboard → Your database → "Shell" tab

2. **Run this command:**
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   ```

3. **Verify:**
   ```sql
   SELECT PostGIS_version();
   ```

### Step 4: Configure Environment Variables

Some variables need manual configuration:

1. **Go to Web Service Settings**
   - Dashboard → fishlog-backend → "Environment"

2. **Add these variables** (if using OAuth/Cloudinary):

   ```
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   CLOUDINARY_CLOUD_NAME=your-cloudinary-name
   CLOUDINARY_API_KEY=your-cloudinary-key
   CLOUDINARY_API_SECRET=your-cloudinary-secret
   ```

3. **Click "Save Changes"** - App will auto-redeploy

### Step 5: Run Database Migrations

Migrations should run automatically on deployment. To run manually:

1. **Go to Web Service**
   - Dashboard → fishlog-backend → "Shell" tab

2. **Run migrations:**
   ```bash
   cd /app
   npx prisma migrate deploy
   ```

### Step 6: Test Your Deployment

```bash
# Test health endpoint
curl https://fishlog-backend.onrender.com/health

# Expected response:
# {"status":"healthy","timestamp":"...","database":"connected","version":"1.0.0"}
```

### Step 7: Update Mobile App

Update the API URL in your mobile app:

**Edit `apps/mobile/app/index.tsx`:**
```typescript
const API_URL = 'https://fishlog-backend.onrender.com';
```

Or use environment variable:
```bash
# In apps/mobile/.env
EXPO_PUBLIC_API_URL=https://fishlog-backend.onrender.com
```

## Alternative: Manual Deployment (Without render.yaml)

If you prefer manual setup:

### 1. Create PostgreSQL Database

1. Dashboard → **"New +"** → **"PostgreSQL"**
2. Name: `fishlog-db`
3. Database: `fishlog`
4. User: (auto-generated)
5. Region: Oregon (or closest to you)
6. Plan: **Free** or **Starter**
7. Click **"Create Database"**
8. **Copy the Internal Database URL**

### 2. Create Web Service

1. Dashboard → **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `fishlog-backend`
   - **Region**: Oregon (same as database)
   - **Branch**: `main`
   - **Root Directory**: (leave empty)
   - **Environment**: **Docker**
   - **Dockerfile Path**: `./apps/backend/Dockerfile`
   - **Docker Context**: `.`
   - **Plan**: **Free** or **Starter**

4. **Add Environment Variables**:
   ```
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=<paste internal database URL>
   JWT_SECRET=<generate random string>
   JWT_EXPIRES_IN=7d
   ```

5. Click **"Create Web Service"**

### 3. Configure Health Check

1. Go to service **"Settings"**
2. Scroll to **"Health Check Path"**
3. Set to: `/health`
4. Save

## Automated Deployments

Render automatically deploys when you push to GitHub:

```bash
# Make changes to your code
git add .
git commit -m "Update feature"
git push origin main

# Render automatically detects the push and deploys!
# Watch progress in Dashboard → Logs
```

## Database Management

### Access Database

**Option 1: Render Shell (Web)**
1. Dashboard → Database → **"Shell"** tab
2. Run SQL commands directly

**Option 2: psql (Local)**
```bash
# Get External Database URL from Render Dashboard
# Dashboard → Database → "Connections" → "External Database URL"

psql "postgresql://username:password@host:5432/fishlog"
```

**Option 3: Prisma Studio**
```bash
cd apps/backend

# Set DATABASE_URL from Render Dashboard
export DATABASE_URL="postgresql://..."

# Run Prisma Studio
npm run db:studio
# Opens at http://localhost:5555
```

### Run Migrations

**Automatic** (on every deploy):
- Migrations run automatically if you add a build command

**Manual**:
1. Dashboard → Service → **"Shell"** tab
2. Run:
   ```bash
   cd /app
   npx prisma migrate deploy
   ```

### Backup & Restore

**Automatic Backups:**
- Render creates daily backups (retained for 7 days on Starter plan)
- Backups available in Database → "Backups" tab

**Manual Backup:**
```bash
# Get External Database URL from Dashboard
pg_dump "postgresql://..." > backup.sql
```

**Restore:**
```bash
psql "postgresql://..." < backup.sql
```

## Monitoring & Logs

### View Logs

1. **Dashboard → Service → "Logs" tab**
2. **Real-time logs** (updates live)
3. **Search/filter** by keyword

Or use Render CLI:
```bash
# Install Render CLI
npm install -g render-cli

# Login
render login

# View logs
render logs fishlog-backend
```

### Metrics & Performance

1. **Dashboard → Service → "Metrics" tab**
   - CPU usage
   - Memory usage
   - Request rate
   - Response time

### Alerts

Set up email alerts:
1. Dashboard → Service → **"Settings"** → **"Notifications"**
2. Enable:
   - Deploy notifications
   - Service health alerts

## Scaling & Upgrading

### Upgrade from Free to Starter ($7/month)

**Benefits:**
- Always-on (no cold starts)
- Faster response times
- More CPU/Memory
- Better for production

**How to upgrade:**
1. Dashboard → Service → **"Settings"**
2. Scroll to **"Instance Type"**
3. Change from **"Free"** to **"Starter"**
4. Click **"Save Changes"**

### Horizontal Scaling

For high traffic, add more instances:
1. Dashboard → Service → **"Settings"**
2. **"Scaling"** section
3. Increase **"Number of Instances"** (requires Pro plan)

## Custom Domain

Add your own domain (e.g., api.yourapp.com):

1. **Dashboard → Service → "Settings" → "Custom Domain"**
2. Click **"Add Custom Domain"**
3. Enter domain: `api.yourapp.com`
4. Add DNS records (shown in dashboard):
   ```
   Type: CNAME
   Name: api
   Value: fishlog-backend.onrender.com
   ```
5. Wait for DNS propagation (5-60 minutes)
6. SSL certificate automatically provisioned

## Troubleshooting

### Service won't start

1. **Check build logs**
   - Dashboard → Service → "Logs"
   - Look for errors during build

2. **Common issues:**
   - Missing environment variables
   - Database connection failed
   - Dockerfile errors

3. **Verify DATABASE_URL**
   - Should be internal URL (from database connections)
   - Format: `postgresql://user:pass@host:5432/dbname`

### Database connection errors

1. **Use Internal Database URL** (not external)
   - Dashboard → Database → "Connections" → "Internal Database URL"

2. **Verify PostGIS extension**
   ```sql
   SELECT PostGIS_version();
   ```

3. **Check database is running**
   - Dashboard → Database → Status should be "Available"

### Slow cold starts (Free tier)

**Problem:** Free tier services spin down after 15 minutes of inactivity

**Solutions:**
1. Upgrade to Starter plan ($7/month) - services stay always-on
2. Use a ping service to keep it awake (cron-job.org, UptimeRobot)
3. Accept the cold start delay for low-traffic apps

### Build fails

1. **Check Dockerfile path** in render.yaml
2. **Verify Docker context** is set to `.` (root directory)
3. **Check build logs** for specific errors

## Cost Optimization

### Stay on Free Tier
- Use free tier for development/testing
- 750 hours = ~31 days for one service
- Database free for 90 days

### Minimize Costs
1. **Use Free Tier initially** - Test before upgrading
2. **Same region** - Database and service in same region (reduces latency)
3. **Monitor usage** - Dashboard shows usage stats
4. **Suspend when not needed** - Suspend services during long breaks

### When to Upgrade
- **App goes to production** → Upgrade to Starter
- **Need always-on** → Upgrade to avoid cold starts
- **More traffic** → Increase resources or instances

## Comparison: Render vs Others

| Feature | Render (Free) | Render (Starter) | Railway | Google Cloud |
|---------|---------------|------------------|---------|--------------|
| **Cost** | $0 | $7/mo | ~$10/mo | ~$15/mo |
| **Setup Time** | 5 min | 5 min | 5 min | 30 min |
| **Database** | Free 90d | $7/mo | Included | ~$10/mo |
| **Always-on** | No | Yes | Yes | Yes |
| **Auto-deploy** | Yes | Yes | Yes | Optional |
| **SSL** | Free | Free | Free | Free |
| **Ease of Use** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

## Next Steps

1. ✅ **Deploy to Render** (follow steps above)
2. 🔐 **Set up OAuth** (Google/Facebook login)
3. 📱 **Update mobile app** with production API URL
4. 🎨 **Configure Cloudinary** for image uploads
5. 📊 **Set up monitoring** with email alerts
6. 🌐 **Add custom domain** (optional)
7. 📱 **Deploy mobile app** to App Store/Play Store

## Useful Links

- [Render Dashboard](https://dashboard.render.com/)
- [Render Documentation](https://render.com/docs)
- [Render Status Page](https://status.render.com/)
- [Render Community Forum](https://community.render.com/)
- [Render Pricing](https://render.com/pricing)

## Support

Need help?
1. Check [Render Documentation](https://render.com/docs)
2. Search [Render Community Forum](https://community.render.com/)
3. Check service logs in Dashboard
4. Contact Render Support (support@render.com)

---

**You're all set!** 🚀

Your FishLog app will be running 24/7 in the cloud. Push to GitHub and watch it automatically deploy!

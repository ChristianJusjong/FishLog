# Railway Deployment Troubleshooting

## Current Issue: 502 Error - Application Failed to Respond

Your backend is deployed at: https://fishlog-production.up.railway.app

### Root Cause
The 502 error occurs because the application cannot start successfully. This is likely due to:
1. Database migration failures
2. Missing PostGIS extension on the database
3. Database connection issues
4. Missing environment variables

## Step-by-Step Fix

### 1. Enable PostGIS Extension on Railway Database

**Option A: Using Railway Dashboard (Recommended)**
1. Go to your Railway dashboard: https://railway.app/dashboard
2. Open your FishLog project
3. Click on your **PostgreSQL database** service (not the backend)
4. Go to the **"Data"** tab
5. Click **"Query"** to open the SQL query interface
6. Run this SQL command:
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   ```
7. Verify it was created:
   ```sql
   SELECT * FROM pg_extension WHERE extname = 'postgis';
   ```

**Option B: Using Railway CLI**
```bash
# Install Railway CLI if you haven't
npm install -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Connect to PostgreSQL
railway run psql $DATABASE_URL

# In the psql prompt:
CREATE EXTENSION IF NOT EXISTS postgis;
\dx postgis
\q
```

### 2. Check Environment Variables

Go to your backend service settings and verify these environment variables are set:

**Required Variables:**
- `DATABASE_URL` - Should be automatically linked from your PostgreSQL service
- `PORT` - Set to `3000` (or Railway's default)
- `JWT_SECRET` - A secure random string (e.g., generated from Railway's "Generate" button)
- `JWT_REFRESH_SECRET` - Another secure random string
- `NODE_ENV` - Set to `production`

**Optional OAuth Variables (if using social login):**
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_CALLBACK_URL`
- `FACEBOOK_APP_ID`
- `FACEBOOK_APP_SECRET`
- `FACEBOOK_CALLBACK_URL`
- `FRONTEND_URL` - Your mobile app or frontend URL

### 3. Check Build Logs

1. Go to your Railway dashboard
2. Click on your **backend service**
3. Click on the **"Deployments"** tab
4. Click on the most recent deployment
5. Click **"View Logs"**

Look for error messages in:
- **Build Phase**: TypeScript compilation errors, missing dependencies
- **Deploy Phase**: Migration failures, database connection errors, startup errors

### 4. Common Log Errors and Solutions

**Error: "Can't reach database server"**
- Solution: Make sure your database service is running and DATABASE_URL is set

**Error: "Extension postgis does not exist"**
- Solution: Enable PostGIS extension (see Step 1)

**Error: "ECONNREFUSED" or "Connection refused"**
- Solution: Check if DATABASE_URL variable is correctly set and database is running

**Error: "prisma: command not found"**
- Solution: This should now be fixed with the updated Dockerfile

**Error: "Port already in use"**
- Solution: Railway should handle this automatically. Check if PORT env var is set correctly.

### 5. Force Redeploy

After fixing the PostGIS extension and environment variables:

**Option A: Using Git (Recommended)**
```bash
# Make a small change to force redeploy
cd C:\ClaudeCodeProject\FishLog
git add .
git commit -m "fix: Enable PostGIS and update Railway config"
git push origin main
```

**Option B: Using Railway Dashboard**
1. Go to your backend service in Railway
2. Click the **"..."** menu (three dots)
3. Select **"Redeploy"**

### 6. Test the Deployment

Once redeployed, test the health endpoint:

```bash
# Windows Command Prompt
curl https://fishlog-production.up.railway.app/health

# Or test with PowerShell
Invoke-WebRequest -Uri https://fishlog-production.up.railway.app/health
```

Expected response:
```json
{"status":"ok","timestamp":"2025-11-05T..."}
```

### 7. Test API Endpoints

After the health check passes:

```bash
# Test auth endpoints
curl https://fishlog-production.up.railway.app/auth/google
curl https://fishlog-production.up.railway.app/auth/facebook

# These should redirect to OAuth login pages or return configuration errors
# if OAuth credentials are not set (which is expected)
```

## What Was Changed

### Files Updated:
1. **railway.toml** - Fixed start command path
2. **apps/backend/Dockerfile** - Added Prisma CLI availability in production
3. **apps/backend/src/middleware/auth.ts** - Added authenticate export alias
4. **apps/backend/src/utils/jwt.ts** - Added id field to TokenPayload
5. **apps/backend/src/routes/auth.ts** - Updated token generation (6 instances)
6. **apps/backend/src/routes/badges.ts** - Fixed type errors and response schemas
7. **apps/backend/src/services/badgeService.ts** - Added getBadgeById method

### Migration File:
- `apps/backend/prisma/migrations/20251030102413_init/migration.sql` already includes PostGIS extension creation

## Still Having Issues?

### Check Railway Logs
The most important step is to check the actual error messages in Railway logs:

1. Railway Dashboard → Your Project → Backend Service
2. Click "Deployments" tab
3. Click latest deployment
4. Click "View Logs"
5. Look for red error messages

### Common Issues:

**Build Succeeds but Deploy Fails**
- Usually a database connection or migration issue
- Check DATABASE_URL is set
- Check PostGIS extension is enabled
- Check migration logs in deployment logs

**Health Check Fails**
- App is starting but not binding to the correct port
- Railway automatically sets PORT - make sure your app respects process.env.PORT

**Migrations Fail**
- PostGIS extension not enabled
- Database credentials incorrect
- Network connectivity between services

## Next Steps After Successful Deployment

1. **Update Mobile App** with production URL:
   ```typescript
   // In your mobile app config
   const API_URL = 'https://fishlog-production.up.railway.app';
   ```

2. **Set up OAuth Credentials** if using social login:
   - Google Cloud Console for Google OAuth
   - Facebook Developers for Facebook OAuth
   - Update callback URLs to point to your Railway URL

3. **Test all endpoints** systematically:
   - Authentication
   - User registration/login
   - Catch management
   - Friends system
   - Badges system
   - Events/contests

4. **Monitor Performance**:
   - Check Railway metrics for CPU/memory usage
   - Monitor database connection pool
   - Set up logging/monitoring if needed

## Cost Optimization

Railway free tier includes:
- $5 credit per month
- All resources count against this credit

To stay within free tier:
- Monitor your usage in Railway dashboard
- Database should sleep when inactive
- Backend will sleep after 10 minutes of inactivity (free tier)

If you need always-on:
- Upgrade to Developer plan ($5/month + usage)
- Or consider alternatives like Render.com, Fly.io, Railway hobby plan

## Support

If you continue having issues:
1. Check Railway's status page: https://railway.statuspage.io/
2. Railway Discord: https://discord.gg/railway
3. Railway Documentation: https://docs.railway.app/
4. GitHub Issues: Your repository issues tab

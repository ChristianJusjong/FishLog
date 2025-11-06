# How to Host Your Privacy Policy

Google Play Store requires a publicly accessible Privacy Policy URL. Here are your options.

---

## 🎯 Option 1: Host on Your Railway Backend (Recommended)

Host the privacy policy on your existing Railway backend server.

### Implementation Steps

**1. Create HTML version of privacy policy**

Create: `apps/backend/public/privacy-policy.html`

```html
<!DOCTYPE html>
<html lang="da">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hook - Privacy Policy</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 {
            color: #1E3F40;
            border-bottom: 3px solid #FF7F3F;
            padding-bottom: 10px;
        }
        h2 {
            color: #1E3F40;
            margin-top: 30px;
        }
        h3 {
            color: #2D5555;
        }
        a {
            color: #FF7F3F;
        }
        .last-updated {
            color: #666;
            font-style: italic;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Privacy Policy for Hook</h1>
        <p class="last-updated">Last Updated: November 6, 2025</p>

        <!-- Copy content from PRIVACY_POLICY.md and convert to HTML -->
        <!-- See full HTML template below -->

    </div>
</body>
</html>
```

**2. Add static file serving to Fastify backend**

Update: `apps/backend/src/index.ts`

```typescript
import fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import path from 'path';

const server = fastify({ logger: true });

// Serve static files
server.register(fastifyStatic, {
  root: path.join(__dirname, '../public'),
  prefix: '/',
});

// Privacy policy route
server.get('/privacy-policy', async (request, reply) => {
  return reply.sendFile('privacy-policy.html');
});

// Terms of service route (optional)
server.get('/terms', async (request, reply) => {
  return reply.sendFile('terms-of-service.html');
});
```

**3. Install @fastify/static**

```bash
cd apps/backend
npm install @fastify/static
```

**4. Create public directory**

```bash
cd apps/backend
mkdir public
```

**5. Add privacy-policy.html to public directory**

Copy the full HTML version of your privacy policy.

**6. Test locally**

```bash
cd apps/backend
npm run dev

# Visit in browser:
# http://localhost:3000/privacy-policy
```

**7. Deploy to Railway**

```bash
git add .
git commit -m "Add privacy policy hosting"
git push
```

**8. Verify production URL**

Visit: `https://hook-production.up.railway.app/privacy-policy`

**9. Add URL to Play Store**

Use: `https://hook-production.up.railway.app/privacy-policy`

---

## 🎯 Option 2: Use GitHub Pages (Free)

Host your privacy policy on GitHub Pages for free.

### Implementation Steps

**1. Create a new repository or use existing**

```bash
# Option A: Create new repo
# Go to GitHub.com → New Repository → "hook-privacy"

# Option B: Use existing Hook repo
cd Hook
mkdir docs
cd docs
```

**2. Create index.html with privacy policy**

```html
<!-- docs/index.html -->
<!DOCTYPE html>
<html lang="da">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hook Privacy Policy</title>
    <!-- Copy same style and content as Option 1 -->
</head>
<body>
    <!-- Privacy policy content -->
</body>
</html>
```

**3. Enable GitHub Pages**

1. Go to repository → Settings
2. Scroll to "Pages" section
3. Source: Deploy from branch
4. Branch: main, folder: /docs
5. Save

**4. Wait 1-2 minutes for deployment**

**5. Access at:**

```
https://[your-username].github.io/hook-privacy/
```

**6. (Optional) Add custom domain**

If you own a domain like `hook.app`:
- Add CNAME record: `privacy.hook.app` → `[username].github.io`
- Configure in GitHub Pages settings

---

## 🎯 Option 3: Free Privacy Policy Generators with Hosting

Use a service that generates AND hosts your privacy policy.

### Recommended Services (Free)

**1. TermsFeed**
- URL: https://www.termsfeed.com/privacy-policy-generator/
- Hosts for free
- Professional looking
- Easy to update

**2. FreePrivacyPolicy.com**
- URL: https://www.freeprivacypolicy.com/
- Free hosting
- Custom branding
- Good for apps

**3. PrivacyPolicies.com**
- URL: https://www.privacypolicies.com/
- Free generator
- Host on their servers
- Quick setup

### Steps:

1. Choose a service above
2. Answer their questionnaire about your app
3. Generate privacy policy
4. They provide a hosted URL
5. Copy URL to Play Store listing

---

## 🎯 Option 4: Google Sites (Free)

Create a simple Google Site to host your privacy policy.

### Steps:

1. Go to https://sites.google.com
2. Create new site
3. Add title: "Hook Privacy Policy"
4. Paste privacy policy content
5. Publish
6. Copy the generated URL
7. Use in Play Store

**Example URL:**
```
https://sites.google.com/view/hook-privacy
```

---

## 📋 Full HTML Template

Here's a complete HTML template for your privacy policy:

```html
<!DOCTYPE html>
<html lang="da">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hook - Privacy Policy</title>
    <meta name="description" content="Privacy Policy for Hook - Your Digital Fishing Log">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f0f2f5;
        }

        .header {
            background: #1E3F40;
            color: white;
            padding: 40px 20px;
            text-align: center;
        }

        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }

        .header p {
            opacity: 0.9;
        }

        .container {
            max-width: 800px;
            margin: 40px auto;
            padding: 40px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .last-updated {
            background: #FF7F3F;
            color: white;
            padding: 10px 20px;
            border-radius: 4px;
            margin-bottom: 30px;
            font-weight: bold;
        }

        h2 {
            color: #1E3F40;
            margin-top: 30px;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #FF7F3F;
        }

        h3 {
            color: #2D5555;
            margin-top: 20px;
            margin-bottom: 10px;
        }

        p, li {
            margin-bottom: 10px;
        }

        ul {
            margin-left: 20px;
            margin-bottom: 15px;
        }

        a {
            color: #FF7F3F;
            text-decoration: none;
        }

        a:hover {
            text-decoration: underline;
        }

        .contact-box {
            background: #f0f2f5;
            padding: 20px;
            border-radius: 4px;
            margin-top: 30px;
        }

        .footer {
            text-align: center;
            padding: 20px;
            color: #666;
            margin-top: 40px;
        }

        @media (max-width: 768px) {
            .container {
                margin: 20px;
                padding: 20px;
            }

            .header h1 {
                font-size: 1.8em;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🐟 Hook</h1>
        <p>Privacy Policy</p>
    </div>

    <div class="container">
        <div class="last-updated">
            Last Updated: November 6, 2025
        </div>

        <h2>Introduction</h2>
        <p>Welcome to Hook ("we," "our," or "us"). We are committed to protecting your privacy and personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application Hook (the "App").</p>

        <!-- Continue with full privacy policy content -->
        <!-- Copy from PRIVACY_POLICY.md and format as HTML -->

        <h2>Contact Us</h2>
        <div class="contact-box">
            <p>If you have questions about this Privacy Policy, please contact us:</p>
            <ul>
                <li><strong>Email:</strong> <a href="mailto:privacy@hook.app">privacy@hook.app</a></li>
                <li><strong>Support:</strong> <a href="mailto:support@hook.app">support@hook.app</a></li>
                <li><strong>Website:</strong> <a href="https://hook-production.up.railway.app">hook-production.up.railway.app</a></li>
            </ul>
        </div>
    </div>

    <div class="footer">
        <p>&copy; 2025 Hook. All rights reserved.</p>
    </div>
</body>
</html>
```

---

## ✅ Verification Checklist

After hosting your privacy policy:

- [ ] Privacy policy is accessible via public URL
- [ ] URL works on mobile devices
- [ ] URL works without authentication
- [ ] Content is readable and formatted correctly
- [ ] All links work (email, support, etc.)
- [ ] Mobile-responsive design
- [ ] HTTPS enabled (if using custom hosting)
- [ ] Page loads quickly
- [ ] No errors in browser console
- [ ] Last updated date is current

---

## 🚀 Quick Setup Command (Option 1 - Railway)

```bash
# Navigate to backend
cd apps/backend

# Create public directory
mkdir -p public

# Install static file serving
npm install @fastify/static

# Create privacy policy file
# (Copy HTML template to public/privacy-policy.html)

# Test locally
npm run dev
# Visit: http://localhost:3000/privacy-policy

# Deploy
git add .
git commit -m "Add privacy policy page"
git push

# Verify production
# Visit: https://hook-production.up.railway.app/privacy-policy
```

---

## 📝 Privacy Policy URL for Play Store

After hosting, add this URL to Google Play Console:

**Store Listing → Privacy Policy**
```
https://hook-production.up.railway.app/privacy-policy
```

---

## ⚠️ Important Notes

1. **Accessibility**: Privacy policy MUST be publicly accessible (no login required)
2. **HTTPS**: Use HTTPS (Railway provides this automatically)
3. **Mobile-Friendly**: Must be readable on mobile devices
4. **Keep Updated**: Update when you change data practices
5. **Compliance**: Ensure content matches your actual practices

---

## 🔄 Updating Your Privacy Policy

When you need to update:

1. **Edit the HTML file** (or regenerate with service)
2. **Update "Last Updated" date**
3. **Deploy changes** (git push for Railway)
4. **Notify users** (in-app notification if major changes)
5. **Keep old versions** (for compliance tracking)

---

*Choose the option that works best for you. Option 1 (Railway) is recommended since you already have the infrastructure!*

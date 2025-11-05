# Deployment Guide

## Quick Deploy Options

### Option 1: Deploy to Netlify (Recommended)

#### Via Netlify UI (Easiest):

1. Go to [netlify.com](https://netlify.com) and sign up/login
2. Click "Add new site" → "Import an existing project"
3. Connect to your Git provider (GitHub, GitLab, etc.)
4. Select this repository
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
6. Add environment variables:
   - Click "Show advanced" → "New variable"
   - Add `VITE_SUPABASE_URL`: `https://0ec90b57d6e95fcbda19832f.supabase.co`
   - Add `VITE_SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJib2x0IiwicmVmIjoiMGVjOTBiNTdkNmU5NWZjYmRhMTk4MzJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4ODE1NzQsImV4cCI6MTc1ODg4MTU3NH0.9I8-U0x86Ak8t2DGaIk0HfvTSLsAyzdnz-Nw00mMkKw`
7. Click "Deploy site"

Your site will be live in a few minutes! Netlify will provide you with a URL like: `https://your-site-name.netlify.app`

#### Via Netlify CLI:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
```

### Option 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click "New Project"
3. Import your Git repository
4. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Click "Deploy"

### Option 3: Deploy to GitHub Pages

1. Install gh-pages:
   ```bash
   npm install -D gh-pages
   ```

2. Add to package.json:
   ```json
   {
     "homepage": "https://yourusername.github.io/your-repo",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. Deploy:
   ```bash
   npm run deploy
   ```

### Option 4: Manual Deployment

If you have the built files in the `dist` folder, you can deploy them to any static hosting:

**AWS S3:**
```bash
aws s3 sync dist/ s3://your-bucket-name --acl public-read
```

**Azure Static Web Apps:**
```bash
az staticwebapp create --name your-app-name --resource-group your-rg --location "Central US"
```

**Firebase Hosting:**
```bash
firebase init hosting
firebase deploy
```

## Environment Variables

Make sure to set these environment variables in your hosting platform:

```
VITE_SUPABASE_URL=https://0ec90b57d6e95fcbda19832f.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJib2x0IiwicmVmIjoiMGVjOTBiNTdkNmU5NWZjYmRhMTk4MzJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4ODE1NzQsImV4cCI6MTc1ODg4MTU3NH0.9I8-U0x86Ak8t2DGaIk0HfvTSLsAyzdnz-Nw00mMkKw
```

## Post-Deployment Checklist

- [ ] Site is accessible at the provided URL
- [ ] Authentication works (sign up/login)
- [ ] Dashboard loads correctly
- [ ] Can create and save content
- [ ] All navigation links work
- [ ] Environment variables are set correctly

## Troubleshooting

### Issue: 404 on page refresh
**Solution**: Make sure your hosting platform is configured to redirect all routes to `index.html`. For Netlify, the `netlify.toml` file handles this automatically.

### Issue: Environment variables not working
**Solution**:
1. Verify variables are prefixed with `VITE_`
2. Rebuild the site after adding variables
3. Check the hosting platform's environment variable settings

### Issue: Supabase connection errors
**Solution**:
1. Verify the Supabase URL and anon key are correct
2. Check that the Supabase project is active
3. Verify database migrations have been applied

## Custom Domain

After deployment, you can add a custom domain:

**Netlify:**
1. Go to Site settings → Domain management
2. Click "Add custom domain"
3. Follow DNS configuration instructions

**Vercel:**
1. Go to Project settings → Domains
2. Add your domain
3. Configure DNS records as instructed

## Support

If you encounter any issues during deployment, please check:
- Build logs in your hosting platform
- Browser console for errors
- Network tab for API call failures

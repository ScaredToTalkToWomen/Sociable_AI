# OAuth Redirect URL Setup Guide

This document explains how to configure OAuth redirect URLs for social media platforms.

## Twitter OAuth Setup

### Redirect URLs

When setting up your Twitter OAuth application, you need to add the following callback URLs:

**For Local Development:**
```
https://oauth.n8n.cloud/oauth1/callback/twitter
```

**For Production:**
```
https://yourdomain.com/auth/callback/twitter
```

### How to Configure

1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Select your app
3. Go to "App settings" → "User authentication settings"
4. Click "Set up" or "Edit" if already configured
5. Under "Callback URI / Redirect URL", add both URLs listed above
6. Save changes

### Environment Variables

Make sure your `.env` file contains:

```env
VITE_TWITTER_CLIENT_ID=your_client_id_here
VITE_TWITTER_CLIENT_SECRET=your_client_secret_here
```

## Other Platforms

### LinkedIn
**Redirect URLs:**
- Local: `http://localhost:5173/auth/callback/linkedin`
- Production: `https://yourdomain.com/auth/callback/linkedin`

### Instagram
**Redirect URLs:**
- Local: `http://localhost:5173/auth/callback/instagram`
- Production: `https://yourdomain.com/auth/callback/instagram`

### Facebook
**Redirect URLs:**
- Local: `http://localhost:5173/auth/callback/facebook`
- Production: `https://yourdomain.com/auth/callback/facebook`

### TikTok
**Redirect URLs:**
- Local: `http://localhost:5173/auth/callback/tiktok`
- Production: `https://yourdomain.com/auth/callback/tiktok`

## Testing OAuth Flow

1. Click "Connect" on any social media platform
2. Click "Connect with [Platform] OAuth" button
3. You'll be redirected to the platform's authorization page
4. Approve the connection
5. You'll be redirected back to the callback URL
6. The app will process the authorization and save the connection

## Troubleshooting

### "Invalid redirect URI" error
- Make sure the redirect URL in your app settings exactly matches the URL being used
- Check for trailing slashes - they matter!
- Ensure protocol (http/https) matches

### "OAuth not configured" error
- Check that your environment variables are set correctly
- Restart the dev server after adding/changing environment variables

### Callback page shows error
- Check browser console for detailed error messages
- Verify webhook endpoint is accessible
- Check Supabase connection is working

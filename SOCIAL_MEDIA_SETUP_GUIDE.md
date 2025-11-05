# Social Media API Setup Guide

This guide walks you through setting up API credentials for each social media platform to enable OAuth authentication in your app.

---

## 1. Twitter/X API Setup

### Step 1: Create a Developer Account
1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Sign in with your Twitter account
3. Apply for a developer account (usually instant approval for basic access)

### Step 2: Create an App
1. Click "Projects & Apps" → "Create App"
2. Fill in:
   - **App name**: Your app name (e.g., "Social Media Automation")
   - **Description**: Brief description of your app
   - **Website URL**: Your app's URL (can use placeholder initially)

### Step 3: Get API Credentials
1. After creating the app, go to "Keys and tokens" tab
2. Copy these values:
   - **API Key** (Client ID)
   - **API Secret Key** (Client Secret)
3. Generate "Access Token and Secret" if needed for posting

### Step 4: Configure OAuth Settings
1. Go to "App settings" → "User authentication settings" → "Set up"
2. Enable OAuth 2.0
3. Type of App: Web App
4. **Callback URL**: `http://localhost:5173/auth/callback/twitter` (for local testing)
   - For production: `https://yourdomain.com/auth/callback/twitter`
5. **Website URL**: Your app URL
6. Permissions: Read and Write (to post tweets)
7. Save settings

### What You'll Need:
- `TWITTER_CLIENT_ID` (API Key)
- `TWITTER_CLIENT_SECRET` (API Secret Key)

---

## 2. LinkedIn API Setup

### Step 1: Create a LinkedIn App
1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/apps)
2. Click "Create app"
3. Fill in:
   - **App name**: Your app name
   - **LinkedIn Page**: Associate with a LinkedIn page (required)
   - **App logo**: Upload a logo
   - **Legal agreement**: Accept terms

### Step 2: Get API Credentials
1. Once created, go to "Auth" tab
2. Copy:
   - **Client ID**
   - **Client Secret**

### Step 3: Configure OAuth Settings
1. In "Auth" tab, add redirect URLs:
   - `http://localhost:5173/auth/callback/linkedin` (local)
   - `https://yourdomain.com/auth/callback/linkedin` (production)
2. Go to "Products" tab
3. Request access to:
   - **Sign In with LinkedIn** (usually instant)
   - **Share on LinkedIn** (may require verification)
   - **Marketing Developer Platform** (for posting)

### Step 4: Verify Your App (if required)
- LinkedIn may require app verification before granting posting permissions
- Follow their verification process

### What You'll Need:
- `LINKEDIN_CLIENT_ID`
- `LINKEDIN_CLIENT_SECRET`

---

## 3. Instagram API Setup

**Note**: Instagram requires a Facebook Developer account and app. Instagram API access is through Meta's Graph API.

### Step 1: Create Facebook Developer Account
1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Sign in with Facebook account
3. Complete registration

### Step 2: Create an App
1. Click "My Apps" → "Create App"
2. Select use case: **Business** or **Consumer**
3. Fill in app details:
   - **App name**
   - **App contact email**
   - **Business account** (if applicable)

### Step 3: Add Instagram Product
1. In app dashboard, find "Instagram" product
2. Click "Set Up" under Instagram Basic Display or Instagram Graph API
3. For posting content, use **Instagram Graph API**

### Step 4: Get API Credentials
1. Go to "Settings" → "Basic"
2. Copy:
   - **App ID** (Client ID)
   - **App Secret** (Client Secret)

### Step 5: Configure Instagram
1. Add Instagram Tester accounts
2. Go to Instagram Graph API → "Settings"
3. Add redirect URLs:
   - `http://localhost:5173/auth/callback/instagram`
   - `https://yourdomain.com/auth/callback/instagram`

### Step 6: Get Permissions
Required permissions for posting:
- `instagram_basic`
- `instagram_content_publish`
- `pages_show_list` (to manage pages)

### What You'll Need:
- `INSTAGRAM_CLIENT_ID` (App ID)
- `INSTAGRAM_CLIENT_SECRET` (App Secret)

**Important**: Instagram posting requires:
1. Instagram Business or Creator account
2. Connected to a Facebook Page
3. App review approval for production use

---

## 4. Facebook API Setup

### Step 1: Use Same App from Instagram
- You can use the same Facebook app created for Instagram
- Or create a new one following the same process

### Step 2: Add Facebook Login Product
1. In app dashboard, add "Facebook Login" product
2. Click "Set Up"

### Step 3: Configure OAuth Settings
1. Go to "Facebook Login" → "Settings"
2. Add OAuth Redirect URIs:
   - `http://localhost:5173/auth/callback/facebook`
   - `https://yourdomain.com/auth/callback/facebook`

### Step 4: Get Required Permissions
For posting to pages:
- `pages_show_list`
- `pages_read_engagement`
- `pages_manage_posts`
- `publish_to_groups` (if posting to groups)

### What You'll Need:
- `FACEBOOK_CLIENT_ID` (App ID)
- `FACEBOOK_CLIENT_SECRET` (App Secret)

---

## 5. TikTok API Setup

### Step 1: Register as TikTok Developer
1. Go to [TikTok Developers](https://developers.tiktok.com/)
2. Sign in with TikTok account
3. Complete developer registration

### Step 2: Create an App
1. Go to "Manage apps" → "Connect an app"
2. Fill in app details:
   - **App name**
   - **Category**: Social
   - **Description**

### Step 3: Get API Credentials
1. After app creation, copy:
   - **Client Key** (Client ID)
   - **Client Secret**

### Step 4: Configure Redirect URLs
1. Add redirect URLs:
   - `http://localhost:5173/auth/callback/tiktok`
   - `https://yourdomain.com/auth/callback/tiktok`

### Step 5: Request Permissions
Apply for scopes:
- `user.info.basic` (basic user info)
- `video.upload` (to post videos)
- `video.publish` (to publish content)

### What You'll Need:
- `TIKTOK_CLIENT_ID` (Client Key)
- `TIKTOK_CLIENT_SECRET` (Client Secret)

---

## Summary: Environment Variables Needed

Once you have all credentials, you'll add them to your `.env` file:

```
# Twitter/X
VITE_TWITTER_CLIENT_ID=your_twitter_client_id
VITE_TWITTER_CLIENT_SECRET=your_twitter_client_secret

# LinkedIn
VITE_LINKEDIN_CLIENT_ID=your_linkedin_client_id
VITE_LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret

# Instagram
VITE_INSTAGRAM_CLIENT_ID=your_instagram_app_id
VITE_INSTAGRAM_CLIENT_SECRET=your_instagram_app_secret

# Facebook
VITE_FACEBOOK_CLIENT_ID=your_facebook_app_id
VITE_FACEBOOK_CLIENT_SECRET=your_facebook_app_secret

# TikTok
VITE_TIKTOK_CLIENT_ID=your_tiktok_client_key
VITE_TIKTOK_CLIENT_SECRET=your_tiktok_client_secret
```

---

## Important Notes

### Testing vs Production
- Most platforms allow testing with your own account immediately
- **Production use** requires:
  - App review/verification
  - Privacy policy URL
  - Terms of service URL
  - Valid business use case

### Rate Limits
Each platform has different rate limits:
- **Twitter**: 300 tweets per 3 hours (for most accounts)
- **LinkedIn**: Varies by API product
- **Instagram**: ~25 posts per day per account
- **Facebook**: Depends on page size and engagement
- **TikTok**: Varies by account type

### Security Best Practices
1. Never commit credentials to git (use `.env`)
2. Use different credentials for dev/staging/production
3. Regularly rotate secrets
4. Monitor API usage for suspicious activity
5. Implement proper error handling for failed API calls

---

## Next Steps

Once you have collected all the credentials:
1. Add them to your `.env` file (I'll show you the format)
2. Let me know, and I'll implement the OAuth flows
3. Test each platform's connection
4. Deploy with production credentials

**Ready to proceed?** Let me know when you have the credentials, and I'll build the OAuth integration!

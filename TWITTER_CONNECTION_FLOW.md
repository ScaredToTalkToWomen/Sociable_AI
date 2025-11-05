# Twitter Account Connection Flow

## Overview

Users can connect their Twitter accounts using two methods:
1. **Manual Login** - Enter username and password
2. **OAuth** - Official Twitter OAuth 2.0 authentication

## Step-by-Step Flow

### 1. User Initiates Connection

- User clicks "Add Account" in Social Accounts page
- Selects Twitter from the platform list
- Login modal appears

### 2. Login Modal

The login modal displays:
- Twitter username field (required)
- Password field (optional - only for manual login)
- Two buttons:
  - **Manual Login** - Requires password
  - **Connect with Twitter** - Uses official OAuth

### 3. OAuth Flow (Recommended)

When user clicks "Connect with Twitter OAuth":

1. **Username is saved** to `sessionStorage` with key `oauth_username_twitter`
2. User is **redirected to Twitter's authorization page**
3. User approves the connection on Twitter
4. Twitter **redirects back** to your callback URL: `/auth/callback/twitter`
5. **TwitterOAuthRedirect component** processes the callback:
   - Retrieves the authorization code
   - Retrieves the saved username from sessionStorage
   - Sends data to webhook with:
     - `platform: 'twitter'`
     - `userId: user.id`
     - `username: savedUsername`
     - `code: authorizationCode`
     - `state: stateParameter`
     - `action: 'oauth_callback'`
6. **If webhook returns 200**:
   - Account is saved to Supabase `social_accounts` table
   - User is redirected to the main app
   - Account appears as connected

### 4. Manual Login Flow (Alternative)

When user enters password and clicks "Manual Login":

1. Credentials are sent to webhook with:
   - `platform: 'twitter'`
   - `userId: user.id`
   - `username: username`
   - `password: password`
   - `action: 'social_accounts_connect_attempt'`
2. If webhook returns 200:
   - Account is saved to Supabase
   - Login modal closes
   - Account appears as connected

## Technical Details

### SessionStorage Keys

- `oauth_username_twitter` - Stores the username during OAuth flow
- `oauth_state_twitter` - Stores CSRF protection state
- `oauth_verifier_twitter` - Stores PKCE code verifier

### Webhook Payload

```json
{
  "platform": "twitter",
  "userId": "user-uuid",
  "username": "@username",
  "code": "authorization-code",
  "state": "state-parameter",
  "action": "oauth_callback",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Database Schema

Connected accounts are saved to `social_accounts` table:
```sql
{
  user_id: uuid,
  platform: 'twitter',
  account_name: 'Display Name',
  account_handle: '@username',
  access_token: 'connected',
  refresh_token: null,
  token_expires_at: null,
  is_connected: true
}
```

## Redirect URLs

Configure these in Twitter Developer Portal:

**Local Development:**
- `http://localhost:5173/auth/callback/twitter`

**Production:**
- `https://yourdomain.com/auth/callback/twitter`

## User Experience

1. Simple and intuitive - username first, then choose method
2. OAuth is clearly labeled as the recommended option
3. Manual login available as backup
4. Clear feedback during the entire process
5. Automatic redirect after successful connection

## Benefits

- **Username Input**: Ensures webhook receives the correct username
- **Two Methods**: Flexibility for users (OAuth preferred, manual backup)
- **SessionStorage**: Username persists across OAuth redirect
- **Webhook Integration**: Centralized processing
- **Clean UI**: Simple modal interface

# Troubleshooting Blank Screen Issue

## If you're seeing a blank screen, follow these steps:

### 1. Check Browser Console

Open your browser's developer tools (F12 or Right-click → Inspect) and check the Console tab for errors.

Common issues:
- **Missing environment variables**: Check if you see errors about Supabase
- **CORS errors**: Make sure your Supabase project allows your domain
- **JavaScript errors**: Look for red error messages

### 2. Check Network Tab

In developer tools, go to the Network tab:
- Make sure CSS and JS files are loading (200 status)
- Check if there are any failed requests
- Look for auth-related calls to Supabase

### 3. Verify Environment Variables

The app needs these environment variables:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

**Local Development:**
- Check your `.env` file in the project root
- Restart the dev server after adding/changing variables

**Production (Netlify/Vercel):**
- Go to Site Settings → Environment Variables
- Add both variables
- Redeploy the site

### 4. Check if Dev Server is Running

If developing locally:
```bash
npm run dev
```

Then visit: http://localhost:5173

You should see console logs:
- 🚀 App starting...
- Root element: [HTMLDivElement]
- ✅ App rendered

### 5. Hard Refresh

Sometimes cached files cause issues:
- **Chrome/Edge**: Ctrl + Shift + R (Windows) or Cmd + Shift + R (Mac)
- **Firefox**: Ctrl + F5 (Windows) or Cmd + Shift + R (Mac)
- **Safari**: Cmd + Option + R

### 6. Check Supabase Connection

The app should show you the login page if Supabase is working.

If you see errors in console about Supabase:
1. Verify your Supabase project is active
2. Check that the URL and anon key are correct
3. Make sure the database migrations were applied

### 7. Test with Simple HTML

Create a test.html file:
```html
<!DOCTYPE html>
<html>
<head>
    <title>Test</title>
    <style>
        body { font-family: Arial; padding: 20px; }
        .box { background: #4CAF50; color: white; padding: 20px; }
    </style>
</head>
<body>
    <div class="box">
        <h1>If you see this, HTML/CSS is working</h1>
        <p>The blank screen issue is with JavaScript</p>
    </div>
    <script>
        console.log('JavaScript is working!');
        document.body.innerHTML += '<div class="box" style="background: #2196F3; margin-top: 20px;"><p>JavaScript executed successfully!</p></div>';
    </script>
</body>
</html>
```

If this works but the app doesn't, it's a React/Supabase issue.

### 8. Common Fixes

**Fix 1: Clear Browser Cache**
```
Settings → Privacy → Clear browsing data → Cached images and files
```

**Fix 2: Disable Browser Extensions**
Sometimes ad blockers or privacy extensions block scripts.

**Fix 3: Try Incognito/Private Mode**
This starts with a clean slate (no cache, no extensions).

**Fix 4: Check Console for CORS Errors**
If you see CORS errors, your Supabase project may need configuration:
1. Go to Supabase Dashboard
2. Settings → API → CORS settings
3. Add your domain

**Fix 5: Rebuild and Redeploy**
```bash
# Clean build
rm -rf dist node_modules
npm install
npm run build
```

### 9. Still Blank? Debug Mode

Add this to your main.tsx (top of the file):
```typescript
window.addEventListener('error', (e) => {
  document.body.innerHTML = `
    <div style="padding: 20px; font-family: Arial;">
      <h1 style="color: red;">Error Detected</h1>
      <p><strong>Message:</strong> ${e.message}</p>
      <p><strong>File:</strong> ${e.filename}</p>
      <p><strong>Line:</strong> ${e.lineno}</p>
      <pre style="background: #f5f5f5; padding: 10px;">${e.error?.stack || 'No stack trace'}</pre>
    </div>
  `;
});
```

This will show any JavaScript errors directly on the page.

### 10. Get Help

If none of the above works:

1. Check browser console and copy all error messages
2. Check network tab for failed requests
3. Verify environment variables are set
4. Try accessing http://localhost:5173 directly (not through a proxy)

The app IS working - the blank screen is usually:
- Missing environment variables (most common)
- Browser caching old version
- JavaScript error preventing render
- CORS blocking Supabase requests

Check console logs - they will tell you exactly what's wrong!

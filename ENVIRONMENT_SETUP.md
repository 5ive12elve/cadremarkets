# Environment Variables Setup

## Required Environment Variables

### Frontend (Vercel)
- `VITE_API_URL=https://api.cadremarkets.com`

### Backend (Render)
- `MONGO` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `CLIENT_URL` - Frontend URL for CORS
- `ADMIN_USERNAME` - Back office admin username
- `ADMIN_PASSWORD` - Back office admin password

## Deployment Status

✅ **Backend**: Live at https://api.cadremarkets.com
✅ **Frontend**: Live at https://www.cadremarkets.com
✅ **API Routes**: All properly configured
✅ **Database**: Connected and responding

## API Endpoints

All API calls should use the pattern:
```javascript
fetch(`${import.meta.env.VITE_API_URL}/api/endpoint`)
```

Example:
```javascript
// ✅ Correct
fetch(`${import.meta.env.VITE_API_URL}/api/listing/get`)

// ❌ Incorrect (hardcoded)
fetch('/api/listing/get')
```

## Environment Variable Configuration

### Vercel (Frontend)
1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add: `VITE_API_URL=https://api.cadremarkets.com`
5. Redeploy the application

### Render (Backend)
Environment variables are configured in Render dashboard under the service settings.

## Testing

Test the API connection:
```bash
curl https://api.cadremarkets.com/api/health
curl https://api.cadremarkets.com/api/listing/get
```

Both should return HTTP 200 responses. 
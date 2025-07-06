# Local Development Guide

This guide explains how to work on Cadre Markets locally without constantly redeploying to production.

## 🚀 Quick Start

### Option 1: Local Frontend + Production API (Recommended for debugging production issues)

```bash
# Use production API (api.cadremarkets.com)
npm run dev:prod

# Or manually set environment
echo "VITE_API_URL=https://api.cadremarkets.com" > .env.local
npm run dev
```

### Option 2: Local Frontend + Local API (Full local development)

```bash
# Start local API server first
cd ../api
npm start

# In another terminal, start local frontend
cd ../client
npm run dev:local

# Or manually (no .env.local file needed)
npm run dev
```

## 🔧 Environment Switching

Use the provided script to easily switch between environments:

```bash
# Switch to production API
./scripts/dev-env.sh prod

# Switch to local API
./scripts/dev-env.sh local

# Check current environment
./scripts/dev-env.sh
```

## 📁 Environment Files

- **`.env.local`** - Local environment overrides (gitignored)
- **No `.env.local`** - Uses local API via proxy

## 🐛 Debugging Production Issues

1. **Authentication Issues**: Visit `http://localhost:5173/debug` to diagnose
2. **API Errors**: Check browser console and network tab
3. **CORS Issues**: Should be resolved with production API
4. **Token Problems**: Use the debug page to check localStorage and cookies

## 🔍 Useful URLs

- **Local Frontend**: `http://localhost:5173`
- **Debug Page**: `http://localhost:5173/debug`
- **Production API**: `https://api.cadremarkets.com`
- **Local API**: `http://localhost:3000`

## 💡 Tips

- **Hot Reload**: Changes to frontend code will reload automatically
- **API Changes**: Still require deployment to test
- **Database**: Uses production database when using production API
- **Authentication**: Works with production user accounts
- **File Uploads**: Uses production storage when using production API

## 🚨 Troubleshooting

### CORS Errors
- Make sure you're using the correct API URL
- Check that the API server is running (for local development)

### Authentication Issues
- Clear localStorage: `localStorage.clear()`
- Visit debug page: `http://localhost:5173/debug`
- Sign in again if needed

### Port Conflicts
- If port 5173 is busy, Vite will automatically try 5174, 5175, etc.
- Check the terminal output for the actual port being used

## 📝 Development Workflow

1. **For UI/UX changes**: Use `npm run dev:prod` (production API)
2. **For API changes**: Use `npm run dev:local` (local API)
3. **For full testing**: Deploy to staging environment
4. **For production**: Deploy to production

This setup allows you to work on frontend issues without constantly redeploying! 
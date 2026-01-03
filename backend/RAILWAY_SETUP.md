# Backend Railway Deployment Guide

## ✅ Pre-Deployment Checklist:
- [x] TypeScript compiles successfully (`npm run build`)
- [x] Prisma schema is ready
- [x] Environment variables configured
- [x] Railway PostgreSQL URL ready
- [x] JWT_SECRET defined
- [x] CORS origins configured

## 🚀 Railway Deployment Steps:

### Step 1: Create Railway Project
1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your GlobeTrotter repository
6. Select the **backend** folder as the root directory

### Step 2: Configure Environment Variables
In Railway Dashboard → Variables, add:

**Required:**
```
DATABASE_URL=postgresql://postgres:HUFOfPyjBWjtoJVSQxgxFpCNmYZFzJaF@gondola.proxy.rlwy.net:25336/railway
JWT_SECRET=your-super-secret-jwt-key-change-this-to-random-string
NODE_ENV=production
PORT=5000
```

**Amadeus API:**
```
AMADEUS_CLIENT_ID=kv4vMHkAkGzA0whzWAaOPweIxmeBosj5
AMADEUS_CLIENT_SECRET=cvmjv1vBwyOAZdd3
AMADEUS_HOSTNAME=test
```

**CORS (update after frontend deployment):**
```
ALLOWED_ORIGINS=https://your-frontend-url.railway.app
```

### Step 3: Deploy Backend
1. Railway will automatically detect Node.js and build
2. Wait for deployment to complete
3. Copy your backend public URL (e.g., `https://globetrotter-backend-xxx.railway.app`)

### Step 4: Run Database Migrations
In Railway → Backend Service → Terminal:
```bash
npx prisma migrate deploy
```

### Step 5: Seed Database (Optional)
```bash
npm run seed
```

### Step 6: Create Admin User
```bash
npx ts-node src/scripts/makeUserAdmin.ts your-email@example.com
```

## 🔧 Build Configuration:
Railway will run these commands automatically:
- **Build:** `npm run build` (Prisma generate + TypeScript compile)
- **Start:** `npm start` (Node.js dist/server.js)

## 📝 Important Notes:
- Railway automatically sets `PORT` variable - your app uses `process.env.PORT`
- Update `ALLOWED_ORIGINS` after deploying frontend
- Keep `.env` file local only (it's gitignored)
- JWT_SECRET should be a long random string in production

## 🐛 Troubleshooting:
- **Build fails:** Check Railway logs for specific errors
- **Database connection fails:** Verify DATABASE_URL is correct
- **CORS errors:** Add frontend URL to ALLOWED_ORIGINS
- **JWT errors:** Ensure JWT_SECRET is set

## ✅ Deployment Checklist:
- [ ] Backend deployed successfully
- [ ] Database migrations run
- [ ] Can access health endpoint: `/api/health`
- [ ] Ready to deploy frontend

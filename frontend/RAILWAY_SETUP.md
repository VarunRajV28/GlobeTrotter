# Railway Frontend Deployment Guide

## Environment Variables for Railway:

Set this in Railway Dashboard for Frontend:
- `NEXT_PUBLIC_API_URL` = https://your-backend-url.railway.app/api

## Deployment Steps:

### 1. Deploy Backend First:
1. Go to Railway.app
2. Create new project
3. Add service from GitHub (backend folder)
4. Set all backend environment variables (see backend/RAILWAY_SETUP.md)
5. Deploy backend
6. Copy the backend public URL (e.g., https://globetrotter-backend-xxx.railway.app)

### 2. Deploy Frontend:
1. In same Railway project, add another service
2. Connect GitHub repo (frontend folder)
3. Set environment variable:
   - `NEXT_PUBLIC_API_URL` = https://your-backend-url.railway.app/api
4. Deploy frontend

### 3. Update CORS:
1. Go back to backend service in Railway
2. Update `ALLOWED_ORIGINS` environment variable:
   - Add your frontend URL: https://your-frontend-url.railway.app
3. Redeploy backend

### 4. Run Database Migration:
In Railway backend service terminal:
```bash
npx prisma migrate deploy
```

### 5. Seed Database (Optional):
```bash
npm run seed
```

## Testing:
Visit your frontend URL and verify:
- Login/Signup works
- API calls succeed
- Admin panel accessible (for admin users)

## Troubleshooting:
- Check Railway logs for errors
- Verify all environment variables are set
- Ensure DATABASE_URL is correct
- Check CORS settings if API calls fail

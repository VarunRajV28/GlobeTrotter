# GlobalTrotters - Quick Start Guide

## Prerequisites
- Node.js 18+ installed
- PostgreSQL database running
- Backend server running on http://localhost:5000

## Starting the Application

### 1. Backend (Already Running)
If not already running:
```bash
cd backend
npm install
npm run dev
```
Backend should be running on `http://localhost:5000`

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend will start on `http://localhost:3000`

## First Time Setup

### Create Your First User
1. Open browser to `http://localhost:3000`
2. Click "Sign Up"
3. Fill in:
   - Name: Your Name
   - Email: your@email.com
   - Password: yourpassword
4. Click "Sign Up" - you'll be automatically logged in!

### Explore the App
1. **Dashboard** (`/dashboard`) - See your trips and recommended destinations
2. **Explore** (`/explore`) - Search for cities and activities
   - Try searching for "Paris", "Tokyo", "Museums", etc.
   - Database has 10 cities and 50 activities seeded
3. **Create a Trip** - Click "Plan New Trip"
   - Enter trip name (e.g., "Summer in Europe 2025")
   - Set start and end dates
   - Add optional budget
   - Click "Initialize Itinerary"
4. **My Trips** (`/trips`) - View, edit, and delete your trips

## API Endpoints Available

### Public (No Auth Required)
- `GET /api/health` - Health check
- `GET /api/cities/popular` - Get popular cities
- `GET /api/cities/search?query=Paris` - Search cities
- `GET /api/activities/search?query=museum` - Search activities

### Authenticated (Requires Login)
- `GET /api/auth/profile` - Get current user profile
- `GET /api/trips` - Get user's trips
- `POST /api/trips` - Create new trip
- `PUT /api/trips/:id` - Update trip
- `DELETE /api/trips/:id` - Delete trip
- `POST /api/trips/:id/activities` - Add activity to trip
- `DELETE /api/trips/:id/activities/:activityId` - Remove activity

### Admin Only
- `GET /api/admin/stats` - Get platform statistics
- `GET /api/admin/users` - Get all users

## Testing Features

### 1. Authentication
- ✅ Sign up with new account
- ✅ Login with existing credentials
- ✅ View profile
- ✅ Logout

### 2. Explore
- ✅ Search cities (try: "Paris", "London", "Tokyo")
- ✅ Search activities (try: "museum", "restaurant", "park")
- ✅ Switch between Cities and Activities tabs
- ✅ Real-time search with debounce

### 3. Trips
- ✅ View all your trips
- ✅ Create new trip with name, dates, budget
- ✅ Edit trip details
- ✅ Delete trip
- ✅ View trip details

### 4. Dashboard
- ✅ See upcoming trips
- ✅ View recommended destinations
- ✅ Quick access to create new trip

## Troubleshooting

### "Network Error" or "Failed to fetch"
- Make sure backend is running on http://localhost:5000
- Check browser console for specific error
- Verify database is connected

### "Login failed" or "Registration failed"
- Check backend console for error messages
- Verify JWT_SECRET is set in backend/.env
- Try restarting backend server

### No cities or activities showing up
- Make sure database is seeded
- Run: `cd backend && npm run seed`
- Should see "Seeded 10 cities and 50 activities"

### Authentication not persisting
- Check browser localStorage for 'auth_token'
- Try clearing localStorage and logging in again
- Check browser console for errors

## Sample Data in Database

After seeding, you should have:
- **10 Cities**: Paris, London, Tokyo, New York, Barcelona, Rome, Amsterdam, Sydney, Dubai, Singapore
- **50 Activities**: Various activities across these cities (museums, restaurants, parks, tours, etc.)
- **Categories**: Culture, Food, Nature, Adventure, Shopping, Nightlife

## Development Tips

### Check if Backend is Running
Visit: http://localhost:5000/api/health
Should return: `{ "message": "GlobeTrotter API is running", "status": "healthy" }`

### Check Authentication
1. Login to the app
2. Open browser DevTools → Application → Local Storage
3. Look for `auth_token` key with JWT value

### Test API Directly
Use tools like Postman or curl:

```bash
# Public endpoint
curl http://localhost:5000/api/cities/popular

# Authenticated endpoint (replace TOKEN with your JWT)
curl -H "Authorization: Bearer TOKEN" http://localhost:5000/api/auth/profile
```

## Next Features to Implement

1. **Trip Details Page** - Full itinerary view with activities
2. **Activity Management** - Add/remove activities from trips
3. **Trip Calendar** - Visual calendar for trip planning
4. **Sharing** - Share trips with friends
5. **Image Uploads** - Upload custom trip cover images
6. **Budget Tracking** - Track expenses vs budget
7. **Profile Editing** - Update user information
8. **Admin Panel** - Full admin dashboard with statistics

## Support

If you encounter issues:
1. Check backend console logs
2. Check browser console logs
3. Verify all environment variables are set
4. Restart both backend and frontend servers
5. Check database connection

## File Structure Reference

```
GlobeTrotter/
├── backend/                 # Backend API (Port 5000)
│   ├── src/
│   │   ├── controllers/     # API controllers
│   │   ├── routes/         # API routes
│   │   └── scripts/        # Seed scripts
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   └── .env                # Backend config
│
└── frontend/               # Frontend App (Port 3000)
    ├── app/                # Next.js pages
    │   ├── login/
    │   ├── signup/
    │   ├── dashboard/
    │   ├── explore/        # Activities page (FIXED)
    │   ├── trips/
    │   ├── profile/
    │   └── admin/
    ├── components/         # React components
    ├── lib/
    │   ├── api.ts         # API client (NEW)
    │   ├── types/         # TypeScript types
    │   └── data/          # Query functions
    └── .env.local         # Frontend config (NEW)
```

Happy traveling! ✈️🌍

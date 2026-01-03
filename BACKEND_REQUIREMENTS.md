# 🎯 Backend Requirements for Frontend

The frontend now expects the following API responses. Update your backend to match these structures.

## 🔴 CRITICAL - Admin Stats Endpoint

**Endpoint:** `GET /api/admin/stats`  
**Auth:** Required (Admin only)  
**Status:** ⚠️ NEEDS IMPLEMENTATION

### Expected Response:
```json
{
  "totalUsers": 150,
  "totalTrips": 890, 
  "totalCities": 10,
  "totalActivities": 50,
  "userGrowth": "+14%",
  "tripGrowth": "+8%",
  "cityGrowth": "0%",
  "activityGrowth": "+5%",
  "chartData": [
    { "month": "Jan", "users": 1200, "trips": 450 },
    { "month": "Feb", "users": 1900, "trips": 620 },
    { "month": "Mar", "users": 2400, "trips": 890 },
    { "month": "Apr", "users": 2100, "trips": 750 },
    { "month": "May", "users": 2800, "trips": 1100 },
    { "month": "Jun", "users": 3500, "trips": 1450 }
  ],
  "topDestinations": [
    { "city": "Paris", "trips": 245, "growth": 12 },
    { "city": "Tokyo", "trips": 189, "growth": 24 },
    { "city": "Barcelona", "trips": 156, "growth": -5 }
  ]
}
```

### Implementation Example (Backend):
```typescript
// backend/src/controllers/AdminController.ts
export const getStats = async (req: Request, res: Response) => {
  try {
    const totalUsers = await prisma.user.count()
    const totalTrips = await prisma.trip.count()
    const totalCities = await prisma.city.count()
    const totalActivities = await prisma.activity.count()

    // Get monthly data for last 6 months
    const chartData = [] // Calculate monthly user/trip growth
    
    // Get top destinations by trip count
    const topDestinations = await prisma.city.findMany({
      take: 5,
      include: {
        _count: {
          select: { trips: true } // Needs relation in schema
        }
      },
      orderBy: {
        trips: {
          _count: 'desc'
        }
      }
    })

    res.json({
      totalUsers,
      totalTrips,
      totalCities,
      totalActivities,
      userGrowth: "+14%", // Calculate actual growth
      tripGrowth: "+8%",
      cityGrowth: "0%",
      activityGrowth: "+5%",
      chartData,
      topDestinations: topDestinations.map(city => ({
        city: city.name,
        trips: city._count.trips,
        growth: 0 // Calculate growth
      }))
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' })
  }
}
```

## 🟢 Working Endpoints (Already Implemented)

### Authentication
- ✅ `POST /api/auth/register` - Register new user
- ✅ `POST /api/auth/login` - Login user  
- ✅ `GET /api/auth/profile` - Get current user

### Cities
- ✅ `GET /api/cities/popular` - Get popular cities
- ✅ `GET /api/cities/search?query=Paris` - Search cities

### Activities
- ✅ `GET /api/activities/search?query=museum` - Search activities

### Trips
- ✅ `GET /api/trips` - Get user's trips
- ✅ `GET /api/trips/:id` - Get single trip
- ✅ `POST /api/trips` - Create trip
- ✅ `PUT /api/trips/:id` - Update trip
- ✅ `DELETE /api/trips/:id` - Delete trip

### Admin
- ✅ `GET /api/admin/users` - Get users list
- ⚠️ `GET /api/admin/stats` - **NEEDS IMPLEMENTATION**

## 🚀 Quick Fix for Admin Dashboard

If you want the admin dashboard to work immediately without implementing full stats, return this minimal response:

```typescript
// Minimal working response
export const getStats = async (req: Request, res: Response) => {
  const totalUsers = await prisma.user.count()
  const totalTrips = await prisma.trip.count()
  const totalCities = await prisma.city.count()
  const totalActivities = await prisma.activity.count()

  res.json({
    totalUsers,
    totalTrips,
    totalCities,
    totalActivities,
    userGrowth: "0%",
    tripGrowth: "0%",
    cityGrowth: "0%",
    activityGrowth: "0%",
    chartData: [],
    topDestinations: []
  })
}
```

The frontend will handle empty arrays gracefully and show "No data available" messages.

## 📝 Testing the Changes

### 1. Verify No Mock Data
```bash
cd frontend
# This should return nothing:
grep -r "MOCK_" app/ lib/ components/
grep -r "mock-data" app/ lib/ components/
```

### 2. Test API Connections
```bash
# Start backend
cd backend
npm run dev

# Start frontend  
cd frontend
npm run dev

# Open browser to http://localhost:3000
# Open DevTools Network tab
# All requests should go to localhost:5000
```

### 3. Check Admin Dashboard
- Login as admin user (role: 'ADMIN')
- Navigate to /admin
- Should see stats (or "No data available" if not implemented)

## 🎨 What Changed in Frontend

| Component | Before | After |
|-----------|--------|-------|
| `queries.ts` | Mock data fallbacks | Pure API calls |
| `admin/page.tsx` | Hardcoded arrays | Real-time stats |
| `trips/[id]/page.tsx` | Mock functions | Real API |
| `trips/[id]/edit/page.tsx` | Fake updates | Real updates |

## 💡 Next Steps

1. ✅ **Immediate**: Admin stats endpoint (optional, fallback works)
2. 🔄 **Future**: Trip activity management endpoints
3. 🔄 **Future**: Sharing functionality endpoints
4. 🔄 **Future**: Profile update endpoints

## 🐛 Troubleshooting

### Admin dashboard shows "No data available"
- Check if `/api/admin/stats` endpoint exists
- Return at least empty arrays for `chartData` and `topDestinations`
- Include all required numeric fields

### Trip edit doesn't save
- Verify `PUT /api/trips/:id` accepts: `name`, `description`, `startDate`, `endDate`, `budget`
- Check if JWT token is being sent in Authorization header

### Activities not showing  
- Verify backend seeding ran successfully
- Check `/api/activities/search` returns array of activities with city data

---

**Status**: ✅ Frontend is 100% API-connected with zero hardcoded data!

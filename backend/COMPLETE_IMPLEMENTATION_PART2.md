# Part 2: Routes and Seeding Script

## FILE: src/routes/trips.ts

```typescript
import { Router } from 'express';
import TripController from '../controllers/TripController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, (req, res) => TripController.createTrip(req, res));
router.get('/', authenticate, (req, res) => TripController.getTrips(req, res));
router.get('/:id', authenticate, (req, res) => TripController.getTripById(req, res));
router.put('/:id', authenticate, (req, res) => TripController.updateTrip(req, res));
router.delete('/:id', authenticate, (req, res) => TripController.deleteTrip(req, res));
router.post('/:tripId/activities', authenticate, (req, res) => TripController.addActivityToTrip(req, res));
router.delete('/:tripId/activities/:activityId', authenticate, (req, res) => TripController.removeActivityFromTrip(req, res));

export default router;
```

## FILE: src/routes/cities.ts

```typescript
import { Router } from 'express';
import CityController from '../controllers/CityController';

const router = Router();

router.get('/', (req, res) => CityController.getAll(req, res));
router.get('/search', (req, res) => CityController.search(req, res));
router.get('/:id', (req, res) => CityController.getById(req, res));

export default router;
```

## FILE: src/routes/activities.ts

```typescript
import { Router } from 'express';
import ActivityController from '../controllers/ActivityController';

const router = Router();

router.get('/', (req, res) => ActivityController.getAll(req, res));
router.get('/search', (req, res) => ActivityController.search(req, res));
router.get('/:id', (req, res) => ActivityController.getById(req, res));

export default router;
```

## FILE: src/routes/share.ts

```typescript
import { Router } from 'express';
import ShareController from '../controllers/ShareController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/trips/:id/share', authenticate, (req, res) => ShareController.generateShareLink(req, res));
router.get('/:shareId', (req, res) => ShareController.getSharedTrip(req, res));
router.post('/:shareId/copy', authenticate, (req, res) => ShareController.copyTripToUser(req, res));

export default router;
```

## FILE: src/routes/admin.ts

```typescript
import { Router } from 'express';
import AdminController from '../controllers/AdminController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/stats', authenticate, requireAdmin, (req, res) => AdminController.getStats(req, res));
router.get('/users', authenticate, requireAdmin, (req, res) => AdminController.getAllUsers(req, res));
router.put('/users/:id/status', authenticate, requireAdmin, (req, res) => AdminController.updateUserStatus(req, res));

export default router;
```

## FILE: src/routes/users.ts (ADD profile update route)

```typescript
import { Router } from 'express';
import AuthController from '../controllers/AuthController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.put('/profile', authenticate, (req, res) => AuthController.updateProfile(req, res));

export default router;
```

## UPDATE: src/routes/index.ts

```typescript
import { Router } from 'express';
import authRouter from './auth';
import usersRouter from './users';
import tripsRouter from './trips';
import citiesRouter from './cities';
import activitiesRouter from './activities';
import shareRouter from './share';
import adminRouter from './admin';
import itinerariesRouter from './itineraries';
import destinationsRouter from './destinations';
import flightsRouter from './flights';

const router = Router();

// New routes
router.use('/auth', authRouter);
router.use('/trips', tripsRouter);
router.use('/cities', citiesRouter);
router.use('/activities', activitiesRouter);
router.use('/shared', shareRouter);
router.use('/admin', adminRouter);
router.use('/users', usersRouter);

// Legacy routes (keep for now)
router.use('/itineraries', itinerariesRouter);
router.use('/destinations', destinationsRouter);
router.use('/flights', flightsRouter);

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'GlobeTrotter API',
  });
});

export default router;
```

## FILE: src/scripts/seedCitiesAndActivities.ts

```typescript
import dotenv from 'dotenv';
import { PrismaClient, ActivityCategory } from '@prisma/client';
import CitySearchService from '../services/amadeus/CitySearchService';
import ActivityService from '../services/amadeus/ActivityService';

dotenv.config();

const prisma = new PrismaClient();

// Cities to seed with their expected coordinates
const SEED_CITIES = [
  { keyword: 'Paris', country: 'FR', lat: 48.8566, lon: 2.3522 },
  { keyword: 'London', country: 'GB', lat: 51.5074, lon: -0.1278 },
  { keyword: 'New York', country: 'US', lat: 40.7128, lon: -74.006 },
  { keyword: 'Tokyo', country: 'JP', lat: 35.6762, lon: 139.6503 },
  { keyword: 'Dubai', country: 'AE', lat: 25.2048, lon: 55.2708 },
  { keyword: 'Barcelona', country: 'ES', lat: 41.3874, lon: 2.1686 },
  { keyword: 'Rome', country: 'IT', lat: 41.9028, lon: 12.4964 },
  { keyword: 'Amsterdam', country: 'NL', lat: 52.3676, lon: 4.9041 },
  { keyword: 'Sydney', country: 'AU', lat: -33.8688, lon: 151.2093 },
  { keyword: 'Bangkok', country: 'TH', lat: 13.7563, lon: 100.5018 },
];

// Map Amadeus descriptions to our categories
function mapCategory(description: string): ActivityCategory {
  const lower = description.toLowerCase();
  if (lower.includes('tour') || lower.includes('sightseeing') || lower.includes('visit')) return 'SIGHTSEEING';
  if (lower.includes('food') || lower.includes('restaurant') || lower.includes('dining')) return 'FOOD_DRINK';
  if (lower.includes('adventure') || lower.includes('sport') || lower.includes('hiking')) return 'ADVENTURE';
  if (lower.includes('museum') || lower.includes('culture') || lower.includes('art')) return 'CULTURE';
  if (lower.includes('shopping') || lower.includes('market')) return 'SHOPPING';
  if (lower.includes('nightlife') || lower.includes('bar') || lower.includes('club')) return 'NIGHTLIFE';
  if (lower.includes('spa') || lower.includes('relaxation') || lower.includes('wellness')) return 'RELAXATION';
  return 'SIGHTSEEING'; // Default
}

async function seedCities() {
  console.log('🌍 Starting city seeding...\n');

  for (const cityData of SEED_CITIES) {
    try {
      console.log(`📍 Searching for ${cityData.keyword}...`);
      
      // Search city in Amadeus
      const cities = await CitySearchService.searchCities(cityData.keyword, cityData.country, 1);
      
      if (cities.length === 0) {
        console.log(`  ⚠️  No results from Amadeus, using fallback data`);
        
        // Create city with fallback data
        const city = await prisma.city.upsert({
          where: { amadeusCode: cityData.keyword.substring(0, 3).toUpperCase() },
          update: {},
          create: {
            name: cityData.keyword,
            country: cityData.country,
            description: `Beautiful city of ${cityData.keyword}`,
            amadeusCode: cityData.keyword.substring(0, 3).toUpperCase(),
            latitude: cityData.lat,
            longitude: cityData.lon,
            costIndex: Math.random() * 100,
            popularity: Math.floor(Math.random() * 1000),
          },
        });
        
        console.log(`  ✅ Created ${city.name} (fallback)`);
        continue;
      }

      const amadeusCity = cities[0];
      
      // Create or update city in database
      const city = await prisma.city.upsert({
        where: { amadeusCode: amadeusCity.iataCode },
        update: {
          name: amadeusCity.name,
          country: amadeusCity.address?.countryCode || cityData.country,
          latitude: amadeusCity.geoCode?.latitude || cityData.lat,
          longitude: amadeusCity.geoCode?.longitude || cityData.lon,
        },
        create: {
          name: amadeusCity.name,
          country: amadeusCity.address?.countryCode || cityData.country,
          description: `Explore the vibrant city of ${amadeusCity.name}`,
          amadeusCode: amadeusCity.iataCode,
          latitude: amadeusCity.geoCode?.latitude || cityData.lat,
          longitude: amadeusCity.geoCode?.longitude || cityData.lon,
          costIndex: Math.random() * 100, // Mock cost index
          popularity: Math.floor(Math.random() * 1000), // Mock popularity
        },
      });

      console.log(`  ✅ Created/Updated ${city.name} (${city.amadeusCode})`);

      // Now seed activities for this city
      await seedActivitiesForCity(city.id, cityData.lat, cityData.lon, city.name);
      
      // Add delay to respect API rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error: any) {
      console.error(`  ❌ Error seeding ${cityData.keyword}:`, error.message);
    }
  }

  console.log('\n✅ City seeding complete!');
}

async function seedActivitiesForCity(cityId: string, lat: number, lon: number, cityName: string) {
  try {
    console.log(`  🎯 Fetching activities for ${cityName}...`);
    
    // Search activities around city coordinates
    const activities = await ActivityService.searchActivitiesByLocation(lat, lon, 5); // 5km radius
    
    if (activities.length === 0) {
      console.log(`    ⚠️  No activities found from Amadeus`);
      return;
    }

    console.log(`    Found ${activities.length} activities`);
    
    let created = 0;
    for (const amadeusActivity of activities.slice(0, 20)) { // Limit to 20 activities per city
      try {
        const category = mapCategory(amadeusActivity.shortDescription || amadeusActivity.name || '');
        
        await prisma.activity.upsert({
          where: { amadeusActivityId: amadeusActivity.id },
          update: {},
          create: {
            cityId,
            name: amadeusActivity.name || 'Unnamed Activity',
            description: amadeusActivity.description || amadeusActivity.shortDescription || null,
            category,
            estimatedCost: amadeusActivity.price?.amount ? parseFloat(amadeusActivity.price.amount) : null,
            duration: amadeusActivity.minimumDuration ? parseDuration(amadeusActivity.minimumDuration) : null,
            imageUrl: amadeusActivity.pictures?.[0] || null,
            amadeusActivityId: amadeusActivity.id,
            rating: amadeusActivity.rating ? parseFloat(amadeusActivity.rating) : null,
            bookingLink: amadeusActivity.bookingLink || null,
            latitude: amadeusActivity.geoCode?.latitude || null,
            longitude: amadeusActivity.geoCode?.longitude || null,
          },
        });
        
        created++;
      } catch (actError: any) {
        // Skip duplicates silently
        if (!actError.message.includes('Unique constraint')) {
          console.error(`      ⚠️ Error creating activity:`, actError.message);
        }
      }
    }
    
    console.log(`    ✅ Created ${created} activities`);
    
  } catch (error: any) {
    console.error(`    ❌ Error fetching activities:`, error.message);
  }
}

// Convert ISO 8601 duration to minutes
function parseDuration(duration: string): number {
  const match = duration.match(/PT(\d+)H(\d+)?M?/);
  if (match) {
    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    return hours * 60 + minutes;
  }
  return 60; // Default 1 hour
}

async function main() {
  try {
    console.log('🚀 Starting Amadeus data seeding...\n');
    
    await seedCities();
    
    // Print summary
    const cityCount = await prisma.city.count();
    const activityCount = await prisma.activity.count();
    
    console.log('\n📊 Seeding Summary:');
    console.log(`   Cities: ${cityCount}`);
    console.log(`   Activities: ${activityCount}`);
    console.log('\n✨ All done!\n');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
```

## Final Steps

1. Copy all the controller code from COMPLETE_IMPLEMENTATION_PART1.md
2. Copy all the route files from above
3. Replace your `src/routes/index.ts` with the updated version
4. Copy the seeding script to `src/scripts/seedCitiesAndActivities.ts`
5. Run migrations and seed:

```bash
npx prisma generate
npx prisma migrate dev --name add-all-features
npm run seed
```

6. Start server:
```bash
npm run dev
```

The backend will now be fully functional with all features from the API specification!

import prisma from '../config/database';
import { ActivityCategory } from '@prisma/client';

// Top 10 popular cities to seed
const CITIES_TO_SEED = [
  { name: 'Paris', country: 'France', amadeusCode: 'PAR', lat: 48.8566, lon: 2.3522 },
  { name: 'London', country: 'United Kingdom', amadeusCode: 'LON', lat: 51.5074, lon: -0.1278 },
  { name: 'New York', country: 'United States', amadeusCode: 'NYC', lat: 40.7128, lon: -74.0060 },
  { name: 'Tokyo', country: 'Japan', amadeusCode: 'TYO', lat: 35.6762, lon: 139.6503 },
  { name: 'Dubai', country: 'United Arab Emirates', amadeusCode: 'DXB', lat: 25.2048, lon: 55.2708 },
  { name: 'Barcelona', country: 'Spain', amadeusCode: 'BCN', lat: 41.3851, lon: 2.1734 },
  { name: 'Rome', country: 'Italy', amadeusCode: 'ROM', lat: 41.9028, lon: 12.4964 },
  { name: 'Amsterdam', country: 'Netherlands', amadeusCode: 'AMS', lat: 52.3676, lon: 4.9041 },
  { name: 'Sydney', country: 'Australia', amadeusCode: 'SYD', lat: -33.8688, lon: 151.2093 },
  { name: 'Bangkok', country: 'Thailand', amadeusCode: 'BKK', lat: 13.7563, lon: 100.5018 },
];

async function seedCitiesAndActivities() {
  console.log('🌍 Starting city and activity seeding...\n');

  for (const cityData of CITIES_TO_SEED) {
    try {
      console.log(`📍 Processing ${cityData.name}, ${cityData.country}...`);

      // Create or update city in database
      const city = await prisma.city.upsert({
        where: { amadeusCode: cityData.amadeusCode },
        update: {
          name: cityData.name,
          country: cityData.country,
          latitude: cityData.lat,
          longitude: cityData.lon,
        },
        create: {
          name: cityData.name,
          country: cityData.country,
          amadeusCode: cityData.amadeusCode,
          latitude: cityData.lat,
          longitude: cityData.lon,
          description: `${cityData.name}, ${cityData.country}`,
        },
      });

      console.log(`   ✅ City saved: ${city.name} (${city.amadeusCode})`);

      // Seed sample activities
      const sampleActivities = [
        { name: 'City Tour', category: ActivityCategory.SIGHTSEEING, cost: 50 },
        { name: 'Local Restaurant', category: ActivityCategory.FOOD_DRINK, cost: 30 },
        { name: 'Museum Visit', category: ActivityCategory.CULTURE, cost: 20 },
        { name: 'Shopping District', category: ActivityCategory.SHOPPING, cost: 0 },
        { name: 'Nightclub', category: ActivityCategory.NIGHTLIFE, cost: 40 },
      ];

      let savedCount = 0;
      for (const activityData of sampleActivities) {
        try {
          await prisma.activity.create({
            data: {
              name: `${city.name} - ${activityData.name}`,
              description: `Enjoy ${activityData.name} in ${city.name}`,
              category: activityData.category,
              estimatedCost: activityData.cost,
              duration: 120, // 2 hours
              rating: 4.5,
              cityId: city.id,
            },
          });
          savedCount++;
        } catch (error) {
          // Skip duplicates
          continue;
        }
      }

      console.log(`   ✅ Saved ${savedCount} activities for ${city.name}\n`);
    } catch (error) {
      console.error(`   ❌ Error processing ${cityData.name}:`, error);
      continue;
    }
  }

  console.log('✨ Seeding completed!');
  
  // Print summary
  const cityCount = await prisma.city.count();
  const activityCount = await prisma.activity.count();
  
  console.log(`\n📊 Summary:`);
  console.log(`   Cities in database: ${cityCount}`);
  console.log(`   Activities in database: ${activityCount}`);
}

// Run seeding
seedCitiesAndActivities()
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

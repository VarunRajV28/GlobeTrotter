import prisma from '../config/database';

async function seedUserTrips() {
  console.log('🌍 Starting user trips seeding...\n');

  try {
    // Find or create the user
    let user = await prisma.user.findUnique({
      where: { email: 'venkatesh.k21062005@gmail.com' },
    });

    if (!user) {
      console.log('User not found. Creating new user...');
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('12345678', 10);
      
      user = await prisma.user.create({
        data: {
          email: 'venkatesh.k21062005@gmail.com',
          name: 'Venkatesh',
          password: hashedPassword,
          role: 'USER',
          status: 'ACTIVE',
        },
      });
      console.log(`✅ User created: ${user.email}\n`);
    } else {
      console.log(`✅ User found: ${user.email}\n`);
    }

    // Get some cities for the trips
    const cities = await prisma.city.findMany({ take: 10 });
    
    if (cities.length === 0) {
      console.log('❌ No cities found. Please run seed script first.');
      return;
    }

    const trips = [
      {
        name: 'Summer in Europe',
        description: 'Exploring the beautiful cities of Europe during summer',
        startDate: new Date('2026-06-15'),
        endDate: new Date('2026-07-01'),
        budget: 5000,
        destinations: ['Paris', 'Barcelona', 'Rome'],
        status: 'PLANNED',
      },
      {
        name: 'Asian Adventure',
        description: 'Discovering the cultures and cuisines of Asia',
        startDate: new Date('2026-09-10'),
        endDate: new Date('2026-09-25'),
        budget: 3500,
        destinations: ['Tokyo', 'Bangkok'],
        status: 'PLANNED',
      },
      {
        name: 'USA Road Trip',
        description: 'Cross-country adventure across the United States',
        startDate: new Date('2026-05-01'),
        endDate: new Date('2026-05-20'),
        budget: 6000,
        destinations: ['New York', 'Los Angeles'],
        status: 'CONFIRMED',
      },
      {
        name: 'Middle East Explorer',
        description: 'Luxury experience in Dubai',
        startDate: new Date('2026-12-01'),
        endDate: new Date('2026-12-10'),
        budget: 8000,
        destinations: ['Dubai'],
        status: 'PLANNED',
      },
      {
        name: 'Down Under',
        description: 'Australia and New Zealand exploration',
        startDate: new Date('2026-03-15'),
        endDate: new Date('2026-04-05'),
        budget: 7500,
        destinations: ['Sydney'],
        status: 'PLANNED',
      },
    ];

    for (const tripData of trips) {
      const trip = await prisma.trip.create({
        data: {
          userId: user.id,
          name: tripData.name,
          description: tripData.description,
          startDate: tripData.startDate,
          endDate: tripData.endDate,
          budget: tripData.budget,
          destinations: tripData.destinations,
          status: tripData.status as any,
          isPublic: false,
        },
      });

      console.log(`✅ Created trip: ${trip.name}`);

      // Add activities to this trip
      for (const destName of tripData.destinations) {
        const city = cities.find(c => c.name === destName);
        if (!city) continue;

        const activities = await prisma.activity.findMany({
          where: { cityId: city.id },
          take: 3, // Add 3 activities per destination
        });

        for (const activity of activities) {
          await prisma.tripActivity.create({
            data: {
              tripId: trip.id,
              activityId: activity.id,
              date: trip.startDate,
              notes: `Planned activity in ${city.name}`,
            },
          });
        }

        console.log(`   ✅ Added ${activities.length} activities for ${destName}`);
      }

      console.log('');
    }

    console.log('✨ User trips seeding completed!\n');

    // Print summary
    const tripCount = await prisma.trip.count({ where: { userId: user.id } });
    const activityCount = await prisma.tripActivity.count({
      where: { trip: { userId: user.id } },
    });

    console.log('📊 Summary:');
    console.log(`   User: ${user.email}`);
    console.log(`   Trips: ${tripCount}`);
    console.log(`   Trip Activities: ${activityCount}`);
  } catch (error) {
    console.error('❌ Error seeding user trips:', error);
    throw error;
  }
}

seedUserTrips()
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

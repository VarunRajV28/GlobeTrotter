/**
 * Test script to verify Amadeus API integration
 * Run with: npx ts-node src/test-amadeus.ts
 */

import dotenv from 'dotenv';
import {
  CitySearchService,
  ActivityService,
  HotelService,
} from './services/amadeus';

dotenv.config();

async function testAmadeusAPIs() {
  console.log('\n🧪 Testing Amadeus API Integration...\n');

  try {
    // Test 1: City Search
    console.log('1️⃣ Testing City Search API...');
    const cities = await CitySearchService.searchCities('paris');
    console.log(`   ✅ Found ${cities.length} cities`);
    if (cities.length > 0) {
      console.log(`   📍 First result: ${cities[0].name} (${cities[0].iataCode})`);
    }

    // Test 2: Get specific city
    console.log('\n2️⃣ Testing Get City by Code...');
    const paris = await CitySearchService.getCityByCode('PAR');
    console.log(`   ✅ Retrieved: ${paris.name}`);
    console.log(`   📍 Coordinates: ${paris.latitude}, ${paris.longitude}`);

    // Test 3: Activity Search
    console.log('\n3️⃣ Testing Activity Search...');
    const activities = await ActivityService.searchActivitiesByLocation(
      48.8566, // Paris latitude
      2.3522,  // Paris longitude
      5        // 5km radius
    );
    console.log(`   ✅ Found ${activities.length} activities`);
    if (activities.length > 0) {
      console.log(`   🎯 First activity: ${activities[0].name}`);
      console.log(`   💰 Price: ${activities[0].price.amount} ${activities[0].price.currency}`);
    }

    // Test 4: Hotel Search by City
    console.log('\n4️⃣ Testing Hotel Search...');
    const hotels = await HotelService.searchHotelsByCity('LON', 5);
    console.log(`   ✅ Found ${hotels.length} hotels in London`);
    if (hotels.length > 0) {
      console.log(`   🏨 First hotel: ${hotels[0].name} (${hotels[0].hotelId})`);
    }

    // Test 5: Hotel Offers with Pricing
    if (hotels.length > 0) {
      console.log('\n5️⃣ Testing Hotel Offers with Real-Time Pricing...');
      const tomorrow = new Date(Date.now() + 86400000);
      const dayAfter = new Date(Date.now() + 86400000 * 2);
      
      const checkIn = tomorrow.toISOString().split('T')[0];
      const checkOut = dayAfter.toISOString().split('T')[0];

      // Use first hotel only for testing
      const hotelIds = [hotels[0].hotelId];
      
      try {
        const offers = await HotelService.getHotelOffers(
          hotelIds,
          checkIn,
          checkOut,
          1, // 1 adult
          1, // 1 room
          'USD'
        );
        
        console.log(`   ✅ Retrieved offers for ${offers.length} hotels`);
        
        offers.forEach((offer: any) => {
          if (offer.available && offer.offers.length > 0) {
            const bestOffer = offer.offers[0];
            console.log(`   🏨 ${offer.hotel.name}:`);
            console.log(`      💰 ${bestOffer.price.total} ${bestOffer.price.currency}`);
            console.log(`      🛏️  ${bestOffer.roomDescription || bestOffer.roomType}`);
          }
        });
      } catch (error: any) {
        // It's okay if no rooms available in test environment
        if (error.code === 3664 || error.message?.includes('NO ROOMS AVAILABLE')) {
          console.log(`   ⚠️  No rooms available at test properties (expected in test env)`);
        } else {
          throw error;
        }
      }
    }

    console.log('\n✅ All Amadeus API tests passed!\n');

  } catch (error: any) {
    console.error('\n❌ Test failed:', error);
    if (error.errors) {
      console.error('   Errors:', error.errors);
    }
    process.exit(1);
  }
}

// Run tests
testAmadeusAPIs();

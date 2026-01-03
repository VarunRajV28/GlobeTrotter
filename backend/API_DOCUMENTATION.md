# GlobeTrotter Backend - API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Currently, no authentication is required. User ID is passed in request bodies.

---

## Endpoints

### Health Check
```
GET /api/health
```
**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-03T...",
  "service": "GlobeTrotter API"
}
```

---

## Users

### Create User
```
POST /api/users
```
**Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe"
}
```

### Get User by ID
```
GET /api/users/:id
```

### Get User by Email
```
GET /api/users/email/:email
```

---

## Itineraries

### Create Itinerary
```
POST /api/itineraries
```
**Body:**
```json
{
  "userId": "user_id_here",
  "name": "Europe Trip 2026",
  "description": "3-city European adventure",
  "totalBudget": 5000,
  "currency": "USD",
  "startDate": "2026-06-01",
  "endDate": "2026-06-10"
}
```

### Get All Itineraries for User
```
GET /api/itineraries?userId=user_id_here
```

### Get Itinerary by ID
```
GET /api/itineraries/:id
```
Returns complete itinerary with stops, activities, hotels, flights, and budget.

### Update Itinerary
```
PUT /api/itineraries/:id
```
**Body:** (all fields optional)
```json
{
  "name": "Updated Trip Name",
  "totalBudget": 6000,
  "status": "confirmed"
}
```

### Delete Itinerary
```
DELETE /api/itineraries/:id
```

---

## Itinerary Stops (Cities)

### Add Stop to Itinerary
```
POST /api/itineraries/:id/stops
```
**Body:**
```json
{
  "cityCode": "PAR",
  "cityName": "Paris",
  "countryCode": "FR",
  "latitude": 48.8566,
  "longitude": 2.3522,
  "sequence": 1,
  "checkInDate": "2026-06-01",
  "checkOutDate": "2026-06-04",
  "nights": 3,
  "notes": "Visit Eiffel Tower"
}
```

### Get All Stops
```
GET /api/itineraries/:id/stops
```

### Update Stop
```
PUT /api/itineraries/:id/stops/:stopId
```

### Delete Stop
```
DELETE /api/itineraries/:id/stops/:stopId
```

### Add Activity to Stop
```
POST /api/itineraries/:id/stops/:stopId/activities
```
**Body:**
```json
{
  "amadeusActivityId": "23642",
  "name": "Skip-the-line tickets to the Louvre",
  "shortDescription": "...",
  "description": "...",
  "rating": 4.8,
  "price": 45.00,
  "currency": "EUR",
  "bookingLink": "https://...",
  "minimumDuration": "PT3H",
  "pictures": ["https://..."],
  "latitude": 48.8606,
  "longitude": 2.3376
}
```

### Add Hotel to Stop
```
POST /api/itineraries/:id/stops/:stopId/hotels
```
**Body:**
```json
{
  "amadeusHotelId": "ACPAR419",
  "hotelName": "Hotel Le Notre Dame",
  "chainCode": "AC",
  "offerId": "TSXOJ6LFQ2",
  "roomType": "DOUBLE",
  "checkInDate": "2026-06-01",
  "checkOutDate": "2026-06-04",
  "nights": 3,
  "priceBase": 600,
  "priceTotal": 720,
  "currency": "EUR",
  "paymentType": "deposit",
  "cancellation": "FULL_STAY"
}
```

### Refresh Hotel Pricing
```
POST /api/itineraries/:id/stops/:stopId/hotels/refresh
```
Fetches latest pricing from Amadeus for all hotels in the stop.

---

## Destinations (Amadeus Integration)

### Search Cities
```
GET /api/destinations/search?keyword=paris&max=10&countryCode=FR
```
**Query Parameters:**
- `keyword` (required): Search term (min 2 chars)
- `max` (optional): Max results (default: 10)
- `countryCode` (optional): ISO 3166 country code

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "type": "location",
      "subType": "city",
      "name": "PARIS",
      "iataCode": "PAR",
      "countryCode": "FR",
      "latitude": 48.8566,
      "longitude": 2.3522,
      "airports": [...]
    }
  ]
}
```

### Get City by Code
```
GET /api/destinations/:cityCode
```

### Search Activities
```
GET /api/destinations/:cityCode/activities?latitude=48.8566&longitude=2.3522&radius=5
```
**Query Parameters:**
- `latitude` (required)
- `longitude` (required)
- `radius` (optional): Search radius in KM (0-20, default: 5)

### Get Activity by ID
```
GET /api/destinations/activities/:activityId
```

### Search Hotels in City
```
GET /api/destinations/:cityCode/hotels?radius=5&chainCodes=MC,RT&amenities=SWIMMING_POOL
```
**Query Parameters:**
- `radius` (optional): Search radius in KM (default: 5)
- `chainCodes` (optional): Comma-separated chain codes
- `amenities` (optional): Comma-separated amenities

### Get Hotel Offers with Pricing
```
POST /api/destinations/hotels/offers
```
**Body:**
```json
{
  "hotelIds": ["ACPAR419", "ACPAR420"],
  "checkInDate": "2026-06-01",
  "checkOutDate": "2026-06-04",
  "adults": 2,
  "roomQuantity": 1,
  "currency": "USD",
  "priceRange": "100-500"
}
```

### Get Offer Details
```
GET /api/destinations/hotels/offers/:offerId
```

---

## Flights

### Add Flight to Itinerary
```
POST /api/itineraries/:id/flights
```
**Body:**
```json
{
  "flightOfferId": "offer_123",
  "fromCityCode": "PAR",
  "toCityCode": "ROM",
  "departureDate": "2026-06-04T10:00:00",
  "arrivalDate": "2026-06-04T12:00:00",
  "carrierCode": "AF",
  "flightNumber": "1234",
  "duration": "PT2H",
  "passengers": 1,
  "priceBase": 150,
  "priceTotal": 180,
  "currency": "EUR",
  "cabinClass": "ECONOMY"
}
```

### Confirm Flight Price
```
POST /api/flights/price
```
**Body:**
```json
{
  "flightOffers": [
    {
      "type": "flight-offer",
      "id": "1",
      "source": "GDS",
      "itineraries": [...],
      "price": {...},
      "travelerPricings": [...]
    }
  ],
  "include": ["detailed-fare-rules"]
}
```

---

## Budget

### Calculate Itinerary Budget
```
GET /api/itineraries/:id/budget?refresh=true
```
**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "flightsCost": 500,
      "hotelsCost": 1200,
      "activitiesCost": 300,
      "totalCost": 2000,
      "currency": "USD"
    },
    "breakdown": {
      "flights": {
        "cost": 500,
        "count": 2,
        "percentage": 25
      },
      "hotels": {
        "cost": 1200,
        "count": 3,
        "percentage": 60
      },
      "activities": {
        "cost": 300,
        "count": 5,
        "percentage": 15
      },
      "total": 2000,
      "currency": "USD",
      "budget": 5000,
      "remaining": 3000,
      "overBudget": false
    }
  }
}
```

---

## Error Responses

All errors follow this format:
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": []
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `404` - Not Found
- `409` - Conflict (duplicate)
- `500` - Internal Server Error

---

## Amadeus API Integration Notes

### Available APIs:
1. **City Search** - Find cities by keyword with IATA codes and geocodes
2. **Tours & Activities** - Discover activities by location with pricing and booking links
3. **Hotel List** - Find hotels in cities with metadata
4. **Hotel Search** - Get real-time hotel offers with detailed pricing
5. **Flight Offers Price** - Confirm flight prices before booking

### Rate Limits (Test Environment):
- ~10 requests/second
- Token valid for 30 minutes
- SDK handles token refresh automatically

### Test Data Limitations:
- Activities API: Limited cities (check Amadeus docs)
- Hotel APIs: Use major cities (LON, NYC, PAR, ROM)
- Flight APIs: Use major airports

---

## Development Workflow

### 1. Create a User
```bash
POST /api/users
{
  "email": "traveler@example.com",
  "name": "Jane Traveler"
}
```

### 2. Create an Itinerary
```bash
POST /api/itineraries
{
  "userId": "{user_id}",
  "name": "Summer Europe Trip",
  "totalBudget": 5000,
  "currency": "USD"
}
```

### 3. Search and Add Cities
```bash
# Search for Paris
GET /api/destinations/search?keyword=paris

# Add Paris as stop
POST /api/itineraries/{itinerary_id}/stops
{
  "cityCode": "PAR",
  "cityName": "Paris",
  "sequence": 1,
  "checkInDate": "2026-06-01",
  "checkOutDate": "2026-06-04",
  "nights": 3
}
```

### 4. Find Hotels
```bash
# Search hotels in Paris
GET /api/destinations/PAR/hotels?radius=5

# Get offers with pricing
POST /api/destinations/hotels/offers
{
  "hotelIds": ["ACPAR419"],
  "checkInDate": "2026-06-01",
  "checkOutDate": "2026-06-04",
  "adults": 1
}

# Add hotel to stop
POST /api/itineraries/{itinerary_id}/stops/{stop_id}/hotels
{...hotel data...}
```

### 5. Find Activities
```bash
# Search activities near hotel
GET /api/destinations/PAR/activities?latitude=48.8566&longitude=2.3522&radius=5

# Add activity to stop
POST /api/itineraries/{itinerary_id}/stops/{stop_id}/activities
{...activity data...}
```

### 6. Add Flights
```bash
POST /api/itineraries/{itinerary_id}/flights
{...flight data...}
```

### 7. Calculate Budget
```bash
GET /api/itineraries/{itinerary_id}/budget
```

---

## Database Setup

The backend uses PostgreSQL with Prisma ORM. To set up:

```bash
# 1. Ensure PostgreSQL is installed and running

# 2. Update .env with your database URL
DATABASE_URL="postgresql://user:password@localhost:5432/globetrotter"

# 3. Run migrations
npm run prisma:migrate

# 4. (Optional) Open Prisma Studio to view data
npm run prisma:studio
```

---

## Testing with cURL

### Create User:
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User"}'
```

### Search Cities:
```bash
curl "http://localhost:5000/api/destinations/search?keyword=paris"
```

### Get Activities:
```bash
curl "http://localhost:5000/api/destinations/PAR/activities?latitude=48.8566&longitude=2.3522&radius=5"
```

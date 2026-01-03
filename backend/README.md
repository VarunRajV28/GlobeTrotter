# GlobeTrotter Backend API

Backend API for GlobeTrotter travel planning application with Amadeus API integration.

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **External APIs**: Amadeus Travel APIs

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your database and Amadeus API credentials
```

3. Set up database:
```bash
npm run prisma:generate
npm run prisma:migrate
```

4. Run development server:
```bash
npm run dev
```

## API Endpoints

### Itineraries
- `POST /api/itineraries` - Create new itinerary
- `GET /api/itineraries/:id` - Get itinerary details
- `PUT /api/itineraries/:id` - Update itinerary
- `DELETE /api/itineraries/:id` - Delete itinerary
- `GET /api/itineraries/:id/budget` - Get budget breakdown

### Itinerary Stops
- `POST /api/itineraries/:id/stops` - Add city stop
- `PUT /api/itineraries/:id/stops/:stopId` - Update stop
- `DELETE /api/itineraries/:id/stops/:stopId` - Delete stop

### Destinations (Amadeus Integration)
- `GET /api/destinations/search` - Search cities
- `GET /api/destinations/:cityCode/activities` - Get activities
- `GET /api/destinations/:cityCode/hotels` - Get hotels with pricing

### Flights
- `POST /api/itineraries/:id/flights/price` - Confirm flight prices

# GlobeTrotter Backend Setup Guide

## Prerequisites

1. **Node.js** (v18 or higher)
2. **PostgreSQL** (v14 or higher)
3. **npm** or **yarn**

---

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

Edit `.env`:
```env
# Server
PORT=5000
NODE_ENV=development

# Database - Update with your PostgreSQL credentials
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/globetrotter?schema=public"

# Amadeus API (already configured)
AMADEUS_CLIENT_ID=kv4vMHkAkGzA0whzWAaOPweIxmeBosj5
AMADEUS_CLIENT_SECRET=cvmjv1vBwyOAZdd3
AMADEUS_HOSTNAME=test

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### 3. Set Up PostgreSQL Database

#### Option A: Local PostgreSQL
```bash
# Create database
createdb globetrotter

# Or using psql
psql -U postgres
CREATE DATABASE globetrotter;
\q
```

#### Option B: Docker PostgreSQL
```bash
docker run --name globetrotter-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=globetrotter \
  -p 5432:5432 \
  -d postgres:14
```

### 4. Run Database Migrations
```bash
npm run prisma:migrate
```
When prompted, enter a migration name like: `init`

### 5. Generate Prisma Client
```bash
npm run prisma:generate
```

### 6. Start Development Server
```bash
npm run dev
```

The API will be available at: **http://localhost:5000**

---

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio (database GUI)

---

## Verify Setup

### 1. Check Health Endpoint
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-01-03T...",
  "service": "GlobeTrotter API"
}
```

### 2. Test Amadeus Integration
```bash
curl "http://localhost:5000/api/destinations/search?keyword=paris"
```

Should return a list of cities matching "paris".

---

## Database Schema

The database includes these models:

- **User** - Application users
- **Itinerary** - Travel plans with budget and dates
- **ItineraryStop** - Cities in the itinerary
- **ItineraryActivity** - Activities added to each stop
- **ItineraryHotel** - Hotels booked for each stop
- **FlightSegment** - Flights between cities
- **BudgetSummary** - Cost breakdown for each itinerary

View schema: `prisma/schema.prisma`

---

## Troubleshooting

### Database Connection Failed
- Ensure PostgreSQL is running
- Check DATABASE_URL in `.env`
- Verify database exists: `psql -U postgres -l`

### Prisma Migration Errors
```bash
# Reset database (⚠️ deletes all data)
npx prisma migrate reset

# Then run migrations again
npm run prisma:migrate
```

### Amadeus API Errors
- Check credentials in `.env`
- Verify you're using test environment: `AMADEUS_HOSTNAME=test`
- Review Amadeus docs for test data limitations

### Port Already in Use
Change PORT in `.env` to a different port (e.g., 5001)

---

## Development Tools

### Prisma Studio
Visual database editor:
```bash
npm run prisma:studio
```
Opens at: http://localhost:5555

### API Testing
- **Postman**: Import collection (see API_DOCUMENTATION.md)
- **cURL**: Examples in API_DOCUMENTATION.md
- **Thunder Client**: VS Code extension

---

## Project Structure

```
backend/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── config/
│   │   └── database.ts        # Prisma client
│   ├── controllers/           # Request handlers
│   │   ├── UserController.ts
│   │   ├── ItineraryController.ts
│   │   ├── StopController.ts
│   │   ├── DestinationController.ts
│   │   └── BudgetController.ts
│   ├── routes/                # API routes
│   │   ├── index.ts
│   │   ├── users.ts
│   │   ├── itineraries.ts
│   │   ├── destinations.ts
│   │   └── flights.ts
│   ├── services/              # Business logic
│   │   └── amadeus/           # Amadeus API wrappers
│   │       ├── AmadeusClient.ts
│   │       ├── CitySearchService.ts
│   │       ├── ActivityService.ts
│   │       ├── HotelService.ts
│   │       └── FlightPriceService.ts
│   └── server.ts              # Express app entry point
├── .env                       # Environment variables
├── .env.example               # Environment template
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
└── README.md                  # This file
```

---

## Next Steps

1. ✅ Backend is ready for development
2. 📱 Build frontend application
3. 🔐 Add authentication (JWT/OAuth)
4. 🚀 Deploy to cloud (Heroku, Render, Railway)
5. 📊 Add monitoring and logging
6. 🧪 Write tests

---

## API Documentation

See `API_DOCUMENTATION.md` for complete endpoint reference.

Quick links:
- Health: `GET /api/health`
- Search Cities: `GET /api/destinations/search?keyword=paris`
- Activities: `GET /api/destinations/:cityCode/activities`
- Hotels: `POST /api/destinations/hotels/offers`
- Create Itinerary: `POST /api/itineraries`
- Calculate Budget: `GET /api/itineraries/:id/budget`

---

## Support

For issues or questions:
1. Check API_DOCUMENTATION.md
2. Review Amadeus API docs: https://developers.amadeus.com
3. Check Prisma docs: https://www.prisma.io/docs

---

## License

MIT

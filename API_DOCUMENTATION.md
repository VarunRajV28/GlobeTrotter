# Travel Planning App - Backend API Documentation

## Overview
This document outlines all the API endpoints required for the full-stack travel planning application. The backend should be built with RESTful API principles using JSON payloads.

## Base URL
```
http://localhost:3001/api
```

## Authentication
All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## User Management APIs

### 1. User Registration
**POST** `/auth/register`

**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "name": "string",
      "email": "string",
      "avatar": "string (optional)"
    },
    "token": "string"
  }
}
```

### 2. User Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "name": "string",
      "email": "string",
      "avatar": "string (optional)"
    },
    "token": "string"
  }
}
```

### 3. Get Current User
**GET** `/auth/me`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "name": "string",
      "email": "string",
      "avatar": "string (optional)"
    }
  }
}
```

### 4. Update User Profile
**PUT** `/users/profile`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "string (optional)",
  "email": "string (optional)",
  "avatar": "string (optional)"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "name": "string",
      "email": "string",
      "avatar": "string (optional)"
    }
  }
}
```

---

## Trip Management APIs

### 5. Create Trip
**POST** `/trips`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "startDate": "string (ISO date)",
  "endDate": "string (ISO date)",
  "coverImageUrl": "string (optional)",
  "isPublic": "boolean",
  "budget": "number (optional)",
  "destinations": "array (optional)"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "trip": {
      "id": "string",
      "name": "string",
      "description": "string",
      "startDate": "string",
      "endDate": "string",
      "coverImageUrl": "string",
      "isPublic": "boolean",
      "userId": "string",
      "status": "string",
      "budget": "number",
      "destinations": "array",
      "createdAt": "string",
      "updatedAt": "string"
    }
  }
}
```

### 6. Get User's Trips
**GET** `/trips`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `status` (optional): "planned", "completed", "cancelled"
- `page` (optional): number (default: 1)
- `limit` (optional): number (default: 10)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "trips": [
      {
        "id": "string",
        "name": "string",
        "description": "string",
        "startDate": "string",
        "endDate": "string",
        "coverImageUrl": "string",
        "isPublic": "boolean",
        "userId": "string",
        "status": "string",
        "budget": "number",
        "destinations": "array",
        "createdAt": "string",
        "updatedAt": "string"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

### 7. Get Trip by ID
**GET** `/trips/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "trip": {
      "id": "string",
      "name": "string",
      "description": "string",
      "startDate": "string",
      "endDate": "string",
      "coverImageUrl": "string",
      "isPublic": "boolean",
      "userId": "string",
      "status": "string",
      "budget": "number",
      "destinations": "array",
      "activities": [
        {
          "id": "string",
          "name": "string",
          "description": "string",
          "category": "string",
          "estimatedCost": "number",
          "duration": "number",
          "imageUrl": "string",
          "cityId": "string",
          "city": {
            "id": "string",
            "name": "string",
            "country": "string",
            "description": "string",
            "imageUrl": "string",
            "costIndex": "number",
            "popularity": "number"
          }
        }
      ],
      "createdAt": "string",
      "updatedAt": "string"
    }
  }
}
```

### 8. Update Trip
**PUT** `/trips/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "string (optional)",
  "description": "string (optional)",
  "startDate": "string (optional)",
  "endDate": "string (optional)",
  "coverImageUrl": "string (optional)",
  "isPublic": "boolean (optional)",
  "budget": "number (optional)",
  "status": "string (optional)"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "trip": {
      "id": "string",
      "name": "string",
      "description": "string",
      "startDate": "string",
      "endDate": "string",
      "coverImageUrl": "string",
      "isPublic": "boolean",
      "userId": "string",
      "status": "string",
      "budget": "number",
      "destinations": "array",
      "updatedAt": "string"
    }
  }
}
```

### 9. Delete Trip
**DELETE** `/trips/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Trip deleted successfully"
}
```

### 10. Add Activity to Trip
**POST** `/trips/:tripId/activities`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "activityId": "string",
  "date": "string (ISO date)",
  "notes": "string (optional)"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "tripActivity": {
      "id": "string",
      "tripId": "string",
      "activityId": "string",
      "date": "string",
      "notes": "string",
      "activity": {
        "id": "string",
        "name": "string",
        "description": "string",
        "category": "string",
        "estimatedCost": "number",
        "duration": "number",
        "imageUrl": "string",
        "cityId": "string",
        "city": {
          "id": "string",
          "name": "string",
          "country": "string"
        }
      }
    }
  }
}
```

### 11. Remove Activity from Trip
**DELETE** `/trips/:tripId/activities/:activityId`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Activity removed from trip successfully"
}
```

---

## City Management APIs

### 12. Get All Cities
**GET** `/cities`

**Query Parameters:**
- `page` (optional): number (default: 1)
- `limit` (optional): number (default: 20)
- `country` (optional): string
- `sortBy` (optional): "name", "popularity", "costIndex"

**Response (200):**
```json
{
  "success": true,
  "data": {
    "cities": [
      {
        "id": "string",
        "name": "string",
        "country": "string",
        "description": "string",
        "imageUrl": "string",
        "costIndex": "number",
        "popularity": "number"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8
    }
  }
}
```

### 13. Search Cities
**GET** `/cities/search`

**Query Parameters:**
- `q`: string (required) - search query
- `limit` (optional): number (default: 10)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "cities": [
      {
        "id": "string",
        "name": "string",
        "country": "string",
        "description": "string",
        "imageUrl": "string",
        "costIndex": "number",
        "popularity": "number"
      }
    ]
  }
}
```

### 14. Get City by ID
**GET** `/cities/:id`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "city": {
      "id": "string",
      "name": "string",
      "country": "string",
      "description": "string",
      "imageUrl": "string",
      "costIndex": "number",
      "popularity": "number"
    }
  }
}
```

---

## Activity Management APIs

### 15. Get All Activities
**GET** `/activities`

**Query Parameters:**
- `page` (optional): number (default: 1)
- `limit` (optional): number (default: 20)
- `cityId` (optional): string
- `category` (optional): string
- `sortBy` (optional): "name", "estimatedCost", "duration"

**Response (200):**
```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "id": "string",
        "name": "string",
        "description": "string",
        "category": "string",
        "estimatedCost": "number",
        "duration": "number",
        "imageUrl": "string",
        "cityId": "string",
        "city": {
          "id": "string",
          "name": "string",
          "country": "string",
          "description": "string",
          "imageUrl": "string",
          "costIndex": "number",
          "popularity": "number"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 500,
      "pages": 25
    }
  }
}
```

### 16. Search Activities
**GET** `/activities/search`

**Query Parameters:**
- `q`: string (required) - search query
- `cityId` (optional): string
- `category` (optional): string
- `limit` (optional): number (default: 10)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "id": "string",
        "name": "string",
        "description": "string",
        "category": "string",
        "estimatedCost": "number",
        "duration": "number",
        "imageUrl": "string",
        "cityId": "string",
        "city": {
          "id": "string",
          "name": "string",
          "country": "string"
        }
      }
    ]
  }
}
```

### 17. Get Activity by ID
**GET** `/activities/:id`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "activity": {
      "id": "string",
      "name": "string",
      "description": "string",
      "category": "string",
      "estimatedCost": "number",
      "duration": "number",
      "imageUrl": "string",
      "cityId": "string",
      "city": {
        "id": "string",
        "name": "string",
        "country": "string",
        "description": "string",
        "imageUrl": "string",
        "costIndex": "number",
        "popularity": "number"
      }
    }
  }
}
```

---

## Trip Sharing APIs

### 18. Share Trip (Generate Share Link)
**POST** `/trips/:id/share`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "expiresIn": "number (optional) - days until link expires"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "shareId": "string",
    "shareUrl": "string",
    "expiresAt": "string (ISO date)"
  }
}
```

### 19. Get Shared Trip
**GET** `/shared/:shareId`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "trip": {
      "id": "string",
      "name": "string",
      "description": "string",
      "startDate": "string",
      "endDate": "string",
      "coverImageUrl": "string",
      "isPublic": "boolean",
      "userId": "string",
      "status": "string",
      "budget": "number",
      "destinations": "array",
      "activities": [
        {
          "id": "string",
          "name": "string",
          "description": "string",
          "category": "string",
          "estimatedCost": "number",
          "duration": "number",
          "imageUrl": "string",
          "cityId": "string",
          "city": {
            "id": "string",
            "name": "string",
            "country": "string"
          }
        }
      ],
      "createdAt": "string",
      "updatedAt": "string"
    },
    "creator": {
      "name": "string",
      "avatar": "string (optional)"
    }
  }
}
```

### 20. Copy Trip to User
**POST** `/shared/:shareId/copy`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "string (optional) - custom name for copied trip"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "trip": {
      "id": "string",
      "name": "string",
      "description": "string",
      "startDate": "string",
      "endDate": "string",
      "coverImageUrl": "string",
      "isPublic": "boolean",
      "userId": "string",
      "status": "string",
      "budget": "number",
      "destinations": "array",
      "createdAt": "string",
      "updatedAt": "string"
    }
  }
}
```

---

## Admin APIs (Admin Only)

### 21. Get Admin Dashboard Stats
**GET** `/admin/stats`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalUsers": "number",
    "totalTrips": "number",
    "totalActivities": "number",
    "totalRevenue": "number",
    "activeUsers": "number",
    "newUsersThisMonth": "number",
    "topCities": [
      {
        "name": "string",
        "count": "number"
      }
    ],
    "systemHealth": {
      "status": "healthy|warning|error",
      "uptime": "string",
      "responseTime": "number"
    }
  }
}
```

### 22. Get All Users (Admin)
**GET** `/admin/users`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `page` (optional): number (default: 1)
- `limit` (optional): number (default: 20)
- `status` (optional): "active", "inactive", "banned"

**Response (200):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "string",
        "name": "string",
        "email": "string",
        "avatar": "string",
        "status": "string",
        "createdAt": "string",
        "lastLogin": "string"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1247,
      "pages": 63
    }
  }
}
```

### 23. Update User Status (Admin)
**PUT** `/admin/users/:id/status`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "status": "active|inactive|banned"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "User status updated successfully"
}
```

---

## Error Response Format

All endpoints return errors in the following format:

```json
{
  "success": false,
  "error": {
    "code": "string",
    "message": "string",
    "details": "object (optional)"
  }
}
```

### Common Error Codes:
- `VALIDATION_ERROR`: Invalid request data
- `UNAUTHORIZED`: Missing or invalid authentication
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `CONFLICT`: Resource conflict (e.g., duplicate email)
- `INTERNAL_ERROR`: Server error

---

## Rate Limiting

- Public endpoints: 100 requests per minute per IP
- Authenticated endpoints: 1000 requests per minute per user
- Admin endpoints: 500 requests per minute per admin

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

---

## Data Types

### User Status
- `active`: Normal user account
- `inactive`: Account deactivated
- `banned`: Account suspended by admin

### Trip Status
- `planned`: Trip is being planned
- `confirmed`: Trip is confirmed and booked
- `completed`: Trip has been completed
- `cancelled`: Trip was cancelled

### Activity Categories
- `Sightseeing`
- `Food & Drink`
- `Adventure`
- `Culture`
- `Shopping`
- `Nightlife`
- `Relaxation`
- `Sports`
- `Transportation`

This API documentation covers all the endpoints needed for the full-stack travel planning application.
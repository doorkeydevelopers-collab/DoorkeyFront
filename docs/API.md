# DoorKey API Documentation

Complete API documentation for the DoorKey property listing platform.

## Base URL

```
http://localhost:3000/api
```

## Authentication

All requests requiring authentication should include the auth token in the Authorization header:

```
Authorization: Bearer <token>
```

Tokens are obtained via the login endpoint and stored in localStorage.

---

## Endpoints

### Authentication

#### Login
- **Endpoint**: `POST /auth/login`
- **Auth Required**: No
- **Description**: Authenticate user and receive auth token

**Request Body**:
```json
{
  "email": "owner@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_1",
      "email": "owner@example.com",
      "fullName": "Property Owner",
      "role": "owner",
      "phone": "9876543210"
    },
    "token": "token_user_1_1234567890"
  },
  "message": "Login successful"
}
```

---

#### Sign Up
- **Endpoint**: `POST /auth/signup`
- **Auth Required**: No
- **Description**: Register a new user account

**Request Body**:
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "fullName": "New User",
  "role": "tenant",
  "phone": "9876543210"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_new_1234",
      "email": "newuser@example.com",
      "fullName": "New User",
      "role": "tenant",
      "phone": "9876543210"
    },
    "token": "token_user_new_1234_1234567890"
  },
  "message": "Account created successfully"
}
```

---

### Properties

#### Get All Properties
- **Endpoint**: `GET /properties`
- **Auth Required**: No
- **Description**: Fetch properties with optional filters and pagination

**Query Parameters**:
```
search=string       // Search by title or locality
city=string         // Filter by city
type=string         // Filter by property type (Residential, Commercial, etc.)
minPrice=number     // Minimum price filter
maxPrice=number     // Maximum price filter
minArea=number      // Minimum area filter (sq ft)
maxArea=number      // Maximum area filter (sq ft)
page=number         // Page number (default: 1)
limit=number        // Items per page (default: 10)
```

**Example Request**:
```
GET /properties?city=Mumbai&type=Residential&minPrice=5000000&page=1&limit=10
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "prop_1",
      "title": "Luxury 3 BHK Apartment",
      "type": "Residential",
      "city": "Mumbai",
      "locality": "Bandra",
      "price": 10000000,
      "area": 1500,
      "description": "Beautiful apartment with modern amenities",
      "amenities": ["WiFi", "Parking", "Gym"],
      "images": ["https://..."],
      "isFeatured": true,
      "status": "Available",
      "ownerName": "John Doe",
      "ownerPhone": "9876543210",
      "createdAt": "2024-03-15T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

---

#### Get Single Property
- **Endpoint**: `GET /properties/:id`
- **Auth Required**: No
- **Description**: Fetch detailed information about a specific property

**Example Request**:
```
GET /properties/prop_1
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "prop_1",
    "title": "Luxury 3 BHK Apartment",
    "type": "Residential",
    "city": "Mumbai",
    "locality": "Bandra",
    "price": 10000000,
    "area": 1500,
    "description": "Beautiful apartment with modern amenities",
    "amenities": ["WiFi", "Parking", "Gym", "Security"],
    "images": [
      "https://images.unsplash.com/...",
      "https://images.unsplash.com/..."
    ],
    "isFeatured": true,
    "status": "Available",
    "ownerId": "user_1",
    "ownerName": "John Doe",
    "ownerEmail": "john@example.com",
    "ownerPhone": "9876543210",
    "createdAt": "2024-03-15T10:00:00Z",
    "updatedAt": "2024-03-15T10:00:00Z"
  }
}
```

---

#### Create Property
- **Endpoint**: `POST /properties`
- **Auth Required**: Yes (Owner role)
- **Description**: Create a new property listing

**Request Body**:
```json
{
  "title": "New 2 BHK Apartment",
  "type": "Residential",
  "city": "Bangalore",
  "locality": "Whitefield",
  "price": 8000000,
  "area": 1200,
  "description": "Well-maintained 2 BHK apartment near IT park",
  "amenities": ["WiFi", "Parking", "Pool"],
  "images": ["https://..."]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "prop_new_1",
    "title": "New 2 BHK Apartment",
    "type": "Residential",
    "city": "Bangalore",
    "locality": "Whitefield",
    "price": 8000000,
    "area": 1200,
    "description": "Well-maintained 2 BHK apartment near IT park",
    "amenities": ["WiFi", "Parking", "Pool"],
    "images": ["https://..."],
    "isFeatured": false,
    "status": "Available",
    "ownerId": "user_1",
    "createdAt": "2024-03-15T10:30:00Z"
  },
  "message": "Property created successfully"
}
```

---

#### Update Property
- **Endpoint**: `PUT /properties/:id`
- **Auth Required**: Yes (Property owner)
- **Description**: Update property details

**Request Body**:
```json
{
  "title": "Updated Property Title",
  "price": 8500000,
  "status": "Rented",
  "description": "Updated description"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "prop_1",
    "title": "Updated Property Title",
    "price": 8500000,
    "status": "Rented",
    "updatedAt": "2024-03-15T11:00:00Z"
  },
  "message": "Property updated successfully"
}
```

---

#### Delete Property
- **Endpoint**: `DELETE /properties/:id`
- **Auth Required**: Yes (Property owner)
- **Description**: Delete a property listing

**Response**:
```json
{
  "success": true,
  "message": "Property deleted successfully",
  "data": {
    "id": "prop_1"
  }
}
```

---

## Error Handling

All endpoints return standard error responses:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

**Common HTTP Status Codes**:
- `200`: OK - Request successful
- `201`: Created - Resource created successfully
- `400`: Bad Request - Invalid parameters
- `401`: Unauthorized - Authentication required
- `403`: Forbidden - Permission denied
- `404`: Not Found - Resource not found
- `500`: Internal Server Error - Server error

---

## Rate Limiting

Currently no rate limiting implemented. When moving to production, implement:
- 100 requests per minute per IP
- 1000 requests per hour per authenticated user

---

## Response Format

All responses follow this format:

```json
{
  "success": boolean,
  "data": object|array,        // Only on success
  "error": string,             // Only on error
  "message": string,           // Optional
  "pagination": object         // Only when applicable
}
```

---

## Data Models

### User
```typescript
{
  id: string;
  email: string;
  fullName: string;
  role: 'owner' | 'tenant' | 'admin';
  phone: string;
  avatar?: string;
  verified: boolean;
  createdAt: string;
}
```

### Property
```typescript
{
  id: string;
  title: string;
  type: 'Residential' | 'Commercial' | 'Industrial' | 'Agricultural';
  city: string;
  locality: string;
  price: number;
  area: number;
  description: string;
  amenities: string[];
  images: string[];
  isFeatured: boolean;
  status: 'Available' | 'Rented' | 'Pending';
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  createdAt: string;
  updatedAt: string;
}
```

---

## Usage Examples

### JavaScript/TypeScript (Using Axios)

```typescript
import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

// Get all properties
const properties = await axios.get(`${API_BASE}/properties?city=Mumbai`);

// Get single property
const property = await axios.get(`${API_BASE}/properties/prop_1`);

// Create property (with auth)
const newProperty = await axios.post(
  `${API_BASE}/properties`,
  {
    title: 'New Property',
    type: 'Residential',
    city: 'Delhi',
    locality: 'Dwarka',
    price: 5000000,
    area: 1000,
    description: 'Great property'
  },
  {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
);
```

### cURL

```bash
# Get properties
curl "http://localhost:3000/api/properties?city=Mumbai"

# Login
curl -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@example.com","password":"password123"}'

# Create property
curl -X POST "http://localhost:3000/api/properties" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title":"New Property",
    "type":"Residential",
    "city":"Mumbai",
    "locality":"Bandra",
    "price":10000000,
    "area":1500,
    "description":"Property description"
  }'
```

---

## Integration Checklist

When integrating with a real backend:

- [ ] Replace mock data in `services/mockData.ts`
- [ ] Update `services/axiosConfig.ts` with real API base URL
- [ ] Implement proper authentication with JWT tokens
- [ ] Add password hashing (bcrypt)
- [ ] Setup database (PostgreSQL/MongoDB)
- [ ] Add input validation and sanitization
- [ ] Implement error logging
- [ ] Add rate limiting
- [ ] Setup CORS properly
- [ ] Add API documentation (Swagger/OpenAPI)
- [ ] Implement caching where appropriate
- [ ] Add comprehensive tests

# Backend API Documentation

This document outlines all the API routes and endpoints that the frontend expects. Use this as a reference when building your backend with Prisma and your preferred framework (Express, NestJS, Fastify, etc.).

## Base URL

All API routes should be prefixed with `/api`.

---

## Authentication Routes

### POST `/api/auth/signup`
Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "fullname": "John Doe",
  "phone": "+1234567890" // optional
}
```

**Response (201):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "fullname": "John Doe",
    "role": "USER",
    "phone": "+1234567890"
  },
  "token": "jwt_token_here"
}
```

**Errors:**
- `400` - Validation error (invalid email, weak password)
- `409` - Email already exists

---

### POST `/api/auth/login`
Authenticate a user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "fullname": "John Doe",
    "role": "USER"
  },
  "token": "jwt_token_here"
}
```

**Errors:**
- `401` - Invalid credentials
- `404` - User not found

---

### POST `/api/auth/logout`
Logout current user (invalidate token).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### GET `/api/auth/me`
Get current authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "fullname": "John Doe",
    "role": "USER",

  }
}
```

---

## User Routes

### PATCH `/api/user/profile`
Update user profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "fullname": "John Updated",
  "phone": "+0987654321"
}
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "fullname": "John Updated",
    "role": "USER",
    "phone": "+0987654321"
  }
}
```

---

## Artist Routes

### GET `/api/artists`
Get all artists.

**Query Parameters:**
- `page` (optional): Page number for pagination
- `limit` (optional): Items per page (default: 20)
- `search` (optional): Search by store name

**Response (200):**
```json
{
  "artists": [
    {
      "id": 1,
      "userId": 5,
      "storeName": "Abstract Dreams",
      "bio": "Contemporary abstract artist...",
      "birthDate": "1985-03-15",
      "artworksCount": 12,
      "user": {
        "fullname": "Jane Artist"
      }
    }
  ],
  "total": 50,
  "page": 1,
  "totalPages": 3
}
```

---

### GET `/api/artists/:id`
Get single artist by ID.

**Response (200):**
```json
{
  "artist": {
    "id": 1,
    "userId": 5,
    "storeName": "Abstract Dreams",
    "bio": "Contemporary abstract artist...",
    "birthDate": "1985-03-15",
    "artworks": [...],
    "user": {
      "fullname": "Jane Artist"
    }
  }
}
```

---

### POST `/api/artists/apply`
Apply to become an artist (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "storeName": "My Art Gallery",
  "bio": "I create beautiful paintings..."
}
```

**Response (201):**
```json
{
  "success": true,
  "artist": {
    "id": 1,
    "storeName": "My Art Gallery",
    "bio": "I create beautiful paintings..."
  }
}
```

---

## Artwork Routes

### GET `/api/artworks`
Get all artworks with filtering.

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page (default: 20)
- `search` (optional): Search in title, description, medium
- `categoryId` (optional): Filter by category ID
- `artistId` (optional): Filter by artist ID
- `minPrice` (optional): Minimum price
- `maxPrice` (optional): Maximum price
- `available` (optional): "true" for available only
- `featured` (optional): "true" for featured only
- `sortBy` (optional): "price_asc", "price_desc", "newest", "oldest"

**Response (200):**
```json
{
  "artworks": [
    {
      "id": 1,
      "title": "Sunset Dreams",
      "description": "A beautiful abstract painting...",
      "price": 1200.00,
      "artistId": 1,
      "artist": {
        "id": 1,
        "storeName": "Abstract Dreams"
      },
      "image": ["https://..."],
      "dimensions": "24x36 inches",
      "medium": "Oil on Canvas",
      "year": 2024,
      "available": true,
      "featured": true,
      "stock": 1,
      "isUnique": true,
      "categories": [
        { "id": 1, "name": "Abstract" }
      ]
    }
  ],
  "total": 100,
  "page": 1,
  "totalPages": 5
}
```

---

### GET `/api/artworks/:id`
Get single artwork by ID.

**Response (200):**
```json
{
  "artwork": {
    "id": 1,
    "title": "Sunset Dreams",
    "description": "A beautiful abstract painting...",
    "price": 1200.00,
    "artist": {
      "id": 1,
      "storeName": "Abstract Dreams",
      "bio": "..."
    },
    "image": ["https://..."],
    "dimensions": "24x36 inches",
    "medium": "Oil on Canvas",
    "year": 2024,
    "available": true,
    "categories": [...]
  }
}
```

---

### POST `/api/artworks` (Seller/Admin only)
Create a new artwork.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "New Artwork",
  "description": "Description here",
  "price": 500.00,
  "image": ["https://..."],
  "dimensions": "18x24 inches",
  "medium": "Acrylic",
  "year": 2024,
  "categoryIds": [1, 2],
  "stock": 1,
  "isUnique": true
}
```

---

## Category Routes

### GET `/api/categories`
Get all categories.

**Response (200):**
```json
{
  "categories": [
    { "id": 1, "name": "Abstract" },
    { "id": 2, "name": "Portrait" },
    { "id": 3, "name": "Landscape" }
  ]
}
```

---

## Cart Routes

### GET `/api/cart`
Get current user's cart.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "cart": {
    "id": 1,
    "userId": 5,
    "cartItems": [
      {
        "id": 1,
        "quantity": 1,
        "artwork": {
          "id": 1,
          "title": "Sunset Dreams",
          "price": 1200.00,
          "image": ["https://..."]
        }
      }
    ],
    "total": 1200.00
  }
}
```

---

### POST `/api/cart/items`
Add item to cart.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "artworkId": 1,
  "quantity": 1
}
```

---

### PATCH `/api/cart/items/:itemId`
Update cart item quantity.

**Request Body:**
```json
{
  "quantity": 2
}
```

---

### DELETE `/api/cart/items/:itemId`
Remove item from cart.

---

## Order Routes

### GET `/api/orders`
Get user's orders.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "orders": [
    {
      "id": 1,
      "totalAmount": 1200.00,
      "status": "PENDING",
      "createdAt": "2024-01-15T10:00:00Z",
      "orderItems": [...]
    }
  ]
}
```

---

### POST `/api/orders`
Create a new order from cart.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "shippingAddressId": 1,
  "paymentMethodId": 1
}
```

---

### GET `/api/orders/:id`
Get single order details.

---

## Shipping Address Routes

### GET `/api/shipping-addresses`
Get user's shipping addresses.

### POST `/api/shipping-addresses`
Add new shipping address.

**Request Body:**
```json
{
  "addressLine1": "123 Main St",
  "addressLine2": "Apt 4B",
  "city": "New York",
  "state": "NY",
  "postalCode": "10001",
  "country": "USA"
}
```

---

## Payment Method Routes

### GET `/api/payment-methods`
Get user's payment methods.

### POST `/api/payment-methods`
Add new payment method.

**Request Body:**
```json
{
  "method": "credit_card",
  "provider": "Stripe"
}
```

---

## Search Route

### GET `/api/search`
Global search across artworks and artists.

**Query Parameters:**
- `q`: Search query

**Response (200):**
```json
{
  "artworks": [...],
  "artists": [...]
}
```

---



### Key Implementation Notes

1. **Authentication**: Use JWT tokens stored in HTTP-only cookies or Authorization header
2. **Password Hashing**: Use bcrypt with at least 10 salt rounds
3. **Validation**: Use Zod or Joi for request validation
4. **Error Handling**: Implement global error handler middleware
5. **CORS**: Configure CORS for your frontend URL
6. **Rate Limiting**: Implement rate limiting on auth routes
7. **Pagination**: Use cursor-based or offset pagination consistently

### Environment Variables Needed
```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"
BCRYPT_SALT_ROUNDS=10
```

### Security Considerations

1. **Never store passwords in plain text** - always hash with bcrypt
2. **Use HTTPS in production**
3. **Implement rate limiting** on authentication endpoints
4. **Validate and sanitize all user inputs**
5. **Use parameterized queries** (Prisma handles this)
6. **Implement proper CORS** configuration
7. **Add request logging** for debugging and security auditing


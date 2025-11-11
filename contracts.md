# 808Records Admin System - API Contracts

## Backend Implementation

### Models

#### Admin Model
- email: String (unique, required)
- password: String (hashed, required)
- created_at: DateTime
- created_by: String (email of creator)

#### SiteContent Model
- section: String (hero, roster, releases, about, contact)
- content: Object (flexible schema for different content types)
- updated_at: DateTime
- updated_by: String (admin email)

### API Endpoints

#### Authentication
- POST `/api/admin/login` - Login admin
  - Body: { email, password }
  - Returns: { token, admin: { email } }

- POST `/api/admin/logout` - Logout admin
  - Headers: Authorization: Bearer <token>

- GET `/api/admin/verify` - Verify token
  - Headers: Authorization: Bearer <token>
  - Returns: { valid: boolean, admin: { email } }

#### Admin Management
- GET `/api/admin/list` - Get all admins (protected)
  - Headers: Authorization: Bearer <token>
  - Returns: [{ email, created_at, created_by }]

- POST `/api/admin/create` - Create new admin (protected)
  - Headers: Authorization: Bearer <token>
  - Body: { email, password }
  - Returns: { success: boolean, admin: { email } }

- DELETE `/api/admin/:email` - Delete admin (protected)
  - Headers: Authorization: Bearer <token>
  - Returns: { success: boolean }

#### Content Management
- GET `/api/content/:section` - Get content for section
  - Returns: { content: Object }

- PUT `/api/content/:section` - Update content (protected)
  - Headers: Authorization: Bearer <token>
  - Body: { content: Object }
  - Returns: { success: boolean }

### Security
- Use bcrypt for password hashing
- Use JWT for token-based authentication
- Token expiration: 24 hours
- Protect all admin routes with middleware

## Frontend Implementation

### Routes
- `/admin/login` - Login page
- `/admin/dashboard` - Admin dashboard (protected)

### Components
- AdminLogin - Login form
- AdminDashboard - Main dashboard with content editor
- AdminList - View and manage admins
- ContentEditor - Edit site content sections

### State Management
- Store JWT token in localStorage
- Clear token on logout
- Redirect to login if token invalid

### Protected Route Logic
- Check token validity before rendering dashboard
- Redirect to login if no token or invalid token

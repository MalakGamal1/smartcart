# 🛒 SmartCart API

E-Commerce REST API for Laptops & Laptop Accessories built with **Node.js + Express.js + MongoDB + Mongoose**.

---

## 📦 Tech Stack

| Tech | Version |
|---|---|
| Node.js | v18+ |
| Express.js | v5 |
| MongoDB | v6+ |
| Mongoose | v9 |
| JWT | jsonwebtoken |
| Password Hashing | bcryptjs |
| Validation | express-validator |

---

## 📁 Project Structure

```
SmartCart/
├── app.js                  # Express setup & route registration
├── server.js               # app.listen only
├── .env                    # Environment variables
├── config/
│   └── db.js               # MongoDB connection
├── models/
│   ├── User.js
│   ├── Product.js
│   ├── Category.js
│   ├── Order.js
│   └── Cart.js
├── controllers/
│   ├── authController.js
│   ├── adminController.js
│   ├── userController.js
│   ├── productController.js
│   ├── categoryController.js
│   ├── cartController.js
│   └── orderController.js
├── routes/
│   ├── authRoutes.js
│   ├── adminRoutes.js
│   ├── userRoutes.js
│   ├── productRoutes.js
│   ├── categoryRoutes.js
│   ├── cartRoutes.js
│   └── orderRoutes.js
├── middleware/
│   ├── auth.js             # verifyToken
│   ├── isAdmin.js          # checkAdmin
│   ├── errorHandler.js     # Global error handler
│   └── validation.js       # express-validator rules
└── seed/
    └── adminSeeder.js      # Creates default admin account
```

---

## ⚙️ Setup & Installation

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
Edit `.env`:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/smartcart
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### 3. Seed the admin account
```bash
npm run seed
```
Creates: `admin@smartcart.com` / `Admin@1234`

### 4. Start the server
```bash
# Development (auto-reload)
npm run dev

# Production
npm start
```

---

## 🗄️ Database (MongoDB + Mongoose)

### Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────┐
│     User     │       │     Product      │       │   Category   │
├──────────────┤       ├──────────────────┤       ├──────────────┤
│ _id          │       │ _id              │       │ _id          │
│ name*        │       │ name*            │       │ name* (uniq) │
│ email* (uniq)│◄──┐   │ description      │   ┌──►│ description  │
│ password*    │   │   │ price* (≥0)      │   │   └──────────────┘
│ role (enum)  │   │   │ stock* (≥0)      │   │
│ createdAt    │   │   │ category* ───────┼───┘
└──────┬───────┘   │   │ images []        │
       │           │   │ brand            │
       │           │   │ createdAt        │
       │           │   └────────┬─────────┘
       │           │            │
       ▼           │            ▼
┌──────────────┐   │   ┌──────────────────┐
│     Cart     │   │   │      Order       │
├──────────────┤   │   ├──────────────────┤
│ _id          │   │   │ _id              │
│ user* (uniq)─┼───┤   │ user* ───────────┼───┘
│ items[]:     │   │   │ items[]:         │
│  - product*──┼───┼──►│  - product*      │
│  - quantity* │   │   │  - quantity*     │
└──────────────┘   │   │  - price*        │
                   │   │ totalPrice*      │
                   │   │ status (enum)    │
                   │   │ createdAt        │
                   └───┤                  │
                       └──────────────────┘
```

### 1. User

| Field | Type | Constraints |
|---|---|---|
| `name` | String | required, trimmed |
| `email` | String | required, unique, lowercase, validated |
| `password` | String | required, min 6 chars, hashed (bcrypt) |
| `role` | String | enum: `['user', 'admin']`, default: `'user'` |
| `createdAt` | Date | default: `Date.now` |

> **Note:** Admin is a User with `role: 'admin'`. No separate Admin collection.
> Password is excluded from JSON output via `toJSON()`.

### 2. Product

| Field | Type | Constraints |
|---|---|---|
| `name` | String | required, trimmed |
| `description` | String | trimmed |
| `price` | Number | required, min: 0 |
| `stock` | Number | required, min: 0 |
| `category` | ObjectId → Category | required, ref: `'Category'` |
| `images` | [String] | default: `[]` |
| `brand` | String | trimmed |
| `createdAt` | Date | default: `Date.now` |

### 3. Category

| Field | Type | Constraints |
|---|---|---|
| `name` | String | required, unique, trimmed |
| `description` | String | trimmed |

### 4. Order

| Field | Type | Constraints |
|---|---|---|
| `user` | ObjectId → User | required |
| `items` | Array of subdocs | see below |
| `items.product` | ObjectId → Product | required |
| `items.quantity` | Number | required, min: 1 |
| `items.price` | Number | required, min: 0 (snapshot at order time) |
| `totalPrice` | Number | required, min: 0 |
| `status` | String | enum: `['pending','processing','shipped','delivered','cancelled']`, default: `'pending'` |
| `createdAt` | Date | default: `Date.now` |

### 5. Cart

| Field | Type | Constraints |
|---|---|---|
| `user` | ObjectId → User | required, unique (one cart per user) |
| `items` | Array of subdocs | see below |
| `items.product` | ObjectId → Product | required |
| `items.quantity` | Number | required, min: 1 |

### Relationships Summary

| Relationship | Type | Description |
|---|---|---|
| User → Cart | 1:1 | Each user has exactly one cart |
| User → Order | 1:N | A user can have many orders |
| Category → Product | 1:N | A category has many products |
| Product → Cart.items | N:M | Products appear in multiple carts |
| Product → Order.items | N:M | Products appear in multiple orders |

---

## 🔐 Authentication

All protected routes require a **Bearer Token** in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### User Roles
| Role | Access |
|---|---|
| `user` | Cart, Orders (own), Products & Categories (read) |
| `admin` | Everything + User management, all orders |

---

## 📬 API Endpoints

### 🔑 Auth (User) — `/api/auth`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | None | Register new user |
| POST | `/api/auth/login` | None | User login → returns JWT |

### 🛡️ Auth (Admin) — `/api/admin`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/admin/login` | None | Admin login → returns JWT |

> ⚠️ No admin registration endpoint. Use `npm run seed` only.

### 👤 Users — `/api/users` (Admin only)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/users` | Admin | Get all users |
| GET | `/api/users/:id` | Admin | Get user by ID |
| PUT | `/api/users/:id` | Admin | Update user |
| DELETE | `/api/users/:id` | Admin | Delete user |

### 🗂️ Categories — `/api/categories`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/categories` | None | Get all categories |
| GET | `/api/categories/:id` | None | Get category by ID |
| POST | `/api/categories` | Admin | Create category |
| PUT | `/api/categories/:id` | Admin | Update category |
| DELETE | `/api/categories/:id` | Admin | Delete category |

### 📦 Products — `/api/products`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/products` | None | Get all products (with filters) |
| GET | `/api/products/:id` | None | Get product by ID |
| POST | `/api/products` | Admin | Create product |
| PUT | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Delete product |

#### Product Query Filters
```
GET /api/products?minPrice=500&maxPrice=2000
GET /api/products?category=<categoryId>
GET /api/products?brand=Dell
GET /api/products?inStock=true
GET /api/products?search=laptop
```
Filters can be combined freely.

### 🛒 Cart — `/api/cart` (User token required)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/cart` | User | Get current user's cart |
| POST | `/api/cart` | User | Add item `{ productId, quantity }` |
| DELETE | `/api/cart` | User | Clear entire cart |
| DELETE | `/api/cart/:productId` | User | Remove specific item |

### 📋 Orders — `/api/orders` (User token required)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/orders` | User/Admin | Get orders (admin sees all) |
| GET | `/api/orders/:id` | User/Admin | Get single order |
| POST | `/api/orders` | User | Create order from cart |
| PATCH | `/api/orders/:id/status` | Admin | Update order status |

#### Order Status Values
`pending` → `processing` → `shipped` → `delivered` → `cancelled`

---

## 🌱 Seed Script

```bash
npm run seed
```

Creates admin account:
- **Email:** admin@smartcart.com
- **Password:** Admin@1234

---

## ❌ Error Responses

All errors follow this format:
```json
{
  "success": false,
  "message": "Descriptive error message",
  "error": "Stack trace (development only)"
}
```

| Status | Meaning |
|---|---|
| 400 | Bad request / Validation error |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient role) |
| 404 | Resource not found |
| 409 | Conflict (duplicate email/name) |
| 500 | Internal server error |

---

## 📮 Postman Collection

Import `SmartCart_API.postman_collection.json` into Postman.

**Collection Variables (auto-saved):**
- `{{baseUrl}}` = `http://localhost:3000`
- `{{token}}` = User JWT (saved after login)
- `{{adminToken}}` = Admin JWT (saved after admin login)
- `{{productId}}`, `{{categoryId}}`, `{{userId}}`, `{{orderId}}` = auto-saved after creation

**Recommended Test Order:**
1. Admin Login
2. Create Category
3. Create Product
4. User Signup → User Login
5. Add to Cart
6. Create Order
7. Admin: Update Order Status

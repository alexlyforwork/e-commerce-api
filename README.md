
# 🛒 Express E-commerce API

A secure, modular Node.js/Express backend for an e-commerce application with PostgreSQL, user authentication via Passport.js, and admin role management.

---

## 🚀 Tech Stack

- **Backend:** Node.js, Express.js  
- **Authentication:** Passport.js, bcrypt  
- **Database:** PostgreSQL  
- **ORM:** pg  
- **Environment Config:** dotenv  
- **Payments:** Stripe  

---

## 📁 Project Structure

```
├── config/
│   └── passport.js         # Passport.js configuration
├── middleware/
│   ├── isAdmin.js          # Admin-only access middleware
│   └── isAuthenticated.js  # Authenticated access middleware
├── routes/
│   ├── cart.js             # Cart-related routes
│   ├── product.js          # Product-related routes
│   └── user.js             # User auth and management
├── database/
│   └── schema.sql          # PostgreSQL table definitions
├── .env                    # Environment variables
├── server.js               # Entry point
└── README.md               # This file
```

---

## 🔐 Middleware

| Name             | Description                              |
|------------------|------------------------------------------|
| `isAuthenticated`| Ensures user is logged in                |
| `isAdmin`        | Ensures user has admin privileges        |

---

## 📦 API Endpoints

### 👤 User Routes (`/user`)

| Method | Endpoint         | Description                    | Access         |
|--------|------------------|--------------------------------|----------------|
| POST   | `/register`      | Register a new user            | Public         |
| POST   | `/login`         | Log in a user                  | Public         |
| GET    | `/profile`       | View logged-in user's profile  | Authenticated  |
| GET    | `/view`          | View all users                 | Admin Only     |
| DELETE | `/delete/:id`    | Delete a user by ID            | Admin Only     |
| GET    | `/failure`       | Login failure route            | Public         |

---

### 📦 Product Routes (`/product`)

| Method | Endpoint         | Description                    | Access         |
|--------|------------------|--------------------------------|----------------|
| GET    | `/view`          | View all products              | Authenticated  |
| POST   | `/add`           | Add a new product              | Admin Only     |
| DELETE | `/delete/:id`    | Delete a product by ID         | Admin Only     |
| PUT    | `/update/:id`    | Update product details         | Admin Only     |

---

### 🛍️ Cart Routes (`/cart`)

| Method | Endpoint         | Description                            | Access        |
|--------|------------------|----------------------------------------|---------------|
| GET    | `/view`          | View all items in user's cart          | Authenticated |
| POST   | `/add`           | Add an item to the cart                | Authenticated |
| PUT    | `/edit/:id`      | Edit quantity of an item in the cart   | Authenticated |
| DELETE | `/delete/:id`    | Remove an item from the cart           | Authenticated |
| DELETE | `/clear`         | Clear all items from the cart          | Authenticated |

---

## ⚙️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/ecommerce-api.git
cd ecommerce-api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Create a `.env` file in the root directory:

```env
db_user = your_db_user
db_host = your_db_host
database = your_db_name
password = your_password
port = your_db_port
salt_rounds = your_salt_rounds
secret_key = your_secret_key_for_cookies_session
STRIPE_SECRET_KEY = your_stripe_secret_key
```

### 4. Run the Server

```bash
nodemon index.js
```

---

## 🧪 PostgreSQL Table Schema

```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password TEXT NOT NULL
);

-- Products table
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  price NUMERIC(10, 2)
);

-- Cart table
CREATE TABLE cart (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER NOT NULL
);
```

---

## 📦 Features

- ✅ User registration & login  
- ✅ Admin-only product/user control  
- ✅ Cart per user  
- ✅ Secure route protection via middleware  
- ✅ Stripe checkout support   

---

## 👨‍💻 Author

Made with ❤️ by Alex Ly


---

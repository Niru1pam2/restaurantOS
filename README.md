# 🍽️ RestaurantOS - Restaurant Management System

An end-to-end Restaurant Operations & Management Platform built with **React**, **Node.js / Express**, **PostgreSQL**, **Prisma ORM**, and **AI-powered intelligence** (Groq LLM & Tesseract OCR).

---

## 📌 Table of Contents
1. [Features](#-features)
2. [Tech Stack](#-tech-stack)
3. [Project Structure](#-project-structure)
4. [Prerequisites](#-prerequisites)
5. [Environment Variables](#-environment-variables)
6. [Getting Started](#-getting-started)
   - [1. Backend Setup](#1-backend-setup)
   - [2. Frontend Setup](#2-frontend-setup)
7. [Database Setup & Seeding](#-database-setup--seeding)
8. [Default Seeded Accounts](#-default-seeded-accounts)
9. [API Endpoints Overview](#-api-endpoints-overview)
10. [Scripts Reference](#-scripts-reference)

---

## ✨ Features

- 🔐 **Role-Based Authentication (RBAC)**: Support for `OWNER`, `MANAGER`, `CHEF`, `WAITER`, and `CASHIER` roles with JWT cookie-based session handling.
- 🪑 **Table & Order Management**: Real-time table status tracking (*Available, Occupied, Reserved, Cleaning*) and POS ordering workflow (*Pending, Preparing, Ready, Served, Completed, Cancelled*).
- 🍕 **Menu & Category Management**: Catalog management for dishes, prices, preparation times, categories, and availability toggles.
- 🥗 **Recipe & Ingredient System**: Map dishes to ingredient recipes with automatic inventory stock deduction upon order completion.
- 📦 **Inventory & Purchase Orders**: Track stock levels, low-stock threshold alerts, stock transaction logging (*In, Out, Adjustment, Waste*), and supplier purchase orders.
- 🚚 **Supplier & Expense Tracking**: Maintain supplier records, manage expense categories, and record restaurant operational costs.
- 🤖 **AI Assistant & Insights**: Groq LLM integration via LangChain for business insights, automated recommendations, menu optimization, and stock forecasting.
- 📄 **AI Invoice OCR Processing**: Extract supplier invoices and receipts (PDF/Images) automatically using Tesseract.js & pdf-parse OCR extraction.
- 📊 **Dashboard & Analytics**: Real-time KPI summaries, revenue metrics, top-selling items, and Excel report export capability.

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: React 19 + Vite 8
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand
- **Routing**: React Router DOM v7
- **HTTP Client**: Axios (configured with credentials support)
- **Icons**: React Icons

### **Backend**
- **Runtime & Server**: Node.js (ES Modules) + Express 5
- **ORM & Database**: Prisma ORM with PostgreSQL
- **Authentication**: JWT (`jsonwebtoken`) & `cookie-parser`
- **AI & OCR**: `@langchain/groq`, `@langchain/core`, Tesseract.js, pdf-parse
- **File Processing**: Multer (file uploads)
- **Reporting**: ExcelJS
- **Logging**: Morgan

---

## 📂 Project Structure

```text
restaurant/
├── backend/                  # Express REST API Server
│   ├── config/               # Database and server configurations
│   │   └── db.js             # Prisma client instance
│   ├── controllers/          # Business logic controllers
│   │   ├── ai.controller.js  # Groq AI & LangChain integration
│   │   ├── auth.controller.js
│   │   ├── categories.controller.js
│   │   ├── dashboard.controller.js
│   │   ├── expenses.controller.js
│   │   ├── ingredients.controller.js
│   │   ├── inventory.controller.js
│   │   ├── invoices.controller.js # OCR invoice parser
│   │   ├── menu.controller.js
│   │   ├── orders.controller.js
│   │   ├── recipes.controller.js
│   │   ├── staff.controller.js
│   │   ├── suppliers.controller.js
│   │   └── tables.controller.js
│   ├── middlewares/          # Authentication & Authorization middlewares
│   │   └── auth.middleware.js
│   ├── prisma/               # Database models, migrations, & seeders
│   │   ├── migrations/       # Database SQL migrations
│   │   ├── schema.prisma     # Prisma database schema
│   │   └── seed.js           # Mock data & user seeder script
│   ├── routes/               # API route definitions
│   │   ├── index.js          # Aggregated route handler
│   │   └── *.routes.js       # Module routes (auth, menu, orders, etc.)
│   ├── uploads/              # Static file storage for uploaded invoice receipts
│   ├── utils/                # Helper utilities (catchAsync, token generators)
│   ├── .env                  # Backend environment variables
│   ├── server.js             # Server entry point
│   └── package.json
│
├── frontend/                 # React SPA application (Vite)
│   ├── public/               # Favicons & public static assets
│   ├── src/
│   │   ├── api/              # Axios API service endpoints
│   │   ├── assets/           # Media & static assets
│   │   ├── components/       # Shared UI components (Navbar, Sidebar, Layout, Routes)
│   │   ├── context/          # React contexts & hooks
│   │   ├── pages/            # Application pages & dashboard modules
│   │   ├── store/            # Zustand global state stores (useAuthStore, useThemeStore)
│   │   ├── utils/            # Axios instance setup & global utilities
│   │   ├── App.jsx           # Application routes & layout wrapper
│   │   ├── main.jsx          # React DOM root renderer
│   │   └── index.css         # Global styles & Tailwind CSS imports
│   ├── dist/                 # Production build output
│   ├── vite.config.js        # Vite bundler configuration
│   └── package.json
│
└── README.md                 # Project documentation
```


---

## ⚙️ Prerequisites

Ensure you have the following installed on your system:
- **Node.js**: `v18.x` or higher
- **npm**: `v9.x` or higher
- **PostgreSQL**: `v14.x` or higher running locally or accessible via network URL

---

## 🔑 Environment Variables

### Backend Configuration (`backend/.env`)

Create or update `.env` inside the `backend/` directory:

```env
PORT=5000
DATABASE_URL="postgresql://<db_user>:<db_password>@localhost:5432/<db_name>?schema=public"
JWT_SECRET="your_jwt_secret_key_here"
JWT_EXPIRES_IN="7d"
GROQ_API_KEY="your_groq_api_key_here"
```

> 💡 **Note**: `GROQ_API_KEY` is required for AI Insights functionality. You can generate a free key at [Groq Console](https://console.groq.com/).

---

## 🚀 Getting Started

### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Ensure PostgreSQL is running and update `backend/.env` with your database credentials.

4. Run Prisma database migrations:
   ```bash
   npx prisma migrate dev --name init
   ```
   *(Or sync database schema directly with `npx prisma db push`)*

5. Seed database with initial data (Users, Tables, Categories, Menu Items, Ingredients):
   ```bash
   node prisma/seed.js
   ```

6. Start backend development server:
   ```bash
   npm run dev
   ```
   The backend API will run on **`http://localhost:5000`**.

---

### 2. Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend application will run on **`http://localhost:5173`**.

---

## 👥 Default Seeded Accounts

The seed script creates default test accounts for testing different roles:

| Role | Email | Password | Access Level |
|---|---|---|---|
| 👑 **OWNER** | `owner@restaurant.com` | `admin123` | Full System Access |
| 👔 **MANAGER** | `manager@restaurant.com` | `admin123` | Operations, Inventory & Analytics |
| 👨🍳 **CHEF** | `chef@restaurant.com` | `admin123` | Kitchen Orders & Recipe Management |
| 🧑💼 **WAITER** | `waiter@restaurant.com` | `admin123` | Table Operations & Order Taking |

---

## 📡 API Endpoints Overview

| Route Endpoint | Description |
|---|---|
| `POST /api/auth/login` | Authenticate user & issue JWT token cookie |
| `GET /api/auth/me` | Fetch authenticated user profile |
| `GET/POST /api/tables` | View & update dining table statuses |
| `GET/POST /api/categories` | Manage menu categories |
| `GET/POST /api/menu` | Manage menu items & prices |
| `GET/POST /api/ingredients` | Manage raw ingredients & stock levels |
| `GET/POST /api/recipes` | Associate ingredients with menu dishes |
| `GET/POST /api/orders` | Create POS orders, track status, process billing |
| `GET/POST /api/inventory` | Record stock transactions & purchase orders |
| `GET/POST /api/suppliers` | Manage supplier profiles |
| `GET/POST /api/expenses` | Log business expenses |
| `POST /api/invoices/upload` | Process invoice files via Tesseract OCR |
| `POST /api/ai/ask` | Query AI assistant for analytics & recommendations |
| `GET /api/dashboard/stats` | Retrieve sales stats & financial overview |

---

## 📜 Available Scripts Reference

### **Backend Scripts (`/backend`)**
- `npm run dev` — Starts backend server with `nodemon` auto-reload.
- `node prisma/seed.js` — Seeds database with initial mock data.
- `npx prisma studio` — Opens interactive Prisma Web UI database browser.
- `npx prisma migrate dev` — Generates and executes database migrations.

### **Frontend Scripts (`/frontend`)**
- `npm run dev` — Launches Vite dev server with hot module replacement (HMR).
- `npm run build` — Compiles production-ready assets into `dist/`.
- `npm run lint` — Runs `oxlint` code linter.
- `npm run preview` — Previews production build locally.


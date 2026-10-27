# RentKit — Event Equipment Rental System

A role-based full-stack web application built on the **MERN stack** (MongoDB, Express.js, React.js, Node.js) for renting event equipment such as sound systems, lighting, staging, furniture and tents.

> Web Technology — IA3 Capstone Project: *Role-Based Web Application using MERN Stack*

## Features

### Authentication
- Sign up with validation (required fields, email format, password strength)
- Secure login (bcrypt-hashed passwords, JWT authentication)
- Logout, and password change for every user
- Role-based redirect after login (Admin → dashboard, User → catalog)

### Admin
- Dashboard home with stats and recent activity
- Consolidated operations page: view, add, update and delete equipment and manage rental requests
- User management: add, update, change role, deactivate and remove users

### Normal user
- Browse and search the equipment catalog (read-only)
- View equipment details
- Request rentals for an event and track their own requests

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, React Router, React-Bootstrap / Bootstrap 5, Axios |
| Backend | Node.js, Express 5, express-validator, JWT, bcryptjs |
| Database | MongoDB with Mongoose |

## Project structure

```
├── client/   React frontend (Vite)
└── server/   Express REST API
```

## Running locally

**Prerequisites:** Node.js 20+ and a MongoDB instance (local or Atlas).

```bash
# 1. API
cd server
cp .env.example .env     # set MONGODB_URI and JWT_SECRET
npm install
npm run dev              # http://localhost:5050

# 2. Frontend (new terminal)
cd client
cp .env.example .env     # VITE_API_URL=http://localhost:5050/api
npm install
npm run dev              # http://localhost:5180
```

# RentKit — Event Equipment Rental System

A role-based full-stack web application built on the **MERN stack** (MongoDB, Express.js, React.js, Node.js). Customers browse and rent event equipment (sound, lighting, staging, furniture, tents, power and décor); administrators manage the catalog, rental requests and user accounts.

> Web Technology — IA3 Capstone Project: *Role-Based Web Application using MERN Stack*

## Features

### Authentication
- Sign-up with client- and server-side validation: required fields, email format, and password strength (live strength meter)
- Secure login with bcrypt-hashed passwords and JWT authentication
- Role-based redirect after login (Admin → dashboard, User → catalog)
- Logout and change password for every user
- Deactivated accounts are blocked immediately, even with an existing token

### Admin
- **Dashboard home**: what the admin can do, stats (equipment, users, pending requests, revenue), upcoming rentals, top equipment, inventory by category and a recent-activity feed
- **Consolidated Operations page**
  - *Equipment tab*: view all records with search, filters, sorting and pagination; add, update, hide/show and delete equipment
  - *Rentals tab*: view all requests by status; approve, reject, mark returned, cancel or delete
- **User management**: add users (any role), update details and roles, reset passwords, activate/deactivate and remove users
  - Safeguards: admins can't demote, deactivate or delete themselves, and the last active admin can't be removed

### Storefront (public)
- Homepage with a photo hero, a date-first search (keyword, category, event dates), category tiles, most-rented items and ready-made **kits by occasion**
- Catalog with a filter sidebar (search, event dates, category counts, price bands), applied-filter chips, sorting (including **most popular** from real rental history) and pagination
- Pick event dates once and every product card shows **how many units are free** for those dates; the dates follow you to product pages and the rental request
- Product pages with a photo gallery, availability check, quantity, delivery details and "You may also need" suggestions
- Guests can browse freely; adding to a request asks them to log in and then brings them back

### Normal user
- Build a rental request (cart) with photos, quantities and live availability, pick event dates, and see the **total before submitting**
- Add a whole kit in one click, then adjust quantities
- Track their own rentals (pending / approved / past) and cancel pending requests

### Business rules
- Pending and approved rentals reserve stock for their date range, so overlapping requests can't overbook equipment
- Stock is re-checked when an admin approves a request
- Rental items store a snapshot of name and rate, so history stays accurate if the catalog changes
- Equipment or users with active rentals can't be deleted (hide or deactivate them instead)

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, React Router, React-Bootstrap / Bootstrap 5, Axios |
| Backend | Node.js, Express 5, express-validator, JSON Web Tokens, bcryptjs, Helmet, CORS |
| Database | MongoDB with Mongoose |
| Hosting | Vercel (frontend + serverless API), MongoDB Atlas |

## Project structure

```
├── vercel.json             Single Vercel deployment: builds client/, routes /api/* to api/index.js
├── api/index.js            Vercel serverless entry (loads the Express app)
├── client/                 React frontend (Vite)
│   └── src/
│       ├── api/            Axios instance (JWT header, 401 handling)
│       ├── context/        Auth, toast and rental-request (cart) state
│       ├── components/     Layout, navbar, route guards, shared UI, admin widgets
│       ├── pages/          Public, user and admin pages
│       └── utils/          Validation, formatting, category metadata
└── server/                 Express REST API
    └── src/
        ├── config/         Environment + MongoDB connection
        ├── models/         User, Equipment, Rental, Activity
        ├── middleware/     protect (JWT), requireRole, validate, error handler
        ├── validators/     express-validator rule sets
        ├── controllers/    Route handlers
        ├── routes/         /api/auth, /equipment, /rentals, /users, /dashboard
        └── seed.js         Demo data
```

## Running locally

**Prerequisites:** Node.js 20+ and MongoDB (local, Docker or Atlas).

```bash
# 1. API
cd server
cp .env.example .env       # set MONGODB_URI and JWT_SECRET
npm install
npm run seed               # demo accounts, equipment and rentals
npm run dev                # http://localhost:5050

# 2. Frontend (new terminal)
cd client
npm install
npm run dev                # http://localhost:5180 (forwards /api to localhost:5050)
```

`npm run seed -- --reset` wipes the database and reloads the demo data.

### Demo accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@rentkit.com | Admin@123 |
| User | user@rentkit.com | User@1234 |
| User | arjun@rentkit.com | Arjun@1234 |

## API overview

All endpoints are under `/api` and return JSON. 🔒 = requires `Authorization: Bearer <token>`.

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/auth/signup` | Public | Create a user account |
| POST | `/auth/login` | Public | Log in, returns JWT + user |
| GET | `/auth/me` | 🔒 Any | Current user |
| PUT | `/auth/change-password` | 🔒 Any | Change own password |
| GET | `/equipment` | Public | List with `q`, `category`, `sort` (`popular`, `name`, `price_asc`, `price_desc`, `newest`), `minRate`, `maxRate`, `page`, `limit`; `start` + `end` add per-item `available`; admins also get `status` |
| GET | `/equipment/meta` | Public | Categories (with counts) and conditions |
| GET | `/equipment/:id` | Public | Equipment details; `start` + `end` add `available` |
| POST / PUT / DELETE | `/equipment[/:id]` | 🔒 Admin | Create / update / delete equipment |
| POST | `/rentals/quote` | 🔒 Any | Price and availability for items + dates |
| POST | `/rentals` | 🔒 User | Submit a rental request |
| GET | `/rentals/mine` | 🔒 Any | Own rentals |
| PATCH | `/rentals/:id/cancel` | 🔒 User | Cancel own pending request |
| GET | `/rentals` | 🔒 Admin | All rentals with `status`, `q`, paging |
| PATCH | `/rentals/:id/status` | 🔒 Admin | Approve / reject / return / cancel |
| DELETE | `/rentals/:id` | 🔒 Admin | Delete a rental |
| GET / POST / PUT / DELETE | `/users[/:id]` | 🔒 Admin | User management |
| GET | `/dashboard/admin` | 🔒 Admin | Dashboard statistics |
| GET | `/dashboard/me` | 🔒 Any | Customer summary |

Validation errors return `422` with `{ message, errors: { field: message } }`.

## Deployment (Vercel + MongoDB Atlas)

The site and the API deploy together as **one Vercel project at one address**: the React build is served as static
files and every `/api/*` request runs the Express app as a serverless function (see `vercel.json`). The frontend calls
`/api` on its own address, so no API URL or CORS configuration is needed.

### 1. MongoDB Atlas
1. Create a free (M0) cluster, ideally in **AWS Mumbai (ap-south-1)** to sit next to the Vercel function region (`bom1`).
2. Create a database user (letters and numbers only in the password).
3. Under **Network Access**, allow `0.0.0.0/0` (Vercel functions don't have fixed IPs).
4. Copy the connection string and add the database name before the `?`:
   `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/event_rental?retryWrites=true&w=majority`
5. Load the demo data once from your machine: `cd server && MONGODB_URI="<atlas-uri>" npm run seed`.
   Never run `npm run seed -- --reset` against Atlas — it deletes everything.

### 2. Vercel
Import the repository as **one** Vercel project with the **Root Directory left as the repository root**
(framework preset: *Other* — `vercel.json` sets the install, build and output settings).

| Environment variable | Value |
|---|---|
| `MONGODB_URI` | Atlas connection string (with `/event_rental`) |
| `JWT_SECRET` | a long random string |
| `JWT_EXPIRES_IN` | `7d` |
| `NODE_ENV` | `production` |

Then open `https://<project>.vercel.app/api/health`, and the site at `https://<project>.vercel.app`.
Every push to `main` redeploys; other branches get their own preview URL (site + API together).

`CLIENT_URL` and `VITE_API_URL` are only needed if you host the frontend and API on different addresses.

### Demo accounts (storefront branch)
Also: `meera@rentkit.com` / `Meera@1234` and `karthik@rentkit.com` / `Karthik@1234` (customers with rental history).

## Photos

Product-page photos are from [Unsplash](https://unsplash.com/license) (free to use under the Unsplash License); each gallery links to the photo's source page.


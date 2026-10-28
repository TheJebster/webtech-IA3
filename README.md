# RentKit — Event Equipment Rental System

A role-based **MERN** web app (MongoDB, Express, React, Node) where customers rent event equipment — sound, lighting,
staging, furniture, tents, power and décor — and admins run the catalog, rental requests and users.

> Web Technology IA3 Capstone: *Role-Based Web Application using MERN Stack*

**Live:** https://rentkit-seven.vercel.app

## Features

**Customers**
- Browse the catalog with fuzzy search (typos are fine), category and price filters, sorting and live availability for their event dates
- Product pages with photo galleries; build a rental request, see the total up front, add a whole ready-made kit in one click
- Track rentals (pending / approved / past) and cancel pending requests

**Admins**
- Dashboard with stats, upcoming rentals, top equipment and a recent-activity feed
- Operations page: manage equipment (add, edit, hide, delete) and rentals (approve, reject, mark returned, cancel)
- User management with safeguards (the last active admin can't be demoted, deactivated or deleted)

**Everyone:** sign-up with a live password-strength meter, JWT login, change password, role-based redirects.

**Business rules:** pending and approved rentals reserve stock for their dates so nothing is overbooked (re-checked on
approval); rentals keep a snapshot of item names and rates; equipment or users with active rentals can't be deleted.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, React Router, React-Bootstrap, Axios, GSAP + Lenis motion |
| Backend | Node.js, Express 5, express-validator, JWT, bcryptjs, Helmet |
| Database | MongoDB with Mongoose |
| Hosting | Vercel (site + serverless API), MongoDB Atlas |

## Run locally

Needs Node.js 20+ and MongoDB (local, Docker or Atlas).

```bash
# API → http://localhost:5050
cd server
cp .env.example .env     # set MONGODB_URI and JWT_SECRET
npm install
npm run seed             # demo accounts, equipment and rentals
npm run dev

# Frontend (new terminal) → http://localhost:5180
cd client
npm install
npm run dev
```

`npm run seed -- --reset` wipes the database and reloads the demo data (local only).

| Role | Email | Password |
|---|---|---|
| Admin | admin@rentkit.com | Admin@123 |
| Customer | user@rentkit.com | User@1234 |
| Customer | arjun@rentkit.com | Arjun@1234 |

## Project layout

```
client/    React frontend (src/pages, components, context, motion, api)
server/    Express API (src/models, routes, controllers, middleware, utils, seed.js)
api/       Vercel serverless entry that loads the Express app
docs/      API reference and deployment guide
```

## More

- [API reference](docs/API.md)
- [Deployment guide](docs/DEPLOYMENT.md) — Vercel + MongoDB Atlas, one address for site and API

Product photos are from [Unsplash](https://unsplash.com/license) under the Unsplash License.

# API reference

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

# Deployment (Vercel + MongoDB Atlas)

The site and the API deploy together as **one Vercel project at one address**: the React build is served as static
files and every `/api/*` request runs the Express app as a serverless function (see `vercel.json`). The frontend calls
`/api` on its own address, so no API URL or CORS configuration is needed.

## 1. MongoDB Atlas
1. Create a free (M0) cluster, ideally in **AWS Mumbai (ap-south-1)** to sit next to the Vercel function region (`bom1`).
2. Create a database user (letters and numbers only in the password).
3. Under **Network Access**, allow `0.0.0.0/0` (Vercel functions don't have fixed IPs).
4. Copy the connection string and add the database name before the `?`:
   `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/event_rental?retryWrites=true&w=majority`
5. Load the demo data once from your machine: `cd server && MONGODB_URI="<atlas-uri>" npm run seed`.
   Never run `npm run seed -- --reset` against Atlas — it deletes everything.

## 2. Vercel
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

# Real-State API (Express + Vercel)

Serverless-ready Express API for the Real-State app. Provides authentication (email/password + Firebase/Google), listings CRUD, and user endpoints backed by MongoDB (Mongoose). Optimized for Vercel.

## Quickstart (Windows, cmd)

```
cd MERN_Project_1\api
npm install
npm run dev
```

- Local API port: 3000
- Ensure Mongo and env vars are set (see below).

## Environment Variables (`api/.env`)

- `MONGO` = MongoDB connection string
- `JWT_SECRET` = JWT signing secret
- `ALLOWED_ORIGIN` = Frontend origin (e.g., http://localhost:5173 or deployed client URL)
- `NODE_ENV` = development | production
- `FIREBASE_PROJECT_ID` = Your Firebase Project ID
- `FIREBASE_SERVICE_ACCOUNT_KEY` = JSON string of a Firebase service account (recommended for production token verification)

Notes:

- Cookies are httpOnly and cross-site (`sameSite=none`, `secure` in production).
- CORS is configured in `api/index.js`; include your client origin in `ALLOWED_ORIGIN`.

## Routes

Base path: `/api`

Auth (`/api/auth`)

- `GET /health` — Health check
- `POST /signup` — Body: `{ username, email, password }`
- `POST /signin` — Body: `{ email, password }`
- `POST /google` — Body: `{ name, email, photo }`
- `POST /firebase` — Header: `Authorization: Bearer <Firebase ID Token>`
- `GET /signout` — Clears auth cookie

User (`/api/user`) — Protected (JWT cookie)

- `POST /update/:id` — Update own user
- `DELETE /delete/:id` — Delete own user
- `GET /listings/:id` — List own listings

Listing (`/api/listing`)

- `POST /create` — Create listing (protected)
- `POST /update/:id` — Update listing (protected)
- `DELETE /delete/:id` — Delete listing (protected)
- `GET /get/:id` — Get listing by id
- `GET /get` — Query listings (see below)

Query params for `GET /api/listing/get`:

- `searchTerm`, `offer`, `furnished`, `parking`, `type` (sale|rent|all)
- `limit` (default 9), `startIndex`, `sort` (default `createdAt`), `order` (asc|desc)

### Listing body shape

```
{
  "name": "...",
  "description": "...",
  "address": "...",
  "regularPrice": 1200,
  "discountPrice": 1000,
  "bathrooms": 2,
  "bedrooms": 3,
  "furnished": true,
  "parking": true,
  "type": "rent", // or "sale"
  "offer": true,
  "imageUrls": ["https://..."],
  "userRef": "<owner_user_id>"
}
```

## Deployment (Vercel)

- Entry: `api/index.js` (exports default Express app)
- Config: `api/vercel.json` uses `@vercel/node`
- Steps:
  1. Push to GitHub and import to Vercel (root = `api`) or deploy via CLI from `api`.
  2. Set env vars: `MONGO`, `JWT_SECRET`, `ALLOWED_ORIGIN`, `NODE_ENV=production`, `FIREBASE_PROJECT_ID`, `FIREBASE_SERVICE_ACCOUNT_KEY`.
  3. Deploy.

Tips:

- Cold starts may add ~1–2s to the first request.
- Ensure your client URL exactly matches `ALLOWED_ORIGIN`.

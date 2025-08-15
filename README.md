## Real-State — MERN Real Estate Marketplace

Modern real estate marketplace built with the MERN stack. Users can sign up/sign in (email/password + Google via Firebase), create/update/delete property listings with images, and discover properties using powerful search and filters. Backend is optimized for serverless on Vercel; frontend is a Vite React app.

### Highlights

- Auth: Email/password (JWT cookies) + Google OAuth via Firebase; backend session via httpOnly cookie.
- Listings: Full CRUD with validation; image upload to Firebase Storage.
- Search: Filter by type (sale/rent), offer, furnished, parking, price sort, and text search.
- DX/Deployment: Vercel config for API and client; CORS and cookie settings for cross-site usage.

### Tech Stack

- Frontend: React 18, Vite, React Router, Redux Toolkit + redux-persist, Tailwind CSS
- Auth/Storage: Firebase (Auth, Storage)
- Backend: Node.js, Express, Mongoose/MongoDB, JWT, bcryptjs, cookie-parser, CORS
- Hosting: Vercel (API and client)

### Monorepo Structure

```
MERN_Project_1/
  api/                # Express API (serverless-ready)
  client/             # Vite React SPA
  test-backend.js     # Dev helper script(s)
```

Key files:

- API entry: `api/index.js`
- Vercel API config: `api/vercel.json`
- Client entry: `client/src/App.jsx`
- Client Vercel rewrites: `client/vercel.json`

## Environment Variables

Create two .env files (one for API, one for client). Do not commit these.

Backend (`api/.env`):

- `MONGO` = MongoDB connection string
- `JWT_SECRET` = JWT signing secret
- `ALLOWED_ORIGIN` = Frontend origin (e.g., http://localhost:5173 or your deployed client URL)
- `NODE_ENV` = development or production
- `FIREBASE_PROJECT_ID` = Your Firebase Project ID
- `FIREBASE_SERVICE_ACCOUNT_KEY` = JSON string of a Firebase service account (recommended for production Firebase token verification)

Frontend (`client/.env`):

- `VITE_backend_url` = API base URL (e.g., http://localhost:3000 or your deployed API URL)
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID` (optional)

## Run Locally (Windows, cmd)

1. Install and run the API

```
cd MERN_Project_1\api
npm install
npm run dev
```

Default local port: 3000

2. Install and run the client (in a second terminal)

```
cd MERN_Project_1\client
npm install
npm run dev
```

Default Vite port: 5173

Notes

- Ensure `client/.env` has `VITE_backend_url=http://localhost:3000` for local development.
- Cross-site cookies require the frontend to send credentials; this is already handled in `apiService` via `credentials: 'include'`.

## Backend API

Base URL: `${VITE_backend_url}` from the client or your deployed API URL.

Auth routes (`/api/auth`)

- `GET /health` — Health check
- `POST /signup` — Body: `{ username, email, password }`
- `POST /signin` — Body: `{ email, password }`
- `POST /google` — Body: `{ name, email, photo }` (used when signing in via Google client SDK without Firebase token)
- `POST /firebase` — Header: `Authorization: Bearer <Firebase ID Token>`; logs in/creates user from Firebase token
- `GET /signout` — Clears auth cookie

User routes (`/api/user`) [Protected]

- `GET /health` — Health check
- `POST /update/:id` — Update own user; body may include `{ username, email, password, avatar }`
- `DELETE /delete/:id` — Delete own user
- `GET /listings/:id` — Get all listings for own user

Listing routes (`/api/listing`)

- `POST /create` [Protected] — Create a listing; body must match model fields (see below)
- `POST /update/:id` [Protected] — Update own listing
- `DELETE /delete/:id` [Protected] — Delete own listing
- `GET /get/:id` — Get a listing by id
- `GET /get` — Query listings with filters

Query parameters for `GET /api/listing/get`:

- `searchTerm` (string)
- `offer` (true|false; defaults to both)
- `furnished` (true|false; defaults to both)
- `parking` (true|false; defaults to both)
- `type` (sale|rent|all; defaults to both)
- `limit` (number; default 9)
- `startIndex` (number; pagination offset)
- `sort` (field; default `createdAt`)
- `order` (asc|desc; default `desc`)

### Data Models

User (`api/models/user.model.js`)

- `username` (unique, required)
- `email` (unique, required)
- `password` (hashed, required)
- `avatar` (string; default provided)
- `firebaseUid` (string; optional, unique, sparse)
- `emailVerified` (boolean)

Listing (`api/models/listing.model.js`)

- `name`, `description`, `address` (string, required)
- `regularPrice`, `discountPrice` (number, required)
- `bathrooms`, `bedrooms` (number, required)
- `furnished`, `parking`, `offer` (boolean, required)
- `type` (string; e.g., sale|rent)
- `imageUrls` (array of strings, required)
- `userRef` (string; owner user id)

### Auth Details

- Cookies: `access_token` is set httpOnly; `sameSite=none` and `secure=true` in production for cross-site usage.
- CORS: Allowed origins set in `api/index.js` via `ALLOWED_ORIGIN` (and a few localhost defaults). Ensure your deployed client URL is included.
- Firebase Admin: If `FIREBASE_SERVICE_ACCOUNT_KEY` is set (JSON string), tokens are verified server-side. Otherwise a dev fallback is used (not recommended for production).

## Frontend App

Routes (`client/src/App.jsx`)

- `/` Home
- `/about` About
- `/sign-in` Sign in
- `/sign-up` Sign up
- `/search` Search
- `/listing/:listingId` Listing details
- Protected:
  - `/profile`
  - `/create-listing`
  - `/update-listing/:listingId`

Auth Flow

- Google Sign-In with Firebase on the client, then exchange Firebase ID token for a backend JWT cookie via `POST /api/auth/firebase`.
- Redux stores backend user data; redux-persist keeps it across reloads.

Image Uploads

- Uses Firebase Storage. `ImageUpload` supports single/multiple files, basic validation, and delete.

Dev Proxy

- `vite.config.js` includes a proxy to an example deployed API. Prefer setting `VITE_backend_url` for local/dev and deployment clarity.

## Deployment (Vercel)

API

- Config in `api/vercel.json` uses `@vercel/node` and routes all to `index.js` (serverless entry).
- Set env vars in Vercel: `MONGO`, `JWT_SECRET`, `ALLOWED_ORIGIN` (your client URL), `NODE_ENV=production`, `FIREBASE_PROJECT_ID`, `FIREBASE_SERVICE_ACCOUNT_KEY`.
- Deploy from the `api` folder (via CLI or Git integration).

Client

- Config in `client/vercel.json` rewrites SPA routes to `/index.html`.
- Set `VITE_backend_url` to your deployed API URL.

Cookie/CORS in Production

- Because cookies use `sameSite=none`, your site must be served over HTTPS and `secure` cookies must be enabled. Ensure `ALLOWED_ORIGIN` matches your client origin exactly.

## Troubleshooting

- Cookies not persisting:
  - Use HTTPS on client and server (Vercel provides this).
  - Ensure `credentials: 'include'` on fetch (already set in `apiService`).
  - Set `ALLOWED_ORIGIN` to the exact client origin.
  - Browser privacy settings may block third-party cookies in some contexts.
- Firebase `auth/unauthorized-domain`:
  - Add your domain in Firebase Console → Authentication → Settings → Authorized domains.
- Mongo connection issues:
  - Verify `MONGO` string, project IP allowlist (if using Atlas), and that serverless cold starts aren’t timing out.

## License

No explicit license specified. Add one if you plan to distribute.

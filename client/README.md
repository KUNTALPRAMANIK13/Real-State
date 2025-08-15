# Real-State Client (React + Vite)

React SPA for the Real-State marketplace. Uses React Router, Redux Toolkit, redux-persist, Firebase Auth (Google) and Cloudinary for image storage, and talks to the API via `VITE_backend_url`.

## Quickstart (Windows, cmd)

```
cd MERN_Project_1\client
npm install
npm run dev
```

- Local client port: 5173
- Ensure `VITE_backend_url` points to your API (e.g., `http://localhost:3000`).

## Environment Variables (`client/.env`)

- `VITE_backend_url` = API base URL (e.g., `http://localhost:3000`)
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID` (optional)
- `VITE_CLOUDINARY_CLOUD_NAME` = Your Cloudinary cloud name
- `VITE_CLOUDINARY_UPLOAD_PRESET` = Your Cloudinary unsigned upload preset
- `VITE_CLOUDINARY_API_KEY` = Your Cloudinary API key (optional)

## Firebase setup (Google Sign-In)

1. Create a Firebase project.
2. Enable Authentication → Sign-in method → Google.
3. Add your local and deployed domains in Authentication → Settings → Authorized domains.
4. Copy web app config and fill the `VITE_FIREBASE_*` env vars.

Auth flow:

- Client signs in with Google via Firebase, retrieves an ID token, then calls `POST /api/auth/firebase` to establish a backend session cookie.

## API usage

- `src/services/apiService.js` uses `VITE_backend_url` and `credentials: 'include'` for cookie-based auth.
- Routes are defined in `src/App.jsx` with protected routes via `components/PrivateRoute`.

## Image uploads

- `components/ImageUpload.jsx` uses Cloudinary via `src/services/cloudinaryService.js`.
- Supports single/multiple uploads and server-compatible URLs in listing forms.
- Images are uploaded directly to Cloudinary with automatic optimization.

## Build & Deploy (Vercel)

```
npm run build
```

- Config: `client/vercel.json` rewrites non-API paths to `/index.html`.
- Set `VITE_backend_url` in Vercel Project → Settings → Environment Variables to your deployed API URL.
- Add deployed domain to Firebase Authorized domains.

## Notes

- `vite.config.js` includes an example proxy; prefer using `VITE_backend_url` for clarity across environments.
- Cookies are cross-site; your deployed client must be HTTPS and must match `ALLOWED_ORIGIN` in the API.

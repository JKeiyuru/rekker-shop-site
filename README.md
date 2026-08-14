# shop.rekker.co.ke

Multi-brand consumer commerce platform for Rekker (Saffron Milan, Bio Saff, Cornells).
Extract this folder into its own GitHub repo and deploy the two services on Render.

## Structure
- `client/` — React + Vite storefront and admin dashboard
- `server/` — Express + MongoDB API

## Server env vars
```
MONGODB_URI=
PORT=5000
CORS_ORIGIN=https://shop.rekker.co.ke
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
MPESA_CONSUMER_KEY=
MPESA_CONSUMER_SECRET=
MPESA_SHORTCODE=
MPESA_PASSKEY=
MPESA_CALLBACK_URL=
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

## Client env vars
```
VITE_API_BASE_URL=https://<api-service>.onrender.com
```

## Render setup
1. **Web Service (API)** — root `server`, build `npm install`, start `node server.js`.
2. **Static Site (client)** — root `client`, build `npm install && npm run build`, publish `dist`,
   with a rewrite rule `/*` → `/index.html`.
3. Point `shop.rekker.co.ke` at the static site as a custom domain.

## Seeding brands
```
cd server && node scripts/seed-brands.js
```

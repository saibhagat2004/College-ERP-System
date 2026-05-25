# MERN-AuthStart

A complete MERN-stack authentication starter featuring email/password login, Google OAuth, guest login, and role-based access control (RBAC). Uses TanStack Query (React Query) for client-side caching.

## Features

- Email/password authentication
- Google OAuth login
- Guest login support
- Role-Based Access Control (RBAC)
- JWT-based authentication

## Tech Stack

- Frontend: React, TanStack Query, React Router, Vite
- Backend: Node.js, Express, MongoDB (Mongoose), JWT, Google OAuth, bcrypt

## Installation & Run

1. Clone the repository

```bash
git clone https://github.com/yourusername/MERN-AuthStart.git
```

2. Frontend

```bash
cd frontend
npm install
npm run dev
```

3. Backend

```bash
cd backend
npm install
npm run dev
```

## Environment (.env) — Required variables

Create a `.env` file for both `backend` and `frontend`. You can copy the provided examples: `backend/.env.example` and `frontend/.env.example`.

Backend example (`backend/.env.example`):

```env
PORT=5000
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FRONTEND_URL=http://localhost:5173
# Cloudinary (for media uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Cashfree (payments)
CASHFREE_CLIENT_ID=your_cashfree_client_id
CASHFREE_CLIENT_SECRET=your_cashfree_client_secret
CASHFREE_ENV=SANDBOX # or PRODUCTION
CASHFREE_PAYOUT_CLIENT_ID=your_cashfree_payout_client_id
CASHFREE_PAYOUT_CLIENT_SECRET=your_cashfree_payout_client_secret
CASHFREE_PAYOUT_API_VERSION=2024-01-01
```

Frontend example (`frontend/.env.example`):

Note: This project uses Vite. Environment variables exposed to the client must start with `VITE_`.

```env
VITE_API_URL=http://localhost:5000
# Optional (if older CRA style is being used): REACT_APP_API_URL=http://localhost:5000
```

Tips:

- Copy an example to a real `.env` file and fill in secrets:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

- Do NOT commit your `.env` files to source control.

## Notes

- If you use a different frontend port, update `FRONTEND_URL` in the backend `.env`.
- If you prefer CRA instead of Vite, you can keep the `REACT_APP_API_URL` variable, but Vite requires `VITE_` prefix for client-exposed variables.

- If your app uses Cloudinary for media and Cashfree for payments, add those keys to the backend `.env` (placeholders shown above). Keep secrets out of source control.

If you'd like, I can also add Git ignore rules or update package scripts to streamline running both services.

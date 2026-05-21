# MERN-AuthStart

A complete **MERN stack** authentication starter kit featuring email/password login, Google OAuth, guest login, and role-based access control (RBAC). Built with **TanStack Query (React Query)** for efficient client-side data fetching and caching. Perfect as a secure, reusable starting point for your projects.

---

## 🚀 Features

- 🔑 Email/password authentication  
- 🌐 Google OAuth login  
- 👤 Guest login support  
- 🛡 Role-Based Access Control (RBAC)  
- ⚡ Built with MERN stack (MongoDB, Express.js, React, Node.js)  
- 🚀 Client-side caching with TanStack Query (React Query)  
- 📦 Ready-to-use backend and frontend integration  
- 🔒 Secure JWT-based authentication  

---

## 🛠 Tech Stack

**Frontend:**  
- React  
- TanStack Query (React Query)  
- React Router  

**Backend:**  
- Node.js  
- Express.js  
- MongoDB (Mongoose)  
- JWT (JSON Web Token)  
- Google OAuth  
- bcrypt  

---

## 📦 Installation & Setup

### 1️⃣ Clone the repository
```bash
git clone https://github.com/yourusername/MERN-AuthStart.git


📦 Install and Run Frontend
cd frontend
npm install
npm run dev

📦 Install and Run Backend
cd backend
npm install
npm run dev

🌍 Environment Variables
Backend .env

PORT=5000
MONGO_URI=your_mongo_connection
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret


Frontend .env

REACT_APP_API_URL=http://localhost:5000

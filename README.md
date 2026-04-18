# Skill Connect Pro

## Project Overview

`Skill Connect Pro` is a full-stack marketplace platform designed for:
- freelancers,
- learners,
- instructors,
- and administrators.

It uses a Node.js + Express backend with MongoDB for the API and data layer, and a React + Vite frontend with Tailwind CSS for the user interface.

## What this project includes

- `Backend/` — Express API server, authentication, user/course management, notifications, payments, file uploads, and socket support.
- `Frontend/` — React application built with Vite, page routing, user dashboards, and reusable UI components.
- `Backend/AI/` — optional AI/data scripts and model artifacts for keyword detection and analysis.

## Project Features

- User authentication and role-based access
- Course creation, enrollment, and management
- Freelancer and instructor workflows
- Blog and notification systems
- Order and payment handling
- Real-time communication support via Socket.IO
- File uploads for courses and assets
- Admin management utilities

## Repository Structure

### Backend
- `server.js` — main Express server entry point
- `config/` — MongoDB connection and configuration
- `controllers/` — business logic and request handlers
- `routes/` — API route definitions
- `models/` — Mongoose schemas for users, courses, blogs, orders, messages, and more
- `middleware/` — auth checks, file upload handling
- `scripts/` — setup scripts (for example, `createAdmin.js`)
- `uploads/` — course assets and uploaded files
- `AI/` — AI-related scripts, model files, and data

### Frontend
- `src/` — React application source code
- `public/` — static assets served by Vite
- `index.html` — Vite HTML entry
- `package.json` — frontend dependencies and scripts
- `tailwind.config.js` — Tailwind CSS configuration
- `vite.config.js` — Vite tooling configuration

## Technologies Used

### Backend
- Node.js
- Express
- MongoDB / Mongoose
- dotenv
- bcryptjs
- jsonwebtoken
- multer
- socket.io
- cors
- nodemon (development)

### Frontend
- React
- Vite
- React Router DOM
- Tailwind CSS
- Axios
- socket.io-client
- uuid

### AI / Data
- Python scripts in `Backend/AI/`
- PyTorch model artifacts (`.pth`)

## Setup Instructions

### 1. Backend Setup

1. Open a terminal in `Backend/`.
2. Install dependencies:

```bash
cd Backend
npm install
```

3. Create a `.env` file with the required variables:

```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
JWT_SECRET=your_jwt_secret
```

4. Start the backend server:

```bash
npm run dev
```

5. Verify the API is running:

```text
http://localhost:5000
```

> If the backend port is unavailable, update `PORT` in `.env`.

### 2. Frontend Setup

1. Open a terminal in `Frontend/`.
2. Install dependencies:

```bash
cd Frontend
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open the app in the browser at the Vite URL, usually:

```text
http://localhost:5173
```

## Running the Full Application

1. Start the backend first.
2. Start the frontend second.
3. Confirm the backend is connected to MongoDB using `MONGO_URI`.
4. Use the frontend to interact with backend API routes.

## Frontend / Backend Connection

- The frontend communicates with the backend API through HTTP requests to the backend server.
- The backend exposes REST endpoints for authentication, courses, orders, blogs, notifications, and more.
- Socket.IO is also available for real-time events and chat-style functionality.
- Make sure CORS is enabled in `Backend/server.js` if the frontend and backend run on different ports.

## MongoDB Setup Guide

1. Use MongoDB Atlas or a local MongoDB server.
2. Create a database and get the connection string.
3. Add the URI to `Backend/.env` as `MONGO_URI`.
4. Example connection string for Atlas:

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/skill-connect-pro?retryWrites=true&w=majority
```

5. If using a local MongoDB instance:

```env
MONGO_URI=mongodb://localhost:27017/skill-connect-pro
```

## Important Commands

### Backend
- `npm run dev` — start backend with nodemon
- `npm run create-admin` — create an admin user via script

### Frontend
- `npm run dev` — run the frontend development server
- `npm run build` — build the production frontend
- `npm run preview` — preview the built frontend
- `npm run lint` — run ESLint checks

## Notes

- Do not commit `.env` to version control.
- Keep backend and frontend servers running simultaneously during development.
- The AI assets in `Backend/AI/` are separate from the main web application.

## Next Steps

- Add deployment instructions for production hosting.
- Add detailed API docs for backend routes.
- Add environment-specific frontend config if needed.

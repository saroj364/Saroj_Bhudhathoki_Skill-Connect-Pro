# Skill Connect Pro

## Project Overview

`Skill Connect Pro` is a full-stack marketplace platform for freelancers, learners, instructors, and administrators. It combines a Node.js + Express backend with MongoDB, and a React + Vite frontend using Tailwind CSS.

The project contains three main areas:

- `Backend/` - Express API server, authentication, MongoDB models, file uploads, socket support, and admin/user/course management.
- `Frontend/` - React application built with Vite, routes for client/instructor/learner experiences, and UI components.
- `Backend/AI/` - AI-related artifacts and scripts, including keyword detection models and dataset folders.

---

## Root Folder Structure

- `Backend/`
  - `server.js` - main Express server entrypoint.
  - `config/` - database connection logic.
  - `controllers/` - request handlers for users, auth, courses, payments, blog, notifications, etc.
  - `models/` - Mongoose schemas for users, courses, blogs, orders, messages, ratings, and more.
  - `routes/` - REST API route definitions.
  - `middleware/` - authentication and multipart handling.
  - `scripts/` - helper scripts such as admin creation.
  - `uploads/` - static file storage for course assets and uploads.
  - `AI/` - experimental AI/data code, models, and datasets.

- `Frontend/`
  - `src/` - React source code.
  - `public/` - static public assets.
  - `index.html` - Vite HTML entry.
  - `package.json` - frontend dependencies and scripts.
  - `tailwind.config.js` - Tailwind CSS settings.
  - `vite.config.js` - Vite configuration.

---

## Technologies Used

- Backend
  - Node.js
  - Express
  - MongoDB / Mongoose
  - CORS
  - dotenv
  - JSON Web Tokens (`jsonwebtoken`)
  - bcryptjs
  - multer
  - socket.io
  - uuid
  - nodemon (development)

- Frontend
  - React
  - Vite
  - React Router DOM
  - Tailwind CSS
  - Axios
  - socket.io-client
  - uuid

- AI / Data
  - Python scripts in `Backend/AI/`
  - keyword detection model artifacts (`.pth`)

---

## Backend Setup

1. Open a terminal in `Backend/`.
2. Install dependencies:

```bash
cd Backend
npm install
```

3. Create a `.env` file in `Backend/` with at least:

```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
```

4. Start the backend server:

```bash
npm run dev
```

5. The API should be available on:

```text
http://localhost:5000
```

> Note: `server.js` also tries to listen on `PORT` from `.env` and falls back to `5001` if present.

---

## Frontend Setup

1. Open a terminal in `Frontend/`.
2. Install dependencies:

```bash
cd Frontend
npm install
```

3. Start the frontend development server:

```bash
npm run dev
```

4. Open the application in the browser at the Vite URL, typically:

```text
http://localhost:5173
```

---

## Running the Full App

- Start the backend first.
- Then start the frontend.
- Ensure `MONGO_URI` is configured in `Backend/.env`.
- The frontend will call backend API routes under `/api/...`.

---

## Additional Scripts

From `Backend/`:

- `npm run create-admin` - run `node scripts/createAdmin.js` to create an admin user.

From `Frontend/`:

- `npm run build` - build the production frontend bundle.
- `npm run preview` - preview the built frontend locally.
- `npm run lint` - run ESLint checks.

---

## Notes

- The project currently appears to use a single MongoDB backend and a React UI.
- If you want to store environment variables securely, do not commit `.env` to source control.
- The `Backend/AI/` folder contains model files and data code for AI-related functionality; it is separate from the main app flow.

---

## Contact

If you want help integrating additional features like deployment, CI/CD, or production MongoDB configuration, I can help update the README further.

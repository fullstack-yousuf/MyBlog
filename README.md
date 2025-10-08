

# MyBlog — Full Stack Blog & Chat Application

**MyBlog** is a full-stack web application built with **Next.js** (frontend) and **Node.js + Express** (backend).  
It features real-time chat, blog posting with likes and comments, user authentication, and a responsive UI.

---

## Features

- JWT-based user authentication  
- Create, read, like, and comment on blog posts  
- Real-time chat using Socket.io  
- Responsive UI built with TailwindCSS  
- Secure REST API with Express middleware  
- Efficient data fetching via React Query  
- Full TypeScript support (frontend & backend)  

---

## Prerequisites

Ensure the following are installed on your machine:

- [Node.js](https://nodejs.org/) (v18 or later)  
- npm, yarn, or pnpm package manager  
- Git  

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/myblog.git
cd myblog
````

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend/` directory with the following content:

```env
PORT=5000
JWT_SECRET=<your_generated_secret>
```

> To generate a secure JWT secret, run:
>
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

Start the backend server in development mode:

```bash
npm run dev
```

The backend API will be available at: `http://localhost:5000`

---

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env` file inside the `frontend/` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Start the frontend development server:

```bash
npm run dev
```

Access the frontend at: `http://localhost:3000`

---

## API Overview

| Method | Endpoint                 | Description                       |
| ------ | ------------------------ | --------------------------------- |
| POST   | `/api/auth/register`     | Register a new user               |
| POST   | `/api/auth/login`        | Authenticate user and receive JWT |
| GET    | `/api/posts`             | Retrieve all blog posts           |
| POST   | `/api/posts`             | Create a new blog post            |
| POST   | `/api/posts/:id/like`    | Like or unlike a post             |
| POST   | `/api/posts/:id/comment` | Add a comment to a post           |
| POST   | `/api/chat`              | Start or retrieve chat session    |
| GET    | `/api/chat/:id`          | Retrieve messages for a chat      |
| WS     | `/socket.io`             | Real-time chat socket endpoint    |

---

## Real-Time Chat

* Backend initializes a Socket.io server attached to Express.
* Frontend connects using JWT for authentication.
* Messages are exchanged instantly via WebSocket events.

---

## Common Commands

### Backend

| Command         | Description                               |
| --------------- | ----------------------------------------- |
| `npm run dev`   | Run backend in development mode (Nodemon) |
| `npm run start` | Run backend in production mode            |
| `npm run lint`  | Run ESLint for code quality checks        |

### Frontend

| Command         | Description                      |
| --------------- | -------------------------------- |
| `npm run dev`   | Start Next.js development server |
| `npm run build` | Build frontend for production    |
| `npm run start` | Start production build           |
| `npm run lint`  | Run ESLint checks                |

---

## Authentication Flow

* Upon login, the backend returns a JWT token.
* The frontend stores the token in `localStorage`.
* Each API request includes the token in the `Authorization` header:

```http
Authorization: Bearer <token>
```

* Backend verifies the token to authorize user actions.

---

## Technology Stack

### Frontend

* Next.js 14
* TypeScript
* TailwindCSS
* React Query
* Axios

### Backend

* Node.js + Express
* SQLite (default, configurable to PostgreSQL/MySQL)
* JWT Authentication
* Socket.io (for real-time chat)
* Bcrypt (password hashing)

---

## Deployment

Recommended platforms:

* Frontend: [Vercel](https://vercel.com/) or [Netlify](https://netlify.com/)
* Backend: [Render](https://render.com/), [Railway](https://railway.app/), or any Node.js hosting

**Notes:**

* Set environment variables appropriately in each environment.
* Update `NEXT_PUBLIC_API_URL` in frontend `.env` to point to your deployed backend API.

---

## Example `.env.example`

```env
# Backend
PORT=5000
JWT_SECRET=<your_generated_secret>

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## License

This project is licensed under the MIT License.
You are free to use, modify, and distribute this software for both personal and commercial purposes.

---

## Author

Muhammad Yousuf
Full Stack Developer
Email: [[fullstack.yousuf@gmail.com](mailto:fullstack.yousuf@gmail.com)]
Portfolio: [github.com/fullstack-yousuf]



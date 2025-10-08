

# \# MyBlog — Full Stack Blog \& Chat Application

**MyBlog** is a full-stack web application built with **Next.js (frontend)** and **Node.js + Express (backend)**.
It includes functionality for real-time chat, blog posting, likes, and comments.

---

## Features

- User authentication (JWT-based)
- Create, read, like, and comment on blog posts
- Real-time chat between users (Socket.io)
- Responsive UI built with TailwindCSS
- Secure REST API with Express and middleware
- Efficient data fetching using React Query
- TypeScript support across both frontend and backend

---

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (version 18 or later)
- npm, yarn, or pnpm
- Git

---

## Environment Setup

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/myblog.git
cd myblog
2. Backend Setup
bash
Copy code
cd backend
npm install
Create a .env file inside the backend/ directory:

env
Copy code
PORT=5000
JWT_SECRET=a6be466c97ad5057efcc00091402579770765c4d8c1931c9cd48ca76074c97daa4c1ff3216721b4f018f0f33d0162ab76bc63ebfb3fbc0c8cd0dcc6caedad1f
To generate your own JWT secret, run:

bash
Copy code
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
Start the backend server:

bash
Copy code
npm run dev
Default backend URL: http://localhost:5000

3. Frontend Setup
bash
Copy code
cd ../frontend
npm install
Create a .env file inside the frontend/ directory:

env
Copy code
NEXT_PUBLIC_API_URL=http://localhost:5000/api
Start the frontend application:

bash
Copy code
npm run dev
Default frontend URL: http://localhost:3000

API Overview
Method	Endpoint	Description
POST	/api/auth/register	Register a new user
POST	/api/auth/login	Log in a user
GET	/api/posts	Retrieve all blog posts
POST	/api/posts	Create a new blog post
POST	/api/posts/:id/like	Like or unlike a post
POST	/api/posts/:id/comment	Add a comment to a post
POST	/api/chat	Start or retrieve a chat session
GET	/api/chat/:id	Retrieve messages for a chat
WS	/socket.io	Real-time chat socket endpoint

Real-Time Chat
The application uses Socket.io for bi-directional real-time communication.

The backend initializes a Socket.io server attached to the Express server.

The frontend connects using the user’s JWT token.

Messages are sent and received instantly through WebSocket events.

Common Commands
Backend
Command	Description
npm run dev	Run backend in development mode (Nodemon)
npm run start	Run backend in production mode
npm run lint	Run ESLint for code quality checks

Frontend
Command	Description
npm run dev	Start Next.js development server
npm run build	Build frontend for production
npm run start	Start production build
npm run lint	Run ESLint checks

JWT Authentication Overview
When a user logs in, the backend returns a signed JWT token.
The frontend stores this token in localStorage and attaches it to every request header:

http
Copy code
Authorization: Bearer <token>
The backend verifies this token on each request to authorize access.

Tech Stack
Frontend
Next.js 14

TypeScript

TailwindCSS

React Query

Axios

Backend
Node.js + Express

SQLite (or PostgreSQL/MySQL, configurable)

JWT Authentication

Socket.io (real-time chat)

Bcrypt (password hashing)

Deployment
For deployment, consider the following:

Frontend: Vercel or Netlify

Backend: Render, Railway, or any Node.js-compatible hosting platform

Ensure environment variables are properly set in both environments

Set NEXT_PUBLIC_API_URL to your deployed backend API URL

Example .env Configuration
Create a .env.example file for team reference:

ini
Copy code
# Backend
PORT=5000
JWT_SECRET=<your_generated_secret>

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:5000/api
License
This project is licensed under the MIT License.
You are free to use, modify, and distribute this software for both personal and commercial purposes.

Author
Muhammad Yousuf
Full Stack Developer
Email: [your-email@example.com]
Portfolio: [your-portfolio-link.com]

GIVE THIS

```markdown
# MyBlog — Full Stack Blog & Chat Application

**MyBlog** is a full-stack web application built with **Next.js (frontend)** and **Node.js + Express (backend)**.  
It includes functionality for real-time chat, blog posting, likes, and comments.

---

## Features

- User authentication (JWT-based)  
- Create, read, like, and comment on blog posts  
- Real-time chat between users (Socket.io)  
- Responsive UI built with TailwindCSS  
- Secure REST API with Express and middleware  
- Efficient data fetching using React Query  
- TypeScript support across both frontend and backend  

---

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (version 18 or later)  
- npm, yarn, or pnpm  
- Git  

---

## Environment Setup

### 1. Clone the Repository

```

git clone https://github.com/<your-username>/myblog.git
cd myblog

```

### 2. Backend Setup

```

cd backend
npm install

```

Create a `.env` file inside the `backend/` directory:

```

PORT=5000
JWT_SECRET=a6be466c97ad5057efcc00091402579770765c4d8c1931c9cd48ca76074c97daa4c1ff3216721b4f018f0f33d0162ab76bc63ebfb3fbc0c8cd0dcc6caedad1f

```

To generate your own JWT secret, run:

```

node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

```

Start the backend server:

```

npm run dev

```

Default backend URL: http://localhost:5000

### 3. Frontend Setup

```

cd ../frontend
npm install

```

Create a `.env` file inside the `frontend/` directory:

```

NEXT_PUBLIC_API_URL=http://localhost:5000/api

```

Start the frontend application:

```

npm run dev

```

Default frontend URL: http://localhost:3000

---

## API Overview

| Method | Endpoint               | Description                 |
|--------|------------------------|-----------------------------|
| POST   | /api/auth/register      | Register a new user          |
| POST   | /api/auth/login         | Log in a user               |
| GET    | /api/posts              | Retrieve all blog posts      |
| POST   | /api/posts              | Create a new blog post       |
| POST   | /api/posts/:id/like     | Like or unlike a post        |
| POST   | /api/posts/:id/comment  | Add a comment to a post      |
| POST   | /api/chat               | Start or retrieve chat session |
| GET    | /api/chat/:id           | Retrieve messages for a chat |
| WS     | /socket.io              | Real-time chat socket endpoint |

---

## Real-Time Chat

The application uses Socket.io for bi-directional real-time communication.

- The backend initializes a Socket.io server attached to the Express server.  
- The frontend connects using the user’s JWT token.  
- Messages are sent and received instantly through WebSocket events.  

---

## Common Commands

### Backend

| Command        | Description                             |
|----------------|---------------------------------------|
| npm run dev    | Run backend in development mode (Nodemon) |
| npm run start  | Run backend in production mode          |
| npm run lint   | Run ESLint for code quality checks      |

### Frontend

| Command        | Description                       |
|----------------|---------------------------------|
| npm run dev    | Start Next.js development server |
| npm run build  | Build frontend for production     |
| npm run start  | Start production build            |
| npm run lint   | Run ESLint checks                 |

---

## JWT Authentication Overview

When a user logs in, the backend returns a signed JWT token.  
The frontend stores this token in `localStorage` and attaches it to every request header:

```

Authorization: Bearer <token>

```

The backend verifies this token on each request to authorize access.

---

## Tech Stack

### Frontend

- Next.js 14  
- TypeScript  
- TailwindCSS  
- React Query  
- Axios  

### Backend

- Node.js + Express  
- SQLite (or PostgreSQL/MySQL, configurable)  
- JWT Authentication  
- Socket.io (real-time chat)  
- Bcrypt (password hashing)  

---

## Deployment

For deployment, consider the following:

- Frontend: Vercel or Netlify  
- Backend: Render, Railway, or any Node.js-compatible hosting platform  
- Ensure environment variables are properly set in both environments  
- Set `NEXT_PUBLIC_API_URL` to your deployed backend API URL  

---

## Example .env Configuration

Create a `.env.example` file for team reference:

```


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
Email: [your-email@example.com]  
Portfolio: [your-portfolio-link.com]
```


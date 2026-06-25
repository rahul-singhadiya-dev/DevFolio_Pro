# DevFolio Pro

A production-ready, full-stack **developer portfolio CMS** — featuring a beautiful public-facing portfolio site and a private admin panel to manage all content without touching code.

---

## ✨ Features

### Public Portfolio
- **Hero section** with availability badge and animated spotlight
- **Skills** grouped by category (Frontend, Backend, Database, DevOps, Tools)
- **Experience** timeline
- **Projects** showcase with filtering, tags, and view counter
- **Blog** with markdown rendering and tag filtering
- **Contact form** with email notifications
- Dark / Light theme toggle

### Admin CMS Panel
- Secure JWT-based login (single admin owner)
- **Dashboard** with stats (projects, posts, messages, views)
- Full **CRUD** for: Projects · Skills · Experience · Blog Posts
- **Profile editor** (name, bio, avatar URL, social links, resume PDF upload)
- **Messages inbox** with read/unread status
- **Change Password** without touching `.env` manually

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite 8, TailwindCSS v4, Framer Motion |
| **Routing** | React Router DOM v7 |
| **UI Icons** | Lucide React |
| **HTTP Client** | Axios |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL (Neon serverless) via Prisma ORM |
| **Auth** | JWT + bcryptjs |
| **File Uploads** | Cloudinary (resume PDF + project thumbnails) |
| **Email** | Nodemailer (SMTP) |
| **Validation** | express-validator |
| **Security** | Helmet, express-rate-limit, CORS |

---

## 📁 Project Structure

```
DevFolio Pro/
├── frontend/                  # React + Vite frontend
│   ├── src/
│   │   ├── api/               # Axios client instance
│   │   ├── components/
│   │   │   ├── common/        # Badge, Button, Input, Modal, Spinner …
│   │   │   └── layout/        # AdminLayout, AdminSidebar, Navbar, Footer
│   │   ├── hooks/             # useAuth, useFetch, useTheme
│   │   ├── pages/
│   │   │   ├── admin/         # Dashboard, Profile, Projects, Skills,
│   │   │   │                  # Experience, Blog, Messages + forms
│   │   │   └── public/        # Home, Projects, Blog, BlogPost,
│   │   │                      # ProjectDetail, Contact, Login
│   │   ├── styles/            # global.css, CSS variables / tokens
│   │   └── utils/             # Asset URL helpers
│   └── package.json
│
├── backend/                   # Express.js REST API
│   ├── scripts/
│   │   ├── hash-password.js   # Generate bcrypt hash for admin password
│   │   └── seed.js            # Seed demo data into the database
│   ├── src/
│   │   ├── controllers/       # auth, profile, projects, skills,
│   │   │                      # experience, blog, messages, dashboard
│   │   ├── middleware/        # auth (JWT verify), errorHandler
│   │   ├── prisma/            # schema.prisma + Prisma client singleton
│   │   ├── routes/            # auth, profile, projects, skills,
│   │   │                      # experience, blog, messages, dashboard
│   │   └── utils/             # cloudinary, email helpers
│   ├── .env.example           # Environment variable template
│   ├── server.js              # Express entry point
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** ≥ 20
- **npm** ≥ 9
- A **PostgreSQL** database (e.g. [Neon](https://neon.tech) — free tier works)
- A **Cloudinary** account (free tier) for file uploads

---

### 1 — Clone the repo

```bash
git clone https://github.com/your-username/devfolio-pro.git
cd "devfolio-pro"
```

---

### 2 — Configure the Backend

```bash
cd backend
cp .env.example .env
```

Edit `.env` and fill in all values (see [Environment Variables](#-environment-variables) below).

**Generate your admin password hash:**
```bash
npm run hash-password "your-secure-password"
# Copy the printed hash → paste as ADMIN_PASSWORD_HASH in .env
```

---

### 3 — Install dependencies & migrate the database

```bash
# Inside /backend
npm install
npm run prisma:generate   # generate Prisma client
npm run prisma:migrate    # apply migrations to your DB
```

Optionally seed demo data:
```bash
node scripts/seed.js
```

---

### 4 — Run the Backend

```bash
npm run dev      # nodemon — auto-restarts on changes
# or
npm start        # plain node
```

Backend runs on **http://localhost:5000**

---

### 5 — Install & Run the Frontend

```bash
cd ../frontend
npm install
npm run dev
```

Frontend runs on **http://localhost:5173**

---

## 🔐 Environment Variables

Copy `backend/.env.example` → `backend/.env` and fill in:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (Neon or any Postgres) |
| `JWT_SECRET` | Long random string for signing JWT tokens |
| `JWT_EXPIRES_IN` | Token expiry e.g. `24h`, `7d` |
| `ADMIN_EMAIL` | Your admin login email |
| `ADMIN_PASSWORD_HASH` | bcrypt hash — generate with `npm run hash-password` |
| `SMTP_HOST` | SMTP server host (e.g. `smtp.gmail.com`) |
| `SMTP_PORT` | SMTP port (usually `587`) |
| `SMTP_USER` | SMTP username / email |
| `SMTP_PASS` | SMTP password or app password |
| `SMTP_FROM` | Sender address shown in emails |
| `NOTIFY_EMAIL` | Your personal email that receives contact form alerts |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `PORT` | Server port (default `5000`) |
| `NODE_ENV` | `development` or `production` |

---

## 📜 Available Scripts

### Backend (`/backend`)

| Command | Description |
|---|---|
| `npm run dev` | Start server with nodemon (hot reload) |
| `npm start` | Start server with plain node |
| `npm run hash-password <pwd>` | Generate bcrypt hash for a password |
| `npm run prisma:generate` | Regenerate Prisma client after schema changes |
| `npm run prisma:migrate` | Apply pending database migrations |
| `npm run prisma:studio` | Open Prisma Studio (DB GUI) in browser |

### Frontend (`/frontend`)

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server (hot reload) |
| `npm run build` | Build optimised production bundle |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run oxlint linter |

---

## 🗄 Database Schema

| Model | Fields |
|---|---|
| `Profile` | fullName, title, bio, avatarUrl, githubUrl, linkedinUrl, twitterUrl, resumeUrl |
| `Project` | title, slug, shortDescription, fullDescription, techTags, liveUrl, githubUrl, thumbnailUrl, viewCount, published |
| `Skill` | name, category (FRONTEND/BACKEND/DATABASE/DEVOPS/TOOLS), proficiency, sortOrder |
| `Experience` | company, role, startDate, endDate, isCurrent, description |
| `BlogPost` | title, slug, excerpt, content, tags, published |
| `ContactMessage` | name, email, subject, message, isRead |

---

## 🔌 API Overview

All admin routes require `Authorization: Bearer <token>` header.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | ❌ | Admin login |
| `GET` | `/api/auth/verify` | ✅ | Verify token |
| `POST` | `/api/auth/change-password` | ✅ | Change admin password |
| `GET` | `/api/profile` | ❌ | Get public profile |
| `PUT` | `/api/admin/profile` | ✅ | Update profile |
| `GET` | `/api/projects` | ❌ | List published projects |
| `GET` | `/api/projects/:slug` | ❌ | Get project detail |
| `GET` | `/api/admin/projects` | ✅ | List all projects (incl. drafts) |
| `POST` | `/api/admin/projects` | ✅ | Create project |
| `PUT` | `/api/admin/projects/:id` | ✅ | Update project |
| `DELETE` | `/api/admin/projects/:id` | ✅ | Delete project |
| `GET` | `/api/skills` | ❌ | List all skills |
| `GET` | `/api/blog` | ❌ | List published posts |
| `GET` | `/api/blog/:slug` | ❌ | Get blog post |
| `GET` | `/api/admin/blog` | ✅ | List all posts |
| `POST` | `/api/admin/blog` | ✅ | Create post |
| `PUT` | `/api/admin/blog/:id` | ✅ | Update post |
| `DELETE` | `/api/admin/blog/:id` | ✅ | Delete post |
| `POST` | `/api/contact` | ❌ | Submit contact form |
| `GET` | `/api/admin/messages` | ✅ | List all messages |
| `GET` | `/api/admin/dashboard` | ✅ | Dashboard statistics |

---

## 🚢 Deployment

### Backend
Deploy to any Node.js host — **Railway**, **Render**, **Fly.io**, or a VPS.

1. Set all environment variables on the host dashboard
2. Build command: `npm install && npx prisma generate && npx prisma migrate deploy`
3. Start command: `npm start`

### Frontend
Deploy to **Vercel** or **Netlify**.

1. Set `VITE_API_BASE_URL` to your deployed backend URL (e.g. `https://your-api.railway.app/api`)
2. Build command: `npm run build`
3. Output directory: `dist`

---

## 📄 License

MIT — free to use, modify, and distribute.

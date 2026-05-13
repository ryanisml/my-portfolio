# Portfolio Stack

A full-stack React + Vite portfolio with a Prisma-powered backend, reCAPTCHA protection, and an admin panel for managing content and contact messages.

## Tech Stack

**Frontend:**
- React 19 + Vite
- Tailwind CSS
- GSAP animations
- React Router
- React Google reCAPTCHA

**Backend:**
- Node.js + Express
- Prisma ORM
- PostgreSQL 12+ (configured in Prisma schema)
- Bearer token authentication
- reCAPTCHA v2 verification

## Features

- 📱 Full-screen vertical slide presentation with snap scroll
- 🎨 Dark/light theme toggle
- 🔄 Real-time content management via admin panel
- 🗄️ SQL database with Prisma ORM
- 🔐 Admin authentication with reCAPTCHA
- 💬 Contact form with database storage and admin panel
- ♿ Responsive design
- 🤖 reCAPTCHA protection on login and contact form

## Quick Start

### Option 1: Manual Setup (Recommended)

**Prerequisites:** Node.js 22+, PostgreSQL 12+

**Backend:**
```bash
cd backend
cp .env.example .env
# Update DATABASE_URL and ADMIN_PASSWORD in .env
npm install
npx prisma db push
npm run prisma:seed
npm run dev
```

**Frontend** (new terminal):
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

### Option 2: Docker Compose

Docker Compose now runs frontend + backend only. PostgreSQL is expected to run outside this stack.

Backend uses:
- `DATABASE_URL` from your environment if provided
- fallback: `postgresql://portfolio_user:portfolio_pass@host.docker.internal:5432/portfolio_db`

```bash
docker compose up --build
```

Access:
- Frontend: http://localhost:5173
- Admin: http://localhost:5173/admin
- Backend API: http://localhost:4000

## Admin Panel

Access the admin panel at `/admin`. 

### Authentication

- reCAPTCHA v2 is enforced when keys are configured; otherwise login still works with a warning.
- Enter your admin password (from `ADMIN_PASSWORD` env variable)

### What You Can Manage

- **Projects** - Create/edit/delete with images, technologies, responsibilities, impacts
- **Slides** - Manage presentation content
- **Skills** - Organize by groups
- **Experiences** - Work history with nested highlights
- **Social Links** - Social media profiles
- **Contact Info** - Contact details (email, phone, address, etc.)
- **Messages** - View and manage contact form submissions

### Setting Admin Password

Update `ADMIN_PASSWORD` in `backend/.env`:

```env
ADMIN_PASSWORD=your_secure_password
```

### reCAPTCHA Configuration (Optional)

To enable reCAPTCHA protection:

1. Get keys from [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Add to `backend/.env`:
   ```env
   RECAPTCHA_SECRET_KEY="your_recaptcha_secret_key_here"
   ```
3. Add to `frontend/.env`:
   ```env
   VITE_RECAPTCHA_SITE_KEY="your_recaptcha_site_key_here"
   ```

Without these keys, a warning will display but the app will still function.

## API Endpoints

### Public (GET only)
- `GET /api/projects` - All projects
- `GET /api/projects/:slug` - Project details
- `GET /api/slides` - Slides
- `GET /api/skills` - Skills by group
- `GET /api/experiences` - Work experiences
- `GET /api/social-links` - Social links
- `GET /api/about` - About sections
- `GET /api/contact` - Contact information
- `GET /health` - Health check

### Public (POST)
- `POST /api/messages` - Submit contact form (with reCAPTCHA verification)
- `POST /api/verify-captcha` - Verify reCAPTCHA token

### Admin (requires Bearer token)
All admin operations require:
```
Authorization: Bearer <ADMIN_PASSWORD>
```

**Messages:**
- `GET /api/messages/admin/all` - Get all contact messages
- `PATCH /api/messages/:id/read` - Mark message as read
- `DELETE /api/messages/:id` - Delete message

## Database

### Models
- **Project** - Portfolio projects with full metadata
- **Slide** - Presentation content
- **Skill** - Skills grouped by category  
- **WorkExperience** - Career history with highlights
- **SocialLink** - Social profiles
- **Contact** - Contact information (email, phone, address, location, coordinates)
- **About** - About section with nested items
- **Message** - Contact form submissions with read status and timestamp

### Setup Commands

```bash
cd backend

# Sync schema to database
npx prisma db push

# Reset DB (dev only - will prompt for confirmation)
npx prisma db reset

# Re-seed data
npm run prisma:seed

# Generate Prisma client
npx prisma generate
```

## Project Images

Project images are stored as URLs in the database.

### Quick Start

1. Upload project screenshots to a CDN or image host (Cloudinary, Imgur, ImgBB).
2. Copy the public image URLs.
3. In Admin Panel at /admin, paste URLs into the project Images field.

### Recommended Specs

- Format: JPG, PNG, or WebP
- Dimensions: 1200x720 (16:9)
- File size: under 500KB per image
- Quality target: 75-85%

### Advanced Options

- Cloudinary auto-upload for one-click admin uploads
- Firebase Storage integration for Google ecosystem workflows

See [backend/README.md](backend/README.md) for implementation notes.

## Project Structure

```
portfolio/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── AdminPanel.jsx
│   │   │   ├── ProjectDetailsPage.jsx
│   │   │   └── NotFoundPage.jsx
│   │   ├── slides/
│   │   ├── components/
│   │   ├── data/
│   │   ├── lib/
│   │   └── hooks/
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── db.js
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.js
│   │   └── migrations/
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## Environment Variables

**Frontend (.env):**
```
VITE_API_BASE_URL="http://localhost:4000"
VITE_RECAPTCHA_SITE_KEY="your_recaptcha_site_key_here"
VITE_ALLOWED_HOSTS="localhost"
VITE_HMR_HOST=""
VITE_HMR_PROTOCOL="ws"
VITE_HMR_CLIENT_PORT="5173"
```

**Backend (.env):**
```
PORT=4000
DATABASE_URL="postgresql://root:password@localhost:5432/portfolio_db"
CORS_ORIGIN="http://localhost:5173"
RECAPTCHA_SECRET_KEY="your_recaptcha_secret_key_here"
ADMIN_PASSWORD=admin123
```

**Portainer (.env.portainer):**
```
PORTFOLIO_TAG=v1
DATABASE_URL=postgresql://user:password@host:5432/portfolio_db
ADMIN_PASSWORD=change_this_admin_password
CORS_ORIGIN=https://your-frontend-domain
RECAPTCHA_SECRET_KEY=
VITE_API_BASE_URL=https://your-frontend-domain
VITE_RECAPTCHA_SITE_KEY=
```

Copy the template from [.env.portainer.example](.env.portainer.example).

## Development

```bash
# Backend (terminal 1)
cd backend && npm run dev

# Frontend (terminal 2)
cd frontend && npm run dev
```

Both services will auto-reload on file changes.

## Build

```bash
cd frontend && npm run build
```

## Deployment

### Local Docker Compose

```bash
docker compose up --build -d
```

This starts:
- Backend (port 4000)
- Frontend (port 5173)

And connects backend to your external PostgreSQL instance via `DATABASE_URL`.

### Portainer + Registry (Production)

1. Build and push images to your registry:

```bash
TAG=v2

docker buildx build --platform linux/amd64 -t registry.ismail.id/my-portfolio-backend:${TAG} ./backend --push
docker buildx build --platform linux/amd64 -t registry.ismail.id/my-portfolio-frontend:${TAG} ./frontend --push
```

2. In Portainer Stack env, set variables from `.env.portainer` and set `PORTFOLIO_TAG` to your pushed tag.

3. Deploy [docker-compose.portainer.yml](docker-compose.portainer.yml).

4. Configure nginx for your domain:
   - proxy `/` to `127.0.0.1:5173` (frontend container)
   - proxy `/api/` and `/health` to `127.0.0.1:4000` (backend container)

Example nginx locations:

```nginx
location /api/ {
   proxy_pass http://127.0.0.1:4000/api/;
   proxy_http_version 1.1;
   proxy_set_header Host $host;
   proxy_set_header X-Real-IP $remote_addr;
   proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
   proxy_set_header X-Forwarded-Proto $scheme;
}

location = /health {
   proxy_pass http://127.0.0.1:4000/health;
   proxy_http_version 1.1;
   proxy_set_header Host $host;
}

location / {
   proxy_pass http://127.0.0.1:5173;
   proxy_http_version 1.1;
   proxy_set_header Host $host;
   proxy_set_header X-Real-IP $remote_addr;
   proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
   proxy_set_header X-Forwarded-Proto $scheme;
}
```

Notes:
- Frontend in production is static files served by Nginx in the container.
- Frontend runtime config is generated at container start in `/config.js`, so `VITE_API_BASE_URL` and `VITE_RECAPTCHA_SITE_KEY` can be changed in Portainer without rebuilding the image.


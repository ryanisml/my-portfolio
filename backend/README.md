# Backend API (Prisma + SQL)

This service exposes all portfolio data (projects, slides, skills, experiences, social links, contact form messages) through Prisma ORM.

## Tech

- Node.js + Express
- Prisma ORM
- PostgreSQL 12+ (current Prisma datasource)

## Prerequisites

PostgreSQL must be running for the current Prisma schema configuration. You can:

**Option 1: Local PostgreSQL installation**
```bash
brew install postgresql
brew services start postgresql
createdb portfolio_db
```

**Option 2: Docker (Recommended)**
```bash
docker run -d \
  --name portfolio-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=portfolio_db \
  -p 5432:5432 \
  postgres:16
```

Note: The repository-level [docker-compose.yml](../docker-compose.yml) does not include a database container. It expects an external PostgreSQL instance and passes `DATABASE_URL` to backend.

## Setup

1. Copy environment file:
```bash
cp .env.example .env
```

2. Update `.env` with your PostgreSQL credentials:
```
PORT=4000
DATABASE_URL="postgresql://user:password@localhost:5432/portfolio_db"
CORS_ORIGIN="http://localhost:5173"
RECAPTCHA_SECRET_KEY="your_recaptcha_secret_key_here"
ADMIN_PASSWORD="your_secure_admin_password"
```

3. Install dependencies:
```bash
npm install
```

4. Sync schema to database (creates all tables):
```bash
npx prisma db push
```

5. Seed data:
```bash
npm run prisma:seed
```

6. Start dev server:
```bash
npm run dev
```

The API will run on `http://localhost:4000`.

## Database Commands

- `npx prisma db push`: Sync schema to database (dev)
- `npx prisma db reset`: Reset database to initial state (dev only, requires confirmation)
- `npx prisma generate`: Regenerate Prisma client
- `npm run prisma:seed`: Re-seed initial data

## API Endpoints

- `GET /health` - Health check (includes database connectivity status)
- `GET /api/projects`
- `GET /api/projects/:slug`
- `GET /api/slides`
- `GET /api/skills`
- `GET /api/experiences`
- `GET /api/social-links`
- `GET /api/about`
- `GET /api/contact`
- `POST /api/messages` - Submit contact form message (with reCAPTCHA verification)
- `POST /api/verify-captcha` - Verify reCAPTCHA token

### Admin Endpoints (Require Bearer Token)

All admin operations require:
```
Authorization: Bearer <ADMIN_PASSWORD>
```

**Messages:**
- `GET /api/messages/admin/all` - Get all contact form messages
- `PATCH /api/messages/:id/read` - Mark message as read
- `DELETE /api/messages/:id` - Delete message

**Data Management:**
- `PUT /api/projects/:slug` - Update project
- `DELETE /api/projects/:slug` - Delete project
- `PUT /api/slides/:id` - Update slide
- `PUT /api/skills/:id` - Update skill group
- `PUT /api/experiences/:id` - Update work experience
- `PUT /api/social-links/:id` - Update social link
- `PUT /api/about/:id` - Update about section
- `PUT /api/contact` - Update contact info

## Database Schema

- **projects**: Portfolio project entries with full details, images, responsibilities, impacts, technologies
- **slides**: Presentation slide metadata (title, description, theme colors)
- **skills**: Skill groups organized by category
- **work_experiences**: Career history with highlights and sub-highlights
- **work_experience_sub_highlights**: Detailed highlights within work experiences
- **social_links**: Social media profile links with icon mappings
- **contact**: Contact information (email, phone, address, location, coordinates)
- **about**: About section with nested items
- **about_items**: Individual items within about sections
- **messages**: Contact form submissions with reCAPTCHA verification

## Environment Variables

Required:
- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Server port (default: 4000)
- `CORS_ORIGIN` - Frontend URL for CORS (default: http://localhost:5173)

Optional:
- `ADMIN_PASSWORD` - Bearer token for admin endpoints (default: required for admin operations)
- `RECAPTCHA_SECRET_KEY` - reCAPTCHA v2 secret key (from Google Cloud Console)

### Image Storage Options

Recommended default: keep image URLs in project records and host files on a CDN or image host.

### Quick Start

1. Upload screenshots to Cloudinary, Imgur, ImgBB, or similar.
2. Copy public image URLs.
3. In Admin Panel, paste URLs into each project Images field.

### Recommended Specs

- Format: JPG, PNG, or WebP
- Dimensions: 1200x720 (16:9)
- File size: under 500KB per image
- Quality target: 75-85%

### Advanced Options

- Cloudinary auto-upload: add server upload endpoint with multer and cloudinary.
- Firebase Storage upload: add server upload endpoint with firebase-admin.

Both advanced options are optional and can be added after MVP launch.

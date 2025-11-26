# Portfolio Website with Admin Panel

## Overview
A complete portfolio website for Pavan Reddy Cheedeti, DevOps Engineer, with a secure admin panel for managing content.

## Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL (Neon) with Drizzle ORM
- **Authentication**: JWT-based admin authentication

## Project Structure
```
client/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── ui/           # Shadcn UI components
│   │   ├── theme-provider.tsx
│   │   └── theme-toggle.tsx
│   ├── lib/
│   │   ├── auth.tsx      # Auth context
│   │   ├── queryClient.ts
│   │   └── utils.ts
│   └── pages/
│       ├── home.tsx           # Public portfolio page
│       ├── admin-login.tsx    # Admin login page
│       ├── admin-dashboard.tsx # Admin panel
│       └── not-found.tsx
server/
├── db.ts                 # Database connection
├── storage.ts            # Database storage interface
├── routes.ts             # API endpoints
└── app.ts
shared/
└── schema.ts             # Drizzle schema definitions
```

## Features

### Public Portfolio
- Hero section with profile photo, name, title, and intro
- Skills section grouped by category
- Projects grid with tech stack badges and links
- Blog posts section
- Contact form
- Social media links (GitHub, LinkedIn, Email)
- Resume download button
- Dark/Light theme toggle

### Admin Panel
- Secure JWT authentication
- Dashboard with stats overview
- CRUD operations for:
  - Home section (profile info)
  - Skills (grouped by category)
  - Projects (with tech stack, URLs, images)
  - Blog posts (with publish/draft toggle)
  - Social links
  - Contact messages (with read/unread status)
  - Resume upload/replace

## API Endpoints

### Public
- `GET /api/hero` - Get hero section data
- `GET /api/skills` - Get all skills
- `GET /api/projects` - Get all projects
- `GET /api/blog` - Get all blog posts
- `GET /api/social-links` - Get social links
- `POST /api/contact` - Submit contact form
- `GET /api/resume/download` - Download resume

### Admin (Protected)
- `POST /api/admin/login` - Admin login
- `PUT /api/hero` - Update hero section
- `POST/PUT/DELETE /api/skills/:id` - Manage skills
- `POST/PUT/DELETE /api/projects/:id` - Manage projects
- `POST/PUT/DELETE /api/blog/:id` - Manage blog posts
- `POST/PUT/DELETE /api/social-links/:id` - Manage social links
- `GET /api/messages` - View contact messages
- `PUT /api/messages/:id/read` - Mark message as read
- `DELETE /api/messages/:id` - Delete message
- `POST /api/resume/upload` - Upload resume
- `DELETE /api/resume` - Delete resume

## Default Admin Credentials
- **Username**: admin
- **Password**: admin123

## Running the Application
The application runs on port 5000. Use the "Start application" workflow to run `npm run dev`.

## Database
PostgreSQL database with the following tables:
- `admins` - Admin users
- `hero_section` - Hero/home section content
- `skills` - Technical skills
- `projects` - Portfolio projects
- `blog_posts` - Blog posts
- `contact_messages` - Contact form submissions
- `social_links` - Social media links
- `resume` - Resume file info

## User Preferences
- Modern, professional design with blue accent color
- Inter font for body text, JetBrains Mono for code/tech labels
- Clean, minimal aesthetic inspired by developer platforms
- Dark mode support

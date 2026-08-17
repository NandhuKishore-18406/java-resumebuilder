# 🎓 Academic Resume Builder & Portfolio Platform

> A full-stack academic resume and personal portfolio management platform that automatically builds and updates a professional resume and cinematic interactive portfolio website from a student's profile and achievements.

## 📌 Overview

Academic Resume Builder solves a common problem faced by students: maintaining the same information in multiple places and manually updating their resume or personal website whenever they gain a new skill, complete a project, attend a seminar, or receive a certificate.

The system provides a **centralized student profile** that acts as the source of truth for both the academic resume and the generated portfolio website.

### Core Workflow

```text
                    Student Profile
                          │
          ┌───────────────┼────────────────┐
          │               │                │
       Skills          Projects        Education
          │               │                │
     Certificates      Seminars       Experience
          │               │                │
          └───────────────┼────────────────┘
                          ▼
                 Centralized Data
                          │
          ┌───────────────┴────────────────┐
          ▼                                ▼
  Resume Generator                 Portfolio Generator
          │                                │
  Fixed Resume Template             Cinematic Portfolio Site
          │                                │
  ┌───────┴───────┐                ┌───────┴───────┐
  ▼               ▼                ▼               ▼
Live Preview  PDF Export      Live Preview  HTML/ZIP Export
```

### Main Goal

**Enter valuable information once → store it centrally → automatically reflect it in your resume and portfolio website.**

For example:
- Add a new skill → it appears in the resume and portfolio stack bars.
- Add a project → it appears in the resume and portfolio interactive previewer.
- Add a certificate → it appears in the resume.
- Complete a seminar → it auto-moves to completed and populates the resume.
- Update education or experience → both resume and portfolio reflect latest details.

---

# ✨ Features

## 🔐 Authentication
- User registration & login
- BCrypt password hashing
- JWT authentication (24h validity)
- Protected backend API routes
- Google OAuth 2.0 Sign-In integration
- Persistent frontend auth state & session handling

## 👤 Profile Management
Centralized management of student details:
- Personal info (Name, Email, Phone, Location, Website)
- Professional Social Links (LinkedIn, GitHub, LeetCode, Vidwan ID, ORCID ID)
- Bio / Summary
- Technical Skills, Frameworks, Databases, Tools, Soft Skills, Languages
- Awards & Honors
- Education entries (Degree, Institution, Dates, GPA)
- Projects (Title, Description, Tech, Links)
- Experience & Publications

## 🌐 Portfolio Generator
Turn your profile data into a cinematic, interactive personal portfolio website:
- **Cinematic Hero**: Hero background zoom, live status badge, customized tagline.
- **Interactive Projects**: Click-to-preview sidebar with dynamic project showcase, tech badges, and demo links.
- **Categorized Stack Bars**: Displays languages, frameworks, databases, and tools with progress indicators and Nerd Font icons.
- **Fixed Glassmorphic Navbar**: Smooth scroll navigation, active ScrollSpy link tracking, and mobile drawer menu.
- **Export Options**: 1-click Standalone Single-File HTML export or server-generated `.zip` bundle (`index.html`, `style.css`, `script.js`).
- **Standalone CLI Generator**: Python script `python3 pyportfolio/pyportfolio.py data.json` for command-line site generation.

## 🛠️ Database Admin & CRUD Portal (`admin-dashboard/`)
A standalone, zero-framework Database Management & Administrative Portal:
- **Zero Framework Overhead**: Built with Python's standard `http.server` and Vanilla HTML5/CSS3/JS.
- **Real-Time Overview**: Live database status monitor and record counters for all tables (`users`, `profiles`, `certificates`, `seminars`, `files`, `resume_history`).
- **Full CRUD Capabilities**: Create, Read, Filter, Edit, and Delete database records directly in the UI.
- **Raw JSON Inspector**: View and inspect complex `JSONB` fields (`education`, `projects`, `experience`, `publications`).
- **Custom SQL Runner**: Run read-only `SELECT` SQL queries directly from the admin dashboard.
- **Data Export**: Export any database table to CSV or JSON formats.

## 📜 Certificates
- Add certificate metadata (Title, Recipient Name, Organization, Year)
- Upload certificate files (PDF, PNG, JPG)
- Auto-sync saved certificates to profile and resume
- Delete certificates with storage cleanup

## 🎤 Seminars & Workshops
- Track upcoming and completed seminars
- Organizer details, dates, and notes
- Auto-move past seminars to "Completed" status on date expiry
- Completed seminars automatically appear in the resume

## 📄 Resume Builder & History
- Multi-section A4 live preview (Personal Info, Summary, Education, Skills, Projects, Experience, Achievements, Certifications, Seminars, Publications)
- Automatic section hiding for empty categories
- **Resume History**: Save, restore, view, and delete previous resume snapshots
- **PDF Export**: Print-ready PDF generation from A4 preview

---

# 🛠️ Technology Stack

## Frontend
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Radix UI / shadcn-style components
- Lucide / Tabler Icons

## Backend
- Java 17
- Spring Boot 3.2
- Spring Security & JWT
- Spring Data JPA
- Maven

## Database & Tools
- PostgreSQL 16+
- Python 3 (CLI utilities, Portfolio generator, DB Admin server)

---

# 🏗️ Architecture

```text
┌────────────────────────────────────────────────────────┐
│                   Next.js Frontend                     │
│                  (http://localhost:3000)                │
│                                                        │
│ Dashboard │ Profile │ Resume Builder │ Portfolio       │
│ Certificates │ Seminars │ File Manager                 │
└───────────────────────────┬────────────────────────────┘
                            │ REST API / JWT
                            ▼
┌────────────────────────────────────────────────────────┐
│                 Spring Boot Backend                    │
│                  (http://localhost:8080)                │
│                                                        │
│ Auth │ Profile │ Certificates │ Seminars │ Resume      │
│ Portfolio Download │ Files                             │
└───────────────────────────┬────────────────────────────┘
                            │ JPA / JDBC
                            ▼
┌───────────────────────────┴────────────────────────────┐
│                    PostgreSQL Database                 │
│                   (demo_db @ localhost:5432)           │
│                                                        │
│ users │ profiles │ certificates │ seminars             │
│ resume_history │ files                                 │
└───────────────────────────▲────────────────────────────┘
                            │ psql CLI / JSON Queries
┌───────────────────────────┴────────────────────────────┐
│              Standalone DB Admin Portal                │
│                  (http://localhost:8090)                │
│                                                        │
│ Single-File Python Server + Vanilla Admin UI           │
│ Real-time Metrics │ Full CRUD │ SQL Runner             │
└────────────────────────────────────────────────────────┘
```

---

# 📁 Project Structure

```text
java-resumebuilder/
│
├── admin-dashboard/            # Standalone DB Admin & CRUD Portal (Port 8090)
│   ├── server.py               # Built-in Python HTTP server
│   ├── index.html              # Vanilla Admin UI
│   └── README.md
│
├── pyportfolio/                # Standalone Portfolio Site Generator
│   ├── pyportfolio.py          # Python portfolio generator script
│   ├── data.json               # Sample portfolio data
│   └── dist/                   # Generated website output
│
├── demo-fixed/                 # Spring Boot 3 Backend (Port 8080)
│   ├── src/
│   │   └── main/
│   │       ├── java/com/example/demo/
│   │       │   ├── auth/        # Auth0 / JWT / Security
│   │       │   ├── certificate/ # Certificate management
│   │       │   ├── file/        # File storage & upload
│   │       │   ├── portfolio/   # Portfolio zip downloader
│   │       │   ├── profile/     # Student profile entity & service
│   │       │   ├── resume/      # Resume history & snapshots
│   │       │   ├── seminar/     # Seminar & queue tracking
│   │       │   └── user/        # User entity & repo
│   │       │
│   │       └── resources/
│   │           ├── application.properties
│   │           └── schema.sql
│   │
│   └── pom.xml
│
├── javaprog/frontend/          # Next.js 16 Frontend (Port 3000)
│   ├── src/
│   │   ├── app/                # App router pages & layouts
│   │   ├── components/         # UI components & sidebars
│   │   ├── hooks/              # App state & Auth hooks
│   │   └── lib/                # pyportfolioEngine, API client, auth
│   └── package.json
│
├── run_app.py                  # Single-command launcher script
└── README.md
```

---

# 🔌 API Overview

## Authentication
```http
POST /api/auth/register
POST /api/auth/login
```

## Profile
```http
GET /api/profile
PUT /api/profile
```

## Certificates & Seminars
```http
GET    /api/certificates
POST   /api/certificates
DELETE /api/certificates/{id}

GET    /api/seminars
POST   /api/seminars
PUT    /api/seminars/{id}
DELETE /api/seminars/{id}
```

## Portfolio Package Download
```http
POST /api/portfolio/download
```

## File Management
```http
GET    /api/files
POST   /api/files/upload
GET    /api/files/{id}/download
DELETE /api/files/{id}
```

---

# ⚙️ Requirements

Install:
- Java 17+
- Maven 3.8+
- Node.js 18+ & npm / pnpm
- PostgreSQL 16+
- Python 3

---

# 🚀 Running the Project

## Option 1 — Single Command Launcher

The project includes `run_app.py`, which automatically:
1. Checks & starts PostgreSQL service if inactive.
2. Auto-creates `demo_db` database and tables from `schema.sql`.
3. Clears port conflicts (8080 & 3000).
4. Launches Spring Boot Backend & Next.js Frontend concurrently.
5. Displays operational endpoints in terminal:

```bash
python3 run_app.py
```

Output:
```text
======================================================
   Academic Resume Builder & Portfolio Launcher     
======================================================

🌐 Frontend:       http://localhost:3000
⚡ Backend API:     http://localhost:8080
🛠️  DB Admin Portal: http://localhost:8090
```

## Option 2 — Standalone DB Admin Portal

To inspect or edit database tables directly:

```bash
cd admin-dashboard
python3 server.py
```
Open **[http://localhost:8090](http://localhost:8090)** in your browser.

## Option 3 — Standalone Portfolio CLI Generator

To generate a portfolio website from JSON:

```bash
cd pyportfolio
python3 pyportfolio.py data.json
```
Open `dist/index.html` in your browser.

---

# 🗄️ PostgreSQL Configuration

Default development configuration:
```text
Database: demo_db
Username: javaproj
Password: Javaproj123
Port:     5432
```

Schema file:
```text
demo-fixed/src/main/resources/schema.sql
```

---

# 📄 License

This project was developed for educational and academic resume & portfolio automation.

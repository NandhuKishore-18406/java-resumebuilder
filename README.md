# 🎓 Academic Resume Builder

> A full-stack academic resume management platform that automatically builds and updates a professional resume from a student's profile and achievements.

## 📌 Overview

Academic Resume Builder solves a common problem faced by students: maintaining the same information in multiple places and manually updating their resume whenever they gain a new skill, complete a project, attend a seminar, or receive a certificate.

The system provides a **centralized student profile** that acts as the source of information for the resume.

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
                          ▼
                  Resume Generator
                          │
                          ▼
                 Fixed Resume Template
                          │
                 ┌────────┴────────┐
                 ▼                 ▼
            Live Preview       PDF Export
```

### Main Goal

**Enter valuable information once → store it centrally → automatically reflect it in the resume.**

For example:

- Add a new skill → it appears in the resume.
- Add a project → it appears in the resume.
- Add a certificate → it appears in the resume.
- Complete a seminar → it appears in the resume.
- Update education or experience → the resume reflects the latest information.

This removes repetitive resume editing and helps keep the resume up to date.

---

# ✨ Features

## 🔐 Authentication

- User registration
- Email/password login
- Password hashing
- JWT authentication
- Protected backend APIs
- Google Sign-In
- Existing email/account handling
- Frontend authentication state

## 👤 Profile Management

Users can maintain:

- Personal information
- Email
- Phone
- Location
- Website
- LinkedIn
- GitHub
- LeetCode
- Professional summary
- Technical skills
- Frameworks
- Databases
- Tools
- Soft skills
- Languages
- Awards
- Education
- Projects
- Experience
- Publications
- Interests

## 📜 Certificates

- Add certificates
- Certificate metadata
- Organization
- Year
- Recipient name
- Upload certificate files
- Delete certificates
- Display certificates in the resume

## 🎤 Seminars & Workshops

- Add seminars/workshops
- Organizer information
- Date
- Notes
- Upcoming seminar tracking
- Mark seminars as completed
- Completed seminars appear in the resume

## 📄 Resume Builder

The resume contains sections such as:

- Personal Information
- Summary
- Education
- Technical Skills
- Projects
- Experience
- Achievements
- Certifications
- Seminars & Workshops
- Publications
- Interests

### Automatic Synchronization

The resume is designed around the central profile/activity data.

```text
Add / Update Information
          ↓
    Central Data
          ↓
   Resume Model
          ↓
   Live A4 Preview
          ↓
      PDF Export
```

Empty sections are automatically hidden so the final resume remains clean.

## 🕒 Resume History

- Save resume snapshots
- View previous versions
- Restore previous versions
- Delete saved versions

## 📥 PDF Export

Users can preview the resume using the fixed template and export it as a PDF.

---

# 🛠️ Technology Stack

## Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- React Hook Form
- Radix UI / shadcn-style components
- Lucide / Tabler Icons

## Backend

- Java
- Spring Boot 3
- Spring Security
- JWT
- Spring Data JPA
- REST APIs
- Maven

## Database

- PostgreSQL

## Authentication

- JWT
- Google OAuth / Google Sign-In

---

# 🏗️ Architecture

```text
┌──────────────────────────────┐
│       Next.js Frontend       │
│                              │
│ Dashboard                    │
│ Profile                      │
│ Certificates                 │
│ Seminars                     │
│ Resume Builder               │
│ File Manager                 │
└──────────────┬───────────────┘
               │ REST API
               ▼
┌──────────────────────────────┐
│      Spring Boot Backend     │
│                              │
│ Authentication              │
│ Profile                      │
│ Certificates                 │
│ Seminars                     │
│ Resume                       │
│ AI                           │
└──────────────┬───────────────┘
               │ JPA / JDBC
               ▼
┌──────────────────────────────┐
│         PostgreSQL           │
│                              │
│ Users                        │
│ Profiles                     │
│ Certificates                │
│ Seminars                     │
│ Resume History              │
│ Files                        │
└──────────────────────────────┘
```

---

# 📁 Project Structure

```text
java-resumebuilder/
│
├── demo-fixed/
│   ├── src/
│   │   └── main/
│   │       ├── java/com/example/demo/
│   │       │   ├── ai/
│   │       │   ├── auth/
│   │       │   ├── certificate/
│   │       │   ├── file/
│   │       │   ├── profile/
│   │       │   ├── resume/
│   │       │   ├── seminar/
│   │       │   └── user/
│   │       │
│   │       └── resources/
│   │           ├── application.properties
│   │           └── schema.sql
│   │
│   └── pom.xml
│
├── javaprog/
│   └── frontend/
│       ├── src/
│       │   ├── app/
│       │   ├── components/
│       │   ├── hooks/
│       │   └── lib/
│       │
│       ├── package.json
│       └── .env.example
│
├── run_app.py
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

## Certificates

```http
GET    /api/certificates
POST   /api/certificates
DELETE /api/certificates/{id}
```

## Seminars

```http
GET    /api/seminars
POST   /api/seminars
PUT    /api/seminars/{id}
DELETE /api/seminars/{id}
```

## Resume History

```http
GET    /api/resume/history
POST   /api/resume/history
DELETE /api/resume/history/{id}
```
---

# ⚙️ Requirements

Install:

- Java
- Maven
- Node.js
- npm
- PostgreSQL
- Python 3

---

# 🚀 Running the Project

## Option 1 — Single Command

The project includes `run_app.py`, which is designed to:

- Check PostgreSQL
- Verify the database
- Initialize missing database tables
- Start Spring Boot
- Start Next.js
- Open the application

Run from the project root:

```bash
python3 run_app.py
```

The launcher is designed to run the backend on port `8080` and frontend on port `3000`. :contentReference[oaicite:2]{index=2}

---

# 🗄️ PostgreSQL Configuration

The application uses PostgreSQL.

Default development configuration:

```text
Database: demo_db
Username: javaproj
Port:     5432
```

The project contains:

```text
demo-fixed/src/main/resources/schema.sql
```

which defines the database schema.

---

# 🔧 Environment Variables

Create the frontend environment file:

```bash
cd javaprog/frontend
cp .env.example .env.local
```

Example:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

Backend environment variables can include:

```env
DB_URL=jdbc:postgresql://localhost:5432/demo_db
DB_USERNAME=javaproj
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
GLM_API_KEY=your_glm_api_key
```

### ⚠️ Never commit secrets

Do not commit:

```text
.env.local
```

Commit only:

```text
.env.example
```

with placeholder values.

---

# 🔑 Google Sign-In

Google Sign-In requires a Google OAuth Client ID.

For local development, configure:

```text
Authorized JavaScript Origin:

http://localhost:3000
```

Then set:

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id
```

For production, add the production domain to the Google OAuth configuration and set the same environment variable in the hosting platform.

---

# 🧪 Testing

The main end-to-end workflow should be:

```text
1. Register
      ↓
2. Login / Google Sign-In
      ↓
3. Complete Profile
      ↓
4. Add Skills
      ↓
5. Add Education
      ↓
6. Add Project
      ↓
7. Add Certificate
      ↓
8. Add Seminar
      ↓
9. Mark Seminar Complete
      ↓
10. Open Resume Builder
      ↓
11. Verify automatic updates
      ↓
12. Preview Resume
      ↓
13. Export PDF
      ↓
14. Logout
      ↓
15. Login again
      ↓
16. Verify data persists
```

---

# 🎯 Core Use Case

The primary demonstration of the project is:

### Before

```text
Student learns Python
        ↓
Student manually edits resume
        ↓
Student updates PDF
```

### With Academic Resume Builder

```text
Student adds Python to profile
        ↓
Data stored in PostgreSQL
        ↓
Resume model updates
        ↓
Resume preview updates
        ↓
PDF contains Python
```

The same workflow applies to projects, certificates, education, experience, publications, achievements, and completed seminars.

---

# 🔒 Security

The backend uses:

- Spring Security
- JWT authentication
- Password hashing
- Protected REST endpoints
- User-specific data access
- PostgreSQL persistence

Sensitive environment variables should always be provided through environment configuration rather than committed to source control.

---

# 📦 Deployment Architecture

The intended production architecture is:

```text
                 Internet
                    │
                    ▼
        ┌──────────────────────┐
        │   Next.js Frontend   │
        │   Vercel / Netlify   │
        └──────────┬───────────┘
                   │ HTTPS
                   ▼
        ┌──────────────────────┐
        │   Spring Boot API    │
        │    Render / Railway  │
        └──────────┬───────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │      PostgreSQL      │
        │     Neon / Render    │
        └──────────────────────┘
```

Production environment variables should be configured directly in the hosting platform.

---

# 🚧 Future Improvements

Possible future enhancements include:

- Multiple resume templates
- ATS compatibility analysis
- Job-description-based resume customization
- AI-powered resume rewriting
- Certificate OCR
- Automatic skill extraction
- GitHub integration
- LinkedIn profile import
- Public resume links
- Resume comparison
- Cloud file storage
- Grammar improvement

These features are secondary to the project's primary automatic resume synchronization workflow. :contentReference[oaicite:3]{index=3}

---

# 🎓 Project Objective

Academic Resume Builder is designed to be more than a traditional resume editor.

The central idea is:

```text
           USER ACTIVITY
                 │
                 ▼
        CENTRALIZED PROFILE
                 │
                 ▼
         AUTOMATIC RESUME
          SYNCHRONIZATION
                 │
                 ▼
          FIXED TEMPLATE
                 │
                 ▼
               PDF
```

### One sentence

> **Maintain your academic profile once, and keep your resume automatically up to date.**

---

# 👨‍💻 Development

### Backend

```bash
cd demo-fixed
./mvnw spring-boot:run
```

Backend:

```text
http://localhost:8080
```

### Frontend

```bash
cd javaprog/frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:3000
```

The project documentation also defines the backend/frontend development commands and local ports above. :contentReference[oaicite:4]{index=4}

---

# 📄 License

This project was developed as an academic/educational project.


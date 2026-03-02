# 🎓 InternHub - Internship Portal Web Application

A full-stack Internship Portal built with **React + Vite** (frontend) and **Express.js** (backend), featuring separate authentication for Students and Companies, resume upload, role-based access, and dark/light theme.

---

## 📋 Features

### Student Features
- Sign up / Login with email & password
- Browse all available internships
- Search & filter internships by title, company, skills, location
- View internship details
- Apply with resume upload (PDF/DOC/DOCX, max 5MB) + motivation text
- Dashboard showing all applied internships and their status

### Company Features
- Sign up / Login with email & password
- Create new internship listings
- View only their own internships (data isolation)
- View applicants per internship
- Accept / Shortlist / Reject students
- Delete internships

### Security
- Password hashing with **bcrypt**
- **JWT** authentication
- Role-based protected routes
- Company data isolation (companies cannot see each other's data)
- Input validation
- File type & size validation for resumes

### UI/UX
- Dark / Light theme toggle (persisted in localStorage)
- Responsive design (mobile-friendly)
- Clean, modern UI with smooth animations

---

## 🗄️ Database Schema

```
students
├── id (auto-increment)
├── name
├── email (unique)
├── password_hash
└── created_at

companies
├── id (auto-increment)
├── company_name
├── email (unique)
├── password_hash
└── created_at

internships
├── id (auto-increment)
├── company_id (FK → companies)
├── title
├── description
├── skills
├── location
├── duration
├── stipend
└── created_at

applications
├── id (auto-increment)
├── student_id (FK → students)
├── internship_id (FK → internships)
├── resume_url
├── motivation_text
├── status (pending / shortlisted / accepted / rejected)
└── applied_at
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v18+)
- npm

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd internship-portal
```

### 2. Setup Backend
```bash
cd server
npm install
```

Create a `.env` file in `server/`:
```
PORT=5000
JWT_SECRET=your_super_secret_key
```

Start the server:
```bash
npm run dev
```

### 3. Setup Frontend
```bash
cd client
npm install
npm run dev
```

The app will be available at `http://localhost:5173`

---

## 📁 Project Structure

```
my-second-webapp/
├── server/                    # Backend (Express.js)
│   ├── index.js              # Server entry point
│   ├── db.js                 # JSON file database
│   ├── .env                  # Environment variables
│   ├── middleware/
│   │   └── auth.js           # JWT auth & role middleware
│   ├── routes/
│   │   ├── auth.js           # Student & Company auth
│   │   ├── internships.js    # CRUD for internships
│   │   └── applications.js   # Apply, view, update status
│   └── uploads/              # Resume file storage
│
├── client/                    # Frontend (React + Vite)
│   └── src/
│       ├── api.js            # Axios API client
│       ├── App.jsx           # Router & layout
│       ├── App.css           # Complete styles + themes
│       ├── context/
│       │   ├── AuthContext.jsx
│       │   └── ThemeContext.jsx
│       ├── components/
│       │   ├── Navbar.jsx
│       │   └── ProtectedRoute.jsx
│       └── pages/
│           ├── AuthPage.jsx
│           ├── InternshipList.jsx
│           ├── InternshipDetails.jsx
│           ├── MyApplications.jsx
│           ├── CompanyDashboard.jsx
│           ├── CreateInternship.jsx
│           └── ApplicantsView.jsx
│
└── README.md
```

---

## 🔄 App Flow

### Student Flow
1. Student signs up / logs in
2. Browses internship listing page (with search)
3. Opens internship details
4. Clicks Apply → uploads resume + enters motivation
5. Application stored with status = `pending`
6. Views application status in My Applications dashboard

### Company Flow
1. Company signs up / logs in
2. Lands on company dashboard
3. Creates new internship
4. Views all their internships
5. Opens an internship to see applicants
6. Accepts / Shortlists / Rejects students
7. Status reflects in student dashboard

---

## 🛠 Tech Stack

| Layer    | Technology     |
|----------|---------------|
| Frontend | React, Vite, React Router, Axios |
| Backend  | Node.js, Express.js |
| Auth     | JWT, bcryptjs  |
| Database | JSON file store |
| Upload   | Multer (local storage) |
| Styling  | Custom CSS with CSS Variables (Dark/Light theme) |

---

## 📸 Screenshots

*(Add screenshots after running the application)*

---

## 📝 API Endpoints

### Auth
- `POST /api/auth/student/signup` — Student registration
- `POST /api/auth/student/login` — Student login
- `POST /api/auth/company/signup` — Company registration
- `POST /api/auth/company/login` — Company login

### Internships
- `GET /api/internships` — List all internships
- `GET /api/internships/:id` — Get internship details
- `GET /api/internships/company/mine` — Get company's own internships
- `POST /api/internships` — Create internship (Company only)
- `DELETE /api/internships/:id` — Delete internship (Company only)

### Applications
- `POST /api/applications` — Apply to internship (Student, multipart/form-data)
- `GET /api/applications/mine` — Get student's applications
- `GET /api/applications/internship/:id` — Get applicants for internship (Company only)
- `PATCH /api/applications/:id/status` — Update application status (Company only)

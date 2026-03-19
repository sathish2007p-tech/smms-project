# 🎓 Student Mark Management System (SMMS)

A full-stack MERN application for managing student academic marks with batch upload support.

---

## 🚀 Tech Stack

| Layer      | Technology                    |
|------------|-------------------------------|
| Frontend   | React.js, React Router v6     |
| Styling    | Custom CSS + Bootstrap 5      |
| Backend    | Node.js + Express.js          |
| Database   | MongoDB + Mongoose            |
| Auth       | JWT (JSON Web Tokens)         |
| Charts     | Chart.js + react-chartjs-2    |
| Upload     | Multer + SheetJS (xlsx)       |

---

## 📁 Project Structure

```
smms/
├── backend/
│   ├── config/         → MongoDB connection
│   ├── controllers/    → Business logic
│   ├── middleware/     → Auth & role guards
│   ├── models/         → Mongoose schemas
│   ├── routes/         → Express route definitions
│   ├── utils/          → Seeder script
│   ├── .env.example    → Environment variables template
│   └── server.js       → App entry point
│
└── frontend/
    └── src/
        ├── components/shared/  → Layout, Sidebar
        ├── context/            → Auth context (JWT)
        ├── pages/
        │   ├── admin/          → Dashboard, Users, Subjects, Batches, Marks
        │   ├── faculty/        → Dashboard, Mark Entry, Batch Upload, Subjects
        │   └── student/        → Dashboard, Marks, Report
        ├── utils/              → Axios instance
        └── App.js              → Routes
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js v16+
- MongoDB (local or Atlas)
- npm

### 1. Clone and Install

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/smms
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development
```

### 3. Seed Database (Demo Data)

```bash
cd backend
npm run seed
```

This creates demo users:

| Role    | Email               | Password    |
|---------|---------------------|-------------|
| Admin   | admin@smms.com      | admin123    |
| Faculty | priya@smms.com      | faculty123  |
| Student | arjun@smms.com      | student123  |

### 4. Run Development Servers

**Backend (Port 5000):**
```bash
cd backend
npm run dev
```

**Frontend (Port 3000):**
```bash
cd frontend
npm start
```

---

## 🔑 Features by Role

### 👑 Admin
- Dashboard with system stats and charts
- Create/edit/delete Users (Admin, Faculty, Student)
- Create/edit/delete Subjects and assign Faculty
- Manage academic Batches
- View and delete all mark records

### 👨‍🏫 Faculty
- Dashboard with subject and mark stats
- **Manual Mark Entry** – enter marks per student per subject
- **Batch Upload** – drag & drop CSV/Excel file, get detailed upload report
- View assigned subjects
- Download upload template

### 🎓 Student
- Personal dashboard with performance overview
- Full mark sheet with grade breakdown
- Academic report with CGPA calculation
- Export marks as Excel file

---

## 📤 Batch Upload Format

Download the template from the Faculty → Batch Upload page.

| studentId | internal1 | internal2 | assignment | semester |
|-----------|-----------|-----------|------------|----------|
| CS001     | 20        | 18        | 8          | 75       |
| CS002     | 22        | 21        | 9          | 80       |

**Mark Limits:**
- Internal 1 & 2: max **25** each
- Assignment: max **10**
- Semester Exam: max **100**
- Total: **160**

---

## 📊 Grading System

| Grade | Range     | Grade Point |
|-------|-----------|-------------|
| O     | 90 – 100% | 10          |
| A+    | 80 – 89%  | 9           |
| A     | 70 – 79%  | 8           |
| B+    | 60 – 69%  | 7           |
| B     | 50 – 59%  | 6           |
| C     | 40 – 49%  | 5           |
| F     | < 40%     | 0           |

**Pass Criteria:** Semester exam ≥ 40/100 AND overall percentage ≥ 40%

---

## 🔒 Security
- JWT authentication on all protected routes
- Role-based access control (Admin / Faculty / Student)
- Password hashing with bcrypt (12 rounds)
- File type and size validation on uploads
- MongoDB query sanitization

---

## 🌐 API Endpoints

| Method | Endpoint                        | Access         |
|--------|---------------------------------|----------------|
| POST   | /api/auth/login                 | Public         |
| GET    | /api/auth/me                    | Private        |
| GET    | /api/users                      | Admin          |
| POST   | /api/users                      | Admin          |
| DELETE | /api/users/:id                  | Admin          |
| GET    | /api/students                   | Admin, Faculty |
| GET    | /api/subjects                   | Private        |
| POST   | /api/subjects                   | Admin          |
| GET    | /api/marks                      | Private        |
| POST   | /api/marks                      | Faculty, Admin |
| POST   | /api/marks/upload               | Faculty, Admin |
| GET    | /api/marks/template             | Faculty, Admin |
| GET    | /api/reports/dashboard          | Admin, Faculty |
| GET    | /api/reports/student/:id        | Private        |
| GET    | /api/reports/export/student/:id | Private        |
| GET    | /api/batches                    | Private        |
| POST   | /api/batches                    | Admin          |

---

## 🔮 Future Enhancements
- Email/SMS notifications for result publication
- GPA/CGPA calculator across semesters
- Graphical analytics dashboard
- PDF export for mark sheets
- Mobile app (React Native)

# Cardiac Rehab Exercise Tracking System 💓

**ระบบติดตามการออกกำลังกายสำหรับผู้ป่วยโรคหัวใจ (Cardiac Rehabilitation System)**
Web-based application for monitoring and tracking exercise progress of cardiac rehabilitation patients.



---

## 👥 Team Members

| Student ID | Name | Role |
|------------|------|------|
| 67026225 | โนชมานิต โกสม | Developer |
| 67021781 | ธัชกร แย้มสังข์ | Developer |
| 67022209 | ศรรวริชญ์ นิยมสัตย์ | Developer |
| 67021983 | พัชรพล วราโภค | Developer |

---

## ✨ Features

### �‍⚕️ For Doctors (Admin)
- **Patient Management:** Add new patients, view all patient records.
- **Search System:** Search patients by phone number (with National ID masking for privacy).
- **Dashboard:** View overall statistics and unread reports.
- **Progress Tracking:** View patient exercise history and EKG charts.

### 🧘‍♂️ For Physical Therapists
- **Record Session:** Input exercise data (Heart Rate, BP, METs, Duration).
- **EKG Upload:** Upload EKG/ECG images for each session.
- **Recommendations:** Add specific advice for the next session.

### 👤 For Patients
- **Personal Dashboard:** View own exercise history.
- **Progress Graphs:** Visual charts for Heart Rate, Blood Pressure, and METs.
- **History Log:** Access past exercise sessions and doctor recommendations.

---

## 🛠️ Technology Stack
- **Frontend:** HTML5, CSS3 (Vanilla), JavaScript, Chart.js
- **Backend:** Node.js, Express.js
- **Database:** MySQL
- **Hosting:** Localhost (or Node.js supported hosting)

---

## 🚀 Installation (Local Development)

### Prerequisites
- Node.js (v14+)
- MySQL
- Git

### Steps
1. **Clone Repository**
   ```bash
   git clone https://github.com/kornmj/projectwebnodejs.git
   cd web-project-
   ```

2. **Setup Database**
   - Import `backend/complete_setup_for_hosting.sql` to MySQL.
   - Configure `backend/config/db.js` (or `db_config.js`) if needed.

3. **Install & Run**
   ```bash
   cd backend
   npm install
   node server.js
   ```
   - Access: `http://localhost:3000`

## ☁️ Deployment (Cloud Hosting)

This project can be easily deployed to any Node.js supported platform (e.g., Render, Railway, Heroku).

1. **Push to GitHub**
2. **Connect Repository to Hosting Service**
3. **Configure Environment Variables:**
   - `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
4. **Build Command:** `npm install`
5. **Start Command:** `node server.js`

---

## 🔑 Demo Credentials

### Staff Login
| Role | Username | Password |
|------|----------|----------|
| **Doctor** | `tckys` | `tckys123` |
| **Therapist** | `phuawonyoung` | `yeddwonyong` |

*(Note: Passwords are hashed with Bcrypt)*

### Patient Login
- **Username:** `0812345678` (Phone Number)
- **Password:** `1111111111111` (National ID - *Used for verification*)

---

## 🔒 Security Features
- **Privacy:** National IDs are masked in search results (e.g., `1-2345-678XX-XX-X`).
- **Authentication:** Role-based access control (Doctor, Therapist, Patient) via Express Sessions.
- **Protection:** SQL Injection prevention (MySQL2 Prepared Statements), Password Hashing (Bcrypt).
- **Configuration:** Environment-based database configuration (`backend/db_config.js`).

---
**Last Updated:** February 9, 2026

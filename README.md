# Cardiac Rehab Exercise Tracking System 💓

**ระบบติดตามการออกกำลังกายสำหรับผู้ป่วยโรคหัวใจ (Cardiac Rehabilitation System)**
Web-based application for monitoring and tracking exercise progress of cardiac rehabilitation patients.

🌐 **Live Demo:** [https://cardiacrehabsystem.free.nf/](https://cardiacrehabsystem.free.nf/)

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
- **Backend:** PHP 7.4+ (PDO for Database)
- **Database:** MySQL / MariaDB
- **Hosting:** InfinityFree (Apache Server)

---

## 🚀 Installation (Local Development)

### Prerequisites
- XAMPP (Apache + MySQL + PHP)
- Git

### Steps
1. **Clone Repository**
   ```bash
   git clone https://github.com/marnoch-352/web-project-.git
   cd cardiac_final
   ```

2. **Setup Database**
   - Open **phpMyAdmin** (`http://localhost/phpmyadmin`)
   - Create database named: `cardiac_rehab`
   - Import `backend/complete_setup_for_hosting.sql`

3. **Configure Connection**
   - The system automatically detects `localhost` and uses default XAMPP credentials (`root` / empty password).
   - Verify `backend/db_config.php` if you have custom settings.

4. **Run Application**
   - User Interface: `http://localhost/cardiac_final/frontend/index.html`
   
---

## ☁️ Deployment (Production / InfinityFree)

This project is configured to run on **InfinityFree** hosting with a specific folder structure.

### ⚙️ Environment Auto-Detection
The `backend/db_config.php` file automatically switches database credentials:
- **Localhost:** Uses XAMPP default settings.
- **Production:** Uses InfinityFree credentials (host: `sql111.infinityfree.com`).

### 📂 Server Folder Structure
On the hosting server (`htdocs/`), the structure is slightly flattened to simplify URLs:
```
htdocs/
├── backend/            # API & Config
├── html/               # HTML pages (from frontend/html)
├── css/                # Styles (from frontend/css)
├── javascript/         # Scripts (from frontend/javascript)
├── index.html          # Main Entry
└── ...
```

### 🔁 User Management Workflow (Important!)
Since the hosted database cannot be accessed remotely:
1. **Add Users Locally:** Use `manage_users.php` on your local machine to add Doctors/Therapists.
2. **Export SQL:** Export the `users` table from local phpMyAdmin (Data only).
3. **Import to Server:** Import the SQL file to the production phpMyAdmin.

---

## 🔑 Demo Credentials

### Staff Login
| Role | Username | Password |
|------|----------|----------|
| **Doctor** | `doctor_somsak` | `password123` |
| **Therapist** | `therapist_somchai` | `password123` |

*(Note: Passwords are hashed with Bcrypt)*

### Patient Login
- **Username:** `0812345678` (Phone Number)
- **Password:** `1234567890123` (National ID - *Used for verification*)

---

## 🔒 Security Features
- **Privacy:** National IDs are masked in search results (e.g., `1-2345-678XX-XX-X`).
- **Authentication:** Role-based access control (Doctor, Therapist, Patient).
- **Protection:** SQL Injection prevention (Prepared Statements), XSS protection.
- **Configuration:** Auto-adjusting redirects based on environment (`backend/api/login.php`).

---
**Last Updated:** February 9, 2026

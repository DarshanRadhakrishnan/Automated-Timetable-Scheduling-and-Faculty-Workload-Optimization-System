# Automated Timetable Scheduling and Faculty Workload Optimization System

![Banner](https://img.shields.io/badge/Status-Active-brightgreen) ![License](https://img.shields.io/badge/License-MIT-blue) ![Next.js](https://img.shields.io/badge/Next.js-14-black) ![Node.js](https://img.shields.io/badge/Node.js-Express-green) ![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-green)

A comprehensive, AI-assisted platform designed to autonomously generate collision-free academic timetables, optimize faculty work hours, and seamlessly adapt to dynamic rescheduling scenarios.

## 📖 Table of Contents
- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture & Tech Stack](#architecture--tech-stack)
- [System Roles](#system-roles)
- [Folder Structure](#folder-structure)
- [Installation & Setup](#installation--setup)
- [Usage Guide](#usage-guide)
- [Automated Constraints & Scoring](#automated-constraints--scoring)

## 🌟 Overview
Scheduling university or school classes often results in clashes, room double-bookings, or faculty burnout from unevenly distributed workloads. This system utilizes a heuristic scoring engine to generate multiple optimal timetable proposals based on hard and soft constraints, allowing administrators to pick the best fit.

The built-in intelligence also provides an intuitive **Conflict Intelligence** dashboard that detects timeline anomalies, mitigates clashes automatically, and offers one-click substitution or postponement features for faculty.

## ✨ Key Features
- **Intelligent Timetable Generation**: Autonomously produces comprehensive schedules assigning Sections, Courses, Faculties, and Rooms to the right Timeslots.
- **Dynamic Conflict Intelligence**: Scans generated or manually edited timetables for Room, Faculty, or Section overlaps, offering one-click AI-driven resolutions.
- **Workload Balancing**: Automatically scores proposals based on Faculty load deviation (preventing 5 consecutive classes or imbalanced weekly distributions).
- **Role-Based Access Control (RBAC)**: Distinct permissions and personalized dashboards for Admins, Faculties, and Students.
- **Real-Time Data Views**: Quickly slice timetable data by Faculty, Course, Section, or Room matrices on a dynamic grid/calendar.
- **Automated Explainability**: Explains *why* the system chose a specific table over another via scoring metrics (Gap penalties, Compactness bonuses, Room Utilization).

## 🛠️ Architecture & Tech Stack
This project follows a decoupled **MERN** application architecture enhanced with **Next.js**.

**Frontend (`frontend1`)**:
- **Framework**: Next.js 14 (App Router) / React
- **Language**: TypeScript (`.tsx`)
- **Styling**: Tailwind CSS
- **State Management**: React Hooks & Context API (`AuthContext`, `SidebarContext`)
- **Key Libraries**: Axios (Client-Side API requests), Lucide React (Iconography)

**Backend (`timetable-backend-mern`)**:
- **Environment**: Node.js & Express.js
- **Database**: MongoDB (Atlas/Local) + Mongoose ORM
- **Authentication**: JWT (JSON Web Tokens) & bcryptjs
- **Intelligence**: Custom heuristic algorithms for Schedule Scoring, Deviation computation, and Conflict Mitigation.

## 👥 System Roles
1. **Admin**: Has master control. Can trigger automatic Timetable Generation, run AI Conflict Detections, define Base entities (Rooms, Faculties, Courses), and clear the system configuration.
2. **Faculty**: Reads a personalized dashboard restricting their timetable view specifically to classes they teach. Can log leave requests and manage daily capacity.
3. **Student**: Limited access dashboard meant strictly to view the final published timeline for their registered sections.

## 📂 Folder Structure
```text
📦 Automated-Timetable-...
 ┣ 📂 frontend1                   # Next.js UI Application
 ┃ ┣ 📂 public                    # Static assets
 ┃ ┣ 📂 src
 ┃ ┃ ┣ 📂 app                     # Next.js App Router (Pages & Layouts)
 ┃ ┃ ┃ ┣ 📂 (admin)               # Protected Dashboard routes
 ┃ ┃ ┃ ┗ 📂 (auth)                # Login / Registration routes
 ┃ ┃ ┣ 📂 components              # Reusable React components (UI, Modals, Timetable)
 ┃ ┃ ┣ 📂 context                 # Global State (Auth, Theme, Sidebar)
 ┃ ┃ ┗ 📂 services                # Axios interceptors & backend API handlers
 ┃ ┗ 📜 package.json
 ┃
 ┣ 📂 timetable-backend-mern      # Node.js/Express API
 ┃ ┣ 📂 config                    # Database connection setup
 ┃ ┣ 📂 controllers               # Request handlers
 ┃ ┣ 📂 middleware                # JWT Auth & RBAC security checkpoints
 ┃ ┣ 📂 models                    # Mongoose Data Schemas (User, Timetable, Faculty)
 ┃ ┣ 📂 routes                    # Express API endpoints
 ┃ ┣ 📂 services                  # Business Logic (Generators, Resolvers)
 ┃ ┗ 📜 index.js                  # Main Express server entry point
 ┃
 ┗ 📜 RESTART-ALL.bat             # Quick-start script for Windows environments
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB Community Server (or an Atlas URI)
- Git

### 1. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd timetable-backend-mern
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root of `timetable-backend-mern`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/timetable
   JWT_SECRET=your_super_secret_jwt_key
   ```
4. Start the backend development server:
   ```bash
   npm start
   ```

### 2. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend1
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file in the root of `frontend1`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```
4. Start the Next.js development server:
   ```bash
   npm run dev
   ```

*(Alternatively, Windows users can simply double-click the `RESTART-ALL.bat` script located at the project root to instantly boot both servers sequentially.)*

## 💡 Usage Guide

**Bootstrapping the System:**
1. Navigate to `http://localhost:3000/login`.
2. Register an Admin account (`/register`).
3. Login and navigate to the underlying base data tabs (Courses, Faculties, Sections, Rooms, Timeslots) to populate your organization's base data constraints.
4. Navigate to the **Timetable** tab on the sidebar.
5. Click **Generate Timetable**. The engine will immediately compute millions of permutations, score them, and yield the topmost optimal variants.
6. Toggle between standard `List View` or `Calendar View` to browse results.
7. Click **Detect Conflicts** to verify the health of the output. 

## 🌍 Live Demo & Deployment

**Frontend:** [https://YOUR_VERCEL_URL.vercel.app](https://YOUR_VERCEL_URL.vercel.app)  
**Backend:** [https://YOUR_RENDER_URL.onrender.com](https://YOUR_RENDER_URL.onrender.com)

### Scan to view the Frontend!
*(Update the URL in the README file to instantly generate your working QR code)*
![Frontend QR Code](https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://YOUR_VERCEL_URL.vercel.app)

### Deployment Steps
**1. Backend (Render.com)**
- Create a new Web Service and link your GitHub repository.
- Root Directory: `timetable-backend-mern`
- Build Command: `npm install`
- Start Command: `npm start`
- Environment Variables: Add `MONGODB_URI` and `JWT_SECRET`.

**2. Frontend (Vercel.com)**
- Create a new Project and link your GitHub repository.
- Root Directory: `frontend1`
- Framework Preset: `Next.js`
- Environment Variables: Add `NEXT_PUBLIC_API_URL` pointing strictly to your Render backend URL with a `/api` attached at the end (e.g. `https://timetable-backend.onrender.com/api`).

## ⚖️ Automated Constraints & Scoring

The generator engine utilizes a normalized heuristic scoring function out of a base `1000` points.
* **Workload Balanced (Penalty)**: Penalizes high standard deviation among Faculty assignments (protects against one teacher taking 30 classes while another takes 5).
* **Gaps Penalty**: Reductions for non-compact daily faculty schedules (e.g. teaching at 9 AM and 4 PM with nothing in between).
* **Compactness Bonus**: Extra points for efficiently scheduled consecutive classes.
* **Room Utilization**: Incentivizes placing a high-capacity class inside a similarly sized room to avoid wasting large halls on small batches safely maximizing infrastructure usage.

---
*Developed for intelligent, friction-free modern academic scheduling.*

# DevOps & Deployment Documentation

This document outlines the Continuous Integration / Continuous Deployment (CI/CD) pipelines and production environments for the Automated Timetable Scheduling application.

## 🏗️ System Architecture Overview
- **Frontend Environment:** Vercel (Next.js / Vite)
- **Backend Environment:** Render (Node.js / Express)
- **Database:** MongoDB Atlas (DBaaS)

---

## 🚀 Backend Deployment (Render)

The backend Node.js application is deployed on **Render** as a Web Service.

### CI/CD Pipeline
The backend utilizes an **Automated CI/CD Pipeline** directly integrated with GitHub:
1. **Trigger:** A push or merge is made to the `main` branch of the GitHub repository.
2. **Detection:** Render's GitHub app automatically detects the new commit.
3. **Build Phase:** 
   - Render provisions a new build container.
   - Executes the Build Command: `npm install` to gather dependencies.
4. **Deploy Phase:** 
   - Once built, Render launches the application using the Start Command: `npm start` (which executes `node index.js`).
   - The deployment runs Health Checks on the exposed `PORT`.
   - If successful, traffic is safely routed to the new instance.

### Key Environment Variables
| Variable | Description |
| :--- | :--- |
| `MONGODB_URI` | Connection string to MongoDB Atlas. Includes credentials. |
| `JWT_SECRET` | Cryptographic key used for generating secure user sessions. |
| `PORT` | Listening port for the Express application. |

---

## 💻 Frontend Deployment (Vercel)

The frontend React application is deployed on **Vercel** using the Vercel CLI.

### CI/CD Pipeline
Because deployment is executed by a repository collaborator rather than the repository owner, the frontend utilizes a **Manual CLI CI/CD Pipeline**:
1. **Trigger:** The developer completes feature work locally in `/frontend1`.
2. **Build & Deploy Command:** The developer runs `vercel --prod` from the terminal.
3. **Build Phase:**
   - The Vercel CLI packages the local repository state.
   - Uploads the package securely to the developer's Vercel account.
   - Vercel provisions a build environment, executing Vite/Next.js optimizations.
4. **Deploy Phase:**
   - The built static assets and serverless functions are distributed globally across Vercel's Edge Network.
   - Environment variables are injected into the build.

### Key Environment Variables
| Variable | Description |
| :--- | :--- |
| `NEXT_PUBLIC_API_URL` | The secure `https://` endpoint routing to the Render backend (e.g., `https://timetable-backend-prod.onrender.com/api`). Must *not* contain a trailing slash to avoid 301 redirects that break CORS. |

---

## 🗄️ Database Infrastructure (MongoDB Atlas)

The primary data store is hosted securely on the cloud via **MongoDB Atlas**.
- **Security:** Access is strictly controlled via Network Access rules (IP Whitelists).
- **Integration:** The backend instances running on Render must have their outbound IP addresses allowed in Atlas to establish a connection.

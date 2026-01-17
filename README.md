# Ingenium - Green Career Platform

## 🌍 Project Overview
**Ingenium** (Green Career Platform) is a holistic academic and professional skill intelligence system designed to empower India's workforce for a net-zero future. It bridges the gap between aspirants and green economy roles by providing smart resume parsing, personalized course recommendations to bridge skill gaps, and integration with **Mission LiFE** (Lifestyle for Environment) to gamify sustainability.

### ✨ Key Features
- **Smart Resume Parsing**: Analyzes resumes to identify existing skills and potential job matches.
- **Job Intelligence**: Matches users with jobs based on skills and "LiFE Points" (sustainability score).
- **Skill Gap Analysis**: Automatically identifies missing skills for desired roles.
- **Smart Course Recommendations**: Suggests specific courses (NPTEL, etc.) to bridge those skill gaps.
- **Mission LiFE Integration**: Tracks and rewards real-world sustainable actions (e.g., using public transport, installing solar) with points that boost job eligibility.
- **Leaderboard & Badges**: Gamified progression from "Beginner" to "Planet Guardian".

## 🛠️ Tech Stack
- **Frontend**: React.js, Vite, TailwindCSS
- **Backend**: Python, Flask, SQLite
- **Database**: SQLite (local file `green_careers.db`)
- **Tools**: Axios, Lucide-React

## 🚀 Setup & How to Run Locally

### Prerequisites
- Node.js & npm
- Python 3.x & pip

### 1. Backend Setup
The backend runs on Flask and serves the API on port `5000`.

```bash
cd backend
pip install -r requirements.txt
python app.py
```
*The server will start at `http://localhost:5000` (and `0.0.0.0:5000`). Database will be auto-initialized.*

### 2. Frontend Setup
The frontend runs on Vite and serves the UI on port `5173`.

```bash
cd frontend
npm install
npm run dev
```
*The application will be accessible at `http://localhost:5173`.*

## 🔐 Environment Variables
No complex environment variables are required for local development. The application defaults to:
- Backend: `http://127.0.0.1:5000`
- Frontend Proxy: Configured in `vite.config.js` to redirect `/api` calls to the backend.

## 👥 Login Credentials
The system uses an **Auto-Registration** flow for the hackathon demo.
- **Email**: Enter *any* email address (e.g., `user@example.com`).
- **Name**: Enter any name.
- **Password**: Any password (not strictly enforced for demo).
*If the email doesn't exist, a new account is created instantly.*

## 🛡️ Error Handling
- **404**: APIs return JSON errors (`{"error": "User not found"}`) if resources aren't found.
- **Database**: The app handles missing databases by auto-creating `green_careers.db` on startup.
- **Network**: Frontend displays loading states; ensure backend is running if data is missing.

## 🤝 Repository Guidelines Compliance
- **Visibility**: This repository should be set to **Public** manually on GitHub.
- **Collaborators**: Please manually add `IEEE-Ahmedabad-University-SB-Official` as a contributor.
- **Secrets**: This repository contains **NO** secrets, private keys, or sensitive credentials. All configurations use defaults safe for public commits.

## 📄 License
MIT License
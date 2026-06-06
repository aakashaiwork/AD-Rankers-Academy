# AD Rankers Academy (Exam Prep App)

Mobile-first competitive exam preparation app (Testbook-style) with:

- **Student app**: authentication, mock tests with timer, study materials (PDF/images), video library, profile + leaderboard.
- **Admin features**: create tests, upload materials, add videos, bulk-upload tests from **Word/Excel**, manage categories/subjects.
- **Paid content plumbing**: free/paid flags, pricing + duration, subscription/purchase-based access checks.

## Tech Stack

- **Frontend**: Expo (React Native) + TypeScript, `expo-router`, React Navigation
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **Auth**: JWT + bcrypt

## Repo Structure

- **`backend/`**: FastAPI API server (`server.py`), Python deps (`requirements.txt`)
- **`frontend/`**: Expo app
- **`tests/`**, **`backend_test.py`**: API tests / reports (project-specific)

## Prerequisites

- **Node.js** (recommended: LTS)
- **Python 3.10+** (recommended)
- **MongoDB** connection string (local or Atlas)

## Environment Variables

Backend (in `backend/.env`):

- **`MONGO_URL`**: Mongo connection string
- **`DB_NAME`**: optional, defaults to `exam_app`
- **`JWT_SECRET`**: optional, defaults to `your-secret-key-change-in-production` (set this in real deployments)

Frontend (in `frontend/.env`):

- **`EXPO_PUBLIC_BACKEND_URL`**: base URL for backend, e.g. `http://localhost:8001`

## Running the Backend (FastAPI)

From the repo root:

```bash
python -m venv .venv
```

Activate venv:

```bash
# Windows (PowerShell)
.\.venv\Scripts\Activate.ps1
```

Install deps and start server:

```bash
pip install -r backend/requirements.txt
python backend/server.py
```

Backend starts on:

- `http://localhost:8001`
- API base: `http://localhost:8001/api`

## Running the Frontend (Expo)

```bash
cd frontend
npm install
npm start
```

Then run on:

- Expo Go (QR scan)
- Android emulator / iOS simulator
- Web (`w` in the Expo CLI)

## Default Admin Credentials (seeded)

- **Email**: `admin@exam.com`
- **Password**: `admin123`

## Major API Routes (Backend)

- **Auth**
  - `POST /api/register`
  - `POST /api/login`
- **Categories / Subjects**
  - `GET /api/categories`
  - `POST /api/categories` (admin)
  - `GET /api/subjects?categoryId=...`
- **Tests**
  - `GET /api/tests?categoryId=...&subjectId=...`
  - `GET /api/tests/{id}`
  - `POST /api/tests` (admin)
  - `POST /api/tests/submit?token=...`
  - `POST /api/tests/bulk-upload` (admin)
- **Materials / Videos**
  - `GET /api/materials?categoryId=...&subjectId=...`
  - `POST /api/materials` (admin)
  - `GET /api/videos?categoryId=...&subjectId=...`
  - `POST /api/videos` (admin)
- **Courses**
  - `GET /api/courses?categoryId=...&subjectId=...`
  - `GET /api/courses/{id}`
  - `POST /api/courses` (admin)
- **User / Admin**
  - `GET /api/profile?token=...`
  - `GET /api/leaderboard`
  - `GET /api/admin/stats?token=...`

## Bulk Test Upload Formats

Excel (`.xlsx`) columns:

- `Question | Option A | Option B | Option C | Option D | Correct Answer (1-4) | Marks`

Word (`.docx`) format:

```text
Q. Question text
A) Option 1
B) Option 2*
C) Option 3
D) Option 4
```

(`*` marks the correct answer)

## Notes

- The frontend reads the backend base URL from `EXPO_PUBLIC_BACKEND_URL`.
- Paid access is enforced by subscription/purchase checks in the backend and surfaced as `hasAccess` in content responses.

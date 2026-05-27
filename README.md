# The Code Fable

The Code Fable is a web application that analyzes public GitHub repositories and visualizes their structure as a "Code Fable" — a rich, interactive narrative dashboard.

## Architecture

- **Frontend:** React, Vite, TailwindCSS, and `react-force-graph-2d` (D3.js) for graph visualization.
- **Backend:** Python, FastAPI, Celery, Redis.
- **AI:** Google Gemini for narrative generation and architecture summaries.

## How to Run

### Option 1: Docker (Recommended)

The easiest way to run the entire project is using Docker Compose, which sets up all services (backend, frontend, worker, and Redis) automatically.

**Prerequisites:** Create a `.env` file in the project root with your API keys:

```bash
GITHUB_TOKEN=your_github_personal_access_token
LLM_API_KEY=your_google_gemini_api_key
```

Then start the services:

```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

**Access the application:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000

**Useful Docker commands:**
```bash
# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v

# Restart a specific service
docker-compose restart backend
```

### Option 2: Manual Setup

#### Prerequisites

- Python 3.11+
- [uv](https://docs.astral.sh/uv/) (Python package manager)
- Node.js 20+
- Redis running locally on port 6379

#### 1. Backend

```bash
cd backend
uv sync
source .venv/bin/activate
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`.

#### 2. Frontend

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

#### 3. Celery Worker

In a third terminal (Redis must be running):

```bash
cd backend
source .venv/bin/activate
celery -A worker.worker.celery_app worker --loglevel=info
```

#### Environment Variables

Create a `backend/.env` file with the following:

```bash
GITHUB_TOKEN=your_github_personal_access_token
LLM_API_KEY=your_google_gemini_api_key
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0
REDIS_URL=redis://localhost:6379/0
```

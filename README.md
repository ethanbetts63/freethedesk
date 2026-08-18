# Free the Desk

Free the Desk is a dealer and operations-systems studio. This repository uses the
same core split as Bloomprint: a Django REST API and a Next.js frontend.

## Local setup

### Backend

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
Copy-Item .env.example .env
.\.venv\Scripts\python.exe manage.py migrate
.\.venv\Scripts\python.exe manage.py runserver
```

The backend runs at `http://127.0.0.1:8000`; its health endpoint is
`http://127.0.0.1:8000/api/health/`.

### Frontend

```powershell
Set-Location frontend
npm.cmd install
npm.cmd run dev
```

The homepage runs at `http://localhost:3000`. Requests to `/api/*` are proxied to
the Django server through `DJANGO_API_URL` (which defaults to the local backend).


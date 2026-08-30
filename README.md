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

## Admin dashboard

Apply the migrations and create the staff account used to sign in:

```powershell
.\.venv\Scripts\python.exe manage.py migrate
.\.venv\Scripts\python.exe manage.py createsuperuser
```

With both development servers running, open `http://localhost:3000/login`.
The dashboard contains the colour-coded enquiry queue, enquiry detail and status
editing, outbound message history, and an email composer with attachments.

## Enquiry notifications

The public form always saves the enquiry before attempting either notification.
Email and SMS attempts are retained in the dashboard, including failures.

Copy the notification settings from `.env.example` into `.env`, configure the
Mailgun and Twilio credentials, set `ADMIN_EMAIL` and `ADMIN_NUMBER`, then change:

```dotenv
NOTIFICATIONS_ENABLED=True
```

Leave delivery disabled until the Mailgun sending domain is verified and the
Twilio messaging service or sending number is ready. `ADMIN_NUMBER` should use
E.164 format, for example `+61400111222`.

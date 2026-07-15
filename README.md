# CareerCanvas — AI Resume Builder

A full-stack AI resume builder with a React/Vite interface and Django backend. Users choose from Modern, Classic, and Minimal templates, enter their career details, generate stronger resume content with Groq, and save the finished resume as a PDF.

## Features

- Three responsive, printable resume templates
- Guided personal details, experience, education, and skills form
- Groq AI rewriting with fact-preserving prompt rules
- Fully functional demo fallback when no AI key is configured
- A4 print/PDF export
- One-service production setup for Render or Railway
- API health check and Django tests

## Run locally

Requirements: Node.js 20+, Python 3.11+.

1. Create and activate a virtual environment.
2. Install backend packages: pip install -r requirements.txt
3. Install frontend packages: npm install
4. Copy .env.example to .env and optionally add a free Groq API key.
5. Start Django: python manage.py runserver
6. In a second terminal, start React: npm run dev
7. Open http://localhost:5173

Environment files are not loaded automatically by Django. Set variables in your shell or IDE.

## Deploy to Render

1. Push this repository to GitHub.
2. In Render, choose New > Blueprint and select the repository.
3. Render reads render.yaml. Enter GROQ_API_KEY when prompted.
4. Deploy and open the generated Render URL.

The app still runs in demo mode without an API key.

## Deploy to Railway

1. Push the repository to GitHub and create a Railway project from it.
2. Railway reads railway.toml.
3. Add DJANGO_SECRET_KEY, DEBUG=False, ALLOWED_HOSTS=*, and GROQ_API_KEY in Variables.
4. Generate a public domain in Railway networking settings.

## API

- GET /api/health/ — service and AI configuration status
- POST /api/generate/ — validates input and returns the enhanced resume

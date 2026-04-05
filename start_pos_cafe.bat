@echo off
echo Starting POS Cafe Backend...
start cmd /k "cd pos_backend && venv\Scripts\activate && python manage.py runserver"

echo Starting POS Cafe Frontend...
start cmd /k "cd pos_frontend && npm run dev"

echo POS Cafe servers have been started successfully!
echo You can access the application at http://localhost:5173
pause

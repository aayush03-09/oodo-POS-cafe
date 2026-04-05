# Odoo POS Cafe

A comprehensive Point of Sale (POS) system for cafe management, built with Django REST Framework (Backend) and React + Vite (Frontend).

## Features

- **Admin/Manager Portal**: Manage products, categories, floor plans, and view analytics.
- **Staff Portal**: Take orders for tables, send them to the kitchen, and process payments.
- **Kitchen Display System**: Real-time view of orders sent from the staff portal.
- **Customer Self-Order**: Allow customers to place their own orders directly (if configured).

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Django, Django REST Framework, Channels (for WebSockets)

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/aayush03-09/oodo-POS-cafe.git
   cd oodo-POS-cafe
   ```

2. **Run the Project**
   You can easily start both the backend and frontend at the same time using the provided start script:
   ```cmd
   start_pos_cafe.bat
   ```

If you prefer to start them manually:

### Backend
```bash
cd pos_backend
# Activate your virtual environment
venv\Scripts\activate
# Install dependencies (if not already installed)
pip install -r requirements.txt
# Run the server
python manage.py runserver
```

### Frontend
```bash
cd pos_frontend
npm install
npm run dev
```

## System Requirements
- Node.js (v16+)
- Python (3.9+)

## Note
Ensure the backend is running before accessing the frontend so API calls behave as expected.

# POS Cafe — Complete File & Folder Guide

## Backend Structure (`pos_backend/`)

```
pos_backend/
├── manage.py                          ← Django entry point (runserver, migrate, seed)
├── requirements.txt                   ← Python packages (Django, DRF, MySQL, channels, etc.)
├── pos_backend/                       ← Project config
│   ├── settings.py                    ← DB connection, installed apps, JWT config, CORS, timezone
│   ├── urls.py                        ← Master URL router → maps /api/* to each app
│   ├── asgi.py                        ← WebSocket server config (for Kitchen real-time)
│   └── wsgi.py                        ← Standard WSGI entry
└── apps/                              ← All Django apps (one per feature)
    ├── authentication/                ← 🔐 Login & Users
    ├── products/                      ← 🍕 Menu items
    ├── floors/                        ← 🏢 Floors & Tables
    ├── orders/                        ← 📋 Orders, Items, Payments
    ├── kitchen/                       ← 🍳 Kitchen order processing
    ├── bookings/                      ← 📅 Table reservations
    ├── reports/                       ← 📊 Dashboard & Sales reports
    ├── payment_methods/               ← 💳 Cash/UPI/Digital config
    └── sessions/                      ← POS sessions (open/close register)
```

---

## Each App — File by File

Every app follows the same Django pattern:

| File | Purpose |
|------|---------|
| [models.py](file:///c:/Users/shaha/OneDrive/Desktop/pos_cafe/pos_backend/apps/orders/models.py) | Database table definition (columns, types, relationships) |
| [serializers.py](file:///c:/Users/shaha/OneDrive/Desktop/pos_cafe/pos_backend/apps/floors/serializers.py) | Converts Python objects ↔ JSON for API |
| [views.py](file:///c:/Users/shaha/OneDrive/Desktop/pos_cafe/pos_backend/apps/floors/views.py) | API logic — handles HTTP requests, queries DB, returns response |
| [urls.py](file:///c:/Users/shaha/OneDrive/Desktop/pos_cafe/pos_backend/pos_backend/urls.py) | Maps URL paths to view functions |
| [apps.py](file:///c:/Users/shaha/OneDrive/Desktop/pos_cafe/pos_backend/apps/floors/apps.py) | App registration config |
| `admin.py` | Django admin panel registration |

---

### 1. `apps/authentication/` — 🔐 Users & Login

| File | What it does |
|------|-------------|
| [models.py](file:///c:/Users/shaha/OneDrive/Desktop/pos_cafe/pos_backend/apps/authentication/models.py) | `users` table — username, password, **role** (admin/staff/kitchen) |
| [views.py](file:///c:/Users/shaha/OneDrive/Desktop/pos_cafe/pos_backend/apps/authentication/views.py) | `POST /api/auth/login/` → validates credentials, returns JWT token |
| [serializers.py](file:///c:/Users/shaha/OneDrive/Desktop/pos_cafe/pos_backend/apps/authentication/serializers.py) | Converts User object to JSON (id, username, role) |
| [management/commands/seed_data.py](file:///c:/Users/shaha/OneDrive/Desktop/pos_cafe/pos_backend/apps/authentication/management/commands/seed_data.py) | Creates demo users + products + tables + payment methods |

> **Effect**: Controls who can log in and what portal they see (Manager/Staff/Kitchen)

---

### 2. `apps/products/` — 🍕 Menu Items

| File | What it does |
|------|-------------|
| [models.py](file:///c:/Users/shaha/OneDrive/Desktop/pos_cafe/pos_backend/apps/products/models.py) | `products` table (name, price, category) + `categories` table |
| [views.py](file:///c:/Users/shaha/OneDrive/Desktop/pos_cafe/pos_backend/apps/products/views.py) | `GET /api/products/` — menu list; `POST` — add product (Manager) |
| [urls.py](file:///c:/Users/shaha/OneDrive/Desktop/pos_cafe/pos_backend/apps/products/urls.py) | Routes: `/api/products/`, `/api/categories/` |

> **Effect**: What Staff sees on the menu when creating orders

---

### 3. `apps/floors/` — 🏢 Floors & Tables

| File | What it does |
|------|-------------|
| [models.py](file:///c:/Users/shaha/OneDrive/Desktop/pos_cafe/pos_backend/apps/floors/models.py) | `floors` table (name) + `tables` table (table_number, seats, floor FK) |
| [views.py](file:///c:/Users/shaha/OneDrive/Desktop/pos_cafe/pos_backend/apps/floors/views.py) | `GET /api/floors/` — returns floors with nested tables |
| [urls.py](file:///c:/Users/shaha/OneDrive/Desktop/pos_cafe/pos_backend/apps/floors/urls.py) | Route: `/api/floors/` |

> **Effect**: Staff selects a table from here when placing orders. Manager can add/edit floors & tables.

---

### 4. `apps/orders/` — 📋 Core Order System

| File | What it does |
|------|-------------|
| [models.py](file:///c:/Users/shaha/OneDrive/Desktop/pos_cafe/pos_backend/apps/orders/models.py) | **3 tables**: [orders](file:///c:/Users/shaha/OneDrive/Desktop/pos_cafe/pos_backend/apps/kitchen/views.py#11-19) (status, payment_status), `order_items` (product, qty, price), `payments` (method, amount) |
| [views.py](file:///c:/Users/shaha/OneDrive/Desktop/pos_cafe/pos_backend/apps/orders/views.py) | **7 endpoints**: create order, send to kitchen, mark served, process payment, generate receipt |
| [serializers.py](file:///c:/Users/shaha/OneDrive/Desktop/pos_cafe/pos_backend/apps/orders/serializers.py) | Converts Order → JSON with nested items, payments, totals |
| [urls.py](file:///c:/Users/shaha/OneDrive/Desktop/pos_cafe/pos_backend/apps/orders/urls.py) | All order routes |

**Key API endpoints**:
| Endpoint | Who uses it | What it does |
|----------|------------|-------------|
| `POST /api/orders/` | Staff | Creates order with items |
| `POST /api/orders/{id}/send-to-kitchen/` | Staff | Changes status → `sent`, pushes via WebSocket |
| `PATCH /api/orders/{id}/mark-served/` | Staff | Changes status → [served](file:///c:/Users/shaha/OneDrive/Desktop/pos_cafe/pos_backend/apps/orders/views.py#121-132) |
| `POST /api/orders/{id}/pay/` | Staff | Creates payment record, sets `payment_status=done` |
| `GET /api/orders/{id}/receipt/` | Staff | Returns itemized receipt data |

> **Effect**: This is the heart of the system. Every order flows through here.

---

### 5. `apps/kitchen/` — 🍳 Kitchen Processing

| File | What it does |
|------|-------------|
| [views.py](file:///c:/Users/shaha/OneDrive/Desktop/pos_cafe/pos_backend/apps/kitchen/views.py) | `GET /api/kitchen/orders/` — returns sent+preparing orders; `PATCH .../status/` — updates order status |
| [urls.py](file:///c:/Users/shaha/OneDrive/Desktop/pos_cafe/pos_backend/apps/kitchen/urls.py) | Routes under `/api/kitchen/` |

**Status flow**:
```
sent (Pending) → preparing (Cooking) → served (Prepared)
```

> **Effect**: Kitchen marks cooking progress. Status changes appear on Manager Dashboard.

---

### 6. `apps/bookings/` — 📅 Reservations

| File | What it does |
|------|-------------|
| [models.py](file:///c:/Users/shaha/OneDrive/Desktop/pos_cafe/pos_backend/apps/bookings/models.py) | `bookings` table — customer, party size, table, date, time slot, status |
| [views.py](file:///c:/Users/shaha/OneDrive/Desktop/pos_cafe/pos_backend/apps/bookings/views.py) | CRUD + status update + calendar + Gantt chart + 30-day history |
| [urls.py](file:///c:/Users/shaha/OneDrive/Desktop/pos_cafe/pos_backend/apps/bookings/urls.py) | Routes under `/api/bookings/` |

> **Effect**: Manager creates/manages table reservations, views Gantt chart of table slots

---

### 7. `apps/reports/` — 📊 Dashboard & Analytics

| File | What it does |
|------|-------------|
| [views.py](file:///c:/Users/shaha/OneDrive/Desktop/pos_cafe/pos_backend/apps/reports/views.py) | `GET /api/reports/dashboard/` — today's profit, orders, payment status, booking stats, live order board. Also: sales report, PDF/XLS export |
| [urls.py](file:///c:/Users/shaha/OneDrive/Desktop/pos_cafe/pos_backend/apps/reports/urls.py) | Routes under `/api/reports/` |

> **Effect**: Powers the entire Manager Dashboard — stat cards, charts, order table, booking calendar

---

### 8. `apps/payment_methods/` — 💳 Payment Config

| File | What it does |
|------|-------------|
| [models.py](file:///c:/Users/shaha/OneDrive/Desktop/pos_cafe/pos_backend/apps/payment_methods/models.py) | `payment_methods` table — name (Cash/Digital/UPI), is_enabled |
| [views.py](file:///c:/Users/shaha/OneDrive/Desktop/pos_cafe/pos_backend/apps/payment_methods/views.py) | CRUD for payment methods |

> **Effect**: Controls what payment options Staff sees (Cash, Digital, UPI)

---

### 9. `apps/sessions/` — POS Sessions

| File | What it does |
|------|-------------|
| [models.py](file:///c:/Users/shaha/OneDrive/Desktop/pos_cafe/pos_backend/apps/sessions/models.py) | `pos_sessions` table — open/close register with opening balance |
| [views.py](file:///c:/Users/shaha/OneDrive/Desktop/pos_cafe/pos_backend/apps/sessions/views.py) | Open/close POS sessions from Terminal page |

> **Effect**: Manager can open/close the cash register from the Terminal page

---

## Master URL Router

[urls.py](file:///c:/Users/shaha/OneDrive/Desktop/pos_cafe/pos_backend/pos_backend/urls.py) connects everything:

```
/api/auth/*          → authentication app
/api/products/*      → products app
/api/floors/*        → floors app
/api/orders/*        → orders app
/api/kitchen/*       → kitchen app
/api/bookings/*      → bookings app
/api/reports/*       → reports app
/api/payment-methods/* → payment_methods app
/api/sessions/*      → sessions app
```

---

## Frontend Structure (`pos_frontend/src/`)

```
src/
├── App.jsx              ← All routes (admin, staff, kitchen)
├── api/axios.js         ← Axios instance with JWT token
├── context/AuthContext.jsx ← Login state, role-based redirect
├── components/
│   ├── Navbar.jsx       ← Manager sidebar navigation
│   └── ProtectedRoute.jsx ← Role-based route guard
├── pages/
│   ├── Login.jsx        ← Login page (all roles)
│   ├── admin/           ← Manager Portal
│   │   ├── Dashboard.jsx    ← Stats + live orders + charts
│   │   ├── Bookings.jsx     ← Booking CRUD + Gantt
│   │   ├── Products.jsx     ← Menu management
│   │   ├── Categories.jsx   ← Category management
│   │   ├── Floors.jsx       ← Floor & table management
│   │   ├── PaymentMethods.jsx ← Payment config
│   │   ├── Terminal.jsx     ← POS sessions
│   │   └── Reports.jsx      ← Sales reports + export
│   ├── staff/           ← Staff Portal
│   │   ├── StaffOrders.jsx  ← Table select → menu → cart → place order
│   │   ├── StaffPayment.jsx ← Cash/Digital/UPI → mark done
│   │   └── Receipt.jsx      ← Itemized printable receipt
│   └── kitchen/         ← Kitchen Portal
│       └── KitchenDisplay.jsx ← Order cards (Pending/Cooking/Prepared)
```

---

## How Data Flows Between Files

```
Staff clicks "Place Order"
  → StaffOrders.jsx calls POST /api/orders/
  → orders/views.py → INSERT into orders + order_items tables
  → StaffOrders.jsx calls POST /api/orders/{id}/send-to-kitchen/
  → orders/views.py → UPDATE orders.status=sent + WebSocket push
  → KitchenDisplay.jsx receives order via WebSocket
  → Kitchen clicks "Start Cooking"
  → KitchenDisplay.jsx calls PATCH /api/kitchen/orders/{id}/status/
  → kitchen/views.py → UPDATE orders.status=preparing
  → Manager Dashboard auto-refreshes GET /api/reports/dashboard/
  → reports/views.py → queries orders table → returns to Dashboard.jsx
```

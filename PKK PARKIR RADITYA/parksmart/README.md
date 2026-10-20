# ParkSmart — Sistem Manajemen Parkir

Enterprise-grade parking management system built with React + Node.js + MySQL.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Tailwind CSS, Recharts, React Query |
| Backend | Node.js, Express |
| Database | MySQL |
| Auth | JWT (JSON Web Token) |
| Fonts | Sora (headings), DM Sans (body) |

---

## Project Structure

```
parksmart/
├── database/
│   └── schema.sql          # Full DB schema + seed data
├── backend/
│   ├── config/db.js         # MySQL connection pool
│   ├── controllers/         # Business logic
│   ├── middleware/auth.js   # JWT middleware
│   ├── routes/              # Express routes
│   ├── server.js            # Entry point
│   ├── .env                 # Environment variables
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/      # Layout, Sidebar, Header
    │   ├── context/         # AuthContext (JWT)
    │   ├── lib/             # API client, utils
    │   └── pages/           # All page components
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## Setup Instructions

### 1. Database

1. Start MySQL (via XAMPP or standalone)
2. Open phpMyAdmin or MySQL CLI
3. Run the schema file:

```sql
source parksmart/database/schema.sql
```

Or import via phpMyAdmin: `parksmart/database/schema.sql`

### 2. Backend

```bash
cd parksmart/backend
npm install
```

Copy and configure environment:
```bash
copy .env.example .env
```

Edit `.env`:
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=        # your MySQL password
DB_NAME=parksmart
JWT_SECRET=parksmart_super_secret_key_change_in_production
JWT_EXPIRES_IN=24h
```

Start the backend:
```bash
npm run dev     # development (nodemon)
npm start       # production
```

Backend runs at: `http://localhost:5000`

### 3. Frontend

```bash
cd parksmart/frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:3000`

---

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@parksmart.id | password |
| Operator | operator@parksmart.id | password |
| User | user@parksmart.id | password |

> Note: The seed data uses bcrypt hash for "password". If login fails, re-hash using:
> `node -e "const b=require('bcryptjs'); b.hash('password',10).then(console.log)"`
> Then update the users table manually.

---

## Features

### Authentication
- JWT login/register
- Role-based access: Admin, Operator, User
- Auto-redirect on token expiry

### Admin Dashboard
- Summary cards: total slots, available, occupied, revenue today
- Real-time slot occupancy bar
- Revenue chart (daily/weekly/monthly) with Recharts
- Recent transactions table

### Check-In (Operator/Admin)
- Input plate number manually
- Auto-detect vehicle type if already registered
- Auto-assign nearest available slot
- Print ticket with slot info and check-in time

### Check-Out & Payment (Operator/Admin)
- Lookup by plate number or transaction ID
- Auto-calculate duration and fee
- Select payment method: Cash / QRIS / Transfer
- Release slot back to available

### Slot Management (Admin)
- Visual grid per floor with color coding
- Add, edit, delete slots
- Change slot status manually (hover to reveal controls)

### Transaction History (Admin/Operator)
- Full list with filters: date range, vehicle type, payment status
- Pagination
- Detail modal per transaction
- Export to CSV

### Tariff Management (Admin)
- Set rates per vehicle type
- Fields: first_hour_rate, next_hour_rate, daily_max
- Live Rupiah preview

### User Portal
- View own parking history
- Register and manage personal vehicles

---

## Fee Calculation Logic

```
if duration <= 60 min:
    fee = first_hour_rate

elif duration > 60 min:
    fee = first_hour_rate + ceil((duration - 60) / 60) * next_hour_rate

if duration >= 480 min (8 hours):
    fee = daily_max

fee = min(fee, daily_max)
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/login | — | Login |
| POST | /api/auth/register | — | Register |
| GET | /api/auth/profile | Any | Get profile |
| GET | /api/dashboard/summary | Admin/Op | Dashboard stats |
| GET | /api/dashboard/revenue-chart | Admin/Op | Revenue chart data |
| GET | /api/slots | Any | List slots |
| GET | /api/slots/map | Any | Slot map grouped by floor |
| POST | /api/slots | Admin | Create slot |
| PUT | /api/slots/:id | Admin | Update slot |
| PATCH | /api/slots/:id/status | Admin/Op | Update slot status |
| DELETE | /api/slots/:id | Admin | Delete slot |
| POST | /api/transactions/checkin | Admin/Op | Check-in |
| POST | /api/transactions/checkout | Admin/Op | Check-out |
| GET | /api/transactions/lookup/:id | Admin/Op | Lookup active transaction |
| GET | /api/transactions | Admin/Op | All transactions |
| GET | /api/transactions/my | Any | My transactions |
| GET | /api/tariffs | Any | Get tariffs |
| POST | /api/tariffs | Admin | Upsert tariff |
| GET | /api/vehicles/my | Any | My vehicles |
| POST | /api/vehicles | Any | Register vehicle |
| GET | /api/users | Admin | All users |

---

## Notes

- All timestamps use WIB timezone (Asia/Jakarta, UTC+7)
- Slot code format: A-01, B-12, C-05
- Currency displayed in Rupiah (Rp)
- Frontend proxies `/api` to `http://localhost:5000` via Vite

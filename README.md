# DCLM-Ghana Entrepreneurship Database

A web application for collecting and managing entrepreneur data across DCLM-Ghana zones, regions, and divisions.

## Live URL

https://ent.dclmgh-report.com/

## Tech Stack

| Layer    | Technology                                  |
| -------- | ------------------------------------------- |
| Frontend | React 18, Axios                             |
| Backend  | Python 3.11, FastAPI, SQLAlchemy, Pydantic  |
| Database | MySQL (via PyMySQL)                         |
| Deploy   | Docker multi-stage build                    |

## Project Structure

```
.
├── frontend/
│   ├── src/
│   │   └── App.js              # Form UI, live validation, state, submission
│   ├── public/
│   │   ├── dclmlogo.JPG        # Organization logo
│   │   └── qr_code.png         # QR code linking to live form
│   └── package.json
├── backend/
│   ├── main.py                 # FastAPI app, POST endpoint, static mount
│   ├── models.py               # SQLAlchemy ORM model (SheetData)
│   ├── schemas.py              # Pydantic request schema
│   ├── database.py             # MySQL connection via SQLAlchemy
│   ├── config.py               # Settings (DB credentials, CORS origins)
│   ├── requirements.txt        # Python dependencies
│   ├── static/                 # Built frontend served by FastAPI
│   └── .env                    # Environment variables (git-ignored)
├── Dockerfile                  # Multi-stage: Node build + Python runtime
├── docker-compose.yml          # Container orchestration
├── qr_code.png                 # QR code for the live form
└── .gitignore
```

## Form Fields

### Section 1 — Region & Pastor's Information

| Field             | Type   | Notes                                    |
| ----------------- | ------ | ---------------------------------------- |
| Zone              | Select | 7 zones, cascading                       |
| Region            | Select | Populated based on selected zone         |
| Division          | Select | Populated based on selected region       |
| Pastor's Name     | Text   | Required, no numbers                     |
| Pastor's Contact  | Tel    | Required, exactly 10 digits, character counter |

### Section 2 — Entrepreneur Details

| Field                | Type   | Notes                                    |
| -------------------- | ------ | ---------------------------------------- |
| Full Name            | Text   | Required, no numbers                     |
| Phone / WhatsApp     | Tel    | Required, exactly 10 digits, character counter |
| Business Type        | Select | Required, 16 industry categories         |
| Business Name        | Text   | Required                                 |
| Location of Business | Text   | Required, placeholder: "City, Town, District" |
| Sector               | Select | Agriculture, Tech/ICT, Trading/SME, Education, Manufacturing, Real Estate, Mining, Other |
| Years in Business    | Select | <1yr, 1-3yrs, 3-5yrs, 5+yrs             |
| Available to Mentor? | Select | Yes / No                                 |

### Business Type Options

1. Agriculture & Agribusiness
2. Manufacturing & Production
3. Construction & Real Estate
4. Retail & Wholesale Trade
5. Information Technology & Digital Services
6. Finance, Banking & Insurance
7. Education & Training
8. Health & Wellness
9. Hospitality, Food & Tourism
10. Beauty & Fashion
11. Transportation & Logistics
12. Media, Arts & Entertainment
13. Professional Services (Law, Accounting, Consulting)
14. Creative & Crafts Industry
15. Import & Export
16. Renewable Energy & Environmental Services

## Features

- **Live validation** — field-level errors appear on blur and update as you type
- **Character counters** — phone fields show `0/10` → `10/10` progress with color feedback (amber near limit, red at max)
- **Cascading selects** — Zone → Region → Division with automatic reset on parent change
- **Professional UI** — dark header, gradient section banners, numbered sections, fade-in animations
- **QR code** — embedded in header for quick mobile access
- **Submit-time validation** — all fields are checked on submit with a scrollable error list
- **Duplicate protection** — backend deduplicates via MD5 hash of the entire payload

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- MySQL database

### Frontend Development

```bash
cd frontend
npm install
npm start
```

Runs on `http://localhost:3000`. Proxies API requests to the backend.

### Backend Development

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8099 --reload
```

### Build & Deploy Locally

```bash
cd frontend
npm run build
# Copy build output to backend/static/
Remove-Item -Recurse -Force backend\static\*
Copy-Item -Recurse frontend\build\* backend\static\
```

Then open `http://localhost:8099`.

### Environment Variables

Create `backend/.env`:

```
DB_HOST=your-mysql-host
DB_PORT=3306
DB_USER=your-username
DB_PASSWORD=your-password
DB_NAME=entrepreneur
```

## Docker Deployment

```bash
docker compose up --build
```

The Dockerfile uses a multi-stage build:

1. **Stage 1** — Builds the React frontend (`npm run build`)
2. **Stage 2** — Installs Python dependencies, copies the built frontend into `static/`, runs Uvicorn on port 8099

The app is served as a single FastAPI process that handles both the API and the static frontend.

## API Endpoint

```
POST /api/add-to-sheet/
```

Accepts a JSON body matching the form fields. Deduplicates submissions using an MD5 hash of the payload. Returns `{ "status": "success", "message": "..." }`.

## Database

The `sheet_data` table is created automatically on startup via `Base.metadata.create_all()`. To add the `entrepreneur_business_type` column to an existing table:

```sql
ALTER TABLE sheet_data
ADD COLUMN entrepreneur_business_type VARCHAR(255) AFTER entrepreneur_business_name;
```

To rename the old column:

```sql
ALTER TABLE sheet_data
CHANGE entrepreneur_business_name_type entrepreneur_business_name VARCHAR(255);
```

## License

ISC

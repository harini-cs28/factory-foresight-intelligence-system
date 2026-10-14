# Factory Foresight Intelligence System (FFIS) - Backend

AI-powered predictive maintenance and decision-support platform for textile manufacturing.

> *Note: Prototype recommendation generated from the synthetic textile manufacturing dataset.*

---

## 1. Project Overview & Architecture

FFIS provides real-time health telemetry, remaining useful life (RUL) estimation, cascade failure impact modeling, and prescriptive decision support across textile manufacturing production lines (Spinning, Carding, Drawing, Ring Frame, Weaving, Dyeing, Finishing, and Packing).

```
FFIS/
├── backend/
│   ├── app/
│   │   ├── api/                 # API routers
│   │   │   ├── auth.py          # /api/auth/login, /api/auth/me, /api/auth/protected
│   │   │   ├── impact.py        # /api/impact/{machine_id}
│   │   │   ├── maintenance.py   # /api/maintenance/recommendations/{machine_id}
│   │   │   └── predictions.py   # /api/predictions/predict
│   │   ├── core/                # Configuration & security
│   │   │   ├── config.py        # Pydantic Settings & threshold configuration
│   │   │   └── security.py      # bcrypt password hashing & PyJWT token handling
│   │   ├── database/            # SQLAlchemy 2.x engine, Base, and session dependency
│   │   │   ├── base.py
│   │   │   ├── connection.py
│   │   │   └── session.py
│   │   ├── decision_engine/     # Explainable rule-based decision support layer
│   │   │   ├── priority_engine.py
│   │   │   ├── recommendation_engine.py
│   │   │   └── risk_engine.py
│   │   ├── impact/              # Machine dependency & BFS cascade analysis
│   │   │   ├── cascade_analyzer.py
│   │   │   └── dependency_graph.py
│   │   ├── ml/                  # ML pipeline & inference service
│   │   ├── models/              # SQLAlchemy database models
│   │   ├── schemas/             # Pydantic validation schemas
│   │   ├── services/            # Business, security & decision services
│   │   │   ├── auth_service.py
│   │   │   ├── decision_service.py
│   │   │   ├── impact_service.py
│   │   │   └── prediction_service.py
│   │   └── main.py              # FastAPI application entry point
│   ├── data/                    # Prototype dataset CSVs
│   │   ├── factory_context.csv
│   │   ├── machine_dependencies.csv
│   │   └── textile_machine_sensor_data.csv
│   ├── ml_models/               # Serialized ML artifacts (.joblib / .json)
│   ├── tests/                   # Pytest test suite (54 tests)
│   │   ├── test_auth.py
│   │   ├── test_database.py
│   │   ├── test_decision_engine.py
│   │   ├── test_health_and_db.py
│   │   ├── test_impact.py
│   │   └── test_ml.py
│   ├── init_db.py               # Database schema initialization script
│   ├── seed_users.py            # Development user seeding script
│   ├── train_models.py          # ML training and evaluation pipeline
│   ├── requirements.txt         # Python dependencies
│   ├── .env.example             # Environment template
│   └── .env                     # Local environment settings
└── frontend/                    # React / Vite web interface
```

---

## 2. Dataset Files

The system data layer utilizes three source CSV files located in `backend/data/`:
1. **`textile_machine_sensor_data.csv`**: 3,120 telemetry records across 12 textile machines (260 cycles each) with vibration, temperature, motor current, RPM, pressure, load, and ground-truth RUL/failure targets.
2. **`machine_dependencies.csv`**: Upstream/downstream machine topology mapping dependencies across Production Lines A, B, and C.
3. **`factory_context.csv`**: Machine criticality, technician availability, spare parts, repair hours, downtime cost (INR/hr), and maintenance windows.

---

## 3. Installation & Setup

### Prerequisites
- Python 3.11+
- PostgreSQL 14+ running locally or remotely

### 1. Install Dependencies
```powershell
pip install -r requirements.txt
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and configure your PostgreSQL database credentials:
```env
DATABASE_URL=postgresql+psycopg://postgres:YOUR_PASSWORD@localhost:5432/ffis_db
JWT_SECRET_KEY=change-this-later
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
FRONTEND_URL=http://localhost:5173
```

### 3. Initialize Database & Seed Users
```powershell
python init_db.py
python seed_users.py
```

### 4. Train ML Models
```powershell
python train_models.py
```

---

## 4. API Endpoints (Phase 6)

### Authentication
- `POST /api/auth/login` - Authenticate via email & password, returns JWT token & user profile
- `GET /api/auth/me` - Protected route returning profile for authenticated user
- `GET /api/auth/protected` - Verification endpoint requiring valid Bearer token

### Predictions & Telemetry Inference
- `POST /api/predictions/predict` - Real-time ML inference (Failure Risk + RUL + Health Status), persists prediction record to PostgreSQL

### Machine Dependency & Cascade Impact Analysis
- `GET /api/impact/{machine_id}` - BFS cascade analysis determining downstream affected assets, cascade levels, total estimated repair hours, and potential downtime cost

### Prescriptive Maintenance & Decision Support
- `GET /api/maintenance/recommendations/{machine_id}` - Generates an explainable prescriptive maintenance recommendation synthesizing ML predictions, cascade impact, technician & spare parts availability, and shift windows
- `GET /api/maintenance/recommendations/{machine_id}/history` - Retrieves chronological audit history of generated recommendations for the machine

### System & Health
- `GET /api/health` - Service health status
- `GET /api/health/database` - Validates PostgreSQL session connectivity (`SELECT 1`)
- `GET /` - Root welcome message & documentation link

---

## 5. Running Tests

Run the full pytest suite:
```powershell
python -m pytest -v
```

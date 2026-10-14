# Factory Foresight Intelligence System (FFIS)

An industrial-grade, AI-powered predictive maintenance and production risk intelligence platform built for modern manufacturing operations.

FFIS integrates physical equipment sensor telemetry, machine learning failure prediction, remaining useful life (RUL) regression, cross-machine cascade impact simulation, and automated prescriptive maintenance recommendations.

---

## 🌟 Distinct Role-Based Workspaces

FFIS delivers four specialized, purpose-built workspaces tailored to distinct factory roles:

| Workspace | Target Role | Primary Responsibility | Key Features |
| :--- | :--- | :--- | :--- |
| **System Control Center** | `ADMIN` | Platform & Asset Governance | User access & RBAC, machine registry configuration, ML model performance monitoring, system thresholds, and audit event logs. |
| **Factory Command Center** | `PLANT_MANAGER` | Factory-Wide Health & Executive Risk | Factory Health Index, critical machine watchlists, downtime risk quantification, production line status, and maintenance decision queues. |
| **Maintenance Intelligence** | `MAINTENANCE_ENGINEER` | Equipment Diagnostics & Work Orders | Prioritized inspection queues, live sensor gauges, SHAP explainability, RUL regression analysis, interactive work orders (`Pending` → `In Progress` → `Completed`), and service history. |
| **Production Risk Center** | `PRODUCTION_MANAGER` | Production Line Availability & Downtime Impact | Line-by-line health, bottleneck machine detection, shift maintenance windows, downstream idle impact modeling, and operational alert feeds. |

---

## 🏗️ Architecture & Technology Stack

### Backend
- **FastAPI**: High-performance asynchronous REST API.
- **PostgreSQL & SQLAlchemy**: Relational persistence for users, assets, telemetry, and work orders.
- **Scikit-Learn & Joblib**: Predictive models including Gradient Boosting for failure classification (98.88% accuracy) and Random Forest Regressor for Remaining Useful Life (5.29 cycles MAE).
- **NetworkX**: Directed dependency graph modeling for cross-machine cascade impact propagation.
- **JWT Authentication & RBAC**: Role-based access control protecting all administrative and operational endpoints.

### Frontend
- **React 18 & Vite**: Fast, responsive single-page application.
- **TypeScript**: Strict type safety across all models, API interfaces, and components.
- **Tailwind CSS**: Industrial yellow-and-white theme design system (`#F4B400`, `#D99A00`, `#FFFDF5`, `#1F2933`).
- **Lucide Icons**: Consistent industrial iconography.
- **Axios & React Router**: Secure HTTP communication with automatic token injection and role-guarded route navigation.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- PostgreSQL (v14+)

### 1. Database Setup
```bash
# In PostgreSQL, create the database
CREATE DATABASE ffis_db;
```

### 2. Backend Setup
```bash
cd backend

# Create and activate virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env with your PostgreSQL credentials

# Initialize database tables and seed default users
python init_db.py
python seed_users.py

# (Optional) Re-train ML models
python train_models.py

# Start FastAPI server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Default credentials seeded by `seed_users.py`:
- **Admin**: `admin@gmail.com` / `12345`
- **Plant Manager**: `manager@gmail.com` / `12345`
- **Maintenance Engineer**: `engineer@gmail.com` / `12345`
- **Production Manager**: `production@gmail.com` / `12345`

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env

# Start Vite development server
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## 📂 Project Structure

```
FFIS/
├── backend/
│   ├── app/
│   │   ├── api/             # FastAPI routers (auth, admin, machines, predictions, impact, maintenance)
│   │   ├── core/            # Config, security, database session
│   │   ├── models/          # SQLAlchemy ORM models
│   │   ├── schemas/         # Pydantic validation schemas
│   │   └── services/        # ML inference, cascade engine, simulator
│   ├── data/                # Factory context and dependency datasets
│   ├── ml_models/           # Serialized models and metadata
│   ├── tests/               # Test suites
│   ├── init_db.py           # Table initialization script
│   ├── seed_users.py        # Seed default role accounts
│   ├── train_models.py      # ML training pipeline
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios API client modules
│   │   ├── components/      # UI components by role (admin, plant-manager, maintenance-engineer, production-manager)
│   │   ├── context/         # AuthContext
│   │   ├── routes/          # AppRoutes and ProtectedRoute
│   │   └── types/           # TypeScript interfaces
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
└── README.md
```

---

## 🛡️ Security & Role Enforcement

- **Automatic Landing**: Users land directly on their assigned workspace (`/admin`, `/plant-manager`, `/maintenance-engineer`, `/production-manager`) upon verified authentication.
- **Route Guards**: Unauthorized direct URL entries are intercepted and redirected to the user's authorized home workspace.
- **Backend Authorization**: FastAPI dependencies verify JWT claims and enforce role permissions (`HTTP 401 Unauthorized` / `HTTP 403 Forbidden`).

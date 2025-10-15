# Event Planner Project – Planner → Post-Generation Technical Guide

## 📋 Project Overview

The **Event Planner** experience now targets a single mission: capture a campaign brief, curate data-backed plans, and deliver AI-generated posters. Everything in this document leans into that pipeline while explicitly leaving out social sharing or downstream distribution tooling.

---

## 🏗️ System Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   FRONTEND      │    │   BACKEND-NODE   │    │   BACKEND-PY    │
│   (React/Vite)  │◄──►│   (Node.js)      │◄──►│   (Python/FastAPI)│
│   Port: 5173    │    │   Port: 4000     │    │   Port: 1800    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
        │                        │                        │
        │                        │                        │
  └──── Planner UX ────────┼──── Auth Services ────┼──── Planner & Poster APIs
       Auth + 2FA           │     Subscriptions      │     Campaign Planning
  Plan Review          │     Account Support    │     Poster Generation
       Poster Preview       │     Service Gateway    │     Asset Harmonisation
```

---

## 🛠️ Technology Stack

### Frontend Technologies
- **React 18** - Modern JavaScript library for building user interfaces
- **Vite** - Fast build tool and development server
- **Axios** - HTTP client for API communication
- **Material-UI** - React component library for UI design
- **React Router** - Client-side routing

### Backend-Node Technologies
- **Node.js** - JavaScript runtime for server-side development
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database for data storage
- **Mongoose** - MongoDB object modeling library
- **JWT (jsonwebtoken)** - Authentication and authorization
- **bcryptjs** - Password hashing
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variable management

### Backend-Python Technologies
- **Python 3.9+** - Programming language
- **FastAPI** - Modern, fast web framework for building APIs
- **OpenAI** - GPT models for concept naming and poster prompts
- **Hugging Face FLUX** - Image generation backend for posters
- **Pydantic** - Data validation using Python type annotations
- **Uvicorn** - ASGI web server
- **CrewAI (optional)** - Legacy multi-agent toolkit, disabled unless `ENABLE_CREW_AI=1`

---

## 📁 Detailed Project Structure

### Frontend (`/frontend`)

```
frontend/
├── src/
│   ├── api/                 # API communication layer
│   │   ├── apiClient.js     # Axios configuration & base client
│   │   └── auth.js          # Authentication API functions
│   ├── auth/                # Authentication components
│   │   ├── SignIn.jsx       # Login form component
│   │   └── SignUp.jsx       # Registration form component  
│   ├── components/          # Reusable UI components
│   ├── pages/               # Main page components
│   │   └── Profile.jsx      # User profile page
│   └── main.jsx            # React app entry point
├── .env                     # Environment variables (local)
├── .env.example            # Environment template
├── package.json            # Dependencies & scripts
├── vite.config.js          # Vite configuration
└── index.html              # HTML template
```

#### Key Frontend Features Implemented:
- ✅ **Authentication System**: Login and registration forms
- ✅ **API Client Setup**: Centralized HTTP client with token management
- ✅ **Routing Structure**: Basic page navigation setup
- ✅ **Environment Configuration**: Development/production settings
- ✅ **CORS Integration**: Configured to communicate with both backends

#### Frontend API Integration:
```javascript
// Example: How frontend calls backend-node
const response = await api.post('/auth/login', { email, password });

// Environment variable usage
const baseURL = import.meta.env.VITE_API_BASE_URL; // http://localhost:4000/api
```

### Backend-Node (`/backend-node`)

```
backend-node/
├── src/
│   ├── auth/                    # Authentication module
│   │   ├── auth.routes.js       # Login/register endpoints
│   │   ├── protected.routes.js  # Protected API routes
│   │   └── middleware/
│   │       └── requireAuth.js   # JWT authentication middleware
│   ├── config/
│   │   └── database.js          # MongoDB connection setup
│   ├── models/
│   │   └── User.js             # User schema definition
│   ├── controllers/            # Business logic (empty - ready for expansion)
│   ├── middleware/             # Custom middleware (empty - ready for expansion)
│   ├── routes/                 # Additional routes (empty - ready for expansion)
│   └── utils/                  # Utility functions (empty - ready for expansion)
├── server.js                   # Express server entry point
├── .env                        # Environment variables
├── .env.example               # Environment template
└── package.json               # Dependencies & scripts
```

#### Key Backend-Node Features Implemented:
- ✅ **User Authentication**: JWT-based login/registration system
- ✅ **Password Security**: bcrypt hashing for passwords
- ✅ **Email Validation**: Server-side email format validation
- ✅ **Database Integration**: MongoDB with Mongoose ODM
- ✅ **CORS Configuration**: Cross-origin requests allowed
- ✅ **Protected Routes**: JWT middleware for secured endpoints
- ✅ **Environment Management**: Configurable settings

#### API Endpoints Available:
```javascript
// Authentication Routes
POST /api/auth/register  // User registration
POST /api/auth/login     // User login
GET  /api/me            // Get current user profile (protected)
```

#### Database Schema:
```javascript
// User Model (MongoDB)
{
  email: String (unique, required),
  passwordHash: String (required),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### Backend-Python (`/backend-py`)

```
backend-py/
├── main.py                 # FastAPI server with placeholder endpoints
├── requirements.txt        # Python dependencies
├── .env                   # Environment variables  
├── .env.example          # Environment template
├── config/               # Configuration files (ready for expansion)
│   └── settings.py       # App settings
├── models/               # Pydantic models (ready for expansion)
├── routers/              # API route modules (ready for expansion)
└── data/                 # Data files/templates (ready for expansion)
```

#### Key Backend-Python Features Implemented:
- ✅ **FastAPI Framework**: Async API host for planner and design workflows
- ✅ **Planner Service**: Campaign plan generation, dynamic cost recalculation, and timeline compression
- ✅ **Provider Bridge**: Surfaces curated provider data from the internal catalog (Mongo-backed)
- ✅ **Poster Pipeline**: FLUX background generation, harmonisation endpoints, and Cloudinary upload support
- ✅ **AI Concept Naming**: OpenAI generates concept titles & taglines during planner creation with resilient fallbacks
- ✅ **Poster Prompt Orchestration**: OpenAI enriches FLUX background and harmonisation prompts while retaining heuristic backups
- ✅ **Health Monitoring**: `/health` and `/status` endpoints for readiness probes
- ✅ **Environment Loading**: Shared `.env` discovery so both backends stay in sync

#### Planner & design API surface (current focus):
```python
# Campaign planning
POST /campaigns/{campaign_id}/planner/generate      # Produce concepts with AI titles/taglines, costs, timeline
POST /campaigns/{campaign_id}/planner/update-costs  # Recalculate costs for selected concept/venue
POST /campaigns/{campaign_id}/planner/select        # Persist the concept/providers chosen by the user

# Provider support
GET  /planner/providers/venue                       # Mongo-backed venue listings
GET  /planner/providers/music                       # Solo musicians and ensembles
GET  /planner/providers/lighting                    # Lighting specialists
GET  /planner/providers/sound                       # Sound engineers

# Event context persistence
POST /api/event-context/save                        # Store planner/poster context blob in SQLite
GET  /api/event-context/{campaign_id}               # Retrieve stored planner context
DELETE /api/event-context/{campaign_id}             # Remove stored planner context when archive/delete

# Poster generation
POST /design/background                             # Generate background via FLUX using OpenAI-enriched prompts
POST /design/harmonize                              # Apply colour harmonisation + overlays with adaptive prompts
POST /design/export                                 # Produce final downloadable asset metadata
```

> **Security note:** All planner, provider, venue, concept-name, and event-context endpoints now require an `X-API-Key` header matching `PLANNER_API_KEY`/`PLANNER_API_KEYS` in the backend environment.

---

## 🔧 Environment Configuration

### Frontend Environment (`.env`)
```
VITE_API_BASE_URL=http://localhost:4000/api        # Node auth/subscription/2FA endpoints
VITE_API_BASE=http://127.0.0.1:1800                # Python planner/poster endpoints
VITE_PLANNER_API_KEY=planner-dev-key               # Forwarded to FastAPI planner as X-API-Key
```

### Backend-Node Environment (`.env`)
```
PORT=4000
MONGO_URI=mongodb://localhost:27017/event-planner   # Optional but required for auth/subscription data
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=http://localhost:5173                  # Used for Stripe redirects
TOTP_SECRET_KEY=development-totp-secret             # 2FA seed
MANUAL_UPGRADE_TOKEN=dev-service-token              # Required to access /api/subscription/manual-upgrade outside dev
``` 

### Backend-Python Environment (`.env`)
```
PLANNER_API_KEY=planner-dev-key                     # Single API key accepted for planner/design routes
# or
PLANNER_API_KEYS=planner-dev-key,partner-integration

OPENAI_API_KEY=sk-proj-your-openai-key              # Required for AI narratives/posters
OPENAI_POSTER_PROMPT_MODEL=gpt-4o-mini             # Optional override for poster prompt assistant
HF_TOKEN=your-hugging-face-token                    # Required for FLUX background generation
CLOUDINARY_CLOUD_NAME=your_cloud                    # Poster uploads (optional in dev)
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
SERPER_API_KEY=optional-search-key                  # Optional for planner web lookups
USE_AI_CONCEPTS=0                                   # Use bundled concepts by default
ENABLE_CREW_AI=0                                    # Mount CrewAI intelligence endpoints when set to 1
``` 

Client calls must include an `X-API-Key` header matching one of the configured values when hitting planner-related endpoints.

---

## 🚀 Development Workflow

### Starting the Development Environment
```bash
# Terminal 1: Frontend
cd frontend
npm run dev          # Runs on http://localhost:5173

# Terminal 2: Node.js Backend  
cd backend-node
npm start           # Runs on http://localhost:4000

# Terminal 3: Python Backend
cd backend-py
uvicorn main:app --host 127.0.0.1 --port 1800 --reload  # Runs on http://127.0.0.1:1800
```

### Team Member Responsibilities

| Team Member | Focus Area | Primary Backend | Key Endpoints |
|------------|------------|----------------|---------------|
| **Ravindu** | Auth, subscriptions, 2FA services | backend-node | `/api/auth/*`, `/api/2fa/*`, `/api/subscription/*` |
| **Dhananjana** | Campaign planner & context persistence | backend-py | `/campaigns/*/planner/*`, `/event-context/*` |
| **Heshan** | Poster generation & asset pipeline | backend-py | `/design/*` |

---

## 🔐 Security Features Implemented

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Email Validation**: Server-side email format checking
- **CORS Protection**: Controlled cross-origin access
- **Environment Security**: Sensitive data in environment variables
- **API Key Management**: OpenAI key secure storage
- **Planner API Key Enforcement**: FastAPI planner surface gated by `X-API-Key`
- **Stripe Hardening**: Checkout/manual upgrade flows require service token and validated config
- **Persistent Event Contexts**: Planner context stored in SQLite with server-side access controls

---

## 📊 Data Flow

### Authentication Flow
```
Frontend → POST /api/auth/login → Backend-Node → MongoDB → JWT Token → Frontend
```

### Event Planning Flow
```
Frontend → POST /campaigns/{id}/planner/generate → Backend-Python → Planner/AI processing → Planner concepts + timeline → Frontend
```

### Poster Generation Flow
```
Frontend → POST /design/background|harmonize → Backend-Python → HF FLUX + Cloudinary → Poster assets + metadata → Frontend
```

---

## 🧪 Testing Endpoints

### Test Backend-Node
```bash
# Health Check
GET http://localhost:4000/api/health

# Register User
POST http://localhost:4000/api/auth/register
Content-Type: application/json
{
  "email": "test@example.com",
  "password": "password123"
}
```

### Test Backend-Python
```bash
# Health Check
GET http://127.0.0.1:1800/health

# Planner status
GET http://127.0.0.1:1800/status
```

---

## 📝 Next Steps for Team Members

### For Ravindu (Auth, Subscriptions, 2FA):
- Retire any lingering references to vendor catalog routes inside the auth code paths.
- Ensure subscription and 2FA flows surface clear error messages and rely on environment-driven URLs.
- Harden `/api/test/*` helpers behind explicit service tokens or remove them once coverage exists.

### For Dhananjana (Campaign Planner & Context):
- Expand documentation for planner payload contracts (generate/update/select) and `/event-context` schema snapshots.
- Build smoke tests that call planner endpoints with the required `X-API-Key` header to prevent regressions.
- Profile planner DB queries and add indices where necessary once dataset volume increases.

### For Heshan (Poster Pipeline):
- Consolidate poster wizard endpoints (`/design/background`, `/design/harmonize`, `/design/export`) and remove unused variants.
- Add telemetry hooks (optional) around harmonisation failure points to speed up debugging.
- Evaluate Cloudinary/S3 upload parity for production readiness once pipeline stabilises.

---

## 🔄 Integration Points

1. **Frontend ↔ Backend-Node**: Authentication, subscriptions, and 2FA-protected flows.
2. **Frontend ↔ Backend-Python**: Campaign planner endpoints, poster generation, event context CRUD.
3. **All Services**: Consistent environment-driven base URLs (`VITE_API_BASE_URL`, `VITE_API_BASE`).

---

This documentation provides a complete overview of the current implementation. All placeholder endpoints and folder structures are ready for your team to build upon! 🚀
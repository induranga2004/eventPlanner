# Event Planner Project - Complete Technical Documentation

## 📋 Project Overview

The **Event Planner** is a full-stack web application that helps users plan events and generate AI-powered social media content. The project is built using a modern tech stack with three main components working together.

---

## 🏗️ System Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   FRONTEND      │    │   BACKEND-NODE   │    │   BACKEND-PY    │
│   (React/Vite)  │◄──►│   (Node.js)      │◄──►│   (Python)      │
│   Port: 5173    │    │   Port: 4000     │    │   Port: 8000    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
        │                        │                        │
        │                        │                        │
        └──── User Interface ────┼──── Core Business ────┼──── AI Features
             Authentication       │     Logic & DB        │     Content Gen
             Event Management     │     User Management   │     Event Planning
             Social Sharing       │     API Gateway       │     Post Creation
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
- **CrewAI** - Multi-agent AI framework
- **OpenAI** - GPT models for content generation
- **Pydantic** - Data validation using Python type annotations
- **Uvicorn** - ASGI web server

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
- ✅ **FastAPI Framework**: Modern async API framework
- ✅ **CORS Middleware**: Frontend integration ready
- ✅ **OpenAI Integration**: AI service connection configured
- ✅ **Placeholder Architecture**: Structured endpoints for team development
- ✅ **Health Monitoring**: Service status endpoints
- ✅ **Environment Validation**: Startup checks for required variables

#### AI Service Endpoints (Placeholders Ready for Implementation):
```python
# Event Planning AI (For Dhananjana)
POST /api/events/suggest-plan        # Generate event suggestions
POST /api/events/generate-checklist  # Create event checklists

# Content Generation AI (For Heshan)  
POST /api/posts/generate-content     # Create social media posts
POST /api/posts/optimize-content     # Optimize for different platforms

# Integration Endpoints
POST /api/sharing/prepare-content    # Prepare content for sharing
GET  /api/templates                 # Available templates
GET  /api/status                    # AI service status
```

---

## 🔧 Environment Configuration

### Frontend Environment (`.env`)
```
VITE_API_BASE_URL=http://localhost:4000/api
```

### Backend-Node Environment (`.env`)
```
PORT=4000
MONGO_URI="mongodb+srv://[credentials]/eventPlanner"
JWT_SECRET="[secure-secret-key]"
CORS_ORIGIN=http://localhost:5173,http://localhost:5174,http://localhost:5175
```

### Backend-Python Environment (`.env`)
```
OPENAI_API_KEY="sk-proj-[your-openai-key]"
```

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
uvicorn main:app --reload  # Runs on http://localhost:8000
```

### Team Member Responsibilities

| Team Member | Focus Area | Primary Backend | Key Endpoints |
|------------|------------|----------------|---------------|
| **Ravindu** | User Auth & Admin | backend-node | `/auth/login`, `/auth/register` |
| **Dhananjana** | Event Planning | backend-py | `/api/events/*` |
| **Heshan** | AI Post Generator | backend-py | `/api/posts/*` |
| **Hirushan** | Social Sharing | frontend + integration | Frontend sharing + API integration |

---

## 🔐 Security Features Implemented

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Email Validation**: Server-side email format checking
- **CORS Protection**: Controlled cross-origin access
- **Environment Security**: Sensitive data in environment variables
- **API Key Management**: OpenAI key secure storage

---

## 📊 Data Flow

### Authentication Flow
```
Frontend → POST /api/auth/login → Backend-Node → MongoDB → JWT Token → Frontend
```

### AI Content Generation Flow
```
Frontend → POST /api/posts/generate-content → Backend-Python → OpenAI API → Generated Content → Frontend
```

### Event Planning Flow
```
Frontend → POST /api/events/suggest-plan → Backend-Python → AI Processing → Event Suggestions → Frontend
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
GET http://localhost:8000/

# AI Status Check
GET http://localhost:8000/api/status
```

---

## 📝 Next Steps for Team Members

### For Ravindu (User Auth & Admin):
- Expand user model with additional fields (name, role, etc.)
- Implement admin dashboard endpoints
- Add user profile management features
- Create user role-based permissions

### For Dhananjana (Event Planning):
- Implement CrewAI agents in `routers/events.py`
- Create event planning models in `models/event.py`
- Build AI-powered event suggestion logic
- Generate customized event checklists

### For Heshan (AI Post Generator):
- Develop content generation agents in `routers/posts.py`
- Create post models in `models/post.py`
- Implement platform-specific content optimization
- Build social media content templates

### For Hirushan (Social Sharing):
- Create sharing components in frontend
- Integrate with generated content from backend-py
- Implement platform-specific sharing APIs
- Build sharing analytics and tracking

---

## 🔄 Integration Points

1. **Frontend ↔ Backend-Node**: User authentication, user management
2. **Frontend ↔ Backend-Python**: AI content generation, event planning
3. **Backend-Node ↔ Backend-Python**: User context for personalized AI responses
4. **All Services**: Shared user sessions and authentication tokens

---

This documentation provides a complete overview of the current implementation. All placeholder endpoints and folder structures are ready for your team to build upon! 🚀
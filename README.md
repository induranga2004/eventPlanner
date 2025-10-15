# Musical Event Planner Project

Welcome to the Musical Event Planner project! This guide outlines the setup and workflow for contributing to our specialised planner focused on live musical experiences in Colombo.

## 📌 Current scope focus (planner → post-generation)

We’re explicitly investing in the pipeline that starts with campaign planning and ends with AI-driven poster delivery. To keep velocity high:

- **In scope:** Frontend planner journeys, Node auth/subscription/2FA APIs, Python planner & design services, provider integrations, poster/post-generation assets.
- **Out of scope:** Social sharing, marketing copy bots, downstream distribution tooling, or legacy merge artifacts that referenced them.

Use this guardrail any time you decide whether to keep or prune a feature.

## ♻️ Cleanup & hardening roadmap (locked 2025-10-15)

| Phase | Theme | Highlights |
| --- | --- | --- |
| 1 | **Environment & docs alignment** | Refresh this README and `PROJECT_DOCUMENTATION.md` with real port usage and dual-backend expectations; normalise every `.env.example` for planner → post-gen needs only; archive/delete empty merge Markdown once content lands in canonical docs. |
| 2 | **Backend hardening** | Node: keep auth/subscription/2FA endpoints, migrate or retire `/api/test/*` helpers, tighten service-token guards where still used. Python: persist event context, require API keys/JWT for planner/design routes, document JSON contracts. |
| 3 | **Frontend consolidation** | Merge planner results variants, standardise `apiNode`/`apiPlanner` clients, remove mock/localStorage fallbacks, persist selected concept/providers back to Python, retire `Wizard.jsx` in favour of the upgraded poster wizard. |
| 4 | **Quality gates** | Add FastAPI tests for auth/persistence, Node integration tests for auth/2FA, React Testing Library smoke for planner→poster, wire lint/format checks across repos. |
| 5 | **Forward-looking (in-scope)** | Define shared TypeScript/Pydantic schemas, add focused telemetry for planner & harmonisation, evaluate managed asset storage once the pipeline is steady. |

Stick to this sequence unless a bug forces a tactical fix.

## 1. Development Workflow

This project uses a feature-branch workflow to keep the `main` branch clean and stable.

1.  **Create Your Branch**: Before you start working, create a new branch for your feature or task from the `main` branch. Use a descriptive name.
    ```bash
    # Make sure you are on the main branch and have the latest changes
    git checkout main
    git pull

    # Create your new branch
    git checkout -b feature/your-name-description
    ```
    *Example: `git checkout -b feature/john-doe-event-creation-api`*

2.  **Develop on Your Branch**: Make all your code changes on this new branch.

3.  **Submit a Pull Request**: Once your feature is complete, push your branch to the remote repository and open a Pull Request (PR) to merge your changes into `main`. Your PR will be reviewed by a team member before it is merged.

---

## 2. Initial Project Setup

Follow these steps to get all three services (frontend, backend-node, backend-py) running on your local machine.

### Step 1: Clone the Repository

```bash
git clone <your-repository-url>
cd eventPlanner
```

### Step 2: Set Up Environment Variables

Each service requires its own environment variables. You will find an `.env.example` file in each of the `frontend`, `backend-node`, and `backend-py` directories (the active planner is the Python backend).

1.  **For each service**, create a copy of the `.env.example` file and name it `.env`.
2.  Fill in the required values in each `.env` file:
    *   `backend-node/.env`:
        *   `MONGO_URI`: Your MongoDB connection string.
        *   `JWT_SECRET`: A secret string for signing authentication tokens.
    *   `backend-py/.env`:
        *   `SERPER_API_KEY`: Your API key from [Serper.dev](https://serper.dev/) for the AI agent's search tool.
        *   `OPENAI_API_KEY`: Required only when `USE_AI_CONCEPTS=1`; enables the OpenAI concept generator.
        *   `USE_AI_CONCEPTS`: Set to `1` to seed concepts via the OpenAI agent, or leave unset/`0` to use the bundled CSV.
        *   `MONGO_URI` / `MONGO_DB_NAME`: Connection info for the concept cache and provider lookups.
        *   `MONGO_CONCEPTS_COLLECTION`: Optional override for the Mongo collection name (defaults to `concepts`).
        *   `OPENAI_CONCEPT_MODEL`: Optional override for the lightweight model (default `gpt-4o-mini`).
    *   `frontend/.env`:
        *   `VITE_API_BASE_URL`: The full URL to the Node.js backend API (`http://localhost:4000/api`).

### Step 3: Install Dependencies

You need to install dependencies for each service separately.

-   **Frontend (React):**
    ```bash
    cd frontend
    npm install
    ```

-   **Backend (Node.js):**
    ```bash
    cd ../backend-node
    npm install
    ```

-   **Backend (Python musical planner):**
    ```bash
    cd ../backend-py
    pip install -r requirements.txt
    ```

### Step 4: Run the Development Servers

Run each service in a separate terminal.

-   **Frontend (React):**
    ```bash
    cd frontend
    npm run dev
    ```
    *Your React app will be running at `http://localhost:5173` (or another available port).*

-   **Backend (Node.js):**
    ```bash
    cd backend-node
    npm start
    ```
    *The Node.js API will be running at `http://localhost:4000`.*

-   **Backend (Python musical planner):**
    ```bash
    cd backend-py
    uvicorn main:app --host 127.0.0.1 --port 1800 --reload
    ```
    *The Python API will be running at `http://127.0.0.1:1800`.*

You are now ready to start developing!

### Optional: AI-backed concept seeding

When `USE_AI_CONCEPTS=1` and MongoDB is configured, you can seed a lightweight concept document using the helper script:

```powershell
cd backend-py
python -m scripts.seed_concepts --concept-id ai_showcase --audience "young professionals" --attendees 180 --budget 2500000
```

The planner caches generated concepts in the configured Mongo collection. During local development without an OpenAI key the system automatically falls back to the curated CSV concepts.

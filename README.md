# Musical Event Planner Project

Welcome to the Musical Event Planner project! This guide outlines the setup and workflow for contributing to our specialised planner focused on live musical experiences in Colombo.

## ♻️ Repository Cleanup (2025-10-15)

We've removed placeholder documentation, unused integration tests, and dormant Python security scaffolding that weren't part of the event planner → post-generation scope. Key deletions include:

- Legacy planning docs such as `AGENT_MIGRATION_COMPLETE.md`, `SYSTEM_ARCHITECTURE.md`, and other empty merge artifacts.
- Obsolete Python test stubs (`test_ai_generation.py`, `test_complete_system.py`, `test_venues.py`) and helper shells under `backend-py/tests/`.
- Unused Python agent stubs (`backend-py/agents/poster_prompt_agent.py`) and placeholder security package files.
- A deprecated frontend scraper prototype at `frontend/src/lib/collectionScraper.js`.

Only the planner → post-generation flow remains in scope; new work should avoid reintroducing these artifacts.

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

# Musical Event Planner Project

Welcome to the Musical Event Planner project! This guide outlines the setup and workflow for contributing to our specialised planner focused on live musical experiences in Colombo.

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
    *   `OPENAI_API_KEY`: Optional, enables richer venue/catering intelligence. Without it the system falls back to curated CSV data.
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

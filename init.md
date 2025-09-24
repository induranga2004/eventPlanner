# Project Initialization and Workflow Guide

Welcome to the Event Planner team! This guide provides everything you need to get started, from setting up the project to contributing your code.

---

## Part 1: Initial Project Setup

This is a **one-time setup** to get the project running on your machine.

### Step 1.1: Clone the Repository

```bash
git clone <your-repository-url>
cd eventPlanner
```

### Step 1.2: Create and Populate Environment Files

This is the most important step. You need to create a `.env` file in each of the three main directories (`frontend`, `backend-node`, `backend-py`) and fill them with the exact content below.

#### -> For `frontend/.env`:

```
VITE_API_BASE_URL=http://localhost:4000/api
```

#### -> For `backend-node/.env`:

```
PORT=4000
MONGO_URI="mongodb+srv://thunawasaresisun:ponnaravindu@cluster0.qfrw4x3.mongodb.net/eventPlanner"
JWT_SECRET="e3ccca352b3ac95152540386e091658830075f484344be5814639cff8ba8347e65350ad169edbacee4d79ca4ee084e54cf225545ab137de2fbdf9753ec4858cf"
CORS_ORIGIN=http://localhost:5173,http://localhost:5174,http://localhost:5175
```

#### -> For `backend-py/.env`:

```
OPENAI_API_KEY=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
```

### Step 1.3: Install All Dependencies

You need to run the installation command for each service.

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

-   **Backend (Python):**
    ```bash
    cd ../backend-py
    pip install -r requirements.txt
    ```

### Step 1.4: Run All Services

To run the application, you need to open three separate terminals, one for each service.

-   **Terminal 1: Run the Frontend**
    ```bash
    cd frontend
    npm run dev
    ```

-   **Terminal 2: Run the Node.js Backend**
    ```bash
    cd backend-node
    npm start
    ```

-   **Terminal 3: Run the Python Backend**
    ```bash
    cd backend-py
    uvicorn main:app --reload
    ```

**Congratulations! Your local development environment is now fully set up.**

---

## Part 2: Your Role and Development Workflow

This is the process you will follow **every time** you start a new task.

### Step 2.1: Identify Your Role and Branch Name

-   **Ravindu**: User Accounts & Admin Panel -> `feature/user-auth-admin`
-   **Dhananjana**: Event Planning -> `feature/event-planning-flow`
-   **Heshan**: AI Post Generator -> `feature/ai-post-generator`
-   **Hirushan**: Post Sharing -> `feature/social-post-sharing`

### Step 2.2: The Git & GitHub Workflow

#### 1. Get the Latest Code from `main`

Before starting any new work, always make sure your local `main` branch is up-to-date.

```bash
git checkout main
git pull origin main
```

#### 2. Create and Switch to Your Feature Branch

Create your branch from the updated `main` branch.

```bash
# Example for Ravindu
git checkout -b feature/user-auth-admin
```
*(Use your assigned branch name from Step 2.1)*

#### 3. Code and Commit Your Changes

Do your work. As you complete small pieces, commit them with clear messages.

```bash
# Stage your changes
git add .

# Commit your changes
git commit -m "feat: Add user registration endpoint"
```

#### 4. Push Your Branch to GitHub

Periodically push your commits to GitHub to back them up and share your progress.

```bash
# The first time you push a new branch, use this command:
git push -u origin <your-branch-name>

# After the first time, you can just use:
git push
```

#### 5. Create a Pull Request (PR) to Merge Your Code

When your feature is complete and ready for review:
1.  Go to the repository on GitHub.
2.  Click the "Compare & pull request" button for your branch.
3.  Add a title, a description of your work, and assign a team member to review it.
4.  Click "Create pull request".

Once your PR is reviewed and approved, it will be merged into `main`. You can then delete your old branch and go back to Step 1 for your next task.

---

## Appendix: Project Structure Overview

-   **`/frontend`**: The React user interface.
-   **`/backend-node`**: The primary backend (Node.js, Express, MongoDB).
-   **`/backend-py`**: The AI service (Python, FastAPI, CrewAI).
-   **`README.md`**: Public documentation.
-   **`init.md`**: This private guide.
-   **`.gitignore`**: Files ignored by Git.

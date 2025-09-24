
# .env
PORT=4000
MONGO_URI=mongodb://127.0.0.1:27017/mern_jwt_basic
JWT_SECRET=change_this_to_a_long_random_string
CORS_ORIGIN=http://localhost:INT 




# MERN JWT Basic — Backend

A minimal **Node.js + Express + MongoDB** backend with **JWT (Bearer) authentication**.
Endpoints: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/me` (protected), and `GET /health`.

---

## Stack

* **Node.js** + **Express**
* **MongoDB** (Mongoose)
* **bcryptjs** for password hashing
* **jsonwebtoken** for JWT issuing/verification
* **cors** for local dev CORS

---

## Features (minimal)

* Register with email & password
* Login with email & password
* Issue short-lived **JWT access token**
* Protect routes via `Authorization: Bearer <token>`
* Basic health check

> This is the **basic** version (no refresh tokens / rotation). Good for learning and small demos.

---

## Project Structure

```
mern-jwt-basic/
├─ server.js
├─ .env
├─ package.json
└─ src/
   ├─ models/
   │  └─ User.js
   ├─ middleware/
   │  └─ requireAuth.js
   ├─ auth.routes.js
   └─ protected.routes.js
```

---

## Prerequisites

* **Node.js** 18+ (20+ recommended)
* **MongoDB** running locally (or use Atlas connection string)

---

## Setup

1. **Install deps**

```bash
npm install
```

2. **Environment variables** — create a `.env` in project root:

```
PORT=4000
MONGO_URI=mongodb://127.0.0.1:27017/mern_jwt_basic
JWT_SECRET=change_this_to_a_long_random_string
CORS_ORIGIN=http://localhost:5173
```

3. **Run (dev)**

```bash
npm run dev
```

4. **Health check**

```bash
curl http://localhost:4000/health
# -> { "ok": true }
```

---

## API Reference

### 1) `POST /api/auth/register`

Create a user and immediately return a JWT.

**Body**

```json
{ "email": "a@a.com", "password": "P@ssw0rd!" }
```

**201 Response**

```json
{ "token": "<JWT>" }
```

**Errors**

* `400` email and password required
* `409` email already in use

---

### 2) `POST /api/auth/login`

Verify credentials and return a JWT.

**Body**

```json
{ "email": "a@a.com", "password": "P@ssw0rd!" }
```

**200 Response**

```json
{ "token": "<JWT>" }
```

**Errors**

* `400` email and password required
* `401` invalid credentials

---

### 3) `GET /api/me` (Protected)

Return current user information.
**Requires** header `Authorization: Bearer <token>`.

**200 Response**

```json
{
  "user": { "id": "665f...", "email": "a@a.com" }
}
```

**Errors**

* `401` missing bearer token
* `401` invalid or expired token

---

## Quick cURL Tests

```bash
# Register (gets token)
curl -s http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"a@a.com","password":"P@ssw0rd!"}'

# Login (if already registered)
curl -s http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"a@a.com","password":"P@ssw0rd!"}'

# Use token from either response (replace <TOKEN>)
curl -s http://localhost:4000/api/me \
  -H "Authorization: Bearer <TOKEN>"
```

---

## Testing with Postman (optional)

1. Create environment:

   * **base\_url** = `http://localhost:4000`
   * **access\_token** = *(blank; will be set by tests)*

2. Requests:

   * **Health (GET)** → `{{base_url}}/health`
   * **Register (POST)** → `{{base_url}}/api/auth/register`

     * Body (JSON): `{"email":"a@a.com","password":"P@ssw0rd!"}`
     * Tests:

       ```js
       pm.test("201", ()=>pm.response.to.have.status(201));
       const d = pm.response.json(); if (d.token) pm.environment.set("access_token", d.token);
       ```
   * **Login (POST)** → `{{base_url}}/api/auth/login`

     * Body (JSON): same as above
     * Tests:

       ```js
       pm.test("200", ()=>pm.response.to.have.status(200));
       const d = pm.response.json(); if (d.token) pm.environment.set("access_token", d.token);
       ```
   * **Me (GET, protected)** → `{{base_url}}/api/me`

     * **Auth tab**: Bearer → `{{access_token}}`

---

## Implementation Notes

* Passwords are stored as **bcrypt hashes** (`bcrypt.hash(password, 10)`).
* JWT payload includes:

  * `sub` → user id
  * `email` → user email
* Default token expiry (in code) is `30m` via:

  ```js
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30m' })
  ```

---

## Security Notes (for real deployments)

* Use a **long, random** `JWT_SECRET` (at least 32 bytes).
* Prefer **short access token expiry** (e.g., 15–30 minutes).
* Serve over **HTTPS** only.
* Set strict **CORS** in production (exact origin, `credentials` as needed).
* Consider **rate limiting** and request validation (e.g., zod/joi).
* For production-grade auth: add **refresh tokens** with httpOnly cookies and rotation.

---

## Troubleshooting

* **ECONNREFUSED**: API not running or wrong `PORT`. Check `npm run dev` logs.
* **Mongo connection errors**: Verify `MONGO_URI` and that MongoDB is running.
* **`401` on `/api/me`**: Missing or expired token; ensure header:

  ```
  Authorization: Bearer <token>
  ```
* **`409` on register**: Email already exists → use `/api/auth/login`.

---

## Scripts

* `npm run dev` — start server with nodemon

---

## License

MIT (or your preference).

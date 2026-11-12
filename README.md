# KavyaKosh (काव्यकोश) — Literary Poetry & AI Platform

An Indian literary poetry sanctuary built for discovering, reciting, reviewing, and publishing classical and contemporary verse (Ghazals, Nazms, Dohas, Chhands, Rubais, and Free Verse) in Hindi, Urdu, Punjabi, and English.

---

## Architecture Overview

- **Backend**: Java 17, Spring Boot 4 / Spring Security 6, Spring Data JPA (MySQL), Spring Data MongoDB, JJWT, RestClient (OpenAI).
- **Frontend**: React 19, Vite 8, React Router v7, Axios, Vanilla CSS design system with dark Indian aesthetics.
- **AI Engine**: OpenAI GPT-4o-mini / mock provider with verse form and meter constraints.

---

## Configuration

KavyaKosh adheres strictly to the **12-Factor App methodology**. Credentials, API keys, database URLs, and secret tokens are **never hardcoded in source code** and **never committed to version control**. All sensitive configurations are wired entirely through environment variables.

### Environment Variables Reference

| Variable | Target Component | Description | Required? | Default / Example Value |
| :--- | :--- | :--- | :--- | :--- |
| `MYSQL_URL` | Spring Boot (Backend) | Full JDBC connection URL to MySQL instance. | **Yes** (fail-fast) | `jdbc:mysql://localhost:3306/verse_db?useSSL=false&serverTimezone=UTC` |
| `MYSQL_USERNAME` | Spring Boot (Backend) | MySQL database username. | **Yes** | `root` |
| `MYSQL_PASSWORD` | Spring Boot (Backend) | MySQL database password. | **Yes** | `root` |
| `MONGODB_URI` | Spring Boot (Backend) | MongoDB connection URI (Atlas or local). | **Yes** (fail-fast) | `mongodb+srv://user:pass@cluster.mongodb.net/` |
| `AI_API_KEY` | Spring Boot (Backend) | OpenAI API Key used by AI Studio. | **Yes** (fail-fast) | `sk-proj-...` |
| `AI_PROVIDER` | Spring Boot (Backend) | LLM provider implementation (`openai` or `mock`). | No | `openai` |
| `AI_BASE_URL` | Spring Boot (Backend) | Base endpoint for LLM API requests. | No | `https://api.openai.com/v1` |
| `AI_MODEL` | Spring Boot (Backend) | Target OpenAI model identifier. | No | `gpt-4o-mini` |
| `JWT_SECRET` | Spring Boot (Backend) | HMAC-SHA256 signing key (min. 256 bits, 64+ hex characters). | **Yes** (fail-fast) | `64_or_128_hex_characters` |
| `JWT_REFRESH_SECRET` | Spring Boot (Backend) | Optional secondary secret for refresh token validation. | No | `64_or_128_hex_characters` |
| `JWT_ACCESS_EXPIRY` | Spring Boot (Backend) | Access token lifespan in milliseconds (default: 15 min). | No | `900000` |
| `JWT_REFRESH_EXPIRY` | Spring Boot (Backend) | Refresh token lifespan in milliseconds (default: 7 days). | No | `604800000` |
| `STRIPE_SECRET_KEY` | Spring Boot (Backend) | Stripe secret API key for payments & subscriptions. | No (Optional in dev) | `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET`| Spring Boot (Backend) | Stripe webhook verification secret. | No (Optional in dev) | `whsec_...` |
| `SPRING_PROFILES_ACTIVE`| Spring Boot (Backend) | Active Spring profile (`dev` for verbose logs/SQL, `prod` for optimized). | No | `dev` |
| `FRONTEND_URL` | Spring Boot (Backend) | Allowed frontend origin for CORS security policy. | No | `http://localhost:5173` |
| `VITE_API_BASE_URL` | React (Frontend) | URL of the Spring Boot `/api` backend. | **Yes** | `http://localhost:8080/api` |

> [!IMPORTANT]
> **Fail-Fast Startup Guarantee**: On application launch, `EnvironmentValidator` validates that all mandatory credentials (`MYSQL_URL`, `MONGODB_URI`, `AI_API_KEY`, `JWT_SECRET`) are present. If any variable is missing or placeholder-only, the application halts immediately with an explicit diagnostic message before opening database connections.

---

### Local Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-org/KavyaKosh.git
   cd KavyaKosh
   ```

2. **Configure Backend Secrets**:
   Copy the example template and supply your credentials:
   ```bash
   cp .env.example .env
   # or on Windows: copy .env.example .env
   ```
   Open `.env` and fill in your real MySQL, MongoDB Atlas, OpenAI, and JWT secret values.

3. **Configure Frontend**:
   ```bash
   cd frontend
   cp .env.example .env
   npm install
   npm run dev
   ```

4. **Launch Backend**:
   ```bash
   cd backend
   mvn spring-boot:run
   ```

---

### Cloud Deployment Guides

#### 1. Deploying on Railway

1. **Backend Service**:
   - Create a new project on Railway and link your repository (`/backend` subpath).
   - In Railway Service Settings -> **Variables**, add:
     - `MYSQL_URL`: Your Railway MySQL connection string (`jdbc:mysql://${MYSQLHOST}:${MYSQLPORT}/${MYSQLDATABASE}`)
     - `MYSQL_USERNAME`: `${MYSQLUSER}`
     - `MYSQL_PASSWORD`: `${MYSQLPASSWORD}`
     - `MONGODB_URI`: Your MongoDB Atlas URI
     - `AI_API_KEY`: Your OpenAI API key
     - `AI_PROVIDER`: `openai`
     - `AI_MODEL`: `gpt-4o-mini`
     - `JWT_SECRET`: A secure 128-char hex secret
     - `SPRING_PROFILES_ACTIVE`: `prod`
     - `FRONTEND_URL`: `https://your-frontend.vercel.app`
2. **Frontend Service**:
   - Set **Variables**:
     - `VITE_API_BASE_URL`: `https://your-backend.up.railway.app/api`

#### 2. Deploying on Render

1. **Backend Web Service**:
   - Create a **Web Service** with Environment: `Docker` or `Java`.
   - Set **Root Directory**: `backend`.
   - Build Command: `mvn clean package -DskipTests`.
   - Start Command: `java -jar target/backend-0.0.1-SNAPSHOT.jar`.
   - In **Environment Variables**, add `MYSQL_URL`, `MYSQL_USERNAME`, `MYSQL_PASSWORD`, `MONGODB_URI`, `AI_API_KEY`, `JWT_SECRET`, `SPRING_PROFILES_ACTIVE=prod`, and `FRONTEND_URL`.
2. **Frontend Static Site**:
   - Create a **Static Site** on Render.
   - Set **Root Directory**: `frontend`.
   - Build Command: `npm install && npm run build`.
   - Publish Directory: `dist`.
   - In **Environment Variables**, add:
     - `VITE_API_BASE_URL`: `https://your-backend.onrender.com/api`.

#### 3. Deploying Frontend on Vercel

1. Import the repository into Vercel and set the **Root Directory** to `frontend`.
2. Framework Preset: `Vite`.
3. In **Environment Variables**, add:
   - `VITE_API_BASE_URL` = `https://your-production-backend.com/api`
4. Deploy!

---

## Health & Diagnostics Endpoint

To verify connectivity across your database clusters and AI provider without needing to log in, query the built-in health endpoint:

```bash
# Basic health check (MySQL + MongoDB + AI status)
curl http://localhost:8080/api/health

# Full diagnostic including live test completion with OpenAI
curl http://localhost:8080/api/health?testAi=true
```

**Sample Response**:
```json
{
  "status": "UP",
  "timestamp": "2026-10-23T14:40:00.000Z",
  "components": {
    "mysql": {
      "status": "UP",
      "database": "verse_db",
      "latencyMs": 4,
      "message": "MySQL connection pool healthy"
    },
    "mongodb": {
      "status": "UP",
      "database": "kavyakosh",
      "latencyMs": 8,
      "message": "MongoDB ping response ok"
    },
    "ai": {
      "provider": "openai/gpt-4o-mini",
      "configuredModel": "gpt-4o-mini",
      "baseUrl": "https://api.openai.com/v1",
      "apiKeyConfigured": true,
      "status": "UP",
      "testCallResponse": "PONG",
      "latencyMs": 512
    }
  }
}
```

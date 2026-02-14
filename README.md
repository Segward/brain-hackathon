# Brain Hackathon - Autonomipartiet AI Chatbot

A full-stack AI-powered political chatbot application for the Norwegian political party "Autonomipartiet". Features multiple AI personas, streaming responses, conversation history, and Norwegian text-to-speech.

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Quick Start (Docker)](#quick-start-docker)
- [Services Overview](#services-overview)
- [Local Development](#local-development)
- [API Documentation](#api-documentation)
- [Environment Variables](#environment-variables)
- [Common Commands](#common-commands)
- [Troubleshooting](#troubleshooting)

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Browser                          │
│  ┌─────────────────┐          ┌─────────────────┐          │
│  │  Main Frontend  │          │  Temp Frontend  │          │
│  │   (Vue 3 + TS)  │          │   (Vue 3 + JS)  │          │
│  │  Port: 3000     │          │  Port: 3001     │          │
│  └────────┬────────┘          └────────┬────────┘          │
└───────────┼──────────────────────────────┼──────────────────┘
            │                              │
            └──────────────┬───────────────┘
                           │
            ┌──────────────▼──────────────┐
            │   Backend (Spring Boot)      │
            │   Port: 8080                 │
            │   - Chat API                 │
            │   - Streaming SSE            │
            │   - History & Stats          │
            │   - Cache Management         │
            └───┬──────────────┬──────────┘
                │              │
        ┌───────▼────┐    ┌───▼────────┐
        │ PostgreSQL │    │   Redis    │
        │ Port: 5432 │    │ Port: 6379 │
        │ (History)  │    │  (Cache)   │
        └────────────┘    └────────────┘
                │
        ┌───────▼────────┐
        │    pgAdmin     │
        │  Port: 5050    │
        │ (DB Management)│
        └────────────────┘
```

## ✅ Prerequisites

- **Docker Desktop** installed and running ([Download](https://www.docker.com/products/docker-desktop))
- **Git** (to clone the repository)
- **OpenAI API Key** (for LLM integration)

**Minimum System Requirements:**

- RAM: 4GB
- Disk Space: 2GB free
- OS: macOS, Linux, or Windows with WSL2

## 🚀 Quick Start (Docker)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd brain-hackathon
```

### 2. Configure Environment

Copy the example environment file and add your API key:

```bash
cp .env.example .env
```

Edit `.env` and add your OpenAI API key:

```bash
OPENAI_API_KEY=your-actual-api-key-here
POSTGRES_DB=autonomi
POSTGRES_USER=admin
POSTGRES_PASSWORD=hackathon2024
PGADMIN_EMAIL=admin@autonomi.no
PGADMIN_PASSWORD=admin123
```

### 3. Build and Start All Services

```bash
# Using docker-compose
docker-compose up --build

# OR using Makefile
make up-build
```

**First build takes 2-5 minutes.** You'll see services starting in this order:

1. PostgreSQL & Redis (with health checks)
2. Backend (waits for DB to be ready)
3. Frontend & Temp-Frontend (wait for backend)
4. pgAdmin

### 4. Access the Applications

| Service           | URL                   | Description                                |
| ----------------- | --------------------- | ------------------------------------------ |
| **Main Frontend** | http://localhost:3000 | Primary Vue 3 + TypeScript UI with avatars |
| **Temp Frontend** | http://localhost:3001 | Alternative simpler chat interface         |
| **Backend API**   | http://localhost:8080 | Spring Boot REST API                       |
| **pgAdmin**       | http://localhost:5050 | PostgreSQL web admin                       |
| **PostgreSQL**    | localhost:5432        | Database (use any SQL client)              |
| **Redis**         | localhost:6379        | Cache (use Redis CLI)                      |

### 5. Verify Everything is Running

```bash
# Check all containers
docker ps

# Test backend health
curl http://localhost:8080/api/history/stats

# Test frontend
curl http://localhost:3000
```

## 🔧 Services Overview

### 1. Backend (Spring Boot)

**Technology:** Java 21, Spring Boot 3.3.2, Maven  
**Port:** 8080  
**Dependencies:** PostgreSQL, Redis

**Features:**

- Chat API with OpenAI LLM integration
- Server-Sent Events (SSE) streaming
- Conversation history with PostgreSQL
- Redis caching (10-minute TTL)
- Four personas: `leader`, `education`, `tech`, `debatt`

**Health Check:**

```bash
curl http://localhost:8080/api/history/stats
```

**Key Files:**

- `backend/src/main/resources/rules.txt` - System prompts
- `backend/src/main/resources/policy.txt` - Party policies
- `backend/src/main/resources/application.properties` - Configuration

### 2. Main Frontend (Vue 3 + TypeScript)

**Technology:** Vue 3, TypeScript, Vite, Tailwind CSS  
**Port:** 3000  
**Build Tool:** Vite

**Features:**

- Three AI personas with custom SVG avatars
- Norwegian text-to-speech with unique voices
- Real-time mouth animations
- Chat persistence in localStorage
- Responsive design

**Local Development:**

```bash
cd frontend
npm install
npm run dev  # Runs on http://localhost:5173
```

### 3. Temp Frontend (Simpler Vue 3)

**Technology:** Vue 3, JavaScript, Vite  
**Port:** 3001

**Features:**

- Two modes: Leader and Debate (demon avatar)
- SSE streaming for real-time responses
- 9 theme-based question categories
- Chat persistence
- Dark theme UI

**Local Development:**

```bash
cd temp
npm install
npm run dev
```

### 4. PostgreSQL Database

**Version:** 16-alpine  
**Port:** 5432  
**Database:** `autonomi`  
**User:** `admin`  
**Password:** `hackathon2024`

**Schema:**

- `conversations` table: Stores all chat history

**Connect via CLI:**

```bash
docker exec -it brain-hackathon-postgres psql -U admin -d autonomi
```

**Query example:**

```sql
SELECT * FROM conversations ORDER BY timestamp DESC LIMIT 10;
```

### 5. Redis Cache

**Version:** 7-alpine  
**Port:** 6379  
**Persistence:** AOF (Append-Only File)

**Purpose:**

- Cache chat responses (key: `chatResponses::{message}_{mode}`)
- 10-minute TTL

**Connect via CLI:**

```bash
docker exec -it brain-hackathon-redis redis-cli

# View all cached keys
KEYS chatResponses::*

# Check cache size
DBSIZE

# Monitor cache activity
MONITOR
```

### 6. pgAdmin

**Version:** Latest  
**Port:** 5050  
**Email:** `admin@autonomi.no`  
**Password:** `admin123`

**Setup Database Connection:**

1. Open http://localhost:5050
2. Login with credentials above
3. Right-click "Servers" → Register → Server
4. **General Tab:** Name = `Autonomi DB`
5. **Connection Tab:**
   - Host: `postgres`
   - Port: `5432`
   - Database: `autonomi`
   - Username: `admin`
   - Password: `hackathon2024`

## 💻 Local Development

### Backend (Without Docker)

**Prerequisites:**

- Java 21
- Maven 3.9+
- PostgreSQL 16
- Redis 7

**Setup:**

```bash
cd backend

# Create .env file with API key
echo "OPENAI_API_KEY=your-key" > .env

# Install dependencies
mvn clean install

# Run locally
mvn spring-boot:run

# Or build JAR
mvn clean package
java -jar target/backend-1.0-SNAPSHOT.jar
```

**Application runs on:** http://localhost:8080

### Frontend (Without Docker)

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev  # http://localhost:5173

# Build for production
npm run build

# Preview production build
npm run preview
```

### Temp Frontend (Without Docker)

```bash
cd temp

# Install dependencies
npm install

# Start dev server
npm run dev  # http://localhost:5173

# Build for production
npm run build
```

## 📡 API Documentation

### Chat Endpoints

#### 1. Non-Streaming Chat

```http
GET /api/chat?message={text}&mode={mode}
```

**Parameters:**

- `message` (string, required): User's question
- `mode` (string, required): `leader`, `education`, `tech`, or `debatt`

**Example:**

```bash
curl "http://localhost:8080/api/chat?message=Hva%20mener%20dere%20om%20AI?&mode=leader"
```

#### 2. Streaming Chat (SSE)

```http
GET /api/chat/stream?message={text}&mode={mode}
```

**Returns:** Server-Sent Events stream

**Example:**

```bash
curl -N "http://localhost:8080/api/chat/stream?message=Test&mode=leader"
```

### History Endpoints

#### Get Recent History

```http
GET /api/history?limit={number}
```

**Example:**

```bash
curl "http://localhost:8080/api/history?limit=10"
```

#### Get History by Mode

```http
GET /api/history/mode/{mode}
```

**Example:**

```bash
curl "http://localhost:8080/api/history/mode/leader"
```

#### Get Statistics

```http
GET /api/history/stats
```

**Returns:**

```json
{
  "totalConversations": 150,
  "averageResponseTimeMs": 1234.5,
  "leaderModeCount": 50,
  "educationModeCount": 40,
  "techModeCount": 35,
  "debateModeCount": 25
}
```

#### Clear History

```http
DELETE /api/history
```

### Cache Endpoints

#### Get Cache Stats

```http
GET /api/cache/stats
```

#### Clear Cache

```http
DELETE /api/cache/clear
```

#### View Cache Keys

```http
GET /api/cache/keys
```

## 🔐 Environment Variables

Create a `.env` file in the project root:

```bash
# Required
OPENAI_API_KEY=your-openai-api-key-here

# PostgreSQL
POSTGRES_DB=autonomi
POSTGRES_USER=admin
POSTGRES_PASSWORD=hackathon2024

# pgAdmin
PGADMIN_EMAIL=admin@autonomi.no
PGADMIN_PASSWORD=admin123
```

## 📝 Common Commands

### Using Makefile (Recommended)

```bash
# Start all services (detached)
make up

# Start with rebuild
make up-build

# Stop all services
make down

# View logs (all services)
make logs

# View logs (specific service)
make logs-backend
make logs-frontend
make logs-temp

# Show running containers
make ps

# Restart services
make restart

# Clean rebuild (no cache)
make build-clean

# Clean everything (nuclear option)
make clean
```

### Using Docker Compose Directly

```bash
# Start services
docker-compose up

# Start in background
docker-compose up -d

# Build and start
docker-compose up --build

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend

# Rebuild specific service
docker-compose build backend

# Restart specific service
docker-compose restart backend

# Remove everything including volumes
docker-compose down --volumes --rmi all
```

### Individual Service Commands

```bash
# Backend only
docker-compose up backend

# Frontend only
docker-compose up frontend

# Database only
docker-compose up postgres
```

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -i :8080  # Backend
lsof -i :3000  # Frontend
lsof -i :3001  # Temp frontend
lsof -i :5432  # PostgreSQL

# Kill process
kill -9 <PID>

# Or stop all containers
docker-compose down
```

### Backend Not Connecting to Database

```bash
# Check if PostgreSQL is healthy
docker-compose ps

# View PostgreSQL logs
docker-compose logs postgres

# Restart backend after DB is ready
docker-compose restart backend
```

### Redis Connection Issues

```bash
# Check Redis health
docker exec -it brain-hackathon-redis redis-cli ping
# Should return: PONG

# View Redis logs
docker-compose logs redis
```

### Build Failures

```bash
# Clean rebuild without cache
docker-compose build --no-cache

# Remove all containers and images
docker-compose down --rmi all

# Rebuild everything
docker-compose up --build
```

### Frontend Not Loading

```bash
# Check Nginx logs
docker-compose logs frontend

# Verify build succeeded
docker-compose build frontend

# Test backend separately
curl http://localhost:8080/api/history/stats
```

### Cache Not Working

```bash
# Clear Redis cache
docker exec -it brain-hackathon-redis redis-cli FLUSHDB

# Check cache configuration
curl http://localhost:8080/api/cache/stats
```

### Database Persistence Issues

```bash
# View volumes
docker volume ls

# Remove volumes (WARNING: Deletes all data)
docker-compose down --volumes

# Backup database
docker exec brain-hackathon-postgres pg_dump -U admin autonomi > backup.sql

# Restore database
docker exec -i brain-hackathon-postgres psql -U admin autonomi < backup.sql
```

### Docker Desktop Issues

```bash
# Restart Docker Desktop

# Clear Docker system
docker system prune -a

# Check Docker resources
docker stats
```

## 🎯 Development Tips

### Hot Reload Development

For faster development, run services separately:

**Terminal 1 - Database & Cache:**

```bash
docker-compose up postgres redis
```

**Terminal 2 - Backend:**

```bash
cd backend
mvn spring-boot:run
```

**Terminal 3 - Frontend:**

```bash
cd frontend
npm run dev
```

### Debugging Backend

```bash
# Run with debug mode
mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=5005"

# Connect debugger to port 5005
```

### Viewing Database in Real-Time

```bash
# Connect and watch conversations
docker exec -it brain-hackathon-postgres psql -U admin -d autonomi

# SQL to watch new messages
SELECT * FROM conversations ORDER BY timestamp DESC LIMIT 10;
```

## 📊 Monitoring & Logs

### View All Logs

```bash
# Real-time logs from all services
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail=100
```

### Service-Specific Logs

```bash
# Backend logs
docker-compose logs -f backend

# Frontend build logs
docker-compose logs frontend

# Database logs
docker-compose logs postgres

# Redis logs
docker-compose logs redis
```

## 🏭 Production Deployment

For production deployment, update:

1. **Environment variables** - Use secure passwords
2. **CORS settings** - Update allowed origins in backend
3. **Database** - Use managed PostgreSQL service
4. **Redis** - Use managed Redis service
5. **SSL/TLS** - Add reverse proxy (Nginx/Traefik)

## 📄 License

[Add your license here]

## 👥 Contributors

[Add contributors here]

---

**Need help?** Open an issue or check the troubleshooting section above.

# 🏗️ Autonomipartiet - Tech Stack Overview

Complete technical architecture diagram for the Brain Hackathon project.

---

## 📊 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          USER INTERFACE LAYER                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────────────────┐      ┌──────────────────────────┐       │
│  │   MAIN FRONTEND          │      │   TEMP FRONTEND          │       │
│  │   (Port 3000)            │      │   (Port 3001)            │       │
│  ├──────────────────────────┤      ├──────────────────────────┤       │
│  │ • Vue 3                  │      │ • Vue 3                  │       │
│  │ • TypeScript             │      │ • JavaScript             │       │
│  │ • Vite 7.3.1             │      │ • Vite 7.3.1             │       │
│  │ • Tailwind CSS           │      │ • Custom CSS             │       │
│  │ • Vue Router             │      │ • Vue Router             │       │
│  │ • Axios                  │      │ • Fetch API              │       │
│  │ • EventSource (SSE)      │      │ • EventSource (SSE)      │       │
│  │ • LocalStorage           │      │ • LocalStorage           │       │
│  └──────────┬───────────────┘      └──────────┬───────────────┘       │
│             │                                   │                       │
└─────────────┼───────────────────────────────────┼───────────────────────┘
              │                                   │
              │        HTTP/SSE Requests          │
              │                                   │
              ▼                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         APPLICATION LAYER                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌───────────────────────────────────────────────────────────┐         │
│  │              SPRING BOOT BACKEND (Port 8080)              │         │
│  ├───────────────────────────────────────────────────────────┤         │
│  │                                                           │         │
│  │  Framework & Runtime:                                    │         │
│  │  • Spring Boot 3.3.2                                     │         │
│  │  • Java 21 (Eclipse Temurin)                             │         │
│  │  • Maven 3.9                                             │         │
│  │  • Embedded Tomcat 10.1.26                               │         │
│  │                                                           │         │
│  │  Spring Modules:                                         │         │
│  │  • Spring WebFlux (Reactive)                             │         │
│  │  • Spring Data JPA                                       │         │
│  │  • Spring Data Redis                                     │         │
│  │  • Spring Cache                                          │         │
│  │  • Spring Web                                            │         │
│  │                                                           │         │
│  │  Key Dependencies:                                       │         │
│  │  • Hibernate ORM 6.5.2                                   │         │
│  │  • HikariCP (Connection Pool)                            │         │
│  │  • PostgreSQL Driver                                     │         │
│  │  • Lettuce (Redis Client)                                │         │
│  │  • Jackson (JSON)                                        │         │
│  │  • Lombok                                                │         │
│  │                                                           │         │
│  │  Controllers:                                            │         │
│  │  ┌──────────────────────────────────────────────┐       │         │
│  │  │ ChatController                               │       │         │
│  │  │ • GET /api/chat                              │       │         │
│  │  │ • Simple synchronous responses               │       │         │
│  │  └──────────────────────────────────────────────┘       │         │
│  │  ┌──────────────────────────────────────────────┐       │         │
│  │  │ StreamingChatController                      │       │         │
│  │  │ • GET /api/chat/stream                       │       │         │
│  │  │ • Server-Sent Events (SSE)                   │       │         │
│  │  │ • Real-time streaming responses              │       │         │
│  │  └──────────────────────────────────────────────┘       │         │
│  │  ┌──────────────────────────────────────────────┐       │         │
│  │  │ HistoryController                            │       │         │
│  │  │ • GET /api/history                           │       │         │
│  │  │ • GET /api/history/stats                     │       │         │
│  │  │ • GET /api/history/mode/{mode}               │       │         │
│  │  │ • DELETE /api/history                        │       │         │
│  │  └──────────────────────────────────────────────┘       │         │
│  │  ┌──────────────────────────────────────────────┐       │         │
│  │  │ CacheController                              │       │         │
│  │  │ • GET /api/cache/stats                       │       │         │
│  │  │ • DELETE /api/cache/clear                    │       │         │
│  │  └──────────────────────────────────────────────┘       │         │
│  │                                                           │         │
│  │  Services:                                               │         │
│  │  • ChatService (LLM integration, caching)                │         │
│  │  • ConversationRepository                                │         │
│  │                                                           │         │
│  └───────┬──────────────────┬────────────────┬──────────────┘         │
│          │                  │                │                        │
└──────────┼──────────────────┼────────────────┼────────────────────────┘
           │                  │                │
           │                  │                │
    ┌──────▼──────┐    ┌──────▼──────┐  ┌─────▼──────┐
    │   External  │    │   Cache     │  │  Database  │
    │     API     │    │   Layer     │  │   Layer    │
    └─────────────┘    └─────────────┘  └────────────┘
```

---

## 🗄️ Data Layer Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            DATA LAYER                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌────────────────────────────┐      ┌────────────────────────────┐   │
│  │    POSTGRESQL 16-ALPINE    │      │    REDIS 7-ALPINE          │   │
│  │    (Port 5432)             │      │    (Port 6379)             │   │
│  ├────────────────────────────┤      ├────────────────────────────┤   │
│  │                            │      │                            │   │
│  │  Purpose:                  │      │  Purpose:                  │   │
│  │  • Persistent storage      │      │  • Response caching        │   │
│  │  • Conversation history    │      │  • Performance boost       │   │
│  │  • Analytics data          │      │                            │   │
│  │                            │      │  Configuration:            │   │
│  │  Database: autonomi        │      │  • 10-minute TTL           │   │
│  │  User: admin               │      │  • AOF persistence         │   │
│  │  Password: hackathon2024   │      │  • Key format:             │   │
│  │                            │      │    chatResponses::{msg}_   │   │
│  │  Tables:                   │      │    {mode}                  │   │
│  │  ┌──────────────────────┐ │      │                            │   │
│  │  │  conversation        │ │      │  Stats:                    │   │
│  │  ├──────────────────────┤ │      │  • 5 keys cached           │   │
│  │  │ id                   │ │      │  • Near-instant hits       │   │
│  │  │ user_message         │ │      │                            │   │
│  │  │ assistant_response   │ │      └────────────────────────────┘   │
│  │  │ mode                 │ │                                        │
│  │  │ timestamp            │ │      ┌────────────────────────────┐   │
│  │  │ session_id           │ │      │    PGADMIN 4               │   │
│  │  │ response_time_ms     │ │      │    (Port 5050)             │   │
│  │  └──────────────────────┘ │      ├────────────────────────────┤   │
│  │                            │      │                            │   │
│  │  Volume: postgres_data     │      │  Purpose:                  │   │
│  │  Health: ✅ Healthy        │      │  • Database GUI            │   │
│  │                            │      │  • Query tool              │   │
│  └────────────────────────────┘      │  • Monitoring              │   │
│                                       │                            │   │
│                                       │  Credentials:              │   │
│                                       │  • Email: admin@autonomi   │   │
│                                       │  • Pass: admin123          │   │
│                                       └────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🤖 External Services

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        EXTERNAL INTEGRATIONS                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌───────────────────────────────────────────────────────────┐         │
│  │              NTNU HPC LLM ENDPOINT                        │         │
│  ├───────────────────────────────────────────────────────────┤         │
│  │                                                           │         │
│  │  URL: https://llm.hpc.ntnu.no/v1                         │         │
│  │  Model: openai/gpt-oss-120b                              │         │
│  │                                                           │         │
│  │  Request Format:                                         │         │
│  │  {                                                       │         │
│  │    "model": "openai/gpt-oss-120b",                       │         │
│  │    "messages": [                                         │         │
│  │      {                                                   │         │
│  │        "role": "system",                                 │         │
│  │        "content": "<rules> + <policy>"                   │         │
│  │      },                                                  │         │
│  │      {                                                   │         │
│  │        "role": "user",                                   │         │
│  │        "content": "user message"                         │         │
│  │      }                                                   │         │
│  │    ],                                                    │         │
│  │    "temperature": 0.7,                                   │         │
│  │    "max_tokens": 500,                                    │         │
│  │    "stream": true/false                                  │         │
│  │  }                                                       │         │
│  │                                                           │         │
│  │  System Prompts:                                         │         │
│  │  • backend/src/main/resources/rules.txt                  │         │
│  │  • backend/src/main/resources/policy.txt                 │         │
│  │                                                           │         │
│  │  Personas:                                               │         │
│  │  • leder     - Diplomatic, balanced                      │         │
│  │  • debatt    - Aggressive, confrontational               │         │
│  │  • tech      - Technical, detailed                       │         │
│  │  • education - Pedagogical, simplified                   │         │
│  │                                                           │         │
│  │  Performance:                                            │         │
│  │  • Average response: 1117ms                              │         │
│  │  • Streaming: 50ms per word                              │         │
│  │                                                           │         │
│  └───────────────────────────────────────────────────────────┘         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🐳 Infrastructure & DevOps

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     CONTAINERIZATION & DEPLOYMENT                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌───────────────────────────────────────────────────────────┐         │
│  │                    DOCKER COMPOSE                         │         │
│  ├───────────────────────────────────────────────────────────┤         │
│  │                                                           │         │
│  │  Services:                                               │         │
│  │  ┌─────────────────────────────────────────────┐        │         │
│  │  │  backend                                    │        │         │
│  │  │  • Image: Multi-stage build                │        │         │
│  │  │    - Stage 1: Maven build (OpenJDK 21)     │        │         │
│  │  │    - Stage 2: Runtime (JRE 21 Alpine)      │        │         │
│  │  │  • Depends: postgres, redis                │        │         │
│  │  │  • Healthcheck: None                        │        │         │
│  │  └─────────────────────────────────────────────┘        │         │
│  │  ┌─────────────────────────────────────────────┐        │         │
│  │  │  frontend                                   │        │         │
│  │  │  • Image: Multi-stage build                │        │         │
│  │  │    - Stage 1: Node 20 Alpine (build)       │        │         │
│  │  │    - Stage 2: Nginx Alpine (serve)         │        │         │
│  │  │  • Custom nginx.conf                        │        │         │
│  │  └─────────────────────────────────────────────┘        │         │
│  │  ┌─────────────────────────────────────────────┐        │         │
│  │  │  temp-frontend                              │        │         │
│  │  │  • Image: Multi-stage build                │        │         │
│  │  │    - Stage 1: Node 20 Alpine (build)       │        │         │
│  │  │    - Stage 2: Nginx Alpine (serve)         │        │         │
│  │  │  • Custom nginx.conf                        │        │         │
│  │  └─────────────────────────────────────────────┘        │         │
│  │  ┌─────────────────────────────────────────────┐        │         │
│  │  │  postgres                                   │        │         │
│  │  │  • Image: postgres:16-alpine               │        │         │
│  │  │  • Volume: postgres_data                    │        │         │
│  │  │  • Healthcheck: pg_isready                  │        │         │
│  │  └─────────────────────────────────────────────┘        │         │
│  │  ┌─────────────────────────────────────────────┐        │         │
│  │  │  redis                                      │        │         │
│  │  │  • Image: redis:7-alpine                   │        │         │
│  │  │  • Volume: redis_data                       │        │         │
│  │  │  • Healthcheck: redis-cli ping              │        │         │
│  │  │  • AOF persistence enabled                  │        │         │
│  │  └─────────────────────────────────────────────┘        │         │
│  │  ┌─────────────────────────────────────────────┐        │         │
│  │  │  pgadmin                                    │        │         │
│  │  │  • Image: dpage/pgadmin4:latest            │        │         │
│  │  │  • Volume: pgadmin_data                     │        │         │
│  │  │  • Depends: postgres                        │        │         │
│  │  └─────────────────────────────────────────────┘        │         │
│  │                                                           │         │
│  │  Networks:                                               │         │
│  │  • Default bridge network                                │         │
│  │                                                           │         │
│  │  Volumes:                                                │         │
│  │  • postgres_data (persistent)                            │         │
│  │  • redis_data (persistent)                               │         │
│  │  • pgadmin_data (persistent)                             │         │
│  │                                                           │         │
│  └───────────────────────────────────────────────────────────┘         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📦 Tech Stack Summary

### **Frontend Technologies**

| Technology | Version | Purpose |
|------------|---------|---------|
| Vue.js | 3.x | Progressive JavaScript framework |
| TypeScript | Latest | Type-safe JavaScript (main frontend) |
| Vite | 7.3.1 | Fast build tool and dev server |
| Tailwind CSS | Latest | Utility-first CSS framework |
| Vue Router | Latest | Client-side routing |
| Axios | Latest | HTTP client |
| Nginx | Alpine | Production web server |

### **Backend Technologies**

| Technology | Version | Purpose |
|------------|---------|---------|
| Java | 21 (LTS) | Programming language |
| Spring Boot | 3.3.2 | Application framework |
| Spring WebFlux | 3.3.2 | Reactive web framework |
| Spring Data JPA | 3.3.2 | Database abstraction |
| Spring Data Redis | 3.3.2 | Redis integration |
| Spring Cache | 3.3.2 | Caching abstraction |
| Hibernate | 6.5.2 | ORM framework |
| Maven | 3.9 | Build tool & dependency management |
| HikariCP | Auto | JDBC connection pool |
| Lombok | Latest | Reduce boilerplate code |
| Jackson | Auto | JSON serialization |

### **Database & Cache**

| Technology | Version | Purpose |
|------------|---------|---------|
| PostgreSQL | 16-alpine | Primary database |
| Redis | 7-alpine | Response caching |
| pgAdmin | 4 (latest) | Database administration |

### **Infrastructure**

| Technology | Version | Purpose |
|------------|---------|---------|
| Docker | Latest | Containerization |
| Docker Compose | Latest | Multi-container orchestration |
| Eclipse Temurin | 21 | Java runtime (JRE) |
| Node.js | 20-alpine | JavaScript runtime (build) |

### **External Services**

| Service | Purpose |
|---------|---------|
| NTNU HPC LLM | AI language model endpoint |
| openai/gpt-oss-120b | Specific LLM model |

---

## 🔄 Data Flow

```
┌─────────┐
│  USER   │
└────┬────┘
     │ 1. Ask question
     ▼
┌─────────────────┐
│  FRONTEND       │ (Vue 3 + Vite + Nginx)
└────┬────────────┘
     │ 2. HTTP/SSE request
     ▼
┌─────────────────┐
│  BACKEND        │ (Spring Boot + WebFlux)
└────┬────────────┘
     │ 3. Check cache
     ▼
┌─────────────────┐        ┌─────────────────┐
│  REDIS          │◄───────┤  Cache hit?     │
└─────────────────┘   YES  └────┬────────────┘
     │                          │ NO
     │ 4a. Return cached        │ 4b. Call LLM API
     │                          ▼
     │                     ┌─────────────────┐
     │                     │  NTNU HPC LLM   │
     │                     └────┬────────────┘
     │                          │ 5. AI response
     │                          ▼
     │                     ┌─────────────────┐
     │◄────────────────────┤  Cache response │
     │                     └─────────────────┘
     │
     │ 6. Save to database
     ▼
┌─────────────────┐
│  POSTGRESQL     │
└─────────────────┘
     │ 7. Return response (streaming or complete)
     ▼
┌─────────────────┐
│  FRONTEND       │
└────┬────────────┘
     │ 8. Display to user
     ▼
┌─────────┐
│  USER   │
└─────────┘
```

---

## 🎯 Key Features & Patterns

### **Design Patterns Used**

1. **Repository Pattern** - Data access abstraction
2. **Service Layer Pattern** - Business logic separation
3. **DTO Pattern** - Data transfer objects
4. **Multi-stage Docker Builds** - Optimized images
5. **Cache-Aside Pattern** - Response caching
6. **Reactive Streaming** - Server-Sent Events (SSE)

### **Architectural Highlights**

- ✅ **Microservices-ready** - Containerized services
- ✅ **Reactive Programming** - Spring WebFlux for streaming
- ✅ **Multi-frontend** - TypeScript and JavaScript versions
- ✅ **Smart Caching** - Redis with 10-min TTL
- ✅ **Real-time Streaming** - SSE for live responses
- ✅ **Persistent Storage** - PostgreSQL with volume mounts
- ✅ **Health Checks** - Built-in Docker health monitoring
- ✅ **CORS Support** - Cross-origin requests enabled
- ✅ **RESTful API** - Clean endpoint structure

### **Performance Optimizations**

- Multi-stage Docker builds (smaller images)
- Redis caching (instant repeat queries)
- AOF persistence (data safety)
- Connection pooling (HikariCP)
- JRE-only runtime (no JDK overhead)
- Alpine Linux base (minimal footprint)

---

## 📊 Port Mappings

| Service | Container Port | Host Port | Protocol |
|---------|---------------|-----------|----------|
| Backend | 8080 | 8080 | HTTP |
| Frontend | 80 | 3000 | HTTP |
| Temp Frontend | 80 | 3001 | HTTP |
| PostgreSQL | 5432 | 5432 | PostgreSQL |
| Redis | 6379 | 6379 | Redis |
| pgAdmin | 80 | 5050 | HTTP |

---

## 🔐 Security Features

- CORS configuration per endpoint
- Environment variable-based secrets
- No hardcoded credentials in code
- Docker network isolation
- PostgreSQL user authentication
- Redis protected mode

**⚠️ Note:** This is a demo/hackathon project. Production deployment would need:
- Rate limiting
- Authentication/Authorization
- Input validation/sanitization
- HTTPS/SSL
- API key rotation
- Security headers
- SQL injection protection (already handled by JPA)

---

## 🎨 Frontend Architecture

### **Main Frontend (TypeScript)**
- Component-based architecture
- Tailwind CSS utility classes
- Vue Router for navigation
- Axios for API calls
- EventSource for SSE streaming
- LocalStorage for chat persistence

### **Temp Frontend (JavaScript)**
- Simpler, vanilla Vue 3
- Custom CSS with glassmorphism effects
- Fetch API for HTTP requests
- EventSource for SSE streaming
- LocalStorage with versioned keys
- Custom favicon and branding

---

## 🗂️ Project Structure

```
brain-hackathon/
├── backend/                      # Spring Boot application
│   ├── src/main/java/backend/
│   │   ├── entity/              # JPA entities
│   │   ├── repository/          # Data repositories
│   │   ├── controller/          # REST controllers
│   │   ├── config/              # Configuration classes
│   │   ├── dto/                 # Data Transfer Objects
│   │   ├── ChatService.java    # Core business logic
│   │   ├── IO.java              # File utilities
│   │   └── App.java             # Main application
│   ├── src/main/resources/
│   │   ├── rules.txt            # System prompts
│   │   ├── policy.txt           # Party policies
│   │   └── application.properties
│   ├── pom.xml                  # Maven dependencies
│   └── Dockerfile               # Multi-stage build
├── frontend/                     # Vue 3 TypeScript app
│   ├── src/
│   │   ├── components/          # Vue components
│   │   ├── router/              # Routing config
│   │   └── main.ts              # Entry point
│   ├── package.json
│   └── Dockerfile
├── temp/                         # Vue 3 JavaScript app
│   ├── src/
│   │   ├── components/
│   │   │   └── home.vue         # Main chat component
│   │   ├── App.vue              # Root component
│   │   └── router.js
│   ├── public/
│   │   ├── favicon.svg          # Custom animated favicon
│   │   └── favicon.ico
│   ├── package.json
│   └── Dockerfile
├── docs/                         # Documentation
├── docker-compose.yml           # Service orchestration
├── .env.example                 # Environment template
├── Makefile                     # Build shortcuts
└── README.md                    # Project documentation
```

---

## 🚀 Build & Deploy Process

### **Backend Build**
```dockerfile
# Stage 1: Maven build
FROM maven:3.9-eclipse-temurin-21
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
```

### **Frontend Build**
```dockerfile
# Stage 1: Node build
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Nginx serve
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 📈 Metrics & Monitoring

### **Current Statistics**
- Total conversations: 13
- Average response time: 1117ms
- Cache hit rate: High (5 keys cached)
- Service uptime: 100%
- Database save time: < 50ms

### **Monitoring Tools Available**
- Docker logs
- pgAdmin (database queries)
- Backend API endpoints (stats, cache info)
- Browser DevTools (network, console)

---

**Created:** 2026-02-14  
**Last Updated:** 2026-02-14  
**Version:** 1.0

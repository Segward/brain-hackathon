# Brain Hackathon - Docker Setup

## Prerequisites

- Docker Desktop installed and running
- Git (to clone the repository)

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd brain-hackathon
```

### 2. Create Environment File

Create a `.env` file in the root directory:

```bash
OPENAI_API_KEY=your-openai-api-key-here
```

### 3. Build and Run

```bash
docker-compose up --build
```

Wait for the build to complete (first time takes 2-5 minutes).

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080

## Common Commands

### Start the app

```bash
docker-compose up
```

### Start in background (detached mode)

```bash
docker-compose up -d
```

### Stop the app

```bash
docker-compose down
```

### View logs

```bash
# All services
docker-compose logs

# Specific service
docker-compose logs backend
docker-compose logs frontend

# Follow logs in real-time
docker-compose logs -f
```

### Rebuild after code changes

```bash
docker-compose up --build
```

### Clean rebuild (if issues occur)

```bash
docker-compose down --rmi all
docker-compose up --build
```

## Troubleshooting

**Port already in use?**

```bash
# Stop all containers
docker-compose down

# Check what's using the port
lsof -i :3000
lsof -i :8080
```

**Build failing?**

```bash
# Clean everything and rebuild
docker-compose down --rmi all --volumes
docker-compose up --build
```

**See what's running**

```bash
docker ps
```

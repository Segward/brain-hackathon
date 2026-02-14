.PHONY: up down build restart logs logs-backend logs-frontend logs-temp ps clean

# Start all services
up:
	docker compose up -d

# Start and force rebuild
up-build:
	docker compose up -d --build

# Stop all services
down:
	docker compose down

# Build all images
build:
	docker compose build

# Rebuild without cache
build-clean:
	docker compose build --no-cache

# Restart all services
restart:
	docker compose restart

# Tail logs for all services
logs:
	docker compose logs -f

# Tail logs per service
logs-backend:
	docker compose logs -f backend

logs-frontend:
	docker compose logs -f frontend

logs-temp:
	docker compose logs -f temp-frontend

# Show running containers
ps:
	docker compose ps

# Stop and remove everything (containers, networks, images)
clean:
	docker compose down --rmi all --volumes --remove-orphans

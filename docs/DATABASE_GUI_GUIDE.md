# Database GUI Access Guide

## Quick Access to pgAdmin

### 1. Start the Services

```bash
docker-compose up -d
```

### 2. Open pgAdmin in Browser

```
http://localhost:5050
```

### 3. Login to pgAdmin

- **Email:** `admin@autonomi.no`
- **Password:** `admin123`

### 4. Add Database Server (First Time Only)

Once logged in:

1. **Right-click** on "Servers" in the left sidebar
2. Click **"Register" → "Server..."**

#### General Tab:

- **Name:** `Autonomi Database` (or any name you prefer)

#### Connection Tab:

- **Host name/address:** `postgres` (this is the Docker service name)
- **Port:** `5432`
- **Maintenance database:** `autonomi`
- **Username:** `admin`
- **Password:** `hackathon2024`
- ✅ Check "Save password"

5. Click **"Save"**

### 5. View Data

After connecting, navigate:

```
Servers
  └── Autonomi Database
      └── Databases
          └── autonomi
              └── Schemas
                  └── public
                      └── Tables
                          └── conversations (right-click → View/Edit Data → All Rows)
```

## Common Tasks

### View All Conversations

1. Expand: `Servers → Autonomi Database → Databases → autonomi → Schemas → public → Tables`
2. Right-click `conversations` table
3. Select **"View/Edit Data" → "All Rows"**

### Run Custom SQL Queries

1. Right-click on `autonomi` database
2. Select **"Query Tool"**
3. Type your SQL and click ▶️ Execute

**Example queries:**

```sql
-- Get latest 20 conversations
SELECT * FROM conversations
ORDER BY timestamp DESC
LIMIT 20;

-- Count conversations by mode
SELECT mode, COUNT(*) as count
FROM conversations
GROUP BY mode;

-- Get conversations from today
SELECT * FROM conversations
WHERE timestamp >= CURRENT_DATE
ORDER BY timestamp DESC;

-- Average response time by mode
SELECT mode, AVG(response_time_ms) as avg_response_time
FROM conversations
WHERE response_time_ms IS NOT NULL
GROUP BY mode;
```

### Export Data

1. Right-click on `conversations` table
2. Select **"Import/Export..."**
3. Toggle **"Export"**
4. Choose format (CSV, JSON, etc.)
5. Click **"OK"**

### Clear All Conversations

```sql
DELETE FROM conversations;
```

## Alternative: Command Line Access

If you prefer CLI:

```bash
# Access PostgreSQL CLI
docker exec -it brain-hackathon-postgres psql -U admin -d autonomi

# List tables
\dt

# View all conversations
SELECT * FROM conversations ORDER BY timestamp DESC LIMIT 10;

# Exit
\q
```

## Alternative: Desktop Database Clients

You can also connect using desktop applications:

### DBeaver (Free, Cross-platform)

- Download: https://dbeaver.io/download/
- **Connection:**
  - Host: `localhost`
  - Port: `5432`
  - Database: `autonomi`
  - Username: `admin`
  - Password: `hackathon2024`

### TablePlus (Mac/Windows)

- Download: https://tableplus.com/
- **Connection:**
  - Host: `localhost`
  - Port: `5432`
  - Database: `autonomi`
  - User: `admin`
  - Password: `hackathon2024`

### pgAdmin Desktop (Cross-platform)

- Download: https://www.postgresql.org/ftp/pgadmin/pgadmin4/
- Same connection details as above

## Troubleshooting

### Can't Access pgAdmin (Port 5050)

```bash
# Check if pgAdmin is running
docker ps | grep pgadmin

# View pgAdmin logs
docker-compose logs pgadmin

# Restart pgAdmin
docker-compose restart pgadmin
```

### Connection Refused to PostgreSQL

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Check PostgreSQL health
docker-compose ps

# View PostgreSQL logs
docker-compose logs postgres
```

### Forgot pgAdmin Password

Stop containers and restart:

```bash
docker-compose down
docker volume rm brain-hackathon_pgadmin_data
docker-compose up -d
```

Then login with default credentials again.

---

**Quick Summary:**

1. Go to http://localhost:5050
2. Login: `admin@autonomi.no` / `admin123`
3. Add server with host: `postgres`, port: `5432`, database: `autonomi`, user: `admin`, password: `hackathon2024`
4. Browse data: Servers → Autonomi Database → Databases → autonomi → Schemas → public → Tables → conversations

# Redis Viewing Guide

## Quick Access Methods

### Method 1: Redis CLI (Fastest - Built-in)

```bash
# Connect to Redis CLI
docker exec -it brain-hackathon-redis redis-cli

# Once inside, try these commands:
```

**Common Redis Commands:**

```redis
# View all cached keys
KEYS *

# View only chat cache keys
KEYS chatResponses::*

# Count total keys
DBSIZE

# Get a specific cached value (replace with actual key)
GET "chatResponses::Hva mener dere om AI?_leder"

# View key info
TYPE "chatResponses::Hva mener dere om AI?_leder"
TTL "chatResponses::Hva mener dere om AI?_leder"

# Monitor all Redis commands in real-time
MONITOR

# View Redis info
INFO

# Clear all cache (⚠️ Warning: This deletes everything!)
FLUSHDB

# Exit
exit
```

---

### Method 2: Backend API (Easiest for Beginners)

The backend has built-in endpoints to view cache:

**Get Cache Statistics:**
```bash
curl http://localhost:8080/api/cache/stats
```

**Response:**
```json
{
  "cacheType": "RedisCache",
  "cacheName": "chatResponses",
  "totalKeys": 15,
  "cacheEnabled": true
}
```

**View All Cache Keys:**
```bash
curl http://localhost:8080/api/cache/keys
```

**Clear Cache:**
```bash
curl -X DELETE http://localhost:8080/api/cache/clear
```

---

### Method 3: Redis GUI Tools (Best Visualization)

#### Option A: RedisInsight (Official, Free)

**Download:**
https://redis.com/redis-enterprise/redis-insight/

**Connection Settings:**
- **Host:** `localhost`
- **Port:** `6379`
- **Name:** `Autonomi Cache`
- **No password required**

**Features:**
- 🎨 Visual key browser
- 📊 Real-time monitoring
- 🔍 Search keys
- 📈 Memory analysis
- ⚡ Performance metrics

#### Option B: Another Redis Desktop Manager (Free, Cross-platform)

**Download:**
https://github.com/qishibo/AnotherRedisDesktopManager/releases

**Connection:**
- **Name:** Autonomi
- **Host:** localhost
- **Port:** 6379
- **Auth:** Leave empty

#### Option C: Redis Commander (Web-based)

**Run with Docker:**
```bash
docker run --rm --name redis-commander \
  -d --network brain-hackathon_app-network \
  -p 8081:8081 \
  rediscommander/redis-commander:latest \
  --redis-host=redis
```

**Access:** http://localhost:8081

---

## Useful Redis Inspection Scripts

### View All Cached Conversations

**Bash script:**
```bash
#!/bin/bash
# view-cache.sh

echo "=== Redis Cache Viewer ==="
echo ""

# Connect and get all chat cache keys
docker exec -it brain-hackathon-redis redis-cli KEYS "chatResponses::*" | while read key; do
    if [ ! -z "$key" ]; then
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "Key: $key"
        
        # Get TTL
        ttl=$(docker exec -it brain-hackathon-redis redis-cli TTL "$key" | tr -d '\r')
        echo "TTL: $ttl seconds"
        
        # Get value length
        len=$(docker exec -it brain-hackathon-redis redis-cli STRLEN "$key" | tr -d '\r')
        echo "Length: $len bytes"
        echo ""
    fi
done
```

**Usage:**
```bash
chmod +x view-cache.sh
./view-cache.sh
```

### Monitor Cache Activity in Real-time

```bash
# Watch Redis commands as they happen
docker exec -it brain-hackathon-redis redis-cli MONITOR
```

Press `Ctrl+C` to stop.

---

## Understanding the Cache Structure

### Key Format:
```
chatResponses::{userMessage}_{mode}
```

**Examples:**
```
chatResponses::Hva mener dere om AI?_leder
chatResponses::Hvorfor obligatorisk AI i yrkesfag?_debatt
chatResponses::Hva er borgerlønn?_leder
```

### Value Format:
Plain text string containing the AI's response.

### TTL (Time To Live):
- **Default:** 600 seconds (10 minutes)
- Configured in: `backend/src/main/java/backend/config/CacheConfig.java`

---

## Quick Redis Cheat Sheet

| Command | Description | Example |
|---------|-------------|---------|
| `KEYS pattern` | Find keys matching pattern | `KEYS chatResponses::*` |
| `GET key` | Get value of key | `GET "chatResponses::test_leder"` |
| `SET key value` | Set a key | `SET mykey "hello"` |
| `DEL key` | Delete a key | `DEL mykey` |
| `EXISTS key` | Check if key exists | `EXISTS mykey` |
| `TTL key` | Get remaining TTL | `TTL mykey` |
| `EXPIRE key seconds` | Set TTL | `EXPIRE mykey 300` |
| `DBSIZE` | Count all keys | `DBSIZE` |
| `FLUSHDB` | Delete all keys | `FLUSHDB` |
| `INFO` | Server info | `INFO` |
| `MONITOR` | Watch commands | `MONITOR` |
| `PING` | Test connection | `PING` |

---

## Troubleshooting

### Can't Connect to Redis

```bash
# Check if Redis is running
docker ps | grep redis

# Check Redis logs
docker-compose logs redis

# Test connection
docker exec -it brain-hackathon-redis redis-cli ping
# Should return: PONG
```

### Cache Not Working

```bash
# Check cache stats via API
curl http://localhost:8080/api/cache/stats

# View backend logs for cache operations
docker-compose logs backend | grep -i cache

# Clear cache and test again
curl -X DELETE http://localhost:8080/api/cache/clear
```

### Redis Out of Memory

```bash
# Check memory usage
docker exec -it brain-hackathon-redis redis-cli INFO memory

# Clear all data
docker exec -it brain-hackathon-redis redis-cli FLUSHDB
```

---

## Advanced: Redis Persistence

Redis in this setup uses **AOF (Append-Only File)** for persistence.

**Check persistence status:**
```bash
docker exec -it brain-hackathon-redis redis-cli INFO persistence
```

**Backup Redis data:**
```bash
# Create backup
docker exec brain-hackathon-redis redis-cli BGSAVE

# Copy backup file
docker cp brain-hackathon-redis:/data/dump.rdb ./redis-backup.rdb
```

**Restore Redis data:**
```bash
# Stop Redis
docker-compose stop redis

# Copy backup file
docker cp ./redis-backup.rdb brain-hackathon-redis:/data/dump.rdb

# Start Redis
docker-compose start redis
```

---

## Quick Summary

| Method | Best For | Access |
|--------|----------|--------|
| **Redis CLI** | Quick inspection, power users | `docker exec -it brain-hackathon-redis redis-cli` |
| **Backend API** | Non-technical users, automation | http://localhost:8080/api/cache/stats |
| **RedisInsight** | Visual exploration, monitoring | Download & connect to localhost:6379 |
| **Redis Commander** | Web-based GUI | `docker run` + http://localhost:8081 |

**Recommended for beginners:** Start with Backend API, then try RedisInsight for visualization.

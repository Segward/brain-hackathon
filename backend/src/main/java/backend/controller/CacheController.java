package backend.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.cache.CacheManager;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/cache")
public class CacheController {

    private final CacheManager cacheManager;
    private final RedisTemplate<String, String> redisTemplate;

    public CacheController(CacheManager cacheManager, RedisTemplate<String, String> redisTemplate) {
        this.cacheManager = cacheManager;
        this.redisTemplate = redisTemplate;
    }

    @GetMapping("/stats")
    public Map<String, Object> getCacheStats() {
        Map<String, Object> stats = new HashMap<>();

        var cache = cacheManager.getCache("chatResponses");
        if (cache != null) {
            var nativeCache = cache.getNativeCache();
            stats.put("cacheType", nativeCache.getClass().getSimpleName());
            stats.put("cacheName", "chatResponses");
        }

        // Get Redis info
        try {
            var connectionFactory = redisTemplate.getConnectionFactory();
            if (connectionFactory == null) {
                throw new IllegalStateException("Redis connection factory is not configured");
            }

            try (var connection = connectionFactory.getConnection()) {
                var serverCommands = connection.serverCommands();
                if (serverCommands == null) {
                    throw new IllegalStateException("Redis server commands are not available");
                }

                Long dbSize = serverCommands.dbSize();
                stats.put("totalKeys", dbSize != null ? dbSize : 0L);
            }

            stats.put("cacheEnabled", true);
        } catch (Exception e) {
            stats.put("cacheEnabled", false);
            stats.put("error", e.getMessage());
        }

        return stats;
    }

    @DeleteMapping("/clear")
    public Map<String, String> clearCache() {
        var cache = cacheManager.getCache("chatResponses");
        if (cache != null) {
            cache.clear();
            return Map.of("message", "Cache cleared successfully");
        }
        return Map.of("message", "Cache not found");
    }

    @GetMapping("/keys")
    public Map<String, Object> getCacheKeys() {
        Map<String, Object> result = new HashMap<>();
        try {
            var keys = redisTemplate.keys("chatResponses::*");
            result.put("keys", keys);
            result.put("count", keys != null ? keys.size() : 0);
        } catch (Exception e) {
            result.put("error", e.getMessage());
        }
        return result;
    }
}

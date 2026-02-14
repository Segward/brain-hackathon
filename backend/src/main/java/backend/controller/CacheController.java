package backend.controller;

import org.springframework.cache.CacheManager;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

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
            Long dbSize = redisTemplate.getConnectionFactory()
                .getConnection()
                .serverCommands()
                .dbSize();
            stats.put("totalKeys", dbSize);
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

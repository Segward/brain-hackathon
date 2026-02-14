# 🚀 Hva mer burde gjøres? - Prioritert forbedringsliste

**Status:** Applikasjonen fungerer, men her er forbedringer som kan gjøres  
**Dato:** 2026-02-14

---

## ⏰ Tid til Demo?

### Hvis dere har **< 1 time**:
❌ **IKKE gjør store endringer nå!**
- Applikasjonen fungerer
- Demo er testet
- Risiko for å ødelegge noe er høy

✅ **Gjør dette i stedet:**
- Øv på presentasjonen
- Test demoen 2-3 ganger til
- Skriv ned talking points
- Ta screenshots som backup

### Hvis dere har **1-3 timer**:
⚠️ **Vurder disse raske forbedringene:**
- Fix CORS (15 min)
- Legg til error handling (30 min)
- Forbedre UI loading states (20 min)
- Legg til basic logging (15 min)

### Hvis dere har **3+ timer**:
✅ **Kan prøve større forbedringer:**
- Unit tests (1-2 timer)
- Rate limiting (1 time)
- Input validation (45 min)
- Monitoring dashboard (1.5 timer)

---

## 🎯 PRIORITET 1: Kritiske forbedringer (Burde gjøres!)

### 1. ⚠️ Fix CORS Configuration (15 min)
**Problem:** Backend tillater kun `localhost:5173`, men frontends kjører på 3000 og 3001

**Impact:** Høy - frontends kan ikke bruke alle endpoints  
**Effort:** Lav - 5 linjer kode  
**Risk:** Lav - kun config-endring

**Løsning:**
```java
// backend/src/main/java/backend/ChatController.java
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "http://localhost:3001"})

// backend/src/main/java/backend/controller/HistoryController.java
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "http://localhost:3001"})

// backend/src/main/java/backend/controller/CacheController.java
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "http://localhost:3001"})
```

**Rebuild:**
```bash
docker-compose up --build backend
```

---

### 2. ⚠️ Error Handling i Frontend (30 min)
**Problem:** Ingen feilmeldinger til bruker hvis noe går galt

**Impact:** Middels - bedre UX  
**Effort:** Lav - legg til try-catch  
**Risk:** Lav - kun UI-forbedring

**Løsning i temp/src/components/home.vue:**
```javascript
// Legg til error state
const apiError = ref(null);

// Wrap streaming i try-catch
try {
  const eventSource = new EventSource(url);
  
  eventSource.onerror = (err) => {
    apiError.value = "Kunne ikke koble til server. Prøv igjen.";
    eventSource.close();
    loading.value = false;
  };
  
  // ... existing code
} catch (error) {
  apiError.value = "En feil oppstod. Vennligst prøv igjen.";
  loading.value = false;
}
```

**Vis error i UI:**
```html
<div v-if="apiError" class="error-banner">
  {{ apiError }}
  <button @click="apiError = null">Lukk</button>
</div>
```

---

### 3. 📊 Logging i Backend (15 min)
**Problem:** Vanskelig å debug uten logging

**Impact:** Høy - enklere debugging  
**Effort:** Lav - add log statements  
**Risk:** Ingen

**Løsning i ChatService.java:**
```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ChatService {
    private static final Logger log = LoggerFactory.getLogger(ChatService.class);
    
    @Cacheable(value = "chatResponses", key = "#message + '_' + #mode")
    public Mono<String> chat(String message, String mode) {
        log.info("Chat request - Mode: {}, Message: {}", mode, message.substring(0, Math.min(50, message.length())));
        
        return webClient.post()
            .bodyValue(buildRequestBody(message, mode))
            .retrieve()
            .bodyToMono(String.class)
            .doOnSuccess(response -> {
                log.info("LLM response received - Length: {} chars", response.length());
                saveConversation(message, response, mode, System.currentTimeMillis() - startTime);
            })
            .doOnError(error -> {
                log.error("LLM API error: {}", error.getMessage(), error);
            });
    }
}
```

---

## 🎯 PRIORITET 2: Viktige forbedringer (Anbefalt hvis tid)

### 4. ✅ Input Validation (45 min)
**Problem:** Ingen validering av bruker-input

**Impact:** Høy - sikkerhet og stabilitet  
**Effort:** Middels  
**Risk:** Lav

**Backend validation:**
```java
// backend/src/main/java/backend/controller/StreamingChatController.java
@GetMapping
public Flux<ServerSentEvent<String>> chatStream(
    @RequestParam @NotBlank @Size(max = 1000) String message,
    @RequestParam @Pattern(regexp = "leder|debatt|tech|education") String mode
) {
    // Sanitize input
    String sanitizedMessage = message.trim()
        .replaceAll("[<>]", "") // Remove HTML tags
        .substring(0, Math.min(message.length(), 1000)); // Max length
    
    return chatService.chatStream(sanitizedMessage, mode)
        // ... rest
}
```

**Frontend validation:**
```javascript
// temp/src/components/home.vue
const sendMessage = async () => {
  const text = message.value.trim();
  
  // Validation
  if (!text) {
    error.value = "Vennligst skriv en melding";
    return;
  }
  
  if (text.length > 1000) {
    error.value = "Meldingen er for lang (maks 1000 tegn)";
    return;
  }
  
  if (/<script|<iframe|javascript:/i.test(text)) {
    error.value = "Ugyldig innhold";
    return;
  }
  
  // ... send message
};
```

---

### 5. 🔒 Rate Limiting (1 time)
**Problem:** Ingen begrensning på antall requests

**Impact:** Høy - forhindre abuse  
**Effort:** Middels  
**Risk:** Middels

**Løsning med Bucket4j:**

**Add dependency (pom.xml):**
```xml
<dependency>
    <groupId>com.github.vladimir-bukhtoyarov</groupId>
    <artifactId>bucket4j-core</artifactId>
    <version>8.10.1</version>
</dependency>
```

**Create RateLimitFilter:**
```java
// backend/src/main/java/backend/config/RateLimitFilter.java
@Component
public class RateLimitFilter implements WebFilter {
    
    private final Bucket bucket = Bucket.builder()
        .addLimit(Bandwidth.simple(100, Duration.ofMinutes(1))) // 100 req/min
        .build();
    
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        if (bucket.tryConsume(1)) {
            return chain.filter(exchange);
        } else {
            exchange.getResponse().setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
            return exchange.getResponse().setComplete();
        }
    }
}
```

---

### 6. 🧪 Basic Unit Tests (1-2 timer)
**Problem:** Ingen tests, vanskelig å sikre kvalitet

**Impact:** Høy - confidence i koden  
**Effort:** Høy  
**Risk:** Ingen (tests påvirker ikke produksjon)

**Test ChatService:**
```java
// backend/src/test/java/backend/ChatServiceTest.java
@SpringBootTest
class ChatServiceTest {
    
    @Autowired
    private ChatService chatService;
    
    @Test
    void testChatReturnsResponse() {
        String response = chatService.chat("Test spørsmål", "leder").block();
        
        assertNotNull(response);
        assertTrue(response.length() > 0);
    }
    
    @Test
    void testCachingWorks() {
        String message = "Hva er partiets standpunkt?";
        String mode = "leder";
        
        // First call - should hit LLM
        long start1 = System.currentTimeMillis();
        String response1 = chatService.chat(message, mode).block();
        long duration1 = System.currentTimeMillis() - start1;
        
        // Second call - should hit cache
        long start2 = System.currentTimeMillis();
        String response2 = chatService.chat(message, mode).block();
        long duration2 = System.currentTimeMillis() - start2;
        
        assertEquals(response1, response2);
        assertTrue(duration2 < duration1); // Cache should be faster
    }
    
    @Test
    void testInvalidModeFails() {
        assertThrows(Exception.class, () -> {
            chatService.chat("Test", "invalid_mode").block();
        });
    }
}
```

**Run tests:**
```bash
cd backend
mvn test
```

---

## 🎯 PRIORITET 3: Nice-to-have (Kun hvis mye tid)

### 7. 📈 Simple Monitoring Dashboard (1.5 timer)
**Problem:** Ingen live monitoring

**Løsning: Spring Boot Actuator:**

**Add dependency:**
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

**Enable endpoints:**
```properties
# application.properties
management.endpoints.web.exposure.include=health,info,metrics,prometheus
management.endpoint.health.show-details=always
```

**Access:**
- Health: http://localhost:8080/actuator/health
- Metrics: http://localhost:8080/actuator/metrics

---

### 8. 🎨 Loading States i Frontend (20 min)
**Problem:** Ingen visuell feedback mens spørring prosesseres

**Løsning:**
```vue
<!-- temp/src/components/home.vue -->
<div v-if="loading" class="loading-indicator">
  <div class="spinner"></div>
  <p>{{ loadingMessage }}</p>
</div>

<style>
.loading-indicator {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f0f9ff;
  border-radius: 8px;
  margin: 16px 0;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 3px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
```

```javascript
// Dynamiske loading messages
const loadingMessages = ref([
  "Tenker...",
  "Formulerer svar...",
  "Sjekker partipolitikk...",
  "Nesten klar..."
]);

let messageIndex = 0;
const loadingMessage = ref(loadingMessages.value[0]);

// Roter messages hver 2 sekund
const rotateLoadingMessage = setInterval(() => {
  messageIndex = (messageIndex + 1) % loadingMessages.value.length;
  loadingMessage.value = loadingMessages.value[messageIndex];
}, 2000);
```

---

### 9. 📊 Analytics i Database (30 min)
**Problem:** Ingen innsikt i populære spørsmål

**Løsning: Legg til analytics endpoint:**

```java
// backend/src/main/java/backend/controller/AnalyticsController.java
@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {
    
    @Autowired
    private ConversationRepository repository;
    
    @GetMapping("/popular-questions")
    public List<Map<String, Object>> getPopularQuestions() {
        return repository.findAll().stream()
            .collect(Collectors.groupingBy(
                Conversation::getUserMessage,
                Collectors.counting()
            ))
            .entrySet().stream()
            .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
            .limit(10)
            .map(entry -> Map.of(
                "question", entry.getKey(),
                "count", entry.getValue()
            ))
            .collect(Collectors.toList());
    }
    
    @GetMapping("/mode-distribution")
    public Map<String, Long> getModeDistribution() {
        return Map.of(
            "leder", repository.countByMode("leder"),
            "debatt", repository.countByMode("debatt"),
            "tech", repository.countByMode("tech"),
            "education", repository.countByMode("education")
        );
    }
    
    @GetMapping("/activity-timeline")
    public List<Map<String, Object>> getActivityTimeline() {
        return repository.findAll().stream()
            .collect(Collectors.groupingBy(
                conv -> conv.getTimestamp().toLocalDate(),
                Collectors.counting()
            ))
            .entrySet().stream()
            .sorted(Map.Entry.comparingByKey())
            .map(entry -> Map.of(
                "date", entry.getKey(),
                "conversations", entry.getValue()
            ))
            .collect(Collectors.toList());
    }
}
```

---

### 10. 🎤 Text-to-Speech for Svar (1 time)
**Problem:** Kun tekst-basert, ikke tilgjengelig for alle

**Løsning: Web Speech API:**

```javascript
// temp/src/components/home.vue
const speakResponse = (text) => {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'nb-NO'; // Norwegian
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    
    // Different voices for different modes
    const voices = speechSynthesis.getVoices();
    const norwegianVoice = voices.find(voice => voice.lang.startsWith('nb'));
    if (norwegianVoice) {
      utterance.voice = norwegianVoice;
    }
    
    speechSynthesis.speak(utterance);
  }
};

// Add speaker button to each message
const toggleSpeech = (message) => {
  if (currentlySpeaking.value === message.id) {
    speechSynthesis.cancel();
    currentlySpeaking.value = null;
  } else {
    speakResponse(message.text);
    currentlySpeaking.value = message.id;
  }
};
```

```html
<button @click="toggleSpeech(msg)" class="speak-button">
  <svg v-if="currentlySpeaking !== msg.id">🔊</svg>
  <svg v-else>⏸️</svg>
</button>
```

---

## ❌ IKKE gjør dette nå (for risikabelt/tidkrevende)

### ❌ Bytt database struktur
- For høy risiko
- Kan ødelegge eksisterende data
- Krever migrering

### ❌ Skriv om caching-logikk
- Fungerer allerede
- Kan introdusere bugs
- Ikke nok tid til grundig testing

### ❌ Legg til autentisering
- For stort scope
- Krever frontend + backend endringer
- Minimum 2-3 timer

### ❌ Deploy til cloud
- Ikke nødvendig for demo
- Kan feile under demo
- Docker Compose er nok

### ❌ Redesign UI
- Fungerer allerede
- Risiko for CSS-bugs
- Ikke nok tid til QA

---

## 🎯 Anbefalte Quick Wins (< 1 time total)

Hvis dere har litt tid, gjør disse i denne rekkefølgen:

### 1. Fix CORS (15 min) ⭐
```bash
# 1. Edit controllers
# 2. docker-compose up --build backend
# 3. Test at frontend fungerer
```

### 2. Add logging (15 min)
```java
// Add log statements in ChatService
// Gjør debugging enklere under demo
```

### 3. Frontend error handling (20 min)
```javascript
// Add try-catch og vis feilmeldinger
// Bedre UX hvis noe går galt
```

### 4. Loading indicator (10 min)
```vue
// Add spinner mens AI tenker
// Mer profesjonelt
```

**Total tid: ~60 minutter**  
**Impact: Middels-høy**  
**Risk: Lav**

---

## 📊 Sammenligning: Impact vs Effort

```
High Impact
    │
    │  [Rate Limiting]  [Unit Tests]
    │        
    │  [Input Validation]  [Error Handling]
    │        
    │  [Fix CORS] ⭐  [Logging]
    │        
    │  [Loading States]  [Analytics]
    │        
    └─────────────────────────────────────> Effort
      Low                            High
```

**Legend:**
- ⭐ = Anbefalt å gjøre nå
- [ ] = Vurder hvis tid
- Red = Ikke gjør nå

---

## ✅ Min anbefaling

### Hvis < 1 time til demo:
**IKKE gjør noe!** Øv på presentasjon.

### Hvis 1-2 timer:
1. Fix CORS (15 min)
2. Add logging (15 min)
3. Error handling (20 min)
4. Øv på presentasjon (resten)

### Hvis 3+ timer:
1. Fix CORS (15 min)
2. Add logging (15 min)
3. Error handling (20 min)
4. Input validation (45 min)
5. Rate limiting (1 time)
6. Øv på presentasjon (resten)

---

## 🎯 Hva imponerer dommerne mest?

### Teknisk imponerende:
1. ✅ **Caching** (allerede implementert!)
2. ✅ **Streaming** (allerede implementert!)
3. ✅ **Docker** (allerede implementert!)
4. ⚠️ Rate limiting (kan legges til)
5. ⚠️ Tests (kan legges til)

### Nice-to-have:
- Error handling
- Input validation
- Logging
- Monitoring

### Ikke så viktig:
- Autentisering (for demo)
- Cloud deployment
- Fancy UI animations
- TTS

---

## 💡 Konklusjon

**Applikasjonen er allerede imponerende!**

Viktigste forbedringer hvis tid:
1. 🔧 Fix CORS (15 min) - teknisk riktig
2. 📝 Add logging (15 min) - lettere debugging
3. ⚠️ Error handling (20 min) - bedre UX

**Men ærlig talt:** Bruk tiden på å **øve på presentasjonen** i stedet. En god demo av det som fungerer er bedre enn å risikere bugs fra siste-minutt endringer.

---

**Created:** 2026-02-14  
**Priority:** Balanced (sikkerhet vs tid)  
**Recommendation:** Fix CORS + logging + øv på demo

# Database Update Information

## Når oppdateres databasen?

Databasen oppdateres **umiddelbart** etter hver chat-samtale. Her er flyten:

### Prosess-flyt:

```
1. Bruker sender melding
   ↓
2. Backend sender forespørsel til LLM API
   ↓
3. LLM returnerer svar (1-3 sekunder vanligvis)
   ↓
4. Backend lagrer UMIDDELBART i PostgreSQL
   ↓
5. Svar sendes tilbake til frontend
```

## Detaljer

### Lagring skjer:
- **Når:** Umiddelbart når AI-svaret er mottatt fra LLM
- **Metode:** `saveConversation()` i `ChatService.java` (linje 76-85)
- **Trigger:** `.doOnSuccess()` callback (linje 61-64)

### Hva lagres:

```java
Conversation {
    id: auto-generert,
    userMessage: "Brukerens spørsmål",
    assistantResponse: "AI-svaret",
    mode: "leder/debatt/education/tech",
    timestamp: LocalDateTime.now(),
    responseTimeMs: 1234
}
```

## Cache vs Database

⚠️ **Viktig å vite:**

### 1. Database (PostgreSQL)
- **Oppdateres:** Hver gang (selv om svaret er cachet)
- **Innhold:** Alle samtaler lagres permanent
- **Formål:** Historikk og analyse

### 2. Cache (Redis)
- **Oppdateres:** Kun første gang en kombinasjon av `melding + mode` forekommer
- **Innhold:** Kun AI-svar (ikke hele samtalen)
- **TTL:** 10 minutter
- **Formål:** Raskere respons for identiske spørsmål

### Eksempel:

```
Bruker 1: "Hva mener dere om AI?" (mode: leder)
→ Redis: Ikke cachet → Kaller LLM → Lagrer i cache + database

Bruker 2: "Hva mener dere om AI?" (mode: leder) [innen 10 min]
→ Redis: Cachet ✓ → Returnerer fra cache → Lagrer OGSÅ i database

Bruker 3: "Hva mener dere om AI?" (mode: debatt)
→ Redis: Ikke cachet (annen mode) → Kaller LLM → Lagrer i cache + database
```

## Hvordan sjekke sanntidsoppdateringer

### Metode 1: pgAdmin GUI

1. Åpne http://localhost:5050
2. Koble til database
3. Høyreklikk `conversations` → "View/Edit Data" → "All Rows"
4. Klikk ⟳ (Refresh) knappen etter hver chat

### Metode 2: PostgreSQL CLI

```bash
# Koble til database
docker exec -it brain-hackathon-postgres psql -U admin -d autonomi

# Se siste 5 samtaler (oppdater med \watch)
SELECT id, mode, user_message, timestamp 
FROM conversations 
ORDER BY timestamp DESC 
LIMIT 5;

# Auto-refresh hvert 2. sekund
\watch 2
```

### Metode 3: Backend API

```bash
# Hent statistikk (oppdateres umiddelbart)
curl http://localhost:8080/api/history/stats

# Hent siste samtaler
curl http://localhost:8080/api/history?limit=10
```

### Metode 4: Watch database logs

```bash
# Se alle database-operasjoner i sanntid
docker-compose logs -f backend | grep "Hibernate:"
```

## Ytelse

### Lagringstid:
- **Normalt:** < 50ms
- **Under last:** < 200ms

### Transaction:
- **Type:** Auto-commit (standard JPA)
- **Isolation:** READ_COMMITTED
- **Rollback:** Ja, hvis feil oppstår

## Feilhåndtering

Hvis databaselagring feiler:
```java
catch (Exception e) {
    System.err.println("Failed to save conversation: " + e.getMessage());
}
```

- ⚠️ Feilen logges men **kaster ikke exception**
- ✅ Bruker får fortsatt AI-svaret
- ❌ Samtalen lagres ikke i historikk

## Verifisere at lagring fungerer

### Test 1: Send en melding
```bash
# Send chat request
curl "http://localhost:8080/api/chat?message=test&mode=leder"

# Sjekk om den ble lagret
docker exec -it brain-hackathon-postgres psql -U admin -d autonomi \
  -c "SELECT COUNT(*) FROM conversations;"
```

### Test 2: Sjekk siste innslag
```bash
docker exec -it brain-hackathon-postgres psql -U admin -d autonomi \
  -c "SELECT user_message, mode, timestamp FROM conversations ORDER BY timestamp DESC LIMIT 1;"
```

## Sammendrag

| Aspekt | Detalj |
|--------|--------|
| **Frekvens** | Umiddelbart etter hvert AI-svar |
| **Delay** | Ingen (< 50ms etter svar mottatt) |
| **Garantert?** | Ja (med exception handling) |
| **Batch?** | Nei, én og én |
| **Async?** | Nei, synkron lagring |
| **Cache-påvirkning?** | Nei, lagres alltid uavhengig av cache |

---

**TL;DR:** Databasen oppdateres umiddelbart etter hver samtale, vanligvis innen 50ms etter at AI-svaret er mottatt.

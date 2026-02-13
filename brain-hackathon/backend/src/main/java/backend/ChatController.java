package backend;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final OpenAIService openAIService;

    public ChatController(OpenAIService openAIService) {
        this.openAIService = openAIService;
    }

    // ---- Existing simple endpoint (backward compat) ----

    @GetMapping
    public Mono<String> chat(@RequestParam String message) {
        return openAIService.askChatGPT(message);
    }

    // ---- New streaming endpoint ----

    @PostMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> streamChat(@RequestBody StreamRequest request) {
        Object[] messages = buildMessages(request);
        return openAIService.streamChat(messages, request.model());
    }

    // ---- New non-streaming endpoint (fallback) ----

    @PostMapping
    public Mono<Map<String, Object>> postChat(@RequestBody StreamRequest request) {
        Object[] messages = buildMessages(request);
        return openAIService.chatWithMessages(messages, request.model())
                .map(reply -> Map.of(
                        "reply", (Object) reply,
                        "sources", request.useRag() ? getMockSources(request.lastUserMessage()) : List.of(),
                        "badges", detectBadges(request.lastUserMessage())
                ));
    }

    // ---- Build LLM messages array ----

    private Object[] buildMessages(StreamRequest request) {
        List<Map<String, String>> msgs = new ArrayList<>();

        // System prompt with persona + optional partiprogram context
        msgs.add(Map.of("role", "system", "content", buildSystemPrompt(request.persona(), request.useRag())));

        // Conversation history
        if (request.messages() != null) {
            for (var m : request.messages()) {
                msgs.add(Map.of("role", m.role(), "content", m.content()));
            }
        }

        return msgs.toArray();
    }

    private String buildSystemPrompt(String persona, boolean useRag) {
        String base = switch (persona != null ? persona : "leader") {
            case "leader" -> """
                    Du er Eira Nordvik, partilederen i Autonomipartiet. Du er inspirerende, visjonær og snakker med \
                    politisk kraft. Du bruker korte, slagkraftige punchlines. Du refererer til partiets verdier: \
                    teknologisk optimisme, nordisk tillit, demokratisk AI-styring. Svar alltid på norsk.""";
            case "education" -> """
                    Du er Lars Bergström, utdanningsministeren i Autonomipartiet. Du er konkret og reformorientert. \
                    Du fokuserer på vurdering, eksamen, AI-tilpasset læring og hvordan studenter skal vurderes i \
                    fremtidens skole. Du mener AI skal være et naturlig hjelpemiddel, ikke et jukse-problem. \
                    Svar alltid på norsk.""";
            case "tech" -> """
                    Du er Sofie Haugen, teknologiministeren i Autonomipartiet. Du tenker i arkitektur, systemer \
                    og infrastruktur. Du gir praktiske steg og tekniske anbefalinger. Du er opptatt av personvern, \
                    norsk digital suverenitet og open source. Svar alltid på norsk.""";
            default -> "Du er en AI-rådgiver for Autonomipartiet. Svar alltid på norsk.";
        };

        if (useRag) {
            base += """

                    PARTIPROGRAM – bruk dette som kilde og referer til relevante paragrafer:

                    §3.1 Fremtidens utdanning: AI-tilpassede læringsplaner for alle elever. Hver elev får personlig \
                    undervisning tilpasset nivå og læringsstil. Lærere frigjøres til veiledning og sosial utvikling.

                    §3.2 AI som verktøy i fagutdanning: Studenter skal lære å bruke AI som et profesjonelt verktøy \
                    i alle fagområder. Programmering, medisin, juss, ingeniørfag – AI integreres i pensum fra dag én.

                    §3.3 Eksamen i AI-alderen: Tradisjonell eksamen erstattes gradvis med porteføljevurdering. \
                    Studenter vurderes på kritisk tenkning, problemløsning og evne til å bruke AI effektivt – \
                    ikke memorering. Eksamen med AI tilgjengelig der prosessen vurderes, ikke bare resultatet.

                    §5.1 Klimahandling: Sanntids klimaovervåking med AI-sensorer i alle kommuner. Mål: 55% \
                    utslippskutt innen 2035. Prediktiv analyse for ekstremvær og smart energistyring.

                    §6.1 Autonom transport: Selvkjørende kollektivtransport i byer over 50 000 innen 2038. \
                    Gratis for studenter, pensjonister og lavinntektsgrupper. AI-optimert logistikk.

                    §7.1 Borgerlønn: Universell grunninntekt på 12 000 kr/mnd for alle over 18. Finansiert via \
                    automatiseringsskatt på bedrifter med over 50% AI-drevet produksjon. Supplement til omstilling.

                    §7.2 Fremtidens arbeidsplasser: Massive omstillingsprogram med rett til omskolering på statens \
                    regning. Nye jobber innen AI-tilsyn, dataetikk, og menneske-maskin-samarbeid.

                    §8.1 Digital suverenitet: Alle offentlige AI-systemer kjøres på norsk infrastruktur (NRIS/Sigma2). \
                    Ingen innbyggerdata sendes til utenlandske skytjenester. Åpen kildekode prioriteres.""";
        }

        return base;
    }

    // ---- Badge detection ----

    private List<String> detectBadges(String message) {
        if (message == null) return List.of("Generelt");
        String lower = message.toLowerCase();
        List<String> badges = new ArrayList<>();
        if (lower.matches(".*(?:eksamen|skole|utdanning|elev|lærer|vurdering|student).*")) badges.add("Utdanning");
        if (lower.matches(".*(?:jobb|arbeid|automatis|omstilling|ansatt).*")) badges.add("Arbeidsliv");
        if (lower.matches(".*(?:klima|co2|utslipp|miljø|energi).*")) badges.add("Klima");
        if (lower.matches(".*(?:transport|logistikk|buss|tog|selvkjørende).*")) badges.add("Transport");
        if (lower.matches(".*(?:borgerlønn|grunninntekt|velferd|trygd).*")) badges.add("Velferd");
        if (badges.isEmpty()) badges.add("Generelt");
        return badges;
    }

    // ---- Mock sources (RAG panel) ----

    private List<Map<String, String>> getMockSources(String message) {
        if (message == null) return List.of();
        String lower = message.toLowerCase();
        List<Map<String, String>> sources = new ArrayList<>();

        if (lower.matches(".*(?:utdanning|skole|eksamen|elev|læring|student|vurdering).*")) {
            sources.add(Map.of("title", "§3.3 Eksamen i AI-alderen",
                    "snippet", "Studenter vurderes på kritisk tenkning, problemløsning og evne til å bruke AI effektivt – ikke memorering. Eksamen med AI tilgjengelig der prosessen vurderes."));
        }
        if (lower.matches(".*(?:klima|co2|utslipp|energi|miljø).*")) {
            sources.add(Map.of("title", "§5.1 Klimahandling",
                    "snippet", "Sanntids klimaovervåking med AI-sensorer i alle kommuner. Mål: 55% utslippskutt innen 2035 med prediktiv analyse."));
        }
        if (lower.matches(".*(?:jobb|arbeid|borgerlønn|grunninntekt|omstilling).*")) {
            sources.add(Map.of("title", "§7.1 Borgerlønn",
                    "snippet", "Universell grunninntekt på 12 000 kr/mnd for alle over 18, finansiert gjennom automatiseringsskatt."));
        }
        if (lower.matches(".*(?:transport|buss|selvkjørende|logistikk).*")) {
            sources.add(Map.of("title", "§6.1 Autonom transport",
                    "snippet", "Selvkjørende kollektivtransport i byer over 50 000 innen 2038. Gratis for studenter og pensjonister."));
        }

        if (sources.isEmpty()) {
            sources.add(Map.of("title", "§3.1 Fremtidens utdanning",
                    "snippet", "AI-tilpassede læringsplaner for alle elever. Personlig undervisning tilpasset nivå og læringsstil."));
            sources.add(Map.of("title", "§7.2 Fremtidens arbeidsplasser",
                    "snippet", "Massive omstillingsprogram med rett til omskolering. Nye jobber innen AI-tilsyn og dataetikk."));
        }

        return sources.size() > 3 ? sources.subList(0, 3) : sources;
    }

    // ---- Request DTOs ----

    public record StreamRequest(
            List<MessageDTO> messages,
            String model,
            boolean useRag,
            String persona
    ) {
        public String lastUserMessage() {
            if (messages == null || messages.isEmpty()) return "";
            for (int i = messages.size() - 1; i >= 0; i--) {
                if ("user".equals(messages.get(i).role())) return messages.get(i).content();
            }
            return "";
        }
    }

    public record MessageDTO(String role, String content) {}
}

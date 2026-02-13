package backend;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import java.util.ArrayList;

import java.util.Map;

@Service
public class OpenAIService {

    private final WebClient web;
    private final ObjectMapper json = new ObjectMapper();
    private volatile double[] factVec;

    public OpenAIService(@Value("${openai.api.key}") String apiKey) {
        this.web = WebClient.builder()
                .baseUrl("https://llm.hpc.ntnu.no/v1")
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    private volatile double[][] factVectors;

    private String[] loadFacts() {
        try (var stream = getClass().getClassLoader().getResourceAsStream("facts.txt")) {
            if (stream == null) throw new RuntimeException("facts.txt not found");
            return new String(stream.readAllBytes())
                    .lines()
                    .map(String::trim)
                    .filter(line -> !line.isBlank())
                    .toArray(String[]::new);
        } catch (Exception e) {
            throw new RuntimeException("Failed to load facts.txt: " + e.getMessage(), e);
        }
    }

    private final String[] FACTS = loadFacts();

    public Mono<String> askChatGPT(String prompt) {
        return ensureFactEmbeddings()
                .then(embed(prompt))
                .map(this::findRelevantFact)
                .flatMap(fact -> chat(prompt, fact));
    }

    private Mono<Void> ensureFactEmbeddings() {
        if (factVectors != null) return Mono.empty();

        return Mono.defer(() -> {
            if (factVectors != null) return Mono.empty();

            var monos = new ArrayList<Mono<double[]>>(FACTS.length);
            for (String fact : FACTS) monos.add(embed(fact));

            return Mono.zip(monos, results -> {
                        double[][] vectors = new double[FACTS.length][];
                        for (int i = 0; i < results.length; i++) {
                            vectors[i] = (double[]) results[i];
                        }
                        factVectors = vectors;   // ✅ now populated
                        return true;
                    })
                    .then();
        });
    }

    private String findRelevantFact(double[] queryVec) {
        if (factVectors == null) return "";

        double bestScore = 0;
        String bestFact = "";

        for (int i = 0; i < FACTS.length; i++) {
            if (factVectors[i] == null) continue;
            double score = cosine(queryVec, factVectors[i]);
            if (score > bestScore) {
                bestScore = score;
                bestFact = FACTS[i];
            }
        }

        return bestScore >= 0.4 ? bestFact : "";
    }

    private Mono<String> chat(String prompt, String fact) {
      String system = fact.isBlank()
                ? "You are a helpful assistant."
                : "RULE (must follow): " + fact;

        Map<String, Object> body = Map.of(
                "model", "openai/gpt-oss-120b",
                "messages", new Object[]{
                        Map.of("role", "system", "content", system),
                        Map.of("role", "user", "content", prompt)
                }
        );

        return web.post()
                .uri("/chat/completions")
                .bodyValue(body)
                .retrieve()
                .bodyToMono(String.class)
                .map(this::chatContent);
    }

    private Mono<double[]> embed(String text) {
        Map<String, Object> body = Map.of(
                "model", "Qwen/Qwen3-Embedding-8B",
                "input", text
        );

        return web.post()
                .uri("/embeddings")
                .bodyValue(body)
                .retrieve()
                .bodyToMono(String.class)
                .map(this::embeddingVector);
    }

    private String chatContent(String s) {
        try {
            JsonNode r = json.readTree(s);
            return r.path("choices").get(0).path("message").path("content").asText();
        } catch (Exception e) {
            return "Parse error: " + e.getMessage();
        }
    }

    private double[] embeddingVector(String s) {
        try {
            JsonNode a = json.readTree(s).path("data").get(0).path("embedding");
            double[] v = new double[a.size()];
            for (int i = 0; i < a.size(); i++) v[i] = a.get(i).asDouble();
            return v;
        } catch (Exception e) {
            throw new RuntimeException("Embedding parse error: " + e.getMessage(), e);
        }
    }

    private static double cosine(double[] a, double[] b) {
        if (a == null || b == null || a.length != b.length) return -1;
        double dot = 0, na = 0, nb = 0;
        for (int i = 0; i < a.length; i++) {
            dot += a[i] * b[i];
            na += a[i] * a[i];
            nb += b[i] * b[i];
        }
        return (na == 0 || nb == 0) ? -1 : dot / (Math.sqrt(na) * Math.sqrt(nb));
    }
}

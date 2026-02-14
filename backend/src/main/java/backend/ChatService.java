package backend;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import backend.entity.Conversation;
import backend.repository.ConversationRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import java.io.IOException;
import java.util.Map;

@Service
public class ChatService {
    private final WebClient web;
    private final ObjectMapper json = new ObjectMapper();
    private final String embedding;
    private final ConversationRepository conversationRepository;

    public ChatService(
            @Value("${openai.api.key}") String apiKey,
            ConversationRepository conversationRepository) {
        try {
            this.embedding = IO.readRulesAndPolicy();
        } catch (IOException e) {
            throw new IllegalStateException("Failed to load rules.txt and policy.txt from resources", e);
        }

        this.web = WebClient.builder()
                .baseUrl("https://llm.hpc.ntnu.no/v1")
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .defaultHeader("Content-Type", "application/json")
                .build();

        this.conversationRepository = conversationRepository;
    }

    @Cacheable(value = "chatResponses", key = "#prompt + '_' + #mode")
    public Mono<String> chat(String prompt, String mode) {
        long startTime = System.currentTimeMillis();

        Map<String, Object> body = Map.of(
                "model", "openai/gpt-oss-120b",
                "temperature", 0.3,
                "max_tokens", 1024,
                "messages", new Object[] {
                        Map.of("role", "system", "content", this.embedding +
                                "\n\n You should reply with this mode: " + mode),
                        Map.of("role", "user", "content", prompt)
                }
        );

        return web.post()
                .uri("/chat/completions")
                .bodyValue(body)
                .retrieve()
                .bodyToMono(String.class)
                .map(this::chatContent)
                .doOnSuccess(response -> {
                    long responseTime = System.currentTimeMillis() - startTime;
                    saveConversation(prompt, response, mode, responseTime);
                });
    }

    private String chatContent(String s) {
        try {
            JsonNode r = json.readTree(s);
            return r.path("choices").get(0).path("message").path("content").asText();
        } catch (Exception e) {
            return "Parse error: " + e.getMessage();
        }
    }

    private void saveConversation(String userMessage, String assistantResponse,
                                   String mode, long responseTimeMs) {
        try {
            Conversation conversation = new Conversation(userMessage, assistantResponse, mode);
            conversation.setResponseTimeMs(responseTimeMs);
            conversationRepository.save(conversation);
        } catch (Exception e) {
            System.err.println("Failed to save conversation: " + e.getMessage());
        }
    }
}

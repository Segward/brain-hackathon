package backend;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
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

  public ChatService(@Value("${openai.api.key}") String apiKey) {
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
  } 

  public Mono<String> chat(String prompt, String mode) {
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
      .map(this::chatContent);
  }

  private String chatContent(String s) {
    try {
      JsonNode r = json.readTree(s);
      return r.path("choices").get(0).path("message").path("content").asText();
    } catch (Exception e) {
      return "Parse error: " + e.getMessage();
    }
  }
}

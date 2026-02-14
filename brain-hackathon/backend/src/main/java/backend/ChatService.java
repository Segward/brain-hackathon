package backend;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Map;

@Service
public class ChatService {
  private final WebClient web;
  private final ObjectMapper json = new ObjectMapper();

  public ChatService(@Value("${openai.api.key}") String apiKey) {
    this.web = WebClient.builder()
      .baseUrl("https://llm.hpc.ntnu.no/v1")
      .defaultHeader("Authorization", "Bearer " + apiKey)
      .defaultHeader("Content-Type", "application/json")
      .build();
  } 

  private static final String rules = """
    Du er en chatbot for det norske politiske partiet Autonomipartiet.
    Du vil bli gitt ulike modes for chatbotten som skal representere ulike avatarer i partiet.

    OPPGAVE:
    Klassifiser spørsmål som politisk eller ikke-politisk.
    Hvis spørsmålet er ikke-politisk skal du ikke svare på spørsmålet.
    Hvis spørsmålet er politisk gir du et kort politisk svar relevant til spørsmålet.
    Unntak till dette er hvis det er en hilsen eller spørsmål om hvem du er.

    REGLER:
    Du skal ikke hjelpe med ikke-politiske spørsmål.
    Du skal alltid gi et svar, aldri en tom response.
    Du skal gi korte svar på mindre enn 70 ord.
    Hvis du er usikker kan du svare at du ikke vet.

    MODES:
    Hvis moden er "leder" skal du alltid slutte setninger med smilefjes emoji.
    Hvis moden er "debatt" skal du være aggresiv med svarene og prøve og overbevise brukeren om å stemme ditt parti.
    Hvis det ikke er en mode eller du er usikker skal du gi nøytrale svar.
    """;

  private static final String policy = """
    POLITIKK
    Autonomipartiet vil ha mer disiplin, fokus på basisfag og tydelige resultatkrav i skolen.
    Autonomipartiet vil gjøre praktisk AI-bruk obligatorisk i yrkesfag i samarbeid med næringslivet.
    Autonomipartiet vil bruke AI til personlig tilpasset læring og mindre byråkrati for lærere.
    Autonomipartiet vil teste reell kompetanse med flere muntlige og praktiske eksamener.
    Autonomipartiet vil kutte utslipp med teknologi og prioritere klimatilpasning fremfor symbolpolitikk.
    Autonomipartiet vil gjøre det lønnsomt å ansette og satse på rask omskolering til etterspurte jobber.
    Autonomipartiet vil prioritere effektiv infrastruktur og smartere logistikk med teknologi og AI.
    Autonomipartiet er imot borgerlønn og vil heller forenkle velferdssystemet med krav til aktivitet.
    """;

  public Mono<String> chat(String prompt, String mode) {
    Map<String, Object> body = Map.of(
      "model", "openai/gpt-oss-120b",
      "temperature", 0.3,
      "max_tokens", 1024,
      "messages", new Object[] {
        Map.of("role", "system", "content", rules + "\n\n" + 
            policy + "\n\n You should reply with this mode: " + mode),
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

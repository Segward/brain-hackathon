package backend;

import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@CrossOrigin(origins = "http://localhost:5174")
@RestController
@RequestMapping("/api/chat")
public class ChatController {
    private final OpenAIService openAIService;

    public ChatController(OpenAIService openAIService) {
        this.openAIService = openAIService;
    }

    @GetMapping
    public Mono<String> chat(@RequestParam String message) {
        return openAIService.askChatGPT(message);
    }
}

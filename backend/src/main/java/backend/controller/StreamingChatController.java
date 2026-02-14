package backend.controller;

import backend.ChatService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

import java.time.Duration;

@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3001"})
@RestController
@RequestMapping("/api/chat")
public class StreamingChatController {
    
    private final ChatService chatService;
    
    public StreamingChatController(ChatService chatService) {
        this.chatService = chatService;
    }
    
    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> streamChat(@RequestParam String message, @RequestParam String mode) {
        return chatService.chat(message, mode)
            .flatMapMany(response -> {
                // Split response into words for streaming effect
                String[] words = response.split(" ");
                
                return Flux.fromArray(words)
                    .delayElements(Duration.ofMillis(50)) // 50ms delay between words
                    .map(word -> word + " "); // Add space after each word
            })
            .concatWith(Flux.just("[DONE]")); // Signal completion
    }
}

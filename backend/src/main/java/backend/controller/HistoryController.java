package backend.controller;

import backend.entity.Conversation;
import backend.repository.ConversationRepository;
import backend.dto.ConversationDTO;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/history")
public class HistoryController {
    private final ConversationRepository conversationRepository;
    
    public HistoryController(ConversationRepository conversationRepository) {
        this.conversationRepository = conversationRepository;
    }
    
    @GetMapping
    public List<ConversationDTO> getRecentHistory(@RequestParam(defaultValue = "50") int limit) {
        return conversationRepository.findTop50ByOrderByTimestampDesc().stream()
            .limit(limit)
            .map(this::toDTO)
            .collect(Collectors.toList());
    }
    
    @GetMapping("/mode/{mode}")
    public List<ConversationDTO> getHistoryByMode(@PathVariable String mode) {
        return conversationRepository.findByModeOrderByTimestampDesc(mode).stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }
    
    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalConversations", conversationRepository.getTotalConversations());
        stats.put("averageResponseTimeMs", conversationRepository.getAverageResponseTime());
        stats.put("leaderModeCount", conversationRepository.countByMode("leader"));
        stats.put("educationModeCount", conversationRepository.countByMode("education"));
        stats.put("techModeCount", conversationRepository.countByMode("tech"));
        stats.put("debateModeCount", conversationRepository.countByMode("debatt"));
        return stats;
    }
    
    @DeleteMapping
    public Map<String, String> clearHistory() {
        conversationRepository.deleteAll();
        return Map.of("message", "All conversation history cleared");
    }
    
    private ConversationDTO toDTO(Conversation conversation) {
        return new ConversationDTO(
            conversation.getId(),
            conversation.getUserMessage(),
            conversation.getAssistantResponse(),
            conversation.getMode(),
            conversation.getTimestamp(),
            conversation.getResponseTimeMs()
        );
    }
}

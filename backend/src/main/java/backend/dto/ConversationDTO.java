package backend.dto;

import java.time.LocalDateTime;

public class ConversationDTO {
    private Long id;
    private String userMessage;
    private String assistantResponse;
    private String mode;
    private LocalDateTime timestamp;
    private Long responseTimeMs;
    
    public ConversationDTO() {}
    
    public ConversationDTO(Long id, String userMessage, String assistantResponse, 
                          String mode, LocalDateTime timestamp, Long responseTimeMs) {
        this.id = id;
        this.userMessage = userMessage;
        this.assistantResponse = assistantResponse;
        this.mode = mode;
        this.timestamp = timestamp;
        this.responseTimeMs = responseTimeMs;
    }
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUserMessage() { return userMessage; }
    public void setUserMessage(String userMessage) { this.userMessage = userMessage; }
    public String getAssistantResponse() { return assistantResponse; }
    public void setAssistantResponse(String assistantResponse) { this.assistantResponse = assistantResponse; }
    public String getMode() { return mode; }
    public void setMode(String mode) { this.mode = mode; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    public Long getResponseTimeMs() { return responseTimeMs; }
    public void setResponseTimeMs(Long responseTimeMs) { this.responseTimeMs = responseTimeMs; }
}

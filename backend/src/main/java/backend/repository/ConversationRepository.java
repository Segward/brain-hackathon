package backend.repository;

import backend.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    List<Conversation> findBySessionIdOrderByTimestampDesc(String sessionId);

    List<Conversation> findTop50ByOrderByTimestampDesc();

    List<Conversation> findByModeOrderByTimestampDesc(String mode);

    long countByMode(String mode);

    List<Conversation> findByTimestampBetweenOrderByTimestampDesc(LocalDateTime start, LocalDateTime end);

    @Query("SELECT AVG(c.responseTimeMs) FROM Conversation c WHERE c.responseTimeMs IS NOT NULL")
    Double getAverageResponseTime();

    @Query("SELECT COUNT(c) FROM Conversation c")
    long getTotalConversations();
}

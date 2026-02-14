<template>
  <aside class="suggestion-bar">
    <div class="bar-header">
      <div class="header-icon">💡</div>
      <h3>Utforsk temaer</h3>
    </div>

    <div class="topics-section">
      <h4 class="section-title">Partiprogram</h4>
      <div class="topics-list">
        <div
          v-for="topic in topics"
          :key="topic.id"
          :class="['topic-group', { expanded: expandedTopic === topic.id }]"
        >
          <button
            class="topic-header"
            :style="{ borderColor: topic.color }"
            @click="toggleTopic(topic.id)"
          >
            <div class="topic-left">
              <div class="topic-icon">{{ topic.icon }}</div>
              <div class="topic-info">
                <div class="topic-name">{{ topic.name }}</div>
                <div class="topic-subtitle">{{ topic.subtitle }}</div>
              </div>
            </div>
            <div class="expand-icon" :style="{ color: topic.color }">
              {{ expandedTopic === topic.id ? "−" : "+" }}
            </div>
          </button>

          <transition name="expand">
            <div v-if="expandedTopic === topic.id" class="topic-questions">
              <button
                v-for="(q, idx) in topic.questions"
                :key="idx"
                class="topic-question"
                :style="{ borderLeft: `3px solid ${topic.color}` }"
                @click="selectQuestion(q)"
              >
                <div class="q-icon">→</div>
                <div class="q-text">{{ q }}</div>
              </button>
            </div>
          </transition>
        </div>
      </div>
    </div>

    <div class="general-section">
      <h4 class="section-title">Generelle spørsmål</h4>
      <div class="general-questions">
        <button
          v-for="(q, idx) in generalQuestions"
          :key="idx"
          class="general-question-item"
          @click="selectQuestion(q)"
        >
          <div class="q-icon">→</div>
          <div class="q-text">{{ q }}</div>
        </button>
      </div>
    </div>

    <div class="party-info">
      <div class="info-badge">Autonomipartiet</div>
      <p>Framtidas politikk med kunstig intelligens</p>
    </div>
  </aside>
</template>

<script setup>
import { defineEmits, ref } from "vue";

const emit = defineEmits(["select"]);

const expandedTopic = ref(null);

const topics = [
  {
    id: 1,
    name: "Utdanning",
    subtitle: "AI i klasserommet",
    icon: "🎓",
    color: "#2f7cff",
    description: "Hvordan AI kan transformere utdanning",
    questions: [
      "Hvordan bør AI brukes i utdanning?",
      "Hva er framtidens eksamen med AI?",
      "Hvordan sikrer dere digital kompetanse?",
      "Hva gjør dere mot digitalt misbruk i skolen?",
      "Hvordan skal lærere utdannes for AI-tidsalderen?",
    ],
  },
  {
    id: 2,
    name: "Klima",
    subtitle: "Grønn teknologi",
    icon: "🌍",
    color: "#10b981",
    description: "Klimaendringer og bærekraftig utvikling",
    questions: [
      "Hva er Autonomipartiets klimamål for 2030?",
      "Hvordan kan AI hjelpe til med klimakrisen?",
      "Hva er deres strategi for grønn energi?",
      "Hvordan skal Norge bli karbonnøytralt?",
      "Tema: Elektrisering av samfunnet?",
    ],
  },
  {
    id: 3,
    name: "Automatisering",
    subtitle: "Framtidens marked",
    icon: "🤖",
    color: "#f59e0b",
    description: "Robotikk og arbeidsmarkedet",
    questions: [
      "Hvordan møte automatisering av jobber?",
      "Hva er deres politikk for omstilling av arbeidskraft?",
      "Hvordan sikre trygge arbeidsplasser i framtiden?",
      "Skal folk få utdannelse i nye fag?",
      "Hva med borgerlønn eller liknende sikker inntekt?",
    ],
  },
  {
    id: 4,
    name: "Transport",
    subtitle: "Mobilitet 2030",
    icon: "🚗",
    color: "#8b5cf6",
    description: "Selvkjørende kjøretøyer og framtidig mobilitet",
    questions: [
      "Hva mener dere om selvkjørende kjøretøyer?",
      "Hvordan skal infrastrukturen endres?",
      "Hva er planen for kollektivtransport?",
      "Hvordan sikre jobber for sjåfører?",
      "Hvem skal regulere autonome kjøretøyer?",
    ],
  },
];

const generalQuestions = [
  "Hva er Autonomipartiets hovedmål?",
  "Hvordan håndterer dere digital privacy?",
  "Hva er visjonen for året 2050?",
  "Hvordan skal AI hjelpe samfunnet?",
];

function toggleTopic(topicId) {
  expandedTopic.value = expandedTopic.value === topicId ? null : topicId;
}

function selectQuestion(question) {
  emit("select", question);
}
</script>

<style scoped>
.suggestion-bar {
  width: 380px;
  background: linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 100%);
  border-left: 1px solid #333;
  border-radius: 24px;
  padding: 28px;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
  box-shadow: -12px 0 48px rgba(0, 0, 0, 0.6);
  flex-shrink: 0;
}

.bar-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 28px;
  padding-bottom: 18px;
  border-bottom: 2px solid #333;
}

.header-icon {
  font-size: 28px;
}

.bar-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 900;
  color: #fff;
  letter-spacing: 0.5px;
}

.section-title {
  margin: 0 0 14px 0;
  font-size: 11px;
  font-weight: 900;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 1.2px;
}

.topics-section {
  margin-bottom: 28px;
}

.topics-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.topic-group {
  overflow: hidden;
  border-radius: 12px;
  transition: all 200ms ease;
}

.topic-header {
  width: 100%;
  background: #222;
  border: 2px solid;
  border-radius: 14px;
  padding: 16px;
  cursor: pointer;
  transition: all 200ms ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-align: left;
}

.topic-header:hover {
  background: #2a2a2a;
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.3);
}

.topic-group.expanded .topic-header {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  border-bottom-color: transparent;
}

.topic-left {
  display: flex;
  gap: 12px;
  flex: 1;
  align-items: center;
}

.topic-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.topic-info {
  flex: 1;
  min-width: 0;
}

.topic-name {
  font-size: 14px;
  font-weight: 900;
  color: #fff;
  margin-bottom: 2px;
}

.topic-subtitle {
  font-size: 11px;
  color: #999;
  line-height: 1.2;
}

.expand-icon {
  font-size: 20px;
  font-weight: 900;
  flex-shrink: 0;
  transition: transform 200ms ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.topic-group.expanded .expand-icon {
  transform: rotate(180deg);
}

.topic-questions {
  background: #1a1a1a;
  border: 2px solid;
  border-top: none;
  border-radius: 0 0 12px 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  animation: slideDown 200ms ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.expand-enter-active,
.expand-leave-active {
  transition: all 200ms ease;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}

.topic-question {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: #252525;
  border: 1px solid #333;
  border-radius: 11px;
  padding: 13px;
  cursor: pointer;
  text-align: left;
  transition: all 160ms ease;
  font-size: 14px;
  color: #ddd;
  line-height: 1.4;
  border-left: 3px solid;
}

.topic-question:hover {
  background: #2a2a2a;
  transform: translateX(4px);
  box-shadow: inset 0 0 14px rgba(47, 124, 255, 0.08);
}

.general-section {
  margin-bottom: 28px;
}

.general-questions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.general-question-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: #222;
  border: 1px solid #333;
  border-radius: 13px;
  padding: 13px;
  cursor: pointer;
  text-align: left;
  transition: all 180ms ease;
  font-size: 14px;
  color: #ddd;
  line-height: 1.4;
}

.general-question-item:hover {
  background: #2a2a2a;
  border-color: #2f7cff;
  transform: translateX(4px);
  box-shadow: inset 0 0 16px rgba(47, 124, 255, 0.1);
}

.q-icon {
  color: #2f7cff;
  font-weight: 900;
  flex-shrink: 0;
  font-size: 14px;
  opacity: 0;
  transition: opacity 180ms ease;
}

.topic-question:hover .q-icon,
.general-question-item:hover .q-icon {
  opacity: 1;
}

.q-text {
  flex: 1;
}

.party-info {
  margin-top: 28px;
  padding-top: 18px;
  border-top: 2px solid #333;
  text-align: center;
}

.info-badge {
  display: inline-block;
  background: linear-gradient(135deg, #2f7cff, #1e5fbf);
  color: #fff;
  padding: 9px 16px;
  border-radius: 22px;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 1px;
  margin-bottom: 12px;
  animation: fadeInUp 400ms ease;
}

.party-info p {
  margin: 0;
  font-size: 13px;
  color: #999;
  line-height: 1.5;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Scrollbar styling */
.suggestion-bar::-webkit-scrollbar {
  width: 7px;
}

.suggestion-bar::-webkit-scrollbar-track {
  background: #1a1a1a;
}

.suggestion-bar::-webkit-scrollbar-thumb {
  background: #444;
  border-radius: 4px;
}

.suggestion-bar::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Responsive */
@media (max-width: 1200px) {
  .suggestion-bar {
    width: 300px;
  }
}

@media (max-width: 960px) {
  .suggestion-bar {
    display: none;
  }
}
</style>

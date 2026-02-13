<script setup lang="ts">
import { useCopilotState } from "@/composables/useCopilotState";
import { useAvatarSpeech } from "@/composables/useAvatarSpeech";

const { persona, setPersona } = useCopilotState();
const { mouthOpen, isSpeaking, stopSpeaking } = useAvatarSpeech();

interface AvatarProfile {
  id: "leader" | "education" | "tech";
  title: string;
  name: string;
  description: string;
  skin: string;
  hairColor: string;
  eyeColor: string;
  outfitColor: string;
  outfitColor2: string;
  accent: string;
  accentGlow: string;
  lipColor: string;
  blushColor: string;
}

const avatars: AvatarProfile[] = [
  {
    id: "leader",
    title: "Partileder",
    name: "Eira Nordvik",
    description:
      "Inspirerende visjonær med fokus på politisk strategi og store linjer.",
    skin: "#f5d5c0",
    hairColor: "#1a0e08",
    eyeColor: "#4a88b8",
    outfitColor: "#1e3a5f",
    outfitColor2: "#2a4f7a",
    accent: "#d4af37",
    accentGlow: "rgba(212,175,55,0.3)",
    lipColor: "#d47878",
    blushColor: "rgba(220,140,130,0.25)",
  },
  {
    id: "education",
    title: "Utdanningsminister",
    name: "Lars Bergström",
    description:
      "Reformist med fokus på vurdering, eksamen og AI i klasserommet.",
    skin: "#ecc9a5",
    hairColor: "#3d2b1f",
    eyeColor: "#5a8855",
    outfitColor: "#2c4a3a",
    outfitColor2: "#3a6050",
    accent: "#5cb85c",
    accentGlow: "rgba(92,184,92,0.3)",
    lipColor: "#c47070",
    blushColor: "rgba(200,130,120,0.2)",
  },
  {
    id: "tech",
    title: "Teknologiminister",
    name: "Sofie Haugen",
    description:
      "Teknisk arkitekt som tenker i systemer, infrastruktur og skalerbarhet.",
    skin: "#f8dcc8",
    hairColor: "#7a3510",
    eyeColor: "#4080a0",
    outfitColor: "#2e2055",
    outfitColor2: "#45308a",
    accent: "#00d4ff",
    accentGlow: "rgba(0,212,255,0.3)",
    lipColor: "#d08080",
    blushColor: "rgba(230,140,140,0.22)",
  },
];

</script>

<template>
  <section id="avatarer" class="py-20 bg-brand-950 overflow-hidden">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-14">
        <h2
          class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight"
        >
          Våre AI-rådgivere
        </h2>
        <p class="mt-3 text-lg text-blue-300/80 max-w-2xl mx-auto">
          Velg en persona og få svar tilpasset deres ekspertise og
          personlighet.
        </p>
      </div>

      <div class="grid sm:grid-cols-3 gap-6 lg:gap-10 max-w-5xl mx-auto">
        <button
          v-for="av in avatars"
          :key="av.id"
          class="group avatar-card focus:outline-none"
          :class="{ active: persona === av.id }"
          @click="setPersona(av.id)"
        >
          <div
            class="portrait-frame"
            :class="{ 'is-active': persona === av.id }"
          >
            <!-- Background -->
            <div class="portrait-bg" :style="{ background: `rgba(8,12,30,1)` }"></div>

            <!-- SVG Character Illustration -->
            <svg
              viewBox="0 0 280 380"
              class="avatar-svg"
              :class="{
                'is-speaking': persona === av.id && isSpeaking,
              }"
            >
              <defs>
                <!-- Skin shadow gradient -->
                <radialGradient :id="`skin-${av.id}`" cx="50%" cy="40%">
                  <stop offset="0%" :stop-color="av.skin" />
                  <stop
                    offset="100%"
                    :stop-color="av.skin"
                    stop-opacity="0.85"
                  />
                </radialGradient>
                <!-- Hair highlight -->
                <linearGradient
                  :id="`hair-${av.id}`"
                  x1="0"
                  y1="0"
                  x2="0.3"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    :stop-color="av.hairColor"
                    stop-opacity="0.7"
                  />
                  <stop offset="50%" :stop-color="av.hairColor" />
                  <stop
                    offset="100%"
                    :stop-color="av.hairColor"
                    stop-opacity="0.9"
                  />
                </linearGradient>
              </defs>

              <!-- ====== BODY / OUTFIT ====== -->
              <!-- Shoulders & torso -->
              <path
                :d="
                  av.id === 'education'
                    ? 'M60,380 L60,295 Q60,260 90,250 L120,240 Q140,235 140,220 L140,218 L160,218 L160,220 Q160,235 180,240 L210,250 Q240,260 240,295 L240,380 Z'
                    : 'M55,380 L55,300 Q55,265 85,252 L115,240 Q140,232 140,218 L160,218 Q160,232 185,240 L215,252 Q245,265 245,300 L245,380 Z'
                "
                :fill="av.outfitColor"
              />
              <!-- Suit lapels -->
              <path
                v-if="av.id !== 'education'"
                d="M120,240 L140,290 L130,380"
                :stroke="av.outfitColor2"
                stroke-width="2"
                fill="none"
              />
              <path
                v-if="av.id !== 'education'"
                d="M180,240 L160,290 L170,380"
                :stroke="av.outfitColor2"
                stroke-width="2"
                fill="none"
              />
              <!-- Collar / V-neck -->
              <path
                d="M125,235 L140,270 L150,218"
                fill="white"
                opacity="0.9"
              />
              <path
                d="M175,235 L160,270 L150,218"
                fill="white"
                opacity="0.9"
              />
              <!-- Tie / Accessory for education -->
              <path
                v-if="av.id === 'education'"
                d="M147,258 L150,320 L153,258"
                :fill="av.accent"
              />
              <circle
                v-if="av.id === 'education'"
                cx="150"
                cy="256"
                r="5"
                :fill="av.accent"
              />
              <!-- Necklace for leader -->
              <ellipse
                v-if="av.id === 'leader'"
                cx="150"
                cy="228"
                rx="18"
                ry="4"
                fill="none"
                :stroke="av.accent"
                stroke-width="1.5"
                opacity="0.7"
              />
              <!-- Lapel pin for tech -->
              <circle
                v-if="av.id === 'tech'"
                cx="122"
                cy="260"
                r="4"
                :fill="av.accent"
              />
              <circle
                v-if="av.id === 'tech'"
                cx="122"
                cy="260"
                r="2"
                fill="white"
                opacity="0.5"
              />

              <!-- ====== NECK ====== -->
              <rect
                x="133"
                y="196"
                width="34"
                height="28"
                rx="8"
                :fill="`url(#skin-${av.id})`"
              />

              <!-- ====== HEAD ====== -->
              <g class="head-group">
                <!-- Face shape -->
                <ellipse
                  cx="150"
                  cy="148"
                  rx="58"
                  ry="68"
                  :fill="`url(#skin-${av.id})`"
                />
                <!-- Jawline shadow -->
                <ellipse
                  cx="150"
                  cy="190"
                  rx="44"
                  ry="18"
                  :fill="av.skin"
                  opacity="0.5"
                />

                <!-- Blush -->
                <ellipse
                  cx="116"
                  cy="162"
                  rx="16"
                  ry="10"
                  :fill="av.blushColor"
                />
                <ellipse
                  cx="184"
                  cy="162"
                  rx="16"
                  ry="10"
                  :fill="av.blushColor"
                />

                <!-- ====== EYES ====== -->
                <g class="eyes-group">
                  <!-- Left eye -->
                  <g class="eye blink-eye">
                    <ellipse
                      cx="127"
                      cy="144"
                      rx="13"
                      ry="10"
                      fill="white"
                    />
                    <ellipse
                      cx="128"
                      cy="145"
                      rx="7"
                      ry="7.5"
                      :fill="av.eyeColor"
                    />
                    <circle cx="128" cy="145" r="4" fill="#0e0e18" />
                    <circle cx="131" cy="142" r="2.5" fill="white" />
                    <circle cx="126" cy="147" r="1.2" fill="white" />
                    <!-- Upper eyelid for blink -->
                    <ellipse
                      class="eyelid"
                      cx="127"
                      cy="144"
                      rx="14"
                      ry="0"
                      :fill="av.skin"
                    />
                  </g>
                  <!-- Right eye -->
                  <g class="eye blink-eye">
                    <ellipse
                      cx="173"
                      cy="144"
                      rx="13"
                      ry="10"
                      fill="white"
                    />
                    <ellipse
                      cx="172"
                      cy="145"
                      rx="7"
                      ry="7.5"
                      :fill="av.eyeColor"
                    />
                    <circle cx="172" cy="145" r="4" fill="#0e0e18" />
                    <circle cx="175" cy="142" r="2.5" fill="white" />
                    <circle cx="170" cy="147" r="1.2" fill="white" />
                    <!-- Upper eyelid for blink -->
                    <ellipse
                      class="eyelid"
                      cx="173"
                      cy="144"
                      rx="14"
                      ry="0"
                      :fill="av.skin"
                    />
                  </g>
                </g>

                <!-- Eyebrows -->
                <path
                  d="M114,130 Q121,125 140,129"
                  :stroke="av.hairColor"
                  stroke-width="2.5"
                  fill="none"
                  stroke-linecap="round"
                />
                <path
                  d="M160,129 Q179,125 186,130"
                  :stroke="av.hairColor"
                  stroke-width="2.5"
                  fill="none"
                  stroke-linecap="round"
                />

                <!-- Nose -->
                <path
                  d="M148,150 Q145,165 142,170 Q148,173 158,170 Q155,165 152,150"
                  :fill="av.skin"
                  opacity="0.5"
                />
                <path
                  d="M143,170 Q150,174 157,170"
                  fill="none"
                  stroke="#c0a088"
                  stroke-width="1"
                  stroke-linecap="round"
                  opacity="0.5"
                />

                <!-- ====== MOUTH ====== -->
                <g
                  class="mouth-group"
                  :class="{ speaking: persona === av.id && isSpeaking }"
                >
                  <!-- Closed smile (visible when not speaking) -->
                  <path
                    v-if="!(persona === av.id && isSpeaking)"
                    d="M135,183 Q142,189 150,189 Q158,189 165,183"
                    :stroke="av.lipColor"
                    stroke-width="2.5"
                    fill="none"
                    stroke-linecap="round"
                    class="smile"
                  />
                  <!-- Open mouth (visible when speaking) -->
                  <g v-else>
                    <ellipse
                      cx="150"
                      cy="185"
                      rx="12"
                      :ry="3 + mouthOpen * 6"
                      fill="#3a1515"
                      class="mouth-hole"
                    />
                    <!-- Teeth hint -->
                    <rect
                      x="142"
                      y="181"
                      width="16"
                      height="3"
                      rx="1"
                      fill="white"
                      opacity="0.7"
                    />
                    <!-- Upper lip -->
                    <path
                      d="M136,182 Q143,179 150,180 Q157,179 164,182"
                      :stroke="av.lipColor"
                      stroke-width="2"
                      fill="none"
                      stroke-linecap="round"
                    />
                    <!-- Lower lip -->
                    <path
                      :d="`M138,${186 + mouthOpen * 4} Q150,${190 + mouthOpen * 5} 162,${186 + mouthOpen * 4}`"
                      :stroke="av.lipColor"
                      stroke-width="2"
                      fill="none"
                      stroke-linecap="round"
                    />
                  </g>
                </g>

                <!-- ====== HAIR ====== -->
                <!-- Leader: Long dark elegant hair -->
                <g v-if="av.id === 'leader'">
                  <!-- Hair top volume -->
                  <path
                    d="M92,130 Q92,70 130,58 Q150,52 170,58 Q208,70 208,130 Q200,105 190,100 Q175,92 150,88 Q125,92 110,100 Q100,105 92,130 Z"
                    :fill="`url(#hair-${av.id})`"
                  />
                  <!-- Side hair left -->
                  <path
                    d="M92,130 Q88,150 86,180 Q85,195 90,200 Q96,195 98,175 Q100,155 100,140 Z"
                    :fill="av.hairColor"
                  />
                  <!-- Side hair right -->
                  <path
                    d="M208,130 Q212,150 214,180 Q215,195 210,200 Q204,195 202,175 Q200,155 200,140 Z"
                    :fill="av.hairColor"
                  />
                  <!-- Bangs -->
                  <path
                    d="M100,105 Q115,95 130,98 Q120,110 115,125 Q108,115 100,105 Z"
                    :fill="av.hairColor"
                    opacity="0.9"
                  />
                  <!-- Hair highlight -->
                  <path
                    d="M130,65 Q150,58 165,65 Q160,72 150,70 Q140,72 130,65 Z"
                    fill="white"
                    opacity="0.06"
                  />
                </g>

                <!-- Education: Short tidy male hair -->
                <g v-if="av.id === 'education'">
                  <path
                    d="M95,135 Q95,78 130,62 Q150,55 170,62 Q205,78 205,135 Q198,115 190,108 Q175,95 150,90 Q125,95 110,108 Q102,115 95,135 Z"
                    :fill="`url(#hair-${av.id})`"
                  />
                  <!-- Side fade -->
                  <path
                    d="M95,135 Q92,145 94,155 Q98,148 100,140 Z"
                    :fill="av.hairColor"
                    opacity="0.7"
                  />
                  <path
                    d="M205,135 Q208,145 206,155 Q202,148 200,140 Z"
                    :fill="av.hairColor"
                    opacity="0.7"
                  />
                  <!-- Hair part -->
                  <path
                    d="M130,62 Q132,72 128,85"
                    stroke="rgba(0,0,0,0.15)"
                    stroke-width="1"
                    fill="none"
                  />
                  <!-- Glasses -->
                  <ellipse
                    cx="127"
                    cy="144"
                    rx="18"
                    ry="14"
                    fill="none"
                    stroke="#444"
                    stroke-width="2"
                  />
                  <ellipse
                    cx="173"
                    cy="144"
                    rx="18"
                    ry="14"
                    fill="none"
                    stroke="#444"
                    stroke-width="2"
                  />
                  <line
                    x1="145"
                    y1="142"
                    x2="155"
                    y2="142"
                    stroke="#444"
                    stroke-width="2"
                  />
                  <!-- Lens glare -->
                  <ellipse
                    cx="120"
                    cy="139"
                    rx="5"
                    ry="3"
                    fill="white"
                    opacity="0.08"
                  />
                  <ellipse
                    cx="166"
                    cy="139"
                    rx="5"
                    ry="3"
                    fill="white"
                    opacity="0.08"
                  />
                </g>

                <!-- Tech: Wavy auburn hair -->
                <g v-if="av.id === 'tech'">
                  <path
                    d="M90,135 Q88,72 128,58 Q150,50 172,58 Q212,72 210,135 Q202,110 192,102 Q175,90 150,86 Q125,90 108,102 Q98,110 90,135 Z"
                    :fill="`url(#hair-${av.id})`"
                  />
                  <!-- Wavy side left -->
                  <path
                    d="M90,135 Q85,155 88,175 Q86,185 92,190 Q98,182 96,168 Q100,150 98,138 Z"
                    :fill="av.hairColor"
                  />
                  <!-- Wavy side right -->
                  <path
                    d="M210,135 Q215,155 212,175 Q214,185 208,190 Q202,182 204,168 Q200,150 202,138 Z"
                    :fill="av.hairColor"
                  />
                  <!-- Bangs / fringe -->
                  <path
                    d="M105,108 Q130,88 150,92 Q140,100 135,115 Q125,112 105,108 Z"
                    :fill="av.hairColor"
                    opacity="0.85"
                  />
                  <path
                    d="M195,108 Q170,90 155,95 Q162,102 165,115 Q178,112 195,108 Z"
                    :fill="av.hairColor"
                    opacity="0.8"
                  />
                  <!-- Auburn highlights -->
                  <path
                    d="M108,115 Q118,108 130,110"
                    stroke="#a05520"
                    stroke-width="2"
                    fill="none"
                    opacity="0.3"
                  />
                </g>

                <!-- Ears -->
                <ellipse
                  cx="92"
                  cy="152"
                  rx="7"
                  ry="12"
                  :fill="av.skin"
                  opacity="0.8"
                />
                <ellipse
                  cx="208"
                  cy="152"
                  rx="7"
                  ry="12"
                  :fill="av.skin"
                  opacity="0.8"
                />
                <!-- Earring for leader -->
                <circle
                  v-if="av.id === 'leader'"
                  cx="92"
                  cy="166"
                  r="3"
                  :fill="av.accent"
                />
              </g>
            </svg>

            <!-- Speaking indicator overlay -->
            <div
              v-if="persona === av.id && isSpeaking"
              class="speaking-indicator"
            >
              <div class="sound-wave">
                <span></span><span></span><span></span><span></span
                ><span></span>
              </div>
              <button
                class="stop-btn"
                title="Stopp tale"
                @click.stop="stopSpeaking"
              >
                ■
              </button>
            </div>

            <!-- Active glow -->
            <div v-if="persona === av.id" class="active-glow"></div>
          </div>

          <!-- Info -->
          <div class="mt-5 text-center">
            <div
              class="text-[10px] font-bold uppercase tracking-[0.2em] mb-1 transition-colors"
              :class="
                persona === av.id ? 'text-cyan-400' : 'text-blue-400/50'
              "
            >
              {{ av.title }}
            </div>
            <h3 class="text-lg font-bold text-white">{{ av.name }}</h3>
            <p class="mt-1 text-xs text-blue-300/60 leading-relaxed">
              {{ av.description }}
            </p>

            <div
              v-if="persona === av.id"
              class="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400"
            >
              <span
                class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"
              ></span>
              Aktiv rådgiver
            </div>
            <div
              v-else
              class="mt-3 text-xs text-blue-500/30 group-hover:text-blue-400/60 transition-colors"
            >
              Klikk for å aktivere
            </div>
          </div>
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* ========= CARD ========= */
.avatar-card {
  cursor: pointer;
  transition: transform 0.3s ease;
}
.avatar-card:hover {
  transform: translateY(-4px);
}

.portrait-frame {
  position: relative;
  border-radius: 1.25rem;
  overflow: hidden;
  border: 1.5px solid rgba(60, 120, 200, 0.1);
  transition: border-color 0.3s ease;
  height: 380px;
}

.portrait-frame.is-active {
  border-color: rgba(0, 212, 255, 0.45);
}

.avatar-card:hover .portrait-frame:not(.is-active) {
  border-color: rgba(80, 140, 220, 0.25);
}

.portrait-bg {
  position: absolute;
  inset: 0;
}

/* ========= SVG AVATAR ========= */
.avatar-svg {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  display: block;
}

/* Blinking — lightweight SVG attribute animation */
.blink-eye .eyelid {
  animation: blink 5s step-end infinite;
}
.blink-eye:nth-child(2) .eyelid {
  animation-delay: 0.04s;
}

/* Head sway only on active avatar via .is-speaking */
.avatar-svg.is-speaking .head-group {
  animation: head-talk 1.4s ease-in-out infinite;
  transform-origin: 150px 200px;
}

/* ========= OVERLAYS ========= */
.active-glow {
  position: absolute;
  bottom: -2px;
  left: 15%;
  width: 70%;
  height: 40px;
  background: rgba(0, 212, 255, 0.15);
  pointer-events: none;
  border-radius: 50%;
}

.speaking-indicator {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(0, 5, 15, 0.9);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 24px;
  padding: 8px 16px;
  z-index: 10;
}

.sound-wave {
  display: flex;
  align-items: center;
  gap: 3px;
  height: 18px;
}

.sound-wave span {
  display: block;
  width: 3px;
  background: #00b8d9;
  border-radius: 2px;
  animation: wave 0.8s ease-in-out infinite;
}
.sound-wave span:nth-child(1) {
  height: 6px;
  animation-delay: 0s;
}
.sound-wave span:nth-child(2) {
  height: 12px;
  animation-delay: 0.1s;
}
.sound-wave span:nth-child(3) {
  height: 18px;
  animation-delay: 0.2s;
}
.sound-wave span:nth-child(4) {
  height: 12px;
  animation-delay: 0.3s;
}
.sound-wave span:nth-child(5) {
  height: 6px;
  animation-delay: 0.4s;
}

.stop-btn {
  color: #ff6b6b;
  font-size: 10px;
  padding: 2px 6px;
  opacity: 0.6;
  transition: opacity 0.2s;
}
.stop-btn:hover {
  opacity: 1;
}

/* ========= KEYFRAMES ========= */
@keyframes head-talk {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  25% {
    transform: translateY(-1px) rotate(0.5deg);
  }
  75% {
    transform: translateY(0.5px) rotate(-0.3deg);
  }
}

@keyframes blink {
  0%,
  90%,
  96%,
  100% {
    ry: 0;
  }
  93% {
    ry: 11px;
  }
}

@keyframes wave {
  0%,
  100% {
    transform: scaleY(0.4);
  }
  50% {
    transform: scaleY(1.3);
  }
}
</style>

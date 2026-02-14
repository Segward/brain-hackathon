# Autonomipartiet Frontend

Vue 3 + Vite + TypeScript + Tailwind CSS

## Getting started

```bash
npm install
npm run dev
```

## Routes

| Route            | Description                                      |
| ---------------- | ------------------------------------------------ |
| `/`              | Landing page with hero, demo chat, avatars, FAQ  |
| `/partiprogram`  | Data-driven Party Program Simulator               |

## Partiprogram Simulator (`/partiprogram`)

An interactive policy simulator that lets you explore how Autonomipartiet approaches future challenges using data, sources, and evidence.

### How it works

1. **Select a case** from the left sidebar (7 cases: Utdanning, Klima, Arbeid, Transport, Borgerlonn, Energi, Offentlig sektor).
2. **Adjust assumptions** using the scenario controls: AI-adopsjon (Lav/Medium/Hoy), Budsjett (Begrenset/Normal/Ambisios), Tidshorisont (2/5/10 ar).
3. **View the results**: KPIs, charts (line + bar), net effect score, policy measures, evidence cards, sources, news, and risk assessment all update in real-time.

### Key features

- Deterministic mock calculations via `computeScenario()` in `src/data/partyCases.ts`
- ECharts-powered line and bar charts
- Radial gauge for net policy effect score (0-100)
- Evidence cards with source references
- Credible source list with confidence tags (Hoy/Medium/Lav)
- News cards (mock data, structured for future API replacement)
- Responsive layout: 2-column desktop, stacked mobile

### Tech stack

- **Vue 3** (Composition API + `<script setup>`)
- **Vue Router** for page routing
- **ECharts** via `vue-echarts` for data visualization
- **Tailwind CSS** for styling
- **TypeScript** with strict mode

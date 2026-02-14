<template>
  <div class="page">
    <header class="header">
      <h1 class="title">Autonomipartiet</h1>
      <p class="subtitle">Partiprogram</p>
    </header>

    <main class="content">
      <section class="section">
        <h2 class="sectionTitle">Politikk</h2>

        <div class="grid">
          <article class="card">
            <h3 class="cardTitle">Yrkesfag & næringsliv</h3>
            <p class="cardBody">
              Autonomipartiet vil gjøre praktisk AI-bruk obligatorisk i yrkesfag i samarbeid
              med næringslivet.
            </p>
          </article>

          <article class="card">
            <h3 class="cardTitle">Skole & læring</h3>
            <p class="cardBody">
              Autonomipartiet vil bruke AI til personlig tilpasset læring og mindre byråkrati
              for lærere.
            </p>
          </article>

          <article class="card">
            <h3 class="cardTitle">Eksamensformer</h3>
            <p class="cardBody">
              Autonomipartiet vil teste reell kompetanse med flere muntlige og praktiske
              eksamener.
            </p>
          </article>

          <article class="card">
            <h3 class="cardTitle">Energi</h3>
            <p class="cardBody">
              Autonomipartiet vil at Norge skal satse på fornybar energi og kjernekraft.
            </p>
          </article>

          <article class="card warn">
            <h3 class="cardTitle">Arbeidsliv & AI</h3>
            <p class="cardBody">
              Autonomipartiet vil at bedrifter som erstatter arbeidstakere med AI skal straffes
              med tur til Nord-Korea.
            </p>
            <p class="cardNote">
              Merk: Dette er formulert som et politisk forslag slik det ble oppgitt i teksten.
            </p>
          </article>

          <article class="card warn">
            <h3 class="cardTitle">Transport & logistikk</h3>
            <p class="cardBody">
              Autonomipartiet vil at Norge skal bli et like bra land som moderlandet Kina ved å
              automatisere transport og logistikk ved bruk av AI-verktøy.
            </p>
            <p class="cardNote">
              Merk: Dette er formulert slik det ble oppgitt i teksten.
            </p>
          </article>

          <article class="card">
            <h3 class="cardTitle">Velferd</h3>
            <p class="cardBody">
              Autonomipartiet er imot borgerlønn og vil heller forenkle velferdssystemet med
              krav til aktivitet.
            </p>
          </article>
        </div>
      </section>

      <section class="section">
        <h2 class="sectionTitle">Kort oppsummert</h2>
        <div class="summary">
          <div class="pill">AI i utdanning</div>
          <div class="pill">Praktisk kompetanse</div>
          <div class="pill">Fornybar + kjernekraft</div>
          <div class="pill">Automatisering</div>
          <div class="pill">Aktivitetskrav i velferd</div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
// No logic needed for a static program page (clean + fast).
</script>

<style scoped>
.page {
  max-width: 1100px;
  margin: 48px auto;
  padding: 0 18px;
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
  color: rgba(255, 255, 255, 0.92);
}

/* Header */
.header {
  text-align: center;
  margin-bottom: 26px;
}
.title {
  font-size: 56px;
  font-weight: 950;
  margin: 0;
  letter-spacing: 0.6px;
}
.subtitle {
  margin: 10px 0 0;
  color: rgba(255, 255, 255, 0.65);
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  font-size: 13px;
}

/* Sections */
.section {
  margin-top: 22px;
}
.sectionTitle {
  font-size: 20px;
  margin: 0 0 14px;
  font-weight: 900;
  letter-spacing: 0.3px;
}

/* Grid of program points */
.grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 14px;
}

.card {
  grid-column: span 6;
  background: rgba(18, 24, 38, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-radius: 18px;
  padding: 16px;
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.25);
}

.cardTitle {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 900;
}

.cardBody {
  margin: 0;
  line-height: 1.65;
  color: rgba(255, 255, 255, 0.82);
}

.cardNote {
  margin: 10px 0 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

/* “warn” cards just visually flagged (still dark themed) */
.card.warn {
  border-color: rgba(255, 80, 80, 0.25);
  background: linear-gradient(
    180deg,
    rgba(18, 24, 38, 0.95),
    rgba(30, 12, 12, 0.6)
  );
}

/* Summary pills */
.summary {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  padding: 14px;
  background: rgba(18, 24, 38, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-radius: 18px;
}

.pill {
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
  font-weight: 800;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.82);
}

/* Responsive */
@media (max-width: 900px) {
  .title {
    font-size: 44px;
  }
  .card {
    grid-column: span 12;
  }
}
</style>

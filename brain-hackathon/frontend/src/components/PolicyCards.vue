<script setup lang="ts">
const emit = defineEmits<{
  prefill: [text: string]
}>()

const policies = [
  {
    icon: '🎓',
    title: 'Utdanning',
    description: 'AI-tilpassede læringsplaner og ny vurderingsmodell som ser hele eleven.',
    prompt: 'Hvordan vil Autonomipartiet reformere eksamen og vurdering i norsk skole med AI-støttet porteføljevurdering?',
    color: 'from-blue-500 to-cyan-400',
  },
  {
    icon: '💼',
    title: 'Arbeidsliv',
    description: 'Borgerlønn og massive omstillingsprogram for en automatisert økonomi.',
    prompt: 'Forklar hvordan borgerlønn og automatiseringsskatt vil fungere i praksis for norske arbeidstakere.',
    color: 'from-violet-500 to-purple-400',
  },
  {
    icon: '🌱',
    title: 'Klima',
    description: 'Sanntids klimaovervåking med AI-sensorer og smart energistyring.',
    prompt: 'Hvordan kan AI-drevet klimaovervåking bidra til 55% utslippskutt i Norge innen 2035?',
    color: 'from-emerald-500 to-green-400',
  },
  {
    icon: '🚌',
    title: 'Transport & velferd',
    description: 'Autonome transportløsninger og digital velferd for alle innbyggere.',
    prompt: 'Beskriv Autonomipartiets plan for selvkjørende kollektivtransport og digital velferd i norske byer.',
    color: 'from-orange-500 to-amber-400',
  },
]
</script>

<template>
  <section id="politikk" class="py-20 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-12">
        <h2 class="text-3xl sm:text-4xl font-extrabold text-gray-900">Våre kjernesaker</h2>
        <p class="mt-3 text-lg text-gray-500 max-w-2xl mx-auto">
          Klikk på et kort for å stille AI-rådgiveren et spørsmål om temaet.
        </p>
      </div>

      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <button
          v-for="policy in policies"
          :key="policy.title"
          class="group text-left bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer"
          @click="emit('prefill', policy.prompt)"
        >
          <div
            :class="[
              'w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 bg-gradient-to-br shadow-sm',
              policy.color,
            ]"
          >
            {{ policy.icon }}
          </div>
          <h3 class="text-lg font-bold text-gray-900 group-hover:text-brand-700 transition-colors">
            {{ policy.title }}
          </h3>
          <p class="mt-2 text-sm text-gray-500 leading-relaxed">
            {{ policy.description }}
          </p>
          <span class="inline-flex items-center mt-4 text-xs font-semibold text-brand-600 group-hover:text-brand-700">
            Spør AI-rådgiveren →
          </span>
        </button>
      </div>
    </div>
  </section>
</template>

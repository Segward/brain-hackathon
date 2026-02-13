<script setup lang="ts">
import DemoChat from "@/components/DemoChat.vue";
import Avatars from "@/components/Avatars.vue";
</script>

<template>
  <section id="demo" class="py-20 bg-gray-50 min-h-screen">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-12">
        <h2 class="text-3xl sm:text-4xl font-extrabold text-gray-900">
          Prøv AI-rådgiveren
        </h2>
        <p class="mt-3 text-lg text-gray-500 max-w-2xl mx-auto">
          Chat med vår AI om politikk, utdanning, klima og mer. Velg modell og
          persona.
        </p>
      </div>

      <div class="grid lg:grid-cols-2 gap-6 items-start">
        <div>
          <DemoChat />
        </div>
        <div class="relative">
          <Avatars compact />
        </div>
      </div>
    </div>
  </section>
</template>

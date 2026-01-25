<template>
  <div class="mt-16 mb-8">
    <h3 class="text-2xl font-bold mb-8">{{ t('why.title') }}</h3>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div
        v-for="(feature, idx) in features"
        :key="idx"
        :class="['rounded-xl p-5 transition-all text-center border', card, border, hover]"
      >
        <div :class="['w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center', theme === 'dark' ? 'bg-white text-black' : 'bg-gray-900 text-white']">
          <component :is="feature.icon" :size="24" />
        </div>
        <h4 class="font-semibold text-sm mb-1">{{ feature.title }}</h4>
        <p :class="['text-xs', muted]">{{ feature.desc }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Shield, Zap, Clock, DollarSign } from 'lucide-vue-next';
import { useTheme } from '../composables/useTheme.js';
import { useLocale } from '../composables/useLocale.js';

const { theme, card, border, hover, muted } = useTheme();
const { t } = useLocale();

const features = computed(() => [
  { title: t('why.feature1.title'), desc: t('why.feature1.desc'), icon: Shield },
  { title: t('why.feature2.title'), desc: t('why.feature2.desc'), icon: Zap },
  { title: t('why.feature3.title'), desc: t('why.feature3.desc'), icon: Clock },
  { title: t('why.feature4.title'), desc: t('why.feature4.desc'), icon: DollarSign }
]);
</script>
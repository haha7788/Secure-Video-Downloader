<template>
  <header class="max-w-3xl mx-auto px-6 pt-6 pb-4">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-bold">SecureVideoDownloader</h1>
      <div class="flex items-center gap-2">
        <button
          @click="toggleLocale"
          :class="['px-3 py-2 rounded-lg border transition-all flex items-center gap-2 text-sm font-medium', border, hover]"
        >
          <Globe :size="16" />
          <span>{{ t('langBtn') }}</span>
        </button>
        <button
          @click="toggleTheme"
          :class="['px-3 py-2 rounded-lg border transition-all flex items-center gap-2 text-sm font-medium', border, hover]"
        >
          <Moon v-if="theme === 'dark'" :size="16" />
          <Sun v-else :size="16" />
          <span>{{ t('themeBtn') }}</span>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { Globe, Moon, Sun } from 'lucide-vue-next';
import { useTheme } from '../composables/useTheme.js';
import { useLocale } from '../composables/useLocale.js';

const { theme, border, hover, toggleTheme } = useTheme();
const { t, toggleLocale } = useLocale();
</script>
<template>
  <div :class="['p-4 rounded-xl border text-center transition-all', border, hover, 'cursor-default']">
    <div class="flex items-center justify-center mb-3">
      <svg class="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path :d="iconPath" />
      </svg>
    </div>
    <div class="font-semibold text-sm mb-1">{{ name }}</div>
    <div :class="['text-xs', muted]">{{ description }}</div>
  </div>
</template>

<script setup>
import { useTheme } from '../composables/useTheme.js';

defineProps({
  name: String,
  description: String,
  iconPath: String
});

const { border, hover, muted } = useTheme();
</script>
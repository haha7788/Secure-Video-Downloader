<template>
  <div>
    <div class="text-center mb-10">
      <h2 class="text-4xl font-bold mb-3">{{ t('hero.title') }}</h2>
      <p :class="['text-sm', muted]">{{ t('hero.subtitle') }}</p>
    </div>

    <div :class="['rounded-2xl p-8 mb-8 shadow-sm border', card, border]">
      <div class="grid grid-cols-3 gap-4 mb-4">
        <PlatformCard
          name="TikTok"
          :description="t('platforms.noWatermark')"
          iconPath="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"
        />
        <PlatformCard
          name="Instagram"
          :description="t('platforms.reelsStories')"
          iconPath="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z"
        />
        <PlatformCard
          name="YouTube"
          :description="t('platforms.hdQuality')"
          iconPath="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z"
        />
      </div>

      <div class="text-center mb-4">
        <p :class="['text-sm flex items-center justify-center gap-2', muted]">
          <Download :size="16" />
          <span>{{ t('stats.downloaded') }}: <span class="font-semibold">{{ formatNumber(stats.totalDownloads) }}</span></span>
        </p>
      </div>

      <div class="mb-4">
        <input
          v-model="url"
          type="text"
          :placeholder="t('input.placeholder')"
          @keyup.enter="$emit('download', url)"
          :class="[
            'w-full px-4 py-3 rounded-xl border transition-all text-sm',
            theme === 'dark'
              ? 'bg-[#1a1a1a] border-gray-700 text-white placeholder-gray-500 focus:border-white'
              : 'bg-gray-50 border-gray-200 text-black placeholder-gray-400 focus:border-gray-900'
          ]"
          style="outline: none; box-shadow: none;"
        />
        <p v-if="error" :class="['text-xs mt-2 text-red-500']">{{ error }}</p>
      </div>

      <button
        @click="$emit('download', url)"
        :disabled="loading || !url"
        :class="[
          'w-full py-3.5 rounded-xl font-semibold transition-all text-sm shadow-sm',
          theme === 'dark' ? 'bg-white text-black hover:bg-gray-200' : 'bg-gray-900 text-white hover:bg-gray-800',
          'disabled:opacity-40 disabled:cursor-not-allowed'
        ]"
      >
        <template v-if="loading">
          <span class="flex items-center justify-center gap-2">
            <div class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            {{ t('button.loading') }}
          </span>
        </template>
        <template v-else>
          {{ t('button.download') }}
        </template>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Download } from 'lucide-vue-next';
import { useTheme } from '../composables/useTheme.js';
import { useLocale } from '../composables/useLocale.js';
import { formatNumber } from '../utils/helpers.js';
import PlatformCard from './PlatformCard.vue';

const props = defineProps({
  stats: {
    type: Object,
    default: () => ({ totalDownloads: 0 })
  },
  loading: Boolean,
  error: String
});

defineEmits(['download']);

const url = ref('');
const { theme, card, border, muted } = useTheme();
const { t } = useLocale();
</script>
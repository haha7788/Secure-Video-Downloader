<template>
  <div class="mt-16">
    <h3 class="text-2xl font-bold mb-6">{{ t('examples.title') }}</h3>
    <div class="space-y-3">
      <div 
        v-for="(platform, idx) in platformExamples" 
        :key="idx"
        :class="['rounded-xl border overflow-hidden transition-all', card, border]"
      >
        <button
          @click="expandedPlatforms[idx] = !expandedPlatforms[idx]"
          :class="['w-full p-4 flex items-center gap-3 transition-all', hover]"
        >
          <div :class="['w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', platform.bgClass]">
            <div v-html="platform.logo" class="w-6 h-6"></div>
          </div>
          <div class="flex-1 text-left">
            <div class="font-bold text-sm">{{ platform.name }}</div>
            <div :class="['text-xs', muted]">{{ platform.description }}</div>
          </div>
          <ChevronDown 
            :size="20" 
            :class="['transition-transform', muted, expandedPlatforms[idx] ? 'rotate-180' : '']"
          />
        </button>
        
        <div 
          v-show="expandedPlatforms[idx]"
          :class="['px-4 pb-4 space-y-2 border-t', border]"
        >
          <div v-for="(urlExample, urlIdx) in platform.urls" :key="urlIdx" 
               :class="['text-xs font-mono rounded-lg p-3 border mt-2', input, border, muted]">
            {{ urlExample }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { ChevronDown } from 'lucide-vue-next';
import { useTheme } from '../composables/useTheme.js';
import { useLocale } from '../composables/useLocale.js';

const { card, border, hover, input, muted } = useTheme();
const { t } = useLocale();

const expandedPlatforms = ref({});

const platformExamples = computed(() => [
  {
    name: 'TikTok',
    description: t('examples.tiktok'),
    bgClass: 'bg-black',
    logo: `<svg viewBox="0 0 24 24" fill="white"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>`,
    urls: [
      'https://www.tiktok.com/@username/video/1234567890',
      'https://vm.tiktok.com/ABC123/',
      'https://vt.tiktok.com/ABC123/',
      'https://m.tiktok.com/v/1234567890.html'
    ]
  },
  {
    name: 'Instagram',
    description: t('examples.instagram'),
    bgClass: 'bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400',
    logo: `<svg viewBox="0 0 24 24" fill="white"><path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/></svg>`,
    urls: [
      'https://www.instagram.com/reel/ABC123def456/',
      'https://www.instagram.com/p/ABC123def456/',
      'https://instagram.com/reel/ABC123def456/',
      'https://www.instagram.com/tv/ABC123def456/'
    ]
  },
  {
    name: 'YouTube',
    description: t('examples.youtube'),
    bgClass: 'bg-red-600',
    logo: `<svg viewBox="0 0 24 24" fill="white"><path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z"/></svg>`,
    urls: [
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      'https://youtu.be/dQw4w9WgXcQ',
      'https://m.youtube.com/watch?v=dQw4w9WgXcQ',
      'https://youtube.com/shorts/ABC123def456'
    ]
  }
]);
</script>
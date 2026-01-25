<template>
  <div :class="['rounded-2xl p-8 shadow-sm border', card, border]">
    <div class="text-center py-6 mb-6">
      <div class="mx-auto mb-5 flex items-center justify-center">
        <CheckCircle2 
          :size="80" 
          :class="['transition-all', theme === 'dark' ? 'text-emerald-500' : 'text-emerald-600']"
          :stroke-width="2"
        />
      </div>
      <h3 class="text-2xl font-bold mb-2">{{ result.title }}</h3>
      <p :class="['text-sm flex items-center justify-center gap-3', muted]">
        <span v-if="result.duration" class="flex items-center gap-1">
          <Timer :size="16" />
          {{ result.duration }}
        </span>
        <span class="flex items-center gap-1">
          <Package :size="16" />
          {{ formatBytes(result.fileSize) }}
        </span>
      </p>
    </div>

    <div :class="['rounded-xl border overflow-hidden mb-6', border]">
      <video
        controls
        :class="['w-full', theme === 'dark' ? 'bg-black' : 'bg-gray-900']"
        style="max-height: 400px;"
      >
        <source :src="result.downloadUrl" type="video/mp4">
        Your browser does not support the video tag.
      </video>
    </div>

    <div :class="['rounded-xl p-4 border mb-6 flex items-center gap-3', theme === 'dark' ? 'bg-orange-500/10 border-orange-500/30' : 'bg-orange-50 border-orange-200']">
      <div :class="['flex-shrink-0', theme === 'dark' ? 'text-orange-500' : 'text-orange-600']">
        <Clock :size="20" />
      </div>
      <div class="flex-1">
        <p :class="['text-sm font-medium', theme === 'dark' ? 'text-orange-400' : 'text-orange-700']">
          {{ t('timer.message') }}: <span class="font-bold">{{ timeRemaining }}</span>
        </p>
      </div>
    </div>

    <div :class="['flex gap-2 p-3 rounded-xl border mb-6', input, border]">
      <input
        :value="getFullDownloadUrl(result.downloadUrl)"
        readonly
        class="flex-1 px-2 bg-transparent focus:outline-none text-sm font-mono"
      />
      <button
        @click="copyLink"
        :class="[
          'px-5 py-2.5 rounded-lg transition-all text-sm font-semibold flex items-center gap-2',
          copied
            ? (theme === 'dark' ? 'bg-emerald-500 text-white' : 'bg-emerald-600 text-white')
            : (theme === 'dark' ? 'bg-white text-black hover:bg-gray-200' : 'bg-gray-900 text-white hover:bg-gray-800')
        ]"
      >
        {{ copied ? '✓ ' + t('button.copied') : t('button.copy') }}
      </button>
    </div>

    <div class="flex gap-3">
      <a
        :href="result.downloadUrl"
        download
        :class="[
          'flex-1 py-3.5 rounded-xl font-semibold transition-all text-sm shadow-sm flex items-center justify-center gap-2',
          theme === 'dark' ? 'bg-white text-black hover:bg-gray-200' : 'bg-gray-900 text-white hover:bg-gray-800'
        ]"
      >
        <Download :size="18" />
        {{ t('button.downloadVideo') }}
      </a>
      <button
        @click="$emit('reset')"
        :class="['flex-1 py-3.5 rounded-xl border transition-all text-sm font-semibold flex items-center justify-center gap-2', border, hover]"
      >
        <RotateCcw :size="18" />
        {{ t('button.downloadMore') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { CheckCircle2, Timer, Package, Clock, Download, RotateCcw } from 'lucide-vue-next';
import { useTheme } from '../composables/useTheme.js';
import { useLocale } from '../composables/useLocale.js';
import { formatBytes, getFullDownloadUrl } from '../utils/helpers.js';

const props = defineProps({
  result: Object,
  timeRemaining: String
});

defineEmits(['reset']);

const copied = ref(false);
const { theme, card, border, input, muted, hover } = useTheme();
const { t } = useLocale();

const copyLink = () => {
  navigator.clipboard.writeText(getFullDownloadUrl(props.result.downloadUrl));
  copied.value = true;
  setTimeout(() => copied.value = false, 2000);
};
</script>
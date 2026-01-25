<template>
  <div :class="['min-h-screen transition-colors duration-300', bg, text]">
    <AppHeader />

    <main class="max-w-3xl mx-auto px-6 pt-8 pb-12">
      <DownloadForm 
        v-if="!downloadResult"
        :stats="stats"
        :loading="loading"
        :error="error"
        @download="handleDownload"
      />

      <DownloadResult
        v-else
        :result="downloadResult"
        :timeRemaining="timeRemaining"
        @reset="resetDownload"
      />

      <PlatformExamples />
      <FeaturesSection />
      <ApiDocumentation />
    </main>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useTheme } from './composables/useTheme.js';
import { useLocale } from './composables/useLocale.js';
import AppHeader from './components/AppHeader.vue';
import AppFooter from './components/AppFooter.vue';
import DownloadForm from './components/DownloadForm.vue';
import DownloadResult from './components/DownloadResult.vue';
import PlatformExamples from './components/PlatformExamples.vue';
import FeaturesSection from './components/FeaturesSection.vue';
import ApiDocumentation from './components/ApiDocumentation.vue';

const { bg, text, initTheme } = useTheme();
const { t, initLocale } = useLocale();

const loading = ref(false);
const error = ref('');
const downloadResult = ref(null);
const timeRemaining = ref('5:00');
const timerInterval = ref(null);

const stats = ref({
  totalDownloads: 0,
  totalUsers: 0,
  platforms: { tiktok: 0, instagram: 0, youtube: 0 }
});

const handleDownload = async (url) => {
  if (!url || loading.value) return;

  error.value = '';
  loading.value = true;

  try {
    const response = await axios.post('/api/download', { url });
    
    if (response.data.success) {
      downloadResult.value = response.data;
      startTimer();
    } else {
      error.value = response.data.error || 'Failed to download video';
    }
  } catch (err) {
    error.value = err.response?.data?.error || 'An error occurred';
  } finally {
    loading.value = false;
  }
};

const startTimer = () => {
  let secondsLeft = 5 * 60;
  
  const updateTimer = () => {
    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    timeRemaining.value = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    if (secondsLeft <= 0) {
      clearInterval(timerInterval.value);
      timeRemaining.value = t('timer.expired');
    } else {
      secondsLeft--;
    }
  };
  
  updateTimer();
  timerInterval.value = setInterval(updateTimer, 1000);
};

const resetDownload = () => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value);
    timerInterval.value = null;
  }
  downloadResult.value = null;
  error.value = '';
  timeRemaining.value = '5:00';
};

const fetchStats = async () => {
  try {
    const response = await axios.get('/api/stats');
    if (response.data.success) {
      stats.value = response.data;
    }
  } catch (error) {
    console.error('Failed to fetch stats:', error);
  }
};

onMounted(() => {
  initTheme();
  initLocale();
  fetchStats();
});
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
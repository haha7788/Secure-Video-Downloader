import { ref, computed, onMounted } from 'vue';

const theme = ref('light');

export function useTheme() {
  const bg = computed(() => theme.value === 'dark' ? 'bg-[#1a1a1a]' : 'bg-white');
  const text = computed(() => theme.value === 'dark' ? 'text-white' : 'text-black');
  const muted = computed(() => theme.value === 'dark' ? 'text-gray-400' : 'text-gray-600');
  const border = computed(() => theme.value === 'dark' ? 'border-gray-700' : 'border-gray-200');
  const hover = computed(() => theme.value === 'dark' ? 'hover:bg-[#222222] hover:text-white' : 'hover:bg-gray-100 hover:text-black');
  const input = computed(() => theme.value === 'dark' ? 'bg-[#151515] border-gray-700' : 'bg-gray-50 border-gray-200');
  const card = computed(() => theme.value === 'dark' ? 'bg-[#151515]' : 'bg-gray-50');

  const toggleTheme = () => {
    theme.value = theme.value === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', theme.value);
  };

  const initTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      theme.value = savedTheme;
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      theme.value = 'dark';
    }
  };

  return {
    theme,
    bg,
    text,
    muted,
    border,
    hover,
    input,
    card,
    toggleTheme,
    initTheme
  };
}
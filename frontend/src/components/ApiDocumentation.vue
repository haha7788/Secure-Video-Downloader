<template>
  <div class="mt-16 mb-8">
    <h3 class="text-2xl font-bold mb-8">{{ t('api.title') }}</h3>

    <div class="flex flex-col gap-6">
      <div
        v-for="(example, idx) in apiExamples"
        :key="idx"
        :class="['rounded-xl p-6 border', card, border]"
      >
        <div class="mb-4">
          <h4 class="font-semibold text-base mb-1">{{ idx + 1 }}. {{ example.title }}</h4>
          <p class="text-xs mb-4 text-gray-400">{{ example.description }}</p>
        </div>

        <div class="flex gap-2 mb-3 flex-wrap">
          <button
            v-for="langKey in ['curl', 'nodejs', 'python', 'go']"
            :key="langKey"
            @click="selectedLang[idx] = langKey"
            :class="[
              'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
              (selectedLang[idx] || 'nodejs') === langKey
                ? (theme === 'dark' ? 'bg-white text-black' : 'bg-gray-900 text-white')
                : (theme === 'dark' ? 'bg-[#222222] text-gray-400 hover:bg-[#2a2a2a] hover:text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-black')
            ]"
          >
            {{ langKey === 'nodejs' ? 'Node.js' : langKey === 'curl' ? 'cURL' : langKey === 'python' ? 'Python' : 'Go' }}
          </button>
        </div>

        <div class="relative group">
          <div :class="['rounded-lg p-4 border transition-colors', theme === 'dark' ? 'bg-black group-hover:bg-[#0a0a0a]' : 'bg-gray-50 group-hover:bg-gray-100', border]">
            <pre :class="['text-xs overflow-x-auto font-mono leading-relaxed', muted]">{{ example.code[selectedLang[idx] || 'nodejs'] }}</pre>
          </div>
          <button
            @click="copyApiCode(example.code[selectedLang[idx] || 'nodejs'], idx)"
            :class="[
              'absolute top-2 right-2 p-2 rounded-lg transition-all border',
              copiedApi[idx]
                ? (theme === 'dark' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-emerald-600 text-white border-emerald-600')
                : (theme === 'dark' ? 'bg-[#1a1a1a] hover:bg-[#222222] border-gray-700' : 'bg-white hover:bg-gray-50 border-gray-200')
            ]"
          >
            <Check v-if="copiedApi[idx]" :size="16" />
            <Copy v-else :size="16" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Copy, Check } from 'lucide-vue-next';
import { useTheme } from '../composables/useTheme.js';
import { useLocale } from '../composables/useLocale.js';

const { theme, card, border, muted } = useTheme();
const { t } = useLocale();

const selectedLang = ref({});
const copiedApi = ref({});

const apiExamples = computed(() => [
  {
    title: t('api.step1'),
    description: t('api.step1desc'),
    code: {
      curl: `curl "${window.location.origin}/api/video?url=https://www.tiktok.com/@user/video/123" \\
  -o video.mp4`,
      nodejs: `const url = "https://www.tiktok.com/@user/video/123";
const response = await fetch(\`${window.location.origin}/api/video?url=\${encodeURIComponent(url)}\`);
const blob = await response.blob();
// Save blob as file`,
      python: `import requests

url = "https://www.tiktok.com/@user/video/123"
response = requests.get(f"${window.location.origin}/api/video", params={"url": url})

with open("video.mp4", "wb") as f:
    f.write(response.content)`,
      go: `package main

import (
    "io"
    "net/http"
    "net/url"
    "os"
)

func main() {
    videoURL := "https://www.tiktok.com/@user/video/123"
    apiURL := "${window.location.origin}/api/video?url=" + url.QueryEscape(videoURL)
    
    resp, _ := http.Get(apiURL)
    defer resp.Body.Close()
    
    out, _ := os.Create("video.mp4")
    defer out.Close()
    
    io.Copy(out, resp.Body)
}`
    }
  },
  {
    title: t('api.step2'),
    description: t('api.step2desc'),
    code: {
      curl: `curl -X POST "${window.location.origin}/api/download" \\
  -H "Content-Type: application/json" \\
  -d '{"url":"https://www.instagram.com/reel/ABC123/"}'`,
      nodejs: `const response = await fetch("${window.location.origin}/api/download", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    url: "https://www.instagram.com/reel/ABC123/"
  })
});

const data = await response.json();
console.log(data.downloadUrl);`,
      python: `import requests

response = requests.post(
    "${window.location.origin}/api/download",
    json={"url": "https://www.instagram.com/reel/ABC123/"}
)

data = response.json()
print(data["downloadUrl"])`,
      go: `package main

import (
    "bytes"
    "encoding/json"
    "net/http"
)

func main() {
    payload := map[string]string{
        "url": "https://www.instagram.com/reel/ABC123/",
    }
    jsonData, _ := json.Marshal(payload)
    
    resp, _ := http.Post(
        "${window.location.origin}/api/download",
        "application/json",
        bytes.NewBuffer(jsonData),
    )
    defer resp.Body.Close()
    
    var result map[string]interface{}
    json.NewDecoder(resp.Body).Decode(&result)
}`
    }
  }
]);

const copyApiCode = (code, idx) => {
  navigator.clipboard.writeText(code);
  copiedApi.value[idx] = true;
  setTimeout(() => copiedApi.value[idx] = false, 2000);
};
</script>
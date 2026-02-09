export function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (err) {
    return false;
  }
}

export function detectPlatform(url) {
  const urlLower = url.toLowerCase();
  
  if (urlLower.includes('tiktok.com') || urlLower.includes('vm.tiktok.com')) {
    return 'TikTok';
  }
  
  if (urlLower.includes('instagram.com')) {
    return 'Instagram';
  }
  
  if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
    return 'YouTube';
  }
  
  if (urlLower.includes('vk.com') || urlLower.includes('vk.ru') || urlLower.includes('vkvideo.ru')) {
    return 'VK';
  }
  
  if (urlLower.includes('rutube.ru')) {
    return 'Rutube';
  }
  
  return null;
}
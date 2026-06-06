const audioCache = new Map();

export async function speak(text) {
  if (!text) return;
  const cleanText = text.trim();
  
  if (audioCache.has(cleanText)) {
    const cachedUrl = audioCache.get(cleanText);
    const audio = new Audio(cachedUrl);
    return audio.play().catch(err => console.error("Audio playback error:", err));
  }

  try {
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text: cleanText })
    });

    if (!response.ok) {
      throw new Error(`TTS server error: ${response.status}`);
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    audioCache.set(cleanText, url);
    const audio = new Audio(url);
    return audio.play().catch(err => console.error("Audio playback error:", err));
  } catch (error) {
    console.error("Failed to fetch or play TTS audio:", error);
  }
}

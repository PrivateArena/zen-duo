export async function translate(text) {
  if (!text) return "";
  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text })
    });
    if (!response.ok) throw new Error("Translation failed");
    const data = await response.json();
    return data.translated || "";
  } catch (error) {
    console.error("Translation error:", error);
    return text;
  }
}

export async function generateSVG(prompt) {
  if (!prompt) return "";
  try {
    const response = await fetch('/api/paint/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt })
    });
    if (!response.ok) throw new Error("SVG generation failed");
    const data = await response.json();
    if (data.path) {
      // Extract filename from "/tmp/zen-paint/filename.svg"
      const filename = data.path.split('/').pop();
      return `/api/paint/outputs/${filename}`;
    }
    throw new Error("Invalid output path from paint server");
  } catch (error) {
    console.error("SVG paint error:", error);
    return "";
  }
}

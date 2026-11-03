export function speakText(text: string, langCode: string = 'ko') {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser.');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  
  // Normalize language tags
  const lower = langCode.toLowerCase();
  if (lower.startsWith('ko')) {
    utterance.lang = 'ko-KR';
  } else if (lower.startsWith('ja') || lower.includes('일본')) {
    utterance.lang = 'ja-JP';
  } else if (lower.startsWith('en') || lower.includes('영')) {
    utterance.lang = 'en-US';
  } else if (lower.startsWith('fr') || lower.includes('프랑스')) {
    utterance.lang = 'fr-FR';
  } else if (lower.startsWith('es') || lower.includes('스페인')) {
    utterance.lang = 'es-ES';
  } else if (lower.startsWith('zh') || lower.includes('중국')) {
    utterance.lang = 'zh-CN';
  } else if (lower.startsWith('de') || lower.includes('독일')) {
    utterance.lang = 'de-DE';
  } else {
    utterance.lang = langCode;
  }

  utterance.rate = 0.95;
  utterance.pitch = 1.0;

  window.speechSynthesis.speak(utterance);
}

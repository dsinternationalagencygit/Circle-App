/**
 * Web Speech API Service (speechSynthesis)
 * Provides read-aloud functionality for Card 1 (Send this) and Card 2 (For them).
 */

export function speakText(text) {
  if (!('speechSynthesis' in window)) {
    console.warn('Web Speech API is not supported in this browser.');
    return;
  }

  try {
    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    if (!text || text.trim() === '') return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95; // Slightly slower, empathetic cadence
    utterance.pitch = 1.0;

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.error('Error during Web Speech API playback:', err);
  }
}

export function stopSpeech() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

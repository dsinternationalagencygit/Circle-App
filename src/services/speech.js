/**
 * Web Speech API Service (speechSynthesis)
 * Provides read-aloud functionality for Card 1 (Send this) and Card 2 (For them).
 */

export function speakText(targetText) {
  if (!('speechSynthesis' in window)) {
    return;
  }

  try {
    window.speechSynthesis.cancel();

    if (!targetText || targetText.trim() === '') return;

    const speechUtterance = new SpeechSynthesisUtterance(targetText);
    speechUtterance.rate = 0.95;
    speechUtterance.pitch = 1.0;

    window.speechSynthesis.speak(speechUtterance);
  } catch (speechError) {
    // Fail silently if speech synthesis fails
  }
}

export function stopSpeech() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

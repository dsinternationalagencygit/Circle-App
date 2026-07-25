/**
 * Helper utilities for Copying to Clipboard and Web Share API
 */

export async function copyToClipboard(text) {
  if (!text) return false;
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for legacy environments
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    }
  } catch (err) {
    console.error('Clipboard copy failed:', err);
    return false;
  }
}

export async function shareBothContent(aiContent, contactName) {
  if (!aiContent) return false;

  const shareText = `Message: "${aiContent.message}"\n\nFor ${contactName}: ${aiContent.forThemDo}\nDo not say: ${aiContent.forThemAvoid}`;

  if (navigator.share) {
    try {
      await navigator.share({
        title: `Circle Reach-Out to ${contactName}`,
        text: shareText
      });
      return true;
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.warn('Navigator share failed, falling back to copy:', err);
        return await copyToClipboard(shareText);
      }
      return false;
    }
  } else {
    // Fallback on desktop to copy
    return await copyToClipboard(shareText);
  }
}

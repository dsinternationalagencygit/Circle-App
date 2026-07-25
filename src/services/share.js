/**
 * Helper utilities for Copying to Clipboard and Web Share API
 */

export async function copyToClipboard(targetText) {
  if (!targetText) return false;
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(targetText);
      return true;
    } else {
      const textAreaElement = document.createElement('textarea');
      textAreaElement.value = targetText;
      textAreaElement.style.position = 'fixed';
      textAreaElement.style.left = '-9999px';
      document.body.appendChild(textAreaElement);
      textAreaElement.focus();
      textAreaElement.select();
      const isCopySuccessful = document.execCommand('copy');
      document.body.removeChild(textAreaElement);
      return isCopySuccessful;
    }
  } catch (clipboardError) {
    return false;
  }
}

export async function shareBothContent(aiContent, contactName) {
  if (!aiContent) return false;

  const combinedShareText = `Message: "${aiContent.message}"\n\nFor ${contactName}: ${aiContent.forThemDo}\nDo not say: ${aiContent.forThemAvoid}`;

  if (navigator.share) {
    try {
      await navigator.share({
        title: `Circle Reach-Out to ${contactName}`,
        text: combinedShareText
      });
      return true;
    } catch (shareError) {
      if (shareError.name !== 'AbortError') {
        return await copyToClipboard(combinedShareText);
      }
      return false;
    }
  } else {
    return await copyToClipboard(combinedShareText);
  }
}

import { useState } from 'react';
import html2canvas from 'html2canvas';
import { motion } from 'framer-motion';

/**
 * ShareButton
 * Props:
 *   captureRef — ref to the div that wraps the capture zone
 *   delayMs    — entrance animation delay (ms)
 */
export default function ShareButton({ captureRef, delayMs = 600 }) {
  const [status, setStatus] = useState('idle'); // 'idle' | 'capturing' | 'done' | 'error'

  async function handleShare() {
    if (!captureRef?.current || status === 'capturing') return;
    setStatus('capturing');

    try {
      const canvas = await html2canvas(captureRef.current, {
        backgroundColor: '#F8F8F6',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
      });

      const dataUrl = canvas.toDataURL('image/png');

      // Try native share sheet (mobile) first
      if (navigator.share) {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], 'my-loop.png', { type: 'image/png' });
        try {
          await navigator.share({
            title: 'My Loop',
            text: 'This is the invisible loop running my habit — made visible with Loop.',
            files: [file],
          });
          setStatus('done');
          return;
        } catch {
          // User cancelled share sheet — fall through to download
        }
      }

      // Desktop fallback: download
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'my-loop.png';
      a.click();
      setStatus('done');
    } catch (err) {
      console.error('Share failed:', err);
      setStatus('error');
    }

    setTimeout(() => setStatus('idle'), 2500);
  }

  const label =
    status === 'capturing' ? 'Generating…' :
    status === 'done'      ? 'Saved ✓' :
    status === 'error'     ? 'Try again' :
                             'Share my Loop →';

  return (
    <motion.div
      className="share-wrap"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: delayMs / 1000, duration: 0.3 }}
    >
      <button
        className="share-btn"
        onClick={handleShare}
        disabled={status === 'capturing'}
        aria-label="Share your habit loop as an image"
      >
        {label}
      </button>
    </motion.div>
  );
}

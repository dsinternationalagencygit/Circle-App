import { motion } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import LoopDiagram from '../components/LoopDiagram';

/* ----------------------------------------------------------------
   LoopScreen
   Props:
     answers     — { habit, when, trigger, feeling }
     onReset     — callback to return to opening screen
   Stage 1: diagram + "Your Loop" label only
   Stage 3+: LoopBreakerCard + share button
   ---------------------------------------------------------------- */

export default function LoopScreen({ answers, onReset }) {
  const [diagramDone, setDiagramDone] = useState(false);
  const [showYourLoop, setShowYourLoop] = useState(false);

  const handleDiagramComplete = useCallback(() => {
    setDiagramDone(true);
    // "Your Loop" label fades in 500ms after diagram completes (step 11)
    setTimeout(() => setShowYourLoop(true), 500);
  }, []);

  return (
    <div className="screen loop-screen">
      {/* Wordmark header */}
      <div className="loop-screen-header">
        <div className="wordmark">Loop</div>
        <div className="wordmark-tagline">understand what runs your habits.</div>
      </div>

      <div className="loop-screen-body">
        {/* Step 11: "Your Loop" label */}
        <motion.div
          className="your-loop-label"
          initial={{ opacity: 0 }}
          animate={{ opacity: showYourLoop ? 1 : 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          aria-live="polite"
        >
          Your Loop
        </motion.div>

        {/* The diagram */}
        <div className="loop-diagram-container">
          <LoopDiagram
            answers={answers}
            onDiagramComplete={handleDiagramComplete}
          />
        </div>

        {/* Stage 3+: Loop Breaker and Share will mount here */}
        {/* Placeholder text during Stage 1 */}
        {diagramDone && (
          <motion.p
            className="loading-text"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            Loop Breaker coming in Stage 3.
          </motion.p>
        )}

        {/* Reset link */}
        <button
          className="demo-link"
          onClick={onReset}
          style={{ marginTop: 'auto' }}
        >
          ← Start over
        </button>
      </div>
    </div>
  );
}

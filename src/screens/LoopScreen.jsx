import { motion } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import LoopDiagram from '../components/LoopDiagram';

export default function LoopScreen({ answers, onReset }) {
  const [diagramDone, setDiagramDone] = useState(false);
  const [showYourLoop, setShowYourLoop] = useState(false);

  const handleDiagramComplete = useCallback(() => {
    setDiagramDone(true);
    // Step 11: "Your Loop" label fades in 500ms after diagram completes
    setTimeout(() => setShowYourLoop(true), 500);
  }, []);

  return (
    <div className="screen loop-screen">
      <div className="loop-screen-header">
        <div className="wordmark">Loop</div>
        <div className="wordmark-tagline">understand what runs your habits.</div>
      </div>

      <div className="loop-screen-body">
        {/* Step 11: "Your Loop" label */}
        <motion.h1
          className="your-loop-label"
          initial={{ opacity: 0 }}
          animate={{ opacity: showYourLoop ? 1 : 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          Your Loop
        </motion.h1>

        {/* The diagram */}
        <div className="loop-diagram-wrap">
          <LoopDiagram
            answers={answers}
            onDiagramComplete={handleDiagramComplete}
          />
        </div>

        {/* Stage 3+: Loop Breaker and Share will appear here */}

        {/* Reset */}
        <button className="back-link" onClick={onReset}>
          ← Start over
        </button>
      </div>
    </div>
  );
}

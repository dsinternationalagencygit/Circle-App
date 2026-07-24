import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import LoopDiagram from '../components/LoopDiagram';
import StaticLoopDiagram from '../components/StaticLoopDiagram';
import LoopBreakerCard from '../components/LoopBreakerCard';
import ShareButton from '../components/ShareButton';
import { getLoopBreaker } from '../services/gemini';

export default function LoopScreen({ answers, onReset }) {
  const [showLabel,   setShowLabel]   = useState(false);
  const [showBreaker, setShowBreaker] = useState(false);
  const [breakerText, setBreakerText] = useState(null);
  const captureRef = useRef(null);

  const handleDiagramComplete = useCallback(() => {
    setTimeout(() => setShowLabel(true), 500);
    setTimeout(() => setShowBreaker(true), 400);
    getLoopBreaker(answers)
      .then(setBreakerText)
      .catch(() => setBreakerText('Could not load your Loop Breaker. Try again.'));
  }, [answers]);

  return (
    <div className="screen loop-screen">
      <div className="loop-header">
        <div className="wordmark">Loop</div>
        <div className="wordmark-sub">understand what runs your habits.</div>
      </div>

      <div className="loop-body">
        {/* "Your Loop" label — step 11 */}
        <motion.h1
          className="your-loop-label"
          initial={{ opacity: 0 }}
          animate={{ opacity: showLabel ? 1 : 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          aria-live="polite"
        >
          Your Loop
        </motion.h1>

        {/* Animated loop diagram */}
        <div className="loop-diagram-wrap">
          <LoopDiagram
            answers={answers}
            onDiagramComplete={handleDiagramComplete}
          />
        </div>

        {/* Loop Breaker card — slides up after diagram done */}
        {showBreaker && (
          <LoopBreakerCard text={breakerText} delayMs={0} />
        )}

        {/* Share button — fades in after card */}
        {showBreaker && (
          <ShareButton captureRef={captureRef} delayMs={300} />
        )}

        {/* ── Offscreen capture zone for html2canvas ── */}
        <div ref={captureRef} className="capture-zone">
          <div className="capture-title">Your Loop</div>
          <div className="capture-diagram">
            <StaticLoopDiagram answers={answers} />
          </div>
          <div className="capture-wordmark">Loop</div>
        </div>

        <button className="back-link" onClick={onReset}>
          ← Start over
        </button>
      </div>
    </div>
  );
}

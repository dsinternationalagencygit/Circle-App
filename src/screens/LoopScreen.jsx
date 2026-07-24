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
      {/* Top Navbar */}
      <div className="nav-bar">
        <button
          className="nav-btn"
          onClick={onReset}
          aria-label="Go back to opening screen"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <span className="nav-title">Your Habits</span>
        <div className="nav-btn" style={{ opacity: 0 }}></div>
      </div>

      <div className="loop-body">
        {/* "Your Loop" label */}
        <motion.h2
          className="your-loop-label"
          initial={{ opacity: 0 }}
          animate={{ opacity: showLabel ? 1 : 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          aria-live="polite"
        >
          Your Loop
        </motion.h2>

        {/* Animated loop diagram card container */}
        <div className="loop-diagram-wrap">
          <LoopDiagram
            answers={answers}
            onDiagramComplete={handleDiagramComplete}
          />
        </div>

        {/* Loop Breaker card */}
        {showBreaker && (
          <LoopBreakerCard text={breakerText} delayMs={0} />
        )}

        {/* Share button */}
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

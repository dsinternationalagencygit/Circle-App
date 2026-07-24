import { motion } from 'framer-motion';
import { QUESTIONS } from '../data/questions';

export default function OpeningScreen({ onAnswer, onDemo }) {
  const q1 = QUESTIONS[0];

  return (
    <div className="screen opening-screen">
      {/* Top Navbar */}
      <div className="nav-bar">
        <div className="nav-btn" style={{ opacity: 0 }}></div>
        <span className="nav-title">Habit Loop Unmasker</span>
        <div className="nav-btn" style={{ opacity: 0 }}></div>
      </div>

      <motion.div
        className="wordmark-wrap"
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <h1 className="wordmark">Loop</h1>
        <p className="wordmark-sub">understand what runs your habits.</p>
      </motion.div>

      <div className="opening-hero">
        <motion.p
          className="opening-eyebrow"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.18 }}
        >
          Four taps. No typing.
        </motion.p>

        <motion.h2
          className="opening-question"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          {q1.text}
        </motion.h2>

        <motion.div
          className="tile-grid"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.32 }}
        >
          {q1.options.map((option, i) => (
            <motion.button
              key={option}
              className="tile"
              id={`tile-${option.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => onAnswer(q1.key, option)}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: 0.34 + i * 0.06 }}
            >
              <div className="tile-icon-dot">{option[0]}</div>
              <div className="tile-content">
                <span className="tile-title">{option}</span>
                <span className="tile-subtitle">Tap to configure</span>
              </div>
            </motion.button>
          ))}
        </motion.div>

        <div className="demo-link-wrap">
          <motion.button
            className="demo-link"
            id="demo-link"
            onClick={onDemo}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.6 }}
            aria-label="Skip to Vikram's pre-filled loop demo"
          >
            See Vikram's Loop →
          </motion.button>
        </div>
      </div>
    </div>
  );
}

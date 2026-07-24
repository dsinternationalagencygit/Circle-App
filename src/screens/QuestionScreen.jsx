import { motion, AnimatePresence } from 'framer-motion';
import { QUESTIONS } from '../data/questions';

export default function QuestionScreen({ currentQ, answers, onAnswer, onBack }) {
  const question = QUESTIONS[currentQ];
  const totalQuestions = QUESTIONS.length;
  const stepNum = currentQ + 1;
  const progressPct = (currentQ / totalQuestions) * 100;

  const chips = QUESTIONS.slice(0, currentQ)
    .map((q) => answers[q.key])
    .filter(Boolean);

  return (
    <div className="screen question-screen">
      {/* Progress tracking line */}
      <div className="progress-track">
        <motion.div
          className="progress-fill"
          initial={{ width: `${((currentQ - 1) / totalQuestions) * 100}%` }}
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>

      {/* Top Navbar */}
      <div className="nav-bar">
        <button
          className="nav-btn"
          onClick={onBack}
          aria-label="Go back to previous question"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <span className="nav-title">Configure Loop</span>
        <div className="nav-btn" style={{ opacity: 0 }}></div>
      </div>

      <div className="question-header">
        {/* Answer chips */}
        <div className="chips-row" aria-label="Your choices so far">
          <AnimatePresence>
            {chips.map((chip) => (
              <motion.span
                key={chip}
                className="chip"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                {chip}
              </motion.span>
            ))}
          </AnimatePresence>
        </div>

        <p className="q-meta">
          Step {stepNum} of {totalQuestions}
        </p>
      </div>

      <div className="question-body">
        <AnimatePresence mode="wait">
          <motion.h2
            key={question.id}
            className="opening-question"
            style={{ fontSize: '26px', marginBottom: '24px' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.26, ease: 'easeOut' }}
          >
            {question.text}
          </motion.h2>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div
            key={`grid-${question.id}`}
            className="tile-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {question.options.map((option) => (
              <button
                key={option}
                className="tile"
                id={`tile-${option.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => onAnswer?.(question.key, option)}
              >
                <div className="tile-icon-dot">{option[0]}</div>
                <div className="tile-content">
                  <span className="tile-title">{option}</span>
                  <span className="tile-subtitle">Select option</span>
                </div>
              </button>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

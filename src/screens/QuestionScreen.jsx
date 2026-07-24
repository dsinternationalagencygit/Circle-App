import { motion } from 'framer-motion';
import { QUESTIONS } from '../data/questions';

/* ----------------------------------------------------------------
   QuestionScreen — Q2, Q3, Q4
   Props:
     currentQ    — 1-indexed question index (1 = Q2, 2 = Q3, 3 = Q4)
     answers     — partial answers object built so far
     onAnswer    — (key, value) => void
   Stage 1: rendered as read-only shell (no tap logic)
   Stage 2: fully wired
   ---------------------------------------------------------------- */

const CHIP_COLORS = {
  habit: '#161616',
  when: '#161616',
  trigger: '#161616',
  feeling: '#161616',
};

export default function QuestionScreen({ currentQ, answers, onAnswer }) {
  // currentQ is 1-indexed into QUESTIONS (Q2 = index 1, Q3 = 2, Q4 = 3)
  const question = QUESTIONS[currentQ];
  const progressPct = (currentQ / QUESTIONS.length) * 100; // 25, 50, 75, 100

  // Build chips from answers collected so far
  const chips = QUESTIONS.slice(0, currentQ)
    .map((q) => answers[q.key])
    .filter(Boolean);

  return (
    <div className="screen question-screen">
      {/* Progress bar — fixed at top */}
      <div className="progress-bar-container">
        <motion.div
          className="progress-bar-fill"
          initial={{ width: `${((currentQ - 1) / QUESTIONS.length) * 100}%` }}
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>

      {/* Header: wordmark + answer chips */}
      <div className="question-header">
        <div className="wordmark">Loop</div>
        <div className="wordmark-tagline">understand what runs your habits.</div>

        <div className="answer-chips" aria-label="Your answers so far">
          {chips.map((chip, i) => (
            <motion.div
              key={chip}
              className="answer-chip"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: i * 0.05 }}
            >
              {chip}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Question body */}
      <div className="question-body">
        <motion.h1
          className="question-text"
          key={question.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {question.text}
        </motion.h1>

        <motion.div
          className="tile-grid"
          key={`grid-${question.id}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25, delay: 0.1 }}
        >
          {question.options.map((option) => (
            <button
              key={option}
              className="tile"
              onClick={() => onAnswer?.(question.key, option)}
            >
              {option}
            </button>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

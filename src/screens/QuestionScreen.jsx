import { motion, AnimatePresence } from 'framer-motion';
import { QUESTIONS } from '../data/questions';

export default function QuestionScreen({ currentQ, answers, onAnswer }) {
  const question = QUESTIONS[currentQ];
  const totalQuestions = QUESTIONS.length; // 4
  // Q1 is on opening screen, so Q2 = step 2 of 4, Q3 = 3 of 4, Q4 = 4 of 4
  const stepNum = currentQ + 1; // currentQ is 1-indexed from 1
  const progressPct = (currentQ / totalQuestions) * 100;

  // Chips = all answered questions so far (Q1 = answers.habit + any Q2/Q3 answers)
  const chips = QUESTIONS.slice(0, currentQ)
    .map((q) => answers[q.key])
    .filter(Boolean);

  return (
    <div className="screen question-screen">
      {/* Fixed progress bar at top */}
      <div className="progress-track">
        <motion.div
          className="progress-fill"
          initial={{ width: `${((currentQ - 1) / totalQuestions) * 100}%` }}
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>

      <div className="question-header">
        <div className="wordmark">Loop</div>
        <div className="wordmark-sub">understand what runs your habits.</div>

        {/* Answer chips */}
        <div className="chips-row" aria-label="Your answers so far">
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
          Question {stepNum} of {totalQuestions}
        </p>
      </div>

      <div className="question-body">
        <AnimatePresence mode="wait">
          <motion.h1
            key={question.id}
            className="question-text"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.26, ease: 'easeOut' }}
          >
            {question.text}
          </motion.h1>
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
                {option}
              </button>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

import { motion } from 'framer-motion';
import { QUESTIONS } from '../data/questions';

export default function QuestionScreen({ currentQ, answers, onAnswer }) {
  const question = QUESTIONS[currentQ];
  // Progress: Q2=25%, Q3=50%, Q4=75%, after Q4=100%
  const progressPct = (currentQ / QUESTIONS.length) * 100;

  // Build chips from answers collected so far (Q1 answer + any prior question answers)
  const chips = QUESTIONS.slice(0, currentQ)
    .map((q) => answers[q.key])
    .filter(Boolean);

  return (
    <div className="screen question-screen">
      {/* Progress bar — fixed at top of viewport */}
      <div className="progress-bar-track">
        <motion.div
          className="progress-bar-fill"
          initial={{ width: `${((currentQ - 1) / QUESTIONS.length) * 100}%` }}
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>

      {/* Header */}
      <div className="question-header">
        <div className="wordmark">Loop</div>
        <div className="wordmark-tagline">understand what runs your habits.</div>

        {/* Answer chips build as questions are answered */}
        {chips.length > 0 && (
          <div className="answer-chips" aria-label="Your answers so far">
            {chips.map((chip) => (
              <motion.span
                key={chip}
                className="answer-chip"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
              >
                {chip}
              </motion.span>
            ))}
          </div>
        )}
      </div>

      {/* Question body */}
      <div className="question-body">
        <motion.h1
          className="question-text"
          key={question.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
        >
          {question.text}
        </motion.h1>

        <motion.div
          className="tile-grid"
          key={`grid-${question.id}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.22, delay: 0.08 }}
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
      </div>
    </div>
  );
}

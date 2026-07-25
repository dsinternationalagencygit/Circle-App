import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const QUESTIONS = [
  {
    step: 1,
    question: "How strong is it right now?",
    options: ["Manageable", "Building", "Strong", "I am about to"]
  },
  {
    step: 2,
    question: "What set it off?",
    options: ["Stress", "Alone", "A place or person", "No reason"]
  },
  {
    step: 3,
    question: "Who is nearby?",
    options: ["Nobody", "Family", "Friends", "Strangers"]
  }
];

export function S3TapSequence({ onComplete }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState({});

  const currentQ = QUESTIONS[stepIndex];

  const handleSelectOption = (option) => {
    const nextAnswers = { ...answers, [currentQ.step]: option };
    setAnswers(nextAnswers);

    if (stepIndex < QUESTIONS.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      // Completed all 3 questions
      onComplete(nextAnswers);
    }
  };

  return (
    <div className="s3-tap-container">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ.step}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.26, ease: 'easeOut' }}
          style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '32px' }}
        >
          <div>
            <div className="question-step-meta">{currentQ.step} of 3</div>
            <h2 className="question-text">{currentQ.question}</h2>
          </div>

          <div className="tap-tiles-grid" role="group" aria-label={currentQ.question}>
            {currentQ.options.map((opt) => (
              <motion.button
                key={opt}
                className="tap-tile"
                onClick={() => handleSelectOption(opt)}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                aria-label={`Select option ${opt}`}
              >
                <span className="tap-tile-label">{opt}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

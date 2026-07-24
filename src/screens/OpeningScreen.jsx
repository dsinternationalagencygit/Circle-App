import { QUESTIONS, VIKRAM_ANSWERS } from '../data/questions';

/* ----------------------------------------------------------------
   OpeningScreen
   - Wordmark + tagline
   - "What is running you?" hero question
   - Q1 tiles (four habit options)
   - "See Vikram's Loop →" demo link
   
   Stage 1: only demo link is wired
   Stage 2: Q1 tiles fire onAnswer('habit', value)
   ---------------------------------------------------------------- */

export default function OpeningScreen({ onAnswer, onDemo }) {
  const q1 = QUESTIONS[0]; // "What is running you?" with Q1 options

  return (
    <div className="screen opening-screen">
      {/* Wordmark */}
      <div className="wordmark">Loop</div>
      <div className="wordmark-tagline">understand what runs your habits.</div>

      {/* Hero */}
      <div className="opening-hero">
        <h1 className="opening-question">{q1.text}</h1>

        <div className="tile-grid">
          {q1.options.map((option) => (
            <button
              key={option}
              className="tile"
              id={`tile-${option.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => onAnswer?.(q1.key, option)}
            >
              {option}
            </button>
          ))}
        </div>

        {/* Demo jump link */}
        <button
          className="demo-link"
          id="demo-link"
          onClick={onDemo}
          aria-label="See Vikram's Loop — a pre-filled demo"
        >
          See Vikram&apos;s Loop →
        </button>
      </div>
    </div>
  );
}

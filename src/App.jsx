import { useState } from 'react';
import './index.css';
import OpeningScreen from './screens/OpeningScreen';
import QuestionScreen from './screens/QuestionScreen';
import LoopScreen from './screens/LoopScreen';
import { VIKRAM_ANSWERS } from './data/questions';

const EMPTY = { habit: null, when: null, trigger: null, feeling: null };

export default function App() {
  const [screen,   setScreen]   = useState('opening'); // 'opening' | 'question' | 'loop'
  const [answers,  setAnswers]  = useState(EMPTY);
  const [currentQ, setCurrentQ] = useState(1); // index into QUESTIONS[]; 1 = Q2

  // Demo: jump straight to loop with Vikram's seeded answers
  function handleDemo() {
    setAnswers(VIKRAM_ANSWERS);
    setScreen('loop');
  }

  // Called by every tile tap on every screen
  function handleAnswer(key, value) {
    const next = { ...answers, [key]: value };
    setAnswers(next);

    if (key === 'habit') {
      // Q1 answered on opening screen → advance to Q2
      setCurrentQ(1);
      setScreen('question');
    } else if (key === 'when') {
      // Q2 → Q3
      setCurrentQ(2);
    } else if (key === 'trigger') {
      // Q3 → Q4
      setCurrentQ(3);
    } else if (key === 'feeling') {
      // Q4 → 800ms pause → loop screen
      setTimeout(() => setScreen('loop'), 800);
    }
  }

  function handleBack() {
    if (screen === 'question') {
      if (currentQ === 1) {
        // At Q2, go back to opening screen
        setScreen('opening');
      } else {
        // Go back to previous question
        setCurrentQ(currentQ - 1);
      }
    }
  }

  function handleReset() {
    setAnswers(EMPTY);
    setCurrentQ(1);
    setScreen('opening');
  }

  return (
    <div className="app">
      {screen === 'opening' && (
        <OpeningScreen onAnswer={handleAnswer} onDemo={handleDemo} />
      )}
      {screen === 'question' && (
        <QuestionScreen
          currentQ={currentQ}
          answers={answers}
          onAnswer={handleAnswer}
          onBack={handleBack}
        />
      )}
      {screen === 'loop' && (
        <LoopScreen answers={answers} onReset={handleReset} />
      )}
    </div>
  );
}

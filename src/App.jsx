import { useState } from 'react';
import './index.css';
import OpeningScreen from './screens/OpeningScreen';
import QuestionScreen from './screens/QuestionScreen';
import LoopScreen from './screens/LoopScreen';
import { VIKRAM_ANSWERS } from './data/questions';

/*
  App — top-level screen router
  Screens: 'opening' | 'question' | 'loop'
  
  Stage 1: Only demo link wired ('opening' → 'loop' with Vikram's answers)
  Stage 2: Full Q1→Q2→Q3→Q4→loop flow
*/

const EMPTY_ANSWERS = { habit: null, when: null, trigger: null, feeling: null };

export default function App() {
  const [screen, setScreen] = useState('opening');
  const [answers, setAnswers] = useState(EMPTY_ANSWERS);
  const [currentQ, setCurrentQ] = useState(1); // 1 = Q2 (index in QUESTIONS array)

  // Demo: skip to loop screen with Vikram's seeded answers
  function handleDemo() {
    setAnswers(VIKRAM_ANSWERS);
    setScreen('loop');
  }

  // Stage 1: Q1 tiles do nothing (wired in Stage 2)
  // Stage 2: Q1 triggers advance to Q2
  function handleAnswer(key, value) {
    const updated = { ...answers, [key]: value };
    setAnswers(updated);

    if (key === 'habit') {
      // Q1 answered → go to Q2
      setCurrentQ(1);
      setScreen('question');
    } else if (key === 'when') {
      setCurrentQ(2);
    } else if (key === 'trigger') {
      setCurrentQ(3);
    } else if (key === 'feeling') {
      // Q4 answered → 800ms pause → loop screen
      setTimeout(() => setScreen('loop'), 800);
    }
  }

  function handleReset() {
    setAnswers(EMPTY_ANSWERS);
    setCurrentQ(1);
    setScreen('opening');
  }

  return (
    <div className="app">
      {screen === 'opening' && (
        <OpeningScreen
          onAnswer={handleAnswer}
          onDemo={handleDemo}
        />
      )}
      {screen === 'question' && (
        <QuestionScreen
          currentQ={currentQ}
          answers={answers}
          onAnswer={handleAnswer}
        />
      )}
      {screen === 'loop' && (
        <LoopScreen
          answers={answers}
          onReset={handleReset}
        />
      )}
    </div>
  );
}

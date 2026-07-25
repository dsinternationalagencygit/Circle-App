import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HelplineStrip } from './components/HelplineStrip';
import { S1Setup } from './screens/S1Setup';
import { S2CrisisEntry } from './screens/S2CrisisEntry';
import { S3TapSequence } from './screens/S3TapSequence';
import { S3DecisionView } from './screens/S3DecisionView';
import { S4Escalation } from './screens/S4Escalation';
import { getContacts, getReachoutsThisMonth, logReachout } from './services/storage';
import { evaluateSelection } from './services/selection';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('S2_CRISIS_ENTRY');
  const [reachoutCount, setReachoutCount] = useState(0);
  const [contacts, setContacts] = useState([]);
  const [selectionState, setSelectionState] = useState({
    chosenContact: null,
    whyText: '',
    answers: {}
  });

  useEffect(() => {
    // Load contacts and reach-out count on mount
    const savedContacts = getContacts();
    setContacts(savedContacts);

    const monthReachouts = getReachoutsThisMonth();
    setReachoutCount(monthReachouts.length);
  }, [currentScreen]);

  // Flow navigation handlers
  const handleStartCrisis = () => {
    setCurrentScreen('S3_TAPS');
  };

  const handleTapsComplete = (answers) => {
    const activeContacts = getContacts();
    setContacts(activeContacts);

    const q1 = answers[1];
    const q2 = answers[2];
    const q3 = answers[3];

    // Run deterministic selection rules engine
    const result = evaluateSelection(activeContacts, q1, q2, q3, new Date());

    if (!result.chosenContact) {
      // If no eligible contact, skip straight to S4 Escalation
      setCurrentScreen('S4_ESCALATION');
      return;
    }

    setSelectionState({
      chosenContact: result.chosenContact,
      whyText: result.whyText,
      answers
    });

    // Log real reach-out in localStorage
    logReachout();
    const updatedReachouts = getReachoutsThisMonth();
    setReachoutCount(updatedReachouts.length);

    setCurrentScreen('S3_DECISION');
  };

  const handleEscalate = () => {
    setCurrentScreen('S4_ESCALATION');
  };

  const handleSaveSetup = (savedContacts) => {
    setContacts(savedContacts);
    setCurrentScreen('S2_CRISIS_ENTRY');
  };

  return (
    <div className="app-container">
      <main className="stage">
        <Header 
          currentScreen={currentScreen} 
          onNavigate={(screen) => setCurrentScreen(screen)} 
        />

        {currentScreen === 'S2_CRISIS_ENTRY' && (
          <S2CrisisEntry 
            reachoutCount={reachoutCount}
            onStartCrisis={handleStartCrisis}
            onEscalate={handleEscalate}
          />
        )}

        {currentScreen === 'S3_TAPS' && (
          <S3TapSequence 
            onComplete={handleTapsComplete}
          />
        )}

        {currentScreen === 'S3_DECISION' && (
          <S3DecisionView 
            contacts={contacts}
            chosenContact={selectionState.chosenContact}
            whyText={selectionState.whyText}
            onReset={() => setCurrentScreen('S2_CRISIS_ENTRY')}
          />
        )}

        {currentScreen === 'S4_ESCALATION' && (
          <S4Escalation />
        )}

        {currentScreen === 'S1_SETUP' && (
          <S1Setup 
            onSave={handleSaveSetup}
          />
        )}
      </main>

      {/* Helpline strip present on EVERY screen */}
      <HelplineStrip />
    </div>
  );
}

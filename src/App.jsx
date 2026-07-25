import React, { useState } from 'react';
import { Header } from './components/Header';
import { HelplineStrip } from './components/HelplineStrip';
import { S1Setup } from './screens/S1Setup';
import { S2CrisisEntry } from './screens/S2CrisisEntry';
import { S3TapSequence } from './screens/S3TapSequence';
import { S3DecisionView } from './screens/S3DecisionView';
import { S4Escalation } from './screens/S4Escalation';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('S2_CRISIS_ENTRY');
  const [reachoutCount, setReachoutCount] = useState(0);

  // Flow navigation handlers
  const handleStartCrisis = () => {
    setCurrentScreen('S3_TAPS');
  };

  const handleTapsComplete = (answers) => {
    // Proceed to Decision Screen
    setCurrentScreen('S3_DECISION');
  };

  const handleEscalate = () => {
    setCurrentScreen('S4_ESCALATION');
  };

  const handleSaveSetup = (savedContacts) => {
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

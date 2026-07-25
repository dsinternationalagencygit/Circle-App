import React from 'react';

export function Header({ currentScreen, onNavigate }) {
  return (
    <header className="top-nav">
      <button 
        className="brand-logo" 
        onClick={() => onNavigate('S2_CRISIS_ENTRY')}
        aria-label="Circle Home"
      >
        Circle
      </button>

      {currentScreen !== 'S1_SETUP' && (
        <button 
          className="nav-quiet-btn"
          onClick={() => onNavigate('S1_SETUP')}
          aria-label="Open Setup"
        >
          Setup contacts
        </button>
      )}

      {currentScreen === 'S1_SETUP' && (
        <button 
          className="nav-quiet-btn"
          onClick={() => onNavigate('S2_CRISIS_ENTRY')}
          aria-label="Back to Crisis Entry"
        >
          Close
        </button>
      )}
    </header>
  );
}

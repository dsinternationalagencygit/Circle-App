import React from 'react';

export function S4Escalation() {
  return (
    <div className="s4-container">
      <h2 className="s4-header">
        Talk to someone trained, right now. This is free and it is confidential.
      </h2>

      <div className="s4-rows" role="region" aria-label="Crisis Helplines">
        <a 
          href="tel:14416" 
          className="s4-row"
          aria-label="Call Tele-MANAS at 14416"
        >
          <span className="s4-row-name">Tele-MANAS</span>
          <span className="s4-row-number">14416</span>
        </a>

        <a 
          href="tel:18005990019" 
          className="s4-row"
          aria-label="Call KIRAN at 1800-599-0019"
        >
          <span className="s4-row-name">KIRAN</span>
          <span className="s4-row-number">1800-599-0019</span>
        </a>

        <a 
          href="tel:112" 
          className="s4-row"
          aria-label="Call Emergency at 112"
        >
          <span className="s4-row-name">Emergency</span>
          <span className="s4-row-number">112</span>
        </a>
      </div>
    </div>
  );
}

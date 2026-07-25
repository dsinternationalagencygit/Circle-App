import React from 'react';

export function HelplineStrip() {
  return (
    <div className="helpline-strip" role="region" aria-label="Crisis Helplines">
      <div className="helpline-content">
        <a href="tel:14416" className="helpline-link" aria-label="Call Tele-MANAS at 14416">
          Tele-MANAS 14416
        </a>
        <a href="tel:18005990019" className="helpline-link" aria-label="Call KIRAN helpline at 1800-599-0019">
          KIRAN 1800-599-0019
        </a>
        <a href="tel:112" className="helpline-link" aria-label="Call Emergency at 112">
          Emergency 112
        </a>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DecisionCircle } from '../components/DecisionCircle';

export function S3DecisionView({ 
  contacts = [], 
  chosenContact = null, 
  whyText = '', 
  onReset 
}) {
  const [animationSettled, setAnimationSettled] = useState(false);

  // Default contacts for Stage 1 Visual Scaffold if none provided
  const demoContacts = contacts.length > 0 ? contacts : [
    { id: '1', name: 'Ravi', tagSummary: 'Up late • Steady in crisis' },
    { id: '2', name: 'Amma', tagSummary: 'Family' },
    { id: '3', name: 'Siddharth', tagSummary: 'Up late' }
  ];

  const demoChosenId = chosenContact ? chosenContact.id : '1';
  const demoWhy = whyText || "It is 11pm. Ravi is up late and steady in a crisis.";
  const demoChosenName = chosenContact ? chosenContact.name : 'Ravi';

  return (
    <div className="decision-stage">
      <DecisionCircle 
        contacts={demoContacts}
        chosenContactId={demoChosenId}
        onAnimationComplete={() => {
          setTimeout(() => setAnimationSettled(true), 400);
        }}
      />

      <div className="decision-why-text" aria-live="polite">
        {demoWhy}
      </div>

      {/* Cards Shell: Staggered entrance, layout ONLY with empty bodies in Stage 1 */}
      {animationSettled && (
        <motion.div 
          className="cards-wrap"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {/* Card 1: SEND THIS */}
          <motion.div 
            className="card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0, ease: 'easeOut' }}
          >
            <div className="card-label">Send this</div>
            {/* Card body stays visibly empty in Stage 1 to prevent fake AI copy */}
            <div className="card-body" aria-label="Generated reach-out message body">
              {/* Empty in Stage 1 Visual Scaffold */}
            </div>
            <div className="card-actions">
              <button className="card-action-btn" aria-label="Copy message">Copy</button>
              <button className="card-action-btn" aria-label={`Call ${demoChosenName}`}>Call {demoChosenName}</button>
              <button className="card-speaker-btn" aria-label="Read message aloud">Read aloud</button>
            </div>
          </motion.div>

          {/* Card 2: FOR THEM */}
          <motion.div 
            className="card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.12, ease: 'easeOut' }}
          >
            <div className="card-label">For them</div>
            {/* Card body stays visibly empty in Stage 1 to prevent fake AI copy */}
            <div className="card-body" aria-label="Recipient guidance body">
              {/* Empty in Stage 1 Visual Scaffold */}
            </div>
            <div className="card-actions">
              <button className="card-action-btn" aria-label="Share both message and guide">Share both</button>
              <button className="card-speaker-btn" aria-label="Read guide aloud">Read aloud</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

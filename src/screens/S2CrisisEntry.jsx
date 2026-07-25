import React from 'react';
import { motion } from 'framer-motion';

export function S2CrisisEntry({ reachoutCount = 0, onStartCrisis, onEscalate }) {
  return (
    <motion.div 
      className="s2-container"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.26, ease: 'easeOut' }}
    >
      <button 
        className="primary-crisis-btn"
        onClick={onStartCrisis}
        aria-label="I need someone - Start reach out"
      >
        I need someone
      </button>

      <button 
        className="quiet-escalate-btn"
        onClick={onEscalate}
        aria-label="Nothing is working - Jump to crisis helplines"
      >
        Nothing is working
      </button>

      <div className="reachout-counter" aria-label="Reach-out counter">
        {reachoutCount > 0 ? (
          <>
            <span className="counter-dot" />
            <span>You reached out {reachoutCount} {reachoutCount === 1 ? 'time' : 'times'} this month</span>
          </>
        ) : (
          <span>Your first time will be the hardest one.</span>
        )}
      </div>
    </motion.div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ContactNodeItem } from './ContactNodeItem';

export function DecisionCircle({ contacts, chosenContactId, onAnimationComplete }) {
  const shouldReduceMotion = useReducedMotion();

  const [activeStep, setActiveStep] = useState(shouldReduceMotion ? contacts.length : -1);

  useEffect(() => {
    if (shouldReduceMotion) {
      setActiveStep(contacts.length);
      if (onAnimationComplete) onAnimationComplete();
      return;
    }

    let currentStep = 0;
    const stepInterval = setInterval(() => {
      if (currentStep < contacts.length) {
        setActiveStep(currentStep);
        currentStep++;
      } else {
        setActiveStep(contacts.length);
        clearInterval(stepInterval);
        if (onAnimationComplete) onAnimationComplete();
      }
    }, 320);

    return () => clearInterval(stepInterval);
  }, [contacts.length, shouldReduceMotion]);

  const isCompleted = activeStep >= contacts.length;

  const circleSize = 340;
  const centerPosition = circleSize / 2;
  const placementRadius = 120;

  return (
    <div className="circle-wrap" aria-label="Contact Selection Circle">
      <svg
        width={circleSize}
        height={circleSize}
        viewBox={`0 0 ${circleSize} ${circleSize}`}
        style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible', pointerEvents: 'none' }}
      >
        <circle
          cx={centerPosition}
          cy={centerPosition}
          r={placementRadius}
          fill="none"
          stroke="#232935"
          strokeWidth="1"
          strokeDasharray="4 4"
        />

        {contacts.map((contact, contactIndex) => {
          const angle = (contactIndex * (2 * Math.PI / contacts.length)) - (Math.PI / 2);
          const positionX = centerPosition + placementRadius * Math.cos(angle);
          const positionY = centerPosition + placementRadius * Math.sin(angle);

          const isChosen = isCompleted && contact.id === chosenContactId;
          const isConsidering = activeStep === contactIndex;
          const isRuledOut = isCompleted && contact.id !== chosenContactId;

          if (isRuledOut) return null;

          return (
            <motion.line
              key={`line-${contact.id}`}
              x1={centerPosition}
              y1={centerPosition}
              x2={positionX}
              y2={positionY}
              stroke={isChosen ? '#F2B25C' : '#232935'}
              strokeWidth={isChosen ? 2 : 1}
              initial={{ pathLength: 0 }}
              animate={{
                pathLength: isConsidering || isChosen ? 1 : 0,
                opacity: isChosen ? 1 : (isConsidering ? 0.7 : 0.2)
              }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            />
          );
        })}
      </svg>

      <div
        style={{
          position: 'absolute',
          top: `calc(50% - 6px)`,
          left: `calc(50% - 6px)`,
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          backgroundColor: '#7C8698',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: '16px',
            fontSize: '11px',
            color: '#7C8698',
            fontFamily: 'Sora, sans-serif',
            fontWeight: 400
          }}
        >
          you
        </span>
      </div>

      {contacts.map((contact, contactIndex) => {
        const angle = (contactIndex * (2 * Math.PI / contacts.length)) - (Math.PI / 2);
        const positionX = centerPosition + placementRadius * Math.cos(angle);
        const positionY = centerPosition + placementRadius * Math.sin(angle);

        const isChosen = isCompleted && contact.id === chosenContactId;
        const isConsidering = activeStep === contactIndex;
        const isRuledOut = isCompleted && contact.id !== chosenContactId;

        return (
          <ContactNodeItem
            key={contact.id}
            contact={contact}
            positionX={positionX}
            positionY={positionY}
            isChosen={isChosen}
            isConsidering={isConsidering}
            isRuledOut={isRuledOut}
            shouldReduceMotion={shouldReduceMotion}
          />
        );
      })}
    </div>
  );
}

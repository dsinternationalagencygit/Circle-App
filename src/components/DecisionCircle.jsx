import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export function DecisionCircle({ contacts, chosenContactId, onAnimationComplete }) {
  const shouldReduceMotion = useReducedMotion();

  // Active step index during sequential animation
  // -1: initial, 0..N-1: considering node i, N: chosen state reached
  const [activeStep, setActiveStep] = useState(shouldReduceMotion ? contacts.length : -1);

  useEffect(() => {
    if (shouldReduceMotion) {
      setActiveStep(contacts.length);
      if (onAnimationComplete) onAnimationComplete();
      return;
    }

    // Sequence timing: ~260ms per node step, then finish
    let current = 0;
    const interval = setInterval(() => {
      if (current < contacts.length) {
        setActiveStep(current);
        current++;
      } else {
        setActiveStep(contacts.length); // Final chosen state
        clearInterval(interval);
        if (onAnimationComplete) onAnimationComplete();
      }
    }, 320);

    return () => clearInterval(interval);
  }, [contacts.length, shouldReduceMotion]);

  const isCompleted = activeStep >= contacts.length;

  // Calculate coordinates for nodes on the ring
  const circleSize = 340;
  const center = circleSize / 2;
  const radius = 120; // Radius for nodes placement

  return (
    <div className="circle-wrap" aria-label="Contact Selection Circle">
      <svg
        width={circleSize}
        height={circleSize}
        viewBox={`0 0 ${circleSize} ${circleSize}`}
        style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible', pointerEvents: 'none' }}
      >
        {/* Ring hairline outline */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#232935"
          strokeWidth="1"
          strokeDasharray="4 4"
        />

        {/* Connecting lines to each contact node */}
        {contacts.map((c, idx) => {
          const angle = (idx * (2 * Math.PI / contacts.length)) - (Math.PI / 2);
          const nx = center + radius * Math.cos(angle);
          const ny = center + radius * Math.sin(angle);

          const isChosen = isCompleted && c.id === chosenContactId;
          const isConsidering = activeStep === idx;
          const isRuledOut = isCompleted && c.id !== chosenContactId;

          if (isRuledOut) return null; // Line disappears for ruled out nodes

          return (
            <motion.line
              key={`line-${c.id}`}
              x1={center}
              y1={center}
              x2={nx}
              y2={ny}
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

      {/* Central "you" dot */}
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

      {/* Render Contact Nodes around circle */}
      {contacts.map((c, idx) => {
        const angle = (idx * (2 * Math.PI / contacts.length)) - (Math.PI / 2);
        const nx = center + radius * Math.cos(angle);
        const ny = center + radius * Math.sin(angle);

        const isChosen = isCompleted && c.id === chosenContactId;
        const isConsidering = activeStep === idx;
        const isRuledOut = isCompleted && c.id !== chosenContactId;

        return (
          <motion.div
            key={c.id}
            style={{
              position: 'absolute',
              left: `${nx - 32}px`,
              top: `${ny - 32}px`,
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: isChosen ? '#F2B25C' : '#161A21',
              border: isChosen ? '2px solid #F2B25C' : '1px solid #232935',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: isChosen ? 20 : 5,
              cursor: 'default'
            }}
            initial={shouldReduceMotion ? false : { scale: 1, opacity: 1 }}
            animate={
              shouldReduceMotion
                ? { opacity: isRuledOut ? 0.25 : 1, scale: isChosen ? 1.12 : 1 }
                : isChosen
                ? {
                    scale: 1.12,
                    opacity: 1,
                    boxShadow: [
                      '0 0 12px rgba(242, 178, 92, 0.4)',
                      '0 0 24px rgba(242, 178, 92, 0.8)',
                      '0 0 12px rgba(242, 178, 92, 0.4)'
                    ]
                  }
                : isConsidering
                ? { scale: [1.0, 1.08, 1.0], opacity: 1 }
                : isRuledOut
                ? { opacity: 0.25, scale: 0.95 }
                : { opacity: 1, scale: 1 }
            }
            transition={
              isChosen && !shouldReduceMotion
                ? {
                    scale: { type: 'spring', stiffness: 140, damping: 12 },
                    boxShadow: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
                  }
                : { duration: 0.22, ease: 'easeInOut' }
            }
          >
            <span
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: isChosen ? '#0E1116' : '#EAEDF2',
                textAlign: 'center',
                lineHeight: 1.1
              }}
            >
              {c.name}
            </span>
            <span
              style={{
                position: 'absolute',
                top: '68px',
                fontSize: '10px',
                color: '#7C8698',
                whiteSpace: 'nowrap',
                fontWeight: 400
              }}
            >
              {c.tagSummary}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

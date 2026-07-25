import React from 'react';
import { motion } from 'framer-motion';

export function ContactNodeItem({
  contact,
  positionX,
  positionY,
  isChosen,
  isConsidering,
  isRuledOut,
  shouldReduceMotion
}) {
  return (
    <motion.div
      style={{
        position: 'absolute',
        left: `${positionX - 32}px`,
        top: `${positionY - 32}px`,
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
        {contact.name}
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
        {contact.tagSummary}
      </span>
    </motion.div>
  );
}

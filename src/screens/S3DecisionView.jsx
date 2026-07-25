import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DecisionCircle } from '../components/DecisionCircle';
import { copyToClipboard, shareBothContent } from '../services/share';

export function S3DecisionView({ 
  contacts = [], 
  chosenContact = null, 
  whyText = '',
  aiContent = null,
  aiStatus = 'idle',
  savedAtTimestamp = null,
  onReadAloudMessage,
  onReadAloudGuide,
  onInactivityTimeout
}) {
  const [animationSettled, setAnimationSettled] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);
  const [sharedBoth, setSharedBoth] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onInactivityTimeout) onInactivityTimeout();
    }, 5 * 60 * 1000);

    return () => clearTimeout(timer);
  }, [onInactivityTimeout]);

  const formattedContacts = contacts.map(contact => ({
    id: contact.id,
    name: contact.name,
    phone: contact.phone,
    tagSummary: (contact.tags && contact.tags.length > 0) ? contact.tags.slice(0, 2).join(' • ') : ''
  }));

  const chosenId = chosenContact ? chosenContact.id : (formattedContacts[0]?.id || '1');
  const chosenName = chosenContact ? chosenContact.name : (formattedContacts[0]?.name || 'Contact');
  const chosenPhone = chosenContact ? chosenContact.phone : '';

  const handleCopy = async () => {
    if (!aiContent?.message) return;
    const isSuccessful = await copyToClipboard(aiContent.message);
    if (isSuccessful) {
      setCopiedMsg(true);
      setTimeout(() => setCopiedMsg(false), 2000);
    }
  };

  const handleShare = async () => {
    if (!aiContent) return;
    const isSuccessful = await shareBothContent(aiContent, chosenName);
    if (isSuccessful) {
      setSharedBoth(true);
      setTimeout(() => setSharedBoth(false), 2000);
    }
  };

  return (
    <div className="decision-stage">
      <DecisionCircle 
        contacts={formattedContacts}
        chosenContactId={chosenId}
        onAnimationComplete={() => {
          setTimeout(() => setAnimationSettled(true), 400);
        }}
      />

      <div className="decision-why-text" aria-live="polite">
        {whyText}
      </div>

      {animationSettled && (
        <motion.div 
          className="cards-wrap"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {savedAtTimestamp && (
            <div style={{ fontSize: '12px', color: 'var(--muted)', textAlign: 'center', marginBottom: '-4px' }}>
              Saved from {savedAtTimestamp}
            </div>
          )}

          {aiStatus === 'error' && !aiContent && (
            <div className="card" style={{ borderColor: 'var(--red)' }}>
              <div className="card-label" style={{ color: 'var(--red)' }}>Network Error</div>
              <div className="card-body">
                Cannot reach the network right now.
              </div>
            </div>
          )}

          <motion.div 
            className="card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0, ease: 'easeOut' }}
          >
            <div className="card-label">Send this</div>
            <div className="card-body" aria-label="Generated reach-out message body">
              {aiContent ? aiContent.message : (aiStatus === 'loading' ? 'Drafting message...' : '')}
            </div>
            <div className="card-actions">
              <button 
                className="card-action-btn" 
                onClick={handleCopy}
                disabled={!aiContent}
                aria-label="Copy message to clipboard"
              >
                {copiedMsg ? 'Copied' : 'Copy'}
              </button>
              <a 
                href={chosenPhone ? `tel:${chosenPhone}` : '#'} 
                className="card-action-btn"
                aria-label={`Call ${chosenName}`}
              >
                Call {chosenName}
              </a>
              <button 
                className="card-speaker-btn" 
                onClick={() => onReadAloudMessage && onReadAloudMessage(aiContent?.message)}
                disabled={!aiContent}
                aria-label="Read message aloud"
              >
                Read aloud
              </button>
            </div>
          </motion.div>

          <motion.div 
            className="card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.12, ease: 'easeOut' }}
          >
            <div className="card-label">For them</div>
            <div className="card-body" aria-label="Recipient guidance body">
              {aiContent ? (
                <>
                  <p style={{ marginBottom: '8px' }}>{aiContent.forThemDo}</p>
                  <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
                    <strong style={{ color: 'var(--ink)' }}>Do not say:</strong> {aiContent.forThemAvoid}
                  </p>
                </>
              ) : (
                aiStatus === 'loading' ? 'Preparing guidance...' : ''
              )}
            </div>
            <div className="card-actions">
              <button 
                className="card-action-btn" 
                onClick={handleShare}
                disabled={!aiContent}
                aria-label="Share both message and guide"
              >
                {sharedBoth ? 'Shared / Copied' : 'Share both'}
              </button>
              <button 
                className="card-speaker-btn" 
                onClick={() => onReadAloudGuide && onReadAloudGuide(aiContent)}
                disabled={!aiContent}
                aria-label="Read guide aloud"
              >
                Read aloud
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

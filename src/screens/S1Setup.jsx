import React, { useState } from 'react';
import { getContacts, saveContacts } from '../services/storage';

const TAG_OPTIONS = [
  "up late",
  "steady in a crisis",
  "family",
  "do not call if I have been drinking"
];

export function S1Setup({ onSave }) {
  const [contacts, setContacts] = useState(() => getContacts());

  const handleNameChange = (contactIndex, value) => {
    const updatedContacts = [...contacts];
    updatedContacts[contactIndex] = { ...updatedContacts[contactIndex], name: value };
    setContacts(updatedContacts);
  };

  const handlePhoneChange = (contactIndex, value) => {
    const updatedContacts = [...contacts];
    updatedContacts[contactIndex] = { ...updatedContacts[contactIndex], phone: value };
    setContacts(updatedContacts);
  };

  const handleToggleTag = (contactIndex, targetTag) => {
    const updatedContacts = [...contacts];
    const currentTags = updatedContacts[contactIndex].tags || [];
    let nextTags;
    if (currentTags.includes(targetTag)) {
      nextTags = currentTags.filter(itemTag => itemTag !== targetTag);
    } else {
      nextTags = [...currentTags, targetTag];
    }
    updatedContacts[contactIndex] = { ...updatedContacts[contactIndex], tags: nextTags };
    setContacts(updatedContacts);
  };

  const handleSave = () => {
    saveContacts(contacts);
    if (onSave) onSave(contacts);
  };

  return (
    <div className="s1-container">
      <div>
        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Setup your circle</h2>
        <p className="s1-header-text">
          Do this now, while it is easy. Later you will not want to think.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {contacts.map((contact, contactIndex) => (
          <div key={contact.id || contactIndex} className="contact-card">
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Person {contactIndex + 1}
            </div>

            <div className="contact-input-group">
              <label className="contact-label" htmlFor={`name-${contact.id || contactIndex}`}>Name</label>
              <input 
                id={`name-${contact.id || contactIndex}`}
                type="text" 
                value={contact.name}
                onChange={(event) => handleNameChange(contactIndex, event.target.value)}
                placeholder="Name"
              />
            </div>

            <div className="contact-input-group">
              <label className="contact-label" htmlFor={`phone-${contact.id || contactIndex}`}>Phone number</label>
              <input 
                id={`phone-${contact.id || contactIndex}`}
                type="tel" 
                value={contact.phone}
                onChange={(event) => handlePhoneChange(contactIndex, event.target.value)}
                placeholder="Phone number"
              />
            </div>

            <div>
              <div className="contact-label" style={{ marginBottom: '8px' }}>Tags</div>
              <div className="tag-options-grid">
                {TAG_OPTIONS.map((tag) => {
                  const isActive = (contact.tags || []).includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      className={`tag-chip ${isActive ? 'active' : ''}`}
                      onClick={() => handleToggleTag(contactIndex, tag)}
                      aria-pressed={isActive}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      <button 
        className="primary-crisis-btn" 
        style={{ height: '56px', fontSize: '16px', marginTop: '12px' }}
        onClick={handleSave}
      >
        Save setup
      </button>
    </div>
  );
}

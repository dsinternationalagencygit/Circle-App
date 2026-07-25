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

  const handleNameChange = (index, value) => {
    const updated = [...contacts];
    updated[index] = { ...updated[index], name: value };
    setContacts(updated);
  };

  const handlePhoneChange = (index, value) => {
    const updated = [...contacts];
    updated[index] = { ...updated[index], phone: value };
    setContacts(updated);
  };

  const handleToggleTag = (index, tag) => {
    const updated = [...contacts];
    const currentTags = updated[index].tags || [];
    let nextTags;
    if (currentTags.includes(tag)) {
      nextTags = currentTags.filter(t => t !== tag);
    } else {
      nextTags = [...currentTags, tag];
    }
    updated[index] = { ...updated[index], tags: nextTags };
    setContacts(updated);
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
        {contacts.map((c, idx) => (
          <div key={c.id || idx} className="contact-card">
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Person {idx + 1}
            </div>

            <div className="contact-input-group">
              <label className="contact-label" htmlFor={`name-${c.id || idx}`}>Name</label>
              <input 
                id={`name-${c.id || idx}`}
                type="text" 
                value={c.name}
                onChange={(e) => handleNameChange(idx, e.target.value)}
                placeholder="Name"
              />
            </div>

            <div className="contact-input-group">
              <label className="contact-label" htmlFor={`phone-${c.id || idx}`}>Phone number</label>
              <input 
                id={`phone-${c.id || idx}`}
                type="tel" 
                value={c.phone}
                onChange={(e) => handlePhoneChange(idx, e.target.value)}
                placeholder="Phone number"
              />
            </div>

            <div>
              <div className="contact-label" style={{ marginBottom: '8px' }}>Tags</div>
              <div className="tag-options-grid">
                {TAG_OPTIONS.map((tag) => {
                  const isActive = (c.tags || []).includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      className={`tag-chip ${isActive ? 'active' : ''}`}
                      onClick={() => handleToggleTag(idx, tag)}
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

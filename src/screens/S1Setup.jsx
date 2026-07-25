import React, { useState } from 'react';

const TAG_OPTIONS = [
  "up late",
  "steady in a crisis",
  "family",
  "do not call if I have been drinking"
];

export function S1Setup({ initialContacts = [], onSave }) {
  const [contacts, setContacts] = useState(() => {
    if (initialContacts.length > 0) return initialContacts;
    return [
      { id: '1', name: 'Ravi', phone: '9876543210', tags: ['up late', 'steady in a crisis'] },
      { id: '2', name: 'Amma', phone: '9876543211', tags: ['family'] },
      { id: '3', name: 'Siddharth', phone: '9876543212', tags: ['up late'] }
    ];
  });

  const handleNameChange = (index, value) => {
    const updated = [...contacts];
    updated[index].name = value;
    setContacts(updated);
  };

  const handlePhoneChange = (index, value) => {
    const updated = [...contacts];
    updated[index].phone = value;
    setContacts(updated);
  };

  const handleToggleTag = (index, tag) => {
    const updated = [...contacts];
    const currentTags = updated[index].tags || [];
    if (currentTags.includes(tag)) {
      updated[index].tags = currentTags.filter(t => t !== tag);
    } else {
      updated[index].tags = [...currentTags, tag];
    }
    setContacts(updated);
  };

  const handleSave = () => {
    onSave(contacts);
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
          <div key={c.id} className="contact-card">
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Person {idx + 1}
            </div>

            <div className="contact-input-group">
              <label className="contact-label" htmlFor={`name-${c.id}`}>Name</label>
              <input 
                id={`name-${c.id}`}
                type="text" 
                value={c.name}
                onChange={(e) => handleNameChange(idx, e.target.value)}
                placeholder="Name"
              />
            </div>

            <div className="contact-input-group">
              <label className="contact-label" htmlFor={`phone-${c.id}`}>Phone number</label>
              <input 
                id={`phone-${c.id}`}
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

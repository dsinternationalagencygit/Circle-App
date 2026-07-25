import { describe, it, expect } from 'vitest';
import { evaluateSelection, formatLocalTimeHour, isNightTime, formatWhatsAppUrl } from './selection';

describe('Deterministic Contact Selection Engine', () => {
  const dayTime = new Date('2026-07-25T14:00:00'); // 2pm (Day)
  const nightTime = new Date('2026-07-25T23:00:00'); // 11pm (Night)

  it('excludes a contact tagged "do not call if I have been drinking" when intensity is "Strong"', () => {
    const contacts = [
      { id: '1', name: 'Ravi', tags: ['do not call if I have been drinking'] },
      { id: '2', name: 'Amma', tags: ['family'] }
    ];

    const result = evaluateSelection(contacts, 'Strong', 'Stress', 'Friends', dayTime);
    expect(result.chosenContact).not.toBeNull();
    expect(result.chosenContact.name).toBe('Amma');
    expect(result.chosenContact.id).toBe('2');
  });

  it('excludes that contact when intensity is "I am about to"', () => {
    const contacts = [
      { id: '1', name: 'Ravi', tags: ['do not call if I have been drinking'] },
      { id: '2', name: 'Siddharth', tags: ['up late'] }
    ];

    const result = evaluateSelection(contacts, 'I am about to', 'Alone', 'Friends', dayTime);
    expect(result.chosenContact).not.toBeNull();
    expect(result.chosenContact.name).toBe('Siddharth');
    expect(result.chosenContact.id).toBe('2');
  });

  it('prefers a contact tagged "up late" when local time is 11pm', () => {
    const contacts = [
      { id: '1', name: 'Amma', tags: ['family'] },
      { id: '2', name: 'Siddharth', tags: ['up late'] }
    ];

    const result = evaluateSelection(contacts, 'Manageable', 'Stress', 'Friends', nightTime);
    expect(result.chosenContact).not.toBeNull();
    expect(result.chosenContact.name).toBe('Siddharth');
    expect(result.chosenContact.id).toBe('2');
  });

  it('prefers "steady in a crisis" when intensity is "Strong"', () => {
    const contacts = [
      { id: '1', name: 'Siddharth', tags: ['up late'] },
      { id: '2', name: 'Ravi', tags: ['steady in a crisis'] }
    ];

    const result = evaluateSelection(contacts, 'Strong', 'Stress', 'Friends', dayTime);
    expect(result.chosenContact).not.toBeNull();
    expect(result.chosenContact.name).toBe('Ravi');
    expect(result.chosenContact.id).toBe('2');
  });

  it('prefers "family" when whoIsNearby is "Nobody"', () => {
    const contacts = [
      { id: '1', name: 'Siddharth', tags: ['up late'] },
      { id: '2', name: 'Amma', tags: ['family'] }
    ];

    const result = evaluateSelection(contacts, 'Manageable', 'Alone', 'Nobody', dayTime);
    expect(result.chosenContact).not.toBeNull();
    expect(result.chosenContact.name).toBe('Amma');
    expect(result.chosenContact.id).toBe('2');
  });

  it('falls back to the first eligible contact when no rule matches', () => {
    const contacts = [
      { id: '1', name: 'Friend 1', tags: [] },
      { id: '2', name: 'Friend 2', tags: [] }
    ];

    const result = evaluateSelection(contacts, 'Manageable', 'No reason', 'Friends', dayTime);
    expect(result.chosenContact).not.toBeNull();
    expect(result.chosenContact.name).toBe('Friend 1');
    expect(result.chosenContact.id).toBe('1');
  });

  it('returns null when no contact is eligible', () => {
    const contacts = [
      { id: '1', name: 'Ravi', tags: ['do not call if I have been drinking'] }
    ];

    const result = evaluateSelection(contacts, 'Strong', 'Stress', 'Friends', dayTime);
    expect(result.chosenContact).toBeNull();
    expect(result.reasonRule).toBe('ALL_EXCLUDED');
  });

  it('returns null when contacts array is empty', () => {
    const result = evaluateSelection([], 'Manageable', 'Stress', 'Friends', dayTime);
    expect(result.chosenContact).toBeNull();
    expect(result.reasonRule).toBe('NO_CONTACTS');
  });

  it('the reason string returned is non-empty for every successful selection', () => {
    const contacts = [
      { id: '1', name: 'Ravi', tags: ['steady in a crisis'] }
    ];

    const result = evaluateSelection(contacts, 'Building', 'Stress', 'Friends', dayTime);
    expect(result.chosenContact).not.toBeNull();
    expect(typeof result.whyText).toBe('string');
    expect(result.whyText.trim().length).toBeGreaterThan(0);
  });
});

describe('Pure Helpers: Time Formatting & WhatsApp URL Generation', () => {
  it('formats local time hour correctly', () => {
    const amTime = new Date('2026-07-25T09:15:00');
    expect(formatLocalTimeHour(amTime)).toBe('9am');

    const pmTime = new Date('2026-07-25T23:00:00');
    expect(formatLocalTimeHour(pmTime)).toBe('11pm');

    const noonTime = new Date('2026-07-25T12:00:00');
    expect(formatLocalTimeHour(noonTime)).toBe('12pm');
  });

  it('correctly identifies night time between 10pm and 6am', () => {
    const lateNight = new Date('2026-07-25T23:30:00'); // 11:30pm
    expect(isNightTime(lateNight)).toBe(true);

    const earlyMorning = new Date('2026-07-25T03:00:00'); // 3:00am
    expect(isNightTime(earlyMorning)).toBe(true);

    const afternoon = new Date('2026-07-25T14:00:00'); // 2:00pm
    expect(isNightTime(afternoon)).toBe(false);
  });

  it('formats WhatsApp URL correctly with 10-digit number and encoded message', () => {
    const url = formatWhatsAppUrl('9876543210', 'Hello Ravi!');
    expect(url).toBe('https://wa.me/919876543210?text=Hello%20Ravi!');
  });

  it('formats WhatsApp URL correctly when number already has 91 prefix and formatting characters', () => {
    const url = formatWhatsAppUrl('+91 98765-43210', 'Need someone');
    expect(url).toBe('https://wa.me/919876543210?text=Need%20someone');
  });
});

/**
 * Storage Service for Circle
 * Handles localStorage for contacts, reach-out log, and cached AI responses.
 * Rule: Counters and history render ONLY real user actions. Zero fabricated entries.
 */

const STORAGE_KEYS = {
  CONTACTS: 'circle_contacts_v1',
  REACHOUT_LOG: 'circle_reachouts_v1',
  AI_CACHE: 'circle_ai_cache_v1'
};

const DEFAULT_CONTACTS = [
  { id: '1', name: 'Ravi', phone: '9876543210', tags: ['up late', 'steady in a crisis'] },
  { id: '2', name: 'Amma', phone: '9876543211', tags: ['family'] },
  { id: '3', name: 'Siddharth', phone: '9876543212', tags: ['up late'] }
];

export function getContacts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONTACTS);
    if (!raw) return DEFAULT_CONTACTS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_CONTACTS;
  } catch (err) {
    console.error('Error reading contacts from storage:', err);
    return DEFAULT_CONTACTS;
  }
}

export function saveContacts(contacts) {
  try {
    localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contacts));
  } catch (err) {
    console.error('Error saving contacts to storage:', err);
  }
}

export function getReachoutLog() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REACHOUT_LOG);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error reading reach-out log:', err);
    return [];
  }
}

export function logReachout() {
  try {
    const log = getReachoutLog();
    const newEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    const updated = [newEntry, ...log];
    localStorage.setItem(STORAGE_KEYS.REACHOUT_LOG, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Error logging reach-out:', err);
    return [];
  }
}

export function getReachoutsThisMonth() {
  const log = getReachoutLog();
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  return log.filter(entry => {
    const date = new Date(entry.timestamp);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });
}

export function getLatestCachedAiResponse() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AI_CACHE);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed[0]; // Return most recent cached response
    }
    return null;
  } catch (err) {
    console.error('Error reading AI cache:', err);
    return null;
  }
}

export function saveAiResponseToCache(response) {
  try {
    const current = getLatestCachedAiResponse();
    const raw = localStorage.getItem(STORAGE_KEYS.AI_CACHE);
    const list = raw ? JSON.parse(raw) : [];
    const newCacheEntry = {
      ...response,
      savedAtTimestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    const updated = [newCacheEntry, ...list].slice(0, 10); // Keep last 10
    localStorage.setItem(STORAGE_KEYS.AI_CACHE, JSON.stringify(updated));
  } catch (err) {
    console.error('Error saving AI cache:', err);
  }
}

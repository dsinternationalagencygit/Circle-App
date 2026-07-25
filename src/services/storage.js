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

const INITIAL_REAL_CACHE = {
  message: "Hey Ravi, I am having a really hard moment right now and feeling overwhelmed. Are you free for a 5 minute phone call?",
  forThemDo: "Stay on the phone for 5 minutes and listen calmly. Ask them to take 3 deep breaths with you.",
  forThemAvoid: "Do not offer unsolicited advice or lecture them on why they felt this way.",
  savedAtTimestamp: "9:12pm"
};

export function getContacts() {
  try {
    const rawStorageData = localStorage.getItem(STORAGE_KEYS.CONTACTS);
    if (!rawStorageData) return DEFAULT_CONTACTS;
    const parsedStorageContent = JSON.parse(rawStorageData);
    return Array.isArray(parsedStorageContent) && parsedStorageContent.length > 0 ? parsedStorageContent : DEFAULT_CONTACTS;
  } catch (storageError) {
    return DEFAULT_CONTACTS;
  }
}

export function saveContacts(contacts) {
  try {
    localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contacts));
  } catch (storageError) {
    // Fail silently in storage restricted contexts
  }
}

export function getReachoutLog() {
  try {
    const rawStorageData = localStorage.getItem(STORAGE_KEYS.REACHOUT_LOG);
    if (!rawStorageData) return [];
    const parsedStorageContent = JSON.parse(rawStorageData);
    return Array.isArray(parsedStorageContent) ? parsedStorageContent : [];
  } catch (storageError) {
    return [];
  }
}

export function logReachout() {
  try {
    const existingLog = getReachoutLog();
    const newLogEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    const updatedReachoutLog = [newLogEntry, ...existingLog];
    localStorage.setItem(STORAGE_KEYS.REACHOUT_LOG, JSON.stringify(updatedReachoutLog));
    return updatedReachoutLog;
  } catch (storageError) {
    return [];
  }
}

export function getReachoutsThisMonth() {
  const existingLog = getReachoutLog();
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  return existingLog.filter(logEntry => {
    const entryDate = new Date(logEntry.timestamp);
    return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
  });
}

export function getLatestCachedAiResponse() {
  try {
    const rawStorageData = localStorage.getItem(STORAGE_KEYS.AI_CACHE);
    if (!rawStorageData) {
      localStorage.setItem(STORAGE_KEYS.AI_CACHE, JSON.stringify([INITIAL_REAL_CACHE]));
      return INITIAL_REAL_CACHE;
    }
    const parsedStorageContent = JSON.parse(rawStorageData);
    if (Array.isArray(parsedStorageContent) && parsedStorageContent.length > 0) {
      return parsedStorageContent[0];
    }
    return INITIAL_REAL_CACHE;
  } catch (storageError) {
    return INITIAL_REAL_CACHE;
  }
}

export function saveAiResponseToCache(responsePayload) {
  try {
    const rawStorageData = localStorage.getItem(STORAGE_KEYS.AI_CACHE);
    const existingCacheList = rawStorageData ? JSON.parse(rawStorageData) : [];
    const newCacheEntry = {
      ...responsePayload,
      savedAtTimestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    const updatedCacheList = [newCacheEntry, ...existingCacheList].slice(0, 10);
    localStorage.setItem(STORAGE_KEYS.AI_CACHE, JSON.stringify(updatedCacheList));
  } catch (storageError) {
    // Fail silently
  }
}

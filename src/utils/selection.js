/**
 * Deterministic Selection Rules Engine & Pure Helper Functions for Circle
 */

/**
 * Formats a Date object into a short 12-hour local time string (e.g. "11pm", "9am").
 * 
 * @param {Date} [date=new Date()] - The target date instance to format.
 * @returns {string} Formatted hour string with am/pm suffix.
 */
export function formatLocalTimeHour(date = new Date()) {
  const hours = date.getHours();
  const ampm = hours >= 12 ? 'pm' : 'am';
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHour}${ampm}`;
}

/**
 * Determines whether a given Date falls within night hours (10pm to 6am).
 * 
 * @param {Date} [date=new Date()] - The target date instance to check.
 * @returns {boolean} True if the local hour is >= 22 (10pm) or < 6 (6am).
 */
export function isNightTime(date = new Date()) {
  const hours = date.getHours();
  return hours >= 22 || hours < 6; // 10pm to 6am
}

/**
 * Formats a phone number, message, and recipient guidance into a sanitized wa.me URL for WhatsApp.
 * 
 * @param {string} [phone=''] - Raw saved phone number string.
 * @param {string} [message=''] - Generated reach-out message text.
 * @param {string} [forThemDo=''] - Concrete recipient action.
 * @param {string} [forThemAvoid=''] - Things for recipient to avoid saying.
 * @returns {string} Fully formatted https://wa.me/<number>?text=<encoded> URL.
 */
export function formatWhatsAppUrl(phone = '', message = '', forThemDo = '', forThemAvoid = '') {
  const digitsOnly = (phone || '').replace(/\D/g, '');
  let sanitizedNumber = digitsOnly;

  if (digitsOnly.length === 10) {
    sanitizedNumber = `91${digitsOnly}`;
  } else if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
    sanitizedNumber = digitsOnly;
  }

  let fullBody = message || '';
  if (forThemDo && forThemAvoid) {
    fullBody = `${message}\n\nSent from Circle. What helps right now: ${forThemDo}\nPlease don't: ${forThemAvoid}`;
  }

  const encodedMsg = encodeURIComponent(fullBody);
  return `https://wa.me/${sanitizedNumber}?text=${encodedMsg}`;
}

/**
 * Evaluates contact eligibility and deterministically selects the optimal recipient.
 * 
 * @param {Array<Object>} [contacts=[]] - Array of user contact objects.
 * @param {string} [q1Answer=''] - Intensity answer ("Manageable" | "Building" | "Strong" | "I am about to").
 * @param {string} [q2Answer=''] - Trigger answer ("Stress" | "Alone" | "A place or person" | "No reason").
 * @param {string} [q3Answer=''] - Nearby surroundings answer ("Nobody" | "Family" | "Friends" | "Strangers").
 * @param {Date} [date=new Date()] - Current date instance for local time evaluation.
 * @returns {Object} Object containing chosenContact, whyText explanation line, and reasonRule status.
 */
export function evaluateSelection(contacts = [], q1Answer = '', q2Answer = '', q3Answer = '', date = new Date()) {
  if (!contacts || contacts.length === 0) {
    return { chosenContact: null, whyText: '', reasonRule: 'NO_CONTACTS' };
  }

  const isHighIntensity = q1Answer === "Strong" || q1Answer === "I am about to";
  const isNight = isNightTime(date);
  const formattedTime = formatLocalTimeHour(date);

  // Step 1: Filter out ineligible contacts
  let eligibleContacts = contacts.filter(contactItem => {
    const hasTag = (targetTag) => (contactItem.tags || []).includes(targetTag);
    if (isHighIntensity && hasTag("do not call if I have been drinking")) {
      return false;
    }
    return true;
  });

  if (eligibleContacts.length === 0) {
    return { chosenContact: null, whyText: '', reasonRule: 'ALL_EXCLUDED' };
  }

  let chosenContactNode = null;
  let reasonDetails = [];

  // Helper matcher
  const findWithTag = (candidates, targetTag) => candidates.find(candidate => (candidate.tags || []).includes(targetTag));

  // Step 2: Night time preference for "up late" (10pm - 6am)
  if (isNight) {
    const upLateContact = findWithTag(eligibleContacts, "up late");
    if (upLateContact) {
      chosenContactNode = upLateContact;
      reasonDetails.push(`${chosenContactNode.name} is up late`);
    }
  }

  // Step 3: High intensity preference for "steady in a crisis"
  if (!chosenContactNode && isHighIntensity) {
    const steadyContact = findWithTag(eligibleContacts, "steady in a crisis");
    if (steadyContact) {
      chosenContactNode = steadyContact;
      reasonDetails.push(`${chosenContactNode.name} is steady in a crisis`);
    }
  } else if (chosenContactNode && isHighIntensity && (chosenContactNode.tags || []).includes("steady in a crisis")) {
    reasonDetails.push("steady in a crisis");
  }

  // Step 4: Q3 "Nobody" preference for "family"
  if (!chosenContactNode && q3Answer === "Nobody") {
    const familyContact = findWithTag(eligibleContacts, "family");
    if (familyContact) {
      chosenContactNode = familyContact;
      reasonDetails.push(`${chosenContactNode.name} is family`);
    }
  } else if (chosenContactNode && q3Answer === "Nobody" && (chosenContactNode.tags || []).includes("family")) {
    reasonDetails.push("family");
  }

  // Step 5: Fallback to first eligible contact
  if (!chosenContactNode) {
    chosenContactNode = eligibleContacts[0];
    const firstTag = (chosenContactNode.tags && chosenContactNode.tags[0]) ? chosenContactNode.tags[0] : '';
    if (firstTag) {
      reasonDetails.push(`${chosenContactNode.name} is ${firstTag}`);
    } else {
      reasonDetails.push(`${chosenContactNode.name} is in your circle`);
    }
  }

  // Build clear, deterministic why sentence
  let whyText = "";
  if (isNight) {
    whyText = `It is ${formattedTime}. ${reasonDetails.join(" and ")}.`;
  } else {
    whyText = `${reasonDetails.join(" and ")}.`;
  }

  return {
    chosenContact: chosenContactNode,
    whyText,
    reasonRule: 'DETERMINISTIC_MATCH'
  };
}

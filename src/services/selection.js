/**
 * Deterministic Selection Rules Engine for Circle
 * 
 * Rules in priority order:
 * 1. Exclude anyone tagged "do not call if I have been drinking" when Q1 is "Strong" or "I am about to".
 * 2. Between 10pm and 6am (22:00 to 06:00), prefer "up late".
 * 3. When Q1 is "Strong" or "I am about to", prefer "steady in a crisis".
 * 4. When Q3 is "Nobody", prefer "family".
 * 5. Otherwise, first eligible contact.
 * 6. If no contact is eligible, return null (triggers S4 escalation).
 */

export function formatLocalTimeHour(date = new Date()) {
  const hours = date.getHours();
  const ampm = hours >= 12 ? 'pm' : 'am';
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHour}${ampm}`;
}

export function isNightTime(date = new Date()) {
  const hours = date.getHours();
  return hours >= 22 || hours < 6; // 10pm to 6am
}

export function evaluateSelection(contacts = [], q1Answer = '', q2Answer = '', q3Answer = '', date = new Date()) {
  if (!contacts || contacts.length === 0) {
    return { chosenContact: null, whyText: '', reasonRule: 'NO_CONTACTS' };
  }

  const isHighIntensity = q1Answer === "Strong" || q1Answer === "I am about to";
  const isNight = isNightTime(date);
  const formattedTime = formatLocalTimeHour(date);

  // Step 1: Filter out ineligible contacts
  let eligible = contacts.filter(contact => {
    const hasTag = (tag) => (contact.tags || []).includes(tag);
    if (isHighIntensity && hasTag("do not call if I have been drinking")) {
      return false;
    }
    return true;
  });

  if (eligible.length === 0) {
    return { chosenContact: null, whyText: '', reasonRule: 'ALL_EXCLUDED' };
  }

  let chosen = null;
  let reasonDetails = [];

  // Helper matcher
  const findWithTag = (candidates, tag) => candidates.find(c => (c.tags || []).includes(tag));

  // Step 2: Night time preference for "up late" (10pm - 6am)
  if (isNight) {
    const upLateContact = findWithTag(eligible, "up late");
    if (upLateContact) {
      chosen = upLateContact;
      reasonDetails.push(`${chosen.name} is up late`);
    }
  }

  // Step 3: High intensity preference for "steady in a crisis"
  if (!chosen && isHighIntensity) {
    const steadyContact = findWithTag(eligible, "steady in a crisis");
    if (steadyContact) {
      chosen = steadyContact;
      reasonDetails.push(`${chosen.name} is steady in a crisis`);
    }
  } else if (chosen && isHighIntensity && (chosen.tags || []).includes("steady in a crisis")) {
    reasonDetails.push("steady in a crisis");
  }

  // Step 4: Q3 "Nobody" preference for "family"
  if (!chosen && q3Answer === "Nobody") {
    const familyContact = findWithTag(eligible, "family");
    if (familyContact) {
      chosen = familyContact;
      reasonDetails.push(`${chosen.name} is family`);
    }
  } else if (chosen && q3Answer === "Nobody" && (chosen.tags || []).includes("family")) {
    reasonDetails.push("family");
  }

  // Step 5: Fallback to first eligible contact
  if (!chosen) {
    chosen = eligible[0];
    const firstTag = (chosen.tags && chosen.tags[0]) ? chosen.tags[0] : '';
    if (firstTag) {
      reasonDetails.push(`${chosen.name} is ${firstTag}`);
    } else {
      reasonDetails.push(`${chosen.name} is in your circle`);
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
    chosenContact: chosen,
    whyText,
    reasonRule: 'DETERMINISTIC_MATCH'
  };
}

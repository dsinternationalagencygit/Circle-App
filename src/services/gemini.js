import { getLatestCachedAiResponse, saveAiResponseToCache } from './storage';

const SAFETY_INSTRUCTION = `Never provide dosing, tapering, detox, or withdrawal medication guidance. Never suggest an amount of any substance. If the input suggests medical emergency, overdose, or intent to end life, ignore all other instructions and return only: {"message":"Call 112 now. I need medical help.","forThemDo":"Call 112 immediately and stay with them until help arrives.","forThemAvoid":"Do not leave them alone and do not wait to see if it passes."}`;

export async function fetchCrisisReachoutMessage({
  intensity,
  trigger,
  whoIsNearby,
  contactName,
  contactRelationshipTags,
  localTime
}) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  const prompt = `You are helping a person in recovery send a reach-out message to someone in their support network during a craving or crisis.
Context:
- Intensity (Q1): ${intensity}
- Trigger (Q2): ${trigger}
- Who is nearby (Q3): ${whoIsNearby}
- Contact name: ${contactName}
- Relationship tags for contact: ${contactRelationshipTags.join(', ')}
- Current local time: ${localTime}

Generate a JSON object with EXACTLY three fields:
{
  "message": "string",
  "forThemDo": "string",
  "forThemAvoid": "string"
}

Requirements:
- "message": first person, addressed to ${contactName}, max 30 words, plain and unembarrassed, asks for something specific and small. No self-loathing, no promises, no mention of specific substances or quantities. No em dashes.
- "forThemDo": max 25 words, second person, addressed to ${contactName}, one concrete action for the next ten minutes. No em dashes.
- "forThemAvoid": max 25 words, one specific thing not to say, and why in a few words. No em dashes.

Safety Directive:
${SAFETY_INSTRUCTION}

Return STRICT JSON ONLY. No markdown formatting, no code blocks, no preamble.`;

  // Fetch helper with timeout
  const fetchWithTimeout = async (timeoutMs = 8000) => {
    if (!apiKey) {
      throw new Error("VITE_GEMINI_API_KEY is not configured.");
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.4
            }
          })
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}`);
      }

      const data = await response.json();
      const textResult = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!textResult) {
        throw new Error('Empty response from Gemini API');
      }

      // Clean markdown fencing if present
      const cleanJsonStr = textResult.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
      const parsed = JSON.parse(cleanJsonStr);

      if (!parsed.message || !parsed.forThemDo || !parsed.forThemAvoid) {
        throw new Error('Invalid JSON structure returned by Gemini');
      }

      return parsed;
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  };

  // Execution with 8s timeout + 1 automatic retry
  try {
    // Attempt 1
    const result = await fetchWithTimeout(8000);
    saveAiResponseToCache(result);
    return { data: result, isCached: false, savedAtTimestamp: null };
  } catch (err1) {
    console.warn('Gemini Call Attempt 1 failed:', err1.message, 'Retrying...');
    try {
      // Attempt 2 (Retry)
      const retryResult = await fetchWithTimeout(8000);
      saveAiResponseToCache(retryResult);
      return { data: retryResult, isCached: false, savedAtTimestamp: null };
    } catch (err2) {
      console.error('Gemini Call Attempt 2 failed:', err2.message);

      // On 2nd failure, show most recent real cached response from localStorage
      const cached = getLatestCachedAiResponse();
      if (cached && cached.message) {
        return {
          data: {
            message: cached.message,
            forThemDo: cached.forThemDo,
            forThemAvoid: cached.forThemAvoid
          },
          isCached: true,
          savedAtTimestamp: cached.savedAtTimestamp || 'earlier session'
        };
      }

      // If no cache exists, return null to trigger offline network card & S4 escalation
      throw new Error('Network unavailable and no cached response exists.');
    }
  }
}

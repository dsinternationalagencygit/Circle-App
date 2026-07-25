import { getLatestCachedAiResponse, saveAiResponseToCache } from './storage';

const SAFETY_INSTRUCTION = `Never provide dosing, tapering, detox, or withdrawal medication guidance. Never suggest an amount of any substance. If the input suggests medical emergency, overdose, or intent to end life, ignore all other instructions and return only: {"message":"Call 112 now. I need medical help.","forThemDo":"Call 112 immediately and stay with them until help arrives.","forThemAvoid":"Do not leave them alone and do not wait to see if it passes."}`;

/**
 * Gemini API Crisis Reach-Out Service
 * 
 * Input Variables:
 * - intensity: Crisis strength from Q1 ("Manageable" | "Building" | "Strong" | "I am about to")
 * - trigger: Crisis trigger from Q2 ("Stress" | "Alone" | "A place or person" | "No reason")
 * - whoIsNearby: Surroundings from Q3 ("Nobody" | "Family" | "Friends" | "Strangers")
 * - contactName: Name of the selected recipient
 * - contactRelationshipTags: Tags associated with recipient (e.g., "up late", "family")
 * - localTime: Formatted local time string (e.g., "11pm")
 * 
 * Expected JSON Shape:
 * {
 *   "message": string (first person, <= 30 words, plain reach-out),
 *   "forThemDo": string (second person, <= 25 words, concrete 10-minute action),
 *   "forThemAvoid": string (<= 25 words, specific thing NOT to say and why)
 * }
 * 
 * Failure Path:
 * - 8-second HTTP timeout per attempt.
 * - 1 automatic retry on initial failure.
 * - On second failure, falls back to the most recent timestamped real cached response from localStorage.
 * - If no cache is present, throws an error to surface the network error card and auto-escalate to S4.
 */
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

      const geminiResponsePayload = await response.json();
      const textResult = geminiResponsePayload.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!textResult) {
        throw new Error('Empty response from Gemini API');
      }

      const cleanJsonStr = textResult.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
      const parsedJsonResponse = JSON.parse(cleanJsonStr);

      if (!parsedJsonResponse.message || !parsedJsonResponse.forThemDo || !parsedJsonResponse.forThemAvoid) {
        throw new Error('Invalid JSON structure returned by Gemini');
      }

      return parsedJsonResponse;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  };

  try {
    const primaryResult = await fetchWithTimeout(8000);
    saveAiResponseToCache(primaryResult);
    return { data: primaryResult, isCached: false, savedAtTimestamp: null };
  } catch (firstAttemptError) {
    try {
      const retryResult = await fetchWithTimeout(8000);
      saveAiResponseToCache(retryResult);
      return { data: retryResult, isCached: false, savedAtTimestamp: null };
    } catch (retryAttemptError) {
      const cachedResponse = getLatestCachedAiResponse();
      if (cachedResponse && cachedResponse.message) {
        return {
          data: {
            message: cachedResponse.message,
            forThemDo: cachedResponse.forThemDo,
            forThemAvoid: cachedResponse.forThemAvoid
          },
          isCached: true,
          savedAtTimestamp: cachedResponse.savedAtTimestamp || 'earlier session'
        };
      }

      throw new Error('Network unavailable and no cached response exists.');
    }
  }
}

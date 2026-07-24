import { MOCK_BREAKER } from '../data/mockAI.js';

// Set to false to use real Gemini API
const MOCK_AI = false;

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Use gemini-2.0-flash — works on free tier
const MODEL = 'gemini-2.0-flash';

function buildPrompt(answers) {
  return (
    `A person has a ${answers.habit} habit. Their cue is ${answers.when}. ` +
    `Their trigger is ${answers.trigger}. They feel ${answers.feeling} after. ` +
    `Identify which arc in their habit loop is weakest — CUE→CRAVING, ` +
    `CRAVING→HABIT, HABIT→REWARD, or REWARD→CUE — and give one specific ` +
    `behavioral intervention targeting exactly that arc. Maximum 60 words. ` +
    `Write in second person, warm and direct. No generic advice. Reference ` +
    `their specific trigger and reward. Do not use em dashes.`
  );
}

export async function getLoopBreaker(answers) {
  if (MOCK_AI || !API_KEY) {
    await new Promise((r) => setTimeout(r, 700));
    return MOCK_BREAKER;
  }

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: buildPrompt(answers) }] }],
          generationConfig: {
            maxOutputTokens: 120,
            temperature: 0.7,
          },
        }),
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.warn('Gemini API error:', res.status, err);
      // Graceful fallback to mock on any API error
      return MOCK_BREAKER;
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return MOCK_BREAKER;

    return text.trim();
  } catch (err) {
    console.warn('Gemini fetch failed, using mock:', err.message);
    return MOCK_BREAKER;
  }
}

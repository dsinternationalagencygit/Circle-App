import { MOCK_BREAKER } from '../data/mockAI.js';

// Toggle: true = use seeded mock text (default, works offline)
//         false = call real Gemini API (Stage 4, requires API key)
const MOCK_AI = true;

// Replace with your Gemini API key for Stage 4
const API_KEY = '';

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
  if (MOCK_AI) {
    // Simulate a brief network delay for realistic feel
    await new Promise((r) => setTimeout(r, 600));
    return MOCK_BREAKER;
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildPrompt(answers) }] }],
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

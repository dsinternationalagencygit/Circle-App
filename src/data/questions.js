// Questions data — one per screen, Q1 on opening screen, Q2–Q4 on QuestionScreen

export const QUESTIONS = [
  {
    id: 'q1',
    text: 'What is running you?',
    key: 'habit',
    options: ['Social media', 'Food delivery', 'Online shopping', 'Doomscrolling'],
  },
  {
    id: 'q2',
    text: 'When does it hit hardest?',
    key: 'when',
    options: ['Morning routine', 'Work stress', 'Evening alone', 'Late at night'],
  },
  {
    id: 'q3',
    text: 'What triggers it?',
    key: 'trigger',
    options: ['Boredom', 'Anxiety', 'Loneliness', 'Procrastination'],
  },
  {
    id: 'q4',
    text: 'How do you feel after?',
    key: 'feeling',
    options: ['Numb', 'Relieved', 'Guilty', 'Empty'],
  },
];

// Seeded demo answers — Vikram's loop
export const VIKRAM_ANSWERS = {
  habit: 'Social media',
  when: 'Work stress',
  trigger: 'Anxiety',
  feeling: 'Guilty',
};

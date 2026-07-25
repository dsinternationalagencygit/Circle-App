# Circle — Crisis Reach-Out Engine

Circle is a responsive web application built for people in recovery from substance use disorders, and the people who support them. It runs in a browser on mobile and desktop.

### The Problem Solved
In a craving or crisis, the hardest thing is not knowing what to do: it is being unable to decide who to reach out to. Circle takes that decision away from the user, chooses the right person using local deterministic rules, and drafts the reach-out message and recipient guide via Gemini AI.

**Persona**: Anoop, 34, Kerala, three months since his last drink. It is 11pm. He is alone. He knows he should tell someone. He will not compose a sentence about his shame, and he cannot decide between his mother, his sponsor, and his closest friend. Circle decides for him.

---

## Key Features

1. **Zero Typing on Crisis Paths**: Taps only. Names and phone numbers in calm setup are the only typed inputs.
2. **Deterministic Selection Engine**: Choice is made by local rules (time of day, intensity, tags, nearby surroundings), never by AI. Selection is instant and explained in one clear line.
3. **Live Gemini 2.0 Flash Integration**: One live API call generates:
   - **Card 1 ("Send this")**: Message in Anoop's voice, first person, sendable as written (max 30 words, plain & unembarrassed).
   - **Card 2 ("For them")**: What the recipient should do (max 25 words) and one specific thing not to say.
4. **Web Speech API**: Integrated read-aloud support for both cards using `speechSynthesis`.
5. **Helpline Strip**: Permanent fixed bottom strip on 100% of screens (Tele-MANAS 14416, KIRAN 1800-599-0019, Emergency 112).
6. **S4 Emergency Escalation**: Works completely offline with zero network dependency. Triggered instantly via "Nothing is working", when no contact is eligible, or after 5 minutes of inactivity on the decision screen.
7. **Honest Counter**: Reach-out counter driven strictly by real user actions logged in `localStorage`. Zero simulated history.

---

## Google Services & Web APIs Used

1. **Gemini 2.0 Flash API**: High-speed multimodal AI inference with strict JSON output, 8-second timeout, 1 automatic retry, timestamped `localStorage` caching, and safety directive enforcement.
2. **Google Fonts**: Modern, high-contrast typography powered by **Sora** (weights 400 and 700).
3. **Google Analytics 4 (GA4)**: `gtag` integration (`G-XXXXXXXXXX`).
4. **Web Speech API (`speechSynthesis`)**: Multi-modal speech playback for read-aloud actions on both generated cards.
5. **Web Share API (`navigator.share`)**: One-tap native sharing for message + recipient guide, with fallback to clipboard on desktop.

---

## Setup & Local Development

### 1. Prerequisites
- Node.js (v20+)
- npm

### 2. Installation
```bash
git clone <repository-url>
cd loop
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory (based on `.env.example`):
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Running the App
```bash
npm run dev
```
Open `http://localhost:5173` (or the port specified in terminal output).

### 5. Building for Production
```bash
npm run build
```

---

## Safety & Medical Disclaimer

Circle is a crisis communication tool and does not provide medical treatment, diagnosis, or detox advice.
- App instructions strictly prohibit outputting dosing, tapering, detox, or withdrawal medication guidance.
- In any medical emergency, users are directed to call emergency services (`112`).

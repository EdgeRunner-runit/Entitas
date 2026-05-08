# ENTITAS

**Personality Simulation Platform**

Entitas is a web-based platform that lets you hold conversations with simulated personalities — historical figures, public individuals, or characters grounded in documents you provide. It runs entirely in the browser with no server infrastructure.

---

## What It Does

You pick a person, provide context, and talk to them. The model stays in character. Every two prompts, the system silently recalibrates to keep responses accurate and consistent — no interruption, no visible reset.

There are two ways to start a simulation:

**Document Mode** — Upload a PDF or plain text file. The platform extracts the text client-side and uses it as the grounding context for the simulation. Useful for fictional characters, private figures, or anyone with written material you want to feed in.

**Search Mode** — Type a name and a few identifying details (era, profession, nationality). The model uses its world knowledge to construct the simulation. Best for historical figures and well-documented public personalities.

---

## Tech Stack

### Frontend
- HTML5, CSS3, JavaScript ES6+
- React with Hooks (`useState`, `useEffect`)
- Fetch API for model communication
- FileReader API for client-side document extraction
- PDF.js for PDF parsing

### Security
- Web Crypto API (AES-GCM encryption)
- BYOK (Bring Your Own Key) architecture
- Session-derived salt; key decrypted only at API call time
- Raw key never logged or persisted

### Model Layer
- DeepSeek API (`deepseek-chat` / DeepSeek-V3)
- OpenAI-compatible REST endpoint (`https://api.deepseek.com/v1/chat/completions`)
- Full conversation history passed on every call
- Silent recalibration injected into system prompt every 2 user turns

### Persistence & Build
- `localStorage` for theme and font preferences
- Node.js runtime with Vite or Create React App
- npm for package management

---

## Project Structure

```
entitas/
├── src/
│   ├── components/
│   │   ├── App.jsx
│   │   ├── LoginScreen.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Sidebar.jsx
│   │   ├── ModeSelector.jsx
│   │   ├── DocumentMode.jsx
│   │   ├── SearchMode.jsx
│   │   ├── ChatWindow.jsx
│   │   ├── Message.jsx
│   │   └── SettingsPanel.jsx
│   ├── lib/
│   │   ├── api.js
│   │   ├── crypto.js
│   │   └── themes.js
│   └── index.jsx
├── public/
├── package.json
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A DeepSeek API key from [platform.deepseek.com](https://platform.deepseek.com)

### Installation

```bash
git clone https://github.com/your-username/entitas.git
cd entitas
npm install
```

### Configuration

Open `src/lib/api.js` and set your default key:

```js
const DEFAULT_DEEPSEEK_KEY = "your-key-here";
```

This key is used when users select **Use Default Model** in Search Mode. Users can also supply their own key through the UI — it will be AES-GCM encrypted before storage.

### Running Locally

```bash
npm run dev
```

Visit `http://localhost:5173` (Vite) or `http://localhost:3000` (CRA).

### Building for Production

```bash
npm run build
```

Output goes to `/dist`. Deploy to any static host — Vercel, Netlify, GitHub Pages, Cloudflare Pages.

---

## Features

### Authentication
UI gate login — any non-empty username and password combination grants access. No backend, no session tokens.

### Collapsible Sidebar
Navigation panel with Home, New Simulation, History, Settings, and Help. Collapses to icon width. State persists within the session.

### Document Mode
- Drag-and-drop or click-to-upload
- Accepts PDF and plain text
- PDF text extracted via PDF.js entirely in-browser
- Extracted content injected into model system prompt before first message

### Search Mode
- Four identity fields: Name, Era / Time Period, Profession, Nationality
- Radio toggle between default platform key and user-supplied key
- User key encrypted with AES-GCM on input; decrypted only at the moment of the API call

### Chat Interface
- Character responses labelled by name (left-aligned)
- User messages right-aligned
- Auto-scroll to latest message
- Enter key to send
- Clear conversation and Back buttons always visible

### Silent Recalibration
Every 2 user messages, a recalibration block is prepended to the next API call's system prompt. It re-states the character's personality parameters, tone, speech patterns, and knowledge boundaries. Completely invisible to the user.

### Theme Engine
Nine colour themes: Yellow, Blue, Red, Pink, Green, Cyan, Orange, White, Black. Each theme defines a full CSS variable set — background, surface, text, accent, border. Default on first load: Black.

### Font Customisation
Five font choices across distinct categories:

| Font | Category |
|---|---|
| Inter | Geometric Sans |
| Source Serif 4 | Serif |
| JetBrains Mono | Monospace |
| Nunito | Humanist Sans |
| Playfair Display | Display |

### Display Modes
Light, Dark, and System. System follows `prefers-color-scheme`. Coexists with the colour theme — mode controls surface brightness, theme controls accent identity.

All preferences stored in `localStorage` and restored on next visit.

---

## Design Principles

Entitas is built against Nielsen's 10 usability heuristics:

1. **Visibility of system status** — Loading labels on all async operations; Simulating badge during response generation
2. **Match between system and real world** — No internal jargon; plain language throughout
3. **User control and freedom** — Clear conversation, Back to mode selector available at all times
4. **Consistency and standards** — Uniform spacing, radius, and shadow depth across all components
5. **Error prevention** — Send disabled on empty input; API key validated before submission
6. **Recognition rather than recall** — Active mode, character name, and current theme always visible
7. **Flexibility and efficiency** — Enter to send, keyboard sidebar toggle, persistent settings tab
8. **Aesthetic and minimalist design** — No decorative copy, no marketing chrome
9. **Help users recover from errors** — Inline error with Retry button on API failure
10. **Help and documentation** — Sidebar Help section with task-focused step-by-step entries

---

## API Reference

DeepSeek API endpoint used:

```
POST https://api.deepseek.com/v1/chat/completions
Authorization: Bearer <key>
Content-Type: application/json

{
  "model": "deepseek-chat",
  "messages": [
    { "role": "system", "content": "<character grounding prompt>" },
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ],
  "max_tokens": 1000
}
```

To use `deepseek-reasoner` (DeepSeek-R1) instead for chain-of-thought responses, change the model string in `src/lib/api.js`. Note: responses will be slower.

---

## Adding PDF Support

PDF parsing requires PDF.js:

```bash
npm install pdfjs-dist
```

For scanned PDFs (image-based, no embedded text layer), add Tesseract.js for OCR:

```bash
npm install tesseract.js
```

PDF.js renders the scanned page to canvas; Tesseract.js reads the canvas and returns the text. Standard text-based PDFs only need PDF.js.

---

## Notes

- No data leaves the browser except the API call to DeepSeek
- No conversation history is stored beyond the current session
- The login screen is a UI gate only — there is no authentication backend
- The platform name on the live build is **Entitas**; rebrand by updating the `PLATFORM_NAME` constant in `App.jsx`

---

## License

MIT

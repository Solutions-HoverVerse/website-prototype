# Hoververse Executive Studio — Natural Language Web CMS & Visual Sandbox

The **Hoververse Executive Studio** is a site-aware AI editing environment built for executives and non-technical stakeholders. It replaces complex CMS editors (like Wix Studio) with an intuitive **Natural Language + Point-and-Click Visual Interface**.

---

## 🌟 Key Capabilities

1. **Natural Language Coding Agent:**
   * An executive can type instructions in plain English:
     * *"Change the picture on the platform page adjacent to the deterministic by design section to this one [uploaded image]"*
     * *"Update the hero headline at the very top of the home page to 'Touchless Interface. The New Enterprise Standard.'"*
     * *"Make the demo button say 'Schedule an Executive Briefing'"*
   * The agent uses a structured **Site Knowledge Manifest** (`site-manifest.json`) that understands every page, section ID, heading, adjacent visual element, and design token.

2. **Live Visual Sandbox Preview:**
   * Edits are applied instantly in a safe local sandbox without touching the live website.
   * Responsive viewport switcher: Desktop (1440px), Tablet (768px), Mobile (375px).
   * **Point-and-Click Visual Inspector:** Turn on the inspector to hover over any headline, image, or section in the preview. Click to select it and instruct the agent to modify that specific element.

3. **Diff Review & One-Click Undo:**
   * View the exact visual and code diff of what was changed before approving.
   * If the change doesn't look right, click **Revert Sandbox** to instantly discard changes and return to the clean git state.

4. **Dual-Pipeline Publishing (Cloudflare Pages + Wix Studio):**
   * **Target: Cloudflare Pages / Vercel (Recommended):** One-click git commit & push to the primary repository (`website-prototype`). Deploys to global edge CDN in ~10 seconds.
   * **Target: Wix Studio:** The built-in compiler (`wix-compiler.js`) automatically translates the updated HTML/CSS into Velo Custom Elements, commits to `wix-repo`, and pushes to the Wix GitHub pipeline.
   * **Target: Both:** Deploys to both pipelines simultaneously.

---

## 🚀 Quick Start

### Windows (1-Click Launcher):
Double-click [`start-studio.bat`](file:///c:/Users/Jeff/OneDrive%20-%20Hoververse/Antigravity%20Apps/Hoververse%20Website%20Rev%202/Hoververse%20Website/hoververse-site/start-studio.bat) in the root directory.  
It will automatically launch the server and open your browser to **`http://localhost:3000`**.

### Terminal / Command Line:
```bash
node studio/server.js
# Or
npm run studio
```
Open **`http://localhost:3000`** in any browser.

---

## 📁 Architecture Overview

```
hoververse-site/
├── studio/
│   ├── index.html          # Executive UI (Dark-mode, Glassmorphism, Split-Screen)
│   ├── server.js            # Zero-dependency native Node.js HTTP server
│   ├── agent-engine.js      # Natural Language & DOM transformation engine
│   ├── site-manifest.json   # Semantic knowledge graph of all pages and sections
│   └── wix-compiler.js      # Auto-compiler targeting Wix Velo Custom Elements
├── package.json             # NPM scripts
└── start-studio.bat         # 1-click Windows desktop launcher
```

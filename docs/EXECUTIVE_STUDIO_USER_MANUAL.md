# Hoververse Executive Studio — User Manual
**Natural Language Web CMS, Visual Live Sandbox & Dual Publishing Engine**

Version: 2.4 · Operating Environment: Node.js & Local / Cloud Hosting  
Target Repositories: [`Solutions-HoverVerse/website-prototype`](https://github.com/Solutions-HoverVerse/website-prototype) & [`JeffHVAI/my-site`](https://github.com/JeffHVAI/my-site)

---

## Table of Contents
1. [Overview & Philosophy](#1-overview--philosophy)
2. [Getting Started & Signing In](#2-getting-started--signing-in)
3. [Studio Workspace Layout](#3-studio-workspace-layout)
4. [Point & Click Inspector](#4-point--click-inspector)
5. [Text & Typography Editing](#5-text--typography-editing)
6. [Image, Video, & Media Editing](#6-image-video--media-editing)
7. [Moving Images & Proportional Layout Reflow](#7-moving-images--proportional-layout-reflow)
8. [Media Uploads & WebP Fast Page Load Optimization](#8-media-uploads--webp-fast-page-load-optimization)
9. [Undo, Revert, & Unified Diff Inspection](#9-undo-revert--unified-diff-inspection)
10. [Dual-Pipeline Publishing (Cloudflare & Wix Studio)](#10-dual-pipeline-publishing-cloudflare--wix-studio)
11. [Command Cheat Sheet for Executives](#11-command-cheat-sheet-for-executives)
12. [Troubleshooting & FAQs](#12-troubleshooting--faqs)

---

## 1. Overview & Philosophy

**Hoververse Executive Studio** is an autonomous, natural-language visual content management console designed specifically for executives, marketing leaders, and content creators. It eliminates the need for manual HTML/CSS editing, complex CMS dashboards, or third-party page builder lock-in.

### Core Principles
- **Conversational Natural Language**: Request layout changes, text revisions, or image placements in plain English just as you would describe them to a frontend engineer.
- **Direct Visual Manipulation**: Click on any element on any page to lock onto it. Drag visual handles to resize, crop, or reposition elements in real time.
- **Proportional Typographic Intelligence**: When images are moved, resized, or stacked, adjacent headlines and paragraphs automatically scale their font sizes, line heights, and margins to preserve aesthetic harmony.
- **Zero-Jump Scroll Preservation**: When changes are hot-reloaded into the live preview, your scroll position is preserved with zero visual jumping.
- **Dual-Pipeline Publishing**: One-click deployment pushes changes to **Cloudflare Pages** (static prototype) and transpiles them into clean Velo Custom Elements for **Wix Studio**.
- **100% Non-Destructive Safety**: Every visual tweak and conversational edit creates an immediate rollback snapshot, allowing instant single-click undo.

---

## 2. Getting Started & Signing In

### Launching the Studio Locally
1. Double-click `start-studio.bat` in the repository root, or open your terminal and run:
   ```bash
   node website-edit-studio/server.js
   ```
2. The server will start on port `3000`:
   ```text
   ======================================================
   🚀 Hoververse Executive Studio is LIVE (Secure Mode)
      👉 URL: http://localhost:3000
   ------------------------------------------------------
   🔒 Studio Passkey: [Active from STUDIO_PASSWORD environment variable]
   📂 Target Workspace: .../hoververse-site
   ======================================================
   ```
3. Open your browser to **[http://localhost:3000](http://localhost:3000)**.

### The Security Gate & Passkey
The studio is protected by an enterprise-grade defense-in-depth security layer:
- **Default Local Passkey**: `hoververse-secure` (configured in `website-edit-studio/.env`).
- **Timing-Safe Verification**: Passkeys are checked via constant-time SHA-256 comparison to prevent side-channel timing attacks.
- **Brute-Force Rate Limiting**: Entering an incorrect passkey 5 times triggers a temporary 15-minute IP lockout.
- **Session Duration**: Successful login sets an encrypted, signed `HttpOnly`, `SameSite=Strict` cookie valid for 7 days.

> **Tip:** To change your studio passkey, update `STUDIO_PASSWORD=your-secret-phrase` inside `website-edit-studio/.env` and restart the server.

---

## 3. Studio Workspace Layout

The Executive Studio interface is divided into two primary zones:

```
+----------------------------------------------------------------------------------------------------+
|  [HV LOGO]   [Home] [Platform] [Solutions] [About] [Careers] [Resources]   [Mobile/Desktop]  [PUBLISH] |
+------------------------------------------------------------+---------------------------------------+
|                                                            |  EXECUTIVE AI CMS PANEL               |
|                                                            |                                       |
|                                                            |  Message History & Activity Stream    |
|                                                            |  - "✓ Live Resized: 400px"            |
|                  LIVE PREVIEW SANDBOX                      |  - "✓ Live Text Reflowed: 60/40"      |
|                                                            |                                       |
|             (Interactive Hoververse Page)                  |  [🔒 Locked Element Badge: <h1>]     |
|                                                            |                                       |
|        - Point & Click Inspector Overlay                   |  [Dynamic Contextual Toolbars]        |
|        - Visual Resize & Crop Handles                      |  - Media Resize / Text Scaling        |
|        - ⠿ Move & Reflow Handle                            |  - Position & Move                    |
|                                                            |  - Proportional Balance               |
|                                                            |                                       |
|                                                            |  [ Layout Action Pills ]              |
|                                                            |  [ Upload Preview & WebP Dialog ]     |
|                                                            |  [ Prompt Input Box & Submit ]        |
+------------------------------------------------------------+---------------------------------------+
```

### 1. Top Header Bar
- **Page Tabs**: Switch seamlessly between `Home`, `Platform`, `Solutions`, `About`, `Careers`, and `Resources`. Navigating inside the preview iframe automatically updates the active tab.
- **Viewport Switchers**: Toggle between **Desktop** (100% fluid), **Tablet** (768px), and **Mobile** (390px) to verify responsive behavior.
- **Point & Click Inspector Button**: Toggles visual inspection on or off.
- **Undo Button (`↺ Undo`)**: Highlights when changes have been made; reverts the most recent edit instantly.
- **Review Diff & Publish Button**: Opens the deployment modal to inspect exact code diffs and publish to Cloudflare and Wix Studio.

### 2. Live Preview Sandbox (Left Pane)
- Renders the active HTML page with full styling, animations, scripts, and video playback.
- Automatically injects the visual inspector runtime with zero modification to your source files.

### 3. Executive AI CMS Panel (Right Pane)
- **Activity Log**: Displays step-by-step confirmation of all AI edits, resizes, crops, and publications.
- **Prompt Input Area**: Natural-language text bar for conversational edits.
- **Contextual Toolbars**: Automatically morphs based on whether you have selected an **Image/Video** or a **Text/Headline** element.

---

## 4. Point & Click Inspector

The Inspector allows you to select any element on any page without viewing a single line of HTML.

### Selecting an Element
1. Click the **Point & Click Inspector** button in the top header (it turns emerald green with a pulse indicator).
2. Hover over any element in the live preview. A dashed green bounding box will track your cursor with a badge showing the element's tag and ID (e.g., `<h1#hero-title>` or `<img.hero-graphic>`).
3. Click once on the target element:
   - The element becomes **Locked** with a solid green border and glowing highlight.
   - The Inspector automatically turns off so subsequent clicks interact with the editing handles rather than selecting other elements.
   - The badge turns solid emerald (`🔒 Locked: <tag>`).
   - The Studio panel displays the locked element badge with a preview of the text or image.

### Clearing or Re-selecting
- Press the **`Esc`** key on your keyboard.
- Or click the small **`×`** button on the `🔒 Locked Element` badge.
- Or click the **Point & Click Inspector** button again to select a different element.

---

## 5. Text & Typography Editing

When a text element (`<h1>`–`<h6>`, `<p>`, `<span>`, `<a>`, `<button>`, `<li>`, `<blockquote>`) is locked, the editor offers controls tailored for typography.

### 1. Live Font Scaling via Corner Handles
- **4 Corner Boxes (`nw`, `ne`, `se`, `sw`)**: Dragging any corner handle dynamically scales the element's `font-size` along the professional 29-step typographic scale:
  ```
  10px · 11px · 12px · 13px · 14px · 15px · 16px · 17px · 18px · 20px · 22px · 24px · 26px · 28px
  30px · 32px · 36px · 40px · 44px · 48px · 52px · 56px · 64px · 72px · 80px · 92px · 104px · 120px · 140px
  ```
- **Automatic Overflow Protection**: While dragging, height is locked to `auto` and max-height is cleared, preventing text from clipping or showing unwanted scrollbars.
- **Smart Line-Height**: Line height automatically adjusts based on font size (tighter for large headlines, open for body copy).

### 2. Text Scaling & Presets Toolbar
When a text element is locked, the toolbar presents quick-action pills:
- **`A+ Larger (+25%)`**: Scales the font size up by 25% and snaps to the nearest typographic scale step.
- **`A- Smaller (-20%)`**: Scales the font size down by 20%.
- **`Hero (44px)`**: Sets high-impact display scale for main hero titles (`line-height: 1.15`).
- **`Headline (28px)`**: Sets section headline scale (`line-height: 1.25`).
- **`Subhead (20px)`**: Sets card/kicker sub-heading scale (`line-height: 1.35`).
- **`Body (16px)`**: Standard readable body text (`line-height: 1.5`).
- **`100% Wide` / `75% Wide` / `50% Wide`**: Adjusts the maximum line-measure (box width) of the text block.

### 3. Natural Language Text Revisions
You can reword any locked text element simply by typing into the prompt box:
- *"Change this headline to 'Architecture becomes the interface.'"*
- *"Update the button text to 'Schedule an Executive Demo'"*
- *"Shorten this paragraph to two concise sentences focusing on physical AI"*
- *"Replace with: 'Touchless gesture control for high-throughput public spaces.'"*

---

## 6. Image, Video, & Media Editing

When an image (`<img>`), video (`<video>`), figure, or media column is locked, the editor provides dedicated media sizing, cropping, and aspect ratio controls.

### 1. The 8-Handle On-Canvas Visual Resizer
The locked media element displays 8 interactive visual handles:
- **4 Corner Handles (`nw`, `ne`, `se`, `sw`)**: Drag to scale width and height simultaneously.
- **2 Horizontal Crop Bars (`n`, `s`)**: Drag the top or bottom bar to live-crop the vertical height (`max-height` with `object-fit: cover`). The live badge shows: `↔ [W]px × ↕ [H]px (Live Resize / Crop)`.
- **2 Side Width Bars (`w`, `e`)**: Drag to adjust the container width.
- Releasing the mouse immediately saves the dimensions to the HTML file and hot-reloads the preview.

### 2. Media Resize & Crop Toolbar
Use the quick-action pills for instant, standardized styling:
- **Width Presets**:
  - `100% Full`: Expands the image to 100% of its column or container.
  - `75% Wide`: Sets a comfortable 75% width centered in its container.
  - `50% Wide`: Sets a compact 50% width.
- **Crop & Height Presets**:
  - `Crop Compact (260px)`: Tight crop ideal for horizontal cards and video thumbnails.
  - `Standard (400px)`: Balanced height for side-by-side section graphics.
  - `Tall View (540px)`: High-impact vertical view for architectural renderings.
  - `Auto / Uncrop`: Removes height limits (`height: auto; max-height: none`) and displays the media at intrinsic aspect ratio.
- **Aspect Ratio Presets**:
  - `16:9 Cinema`: Standard widescreen landscape ratio (`aspect-ratio: 16 / 9; object-fit: cover`).
  - `4:3 Standard`: Traditional balanced presentation ratio (`aspect-ratio: 4 / 3; object-fit: cover`).
  - `1:1 Square`: Modern square format (`aspect-ratio: 1 / 1; object-fit: cover`).
- **Fit Modes**:
  - `Fill (Cover)`: Fills the entire box, cropping excess edges (`object-fit: cover`).
  - `Fit (Contain)`: Scales the entire image down so 100% is visible without cropping (`object-fit: contain`).

---

## 7. Moving Images & Proportional Layout Reflow

One of the most powerful features of Executive Studio is the ability to **move an image anywhere on the page** while having surrounding text and headlines **automatically adapt in proportion**.

### 1. The On-Canvas Move Handle (`⠿ Grab to Move & Reflow`)
When an image or media column is locked, an emerald grab handle appears at the top right of the overlay:
- **Drag Left / Right**: Dragging horizontally past the threshold flips the layout:
  - Drag Left: Flips image into the **Left Column** (`.split-media-grid.reverse`).
  - Drag Right: Flips image into the **Right Column**.
- **Drag Far Up / Far Down**:
  - Dragging > 90px upward: Automatically converts the layout into a **Stacked Banner Above Text** (`.split-media-grid.stacked-above`).
  - Dragging > 90px downward: Automatically converts the layout into a **Stacked Banner Below Text** (`.split-media-grid.stacked-below`).
- **Live Text Reflow**: As you drag, surrounding headlines and paragraphs reflow live in the preview DOM so you can preview the composition before releasing.

### 2. Position & Move Toolbar
For exact positioning with a single click:
| Button | Action |
| :--- | :--- |
| **`◫ Left Col`** | Moves media to the left column; text flows on the right. |
| **`◫ Right Col`** | Moves media to the right column; text flows on the left. |
| **`⬆ Stack Above Text`** | Stacks the image across the full width above the headlines and body. |
| **`⬇ Stack Below Text`** | Places headlines and body first, with the image spanning full-width underneath. |
| **`⬆ Top Align`** | Aligns top of media flush with the top of the adjacent `<h2>`/`<h3>` headline. |
| **`⬍ Center`** | Vertically centers media relative to the adjacent text column. |
| **`⬇ Bottom Align`** | Aligns bottom of media flush with the bottom of the text block. |
| **`⇡ Move Up Section`** | Moves the entire media block physically earlier on the page before the preceding section. |
| **`⇣ Move Down Section`** | Moves the entire media block physically later on the page after the subsequent section. |

### 3. Proportional Balance & Typography Scaling
When you adjust the proportion between media and text, the Studio automatically recalculates typographic scales so headlines neither wrap awkwardly into 4–5 lines nor look undersized:

```
[ 🖼️ Media Focus (60/40) ]           [ ⚖️ Balanced (50/50) ]             [ 📝 Text Focus (40/60) ]
+---------------------+-------+     +---------------+---------------+     +-------+---------------------+
|                     | H2    |     |               | H2 Headline   |     |       | H2 Headline Spans   |
|   MEDIA (60%)       | Title |     |  MEDIA (50%)  | With Balanced |     | MEDIA | With Maximum Visual |
|   Takes Prominence  | Body  |     |               | Proportions   |     | (40%) | Punch Across Column |
+---------------------+-------+     +---------------+---------------+     +-------+---------------------+
  Headlines scale down (88%)          Balanced baseline scale               Headlines scale up (118%)
```

- **`⚖️ Balanced (50/50)`**: Equal 50/50 split (`grid-template-columns: 1fr 1fr`). Headlines display at standard `~28px–34px` scale.
- **`🖼️ Media Focus (60/40)`**: Media expands to 60% width; text column narrows to 40%. Headlines automatically scale down to `clamp(1.4rem, 2.2vw, 1.85rem)` with tight `1.22` line-height so long titles fit comfortably.
- **`📝 Text Focus (40/60)`**: Media contracts to a compact 40% thumbnail; text column expands to 60%. Headlines scale up to commanding hero weight (`clamp(1.9rem, 2.9vw, 2.45rem)`) with generous breathing room.
- **`🌟 Showcase (70/30)`**: Extra-wide 70% media showcase paired with a clean 30% sidebar summary.
- **`Stacked Above / Below`**: The text spans full width (max 960px) and headlines scale to bold hero proportions (`clamp(2.4rem, 4vw, 3.25rem)` with `1.125rem` lead text).

---

## 8. Media Uploads & WebP Fast Page Load Optimization

Executive Studio includes an integrated media pipeline supporting high-resolution photography, diagrams, vector graphics, animated GIFs, and HTML5 video (`.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`, `.svg`, `.mp4`, `.webm`, `.mov`).

### 1. Uploading Assets
- **Drag and Drop**: Drag an image or video file directly from your desktop into the Studio right panel.
- **File Picker**: Click the paperclip icon (`📎`) to select a file from your computer.

### 2. Automatic WebP Fast Page Load Conversion
When you upload a PNG, JPEG, or heavy image format, Executive Studio detects whether it could slow down site performance and presents the **Fast Page Load Optimization Card**:
- Explains the expected payload reduction (often **65%–85% smaller**).
- **`⚡ Convert to WebP (Recommended)`**: Compresses and converts the asset to modern `.webp` in real time. Pages load 3× faster on mobile and desktop without visible quality loss.
- **`Keep Original`**: Uses the raw uploaded format (e.g. for specialized transparent PNGs or vectors).

### 3. Layout Action Selector
Before submitting your upload, select how the new media should be integrated into the page:
- **`◫ Split (Media Right)`**: Converts the selected text block into a 2-column split with media on the right.
- **`◫ Split (Media Left)`**: 2-column split with media on the left.
- **`⬇ Below (Banner)`**: Inserts a full-width featured media panel directly below the selected element.
- **`⬆ Above (Banner)`**: Inserts a full-width featured media panel directly above the selected element.
- **`🔄 Replace`**: Seamlessly replaces an existing image or video while preserving all surrounding styles.
- **`🪄 Auto`**: Lets the AI determine the optimal layout based on your conversational prompt.

---

## 9. Undo, Revert, & Unified Diff Inspection

Every action taken in Executive Studio is non-destructive, versioned, and reversible.

### 1. Instant Single-Click Undo (`↺ Undo`)
- Every natural-language edit, handle resize, crop, or column flip creates an in-memory rollback snapshot.
- The **`↺ Undo`** button in the header illuminates whenever an undoable change exists.
- Clicking **`↺ Undo`** instantly restores the exact prior HTML and hot-reloads the preview.

### 2. Reviewing the Unified Diff
Before publishing any changes to the public web:
1. Click the **Review Diff & Publish** button in the top right.
2. The modal displays a color-coded, unified Git diff showing exactly what changed:
   - Green lines (`+`) represent added styles, classes, or content.
   - Red lines (`-`) represent removed code.
3. If any change was unintended, click **Revert Sandbox** to immediately discard all uncommitted changes and restore your workspace to the clean repository state.

---

## 10. Dual-Pipeline Publishing (Cloudflare & Wix Studio)

When you are satisfied with your edits in the live sandbox, you can deploy them to production with one click.

```
                      +-----------------------------+
                      |   Executive Studio Editor   |
                      +--------------+--------------+
                                     |
                         [Click Review & Publish]
                                     |
              +----------------------+----------------------+
              |                                             |
   TARGET 1: CLOUDFLARE PAGES                    TARGET 2: WIX STUDIO
 (website-prototype repository)                  (my-site repository)
              |                                             |
  - Raw HTML, CSS & Media                       - Runs `wix-compiler.js`
  - Git commit & push to origin/main            - Transpiles to Velo Custom Elements
  - Instant edge deployment                     - Resolves media to GitHub CDN
                                                - Git commit & push to origin/main
```

### Publishing Targets
Inside the **Publish Changes** modal, select your deployment target:
1. **Target 1: Cloudflare Pages (`website-prototype`)**:
   - Commits your modified HTML, CSS, and uploaded assets directly to `Solutions-HoverVerse/website-prototype`.
   - Triggers Cloudflare's edge build, updating the prototype URL within seconds.
2. **Target 2: Wix Studio (`my-site`)**:
   - Executes the automated `wix-compiler.js` pipeline.
   - Converts modified sections into standard Velo Custom Elements (`<hoververse-hero>`, `<hoververse-platform>`, `<hoververse-solutions>`, etc.).
   - Rewrites local image paths (`assets/uploads/...`) to permanent GitHub CDN URLs so images never break in Wix Studio.
   - Commits and pushes directly to `JeffHVAI/my-site`.
3. **Target 3: Both (Sync Cloudflare & Wix)** *(Recommended)*:
   - Synchronizes both production repositories in one atomic operation.

---

## 11. Command Cheat Sheet for Executives

You can control nearly any aspect of the site by typing conversational requests into the prompt box. Here are tested examples:

### Text & Headline Edits
```text
"Change the main headline on the home page to 'Touchless Interface. The New Enterprise Standard.'"
"Update the primary CTA button to say 'Schedule an Executive Demo'"
"Reword the kicker tag above the headline to say 'Physical AI for Built Environments'"
"Make this paragraph more concise and emphasize our zero-wearable advantage"
```

### Media Cropping & Sizing
```text
"Crop this image to 280px"
"Make this video widescreen 16:9"
"Set this thumbnail to square 1:1 aspect ratio"
"Change this image to 75% width"
"Uncrop this graphic and show its full height"
"Fit the entire graphic without cropping any edges"
```

### Layout Rearrangement & Moving
```text
"Move this image to the left column"
"Move the video to the right side of the text"
"Stack the image above the headline across the full width"
"Move this media below the text as a full banner"
"Make this a 60/40 media-focused split"
"Change to a 40/60 text-focused split with larger headlines"
"Align this image with the top of the header"
"Move this entire section up to precede the pipeline overview"
```

### Uploading & Replacing
```text
"Replace this placeholder graphic with the uploaded museum video map"
"Insert the uploaded architectural rendering beside this paragraph in a split layout"
"Add the uploaded diagram below this section with caption 'SurfaceWare Edge Pipeline'"
```

---

## 12. Troubleshooting & FAQs

### Q: I forgot my studio passkey or see "Locked out for 15 minutes". How do I reset it?
- The default passkey is `hoververse-secure`. Check or change it in `website-edit-studio/.env` under `STUDIO_PASSWORD=...`.
- If you were locked out by the rate limiter, simply restart the studio server (`node website-edit-studio/server.js`), which clears the in-memory lockout map immediately.

### Q: Does editing in the Studio overwrite my clean Git history?
- No. Every change is tracked in standard Git commits. You can review exact line-by-line diffs before committing, and the **Revert Sandbox** button can restore your files to the repository origin at any time.

### Q: When I reload or make edits, will I lose my place on the page?
- No. The Studio runtime features **zero-jump scroll preservation**. It snapshots your exact `window.scrollY` and restores it within milliseconds upon hot-reloading.

### Q: Why do images uploaded locally appear correctly in Wix Studio?
- During the Wix Studio publishing pipeline, `wix-compiler.js` automatically maps local asset paths (`assets/uploads/...`) to raw GitHub CDN URLs (`https://raw.githubusercontent.com/Solutions-HoverVerse/website-prototype/main/...`). This ensures Wix Custom Elements always render media reliably without manual asset hosting.

### Q: Can I run Executive Studio on a cloud server so other team members can access it?
- Yes. Because `website-edit-studio` is fully decoupled, you can deploy it to **Render**, **Railway**, or **AWS** with a single click. Simply set `STUDIO_PASSWORD` and your `GITHUB_TOKEN` in your cloud host's environment settings.

---

*Hoververse Executive Studio Documentation · Maintained by the Hoververse Web & Platform Engineering Team*

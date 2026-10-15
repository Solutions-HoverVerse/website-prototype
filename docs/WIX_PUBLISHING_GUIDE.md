# Hoververse Executive Studio — Review Diff & Wix Publishing Guide

This guide explains how the **Review Diff & Publish** workflow operates in the Hoververse Executive Studio, which GitHub repositories receive your updates, and the exact steps required to push those changes live to the public on Wix Studio.

---

## 1. How "Review Diff & Publish" Works

When you make changes in the **Hoververse Executive Studio** (editing text, dragging & dropping images, adjusting layout alignments, or resizing media):

1. **Safe Sandbox Isolation**:
   * All edits happen locally in real time inside a temporary sandbox.
   * Nothing is pushed to GitHub or live environments until you explicitly approve it.

2. **Diff Review Modal**:
   * Clicking **"Review Diff & Publish"** calls the studio's `/api/diff` endpoint.
   * It runs a `git diff` against your working directory and displays every line modified (`+` green additions, `-` red deletions).
   * This gives you full visibility to confirm only the intended pages and assets were touched before publishing.

3. **Automated Publishing Execution**:
   * When you click **"Approve & Publish to Live Site"**, the studio backend (`agent-engine.js`) runs the automated dual-pipeline:
     1. **Asset & Source Sync**: Commits and pushes any new files (e.g. uploaded images in `assets/uploads/`) and edited HTML to the primary prototype repository on GitHub.
     2. **Wix Velo Compilation**: The built-in [`studio/wix-compiler.js`](../studio/wix-compiler.js) compiles the updated page into a production-grade Web Component (Custom Element), rewriting all media paths to absolute raw GitHub CDN URLs and injecting the Wix full-width expansion enforcer.
     3. **Wix Repo Push**: Automatically commits and pushes the updated custom element files (`src/public/*.js`) to the Wix Studio GitHub repository.

---

## 2. GitHub Repositories in the Pipeline

| Pipeline | GitHub Repository | Branch | Purpose |
| :--- | :--- | :--- | :--- |
| **Primary Prototype & CDN** | [`Solutions-HoverVerse/website-prototype`](https://github.com/Solutions-HoverVerse/website-prototype) | `main` | Houses the source HTML, CSS, JavaScript, and uploaded media in `assets/uploads/`. Acts as the global high-speed raw GitHub CDN for all Wix Studio assets and auto-deploys to Cloudflare Pages. |
| **Wix Studio (Velo)** | [`JeffHVAI/my-site`](https://github.com/JeffHVAI/my-site) (submodule `wix-repo/`) | `main` | Connected directly to Wix Studio via Wix Studio Developer Mode (Wix IDE). Houses all compiled Velo Custom Elements (`hoververse-home.js`, `hoververse-platform.js`, etc.). |

---

## 3. What the Wix Compiler Does Automatically

Wix Studio runs custom elements inside sandboxed Shadow DOM containers. To ensure 100% fidelity without breakage, the compiler automatically:

* **Overcomes the 28% Width Restriction**: Injects an ancestor DOM traversal loop that forces `width: 100% !important; max-width: 100% !important` up through Wix's `.DURcgf` and `.max-width-container` wrapper elements.
* **Injects Full-Width Styles**: Appends `<style id="hoververse-ce-fullwidth-enforcer">` into the document `<head>`.
* **Bypasses the 20-Character Tag Limit**: Defines multiple tag aliases (e.g. `hoververse-platform`, `hoververse-platfor`, `platform`) so Wix Studio's property panel never fails due to character truncation.
* **Resolves Assets to CDN**: Converts relative paths (`src="assets/uploads/..."`) into public raw GitHub CDN URLs (`https://raw.githubusercontent.com/Solutions-HoverVerse/website-prototype/main/assets/...`), preventing 404 errors on Wix's `parastorage.com` CDN.
* **Preserves Interactive Scripts**: Binds the `depthCloud` particle canvas, smooth anchor scrolling (`#demo`), mobile menu toggle, dropdowns, and top-window link routing.

---

## 4. What Needs to Be Done in Wix Studio to Make the Site Public

Once you click **"Approve & Publish to Live Site"** in Executive Studio, the code is live on GitHub. Complete these quick steps in Wix to make it visible to the public:

### Step 1: Open Wix Studio
1. Navigate to [manage.wix.com](https://manage.wix.com) and sign in.
2. Open the **Hoververse** project and click **Edit in Studio**.

### Step 2: Confirm GitHub Sync in Wix IDE
1. In Wix Studio, enable **Developer Mode** (or open the **Wix IDE** panel on the left navigation bar).
2. Because your Wix Studio site is linked to the GitHub repository [`JeffHVAI/my-site`](https://github.com/JeffHVAI/my-site), Wix automatically syncs with the latest commit on the `main` branch.
3. If prompted with an incoming update banner, click **Pull / Sync**.

### Step 3: Verify the Custom Element (If applicable)
* On the page you edited (e.g., **Platform**):
  * Select the custom element on the canvas.
  * In the right-hand **Inspector / Properties panel**, verify:
    * **Source File**: `hoververse-platform.js` (from Public code)
    * **Tag Name**: `hoververse-platform` (or alias `platform`)

### Step 4: Click "Publish"
* In the top-right corner of the Wix Studio editor, click the blue **"Publish"** button.
* Wix builds the production release and pushes the updated custom element live across your domain.

### Step 5: Test on the Live Site
* Visit [hoververse.ai/platform](https://www.hoververse.ai/platform) (or your configured staging URL).
* Confirm the layout expands to full width and all newly added images and interactions load seamlessly.

/**
 * Hoververse Executive Studio — Local Server & API
 * 
 * Zero-dependency native Node.js HTTP server.
 * Run with: node studio/server.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const agentEngine = require('./agent-engine');

const PORT = process.env.PORT || 3000;
const ROOT_DIR = path.resolve(__dirname, '..');
const STUDIO_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif',
  '.bmp': 'image/bmp',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.ogg': 'video/ogg',
  '.mov': 'video/quicktime',
  '.pdf': 'application/pdf',
  '.ico': 'image/x-icon'
};

// Script automatically injected into preview pages for point-and-click element inspection
const INJECTED_INSPECTOR_SCRIPT = `
<script>
  (function() {
    let inspectorActive = false;
    let lockedEl = null;
    let hoveredEl = null;

    const overlay = document.createElement('div');
    overlay.id = '__hv_inspector_overlay';
    overlay.style.position = 'fixed';
    overlay.style.pointerEvents = 'none';
    overlay.style.border = '2px dashed #12A06A';
    overlay.style.background = 'rgba(18, 160, 106, 0.12)';
    overlay.style.borderRadius = '6px';
    overlay.style.zIndex = '999999';
    overlay.style.display = 'none';
    overlay.style.transition = 'all 0.08s ease';
    overlay.style.boxSizing = 'border-box';

    const badge = document.createElement('div');
    badge.style.position = 'absolute';
    badge.style.top = '-26px';
    badge.style.left = '0';
    badge.style.background = '#12A06A';
    badge.style.color = '#FFFFFF';
    badge.style.fontSize = '11px';
    badge.style.fontWeight = '600';
    badge.style.fontFamily = 'system-ui, sans-serif';
    badge.style.padding = '2px 8px';
    badge.style.borderRadius = '4px';
    badge.style.whiteSpace = 'nowrap';
    badge.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
    badge.innerText = 'Click to Select';
    overlay.appendChild(badge);

    const moveHandle = document.createElement('div');
    moveHandle.id = '__hv_move_handle';
    moveHandle.style.position = 'absolute';
    moveHandle.style.top = '-32px';
    moveHandle.style.right = '0';
    moveHandle.style.background = '#0D7A50';
    moveHandle.style.color = '#FFFFFF';
    moveHandle.style.fontSize = '11px';
    moveHandle.style.fontWeight = '600';
    moveHandle.style.fontFamily = 'system-ui, sans-serif';
    moveHandle.style.padding = '3px 10px';
    moveHandle.style.borderRadius = '4px';
    moveHandle.style.whiteSpace = 'nowrap';
    moveHandle.style.cursor = 'grab';
    moveHandle.style.boxShadow = '0 2px 8px rgba(0,0,0,0.35)';
    moveHandle.style.border = '1px solid #2DD68C';
    moveHandle.style.display = 'none';
    moveHandle.style.pointerEvents = 'auto';
    moveHandle.style.userSelect = 'none';
    moveHandle.innerHTML = '⠿ Grab to Move &amp; Reflow';
    overlay.appendChild(moveHandle);

    function isTextBox(el) {
      if (!el) return false;
      const tag = el.tagName.toLowerCase();
      if (['img', 'video', 'canvas', 'figure', 'picture', 'iframe'].includes(tag)) {
        return false;
      }
      if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'a', 'li', 'blockquote', 'button', 'label', 'strong', 'em', 'cite', 'b', 'i', 'small'].includes(tag)) {
        return true;
      }
      const hasMedia = el.querySelector('img, video, canvas, iframe');
      const textLen = (el.innerText || el.textContent || '').trim().length;
      return !hasMedia && textLen > 0;
    }

    const TYPO_SCALE = [10, 11, 12, 13, 14, 15, 16, 17, 18, 20, 22, 24, 26, 28, 30, 32, 36, 40, 44, 48, 52, 56, 64, 72, 80, 92, 104, 120, 140];
    function snapToTypoScale(size) {
      let closest = TYPO_SCALE[0];
      let minDiff = Math.abs(size - closest);
      for (let i = 1; i < TYPO_SCALE.length; i++) {
        const diff = Math.abs(size - TYPO_SCALE[i]);
        if (diff < minDiff) {
          minDiff = diff;
          closest = TYPO_SCALE[i];
        }
      }
      return closest;
    }

    // 8 Interactive Resize / Crop Handles
    const handles = {};
    const handleDefs = [
      { id: 'nw', cursor: 'nwse-resize', style: 'top:-7px;left:-7px;width:14px;height:14px;border-radius:3px;' },
      { id: 'ne', cursor: 'nesw-resize', style: 'top:-7px;right:-7px;width:14px;height:14px;border-radius:3px;' },
      { id: 'se', cursor: 'nwse-resize', style: 'bottom:-7px;right:-7px;width:14px;height:14px;border-radius:3px;' },
      { id: 'sw', cursor: 'nesw-resize', style: 'bottom:-7px;left:-7px;width:14px;height:14px;border-radius:3px;' },
      { id: 'n',  cursor: 'ns-resize',   style: 'top:-7px;left:calc(50% - 14px);width:28px;height:10px;border-radius:4px;' },
      { id: 's',  cursor: 'ns-resize',   style: 'bottom:-7px;left:calc(50% - 14px);width:28px;height:10px;border-radius:4px;' },
      { id: 'w',  cursor: 'ew-resize',   style: 'top:calc(50% - 14px);left:-7px;width:10px;height:28px;border-radius:4px;' },
      { id: 'e',  cursor: 'ew-resize',   style: 'top:calc(50% - 14px);right:-7px;width:10px;height:28px;border-radius:4px;' }
    ];

    let isDragging = false;
    let dragDir = '';
    let startX = 0, startY = 0;
    let startW = 0, startH = 0;
    let lastW = 0, lastH = 0;
    let startFontSize = 16;
    let startLineHeightRatio = 1.35;
    let isCurrentText = false;

    function initDrag(e) {
      if (!lockedEl) return;
      e.preventDefault();
      e.stopPropagation();

      isDragging = true;
      dragDir = e.target.dataset.dir;
      startX = e.clientX;
      startY = e.clientY;

      const rect = lockedEl.getBoundingClientRect();
      startW = rect.width;
      startH = rect.height;
      lastW = startW;
      lastH = startH;

      isCurrentText = isTextBox(lockedEl);
      if (isCurrentText) {
        const cs = window.getComputedStyle(lockedEl);
        startFontSize = parseFloat(cs.fontSize) || 16;
        const lh = parseFloat(cs.lineHeight);
        startLineHeightRatio = (!isNaN(lh) && lh > 0) ? (lh / startFontSize) : 1.35;
      }

      document.body.style.userSelect = 'none';

      window.addEventListener('mousemove', onDragMove, true);
      window.addEventListener('mouseup', onDragEnd, true);
    }

    function onDragMove(e) {
      if (!isDragging || !lockedEl) return;
      e.preventDefault();
      e.stopPropagation();

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      let newW = startW;
      let newH = startH;

      if (dragDir.includes('e')) newW = Math.max(60, startW + dx);
      if (dragDir.includes('w')) newW = Math.max(60, startW - dx);
      if (dragDir.includes('s')) newH = Math.max(20, startH + dy);
      if (dragDir.includes('n')) newH = Math.max(20, startH - dy);

      lastW = Math.round(newW);
      lastH = Math.round(newH);

      lockedEl.style.width = lastW + 'px';
      lockedEl.style.maxWidth = 'none';

      if (isCurrentText) {
        // Text Box Scaling: scale font size to nearest typo scale that corresponds with new size
        const ratioW = newW / Math.max(1, startW);
        const ratioH = newH / Math.max(1, startH);
        const scale = ((ratioW + ratioH) / 2);
        const rawFontSize = startFontSize * scale;
        const snappedSize = snapToTypoScale(Math.max(10, Math.min(140, rawFontSize)));

        lockedEl.style.fontSize = snappedSize + 'px';
        lockedEl.style.lineHeight = (startLineHeightRatio <= 1.2 ? '1.15' : (startLineHeightRatio <= 1.35 ? '1.25' : '1.4'));
        lockedEl.style.height = 'auto';
        lockedEl.style.maxHeight = 'none';
        lockedEl.style.overflow = 'visible';

        updateOverlayPos(lockedEl, true);
        badge.innerText = '↔ ' + lastW + 'px · Font: ' + snappedSize + 'px (Scaled to Box)';
      } else {
        // Media Resizing & Cropping
        const tag = lockedEl.tagName.toLowerCase();
        if (['img', 'video', 'canvas', 'figure'].includes(tag) || dragDir.includes('n') || dragDir.includes('s')) {
          lockedEl.style.height = lastH + 'px';
          lockedEl.style.maxHeight = lastH + 'px';
          if (['img', 'video'].includes(tag)) {
            lockedEl.style.objectFit = 'cover';
          } else {
            lockedEl.style.overflow = 'hidden';
          }
        }

        updateOverlayPos(lockedEl, true);
        badge.innerText = '↔ ' + lastW + 'px × ↕ ' + lastH + 'px (Live Resize / Crop)';
      }
    }

    function onDragEnd(e) {
      if (!isDragging) return;
      isDragging = false;
      document.body.style.userSelect = '';

      window.removeEventListener('mousemove', onDragMove, true);
      window.removeEventListener('mouseup', onDragEnd, true);

      if (!lockedEl) return;
      const tag = lockedEl.tagName.toLowerCase();
      const isText = isTextBox(lockedEl);

      badge.innerText = isText 
        ? ('🔒 Locked: <' + tag + '> · Font: ' + lockedEl.style.fontSize)
        : ('🔒 Locked: <' + tag + '> · ' + lastW + 'px × ' + lastH + 'px');

      const styles = isText ? {
        width: lockedEl.style.width,
        fontSize: lockedEl.style.fontSize,
        lineHeight: lockedEl.style.lineHeight || '1.3',
        height: 'auto',
        maxHeight: 'none',
        overflow: 'visible'
      } : {
        width: lockedEl.style.width,
        height: lockedEl.style.height || (lastH + 'px'),
        maxHeight: lockedEl.style.maxHeight || (lastH + 'px'),
        objectFit: lockedEl.style.objectFit || 'cover',
        overflow: lockedEl.style.overflow || ''
      };

      window.parent.postMessage({
        type: 'HV_ELEMENT_RESIZED',
        info: {
          tag: tag,
          id: lockedEl.id || '',
          className: typeof lockedEl.className === 'string' ? lockedEl.className : '',
          src: lockedEl.getAttribute('src') || lockedEl.src || '',
          text: (lockedEl.innerText || lockedEl.textContent || '').trim().slice(0, 120),
          firstLine: (lockedEl.innerText || '').split('\\n')[0].trim().slice(0, 80),
          outerOpening: lockedEl.outerHTML ? (lockedEl.outerHTML.split('>')[0] + '>') : '',
          isText: isText
        },
        styles: styles
      }, '*');
    }

    // Move & Live Text Reflow Handler
    let isMoving = false;
    let startMoveX = 0, startMoveY = 0;
    let currentGrid = null;
    let isReverseAtStart = false;
    let initialAlign = 'center';
    let lastReposition = { alignment: 'center', column: 'right', stacked: 'none' };

    function initMoveDrag(e) {
      if (!lockedEl) return;
      e.preventDefault();
      e.stopPropagation();

      isMoving = true;
      startMoveX = e.clientX;
      startMoveY = e.clientY;
      moveHandle.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';

      currentGrid = lockedEl.closest('.split-media-grid') || (lockedEl.parentElement && lockedEl.parentElement.closest('.split-media-grid'));
      if (currentGrid) {
        isReverseAtStart = currentGrid.classList.contains('reverse');
        if (currentGrid.classList.contains('align-start') || currentGrid.style.alignItems === 'start') {
          initialAlign = 'start';
        } else if (currentGrid.classList.contains('align-end') || currentGrid.style.alignItems === 'end') {
          initialAlign = 'end';
        } else {
          initialAlign = 'center';
        }
      } else {
        isReverseAtStart = false;
        initialAlign = 'center';
      }

      lastReposition = {
        alignment: initialAlign,
        column: isReverseAtStart ? 'left' : 'right',
        stacked: 'none'
      };

      window.addEventListener('mousemove', onMoveDrag, true);
      window.addEventListener('mouseup', onMoveEnd, true);
    }

    function onMoveDrag(e) {
      if (!isMoving || !lockedEl) return;
      e.preventDefault();
      e.stopPropagation();

      const dx = e.clientX - startMoveX;
      const dy = e.clientY - startMoveY;

      let alignment = initialAlign;
      let column = isReverseAtStart ? 'left' : 'right';
      let stacked = 'none';

      // Vertical repositioning threshold: dy > 30 is lower, dy < -30 is higher
      if (dy > 30) {
        alignment = 'end';
      } else if (dy < -30) {
        alignment = 'start';
      } else {
        alignment = 'center';
      }

      // Horizontal flip threshold: dx < -50 flips to left, dx > 50 flips to right
      if (!isReverseAtStart) {
        if (dx < -50) column = 'left';
        else column = 'right';
      } else {
        if (dx > 50) column = 'right';
        else column = 'left';
      }

      lastReposition = { alignment, column, stacked };

      // Apply live text reflow in preview DOM immediately!
      if (currentGrid) {
        if (column === 'left') {
          currentGrid.classList.add('reverse');
        } else {
          currentGrid.classList.remove('reverse');
        }

        currentGrid.classList.remove('align-start', 'align-center', 'align-end');
        currentGrid.classList.add('align-' + alignment);
        currentGrid.style.alignItems = alignment;
      }

      updateOverlayPos(lockedEl, true);

      let alignLabel = alignment === 'end' ? '⬇ Lower Position (Bottom)' : (alignment === 'start' ? '⬆ Higher Position (Top)' : '⬍ Center');
      let colLabel = column === 'left' ? '◫ Left Column' : '◫ Right Column';

      moveHandle.innerHTML = '⠿ ' + alignLabel + ' · ' + colLabel;
      badge.innerText = 'Live Reflowing Text: ' + alignLabel + ' · ' + colLabel;
    }

    function onMoveEnd(e) {
      if (!isMoving) return;
      isMoving = false;
      moveHandle.style.cursor = 'grab';
      document.body.style.userSelect = '';

      window.removeEventListener('mousemove', onMoveDrag, true);
      window.removeEventListener('mouseup', onMoveEnd, true);

      if (!lockedEl) return;

      moveHandle.innerHTML = '⠿ Grab to Move &amp; Reflow';
      badge.innerText = '🔒 Locked: <' + lockedEl.tagName.toLowerCase() + '> · Repositioned';

      const tag = lockedEl.tagName.toLowerCase();
      window.parent.postMessage({
        type: 'HV_ELEMENT_REPOSITIONED',
        info: {
          tag: tag,
          id: lockedEl.id || '',
          className: typeof lockedEl.className === 'string' ? lockedEl.className : '',
          src: lockedEl.getAttribute('src') || lockedEl.src || '',
          text: (lockedEl.innerText || lockedEl.textContent || '').trim().slice(0, 120),
          firstLine: (lockedEl.innerText || '').split('\\n')[0].trim().slice(0, 80),
          outerOpening: lockedEl.outerHTML ? (lockedEl.outerHTML.split('>')[0] + '>') : ''
        },
        reposition: lastReposition
      }, '*');
    }

    moveHandle.addEventListener('mousedown', initMoveDrag);

    handleDefs.forEach(def => {
      const h = document.createElement('div');
      h.className = '__hv_resize_handle';
      h.dataset.dir = def.id;
      h.style.cssText = 'position:absolute;background:#FFFFFF;border:2px solid #12A06A;box-shadow:0 2px 6px rgba(0,0,0,0.45);z-index:1000000;display:none;box-sizing:border-box;pointer-events:auto;' + def.style;
      h.style.cursor = def.cursor;
      overlay.appendChild(h);
      handles[def.id] = h;

      h.addEventListener('mousedown', initDrag);
    });

    document.body.appendChild(overlay);

    function updateOverlayPos(el, isLocked) {
      if (!el) return;
      const r = el.getBoundingClientRect();
      overlay.style.top = Math.max(0, r.top) + 'px';
      overlay.style.left = Math.max(0, r.left) + 'px';
      overlay.style.width = r.width + 'px';
      overlay.style.height = r.height + 'px';
      overlay.style.display = 'block';

      if (isLocked) {
        overlay.style.pointerEvents = 'none'; // Keep overlay clicks transparent while handles have pointer-events:auto
        overlay.style.border = '2px solid #12A06A';
        overlay.style.background = 'rgba(18, 160, 106, 0.18)';
        overlay.style.boxShadow = '0 0 16px rgba(18, 160, 106, 0.45)';
        
        const isText = isTextBox(el);
        const tag = el.tagName.toLowerCase();
        const isMedia = ['img', 'video', 'canvas', 'figure'].includes(tag) || el.closest('.split-media-col') || el.closest('.media-banner-panel');

        if (isMedia) {
          moveHandle.style.display = 'block';
        } else {
          moveHandle.style.display = 'none';
        }

        if (isText) {
          badge.innerText = '🔒 Locked: <' + tag + (el.id ? '#' + el.id : '') + '> · Corner drag scales font size';
          badge.style.background = '#0D7A50';
          // Enable corners, DISABLE crop bars on text boxes
          handles.nw.style.display = 'block';
          handles.ne.style.display = 'block';
          handles.se.style.display = 'block';
          handles.sw.style.display = 'block';
          handles.n.style.display = 'none';
          handles.s.style.display = 'none';
          handles.w.style.display = 'none';
          handles.e.style.display = 'none';
        } else {
          badge.innerText = '🔒 Locked: <' + tag + (el.id ? '#' + el.id : '') + '> · Drag corners to scale, top handle to move';
          badge.style.background = '#0D7A50';
          for (const k in handles) handles[k].style.display = 'block';
        }
      } else {
        overlay.style.pointerEvents = 'none';
        overlay.style.border = '2px dashed #12A06A';
        overlay.style.background = 'rgba(18, 160, 106, 0.12)';
        overlay.style.boxShadow = 'none';
        badge.innerText = 'Click to Select: <' + el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + '>';
        badge.style.background = '#12A06A';
        moveHandle.style.display = 'none';
        for (const k in handles) handles[k].style.display = 'none';
      }
    }

    // Keep locked highlight positioned during scroll / resize
    window.addEventListener('scroll', function() {
      if (lockedEl) updateOverlayPos(lockedEl, true);
    }, { passive: true });
    window.addEventListener('resize', function() {
      if (lockedEl) updateOverlayPos(lockedEl, true);
    }, { passive: true });

    window.addEventListener('message', function(e) {
      if (!e.data) return;
      if (e.data.type === 'HV_TOGGLE_INSPECTOR') {
        inspectorActive = !!e.data.enabled;
        if (inspectorActive) {
          lockedEl = null; // Clear previous lock to allow re-selection
          moveHandle.style.display = 'none';
          for (const k in handles) handles[k].style.display = 'none';
        } else if (!lockedEl) {
          overlay.style.display = 'none';
          moveHandle.style.display = 'none';
          for (const k in handles) handles[k].style.display = 'none';
          if (hoveredEl) hoveredEl.style.cursor = '';
        }
      } else if (e.data.type === 'HV_CLEAR_SELECTION') {
        lockedEl = null;
        inspectorActive = false;
        overlay.style.display = 'none';
        moveHandle.style.display = 'none';
        for (const k in handles) handles[k].style.display = 'none';
        if (hoveredEl) hoveredEl.style.cursor = '';
      } else if (e.data.type === 'HV_APPLY_STYLE_PRESET') {
        if (!lockedEl) return;
        const styles = e.data.styles || {};
        const isText = isTextBox(lockedEl);
        for (const [k, v] of Object.entries(styles)) {
          if (k === 'fontSizeMultiplier') {
            const cs = window.getComputedStyle(lockedEl);
            const currentSize = parseFloat(cs.fontSize) || 16;
            const newSize = snapToTypoScale(currentSize * v);
            lockedEl.style.fontSize = newSize + 'px';
            lockedEl.style.height = 'auto';
            lockedEl.style.maxHeight = 'none';
          } else {
            lockedEl.style[k] = v;
          }
        }
        updateOverlayPos(lockedEl, true);
        const rect = lockedEl.getBoundingClientRect();
        window.parent.postMessage({
          type: 'HV_ELEMENT_RESIZED',
          info: {
            tag: lockedEl.tagName.toLowerCase(),
            id: lockedEl.id || '',
            className: typeof lockedEl.className === 'string' ? lockedEl.className : '',
            src: lockedEl.getAttribute('src') || lockedEl.src || '',
            text: (lockedEl.innerText || lockedEl.textContent || '').trim().slice(0, 120),
            firstLine: (lockedEl.innerText || '').split('\\n')[0].trim().slice(0, 80),
            outerOpening: lockedEl.outerHTML ? (lockedEl.outerHTML.split('>')[0] + '>') : '',
            isText: isText
          },
          styles: isText ? {
            width: lockedEl.style.width,
            fontSize: lockedEl.style.fontSize,
            lineHeight: lockedEl.style.lineHeight || '1.3',
            height: 'auto',
            maxHeight: 'none',
            overflow: 'visible'
          } : {
            width: lockedEl.style.width,
            height: lockedEl.style.height || (Math.round(rect.height) + 'px'),
            maxHeight: lockedEl.style.maxHeight || (Math.round(rect.height) + 'px'),
            objectFit: lockedEl.style.objectFit || 'cover',
            overflow: lockedEl.style.overflow || ''
          }
        }, '*');
      } else if (e.data.type === 'HV_APPLY_REPOSITION') {
        if (!lockedEl) return;
        const repo = e.data.reposition || {};
        const grid = lockedEl.closest('.split-media-grid') || (lockedEl.parentElement && lockedEl.parentElement.closest('.split-media-grid'));
        if (grid) {
          if (repo.alignment) {
            grid.classList.remove('align-start', 'align-center', 'align-end');
            grid.classList.add('align-' + repo.alignment);
            grid.style.alignItems = repo.alignment;
          }
          if (repo.toggleColumn) {
            grid.classList.toggle('reverse');
          } else if (repo.column === 'left') {
            grid.classList.add('reverse');
          } else if (repo.column === 'right') {
            grid.classList.remove('reverse');
          }
          updateOverlayPos(lockedEl, true);
          const isReverse = grid.classList.contains('reverse');
          const currentAlign = grid.classList.contains('align-start') ? 'start' : (grid.classList.contains('align-end') ? 'end' : 'center');
          window.parent.postMessage({
            type: 'HV_ELEMENT_REPOSITIONED',
            info: {
              tag: lockedEl.tagName.toLowerCase(),
              id: lockedEl.id || '',
              className: typeof lockedEl.className === 'string' ? lockedEl.className : '',
              src: lockedEl.getAttribute('src') || lockedEl.src || '',
              text: (lockedEl.innerText || lockedEl.textContent || '').trim().slice(0, 120),
              firstLine: (lockedEl.innerText || '').split('\\n')[0].trim().slice(0, 80),
              outerOpening: lockedEl.outerHTML ? (lockedEl.outerHTML.split('>')[0] + '>') : ''
            },
            reposition: {
              alignment: repo.alignment || currentAlign,
              column: isReverse ? 'left' : 'right',
              stacked: 'none'
            }
          }, '*');
        }
      }
    });

    document.addEventListener('mouseover', function(e) {
      if (!inspectorActive || lockedEl) return;
      if (e.target === overlay || overlay.contains(e.target)) return;
      hoveredEl = e.target;
      hoveredEl.style.cursor = 'crosshair';
      updateOverlayPos(hoveredEl, false);
    }, true);

    document.addEventListener('click', function(e) {
      if (!inspectorActive) return;
      if (e.target === overlay || overlay.contains(e.target)) return;
      
      e.preventDefault();
      e.stopPropagation();

      const el = e.target;
      lockedEl = el;
      inspectorActive = false; // Turn OFF selecting immediately on click!
      if (hoveredEl) hoveredEl.style.cursor = '';

      updateOverlayPos(lockedEl, true); // Lock highlight in place

      const rawText = (el.innerText || el.textContent || '').trim();
      const firstLineText = rawText.split('\\n')[0].trim().slice(0, 80);
      const outerOpening = el.outerHTML ? el.outerHTML.split('>')[0] + '>' : '';
      const isText = isTextBox(el);

      const info = {
        tag: el.tagName.toLowerCase(),
        id: el.id || '',
        className: typeof el.className === 'string' ? el.className : '',
        text: rawText.slice(0, 160),
        firstLine: firstLineText,
        outerOpening: outerOpening.slice(0, 200),
        src: el.getAttribute('src') || el.src || '',
        href: el.getAttribute('href') || el.href || '',
        isText: isText,
        parentTag: el.parentElement ? el.parentElement.tagName.toLowerCase() : '',
        parentClass: (el.parentElement && typeof el.parentElement.className === 'string') ? el.parentElement.className : ''
      };

      window.parent.postMessage({
        type: 'HV_ELEMENT_SELECTED',
        info: info
      }, '*');
    }, true);

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && (inspectorActive || lockedEl)) {
        lockedEl = null;
        inspectorActive = false;
        overlay.style.display = 'none';
        if (hoveredEl) hoveredEl.style.cursor = '';
        window.parent.postMessage({ type: 'HV_INSPECTOR_CANCELLED' }, '*');
      }
    });
  })();
</script>
`;

function serveFileWithStreaming(req, res, filePath) {
  try {
    const stat = fs.statSync(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const mime = MIME_TYPES[ext] || 'application/octet-stream';
    const range = req.headers.range;

    // HTTP 206 Partial Content for smooth video seeking & streaming (MP4, WebM, MOV)
    if (range && (mime.startsWith('video/') || mime.startsWith('audio/'))) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(filePath, { start, end });
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${stat.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': mime
      });
      file.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': stat.size,
        'Content-Type': mime,
        'Accept-Ranges': 'bytes'
      });
      fs.createReadStream(filePath).pipe(res);
    }
  } catch (err) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('File Not Found');
  }
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // 1. Studio Web App UI
  if (pathname === '/' || pathname === '/index.html') {
    const indexPath = path.join(STUDIO_DIR, 'index.html');
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(fs.readFileSync(indexPath));
    return;
  }

  // 2. Direct Media Upload Endpoint (JSON with Base64 dataURL)
  if (pathname === '/api/upload' && req.method === 'POST') {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => {
      try {
        const bodyStr = Buffer.concat(chunks).toString('utf-8');
        const payload = JSON.parse(bodyStr);
        const saved = agentEngine.saveUploadedAsset(payload);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, ...saved }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // 2b. Direct Raw Binary Upload (supports large animated GIFs, MP4, WebM up to 100MB+)
  if (pathname === '/api/upload-raw' && req.method === 'POST') {
    const origFilename = (parsedUrl.query && parsedUrl.query.filename) ? decodeURIComponent(parsedUrl.query.filename) : 'media.png';
    const ext = path.extname(origFilename).replace('.', '').toLowerCase() || 'png';
    const cleanBaseName = path.basename(origFilename, path.extname(origFilename)).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uploadsDir = path.join(ROOT_DIR, 'assets', 'uploads');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

    const targetFilename = `exec_${Date.now()}_${cleanBaseName}.${ext}`;
    const targetPath = path.join(uploadsDir, targetFilename);
    const writeStream = fs.createWriteStream(targetPath);

    req.pipe(writeStream);
    writeStream.on('finish', () => {
      const isVideo = ['mp4', 'webm', 'mov', 'ogg'].includes(ext);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        assetPath: `assets/uploads/${targetFilename}`,
        filename: targetFilename,
        ext,
        isVideo,
        isImage: !isVideo
      }));
    });
    writeStream.on('error', (err) => {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: err.message }));
    });
    return;
  }

  // 3. Natural Language & Targeted Edit Endpoint
  if (pathname === '/api/edit' && req.method === 'POST') {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', async () => {
      try {
        const bodyStr = Buffer.concat(chunks).toString('utf-8');
        const payload = JSON.parse(bodyStr);
        const result = await agentEngine.processExecutiveEdit(payload);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, summary: err.message }));
      }
    });
    return;
  }

  // 3b. Undo Last Change Endpoint
  if (pathname === '/api/undo' && req.method === 'POST') {
    const result = agentEngine.undoLastChange();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result));
    return;
  }

  // 3c. Resize & Crop Element Endpoint
  if (pathname === '/api/resize' && req.method === 'POST') {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', async () => {
      try {
        const bodyStr = Buffer.concat(chunks).toString('utf-8');
        const payload = JSON.parse(bodyStr);
        const result = await agentEngine.processElementResize(payload);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, summary: err.message }));
      }
    });
    return;
  }

  // 3c-2. Reposition & Live Text Reflow Endpoint
  if (pathname === '/api/reposition' && req.method === 'POST') {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', async () => {
      try {
        const bodyStr = Buffer.concat(chunks).toString('utf-8');
        const payload = JSON.parse(bodyStr);
        const result = await agentEngine.processElementReposition(payload);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, summary: err.message }));
      }
    });
    return;
  }

  // 3d. Check if undo is available
  if (pathname === '/api/can-undo' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ canUndo: agentEngine.canUndo() }));
    return;
  }

  if (pathname === '/api/diff' && req.method === 'GET') {
    const diff = agentEngine.getUncommittedDiff();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ diff }));
    return;
  }

  if (pathname === '/api/revert' && req.method === 'POST') {
    const result = agentEngine.revertSandbox();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result));
    return;
  }

  if (pathname === '/api/publish' && req.method === 'POST') {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', async () => {
      try {
        const bodyStr = Buffer.concat(chunks).toString('utf-8');
        const payload = JSON.parse(bodyStr || '{}');
        const result = await agentEngine.publishChanges(payload);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // 4. Sandbox Preview Route: /preview/*
  if (pathname.startsWith('/preview/')) {
    let relative = pathname.replace('/preview/', '') || 'index.html';
    if (relative === '' || relative === '/') relative = 'index.html';

    const filePath = path.join(ROOT_DIR, relative);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const mime = MIME_TYPES[ext] || 'application/octet-stream';

      if (ext === '.html') {
        let html = fs.readFileSync(filePath, 'utf-8');
        // Inject inspector script right before </body>
        if (html.includes('</body>')) {
          html = html.replace('</body>', INJECTED_INSPECTOR_SCRIPT + '</body>');
        } else {
          html += INJECTED_INSPECTOR_SCRIPT;
        }
        res.writeHead(200, { 'Content-Type': mime });
        res.end(html);
        return;
      }

      serveFileWithStreaming(req, res, filePath);
      return;
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end(`Sandbox file not found: ${relative}`);
      return;
    }
  }

  // 5. Static Assets from root
  const directPath = path.join(ROOT_DIR, pathname);
  if (fs.existsSync(directPath) && fs.statSync(directPath).isFile()) {
    serveFileWithStreaming(req, res, directPath);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 Hoververse Executive Studio is live at:`);
  console.log(`   👉 http://localhost:${PORT}`);
  console.log(`======================================================\n`);
});

/* ============================================================
   HOVERVERSE — interactions (vanilla, self-contained)
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Header stuck ---------- */
  var header = document.querySelector(".site-header");
  function onScroll() { header.classList.toggle("is-stuck", window.scrollY > 20); }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Mobile nav ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle) toggle.addEventListener("click", function () { links.classList.toggle("open"); });
  if (links) Array.prototype.forEach.call(links.querySelectorAll("a"), function (a) {
    a.addEventListener("click", function () { links.classList.remove("open"); });
  });

  /* ---------- Reveal ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: "0px 0px -7% 0px" });
  Array.prototype.forEach.call(document.querySelectorAll(".reveal"), function (el) { io.observe(el); });

  /* ============================================================
     THE FIELD — person performing natural gestures in front of a wall
     with the UI projected onto it. Calm, flash-free, reduced-motion aware.
     ============================================================ */
  function fieldDemo() {
    var stage = document.querySelector(".field-stage");
    var canvas = document.getElementById("field");
    if (!canvas || !stage) return;
    var ctx = canvas.getContext("2d");
    var w, h, dpr;
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var tiles = [];      // projected UI items on the wall
    var panel = {};      // projected UI panel bounds
    var person = {};     // silhouette anchor

    function layout() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // projected UI panel sits on the upper-right of the wall
      panel = { x: w * 0.40, y: h * 0.14, w: w * 0.50, h: h * 0.50 };
      var pad = panel.w * 0.07;
      var headerH = panel.h * 0.20;
      var listTop = panel.y + headerH + pad * 0.6;
      var rowGap = pad * 0.55;
      var n = 3;
      var rowH = (panel.y + panel.h - listTop - pad - rowGap * (n - 1)) / n;
      var labels = ["Explore the collection", "Find your way", "Today at the museum"];
      tiles = [];
      for (var i = 0; i < n; i++) {
        tiles.push({
          x: panel.x + pad, y: listTop + i * (rowH + rowGap),
          w: panel.w - pad * 2, h: rowH,
          label: labels[i], sel: 0
        });
      }
      panel.pad = pad; panel.headerH = headerH;

      // person stands on the floor to the lower-left
      person = {
        floorY: h * 0.88,
        x: w * 0.17,
        headR: Math.max(10, h * 0.052),
        shoulderY: h * 0.50,
        hipY: h * 0.74
      };
    }
    layout();
    window.addEventListener("resize", function () { layout(); if (reduce) draw(0, lastTarget()); });

    // ---- gesture loop state ----
    var idx = 0, target = 1;          // moving from tile idx -> target
    var phase = "move";               // move | dwell
    var t0 = performance.now();
    var moveDur = 1500, dwellDur = 1600;
    var finger = { x: 0, y: 0 };
    var dashOff = 0;

    function center(t) { return { x: t.x + t.w * 0.5, y: t.y + t.h * 0.5 }; }
    function easeInOut(p) { return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; }
    function lastTarget() { return tiles[1] || tiles[0]; }

    if (tiles.length) { var c0 = center(tiles[idx]); finger.x = c0.x; finger.y = c0.y; }

    function roundRect(x, y, ww, hh, r) {
      r = Math.min(r, ww / 2, hh / 2);
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + ww, y, x + ww, y + hh, r);
      ctx.arcTo(x + ww, y + hh, x, y + hh, r);
      ctx.arcTo(x, y + hh, x, y, r);
      ctx.arcTo(x, y, x + ww, y, r);
      ctx.closePath();
    }

    // ---------- drawing ----------
    function drawWall() {
      var g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "#18222e");
      g.addColorStop(0.74, "#111a23");
      g.addColorStop(0.741, "#0e151c");
      g.addColorStop(1, "#0b1117");
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      // soft floor line
      ctx.strokeStyle = "rgba(255,255,255,0.05)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, h * 0.74); ctx.lineTo(w, h * 0.74); ctx.stroke();
    }

    function drawProjectionGlow() {
      // soft halo behind the panel to read as projected light
      var cx = panel.x + panel.w * 0.5, cy = panel.y + panel.h * 0.5;
      var rad = Math.max(panel.w, panel.h) * 0.85;
      var g = ctx.createRadialGradient(cx, cy, rad * 0.2, cx, cy, rad);
      g.addColorStop(0, "rgba(45,214,140,0.10)");
      g.addColorStop(1, "rgba(45,214,140,0)");
      ctx.fillStyle = g;
      ctx.fillRect(panel.x - rad, panel.y - rad, panel.w + rad * 2, panel.h + rad * 2);
    }

    function drawPanel() {
      // panel body
      roundRect(panel.x, panel.y, panel.w, panel.h, 16);
      ctx.fillStyle = "rgba(20,32,42,0.66)"; ctx.fill();
      ctx.lineWidth = 1.5; ctx.strokeStyle = "rgba(45,214,140,0.45)"; ctx.stroke();

      // header text
      ctx.fillStyle = "rgba(45,214,140,0.95)";
      ctx.font = "600 " + Math.round(h * 0.026) + "px " + monoFont();
      ctx.textBaseline = "middle";
      ctx.fillText("WELCOME", panel.x + panel.pad, panel.y + panel.headerH * 0.5);
      ctx.fillStyle = "rgba(205,220,232,0.55)";
      ctx.font = "400 " + Math.round(h * 0.02) + "px " + monoFont();
      ctx.fillText("Point at an option to begin", panel.x + panel.pad, panel.y + panel.headerH * 0.5 + h * 0.04);

      // tiles
      tiles.forEach(function (t, i) {
        var goal = (i === target && phase === "dwell") ? dwellProg : (t.held ? 1 : 0);
        t.sel += (goal - t.sel) * 0.12;            // smooth, no abrupt change
        roundRect(t.x, t.y, t.w, t.h, 11);
        ctx.fillStyle = "rgba(255,255,255," + (0.04 + t.sel * 0.12) + ")";
        ctx.fill();
        ctx.lineWidth = 1.4;
        ctx.strokeStyle = "rgba(45,214,140," + (0.22 + t.sel * 0.6) + ")";
        ctx.stroke();
        // label
        ctx.fillStyle = "rgba(225,238,248," + (0.62 + t.sel * 0.38) + ")";
        ctx.font = "500 " + Math.round(h * 0.024) + "px " + sysFont();
        ctx.textBaseline = "middle";
        ctx.fillText(t.label, t.x + t.w * 0.06, t.y + t.h * 0.5);
        // chevron
        var cxr = t.x + t.w - t.w * 0.06, cyr = t.y + t.h * 0.5;
        ctx.strokeStyle = "rgba(45,214,140," + (0.4 + t.sel * 0.6) + ")"; ctx.lineWidth = 2; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(cxr - 6, cyr - 5); ctx.lineTo(cxr, cyr); ctx.lineTo(cxr - 6, cyr + 5); ctx.stroke();
      });
    }

    function drawBeam() {
      // gentle dotted beam from fingertip to active tile
      var c = center(tiles[phase === "dwell" ? target : target]);
      ctx.save();
      ctx.setLineDash([2, 7]);
      ctx.lineDashOffset = -dashOff;
      ctx.strokeStyle = "rgba(45,214,140,0.32)";
      ctx.lineWidth = 1.4; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(finger.x, finger.y); ctx.lineTo(c.x, c.y); ctx.stroke();
      ctx.restore();
    }

    function drawPerson() {
      var p = person;
      ctx.save();
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      var bodyCol = "rgba(28,40,52,0.96)";
      var rim = "rgba(45,214,140,0.5)";

      // torso (shoulders -> hips), tapered
      var shoulderHalf = p.headR * 1.35;
      ctx.fillStyle = bodyCol;
      ctx.beginPath();
      ctx.moveTo(p.x - shoulderHalf, p.shoulderY);
      ctx.lineTo(p.x + shoulderHalf, p.shoulderY);
      ctx.lineTo(p.x + shoulderHalf * 0.78, p.hipY);
      ctx.lineTo(p.x - shoulderHalf * 0.78, p.hipY);
      ctx.closePath(); ctx.fill();

      // legs
      ctx.strokeStyle = bodyCol; ctx.lineWidth = p.headR * 0.7;
      ctx.beginPath(); ctx.moveTo(p.x - shoulderHalf * 0.42, p.hipY); ctx.lineTo(p.x - shoulderHalf * 0.5, p.floorY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(p.x + shoulderHalf * 0.42, p.hipY); ctx.lineTo(p.x + shoulderHalf * 0.5, p.floorY); ctx.stroke();

      // head
      ctx.fillStyle = bodyCol;
      ctx.beginPath(); ctx.arc(p.x, p.shoulderY - p.headR * 1.5, p.headR, 0, Math.PI * 2); ctx.fill();

      // resting arm (down the side)
      ctx.strokeStyle = bodyCol; ctx.lineWidth = p.headR * 0.66;
      ctx.beginPath();
      ctx.moveTo(p.x - shoulderHalf * 0.85, p.shoulderY + p.headR * 0.2);
      ctx.lineTo(p.x - shoulderHalf * 0.95, p.hipY - p.headR * 0.2);
      ctx.stroke();

      // raised gesturing arm: shoulder -> elbow -> fingertip
      var sx = p.x + shoulderHalf * 0.7, sy = p.shoulderY + p.headR * 0.15;
      var ex = sx + (finger.x - sx) * 0.45, ey = sy + (finger.y - sy) * 0.42 + p.headR * 0.3;
      ctx.lineWidth = p.headR * 0.62; ctx.strokeStyle = bodyCol;
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.quadraticCurveTo(ex, ey, finger.x, finger.y); ctx.stroke();
      // green rim light along the gesturing arm
      ctx.lineWidth = p.headR * 0.16; ctx.strokeStyle = rim;
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.quadraticCurveTo(ex, ey, finger.x, finger.y); ctx.stroke();
      ctx.restore();
    }

    function drawFinger() {
      // proximity marker at the fingertip + soft dwell ring
      var dwell = (phase === "dwell") ? dwellProg : 0;
      var g = ctx.createRadialGradient(finger.x, finger.y, 0, finger.x, finger.y, 26);
      g.addColorStop(0, "rgba(45,214,140,0.5)");
      g.addColorStop(1, "rgba(45,214,140,0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(finger.x, finger.y, 26, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(finger.x, finger.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(230,255,243,0.95)"; ctx.fill();
      if (dwell > 0.001) {
        ctx.beginPath();
        ctx.arc(finger.x, finger.y, 13, -Math.PI / 2, -Math.PI / 2 + dwell * Math.PI * 2);
        ctx.strokeStyle = "rgba(45,214,140,0.85)"; ctx.lineWidth = 2.5; ctx.lineCap = "round"; ctx.stroke();
      }
    }

    var dwellProg = 0;
    function draw(now, staticTarget) {
      ctx.clearRect(0, 0, w, h);
      drawWall();
      drawProjectionGlow();
      drawBeam();
      drawPanel();
      drawPerson();
      drawFinger();
    }

    function step(now) {
      if (window.__hvPause) { requestAnimationFrame(step); return; }
      var elapsed = now - t0;
      if (phase === "move") {
        var p = Math.min(1, elapsed / moveDur);
        var e = easeInOut(p);
        var a = center(tiles[idx]), b = center(tiles[target]);
        finger.x = a.x + (b.x - a.x) * e;
        finger.y = a.y + (b.y - a.y) * e;
        dwellProg = 0;
        if (p >= 1) { phase = "dwell"; t0 = now; }
      } else { // dwell
        var pd = Math.min(1, elapsed / dwellDur);
        dwellProg = easeInOut(pd);
        if (pd >= 1) {
          tiles.forEach(function (t, i) { t.held = (i === target); });
          idx = target; target = (target + 1) % tiles.length;
          phase = "move"; t0 = now; dwellProg = 0;
        }
      }
      dashOff = (dashOff + 0.25) % 1000;
      draw(now);
      requestAnimationFrame(step);
    }

    function sysFont() { return "system-ui, -apple-system, Segoe UI, sans-serif"; }
    function monoFont() { return "ui-monospace, Menlo, Consolas, monospace"; }

    if (reduce) {
      // single calm frame: hand resting on the first option, gently highlighted
      var c = center(tiles[0]); finger.x = c.x; finger.y = c.y;
      tiles[0].held = true; tiles[0].sel = 1; dwellProg = 0;
      draw(0);
    } else {
      requestAnimationFrame(step);
    }
  }

  /* ============================================================
     SURFACEWARE pipeline — deterministic point field + scan
     ============================================================ */
  function pipeStage() {
    var canvas = document.getElementById("depthCloud");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var w, h, dpr, pts = [];
    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      pts = [];
      var N = Math.round((w * h) / 1300);
      for (var i = 0; i < N; i++) pts.push({ x: Math.random() * w, y: Math.random() * h, z: Math.random(), s: Math.random() * Math.PI * 2 });
    }
    resize();
    window.addEventListener("resize", resize);
    var mx = 0.5, my = 0.5;
    canvas.parentElement.addEventListener("pointermove", function (e) {
      var r = canvas.getBoundingClientRect();
      mx = (e.clientX - r.left) / r.width; my = (e.clientY - r.top) / r.height;
    });
    function frame(t) {
      ctx.clearRect(0, 0, w, h);
      var cx = w * (0.35 + mx * 0.3), cy = h * (0.35 + my * 0.3);
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i]; p.s += 0.01;
        var dist = Math.hypot(p.x - cx, p.y - cy);
        var near = Math.max(0, 1 - dist / (w * 0.5));
        var a = (0.08 + p.z * 0.3) * (0.5 + near);
        var size = (0.6 + p.z * 1.5) * (0.8 + (0.5 + 0.5 * Math.sin(p.s + p.z * 6)) * 0.6);
        var g = Math.round(150 + near * 80);
        ctx.beginPath();
        ctx.fillStyle = "rgba(45," + (190 + Math.round(near * 30)) + "," + g + "," + a + ")";
        ctx.arc(p.x, p.y + Math.sin(p.s) * 2, size, 0, Math.PI * 2); ctx.fill();
      }
      var sy = (Math.sin(t / 1700) * 0.5 + 0.5) * h;
      var grad = ctx.createLinearGradient(0, sy - 44, 0, sy + 44);
      grad.addColorStop(0, "rgba(45,214,140,0)");
      grad.addColorStop(0.5, "rgba(45,214,140,0.10)");
      grad.addColorStop(1, "rgba(45,214,140,0)");
      ctx.fillStyle = grad; ctx.fillRect(0, sy - 44, w, 88);
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* ============================================================
     DIVI STRUCTURE OVERLAY
     ============================================================ */
  function diviOverlay() {
    var fab = document.getElementById("diviFab");
    if (!fab) return;
    var tags = [];
    function clearTags() { tags.forEach(function (t) { t.remove(); }); tags = []; }
    function placeTags() {
      clearTags();
      if (!document.body.classList.contains("divi-on")) return;
      Array.prototype.forEach.call(document.querySelectorAll("[data-divi]"), function (el) {
        var kind = el.getAttribute("data-divi");
        var label = el.getAttribute("data-divi-label") || kind;
        var tag = document.createElement("span");
        tag.className = "divi-tag t-" + kind;
        tag.textContent = (kind === "section" ? "\u25A3 SECTION \u00B7 " : kind === "row" ? "\u25A6 ROW \u00B7 " : "\u25AA ") + label;
        if (getComputedStyle(el).position === "static") el.style.position = "relative";
        if (kind === "row") tag.style.left = "8px";
        if (kind === "module") tag.style.left = "4px";
        el.appendChild(tag);
        tags.push(tag);
      });
    }
    fab.addEventListener("click", function () {
      document.body.classList.toggle("divi-on");
      var on = document.body.classList.contains("divi-on");
      fab.querySelector(".lbl").textContent = on ? "Hide Divi structure" : "Show Divi structure";
      placeTags();
    });
    window.addEventListener("resize", function () { if (document.body.classList.contains("divi-on")) placeTags(); });
  }

  var yr = document.getElementById("year");
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- Hero video: ensure autoplay + honor reduce-motion ---------- */
  var heroVideo = document.querySelector(".field-video");
  if (heroVideo) {
    var tryPlay = function () { var p = heroVideo.play(); if (p && p.catch) p.catch(function () {}); };
    tryPlay();
    heroVideo.addEventListener("canplay", tryPlay, { once: true });
    var mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) heroVideo.pause();
    // Tweaks panel toggles window.__hvPause
    setInterval(function () {
      if (window.__hvPause && !heroVideo.paused) heroVideo.pause();
      else if (!window.__hvPause && heroVideo.paused && !mq.matches) tryPlay();
    }, 400);
  }

  fieldDemo();
  pipeStage();
  diviOverlay();
})();

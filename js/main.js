/* ==========================================================================
   Ahmed Al-Humaid — Portfolio
   Vanilla JS, no dependencies.
   ========================================================================== */
(() => {
  "use strict";

  // Update this with your public LinkedIn profile URL.
  const LINKEDIN_URL = "https://www.linkedin.com/search/results/people/?keywords=Ahmed%20Khaled%20Al-Humaid";
  const EMAIL = "humaidakah@gmail.com";

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const rand = (a, b) => a + Math.random() * (b - a);
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const COLORS = ["#7cf7d4", "#7c8cff", "#ff6ad5"];

  // Start off-screen so nothing reacts until the visitor actually moves.
  const mouse = { x: -9999, y: -9999 };
  addEventListener("pointermove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
  const releaseTouch = (e) => { if (e.pointerType !== "mouse") { mouse.x = mouse.y = -9999; } };
  addEventListener("pointerup", releaseTouch, { passive: true });
  addEventListener("pointercancel", releaseTouch, { passive: true });

  /* Run a callback on every frame only while the element is on screen. */
  function whileVisible(el, fn) {
    let raf = 0, on = false;
    const loop = (t) => { fn(t); raf = requestAnimationFrame(loop); };
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !on) { on = true; raf = requestAnimationFrame(loop); }
      else if (!e.isIntersecting && on) { on = false; cancelAnimationFrame(raf); }
    }).observe(el);
  }

  function onceVisible(els, fn, opts = { threshold: 0.2 }) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { fn(e.target); io.unobserve(e.target); } });
    }, opts);
    els.forEach((el) => io.observe(el));
  }

  function fitCanvas(canvas) {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const r = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, Math.round(r.width * dpr));
    canvas.height = Math.max(1, Math.round(r.height * dpr));
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, w: r.width, h: r.height };
  }

  /* ---------------------------------------------------------------- Loader */
  function runLoader(done) {
    const bar = $("#loaderBar"), count = $("#loaderCount"), loader = $("#loader");
    document.body.classList.add("loading");
    const dur = reduced ? 200 : 1600, start = performance.now();
    const tick = (t) => {
      const p = clamp((t - start) / dur, 0, 1);
      const e = 1 - Math.pow(1 - p, 3);
      bar.style.width = e * 100 + "%";
      count.textContent = Math.round(e * 100);
      if (p < 1) requestAnimationFrame(tick);
      else {
        loader.classList.add("done");
        document.body.classList.remove("loading");
        setTimeout(() => { document.body.classList.add("ready"); done(); }, 350);
        setTimeout(() => loader.remove(), 1400);
      }
    };
    requestAnimationFrame(tick);
  }

  /* ---------------------------------------------------------------- Cursor */
  function initCursor() {
    if (!finePointer) return;
    const dot = $("#cursor"), ring = $("#cursorRing"), label = $("#cursorLabel");
    let rx = mouse.x, ry = mouse.y;
    dot.style.opacity = ring.style.opacity = 0;
    addEventListener("pointermove", (e) => {
      rx = e.clientX; ry = e.clientY; dot.style.opacity = ring.style.opacity = 1;
    }, { once: true });
    (function loop() {
      rx = lerp(rx, mouse.x, 0.16); ry = lerp(ry, mouse.y, 0.16);
      dot.style.transform = `translate(${mouse.x}px, ${mouse.y}px)`;
      ring.style.transform = `translate(${rx}px, ${ry}px)`;
      requestAnimationFrame(loop);
    })();
    document.addEventListener("pointerover", (e) => {
      const t = e.target.closest("[data-cursor], a, button, input");
      ring.classList.remove("is-label", "is-hover");
      if (!t) return;
      if (t.dataset.cursor) { label.textContent = t.dataset.cursor; ring.classList.add("is-label"); }
      else ring.classList.add("is-hover");
    });
    document.addEventListener("pointerleave", () => { dot.style.opacity = ring.style.opacity = 0; });
    document.addEventListener("pointerenter", () => { dot.style.opacity = ring.style.opacity = 1; });
  }

  function initMagnetic() {
    if (!finePointer) return;
    $$(".magnetic").forEach((el) => {
      const inner = el.querySelector("span");
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * 0.3}px, ${y * 0.4}px)`;
        if (inner) inner.style.transform = `translate(${x * 0.12}px, ${y * 0.15}px)`;
      });
      el.addEventListener("pointerleave", () => {
        el.style.transform = ""; if (inner) inner.style.transform = "";
      });
    });
  }

  /* ------------------------------------------------------------- Scramble */
  const GLYPHS = "!<>-_\\/[]{}—=+*^?#01";
  function scramble(el, to, dur = 700) {
    const from = el.textContent, len = Math.max(from.length, to.length);
    const q = [];
    for (let i = 0; i < len; i++) {
      const s = Math.floor(Math.random() * dur * 0.4), e = s + Math.floor(Math.random() * dur * 0.6);
      q.push({ from: from[i] || "", to: to[i] || "", s, e });
    }
    const t0 = performance.now();
    cancelAnimationFrame(el._scr);
    const step = (t) => {
      const dt = t - t0; let out = "", done = 0;
      for (const c of q) {
        if (dt >= c.e) { done++; out += c.to; }
        else if (dt >= c.s) out += `<span class="t-a1">${GLYPHS[(Math.random() * GLYPHS.length) | 0]}</span>`;
        else out += c.from;
      }
      el.innerHTML = out;
      if (done < q.length) el._scr = requestAnimationFrame(step);
      else el.textContent = to;
    };
    el._scr = requestAnimationFrame(step);
  }

  function initRoles() {
    const el = $("#roleText");
    const roles = ["Software Engineer", "Full-Stack Developer", "Cloud Engineer", "Distributed Systems Nerd", "Flutter Developer", "DevOps Enthusiast"];
    let i = 0;
    setInterval(() => { i = (i + 1) % roles.length; scramble(el, roles[i], 900); }, 2800);
  }

  /* ------------------------------------------------------------------ Nav */
  function initNav() {
    const nav = $("#nav"), progress = $("#progress");
    let lastY = scrollY;
    const links = $$(".nav__links a");
    const sections = links.map((a) => $(a.getAttribute("href"))).filter(Boolean);

    addEventListener("scroll", () => {
      const y = scrollY;
      nav.classList.toggle("scrolled", y > 40);
      nav.classList.toggle("hidden", y > lastY && y > 400 && !nav.classList.contains("open"));
      lastY = y;
      const max = document.documentElement.scrollHeight - innerHeight;
      progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
      let current = null;
      sections.forEach((s) => { if (s.getBoundingClientRect().top < innerHeight * 0.4) current = s.id; });
      links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + current));
    }, { passive: true });

    $("#burger").addEventListener("click", () => nav.classList.toggle("open"));
    links.forEach((a) => {
      a.addEventListener("click", () => nav.classList.remove("open"));
      const txt = a.textContent;
      a.addEventListener("pointerenter", () => scramble(a, txt, 450));
    });
  }

  /* --------------------------------------------------------- Hero name */
  function mix(a, b, t) {
    const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
    const r = Math.round(lerp(pa >> 16, pb >> 16, t)), g = Math.round(lerp((pa >> 8) & 255, (pb >> 8) & 255, t)), bl = Math.round(lerp(pa & 255, pb & 255, t));
    return `rgb(${r},${g},${bl})`;
  }
  const gradAt = (t) => (t < 0.5 ? mix(COLORS[0], COLORS[1], t * 2) : mix(COLORS[1], COLORS[2], (t - 0.5) * 2));

  // Split the name into letters: an outer span for the entrance, an inner one for the cursor wave.
  function initHeroName() {
    const name = $("#heroName");
    let idx = 0;
    $$("[data-letters]", name).forEach((line) => {
      const chars = [...line.textContent];
      const grad = line.classList.contains("hero__line--grad");
      line.innerHTML = chars.map((c, i) => {
        const style = grad ? ` style="color:${gradAt(i / Math.max(1, chars.length - 1))}"` : "";
        return c === " "
          ? `<span class="ch ch--space"> </span>`
          : `<span class="ch" style="transition-delay:${(idx++ * 0.045).toFixed(3)}s"><span class="ch__i"${style}>${c}</span></span>`;
      }).join("");
    });
    // Shrink the font only if the longest line would overflow the screen.
    const fit = () => {
      name.style.fontSize = "";
      const avail = document.documentElement.clientWidth * 0.92;
      const widest = Math.max(...$$(".hero__line", name).map((l) => l.scrollWidth));
      if (widest > avail) name.style.fontSize = parseFloat(getComputedStyle(name).fontSize) * (avail / widest) + "px";
    };
    fit();
    addEventListener("resize", fit);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);

    if (!finePointer || reduced) return;

    const letters = $$(".ch__i", name);
    let centers = [];
    const measure = () => {
      centers = letters.map((l) => { const r = l.parentElement.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
    };
    addEventListener("resize", measure);
    addEventListener("scroll", measure, { passive: true });
    setTimeout(measure, 1500);
    whileVisible(name, () => {
      if (!centers.length) return;
      letters.forEach((l, i) => {
        const dx = mouse.x - centers[i][0], dy = mouse.y - centers[i][1];
        const f = Math.max(0, 1 - Math.hypot(dx, dy) / 260);
        const e = f * f * (3 - 2 * f);
        l.style.transform = `translateY(${-e * 22}px) scale(${1 + e * 0.12}) rotate(${-dx * e * 0.03}deg)`;
        l.style.textShadow = e > 0.05 ? `0 0 ${30 * e}px rgba(124,247,212,${0.6 * e})` : "";
      });
    });
  }

  /* ------------------------------------------ Hero interactive constellation */
  function initHero() {
    const canvas = $("#heroCanvas"), hero = $(".hero");
    let ctx, W, H, nodes = [], sparks = [];
    const resize = () => {
      ({ ctx, w: W, h: H } = fitCanvas(canvas));
      const n = Math.round(clamp((W * H) / 9000, 40, 150));
      nodes = Array.from({ length: n }, () => ({
        x: rand(0, W), y: rand(0, H), vx: rand(-0.3, 0.3), vy: rand(-0.3, 0.3),
        r: rand(1, 2.2), c: COLORS[(Math.random() * 3) | 0],
      }));
    };
    let t0; addEventListener("resize", () => { clearTimeout(t0); t0 = setTimeout(resize, 150); });
    resize();

    // Click anywhere in the hero for a burst of sparks.
    hero.addEventListener("click", (e) => {
      if (e.target.closest("a, button")) return;
      const r = canvas.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      for (let i = 0; i < 40; i++) {
        const a = rand(0, Math.PI * 2), sp = rand(2, 9);
        sparks.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1, c: COLORS[i % 3] });
      }
      nodes.forEach((n) => {
        const dx = n.x - x, dy = n.y - y, d = Math.hypot(dx, dy) || 1;
        if (d < 260) { n.vx += (dx / d) * (260 - d) * 0.04; n.vy += (dy / d) * (260 - d) * 0.04; }
      });
    });

    const LINK = 130;
    whileVisible(hero, () => {
      ctx.clearRect(0, 0, W, H);
      const r = canvas.getBoundingClientRect(), mx = mouse.x - r.left, my = mouse.y - r.top;
      for (const n of nodes) {
        const dx = mx - n.x, dy = my - n.y, d = Math.hypot(dx, dy);
        if (d < 220 && !reduced) { n.vx += (dx / d) * 0.02; n.vy += (dy / d) * 0.02; }
        n.vx *= 0.985; n.vy *= 0.985;
        if (Math.hypot(n.vx, n.vy) < 0.15) { n.vx += rand(-0.05, 0.05); n.vy += rand(-0.05, 0.05); }
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > W) { n.vx *= -1; n.x = clamp(n.x, 0, W); }
        if (n.y < 0 || n.y > H) { n.vy *= -1; n.y = clamp(n.y, 0, H); }
      }
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j], dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy;
          if (d2 < LINK * LINK) {
            ctx.strokeStyle = `rgba(124,140,255,${(1 - Math.sqrt(d2) / LINK) * 0.28})`;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
        const d = Math.hypot(a.x - mx, a.y - my);
        if (d < 200) {
          ctx.strokeStyle = `rgba(124,247,212,${(1 - d / 200) * 0.6})`;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mx, my); ctx.stroke();
        }
      }
      for (const n of nodes) {
        ctx.fillStyle = n.c; ctx.globalAlpha = 0.85;
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fill();
      }
      sparks = sparks.filter((s) => {
        s.vx *= 0.94; s.vy *= 0.94; s.x += s.vx; s.y += s.vy; s.life -= 0.02;
        ctx.globalAlpha = Math.max(0, s.life); ctx.fillStyle = s.c;
        ctx.beginPath(); ctx.arc(s.x, s.y, 2 * s.life + 0.5, 0, Math.PI * 2); ctx.fill();
        return s.life > 0;
      });
      ctx.globalAlpha = 1;
    });
  }

  /* ------------------------------------------------------- Split headings */
  function initSplits() {
    $$("[data-split]").forEach((el) => {
      const words = el.textContent.split(" ");
      el.innerHTML = words.map((w) => `<span class="word">${[...w].map((c) => `<span class="char">${c}</span>`).join("")}</span>`).join(" ");
      $$(".char", el).forEach((c, i) => (c.style.transitionDelay = i * 0.03 + "s"));
    });
    onceVisible($$("[data-split], .reveal, .contact__title"), (el) => el.classList.add("in"), { threshold: 0.15 });
  }

  /* ------------------------------------------------ About scroll-lit text */
  function initAbout() {
    const el = $("#aboutText");
    const hl = /^(KFUPM|software|full-stack|cloud|AWS,|GCP,|Docker,|CI\/CD,|distributed|engineer\.|web|mobile)/i;
    el.innerHTML = el.textContent.trim().split(/\s+/).map((w) => `<span class="w${hl.test(w) ? " hl" : ""}">${w}</span>`).join(" ");
    const ws = $$(".w", el);
    const update = () => {
      const r = el.getBoundingClientRect();
      const p = clamp((innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.35), 0, 1);
      const n = Math.round(p * ws.length);
      ws.forEach((w, i) => w.classList.toggle("lit", i < n));
    };
    addEventListener("scroll", update, { passive: true });
    update();
  }

  /* ------------------------------------------------------------- Counters */
  function initCounters() {
    onceVisible($$("[data-count]"), (el) => {
      const to = parseFloat(el.dataset.count), dec = +el.dataset.decimals || 0;
      const t0 = performance.now(), dur = 2000;
      const step = (t) => {
        const p = clamp((t - t0) / dur, 0, 1), e = 1 - Math.pow(1 - p, 4);
        el.textContent = (to * e).toFixed(dec);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.6 });

    onceVisible($$(".gauge"), (g) => {
      const c = $(".gauge__fill", g), C = 2 * Math.PI * 52;
      c.style.strokeDashoffset = C * (1 - g.dataset.value / g.dataset.max);
    }, { threshold: 0.5 });
  }

  /* --------------------------------------------------- Timeline + dashboard */
  function initTimeline() {
    const tl = $("#timeline"), fill = $("#timelineFill");
    const update = () => {
      const r = tl.getBoundingClientRect();
      const p = clamp((innerHeight * 0.6 - r.top) / r.height, 0, 1);
      fill.style.height = p * 100 + "%";
    };
    addEventListener("scroll", update, { passive: true }); update();

    const bars = $("#dashBars");
    for (let i = 0; i < 18; i++) bars.appendChild(document.createElement("i"));
    const shuffle = () => $$("i", bars).forEach((b, i) => (b.style.height = clamp(20 + Math.sin(i / 2.2) * 30 + rand(0, 45), 8, 100) + "%"));
    onceVisible([bars], () => { shuffle(); setInterval(shuffle, 2400); }, { threshold: 0.5 });
  }

  /* ----------------------------------------------------- Tilt + spotlight */
  function initTilt() {
    document.addEventListener("pointermove", (e) => {
      const el = e.target.closest && e.target.closest(".spotlight");
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", e.clientX - r.left + "px");
      el.style.setProperty("--my", e.clientY - r.top + "px");
    }, { passive: true });

    if (!finePointer || reduced) return;
    $$(".tilt").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transition = "transform .1s linear";
        el.style.transform = `perspective(900px) rotateX(${-y * 10}deg) rotateY(${x * 12}deg) scale(1.02)`;
      });
      el.addEventListener("pointerleave", () => {
        el.style.transition = ""; el.style.transform = "";
      });
    });
  }

  /* ------------------------------------------------ Project visualisations */
  const VIZ = {
    // FaaS: requests flow from a gateway into containers that spin up on demand
    faas(canvas) {
      let ctx, w, h, boxes = [], packets = [];
      const setup = () => {
        ({ ctx, w, h } = fitCanvas(canvas));
        boxes = [];
        const cols = 4, rows = 3, bw = 34, gx = w * 0.42, gy = h / 2 - ((rows - 1) * 46) / 2;
        for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) boxes.push({ x: gx + c * 50, y: gy + r * 46, s: bw, heat: 0 });
      };
      setup(); addEventListener("resize", setup);
      let last = 0;
      whileVisible(canvas, (t) => {
        ctx.clearRect(0, 0, w, h);
        const gw = { x: w * 0.14, y: h / 2 };
        if (t - last > 260) {
          last = t;
          packets.push({ b: boxes[(Math.random() * boxes.length) | 0], p: 0 });
        }
        // gateway
        ctx.strokeStyle = "rgba(124,247,212,.8)"; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(gw.x, gw.y, 20, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = "#7cf7d4"; ctx.font = "600 10px JetBrains Mono, monospace"; ctx.textAlign = "center";
        ctx.fillText("λ", gw.x, gw.y + 4);
        ctx.fillStyle = "rgba(139,147,167,.9)"; ctx.fillText("gateway", gw.x, gw.y + 36);
        // links + packets
        packets = packets.filter((k) => {
          k.p += 0.025;
          const bx = k.b.x + k.b.s / 2, by = k.b.y + k.b.s / 2;
          const x = lerp(gw.x + 20, bx, k.p), y = lerp(gw.y, by, k.p);
          ctx.strokeStyle = "rgba(124,140,255,.15)"; ctx.beginPath(); ctx.moveTo(gw.x + 20, gw.y); ctx.lineTo(bx, by); ctx.stroke();
          ctx.fillStyle = "#7c8cff"; ctx.beginPath(); ctx.arc(x, y, 2.6, 0, Math.PI * 2); ctx.fill();
          if (k.p >= 1) { k.b.heat = 1; return false; }
          return true;
        });
        for (const b of boxes) {
          b.heat *= 0.965;
          ctx.fillStyle = `rgba(124,247,212,${0.05 + b.heat * 0.55})`;
          ctx.strokeStyle = `rgba(124,247,212,${0.25 + b.heat * 0.75})`;
          roundRect(ctx, b.x, b.y, b.s, b.s, 7); ctx.fill(); ctx.stroke();
          ctx.fillStyle = `rgba(5,6,10,${0.4 + b.heat * 0.6})`;
          ctx.fillRect(b.x + 8, b.y + b.s / 2 - 1, b.s - 16, 2);
        }
        ctx.fillStyle = "rgba(139,147,167,.9)"; ctx.textAlign = "left";
        ctx.fillText("faasd · docker", boxes[0].x, boxes[0].y - 12);
      });
    },

    // CDN: rotating dotted globe with edge locations pulsing from an origin
    cdn(canvas) {
      let ctx, w, h;
      const setup = () => ({ ctx, w, h } = fitCanvas(canvas));
      setup(); addEventListener("resize", setup);
      const pts = [];
      const N = 420;
      for (let i = 0; i < N; i++) {
        const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = i * 2.399963;
        pts.push([Math.cos(th) * r, y, Math.sin(th) * r]);
      }
      const edges = [20, 77, 140, 199, 251, 310, 366].map((i) => pts[i]);
      whileVisible(canvas, (t) => {
        ctx.clearRect(0, 0, w, h);
        const R = Math.min(w, h) * 0.38, cx = w / 2, cy = h / 2 + 4, a = t / 4000;
        const proj = ([x, y, z]) => {
          const X = x * Math.cos(a) - z * Math.sin(a), Z = x * Math.sin(a) + z * Math.cos(a);
          const ty = 0.35, Y = y * Math.cos(ty) - Z * Math.sin(ty), Z2 = y * Math.sin(ty) + Z * Math.cos(ty);
          return [cx + X * R, cy + Y * R, Z2];
        };
        for (const p of pts) {
          const [x, y, z] = proj(p);
          ctx.fillStyle = `rgba(124,140,255,${z < 0 ? 0.55 : 0.1})`;
          ctx.fillRect(x, y, 1.6, 1.6);
        }
        const origin = [cx, cy];
        edges.forEach((e, i) => {
          const [x, y, z] = proj(e);
          if (z > 0.1) return;
          const ph = ((t / 1200 + i * 0.37) % 1);
          ctx.strokeStyle = "rgba(124,247,212,.25)"; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(origin[0], origin[1]);
          const mx = (origin[0] + x) / 2, my = (origin[1] + y) / 2 - 30;
          ctx.quadraticCurveTo(mx, my, x, y); ctx.stroke();
          const q = ph, bx = (1 - q) * (1 - q) * origin[0] + 2 * (1 - q) * q * mx + q * q * x, by = (1 - q) * (1 - q) * origin[1] + 2 * (1 - q) * q * my + q * q * y;
          ctx.fillStyle = "#7cf7d4"; ctx.beginPath(); ctx.arc(bx, by, 2.2, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = `rgba(255,106,213,${1 - ph})`; ctx.beginPath(); ctx.arc(x, y, 3 + ph * 10, 0, Math.PI * 2); ctx.stroke();
          ctx.fillStyle = "#ff6ad5"; ctx.beginPath(); ctx.arc(x, y, 2.5, 0, Math.PI * 2); ctx.fill();
        });
        ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2); ctx.fill();
        ctx.font = "600 10px JetBrains Mono, monospace"; ctx.fillStyle = "rgba(139,147,167,.9)"; ctx.textAlign = "center";
        ctx.fillText("S3 origin → CloudFront edges", cx, h - 12);
      });
    },

    // Solar telemetry: UDP packets from 3 edges, some drop & retry, live sparkline
    solar(canvas) {
      let ctx, w, h;
      const setup = () => ({ ctx, w, h } = fitCanvas(canvas));
      setup(); addEventListener("resize", setup);
      let packets = [], series = Array.from({ length: 60 }, (_, i) => 0.5 + Math.sin(i / 6) * 0.2), last = 0, flash = 0;
      whileVisible(canvas, (t) => {
        ctx.clearRect(0, 0, w, h);
        const edges = [0, 1, 2].map((i) => ({ x: w * 0.12, y: h * 0.18 + i * h * 0.2 }));
        const col = { x: w * 0.62, y: h * 0.38 };
        if (t - last > 380) {
          last = t;
          const e = (Math.random() * 3) | 0;
          packets.push({ e, p: 0, drop: Math.random() < 0.22, retry: false });
        }
        ctx.font = "600 10px JetBrains Mono, monospace"; ctx.textAlign = "left";
        edges.forEach((e, i) => {
          ctx.strokeStyle = "rgba(255,255,255,.08)"; ctx.setLineDash([3, 4]);
          ctx.beginPath(); ctx.moveTo(e.x + 12, e.y); ctx.lineTo(col.x - 18, col.y); ctx.stroke(); ctx.setLineDash([]);
          // solar panel glyph
          ctx.fillStyle = "rgba(124,140,255,.25)"; ctx.strokeStyle = "#7c8cff";
          ctx.save(); ctx.translate(e.x, e.y); ctx.transform(1, 0, -0.35, 1, 0, 0);
          ctx.fillRect(-12, -8, 24, 16); ctx.strokeRect(-12, -8, 24, 16);
          ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(0, 8); ctx.moveTo(-12, 0); ctx.lineTo(12, 0); ctx.stroke();
          ctx.restore();
          ctx.fillStyle = "rgba(139,147,167,.9)"; ctx.fillText("edge-" + (i + 1), e.x - 14, e.y + 22);
        });
        packets = packets.filter((k) => {
          k.p += 0.018;
          const e = edges[k.e];
          const x = lerp(e.x + 12, col.x - 18, k.p), y = lerp(e.y, col.y, k.p);
          if (k.drop && k.p > 0.55) {
            ctx.fillStyle = "#ff6ad5"; ctx.fillText("✕", x - 3, y + 3);
            if (k.p > 0.75) { packets.push({ e: k.e, p: 0, drop: false, retry: true }); return false; }
            return true;
          }
          ctx.fillStyle = k.retry ? "#febc2e" : "#7cf7d4";
          ctx.beginPath(); ctx.arc(x, y, 2.8, 0, Math.PI * 2); ctx.fill();
          if (k.p >= 1) { flash = 1; series.push(clamp(series[series.length - 1] + rand(-0.12, 0.12), 0.15, 0.9)); series.shift(); return false; }
          return true;
        });
        flash *= 0.9;
        ctx.strokeStyle = `rgba(124,247,212,${0.5 + flash * 0.5})`; ctx.fillStyle = `rgba(124,247,212,${0.06 + flash * 0.25})`;
        roundRect(ctx, col.x - 18, col.y - 18, 36, 36, 8); ctx.fill(); ctx.stroke();
        ctx.fillStyle = "#7cf7d4"; ctx.textAlign = "center"; ctx.fillText("ACK", col.x, col.y + 4);
        ctx.fillStyle = "rgba(139,147,167,.9)"; ctx.fillText("flask collector", col.x, col.y + 32);
        // sparkline dashboard
        const sx = w * 0.06, sy = h * 0.78, sw = w * 0.88, sh = h * 0.16;
        ctx.strokeStyle = "rgba(255,255,255,.06)"; ctx.strokeRect(sx, sy - sh, sw, sh);
        const grd = ctx.createLinearGradient(sx, 0, sx + sw, 0); grd.addColorStop(0, "#7cf7d4"); grd.addColorStop(0.5, "#7c8cff"); grd.addColorStop(1, "#ff6ad5");
        ctx.strokeStyle = grd; ctx.lineWidth = 2; ctx.beginPath();
        series.forEach((v, i) => { const x = sx + (i / (series.length - 1)) * sw, y = sy - v * sh; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
        ctx.stroke(); ctx.lineWidth = 1;
        ctx.textAlign = "right"; ctx.fillStyle = "rgba(139,147,167,.9)";
        ctx.fillText((series[series.length - 1] * 480).toFixed(0) + " W · react dashboard", sx + sw, sy + 14);
      });
    },

    // Train booking: seats get reserved; hover to preview a booking
    train(canvas) {
      let ctx, w, h, seats = [];
      const setup = () => {
        ({ ctx, w, h } = fitCanvas(canvas));
        seats = [];
        const cols = Math.min(14, Math.floor((w - 60) / 26)), s = 18, gap = 8;
        const totalW = cols * (s + gap) - gap, x0 = (w - totalW) / 2, y0 = h * 0.3;
        for (let r = 0; r < 4; r++) for (let c = 0; c < cols; c++) {
          seats.push({ x: x0 + c * (s + gap), y: y0 + r * (s + gap) + (r > 1 ? 16 : 0), s, state: 0, anim: 0 });
        }
      };
      setup(); addEventListener("resize", setup);
      let last = 0;
      whileVisible(canvas, (t) => {
        ctx.clearRect(0, 0, w, h);
        const r = canvas.getBoundingClientRect(), mx = mouse.x - r.left, my = mouse.y - r.top;
        if (t - last > 220) {
          last = t;
          const free = seats.filter((s) => !s.state);
          if (free.length < seats.length * 0.25) seats.forEach((s) => { s.state = 0; s.anim = 0; });
          else { const s = free[(Math.random() * free.length) | 0]; s.state = 1; s.anim = 1; }
        }
        // carriage
        const first = seats[0], lastSeat = seats[seats.length - 1];
        ctx.strokeStyle = "rgba(255,255,255,.12)";
        roundRect(ctx, first.x - 16, first.y - 16, lastSeat.x + lastSeat.s - first.x + 32, lastSeat.y + lastSeat.s - first.y + 32, 16); ctx.stroke();
        for (const s of seats) {
          s.anim *= 0.92;
          const hover = mx > s.x && mx < s.x + s.s && my > s.y && my < s.y + s.s;
          const k = 1 + s.anim * 0.35 + (hover ? 0.25 : 0);
          const cx = s.x + s.s / 2, cy = s.y + s.s / 2, ss = s.s * k;
          if (hover) { ctx.fillStyle = "#ff6ad5"; }
          else ctx.fillStyle = s.state ? "rgba(124,140,255,.85)" : "rgba(255,255,255,.07)";
          roundRect(ctx, cx - ss / 2, cy - ss / 2, ss, ss, 5); ctx.fill();
          if (s.anim > 0.05) { ctx.strokeStyle = `rgba(124,247,212,${s.anim})`; ctx.beginPath(); ctx.arc(cx, cy, s.s * (1.6 - s.anim), 0, Math.PI * 2); ctx.stroke(); }
        }
        const booked = seats.filter((s) => s.state).length;
        ctx.font = "600 10px JetBrains Mono, monospace"; ctx.fillStyle = "rgba(139,147,167,.9)"; ctx.textAlign = "left";
        ctx.fillText(`🔒 JWT · ${booked}/${seats.length} seats reserved`, first.x - 16, first.y - 26);
        // moving track
        const ty = lastSeat.y + lastSeat.s + 34;
        ctx.strokeStyle = "rgba(255,255,255,.1)"; ctx.beginPath(); ctx.moveTo(0, ty); ctx.lineTo(w, ty); ctx.stroke();
        for (let x = -((t / 8) % 24); x < w; x += 24) { ctx.fillStyle = "rgba(255,255,255,.12)"; ctx.fillRect(x, ty + 3, 12, 2); }
      });
    },
  };

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }

  function initViz() { $$(".viz").forEach((c) => VIZ[c.dataset.viz] && VIZ[c.dataset.viz](c)); }

  /* ----------------------------------------------------------------- Modal */
  const PROJECTS = [
    {
      date: "May 2026", title: "QuickCard FaaS on OpenStack", sub: "Microservices",
      arch: ["Client", "OpenStack VM", "faasd gateway", "Docker functions"],
      points: [
        "Deployed a Function-as-a-Service (FaaS) platform on an OpenStack VM using faasd and Docker to run lightweight, on-demand microservices.",
        "Configured networking, IP addressing and security groups to keep the services private and reachable only from within the cloud environment.",
      ],
      tags: ["OpenStack", "faasd", "Docker", "Security Groups", "Microservices"],
    },
    {
      date: "Dec 2025", title: "Static Website Hosting on AWS", sub: "S3 + CloudFront",
      arch: ["Browser", "CloudFront edge", "HTTPS / cache", "S3 bucket"],
      points: [
        "Hosted a static website on AWS by storing the files in S3 and using CloudFront as a global CDN so the site loads quickly for users worldwide.",
        "Configured S3 access policies, caching rules and HTTPS to keep the site secure and high-performance.",
      ],
      tags: ["AWS S3", "CloudFront", "IAM Policies", "HTTPS", "CDN"],
    },
    {
      date: "May 2025", title: "Distributed Solar Panel Telemetry Pipeline", sub: "Distributed systems",
      arch: ["3 edge servers", "UDP + ACK/retry", "Flask collector", "JSON Lines", "React dashboard"],
      points: [
        "Built a system that collects sensor data from 3 simulated solar-panel edge servers, using UDP with acknowledgments and retries to prevent data loss over an unreliable network.",
        "Implemented the central collector in Flask with a React dashboard for real-time visualization, persisting all readings as JSON Lines.",
      ],
      tags: ["Python", "UDP", "Flask", "React", "Fault tolerance"],
    },
    {
      date: "Dec 2024", title: "Train-Booking System", sub: "MERN stack",
      arch: ["React UI", "Express API", "JWT auth", "MongoDB"],
      points: [
        "Developed a full-stack web app for booking train tickets using the MERN stack, with an interface for seat selection and reservation management.",
        "Implemented secure user authentication with JWT so passengers can sign in, book tickets and view their booking history.",
      ],
      tags: ["MongoDB", "Express.js", "React", "Node.js", "JWT"],
    },
  ];

  function initModal() {
    const modal = $("#modal"), content = $("#modalContent");
    let lastFocus;
    const open = (i) => {
      const p = PROJECTS[i];
      content.innerHTML = `
        <span class="kicker">${p.date} · ${p.sub}</span>
        <h3>${p.title}</h3>
        <div class="arch">${p.arch.map((a, j) => `${j ? `<b style="animation-delay:${j * 0.15 + 0.05}s">→</b>` : ""}<span style="animation-delay:${j * 0.15}s">${a}</span>`).join("")}</div>
        <ul>${p.points.map((x) => `<li>${x}</li>`).join("")}</ul>
        <div class="tags" style="margin-top:1.4rem">${p.tags.map((t) => `<span>${t}</span>`).join("")}</div>`;
      lastFocus = document.activeElement;
      modal.classList.add("open"); modal.setAttribute("aria-hidden", "false");
      $(".modal__close", modal).focus();
    };
    const close = () => {
      modal.classList.remove("open"); modal.setAttribute("aria-hidden", "true");
      if (lastFocus) lastFocus.focus();
    };
    $$(".project").forEach((el) => {
      el.addEventListener("click", () => open(+el.dataset.project));
      el.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(+el.dataset.project); } });
    });
    $$("[data-close]", modal).forEach((el) => el.addEventListener("click", close));
    addEventListener("keydown", (e) => { if (e.key === "Escape" && modal.classList.contains("open")) close(); });
  }

  /* ---------------------------------------------------------- Skill sphere */
  const SKILLS = [
    ["React", "web"], ["Node.js", "web"], ["Express.js", "web"], ["MongoDB", "web"], ["HTML", "web"], ["CSS", "web"], ["JavaScript", "web"],
    ["Flutter", "mobile"], ["Dart", "mobile"],
    ["Java", "lang"], ["Python", "lang"], ["C", "lang"], ["SQL", "lang"],
    ["Docker", "devops"], ["Terraform", "devops"], ["Linux", "devops"], ["VirtualBox", "devops"], ["GitHub Actions", "devops"], ["CI/CD", "devops"],
    ["AWS", "cloud"], ["S3", "cloud"], ["EC2", "cloud"], ["CloudFront", "cloud"], ["GCP", "cloud"], ["OpenStack", "cloud"],
    ["Git", "data"], ["GitHub", "data"], ["DB Design", "data"], ["Normalization", "data"], ["Power BI", "data"], ["DAX", "data"], ["Flask", "web"], ["JWT", "web"], ["faasd", "cloud"],
  ];

  function initSphere() {
    const el = $("#sphere");
    const N = SKILLS.length;
    const nodes = SKILLS.map(([name, group], i) => {
      const span = document.createElement("span");
      span.textContent = name; span.dataset.group = group;
      span.style.color = COLORS[i % 3];
      el.appendChild(span);
      const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = i * 2.399963;
      return { span, x: Math.cos(th) * r, y, z: Math.sin(th) * r };
    });
    let vx = 0.004, vy = 0.002, dragging = false, px = 0, py = 0;
    el.addEventListener("pointerdown", (e) => { dragging = true; px = e.clientX; py = e.clientY; el.setPointerCapture(e.pointerId); });
    el.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      vy = (e.clientX - px) * 0.0006; vx = -(e.clientY - py) * 0.0006;
      px = e.clientX; py = e.clientY;
    });
    const up = () => { dragging = false; };
    el.addEventListener("pointerup", up); el.addEventListener("pointercancel", up);

    $$(".skill-group").forEach((g) => {
      g.addEventListener("pointerenter", () => nodes.forEach((n) => n.span.classList.toggle("hl", n.span.dataset.group === g.dataset.group)));
      g.addEventListener("pointerleave", () => nodes.forEach((n) => n.span.classList.remove("hl")));
    });

    whileVisible(el, () => {
      const R = el.clientWidth * 0.38;
      if (!dragging) { vx = lerp(vx, 0.002, 0.02); vy = lerp(vy, 0.004, 0.02); }
      const cx = Math.cos(vx), sx = Math.sin(vx), cy = Math.cos(vy), sy = Math.sin(vy);
      for (const n of nodes) {
        let y = n.y * cx - n.z * sx, z = n.y * sx + n.z * cx;
        let x = n.x * cy + z * sy; z = -n.x * sy + z * cy;
        const len = Math.hypot(x, y, z) || 1; // keep points on the unit sphere
        n.x = x / len; n.y = y / len; n.z = z / len;
        const s = (z + 2) / 3;
        n.span.style.transform = `translate(-50%,-50%) translate3d(${x * R}px, ${y * R}px, 0) scale(${0.55 + s * 0.6})`;
        n.span.style.opacity = 0.25 + s * 0.75;
        n.span.style.zIndex = Math.round(s * 100);
        n.span.style.fontSize = "clamp(.7rem, 1.6vw, 1rem)";
      }
    });
  }

  /* --------------------------------------------------------------- Contact */
  function toast(msg) {
    const t = $("#toast"); t.textContent = msg; t.classList.add("show");
    clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove("show"), 2200);
  }

  function initContact() {
    $("#linkedinLink").href = LINKEDIN_URL;
    const btn = $("#copyEmail"), txt = $("#copyEmailText");
    btn.addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(EMAIL); scramble(txt, "Copied to clipboard ✓", 500); toast("📋 Email copied — talk soon!"); }
      catch { location.href = "mailto:" + EMAIL; }
      setTimeout(() => scramble(txt, EMAIL, 700), 2000);
      confetti(60);
    });
    $("#year").textContent = new Date().getFullYear();
  }

  /* -------------------------------------------------------------- Confetti */
  let confettiParts = [], confettiRunning = false;
  function confetti(n = 180) {
    if (reduced) return;
    const c = $("#confetti");
    const { ctx, w, h } = fitCanvas(c);
    for (let i = 0; i < n; i++) {
      confettiParts.push({
        x: w / 2 + rand(-80, 80), y: h * 0.6, vx: rand(-9, 9), vy: rand(-18, -7),
        r: rand(4, 9), rot: rand(0, 6), vr: rand(-0.3, 0.3), c: [...COLORS, "#febc2e"][(Math.random() * 4) | 0], life: 1,
      });
    }
    if (confettiRunning) return;
    confettiRunning = true;
    (function loop() {
      ctx.clearRect(0, 0, w, h);
      confettiParts = confettiParts.filter((p) => {
        p.vy += 0.4; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life -= 0.006;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.globalAlpha = clamp(p.life, 0, 1);
        ctx.fillStyle = p.c; ctx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); ctx.restore();
        return p.y < h + 20 && p.life > 0;
      });
      if (confettiParts.length) requestAnimationFrame(loop);
      else { confettiRunning = false; ctx.clearRect(0, 0, w, h); }
    })();
  }

  function initKonami() {
    const code = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
    let i = 0;
    addEventListener("keydown", (e) => {
      if (e.target.tagName === "INPUT") return;
      i = e.key.toLowerCase() === code[i].toLowerCase() ? i + 1 : (e.key === code[0] ? 1 : 0);
      if (i === code.length) {
        i = 0; confetti(260); document.body.classList.toggle("party");
        toast(document.body.classList.contains("party") ? "🕹️ Party mode unlocked!" : "Party mode off");
      }
    });
  }

  /* ------------------------------------------------------------------ Boot */
  initCursor();
  initHeroName();
  initNav();
  initSplits();
  initAbout();
  initCounters();
  initTimeline();
  initTilt();
  initViz();
  initModal();
  initSphere();
  initContact();
  initKonami();
  runLoader(() => {
    initHero();
    initRoles();
    initMagnetic();
  });
})();

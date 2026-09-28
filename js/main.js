/* ==========================================================================
   Ahmed Al-Humaid — Portfolio
   Vanilla JS, no dependencies. Motion is kept deliberately quiet.
   ========================================================================== */
(() => {
  "use strict";

  const LINKEDIN_URL = "https://www.linkedin.com/in/ahmed-al-humaid-7a494227b/";
  const EMAIL = "humaidakah@gmail.com";

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const rand = (a, b) => a + Math.random() * (b - a);
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  // Single accent palette shared by the canvas drawings.
  const ACCENT = "#7aa2f7";
  const accent = (a) => `rgba(122,162,247,${a})`;
  const slate = (a) => `rgba(148,163,184,${a})`;
  const LABEL = "rgba(138,148,167,.95)";
  const FONT = '500 10px Inter, system-ui, sans-serif';

  const mouse = { x: -9999, y: -9999 };
  addEventListener("pointermove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });

  /* One shared scroll listener; handlers run at most once per frame. */
  const scrollFns = [];
  let scrollQueued = false;
  addEventListener("scroll", () => {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(() => { scrollQueued = false; scrollFns.forEach((fn) => fn()); });
  }, { passive: true });
  const onScroll = (fn) => { scrollFns.push(fn); fn(); };

  function onceVisible(els, fn, threshold = 0.15) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { fn(e.target); io.unobserve(e.target); } });
    }, { threshold });
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

  /* ------------------------------------------------ Background starfield */
  // Stars are drawn once into tiles. Distant stars sit still on the container;
  // one nearer layer drifts slowly with scrolling. A few stars twinkle softly.
  function initSpace() {
    const root = $("#space");
    const T = 1024, dpr = Math.min(devicePixelRatio || 1, 2);
    const tile = (count, size, alpha) => {
      const c = document.createElement("canvas");
      c.width = c.height = T * dpr;
      const o = c.getContext("2d");
      o.scale(dpr, dpr);
      o.fillStyle = "#dfe6f5";
      for (let i = 0; i < count; i++) {
        o.globalAlpha = rand(...alpha);
        o.beginPath(); o.arc(rand(0, T), rand(0, T), rand(...size), 0, Math.PI * 2); o.fill();
      }
      return `url(${c.toDataURL("image/png")})`;
    };
    root.style.setProperty("--far", tile(420, [0.35, 0.8], [0.2, 0.55]));

    const near = document.createElement("div");
    near.className = "space__layer";
    near.style.backgroundImage = tile(110, [0.7, 1.4], [0.35, 0.8]);
    root.appendChild(near);

    if (reduced) return;
    for (let i = 0; i < 18; i++) {
      const d = document.createElement("i");
      d.className = "twinkle";
      const s = rand(1.4, 2.4);
      d.style.cssText = `left:${rand(0, 100)}%;top:${rand(0, 100)}%;width:${s}px;height:${s}px;` +
        `animation-duration:${rand(4, 8).toFixed(1)}s;animation-delay:${rand(-8, 0).toFixed(1)}s`;
      root.appendChild(d);
    }
    onScroll(() => {
      const y = (scrollY * 0.08) % T;
      near.style.transform = `translate3d(0, ${(-y).toFixed(1)}px, 0)`;
    });
  }

  /* ------------------------------------------------------------------ Nav */
  function initNav() {
    const nav = $("#nav");
    const links = $$(".nav__links a");
    const sections = links.map((a) => $(a.getAttribute("href"))).filter(Boolean);
    onScroll(() => {
      nav.classList.toggle("scrolled", scrollY > 30);
      let current = null;
      sections.forEach((s) => { if (s.getBoundingClientRect().top < innerHeight * 0.4) current = s.id; });
      links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + current));
    });
    $("#burger").addEventListener("click", () => nav.classList.toggle("open"));
    links.forEach((a) => a.addEventListener("click", () => nav.classList.remove("open")));
  }

  /* ------------------------------------------------------ Rotating role */
  function initRoles() {
    const el = $("#roleText");
    const roles = ["Software Engineer", "Cybersecurity Enthusiast", "Full-Stack Developer", "Cloud Engineer", "Aspiring Security Analyst"];
    if (reduced) return;
    let i = 0;
    setInterval(() => {
      el.classList.add("out");
      setTimeout(() => { i = (i + 1) % roles.length; el.textContent = roles[i]; el.classList.remove("out"); }, 500);
    }, 3600);
  }

  /* ------------------------------------------------------ Scroll reveal */
  function initReveal() {
    // Cards in the same group appear with a short stagger.
    $$(".reveal").forEach((el) => {
      const sibs = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
      el.style.transitionDelay = Math.min(sibs.indexOf(el), 4) * 0.07 + "s";
    });
    onceVisible($$(".reveal"), (el) => el.classList.add("in"), 0.12);
  }

  /* ------------------------------------------------ Counters and gauges */
  function initCounters() {
    if (!reduced) {
      $$("[data-count]").forEach((el) => (el.textContent = (0).toFixed(+el.dataset.decimals || 0)));
      onceVisible($$("[data-count]"), (el) => {
        const to = parseFloat(el.dataset.count), dec = +el.dataset.decimals || 0, t0 = performance.now();
        const step = (t) => {
          const p = clamp((t - t0) / 1400, 0, 1), e = 1 - Math.pow(1 - p, 3);
          el.textContent = (to * e).toFixed(dec);
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }, 0.6);
    }
    onceVisible($$(".gauge"), (g) => {
      $(".gauge__fill", g).style.strokeDashoffset = 2 * Math.PI * 52 * (1 - g.dataset.value / g.dataset.max);
    }, 0.5);
  }

  /* ------------------------------------------------ Project diagrams */
  // Each diagram is a small simulation drawn on a canvas. It is shown as a
  // still frame and only animates while the card is hovered or focused.
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }

  const VIZ = {
    // FaaS: requests flow from a gateway into containers that spin up on demand
    faas() {
      let boxes = [], packets = [], last = 0;
      return {
        setup(w, h) {
          boxes = [];
          const rows = 3, gx = w * 0.42, gy = h / 2 - ((rows - 1) * 46) / 2;
          for (let r = 0; r < rows; r++) for (let c = 0; c < 4; c++) boxes.push({ x: gx + c * 50, y: gy + r * 46, s: 34, heat: 0 });
        },
        draw(ctx, w, h, t) {
          const gw = { x: w * 0.14, y: h / 2 };
          if (t - last > 420) { last = t; packets.push({ b: boxes[(Math.random() * boxes.length) | 0], p: 0 }); }
          ctx.strokeStyle = accent(0.8); ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.arc(gw.x, gw.y, 20, 0, Math.PI * 2); ctx.stroke();
          ctx.font = FONT; ctx.textAlign = "center";
          ctx.fillStyle = ACCENT; ctx.fillText("λ", gw.x, gw.y + 4);
          ctx.fillStyle = LABEL; ctx.fillText("gateway", gw.x, gw.y + 36);
          ctx.lineWidth = 1;
          packets = packets.filter((k) => {
            k.p += 0.02;
            const bx = k.b.x + k.b.s / 2, by = k.b.y + k.b.s / 2;
            ctx.strokeStyle = slate(0.14); ctx.beginPath(); ctx.moveTo(gw.x + 20, gw.y); ctx.lineTo(bx, by); ctx.stroke();
            ctx.fillStyle = ACCENT; ctx.beginPath(); ctx.arc(lerp(gw.x + 20, bx, k.p), lerp(gw.y, by, k.p), 2.4, 0, Math.PI * 2); ctx.fill();
            if (k.p >= 1) { k.b.heat = 1; return false; }
            return true;
          });
          for (const b of boxes) {
            b.heat *= 0.97;
            ctx.fillStyle = accent(0.04 + b.heat * 0.3);
            ctx.strokeStyle = b.heat > 0.05 ? accent(0.3 + b.heat * 0.6) : slate(0.3);
            roundRect(ctx, b.x, b.y, b.s, b.s, 6); ctx.fill(); ctx.stroke();
          }
          ctx.fillStyle = LABEL; ctx.textAlign = "left";
          ctx.fillText("faasd · docker", boxes[0].x, boxes[0].y - 12);
        },
      };
    },

    // CDN: slowly rotating dotted globe with edge locations served from an origin
    cdn() {
      const pts = [], N = 380;
      for (let i = 0; i < N; i++) {
        const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = i * 2.399963;
        pts.push([Math.cos(th) * r, y, Math.sin(th) * r]);
      }
      const edges = [20, 77, 140, 199, 251, 310, 366].map((i) => pts[i]);
      return {
        setup() {},
        draw(ctx, w, h, t) {
          const R = Math.min(w, h) * 0.36, cx = w / 2, cy = h / 2, a = t / 6000;
          const proj = ([x, y, z]) => {
            const X = x * Math.cos(a) - z * Math.sin(a), Z = x * Math.sin(a) + z * Math.cos(a);
            const Y = y * Math.cos(0.35) - Z * Math.sin(0.35), Z2 = y * Math.sin(0.35) + Z * Math.cos(0.35);
            return [cx + X * R, cy + Y * R, Z2];
          };
          for (const p of pts) {
            const [x, y, z] = proj(p);
            ctx.fillStyle = slate(z < 0 ? 0.55 : 0.12);
            ctx.fillRect(x, y, 1.5, 1.5);
          }
          ctx.lineWidth = 1;
          edges.forEach((e, i) => {
            const [x, y, z] = proj(e);
            if (z > 0.1) return;
            const ph = (t / 1800 + i * 0.37) % 1;
            const mx = (cx + x) / 2, my = (cy + y) / 2 - 26;
            ctx.strokeStyle = accent(0.3);
            ctx.beginPath(); ctx.moveTo(cx, cy); ctx.quadraticCurveTo(mx, my, x, y); ctx.stroke();
            const q = ph, bx = (1 - q) * (1 - q) * cx + 2 * (1 - q) * q * mx + q * q * x, by = (1 - q) * (1 - q) * cy + 2 * (1 - q) * q * my + q * q * y;
            ctx.fillStyle = ACCENT; ctx.beginPath(); ctx.arc(bx, by, 2, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(x, y, 2.6, 0, Math.PI * 2); ctx.fill();
          });
          ctx.fillStyle = "#e5e9f0"; ctx.beginPath(); ctx.arc(cx, cy, 3.5, 0, Math.PI * 2); ctx.fill();
          ctx.font = FONT; ctx.fillStyle = LABEL; ctx.textAlign = "center";
          ctx.fillText("S3 origin → CloudFront edge locations", cx, h - 12);
        },
      };
    },

    // Solar telemetry: UDP packets from 3 edge servers; some drop and are retried
    solar() {
      let packets = [], last = 0, flash = 0;
      const series = Array.from({ length: 60 }, (_, i) => 0.5 + Math.sin(i / 6) * 0.2);
      return {
        setup() {},
        draw(ctx, w, h, t) {
          const edges = [0, 1, 2].map((i) => ({ x: w * 0.12, y: h * 0.18 + i * h * 0.2 }));
          const col = { x: w * 0.62, y: h * 0.38 };
          if (t - last > 520) { last = t; packets.push({ e: (Math.random() * 3) | 0, p: 0, drop: Math.random() < 0.2, retry: false }); }
          ctx.font = FONT; ctx.textAlign = "left"; ctx.lineWidth = 1;
          edges.forEach((e, i) => {
            ctx.strokeStyle = slate(0.14); ctx.setLineDash([3, 4]);
            ctx.beginPath(); ctx.moveTo(e.x + 12, e.y); ctx.lineTo(col.x - 18, col.y); ctx.stroke(); ctx.setLineDash([]);
            ctx.fillStyle = accent(0.15); ctx.strokeStyle = accent(0.8);
            ctx.save(); ctx.translate(e.x, e.y); ctx.transform(1, 0, -0.35, 1, 0, 0);
            ctx.fillRect(-12, -8, 24, 16); ctx.strokeRect(-12, -8, 24, 16);
            ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(0, 8); ctx.moveTo(-12, 0); ctx.lineTo(12, 0); ctx.stroke();
            ctx.restore();
            ctx.fillStyle = LABEL; ctx.fillText("edge-" + (i + 1), e.x - 14, e.y + 22);
          });
          packets = packets.filter((k) => {
            k.p += 0.015;
            const e = edges[k.e], x = lerp(e.x + 12, col.x - 18, k.p), y = lerp(e.y, col.y, k.p);
            if (k.drop && k.p > 0.55) {
              ctx.fillStyle = slate(0.9); ctx.fillText("×", x - 3, y + 3);
              if (k.p > 0.75) { packets.push({ e: k.e, p: 0, drop: false, retry: true }); return false; }
              return true;
            }
            ctx.fillStyle = k.retry ? "#e5e9f0" : ACCENT;
            ctx.beginPath(); ctx.arc(x, y, 2.6, 0, Math.PI * 2); ctx.fill();
            if (k.p >= 1) { flash = 1; series.push(clamp(series[series.length - 1] + rand(-0.1, 0.1), 0.15, 0.9)); series.shift(); return false; }
            return true;
          });
          flash *= 0.9;
          ctx.strokeStyle = accent(0.5 + flash * 0.5); ctx.fillStyle = accent(0.06 + flash * 0.2);
          roundRect(ctx, col.x - 18, col.y - 18, 36, 36, 8); ctx.fill(); ctx.stroke();
          ctx.fillStyle = ACCENT; ctx.textAlign = "center"; ctx.fillText("ACK", col.x, col.y + 4);
          ctx.fillStyle = LABEL; ctx.fillText("flask collector", col.x, col.y + 32);
          const sx = w * 0.06, sy = h * 0.8, sw = w * 0.88, sh = h * 0.15;
          ctx.strokeStyle = slate(0.12); ctx.strokeRect(sx, sy - sh, sw, sh);
          ctx.strokeStyle = ACCENT; ctx.lineWidth = 1.6; ctx.beginPath();
          series.forEach((v, i) => { const x = sx + (i / (series.length - 1)) * sw, y = sy - v * sh; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
          ctx.stroke(); ctx.lineWidth = 1;
          ctx.textAlign = "right"; ctx.fillStyle = LABEL;
          ctx.fillText((series[series.length - 1] * 480).toFixed(0) + " W · live dashboard", sx + sw, sy + 14);
        },
      };
    },

    // Train booking: seats are reserved one by one; hover a seat to preview it
    train(canvas) {
      let seats = [], last = 0;
      return {
        setup(w, h) {
          seats = [];
          const cols = Math.min(14, Math.floor((w - 60) / 26)), s = 18, gap = 8;
          const x0 = (w - (cols * (s + gap) - gap)) / 2, y0 = h * 0.3;
          for (let r = 0; r < 4; r++) for (let c = 0; c < cols; c++) {
            seats.push({ x: x0 + c * (s + gap), y: y0 + r * (s + gap) + (r > 1 ? 16 : 0), s, state: 0, anim: 0 });
          }
        },
        draw(ctx, w, h, t) {
          const r = canvas.getBoundingClientRect(), mx = mouse.x - r.left, my = mouse.y - r.top;
          if (t - last > 320) {
            last = t;
            const free = seats.filter((s) => !s.state);
            if (free.length < seats.length * 0.3) seats.forEach((s) => { s.state = 0; s.anim = 0; });
            else { const s = free[(Math.random() * free.length) | 0]; s.state = 1; s.anim = 1; }
          }
          const first = seats[0], lastSeat = seats[seats.length - 1];
          ctx.strokeStyle = slate(0.2); ctx.lineWidth = 1;
          roundRect(ctx, first.x - 16, first.y - 16, lastSeat.x + lastSeat.s - first.x + 32, lastSeat.y + lastSeat.s - first.y + 32, 14); ctx.stroke();
          for (const s of seats) {
            s.anim *= 0.9;
            const hover = mx > s.x && mx < s.x + s.s && my > s.y && my < s.y + s.s;
            const k = 1 + s.anim * 0.2 + (hover ? 0.15 : 0), ss = s.s * k, cx = s.x + s.s / 2, cy = s.y + s.s / 2;
            ctx.fillStyle = hover ? "#e5e9f0" : s.state ? accent(0.85) : slate(0.12);
            roundRect(ctx, cx - ss / 2, cy - ss / 2, ss, ss, 4); ctx.fill();
          }
          const booked = seats.filter((s) => s.state).length;
          ctx.font = FONT; ctx.fillStyle = LABEL; ctx.textAlign = "left";
          ctx.fillText(`JWT sign-in · ${booked}/${seats.length} seats reserved`, first.x - 16, first.y - 26);
        },
      };
    },
  };

  function initViz() {
    $$(".viz").forEach((canvas) => {
      const make = VIZ[canvas.dataset.viz];
      if (!make) return;
      const viz = make(canvas), card = canvas.closest(".project");
      let ctx, w, h, clock = 0, raf = 0, prev = 0;
      const frame = () => { ctx.clearRect(0, 0, w, h); viz.draw(ctx, w, h, clock); };
      const setup = () => {
        ({ ctx, w, h } = fitCanvas(canvas));
        viz.setup(w, h);
        // Warm the simulation up so the still frame already shows activity.
        for (let i = 0; i < 240; i++) { clock += 16; if (i < 239) viz.draw(ctx, w, h, clock); }
        frame();
      };
      setup();
      let rt; addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(setup, 200); });
      if (reduced) return;

      const loop = (t) => { clock += Math.min(50, t - prev); prev = t; frame(); raf = requestAnimationFrame(loop); };
      const start = () => { if (!raf) { prev = performance.now(); raf = requestAnimationFrame(loop); } };
      const stop = () => { cancelAnimationFrame(raf); raf = 0; };
      if (canHover) {
        card.addEventListener("pointerenter", start);
        card.addEventListener("pointerleave", stop);
      }
      card.addEventListener("focus", start);
      card.addEventListener("blur", stop);
    });
  }

  /* ------------------------------------------------------ Project details */
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
        <span class="meta">${p.date} · ${p.sub}</span>
        <h3>${p.title}</h3>
        <div class="arch">${p.arch.map((a, j) => `${j ? "<b>→</b>" : ""}<span>${a}</span>`).join("")}</div>
        <ul>${p.points.map((x) => `<li>${x}</li>`).join("")}</ul>
        <div class="chips chips--sm">${p.tags.map((t) => `<span>${t}</span>`).join("")}</div>`;
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

  /* --------------------------------------------------------------- Contact */
  function toast(msg) {
    const t = $("#toast"); t.textContent = msg; t.classList.add("show");
    clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove("show"), 2200);
  }

  function initContact() {
    $("#linkedinLink").href = LINKEDIN_URL;
    const txt = $("#copyEmailText");
    $("#copyEmail").addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(EMAIL);
        txt.textContent = "Email copied";
        toast("Email address copied to clipboard");
        setTimeout(() => (txt.textContent = EMAIL), 1800);
      } catch { location.href = "mailto:" + EMAIL; }
    });
    $("#year").textContent = new Date().getFullYear();
  }

  /* ------------------------------------------------------------------ Boot */
  initSpace();
  initNav();
  initRoles();
  initReveal();
  initCounters();
  initViz();
  initModal();
  initContact();
})();

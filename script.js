(() => {
  const canvas = document.getElementById("bg-anim");
  if (!canvas) return;

  const ctx = canvas.getContext("2d", { alpha: true });
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let w = 0;
  let h = 0;
  let dpr = 1;
  let t = 0;
  let raf = 0;
  let running = true;

  const blobs = [
    { x: 0.2, y: 0.32, r: 0.4, a: 0.2, s: 0.32, p: 0, tone: "mad" },
    { x: 0.8, y: 0.3, r: 0.38, a: 0.16, s: 0.28, p: 1.4, tone: "vegas" },
    { x: 0.12, y: 0.78, r: 0.24, a: 0.1, s: 0.4, p: 2.6, tone: "mad" },
    { x: 0.88, y: 0.76, r: 0.22, a: 0.1, s: 0.36, p: 3.8, tone: "vegas" },
  ];

  const flakes = Array.from({ length: 54 }, (_, i) => ({
    x: Math.random(),
    y: Math.random(),
    z: 0.3 + Math.random() * 0.7,
    tw: Math.random() * Math.PI * 2,
    sp: 0.08 + Math.random() * 0.18,
    tone: i % 2 === 0 ? "mad" : "vegas",
  }));

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.6);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function blob(x, y, r, alpha, tone) {
    const hot = tone === "vegas" ? "245, 193, 108" : "232, 121, 249";
    const deep = tone === "vegas" ? "217, 119, 6" : "126, 34, 206";
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(${hot}, ${alpha})`);
    g.addColorStop(0.5, `rgba(${deep}, ${alpha * 0.4})`);
    g.addColorStop(1, `rgba(${hot}, 0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  function frame() {
    if (!running) return;

    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = "lighter";

    blobs.forEach((b, i) => {
      const nx = (b.x + Math.sin(t * b.s + b.p) * 0.08) * w;
      const ny = (b.y + Math.cos(t * b.s * 0.85 + b.p) * 0.07) * h;
      const nr = Math.min(w, h) * b.r * (0.9 + Math.sin(t * 0.4 + i) * 0.08);
      blob(nx, ny, nr, b.a, b.tone);
    });

    flakes.forEach((s) => {
      s.y += s.sp * 0.0012;
      s.tw += 0.02;
      if (s.y > 1.04) {
        s.y = -0.04;
        s.x = Math.random();
      }
      const x = s.x * w + Math.sin(s.tw) * 10;
      const y = s.y * h;
      const pulse = 0.22 + (Math.sin(s.tw * 1.6) + 1) * 0.22;
      ctx.globalAlpha = pulse * 0.55 * s.z;
      ctx.fillStyle = s.tone === "vegas" ? "#f5c16c" : "#e879f9";
      ctx.beginPath();
      ctx.arc(x, y, 1 + s.z * 0.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    ctx.globalCompositeOperation = "source-over";
    t += 0.012;
    raf = requestAnimationFrame(frame);
  }

  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", () => {
    running = !document.hidden;
    if (running && !reduce) {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(frame);
    }
  });

  resize();
  if (reduce) {
    blobs.forEach((b) => {
      blob(b.x * w, b.y * h, Math.min(w, h) * b.r, b.a, b.tone);
    });
  } else {
    raf = requestAnimationFrame(frame);
  }
})();

(() => {
  const buttons = document.querySelectorAll("[data-copy]");
  if (!buttons.length) return;

  async function copyCode(btn) {
    const code = btn.getAttribute("data-copy");
    if (!code) return;

    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const input = document.createElement("textarea");
      input.value = code;
      input.setAttribute("readonly", "");
      input.style.position = "absolute";
      input.style.left = "-9999px";
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }

    const prev = btn.textContent;
    btn.textContent = "Skopiowano";
    btn.classList.add("is-copied");
    window.setTimeout(() => {
      btn.textContent = prev;
      btn.classList.remove("is-copied");
    }, 1800);
  }

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => copyCode(btn));
  });
})();

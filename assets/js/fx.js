/* 2D particle layer: confetti, glitter, wax-seal shards */
(function () {
  "use strict";
  var VC = window.VC = window.VC || {};
  var cv = document.getElementById("fx"), cx = cv.getContext("2d");
  var calm = matchMedia("(prefers-reduced-motion:reduce)").matches;
  var dpr = Math.min(devicePixelRatio || 1, 2), ps = [], run = false;
  var COL = ["#fbf0dc", "#e8c27a", "#c98a4b", "#a8693a", "#ffffff", "#f4b6c2", "#7a4a2e"];

  function size() { cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  size(); addEventListener("resize", size);

  function star(r) { cx.beginPath(); for (var i = 0; i < 8; i++) { var a = i * Math.PI / 4, d = i % 2 ? r * .28 : r; cx.lineTo(Math.cos(a) * d, Math.sin(a) * d); } cx.closePath(); cx.fill(); }
  function tri(r) { cx.beginPath(); cx.moveTo(0, -r); cx.lineTo(r * .8, r * .7); cx.lineTo(-r * .8, r * .7); cx.closePath(); cx.fill(); }

  function add(p) {
    ps.push(Object.assign({ life: 0, max: 150 + Math.random() * 80, g: .28, d: .99, k: 0, r: 0, vr: 0, w: 7, h: 5, vx: 0, vy: 0 }, p));
    if (!run) { run = true; requestAnimationFrame(loop); }
  }
  function loop() {
    cx.clearRect(0, 0, innerWidth, innerHeight);
    ps = ps.filter(function (p) {
      p.life++; p.vy += p.g; p.vx *= p.d; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      var a = Math.min(1, (p.max - p.life) / 30); if (a <= 0 || p.y > innerHeight + 30) return false;
      cx.save(); cx.globalAlpha = a; cx.translate(p.x, p.y); cx.rotate(p.r); cx.fillStyle = p.c;
      if (p.k === 1) { cx.beginPath(); cx.arc(0, 0, p.w / 2, 0, 7); cx.fill(); }
      else if (p.k === 2) star(p.w); else if (p.k === 3) tri(p.w); else cx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      cx.restore(); return true;
    });
    if (ps.length) requestAnimationFrame(loop); else { run = false; cx.clearRect(0, 0, innerWidth, innerHeight); }
  }

  function confetti(x, y, n, ang, spr, pow) {
    if (calm) return;
    n = n || 120; ang = ang == null ? -Math.PI / 2 : ang; spr = spr == null ? Math.PI * 2 : spr; pow = pow || 14;
    for (var i = 0; i < n; i++) {
      var a = ang + (Math.random() - .5) * spr, v = Math.random() * pow + 3;
      add({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, w: 6 + Math.random() * 7, h: 4 + Math.random() * 6, r: Math.random() * 6, vr: (Math.random() - .5) * .4, c: COL[i % COL.length], k: i % 5 === 0 ? 1 : i % 7 === 0 ? 2 : 0 });
    }
  }
  function cannons() {
    if (calm) return;
    confetti(0, innerHeight, 80, -Math.PI / 3, .7, 22);
    confetti(innerWidth, innerHeight, 80, -2 * Math.PI / 3, .7, 22);
    confetti(innerWidth / 2, innerHeight * .3, 90, -Math.PI / 2, Math.PI * 2, 13);
    if (VC.gl) VC.gl.boost();
  }
  function glitter(x, y, n) {
    if (calm) return;
    for (var i = 0; i < n; i++) add({ x: x, y: y, vx: (Math.random() - .5) * 5, vy: (Math.random() - .8) * 5, g: .12, d: .95, k: 2, w: 5 + Math.random() * 8, r: Math.random() * 6, vr: .15, c: Math.random() > .4 ? "#e8c27a" : "#fbf0dc", max: 55 });
  }
  function shards(x, y, n) {
    if (calm) return;
    for (var i = 0; i < (n || 26); i++) {
      var a = Math.random() * Math.PI * 2, v = 2 + Math.random() * 8;
      add({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 3, g: .4, d: .97, k: 3, w: 4 + Math.random() * 7, r: Math.random() * 6, vr: (Math.random() - .5) * .5, c: i % 3 ? "#e8c27a" : "#a8702f", max: 90 });
    }
  }
  function trail(x, y) {
    if (calm) return;
    add({ x: x, y: y, vx: (Math.random() - .5) * 1.4, vy: -Math.random(), g: .05, d: .96, k: 2, w: 4 + Math.random() * 7, vr: .1, c: Math.random() > .4 ? "#e8c27a" : "#fbf0dc", max: 50 });
  }
  VC.fx = { confetti: confetti, cannons: cannons, glitter: glitter, shards: shards, trail: trail };
})();

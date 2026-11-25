/* Synthesised music-box lullaby + sound effects (Web Audio, no audio files needed).
   Starts only after the guest taps the envelope; a speaker button mutes it. */
(function () {
  "use strict";
  var VC = window.VC = window.VC || {};
  var ctx = null, master = null, comp = null, silent = null, verb = null, timer = 0, playing = false, muted = false, idx = 0, nextT = 0;
  try { muted = localStorage.getItem("vc_mute") === "1"; } catch (e) {}

  var F = { C: 261.63, D: 293.66, E: 329.63, F: 349.23, G: 392, A: 440 };
  /* "Twinkle, Twinkle, Little Star" (public domain); a trailing "-" holds the note twice as long */
  var SEQ = "C C G G A A G- F F E E D D C- G G F F E E D- G G F F E E D- C C G G A A G- F F E E D D C-".split(" ");
  var BEAT = 0.62, VOL = 1.0;

  function ensure() {
    if (ctx) return true;
    var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
    ctx = new AC(); master = ctx.createGain(); master.gain.value = muted ? 0 : VOL;
    comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4; comp.connect(ctx.destination);
    var len = Math.floor(ctx.sampleRate * 2.4), buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (var c = 0; c < 2; c++) { var d = buf.getChannelData(c); for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
    verb = ctx.createConvolver(); verb.buffer = buf;
    var wet = ctx.createGain(); wet.gain.value = 0.35;
    master.connect(comp); master.connect(verb); verb.connect(wet); wet.connect(comp);
    return true;
  }

  function bell(f, t, g, dur) {
    var gn = ctx.createGain(), g2 = ctx.createGain(), g3 = ctx.createGain();
    var o1 = ctx.createOscillator(), o2 = ctx.createOscillator(), o3 = ctx.createOscillator();
    o1.type = "sine"; o2.type = "sine"; o3.type = "triangle";
    o1.frequency.value = f; o2.frequency.value = f * 2.01; o3.frequency.value = f * 4.02;
    g2.gain.value = 0.32; g3.gain.value = 0.07;
    o1.connect(gn); o2.connect(g2); g2.connect(gn); o3.connect(g3); g3.connect(gn); gn.connect(master);
    gn.gain.setValueAtTime(0, t); gn.gain.linearRampToValueAtTime(g, t + 0.006); gn.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    [o1, o2, o3].forEach(function (o) { o.start(t); o.stop(t + dur + 0.05); });
  }

  function schedule() {
    if (!playing || !ctx) return;
    while (nextT < ctx.currentTime + 1.5) {
      var k = idx % SEQ.length, tok = SEQ[k], hold = tok.length > 1, f = F[tok[0]];
      bell(f * 2, nextT, 0.34, hold ? 2.6 : 1.5);
      if (k % 7 === 0) bell(f, nextT, 0.16, 2.4);
      nextT += BEAT * (hold ? 2 : 1); idx++;
      if (idx % SEQ.length === 0) nextT += BEAT * 3;
    }
  }

  /* iPhones keep Web Audio silent while the ringer switch is off, unless a media element is "playing".
     A looping silent <audio> plus audioSession.type="playback" switches the page to media volume. */
  function silentWav() {
    var n = 4000, b = new Uint8Array(44 + n), v = new DataView(b.buffer), w = function (o, t) { for (var i = 0; i < t.length; i++) b[o + i] = t.charCodeAt(i); };
    w(0, "RIFF"); v.setUint32(4, 36 + n, true); w(8, "WAVEfmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
    v.setUint32(24, 8000, true); v.setUint32(28, 8000, true); v.setUint16(32, 1, true); v.setUint16(34, 8, true); w(36, "data"); v.setUint32(40, n, true);
    for (var i = 0; i < n; i++) b[44 + i] = 128;
    return URL.createObjectURL(new Blob([b], { type: "audio/wav" }));
  }
  function unlock() {
    try { if (navigator.audioSession) navigator.audioSession.type = "playback"; } catch (e) {}
    try {
      if (!silent) { silent = document.createElement("audio"); silent.src = silentWav(); silent.loop = true; silent.preload = "auto"; silent.setAttribute("playsinline", ""); silent.setAttribute("aria-hidden", "true"); }
      var p = silent.play(); if (p && p.catch) p.catch(function () {});
    } catch (e) {}
  }
  function wake() { if (ctx && ctx.state !== "running" && ctx.resume) ctx.resume(); }

  function start() {
    unlock();
    if (!ensure()) return;
    wake();
    if (playing) return;
    playing = true; nextT = ctx.currentTime + 0.2; schedule(); timer = setInterval(schedule, 300);
  }

  function setMuted(m) {
    muted = !!m; try { localStorage.setItem("vc_mute", muted ? "1" : "0"); } catch (e) {}
    if (master) { master.gain.cancelScheduledValues(ctx.currentTime); master.gain.linearRampToValueAtTime(muted ? 0 : VOL, ctx.currentTime + 0.2); }
  }

  function sfx(name) {
    if (!ctx || muted) return;
    var t = ctx.currentTime, g = ctx.createGain(); g.connect(master);
    if (name === "squeak") {
      var o = ctx.createOscillator(); o.type = "sine"; o.frequency.setValueAtTime(700, t); o.frequency.exponentialRampToValueAtTime(1500, t + 0.09);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.25, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
      o.connect(g); o.start(t); o.stop(t + 0.16);
    } else if (name === "pop") {
      var n = Math.floor(ctx.sampleRate * 0.18), b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0);
      for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3);
      var s = ctx.createBufferSource(); s.buffer = b; var bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 1800;
      g.gain.value = 0.5; s.connect(bp); bp.connect(g); s.start(t);
    } else if (name === "chime") {
      [523.25, 659.25, 783.99, 1046.5].forEach(function (f, i) { bell(f, t + i * 0.09, 0.16, 1.6); });
    }
  }

  document.addEventListener("visibilitychange", function () {
    if (!ctx) return;
    if (document.hidden) { ctx.suspend(); if (silent) silent.pause(); } else if (playing) { unlock(); ctx.resume(); }
  });
  ["pointerdown", "touchend"].forEach(function (ev) { document.addEventListener(ev, function () { if (playing) wake(); }, { passive: true }); });
  VC.audio = { start: start, sfx: sfx, setMuted: setMuted, isMuted: function () { return muted; } };
})();

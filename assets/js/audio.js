/* Synthesised music-box lullaby + sound effects (Web Audio, no audio files needed).
   Starts only after the guest taps the envelope; a speaker button mutes it. */
(function () {
  "use strict";
  var VC = window.VC = window.VC || {};
  var ctx = null, master = null, verb = null, timer = 0, playing = false, muted = false, idx = 0, nextT = 0;
  try { muted = localStorage.getItem("vc_mute") === "1"; } catch (e) {}

  var F = { C: 261.63, D: 293.66, E: 329.63, F: 349.23, G: 392, A: 440 };
  /* "Twinkle, Twinkle, Little Star" (public domain); a trailing "-" holds the note twice as long */
  var SEQ = "C C G G A A G- F F E E D D C- G G F F E E D- G G F F E E D- C C G G A A G- F F E E D D C-".split(" ");
  var BEAT = 0.62;

  function ensure() {
    if (ctx) return true;
    var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
    ctx = new AC(); master = ctx.createGain(); master.gain.value = muted ? 0 : 0.5;
    var len = Math.floor(ctx.sampleRate * 2.4), buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (var c = 0; c < 2; c++) { var d = buf.getChannelData(c); for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
    verb = ctx.createConvolver(); verb.buffer = buf;
    var wet = ctx.createGain(); wet.gain.value = 0.35;
    master.connect(ctx.destination); master.connect(verb); verb.connect(wet); wet.connect(ctx.destination);
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
      bell(f * 2, nextT, 0.17, hold ? 2.6 : 1.5);
      if (k % 7 === 0) bell(f, nextT, 0.09, 2.4);
      nextT += BEAT * (hold ? 2 : 1); idx++;
      if (idx % SEQ.length === 0) nextT += BEAT * 3;
    }
  }

  function start() {
    if (!ensure()) return;
    if (ctx.resume) ctx.resume();
    if (playing) return;
    playing = true; nextT = ctx.currentTime + 0.2; schedule(); timer = setInterval(schedule, 300);
  }

  function setMuted(m) {
    muted = !!m; try { localStorage.setItem("vc_mute", muted ? "1" : "0"); } catch (e) {}
    if (master) { master.gain.cancelScheduledValues(ctx.currentTime); master.gain.linearRampToValueAtTime(muted ? 0 : 0.5, ctx.currentTime + 0.2); }
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

  document.addEventListener("visibilitychange", function () { if (ctx) { if (document.hidden) ctx.suspend(); else ctx.resume(); } });
  VC.audio = { start: start, sfx: sfx, setMuted: setMuted, isMuted: function () { return muted; } };
})();

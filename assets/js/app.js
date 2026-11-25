/* Main controller for the Saharsh invitation (v2) — Vivaah Creations */
(function () {
  "use strict";
  var VC = window.VC, C = VC.CONFIG, $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var calm = matchMedia("(prefers-reduced-motion:reduce)").matches;
  var fine = matchMedia("(pointer:fine)").matches;
  var html = document.documentElement, body = document.body;
  var qs = new URLSearchParams(location.search);
  var lang = qs.get("lang") === "te" ? "te" : "en";
  try { if (!qs.get("lang")) lang = localStorage.getItem("vc_lang") === "te" ? "te" : "en"; } catch (e) {}
  var guest = (qs.get("to") || "").replace(/[<>]/g, "").slice(0, 60).trim();
  var guests = 2;
  var T = function (k) { return VC.I18N[lang][k]; };

  /* ---------- toast ---------- */
  var toastT; function toast(m) { var t = $("#toast"); t.textContent = m; t.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove("show"); }, 2400); }

  /* ---------- i18n ---------- */
  function buildName() {
    var n = $("#name"), txt = C.baby[lang], i = 0; n.textContent = ""; n.setAttribute("aria-label", txt);
    txt.split(" ").forEach(function (word, wi) {
      var w = document.createElement("span"); w.className = "w"; w.setAttribute("aria-hidden", "true");
      if (lang === "en") { word.split("").forEach(function (ch) { var c = document.createElement("span"); c.className = "ch"; c.style.setProperty("--i", i++); c.textContent = ch; w.appendChild(c); }); }
      else { var c = document.createElement("span"); c.className = "ch"; c.style.setProperty("--i", i * 4); i++; c.textContent = word; w.appendChild(c); }
      n.appendChild(w); n.appendChild(document.createTextNode(" "));
    });
  }
  function buildTrack() {
    var t = $("#track"), one = ""; for (var i = 0; i < 4; i++) one += "<span>" + T("marq") + "</span>";
    t.innerHTML = one + one;
  }
  function buildChips() { $("#chips").innerHTML = T("br_c").map(function (c) { return "<li>" + c + "</li>"; }).join(""); }
  function buildFlipLabels() { $$("#flips small").forEach(function (s, i) { s.textContent = T("units")[i]; }); }

  function applyLang() {
    html.lang = lang; document.title = T("doc_title");
    $$("[data-i18n]").forEach(function (e) { e.textContent = T(e.dataset.i18n); });
    $$("[data-i18n-html]").forEach(function (e) { e.innerHTML = T(e.dataset.i18nHtml); });
    $$("[data-i18n-ph]").forEach(function (e) { e.placeholder = T(e.dataset.i18nPh); });
    $$("[data-name]").forEach(function (e) { e.textContent = C.baby[lang]; });
    var d = $("#dear"); d.textContent = guest ? T("h_dear").replace("{n}", guest) : ""; d.style.display = guest ? "" : "none";
    if (guest && !$("#fName").value) $("#fName").value = guest;
    $("#lang").textContent = lang === "en" ? "తెలుగు" : "English";
    $("#mapBtn").href = C.mapLink; $("#calG").href = gcal();
    buildName(); buildTrack(); buildChips(); buildFlipLabels(); renderStory(true); soundUI();
    if (body.classList.contains("on")) $$("#name .ch").forEach(function (c) { c.style.animation = "none"; c.style.opacity = 1; });
    measurePin(); renderFlips(true);
  }
  $("#lang").addEventListener("click", function () {
    lang = lang === "en" ? "te" : "en"; try { localStorage.setItem("vc_lang", lang); } catch (e) {}
    applyLang(); if (VC.audio) VC.audio.sfx("pop");
  });

  /* ---------- sound ---------- */
  function soundUI() { var m = VC.audio.isMuted(), b = $("#snd"); b.textContent = m ? "🔇" : "🔊"; b.setAttribute("aria-pressed", String(!m)); b.setAttribute("aria-label", m ? T("a_off") : T("a_on")); }
  $("#snd").addEventListener("click", function () { VC.audio.setMuted(!VC.audio.isMuted()); if (!VC.audio.isMuted()) VC.audio.start(); soundUI(); });

  /* ---------- flip clock ---------- */
  var flips = $$("#flips .flip"), cur = [null, null, null, null], target = new Date(C.partyISO).getTime();
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function mk(f) {
    f.innerHTML = '<div class="half top"><span></span></div><div class="half bot"><span></span></div><div class="leaf"><div class="face front"><span></span></div><div class="face back"><span></span></div></div>';
  }
  flips.forEach(mk);
  function setAll(f, top, bot, front, back) {
    $(".top span", f).textContent = top; $(".bot span", f).textContent = bot; $(".front span", f).textContent = front; $(".back span", f).textContent = back;
  }
  function setFlip(i, v, instant) {
    var f = flips[i], old = cur[i];
    if (old === v) return;
    if (old === null || instant || calm) { setAll(f, v, v, v, v); cur[i] = v; return; }
    cur[i] = v; setAll(f, v, old, old, v); f.classList.remove("go"); void f.offsetWidth; f.classList.add("go");
    clearTimeout(f._t); f._t = setTimeout(function () { setAll(f, v, v, v, v); f.classList.remove("go"); }, 640);
  }
  function parts() {
    var d = Math.max(0, target - Date.now()), s = Math.floor(d / 1000);
    return { over: d <= 0, v: [Math.floor(s / 86400), Math.floor(s % 86400 / 3600), Math.floor(s % 3600 / 60), s % 60] };
  }
  function renderFlips(instant) {
    var p = parts();
    $("#flips").hidden = p.over; $("#cdDone").hidden = !p.over; $("#cdDone").textContent = T("cd_done");
    p.v.forEach(function (v, i) { setFlip(i, pad(v), instant); });
  }
  setInterval(function () { if (!document.hidden) renderFlips(false); }, 1000);

  /* ---------- photo story ---------- */
  function frame(src, cap, main, ph) {
    var fig = document.createElement("figure"); fig.className = "frame " + (main ? "main" : "pol");
    var box = main ? '<div class="arch"><div class="img"></div></div>' : '<div class="img"></div>';
    fig.innerHTML = box + "<figcaption>" + cap + "</figcaption>";
    var img = $(".img", fig);
    img.innerHTML = '<div class="ph"><i>🧸</i>' + T("st_add") + "<small>" + src + "</small></div>";
    var im = new Image(); im.alt = cap; im.decoding = "async";
    im.onload = function () { img.innerHTML = ""; img.appendChild(im); };
    im.src = src;
    if (!calm && !main) fig.style.rotate = (Math.random() * 6 - 3).toFixed(1) + "deg";
    return fig;
  }
  var strip = $("#strip"), lbItems = [];
  function renderStory() {
    strip.innerHTML = ""; strip.classList.add("gal"); lbItems = [];
    var set = [frame(C.mainPhoto, T("st_main"), true)];
    C.photos.forEach(function (p) { set.push(frame(p.src, p[lang], false)); });
    set.forEach(function (n, i) {
      if (i > 0 && C.photos[i - 1].wide) n.classList.add("wide");
      n.classList.add("rv"); n.style.setProperty("--d", ((i % 2) * 0.12) + "s"); n.tabIndex = 0; n.setAttribute("role", "button");
      n.addEventListener("click", function () { openLB(i); });
      n.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openLB(i); } });
      strip.appendChild(n); if (typeof io !== "undefined" && io) io.observe(n);
    });
    lbItems = set;
  }
  function measurePin() { if (typeof measureSecs === "function") measureSecs(); }
  function updatePin() {}

  /* lightbox */
  var lb = null, lbI = 0;
  function lbShow(i) {
    lbI = (i + lbItems.length) % lbItems.length;
    var fig = lbItems[lbI], im = $("img", fig), cap = $("figcaption", fig).textContent, box = $(".lb-img", lb);
    box.innerHTML = im ? "" : "<div class=\"lb-ph\">🧸<small>" + T("st_add") + "</small></div>";
    if (im) { var c = new Image(); c.src = im.src; c.alt = im.alt; box.appendChild(c); }
    $(".lb-cap", lb).textContent = cap;
  }
  function openLB(i) {
    if (!lb) {
      lb = document.createElement("div"); lb.id = "lb"; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-modal", "true");
      lb.innerHTML = '<button class="lb-x" aria-label="Close">✕</button><button class="lb-p" aria-label="Previous">‹</button><div class="lb-img"></div><p class="lb-cap"></p><button class="lb-n" aria-label="Next">›</button>';
      body.appendChild(lb);
      lb.addEventListener("click", function (e) { var t = e.target; if (t.classList.contains("lb-p")) lbShow(lbI - 1); else if (t.classList.contains("lb-n")) lbShow(lbI + 1); else if (!t.closest(".lb-img img")) closeLB(); });
      var sx = 0; lb.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
      lb.addEventListener("touchend", function (e) { var d = e.changedTouches[0].clientX - sx; if (Math.abs(d) > 50) lbShow(lbI + (d < 0 ? 1 : -1)); }, { passive: true });
      addEventListener("keydown", function (e) { if (!lb.classList.contains("on")) return; if (e.key === "Escape") closeLB(); else if (e.key === "ArrowRight") lbShow(lbI + 1); else if (e.key === "ArrowLeft") lbShow(lbI - 1); });
    }
    lbShow(i); lb.classList.add("on"); body.classList.add("lb-open"); VC.audio.sfx("pop");
  }
  function closeLB() { lb.classList.remove("on"); body.classList.remove("lb-open"); }

  /* ---------- scroll loop ---------- */
  var secs = $$("[data-sec]"), dots = $("#dots"), par = $$("[data-sp]"), tick = false, lastPaw = 0, lastY = 0, pawSide = 1;
  secs.forEach(function (s) { var a = document.createElement("a"); a.href = "#" + s.id; a.dataset.l = s.dataset.l; a.setAttribute("aria-label", s.dataset.l); dots.appendChild(a); });
  var dotA = $$("a", dots), secTop = [], lastAct = -1;
  function measureSecs() { secTop = secs.map(function (s) { return s.getBoundingClientRect().top + scrollY; }); }
  function paw(x, y, ang) {
    var s = document.createElementNS("http://www.w3.org/2000/svg", "svg"); s.setAttribute("class", "trail"); s.setAttribute("viewBox", "-16 -20 32 38");
    s.innerHTML = '<use href="#paw"/>'; s.style.left = x + "px"; s.style.top = y + "px"; s.style.rotate = ang + "deg";
    body.appendChild(s); setTimeout(function () { s.remove(); }, 2000);
  }
  function onScroll() {
    var y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
    $("#pbar").style.transform = "scaleX(" + (h > 0 ? y / h : 0).toFixed(4) + ")";
    if (VC.gl) VC.gl.setScroll(y);
    if (!calm) {
      var rs = par.map(function (e) { return e.getBoundingClientRect(); });
      par.forEach(function (e, i) { var r = rs[i]; if (r.bottom < -200 || r.top > innerHeight + 200) return; e.style.translate = "0 " + ((r.top + r.height / 2 - innerHeight / 2) * -parseFloat(e.dataset.sp)).toFixed(1) + "px"; });
    }
    var act = 0, mid = innerHeight * .45;
    for (var i = 0; i < secTop.length; i++) if (secTop[i] - y <= mid) act = i;
    if (act !== lastAct) { lastAct = act; dotA.forEach(function (d, i) { d.classList.toggle("on", i === act); }); }
    updatePin();
    if (!calm && body.classList.contains("on") && Math.abs(y - lastY) > 70 && performance.now() - lastPaw > 260) {
      lastPaw = performance.now(); lastY = y; pawSide = -pawSide; paw(innerWidth * (.5 + pawSide * .12) + (Math.random() * 40 - 20), innerHeight * .78, pawSide * 12);
    }
    tick = false;
  }
  addEventListener("scroll", function () { if (!tick) { tick = true; requestAnimationFrame(onScroll); } }, { passive: true });
  var rz; addEventListener("resize", function () { clearTimeout(rz); rz = setTimeout(function () { measurePin(); measureSecs(); onScroll(); }, 150); });

  /* ---------- reveals ---------- */
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { threshold: .18, rootMargin: "0px 0px -6% 0px" });
  $$(".rv,.mask,.mono").forEach(function (e, i) { if (!e.classList.contains("mask")) e.style.setProperty("--d", ((i % 3) * 0.12) + "s"); io.observe(e); });

  /* ---------- teddy ---------- */
  var bear = $("#bear"), eL = $("#eL"), eR = $("#eR");
  addEventListener("pointermove", function (e) {
    var r = bear.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
    var dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height * .38), d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / 260) * 5;
    var t = "translate(" + (dx / d * k).toFixed(2) + "px," + (dy / d * k).toFixed(2) + "px)";
    eL.style.transform = t; eR.style.transform = t;
    if (fine) { var c = $("#cursor"); c.style.transform = "translate(" + e.clientX + "px," + e.clientY + "px)"; }
  }, { passive: true });
  [eL, eR].forEach(function (e) { e.style.transition = "transform .12s"; });
  bear.addEventListener("click", function (e) {
    bear.classList.remove("hop"); void bear.getBoundingClientRect(); bear.classList.add("hop");
    VC.audio.sfx("squeak"); VC.fx.glitter(e.clientX, e.clientY, 26);
    setTimeout(function () { bear.classList.remove("hop"); }, 650);
  });

  /* ---------- cursor, magnetic buttons, trail ---------- */
  if (fine && !calm) {
    body.classList.add("has-cursor");
    var cur2 = $("#cursor"), lastG = 0;
    addEventListener("pointermove", function (e) {
      cur2.style.transform = "translate(" + e.clientX + "px," + e.clientY + "px)";
      var now = performance.now(); if (now - lastG > 45 && body.classList.contains("on")) { lastG = now; VC.fx.trail(e.clientX, e.clientY); }
    }, { passive: true });
    $$("a,button,.bear").forEach(function (e) { e.addEventListener("pointerenter", function () { cur2.classList.add("hot"); }); e.addEventListener("pointerleave", function () { cur2.classList.remove("hot"); }); });
    $$(".mag").forEach(function (b) {
      b.addEventListener("pointermove", function (e) { var r = b.getBoundingClientRect(); b.style.translate = ((e.clientX - r.left - r.width / 2) * .22).toFixed(1) + "px " + ((e.clientY - r.top - r.height / 2) * .3).toFixed(1) + "px"; });
      b.addEventListener("pointerleave", function () { b.style.translate = ""; });
    });
  }

  /* ---------- 3D tilt card ---------- */
  var paper = $("#paper");
  if (fine && !calm) {
    paper.addEventListener("pointermove", function (e) {
      var r = paper.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      paper.style.setProperty("--ry", ((x - .5) * 12).toFixed(2) + "deg"); paper.style.setProperty("--rx", ((.5 - y) * 10).toFixed(2) + "deg");
      paper.style.setProperty("--gx", (x * 100) + "%"); paper.style.setProperty("--gy", (y * 100) + "%"); paper.style.setProperty("--go", ".8");
    });
    paper.addEventListener("pointerleave", function () { ["--rx", "--ry", "--go"].forEach(function (k) { paper.style.setProperty(k, "0"); }); paper.style.setProperty("--go", "0"); });
  }

  /* ---------- calendar & share ---------- */
  function fmt(d) { return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, ""); }
  function span() { var s = new Date(C.partyISO), e = new Date(s.getTime() + C.durationHours * 36e5); return [fmt(s), fmt(e)]; }
  function gcal() {
    var t = span();
    return "https://calendar.google.com/calendar/render?action=TEMPLATE&text=" + encodeURIComponent(T("cal_title")) + "&dates=" + t[0] + "/" + t[1] +
      "&details=" + encodeURIComponent(T("cal_desc") + "\n" + C.siteUrl) + "&location=" + encodeURIComponent(T("cal_loc"));
  }
  function ics() {
    var t = span(), esc = function (s) { return String(s).replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\n/g, "\\n"); };
    var txt = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Vivaah Creations//Invitation//EN", "BEGIN:VEVENT", "UID:saharsh-1st-" + t[0] + "@vivaahcreations.com", "DTSTAMP:" + fmt(new Date()),
      "DTSTART:" + t[0], "DTEND:" + t[1], "SUMMARY:" + esc(T("cal_title")), "LOCATION:" + esc(T("cal_loc")), "DESCRIPTION:" + esc(T("cal_desc") + " " + C.siteUrl), "URL:" + C.mapLink,
      "BEGIN:VALARM", "TRIGGER:-PT3H", "ACTION:DISPLAY", "DESCRIPTION:Saharsh’s birthday today!", "END:VALARM", "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([txt], { type: "text/calendar" })); a.download = "saharsh-first-birthday.ics";
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
  }
  var calBtn = $("#calBtn"), calMenu = $("#calMenu");
  function menu(o) { calMenu.hidden = !o; calBtn.setAttribute("aria-expanded", String(o)); }
  calBtn.addEventListener("click", function (e) { e.stopPropagation(); menu(calMenu.hidden); });
  document.addEventListener("click", function () { menu(false); });
  addEventListener("keydown", function (e) { if (e.key === "Escape") menu(false); });
  $("#calI").addEventListener("click", function () { ics(); menu(false); });
  $("#shareBtn").addEventListener("click", function () {
    var url = C.siteUrl + (guest ? "?to=" + encodeURIComponent(guest) : ""), text = T("share_text");
    if (navigator.share) { navigator.share({ title: T("doc_title"), text: text, url: url }).catch(function () {}); return; }
    var done = function () { toast(T("toast_copied")); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text + " " + url).then(done, done); else done();
  });

  /* ---------- wish / candle ---------- */
  $("#wish").addEventListener("click", function (e) {
    var b = e.currentTarget; if (b.classList.contains("done")) return;
    b.classList.add("done"); $("#cake").classList.add("out"); VC.audio.sfx("pop"); VC.audio.sfx("chime");
    var r = b.getBoundingClientRect(); VC.fx.confetti(r.left + r.width / 2, r.top, 140, -Math.PI / 2, Math.PI * 1.2, 16); VC.fx.glitter(innerWidth / 2, innerHeight * .4, 40);
  });

  /* ---------- RSVP ---------- */
  var gOut = $("#gOut");
  function gset(n) { guests = Math.max(1, Math.min(20, n)); gOut.textContent = guests; }
  $("#gMinus").addEventListener("click", function () { gset(guests - 1); });
  $("#gPlus").addEventListener("click", function () { gset(guests + 1); });
  $$("input[name=att]").forEach(function (r) { r.addEventListener("change", function () { $("#guestsField").style.display = $("#attN").checked ? "none" : ""; }); });
  $("#rsvpForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var n = $("#fName").value.trim(), err = $("#fErr");
    if (!n) { err.textContent = T("f_err"); err.classList.add("show"); $("#fName").focus(); return; }
    err.textContent = ""; err.classList.remove("show");
    var yes = $("#attY").checked, note = $("#fNote").value.trim();
    var msg = (yes ? T("wa_yes").replace("{n}", n).replace("{g}", guests) : T("wa_no").replace("{n}", n)) + (note ? "\n\n“" + note + "”" : "");
    VC.fx.cannons(); VC.audio.sfx("chime");
    setTimeout(function () { window.open("https://wa.me/" + C.whatsapp + "?text=" + encodeURIComponent(msg), "_blank", "noopener"); }, 500);
  });

  /* ---------- brand ---------- */
  var B = C.brand;
  $("#brandName").textContent = B.name; $("#brandpill").href = B.url; $("#brandCta").href = B.url;
  if (B.logo) { $("#mono").innerHTML = '<img src="' + B.logo + '" alt="' + B.name + '">'; }
  var links = $("#brandLinks");
  if (B.whatsapp) links.insertAdjacentHTML("beforeend", '<a class="btn ghost mag" target="_blank" rel="noopener" href="https://wa.me/' + B.whatsapp + '">WhatsApp</a>');
  if (B.instagram) links.insertAdjacentHTML("beforeend", '<a class="btn ghost mag" target="_blank" rel="noopener" href="' + B.instagram + '">Instagram</a>');

  /* ---------- gate ---------- */
  var gate = $("#gate"), seal = $("#seal"), opened = false;
  function openGate() {
    if (opened) return; opened = true;
    VC.audio.start(); VC.audio.sfx("pop"); soundUI();
    var r = seal.getBoundingClientRect(); VC.fx.shards(r.left + r.width / 2, r.top + r.height * .55, 30);
    gate.classList.add("go");
    setTimeout(function () { gate.classList.add("zoom"); VC.fx.cannons(); }, calm ? 0 : 900);
    setTimeout(function () { gate.classList.add("part"); body.classList.remove("is-locked"); body.classList.add("on"); onScroll(); }, calm ? 100 : 1700);
    setTimeout(function () { gate.remove(); }, calm ? 800 : 3000);
  }
  seal.addEventListener("click", openGate);
  $(".skip").addEventListener("click", function () { if (!opened) { opened = true; VC.audio.start(); gate.remove(); body.classList.remove("is-locked"); body.classList.add("on"); } });
  if (qs.get("open") === "1") { gate.remove(); body.classList.remove("is-locked"); body.classList.add("on"); opened = true; }

  applyLang(); onScroll();
  addEventListener("load", function () { measurePin(); onScroll(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { measurePin(); onScroll(); });
})();

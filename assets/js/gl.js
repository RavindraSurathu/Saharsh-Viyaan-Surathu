/* WebGL "molten chocolate" background: domain-warped fbm noise + gold dust.
   Falls back to a CSS gradient if WebGL is unavailable. */
(function () {
  "use strict";
  var VC = window.VC = window.VC || {};
  var cv = document.getElementById("gl");
  var calm = matchMedia("(prefers-reduced-motion:reduce)").matches;
  var gl = null;
  try { gl = cv.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power" }); } catch (e) {}
  if (!gl) { document.documentElement.classList.add("no-gl"); VC.gl = { boost: function () {}, setScroll: function () {} }; return; }

  var small = Math.min(innerWidth, innerHeight) < 700;
  var VS = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";
  var FS = [
    "#ifdef GL_FRAGMENT_PRECISION_HIGH", "precision highp float;", "#else", "precision mediump float;", "#endif",
    "uniform vec2 uRes;uniform float uTime;uniform vec2 uMouse;uniform float uScroll;uniform float uBoost;",
    "float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}",
    "float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);",
    " return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}",
    "float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<OCT;i++){v+=a*noise(p);p=p*2.02+vec2(3.1,1.7);a*=.5;}return v;}",
    "void main(){",
    " vec2 uv=gl_FragCoord.xy/uRes;float asp=uRes.x/uRes.y;",
    " vec2 p=(uv-.5)*vec2(asp,1.)*2.4;float t=uTime*.045;",
    " vec2 q=vec2(fbm(p+vec2(0.,t)),fbm(p+vec2(5.2,1.3)-t));",
    " vec2 r=vec2(fbm(p+3.*q+vec2(1.7,9.2)+t*1.3),fbm(p+3.*q+vec2(8.3,2.8)-t*1.1));",
    " float f=fbm(p+3.*r+vec2(0.,uScroll*.0004));",
    " vec3 c0=vec3(.055,.027,.016),c1=vec3(.16,.08,.05),c2=vec3(.42,.24,.12),c3=vec3(.93,.76,.45);",
    " vec3 col=mix(c0,c1,smoothstep(.15,.7,f));",
    " col=mix(col,c2,smoothstep(.45,1.,f*length(q)*1.35)*.7);",
    " col+=c3*pow(smoothstep(.62,1.,f*r.x*1.9),3.)*.38;",
    " float d=distance(uv*vec2(asp,1.),uMouse*vec2(asp,1.));",
    " col+=vec3(.95,.62,.26)*.16*exp(-d*3.2)*(1.+uBoost);",
    " vec2 gp=gl_FragCoord.xy/(uRes.y/140.);vec2 gi=floor(gp);vec2 gf=fract(gp)-.5;float h=hash(gi);",
    " float tw=.5+.5*sin(uTime*(1.5+h*3.)+h*60.);",
    " col+=c3*step(.995,h)*tw*smoothstep(.5,0.,length(gf))*.9;",
    " col*=1.-.55*pow(length((uv-.5)*vec2(1.,1.1))*1.2,2.);",
    " gl_FragColor=vec4(col,1.);",
    "}"
  ].join("\n").replace(/OCT/g, small ? "3" : "4");

  function sh(type, src) {
    var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.error("shader:", gl.getShaderInfoLog(s)); return null; }
    return s;
  }
  var vs = sh(gl.VERTEX_SHADER, VS), fs = sh(gl.FRAGMENT_SHADER, FS);
  var prog = gl.createProgram();
  if (!vs || !fs) { document.documentElement.classList.add("no-gl"); VC.gl = { boost: function () {}, setScroll: function () {} }; return; }
  gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { console.error("link:", gl.getProgramInfoLog(prog)); document.documentElement.classList.add("no-gl"); VC.gl = { boost: function () {}, setScroll: function () {} }; return; }
  gl.useProgram(prog);

  var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  var loc = gl.getAttribLocation(prog, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  var U = {}; ["uRes", "uTime", "uMouse", "uScroll", "uBoost"].forEach(function (n) { U[n] = gl.getUniformLocation(prog, n); });

  var scale = small ? 0.45 : 0.6, W = 0, H = 0;
  function resize() {
    W = Math.max(2, Math.ceil(innerWidth * scale)); H = Math.max(2, Math.ceil(innerHeight * scale));
    cv.width = W; cv.height = H; gl.viewport(0, 0, W, H); draw(performance.now());
  }
  var mx = .5, my = .55, tx = .5, ty = .55, scroll = 0, boost = 0, t0 = performance.now(), last = 0, frame = 0, paused = false;
  addEventListener("pointermove", function (e) { tx = e.clientX / innerWidth; ty = 1 - e.clientY / innerHeight; }, { passive: true });

  function draw(now) {
    mx += (tx - mx) * .06; my += (ty - my) * .06; boost *= .95;
    gl.uniform2f(U.uRes, W, H);
    gl.uniform1f(U.uTime, calm ? 12 : (now - t0) / 1000);
    gl.uniform2f(U.uMouse, mx, my);
    gl.uniform1f(U.uScroll, scroll);
    gl.uniform1f(U.uBoost, boost);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  function loop(now) {
    requestAnimationFrame(loop);
    if (paused || calm) return;
    frame++; if (small && (frame & 1)) return;      // 30fps on phones
    draw(now);
  }
  document.addEventListener("visibilitychange", function () { paused = document.hidden; });
  var rt; addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(resize, 150); });
  resize();
  document.documentElement.classList.add("has-gl");
  if (!calm) requestAnimationFrame(loop);

  VC.gl = { boost: function () { boost = 1.6; }, setScroll: function (y) { scroll = y; } };
})();

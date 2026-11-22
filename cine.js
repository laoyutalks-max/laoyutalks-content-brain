/* LAOYUTALKS — homepage cinematic 3D story (index.html).
   three.js r170 (ES modules via importmap, loaded on demand) + EffectComposer (depth of field, bloom)
   + GSAP 3.12.5 ScrollTrigger + Lenis 1.1.13. All 3D models are procedural; screens show sample data only.
   Without WebGL, on "save data", or if a library fails, the page still works: text, links and normal scrolling. */
let THREE, EffectComposer, RenderPass, BokehPass, UnrealBloomPass, OutputPass, RoomEnvironment;

const gsap = window.gsap, ScrollTrigger = window.ScrollTrigger, LenisC = window.Lenis;
const cine = document.querySelector(".cine");
const stage = document.getElementById("cineGl");
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const CY = 0x35c8ff, ORANGE = 0xff6a00, GREEN = 0x3ddc84;
const FX = 2; // layer drawn after depth of field (sparks, weld core) so it stays crisp

/* ======================= Scroll + text (works even if WebGL fails) ======================= */
let lenis = null;
if (cine && gsap && ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
  document.documentElement.classList.add("cine-js");
  if (!reduce && LenisC) {
    /* page-wide smooth scrolling; panels that scroll on their own (search sidebar, chat, text boxes) are left alone */
    lenis = new LenisC({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 0.9,
      prevent: (node) => !!(node.closest && node.closest(".sbBody, .sbPanel, .lyChat, .lyLog, textarea, select, [data-lenis-prevent]")) });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  initText();
}

function initText() {
  const chs = gsap.utils.toArray(cine.querySelectorAll(".cineCh"));
  if (!reduce) {
    /* hero entrance: brush ring draws, words rise */
    const paths = gsap.utils.toArray(cine.querySelectorAll(".ring path"));
    paths.forEach((p) => { const L = p.getTotalLength(); gsap.set(p, { strokeDasharray: L, strokeDashoffset: L }); });
    gsap.timeline({ defaults: { ease: "power3.out" }, delay: 0.15 })
      .to(paths, { strokeDashoffset: 0, duration: 1.6, stagger: 0.12, ease: "power2.inOut" }, 0)
      .from(cine.querySelector(".brand .bt"), { autoAlpha: 0, y: 26, filter: "blur(8px)", duration: 1.1 }, 0.35)
      .from(cine.querySelector("h1"), { autoAlpha: 0, y: 24, duration: 0.9 }, 0.75)
      .from(cine.querySelectorAll(".cineActions .cineBtn"), { autoAlpha: 0, y: 18, duration: 0.8, stagger: 0.08 }, 0.9);
    /* hero text drifts up and fades as the camera starts moving */
    gsap.to([cine.querySelector(".brand"), cine.querySelector(".cineCopy")], { yPercent: -18, autoAlpha: 0, ease: "none", stagger: 0.04,
      scrollTrigger: { trigger: chs[0], start: "top top", end: "60% top", scrub: 0.6 } });
    /* chapter cards: staggered reveal on enter, reverse on leave */
    chs.slice(1).forEach((sec) => {
      const box = sec.querySelector(".cineStory");
      const tl = gsap.timeline({ paused: true, defaults: { ease: "power3.out", duration: 0.9 } })
        .fromTo(box, { autoAlpha: 0, y: 40, filter: "blur(6px)" }, { autoAlpha: 1, y: 0, filter: "blur(0px)" }, 0)
        .fromTo(box.children, { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, stagger: 0.07 }, 0.12);
      ScrollTrigger.create({ trigger: sec, start: "top 55%", end: "bottom 45%",
        onEnter: () => tl.play(), onEnterBack: () => tl.play(), onLeave: () => tl.reverse(), onLeaveBack: () => tl.reverse() });
    });
  }
  /* chapter dots + chapter index (drives which 3D pin is shown) */
  const dots = cine.querySelector(".cineDots");
  chs.forEach((s, i) => {
    const a = document.createElement("a"); a.href = "#" + s.id; a.setAttribute("aria-label", "Chapter " + (i + 1)); dots.appendChild(a);
    a.addEventListener("click", (e) => { e.preventDefault(); if (lenis) lenis.scrollTo(s, { duration: 1.4 }); else s.scrollIntoView({ behavior: reduce ? "auto" : "smooth" }); });
  });
  let cur = -1;
  const setCh = (ch) => { if (ch === cur) return; cur = ch; cine.dataset.ch = ch; [...dots.children].forEach((d, k) => d.classList.toggle("on", k === ch)); };
  ScrollTrigger.create({ trigger: cine, start: "top top", end: "bottom bottom", onUpdate: (self) => setCh(Math.round(self.progress * (chs.length - 1))) });
  setCh(0);
}

/* ======================= 3D scene ======================= */
const conn = navigator.connection || {};
/* skip the heavy 3D scene on "save data", slow mobile networks (2G/3G) or low-memory devices; the text story still runs */
const lite = !!conn.saveData || /(^|-)(2g|3g)$/.test(conn.effectiveType || "") || (navigator.deviceMemory && navigator.deviceMemory <= 2);
let gl = null;
if (stage && !lite) { try { gl = document.createElement("canvas").getContext("webgl2"); } catch (e) {} }
async function loadThree() {
  const m = await Promise.all([import("three"), import("three/addons/postprocessing/EffectComposer.js"), import("three/addons/postprocessing/RenderPass.js"),
    import("three/addons/postprocessing/BokehPass.js"), import("three/addons/postprocessing/UnrealBloomPass.js"), import("three/addons/postprocessing/OutputPass.js"),
    import("three/addons/environments/RoomEnvironment.js")]);
  THREE = m[0]; ({ EffectComposer } = m[1]); ({ RenderPass } = m[2]); ({ BokehPass } = m[3]); ({ UnrealBloomPass } = m[4]); ({ OutputPass } = m[5]); ({ RoomEnvironment } = m[6]);
}
if (gl) loadThree().then(build, (e) => console.warn("3D scene unavailable:", e && e.message));

function build() {
  const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance" });
  const phone = innerWidth < 760;
  let maxDpr = phone ? 1 : Math.min(devicePixelRatio || 1, 1.5);
  renderer.setPixelRatio(maxDpr);
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = !phone; renderer.shadowMap.type = THREE.PCFShadowMap;
  stage.prepend(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050c1a);
  scene.fog = new THREE.FogExp2(0x0a1630, 0.04);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  scene.environment = pmrem.fromScene(room, 0.04).texture; room.dispose(); pmrem.dispose();
  scene.environmentIntensity = 0.28; // studio reflections on glossy parts, kept low for a dark hall
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 120);
  const fxCam = camera.clone();

  /* ---------- helpers ---------- */
  const M = (c, o) => new THREE.MeshStandardMaterial(Object.assign({ color: c, metalness: 0.6, roughness: 0.4 }, o || {}));
  const E = (c, i) => new THREE.MeshStandardMaterial({ color: 0x000000, emissive: c, emissiveIntensity: i || 2 });
  const HDR = (r, g, b) => new THREE.MeshBasicMaterial({ color: new THREE.Color(r, g, b), toneMapped: true });
  const mesh = (geo, mat, cast = true) => { const o = new THREE.Mesh(geo, mat); o.castShadow = cast; o.receiveShadow = true; return o; };
  const box = (w, h, d, m) => mesh(new THREE.BoxGeometry(w, h, d), m);
  const cyl = (a, b, h, m, s) => mesh(new THREE.CylinderGeometry(a, b, h, s || 32), m);
  const cap = (r, l, m) => mesh(new THREE.CapsuleGeometry(r, l, 8, 24), m);
  function tex(w, h, draw) { const c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d"), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }

  /* ---------- lighting: warm golden key from the left, cool blue fill, IBL reflections ---------- */
  scene.add(new THREE.HemisphereLight(0x6f9fd8, 0x0a0806, 0.35));
  const key = new THREE.DirectionalLight(0xffb062, 3.2); key.position.set(-9, 7, 7); key.target.position.set(3.5, 1, 1);
  key.castShadow = true; key.shadow.mapSize.set(1024, 1024); key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02;
  Object.assign(key.shadow.camera, { left: -5, right: 5, top: 5, bottom: -3, near: 2, far: 30 });
  scene.add(key, key.target);
  const fill = new THREE.DirectionalLight(0x5f9cff, 1.4); fill.position.set(8, 4, 4); scene.add(fill);
  const back = new THREE.DirectionalLight(0x7fd4ff, 1.6); back.position.set(-2, 6, -20); scene.add(back);
  const rimR = new THREE.SpotLight(0x9fd0ff, 120, 14, 0.5, 0.7, 2); rimR.position.set(9, 5, -2); rimR.target.position.set(5, 2, 1.5); scene.add(rimR, rimR.target);
  [-3, -11, -19, -27].forEach((z) => { const p = new THREE.PointLight(CY, 12, 12, 2); p.position.set(0, 5, z); scene.add(p); });
  const warmHall = new THREE.PointLight(0xffa04a, 30, 18, 2); warmHall.position.set(-6, 4, -8); scene.add(warmHall);

  /* ---------- hall ---------- */
  const floor = mesh(new THREE.PlaneGeometry(40, 70), M(0x0b1526, { metalness: 0.65, roughness: 0.42 }), false);
  floor.rotation.x = -Math.PI / 2; floor.position.z = -18; scene.add(floor);
  const grid = new THREE.GridHelper(40, 40, 0x123a66, 0x0c2647); grid.position.set(0, 0.005, -18); grid.scale.z = 1.75; grid.material.transparent = true; grid.material.opacity = 0.35; scene.add(grid);
  [-1.25, 1.25].forEach((x) => { const lane = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 60), E(CY, 1.8)); lane.rotation.x = -Math.PI / 2; lane.position.set(x, 0.01, -22); scene.add(lane); });
  const pillarM = M(0x111f36, { metalness: 0.5, roughness: 0.55 });
  for (let z = 4; z > -46; z -= 7) for (const x of [-7.5, 7.5]) {
    const p = box(0.7, 9, 0.7, pillarM); p.position.set(x, 4.5, z); scene.add(p);
    const stripe = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 7), E(CY, 1.6)); stripe.position.set(x + (x < 0 ? 0.36 : -0.36), 4.5, z); stripe.rotation.y = x < 0 ? Math.PI / 2 : -Math.PI / 2; scene.add(stripe);
  }
  for (let z = 4; z > -46; z -= 7) { const b = box(15.5, 0.35, 0.4, M(0x0d1a2e)); b.position.set(0, 9, z); scene.add(b); }
  const lampM = E(0xd8f0ff, 3.2);
  for (let z = 0; z > -42; z -= 7) for (const x of [-3.2, 3.2]) { const l = box(0.5, 0.08, 2.4, lampM); l.position.set(x, 8.6, z); scene.add(l); }
  /* warm light shafts from the left (blurred by DOF in the hero) */
  const shaftT = tex(64, 256, (g, w, h) => { const r = g.createLinearGradient(0, 0, 0, h); r.addColorStop(0, "rgba(255,190,110,0)"); r.addColorStop(0.25, "rgba(255,180,90,.9)"); r.addColorStop(1, "rgba(255,150,60,0)"); g.fillStyle = r; g.fillRect(0, 0, w, h);
    const s = g.createLinearGradient(0, 0, w, 0); s.addColorStop(0, "rgba(0,0,0,1)"); s.addColorStop(0.5, "rgba(0,0,0,0)"); s.addColorStop(1, "rgba(0,0,0,1)"); g.globalCompositeOperation = "destination-out"; g.fillStyle = s; g.fillRect(0, 0, w, h); });
  const shaftM = new THREE.MeshBasicMaterial({ map: shaftT, color: 0xffb468, transparent: true, opacity: 0.14, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
  for (let k = 0; k < 7; k++) { const s = new THREE.Mesh(new THREE.PlaneGeometry(0.9 + Math.random() * 1.6, 22), shaftM); s.position.set(-7 + k * 0.9, 4, -2 - k * 2.6); s.rotation.set(0.1, 0.5, -1.05 + k * 0.03); scene.add(s); }

  /* ---------- production line ---------- */
  const darkM = M(0x16263f), steel = M(0xaab8cc, { metalness: 0.95, roughness: 0.22 });
  const belt = box(1.6, 0.14, 56, M(0x0e1a2d, { roughness: 0.8 })); belt.position.set(0, 0.8, -22); scene.add(belt);
  for (const x of [-0.84, 0.84]) { const r = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 56), E(CY, 2)); r.position.set(x, 0.9, -22); scene.add(r); }
  for (let z = 4; z > -50; z -= 2.5) { const leg = box(1.4, 0.74, 0.12, darkM); leg.position.set(0, 0.37, z); scene.add(leg); }
  const parts = []; for (let i = 0; i < 22; i++) { const pt = box(0.45, 0.3, 0.45, steel); pt.position.set(0, 1.02, 5 - i * 2.5); scene.add(pt); parts.push(pt); }
  const gate = new THREE.Group(); gate.position.set(0, 0, -9); scene.add(gate);
  for (const x of [-1.1, 1.1]) { const g = box(0.16, 2.4, 0.16, darkM); g.position.set(x, 1.2, 0); gate.add(g); }
  const gt = box(2.4, 0.2, 0.3, darkM); gt.position.y = 2.4; gate.add(gt);
  const scan = new THREE.Mesh(new THREE.PlaneGeometry(2, 0.04), E(GREEN, 6)); scan.position.y = 1.3; gate.add(scan);

  /* ---------- refined procedural robot arm (glossy white, orange accents) ---------- */
  const white = new THREE.MeshPhysicalMaterial({ color: 0xf2f4f7, metalness: 0, roughness: 0.26, clearcoat: 1, clearcoatRoughness: 0.07 });
  const grey = M(0x2e3542, { metalness: 0.75, roughness: 0.32 }), black = M(0x12161d, { metalness: 0.4, roughness: 0.45 });
  const accent = M(ORANGE, { metalness: 0.2, roughness: 0.35 }), copper = M(0xb87333, { metalness: 1, roughness: 0.3 });
  function joint(r, len, parent) { const g = new THREE.Group(); const j = cyl(r, r, len, black); j.rotation.x = Math.PI / 2; g.add(j);
    for (const s of [-1, 1]) { const c = cyl(r * 1.04, r * 1.04, len * 0.16, white); c.rotation.x = Math.PI / 2; c.position.z = s * len * 0.46; g.add(c);
      const ring = mesh(new THREE.TorusGeometry(r * 0.72, r * 0.07, 10, 40), accent); ring.position.z = s * len * 0.55; g.add(ring); }
    parent.add(g); return g; }
  function link(r, len, y, parent) { const l = cap(r, len, white); l.scale.set(1, 1, 0.8); l.position.y = y; parent.add(l);
    const strip = box(r * 0.28, len * 0.55, 0.012, grey); strip.position.set(0, y, r * 0.8 + 0.005); parent.add(strip); return l; }
  function buildArm(withTorch) {
    const a = { root: new THREE.Group() };
    const plinth = cyl(0.66, 0.74, 0.16, grey, 40); plinth.position.y = 0.08; a.root.add(plinth);
    for (let k = 0; k < 10; k++) { const b = cyl(0.03, 0.03, 0.05, steel, 8); const an = (k / 10) * Math.PI * 2; b.position.set(Math.cos(an) * 0.62, 0.18, Math.sin(an) * 0.62); a.root.add(b); }
    const fb = cyl(0.5, 0.56, 0.36, white, 40); fb.position.y = 0.34; a.root.add(fb);
    const band = cyl(0.565, 0.565, 0.05, accent, 40); band.position.y = 0.2; a.root.add(band);
    a.tur = new THREE.Group(); a.tur.position.y = 0.5; a.root.add(a.tur);
    const ft = cyl(0.4, 0.48, 0.42, white, 40); ft.position.y = 0.21; a.tur.add(ft);
    const motor = cyl(0.16, 0.16, 0.42, grey, 24); motor.position.set(-0.32, 0.42, -0.1); a.tur.add(motor);
    a.sh = new THREE.Group(); a.sh.position.y = 0.55; a.tur.add(a.sh);
    joint(0.3, 0.66, a.sh); link(0.2, 1.4, 0.9, a.sh);
    const cable = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0.05, 0.1, 0.26), new THREE.Vector3(0.12, 0.9, 0.3), new THREE.Vector3(0.05, 1.7, 0.27)]), 20, 0.03, 8), black); a.sh.add(cable);
    a.el = new THREE.Group(); a.el.position.y = 1.8; a.sh.add(a.el);
    joint(0.24, 0.54, a.el); link(0.15, 1.2, 0.75, a.el);
    a.wr = new THREE.Group(); a.wr.position.y = 1.5; a.el.add(a.wr);
    joint(0.13, 0.34, a.wr);
    const flange = cyl(0.1, 0.1, 0.06, steel, 24); flange.position.y = 0.16; a.wr.add(flange);
    if (withTorch) {
      const tool = cyl(0.065, 0.05, 0.36, grey, 20); tool.position.y = 0.36; a.wr.add(tool);
      const noz = cyl(0.05, 0.025, 0.12, copper, 20); noz.position.y = 0.6; a.wr.add(noz);
      const hose = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0.08, 0.3, 0), new THREE.Vector3(0.25, -0.2, 0.05), new THREE.Vector3(0.2, -0.9, 0.18)]), 16, 0.025, 8), black); a.wr.add(hose);
    } else {
      for (const s of [-1, 1]) { const f = box(0.04, 0.2, 0.08, grey); f.position.set(s * 0.07, 0.28, 0); a.wr.add(f); }
      const led = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 8), E(CY, 8)); led.position.y = 0.2; a.wr.add(led);
    }
    a.tip = new THREE.Object3D(); a.tip.position.y = 0.67; a.wr.add(a.tip);
    return a;
  }
  const arms = [];
  [[-1.9, -2.5, false], [1.9, -7, true], [-1.9, -13.5, false], [1.9, -19, true], [-1.9, -25, false]].forEach(([x, z, flip], i) => {
    const a = buildArm(false); a.root.position.set(x, 0, z); a.root.rotation.y = flip ? Math.PI : 0; a.root.scale.setScalar(0.72); scene.add(a.root); a.ph = i * 1.3; arms.push(a);
  });

  /* ---------- machines + screens ---------- */
  const scrT = tex(256, 160, (g, w, h) => { g.fillStyle = "#06203f"; g.fillRect(0, 0, w, h); g.strokeStyle = "#35c8ff"; g.lineWidth = 4; g.beginPath();
    [110, 90, 100, 70, 80, 50, 60, 40].forEach((y, k) => (k ? g.lineTo(20 + k * 30, y) : g.moveTo(20, y))); g.stroke(); g.fillStyle = "#3ddc84"; g.fillRect(20, 130, 150, 10); });
  const scrM = new THREE.MeshBasicMaterial({ map: scrT, color: new THREE.Color(1.6, 1.6, 1.6) });
  const machM = M(0x14284a, { metalness: 0.55, roughness: 0.4 });
  for (let z = -4; z > -40; z -= 7) for (const x of [-4.6, 4.6]) {
    const m = box(2.2, 2.2, 2.6, machM); m.position.set(x, 1.1, z); scene.add(m);
    const top = box(1.2, 0.5, 1.6, darkM); top.position.set(x, 2.45, z); scene.add(top);
    const s = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.62), scrM); s.position.set(x + (x < 0 ? 1.11 : -1.11), 1.4, z); s.rotation.y = x < 0 ? Math.PI / 2 : -Math.PI / 2; scene.add(s);
    const lt = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 8), E(x < 0 ? GREEN : CY, 10)); lt.position.set(x, 2.8, z + 0.5); scene.add(lt);
  }

  /* ---------- AI core + dashboard ---------- */
  const core = new THREE.Group(); core.position.set(0, 5, -15); scene.add(core);
  const dieT = tex(256, 256, (g, w) => { g.fillStyle = "#06142a"; g.fillRect(0, 0, w, w); g.strokeStyle = "#35c8ff"; g.lineWidth = 3;
    for (let k = 0; k < 14; k++) { const p = 20 + k * 16; g.beginPath(); g.moveTo(p, 0); g.lineTo(p, 60); g.lineTo(128, 100); g.stroke(); g.beginPath(); g.moveTo(p, 256); g.lineTo(p, 196); g.lineTo(128, 156); g.stroke(); }
    g.fillStyle = "#0a2850"; g.fillRect(84, 84, 88, 88); g.strokeRect(84, 84, 88, 88); g.fillStyle = "#cff4ff"; g.font = "700 48px Arial"; g.textAlign = "center"; g.fillText("AI", 128, 145); });
  const chip = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.2, 2.2), [darkM, darkM, new THREE.MeshStandardMaterial({ map: dieT, emissiveMap: dieT, emissive: 0xffffff, emissiveIntensity: 2.2 }), darkM, darkM, darkM]);
  chip.rotation.x = 0.5; core.add(chip);
  const ringM = E(CY, 4);
  const r1 = new THREE.Mesh(new THREE.TorusGeometry(1.9, 0.015, 6, 90), ringM), r2 = r1.clone(); r2.scale.setScalar(1.25); core.add(r1, r2);
  const dashT = tex(512, 300, (g, w, h) => { g.fillStyle = "rgba(6,28,58,.8)"; g.fillRect(0, 0, w, h); g.strokeStyle = "#35c8ff"; g.lineWidth = 3; g.strokeRect(2, 2, w - 4, h - 4);
    g.fillStyle = "#9fd8ff"; g.font = "600 22px Arial"; g.fillText("LINE A · SAMPLE", 24, 40);
    [0.6, 0.72, 0.66, 0.84, 0.9, 0.78, 0.95, 0.88, 0.8].forEach((v, k) => { g.fillStyle = k === 6 ? "#3ddc84" : "rgba(53,200,255,.85)"; g.fillRect(28 + k * 52, 270 - v * 190, 32, v * 190); }); });
  const dash = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 1.9), new THREE.MeshBasicMaterial({ map: dashT, transparent: true, side: THREE.DoubleSide, depthWrite: false }));
  dash.position.set(-4.4, 4.6, -6); dash.rotation.y = 0.55; scene.add(dash);

  /* ---------- engineer character ---------- */
  const hero = new THREE.Group(); hero.position.set(-3.4, 0, 2.5); hero.rotation.y = 0.9; hero.scale.setScalar(1.08); scene.add(hero);
  const suit = M(0x1b2d4a, { metalness: 0.1, roughness: 0.75 }), skin = M(0xc9a184, { metalness: 0, roughness: 0.6 }), boot = M(0x0b1220, { roughness: 0.6 });
  const hiVis = E(CY, 2.2), hat = new THREE.MeshPhysicalMaterial({ color: ORANGE, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.1 });
  for (const x of [-0.13, 0.13]) { const l = cap(0.1, 0.72, suit); l.position.set(x, 0.5, 0); hero.add(l); const bt = box(0.18, 0.1, 0.3, boot); bt.position.set(x, 0.05, 0.05); hero.add(bt); }
  const torso = new THREE.Group(); torso.position.y = 1.0; hero.add(torso);
  const body = cap(0.22, 0.42, suit); body.scale.set(1.1, 1, 0.72); body.position.y = 0.28; torso.add(body);
  for (const y of [0.15, 0.38]) { const s = new THREE.Mesh(new THREE.CylinderGeometry(0.247, 0.247, 0.035, 28, 1, true), hiVis); s.scale.set(1.1, 1, 0.72); s.position.y = y; torso.add(s); }
  const neck = cyl(0.06, 0.07, 0.1, skin); neck.position.y = 0.62; torso.add(neck);
  const head = new THREE.Group(); head.position.y = 0.76; torso.add(head);
  const hd = mesh(new THREE.SphereGeometry(0.13, 24, 18), skin); hd.scale.set(0.92, 1.08, 1); head.add(hd);
  const dome = mesh(new THREE.SphereGeometry(0.152, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), hat); dome.position.y = 0.04; head.add(dome);
  const brim = cyl(0.19, 0.19, 0.018, hat); brim.position.set(0, 0.045, 0.03); head.add(brim);
  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.055, 0.03), E(CY, 4)); visor.position.set(0, 0, 0.118); head.add(visor);
  for (const sx of [-1, 1]) { const sh = new THREE.Group(); sh.position.set(sx * 0.27, 0.52, 0); torso.add(sh);
    const up = cap(0.065, 0.26, suit); up.position.y = -0.18; sh.add(up); const el = new THREE.Group(); el.position.y = -0.36; sh.add(el);
    const fo = cap(0.055, 0.24, suit); fo.position.y = -0.16; el.add(fo); const hand = mesh(new THREE.SphereGeometry(0.05, 12, 10), skin); hand.position.y = -0.32; el.add(hand);
    sh.rotation.set(-0.35, 0, sx * 0.12); el.rotation.x = -1.2; }
  const tabT = tex(256, 170, (g, w, h) => { g.fillStyle = "#04162e"; g.fillRect(0, 0, w, h); g.fillStyle = "#35c8ff"; g.font = "700 26px Arial"; g.fillText("OEE 78%", 16, 40);
    g.lineWidth = 12; g.strokeStyle = "rgba(53,200,255,.2)"; g.beginPath(); g.arc(200, 100, 38, Math.PI * 0.75, Math.PI * 2.25); g.stroke();
    g.strokeStyle = "#3ddc84"; g.beginPath(); g.arc(200, 100, 38, Math.PI * 0.75, Math.PI * 1.92); g.stroke();
    g.fillStyle = "rgba(53,200,255,.85)"; [40, 60, 50, 75].forEach((v, k) => g.fillRect(16 + k * 30, 150 - v, 18, v)); });
  const tablet = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.23, 0.014), [boot, boot, boot, boot, new THREE.MeshBasicMaterial({ map: tabT, color: new THREE.Color(1.5, 1.5, 1.5) }), boot]);
  tablet.position.set(0, 0.2, 0.36); tablet.rotation.x = -0.75; torso.add(tablet);
  const heroFill = new THREE.PointLight(0xbfe6ff, 8, 6, 2); heroFill.position.set(-1.2, 2.2, 5.0); scene.add(heroFill);
  const pad = new THREE.Mesh(new THREE.RingGeometry(0.55, 0.6, 48), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.6, 2.2, 3), transparent: true, opacity: 0.6 })); pad.rotation.x = -Math.PI / 2; pad.position.set(-3.4, 0.02, 2.5); scene.add(pad);

  /* ---------- hero: welding robot, bench, sparks ---------- */
  const fg = buildArm(true); fg.root.position.set(5.7, 0, 1.5); fg.root.rotation.y = Math.PI; fg.root.scale.setScalar(1.3); scene.add(fg.root);
  fg.sh.rotation.z = -0.35; fg.el.rotation.z = -2.1; fg.wr.rotation.z = -0.69;
  const bench = box(1.0, 1.0, 1.1, grey); bench.position.set(3.65, 0.5, 1.5); scene.add(bench);
  const benchTop = box(1.08, 0.04, 1.18, black); benchTop.position.set(3.65, 1.0, 1.5); scene.add(benchTop);
  const plate = box(0.8, 0.06, 0.8, M(0x9aa5b4, { metalness: 0.95, roughness: 0.25 })); plate.position.set(3.65, 1.05, 1.5); scene.add(plate);
  const seam = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.012, 0.02), HDR(3, 1.1, 0.3)); seam.position.set(3.7, 1.085, 1.5); scene.add(seam);
  const weldCore = new THREE.Mesh(new THREE.SphereGeometry(0.035, 16, 12), HDR(14, 9, 5)); weldCore.layers.set(FX); scene.add(weldCore);
  const weldLight = new THREE.PointLight(0xff9a3c, 12, 7, 2); scene.add(weldLight);
  const SN = reduce ? 0 : phone ? 130 : 260, sPos = new Float32Array(Math.max(SN, 1) * 3), sVel = new Float32Array(SN * 3), sLife = new Float32Array(SN);
  const sg = new THREE.BufferGeometry(); sg.setAttribute("position", new THREE.BufferAttribute(sPos, 3));
  const sparkT = tex(32, 32, (g) => { const r = g.createRadialGradient(16, 16, 0, 16, 16, 16); r.addColorStop(0, "#fff"); r.addColorStop(0.35, "rgba(255,255,255,.6)"); r.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = r; g.fillRect(0, 0, 32, 32); });
  const sparks = new THREE.Points(sg, new THREE.PointsMaterial({ map: sparkT, color: new THREE.Color(5, 2.6, 0.9), size: 0.065, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
  sparks.layers.set(FX); sparks.frustumCulled = false; scene.add(sparks);
  const tipW = new THREE.Vector3(), fgCenter = new THREE.Vector3(4.4, 1.9, 1.5);

  /* ---------- dust in the light ---------- */
  const N = 500, dpos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) { dpos[i * 3] = (Math.random() - 0.5) * 14; dpos[i * 3 + 1] = Math.random() * 8; dpos[i * 3 + 2] = 6 - Math.random() * 40; }
  const dg = new THREE.BufferGeometry(); dg.setAttribute("position", new THREE.BufferAttribute(dpos, 3));
  const dust = new THREE.Points(dg, new THREE.PointsMaterial({ map: sparkT, color: 0xffd7a0, size: 0.06, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false }));
  dust.layers.set(FX); scene.add(dust);

  /* ---------- post-processing: scene → depth of field → crisp FX layer → bloom → output ---------- */
  const composer = new EffectComposer(renderer);
  const mainPass = new RenderPass(scene, camera); composer.addPass(mainPass);
  const bokeh = new BokehPass(scene, camera, { focus: 7, aperture: 0.0016, maxblur: 0.009 }); composer.addPass(bokeh);
  const fxPass = new RenderPass(scene, fxCam); fxPass.clear = false; composer.addPass(fxPass);
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.45, 0.4, 1.6); composer.addPass(bloom);
  composer.addPass(new OutputPass());
  /* a Color background forces a clear inside every scene render, which would wipe the image in the
     overlay pass and fill the DOF depth buffer with "near" — hide it during those two passes */
  for (const p of [bokeh, fxPass]) { const r = p.render.bind(p); p.render = (...args) => { const bg = scene.background; scene.background = null; r(...args); scene.background = bg; }; }

  /* ---------- pinned glass cards ---------- */
  const vec = (str) => new THREE.Vector3().fromArray(str.split(",").map(Number));
  const cards = [...cine.querySelectorAll(".cinePin[data-anchor]")].map((el) => ({ el, v: vec(el.dataset.anchor), vm: vec(el.dataset.anchorM || el.dataset.anchor) })); // vm = phone anchor
  const tmp = new THREE.Vector3();

  /* ---------- camera: GSAP ScrollTrigger scrubbed timeline over chapter keyframes ---------- */
  const KF = [
    [[5.6, 2.3, 8.6], [-0.6, 1.7, -8]],     // 0 hero
    [[2.4, 2.1, 0.6], [-0.2, 1.0, -4.5]],   // 1 manufacturing line
    [[-2.6, 2.1, -4.4], [0.2, 1.3, -9.5]],  // 2 quality gate
    [[-0.4, 2.7, -9.6], [-1.9, 1.8, -13.5]],// 3 robot arm
    [[-1.0, 4.4, -2.0], [-4.4, 4.5, -6]],   // 4 dashboard
    [[-0.6, 2.25, 5.6], [-3.4, 1.5, 2.4]], // 5 ASK LAOYU engineer
  ];
  const HERO_M = [[6.6, 2.7, 11.4], [3.0, 1.6, -6]]; // phone framing keeps the robot in view
  const cam = { px: 0, py: 0, pz: 0, lx: 0, ly: 0, lz: 0, dof: 1 };
  let narrow = innerWidth < 760, camTl = null;
  const kf = (i) => (narrow && i === 0 ? HERO_M : KF[i]);
  const asCam = (k) => ({ px: k[0][0], py: k[0][1], pz: k[0][2], lx: k[1][0], ly: k[1][1], lz: k[1][2] });
  function buildCamTl() {
    const prog = camTl ? camTl.scrollTrigger.progress : 0;
    if (camTl) { camTl.scrollTrigger.kill(); camTl.kill(); }
    Object.assign(cam, asCam(kf(0)), { dof: 1 });
    camTl = gsap.timeline({ defaults: { ease: "power2.inOut", duration: 1 },
      scrollTrigger: { trigger: cine, start: "top top", end: "bottom bottom", scrub: reduce ? true : 1.1 } });
    camTl.to(cam, { dof: 0, duration: 0.55, ease: "power1.in" }, 0);
    for (let i = 1; i < KF.length; i++) camTl.to(cam, asCam(kf(i)), i - 1);
    camTl.progress(prog);
  }
  if (gsap && ScrollTrigger) buildCamTl(); else Object.assign(cam, asCam(kf(0)));

  let mx = 0, my = 0, sx = 0, sy = 0;
  addEventListener("pointermove", (e) => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; });
  function size() {
    const w = stage.clientWidth, h = stage.clientHeight, wasNarrow = narrow; narrow = w < 760;
    renderer.setSize(w, h, false); composer.setSize(w, h);
    camera.aspect = w / h; camera.fov = narrow ? 58 : 42; camera.updateProjectionMatrix();
    if (wasNarrow !== narrow && camTl) buildCamTl();
  }
  addEventListener("resize", size); size();

  /* ---------- adaptive quality + FPS meter ---------- */
  let frames = 0, fpsT = performance.now(), lowCount = 0;
  const settleUntil = performance.now() + 4000; // ignore shader compiling and page load
  /* read-only status for testing; no secrets */
  const status = window.LAOYU_CINE = { fps: 0, quality: phone ? "phone" : "high", cam, dofOn: () => bokeh.enabled,
    loseContext: () => { const x = renderer.getContext().getExtension("WEBGL_lose_context"); if (x) x.loseContext(); } };
  function measure(now) {
    frames++; if (now - fpsT < 1000) return;
    const fps = (frames * 1000) / (now - fpsT); frames = 0; fpsT = now; status.fps = Math.round(fps);
    if (document.hidden || now < settleUntil) return;
    lowCount = fps < 40 ? lowCount + 1 : 0;
    if (lowCount >= 5) { lowCount = 0; // 5 slow seconds in a row → step quality down
      if (maxDpr > 1) { maxDpr = 1; renderer.setPixelRatio(1); size(); status.quality = "dpr1"; }
      else if (renderer.shadowMap.enabled) { renderer.shadowMap.enabled = false; key.castShadow = false; status.quality = "noShadow"; }
    }
  }

  /* ---------- render loop ---------- */
  const t0 = performance.now(); let last = t0, hidden = false;
  document.addEventListener("visibilitychange", () => { hidden = document.hidden; });
  const dir = new THREE.Vector3();
  let inView = true; // stop rendering while the story is scrolled out of view
  status.rendering = true;
  if ("IntersectionObserver" in window) new IntersectionObserver((es) => { inView = status.rendering = es[es.length - 1].isIntersecting; }).observe(cine);
  renderer.setAnimationLoop((now) => {
    if (hidden || !inView) { last = now; return; }
    const t = reduce ? 3 : (now - t0) / 1000, dt = Math.min(0.05, (now - last) / 1000); last = now;
    sx += (mx - sx) * 0.04; sy += (my - sy) * 0.04;
    camera.position.set(cam.px + Math.sin(t * 0.1) * 0.12 + sx * 0.7, cam.py - sy * 0.3, cam.pz);
    camera.lookAt(cam.lx + sx * 0.3, cam.ly, cam.lz);
    fxCam.copy(camera); fxCam.layers.set(FX);

    if (!reduce) parts.forEach((p) => { p.position.z += 0.012; if (p.position.z > 5) p.position.z -= 55; });
    arms.forEach((a) => { const q = t * 0.7 + a.ph; a.tur.rotation.y = Math.sin(q * 0.6) * 0.9; a.sh.rotation.z = -0.4 + Math.sin(q) * 0.2; a.el.rotation.z = -1.4 + Math.sin(q + 1) * 0.3; a.wr.rotation.z = -0.6 + Math.sin(q + 2) * 0.3; });
    scan.position.y = 1.3 + Math.sin(t * 2) * 0.9;
    core.position.y = 5 + Math.sin(t * 0.7) * 0.15; chip.rotation.y = t * 0.25; r1.rotation.set(Math.PI / 2 + Math.sin(t * 0.5) * 0.3, 0, t * 0.4); r2.rotation.set(Math.PI / 2.4, t * 0.3, 0);
    dash.position.y = 4.6 + Math.sin(t * 0.9) * 0.08;
    body.scale.y = 1 + Math.sin(t * 1.6) * 0.012; head.rotation.y = Math.sin(t * 0.35) * 0.3; head.rotation.x = 0.18 + Math.sin(t * 0.35 + 1) * 0.12;
    pad.material.opacity = 0.35 + Math.abs(Math.sin(t * 1.2)) * 0.4;
    if (!reduce) { const a = dg.attributes.position.array; for (let j = 1; j < a.length; j += 3) { a[j] += 0.003; if (a[j] > 8) a[j] = 0; } dg.attributes.position.needsUpdate = true; }

    /* welding */
    fg.tur.rotation.y = Math.sin(t * 0.35) * 0.06; fg.sh.rotation.z = -0.35 + Math.sin(t * 0.5) * 0.02;
    fg.tip.getWorldPosition(tipW);
    const fl = 0.55 + Math.random() * 0.45;
    weldCore.position.copy(tipW); weldCore.scale.setScalar(0.7 + fl * 0.6); weldLight.position.copy(tipW); weldLight.intensity = 6 + fl * 14;
    for (let n = 0; n < SN; n++) {
      if (sLife[n] <= 0) { sLife[n] = 0.3 + Math.random() * 0.7; sPos[n * 3] = tipW.x; sPos[n * 3 + 1] = tipW.y; sPos[n * 3 + 2] = tipW.z;
        const an = Math.random() * Math.PI * 2, sp = 0.8 + Math.random() * 2.4; sVel[n * 3] = Math.cos(an) * sp; sVel[n * 3 + 1] = 0.8 + Math.random() * 2.2; sVel[n * 3 + 2] = Math.sin(an) * sp; }
      sLife[n] -= dt; sVel[n * 3 + 1] -= 9.8 * dt;
      sPos[n * 3] += sVel[n * 3] * dt; sPos[n * 3 + 1] += sVel[n * 3 + 1] * dt; sPos[n * 3 + 2] += sVel[n * 3 + 2] * dt;
      if (sPos[n * 3 + 1] < 1.09 && sVel[n * 3 + 1] < 0 && Math.abs(sPos[n * 3] - 3.65) < 0.55 && Math.abs(sPos[n * 3 + 2] - 1.5) < 0.6) { sVel[n * 3 + 1] *= -0.3; sPos[n * 3 + 1] = 1.09; }
      if (sPos[n * 3 + 1] < 0.02) { sVel[n * 3 + 1] *= -0.25; sVel[n * 3] *= 0.6; sVel[n * 3 + 2] *= 0.6; sPos[n * 3 + 1] = 0.02; }
      if (sLife[n] <= 0) sPos[n * 3 + 1] = -50;
    }
    if (SN) sg.attributes.position.needsUpdate = true;

    /* depth of field: focus on the hero robot, fades out with scroll */
    camera.getWorldDirection(dir);
    bokeh.uniforms.focus.value = tmp.copy(fgCenter).sub(camera.position).dot(dir);
    bokeh.uniforms.aperture.value = 0.0016 * cam.dof;
    bokeh.enabled = cam.dof > 0.02;
    fxPass.clearDepth = bokeh.enabled; // after DOF the depth buffer is stale, so FX draws on top
    sparks.material.depthTest = dust.material.depthTest = weldCore.material.depthTest = !bokeh.enabled;
    bloom.strength = 0.32 + cam.dof * 0.18;
    composer.render();

    const w = stage.clientWidth, h = stage.clientHeight;
    for (const c of cards) { tmp.copy(narrow ? c.vm : c.v).project(camera); const vis = tmp.z < 1 && Math.abs(tmp.x) < 1.1 && Math.abs(tmp.y) < 1.1;
      c.el.style.visibility = vis ? "" : "hidden"; c.el.style.transform = `translate(${((tmp.x * 0.5 + 0.5) * w).toFixed(1)}px,${((-tmp.y * 0.5 + 0.5) * h).toFixed(1)}px)`; }
    measure(now);
  });
  document.documentElement.classList.add("cine-gl");
}

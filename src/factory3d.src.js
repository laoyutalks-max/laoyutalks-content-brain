/* =========================================================
   LAOYU — 3D SMART FACTORY (WebGL, three.js)
   Real-time 3D production line for the homepage hero.
   Falls back to the SVG drawing if WebGL is unavailable.
   Events out:  twin3d:part  {bad}     — a part was inspected
                twin3d:hover {key,x,y} — pointer over a machine
                twin3d:leave           — pointer left machines
   ========================================================= */
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { CSS2DRenderer, CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

(function () {
  const stage = document.querySelector(".tStage");
  if (!stage) return;

  // ---- WebGL check ----
  let renderer;
  try {
    const test = document.createElement("canvas");
    if (!(test.getContext("webgl2") || test.getContext("webgl"))) return;
    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  } catch (e) { return; }

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const small = matchMedia("(max-width: 760px)").matches;
  const fine = matchMedia("(pointer: fine)").matches;
  const t = (s) => (window.LAOYU_I18N ? window.LAOYU_I18N.t(s) : s);

  stage.classList.add("is3d");
  const BG = 0x020912;

  // ---- Renderer / scene / camera ----
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, small ? 1.5 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.9;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.className = "t3Canvas";
  const view = document.createElement("div");
  view.className = "t3View";
  view.appendChild(renderer.domElement);
  stage.prepend(view);

  const labelR = new CSS2DRenderer();
  labelR.domElement.className = "t3Labels";
  view.appendChild(labelR.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(BG);
  scene.fog = new THREE.Fog(BG, 22, 48);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.6;

  const camera = new THREE.PerspectiveCamera(34, 1.4, 0.1, 140);
  const target = new THREE.Vector3(-0.2, 1.6, 0.3);
  const camBase = new THREE.Spherical().setFromVector3(new THREE.Vector3(12.8, 6.8, 14.8));
  camera.position.setFromSpherical(camBase).add(target);
  camera.lookAt(target);

  // ---- Lights ----
  scene.add(new THREE.HemisphereLight(0x9fdcff, 0x050a12, 0.3));
  const key = new THREE.DirectionalLight(0xffffff, 1.7);
  key.position.set(8, 16, 10);
  key.castShadow = true;
  key.shadow.mapSize.set(small ? 1024 : 2048, small ? 1024 : 2048);
  Object.assign(key.shadow.camera, { left: -16, right: 16, top: 12, bottom: -12, near: 1, far: 50 });
  key.shadow.bias = -0.0004;
  key.shadow.radius = 4;
  scene.add(key);
  const rimC = new THREE.PointLight(0x35e0ff, 60, 22, 2); rimC.position.set(-6, 5, -6); scene.add(rimC);
  const rimO = new THREE.PointLight(0xff7a1a, 40, 14, 2); rimO.position.set(5, 3, 4); scene.add(rimO);

  // ---- Brushed-steel texture ----
  const bc = document.createElement("canvas"); bc.width = 256; bc.height = 256;
  const bx = bc.getContext("2d");
  bx.fillStyle = "#8a8a8a"; bx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 1400; i++) {
    const g = 110 + Math.random() * 80 | 0;
    bx.fillStyle = "rgba(" + g + "," + g + "," + g + ",0.35)";
    bx.fillRect(Math.random() * 256, Math.random() * 256, 30 + Math.random() * 120, 1);
  }
  const brushed = new THREE.CanvasTexture(bc);
  brushed.wrapS = brushed.wrapT = THREE.RepeatWrapping; brushed.repeat.set(2, 2);

  // ---- Materials ----
  const M = {
    body: new THREE.MeshStandardMaterial({ color: 0xaeb9c4, metalness: 0.92, roughness: 0.34, roughnessMap: brushed }),
    panel: new THREE.MeshStandardMaterial({ color: 0xe9f1f6, metalness: 0.2, roughness: 0.35 }),
    steel: new THREE.MeshStandardMaterial({ color: 0xc9d2da, metalness: 1, roughness: 0.24 }),
    dark: new THREE.MeshStandardMaterial({ color: 0x0b1622, metalness: 0.5, roughness: 0.45 }),
    orange: new THREE.MeshStandardMaterial({ color: 0xff7a1a, metalness: 0.45, roughness: 0.3 }),
    belt: new THREE.MeshStandardMaterial({ color: 0x0d1a26, metalness: 0.2, roughness: 0.8 }),
    cyanGlow: new THREE.MeshStandardMaterial({ color: 0x35e0ff, emissive: 0x35e0ff, emissiveIntensity: 2.2 }),
    orangeGlow: new THREE.MeshStandardMaterial({ color: 0xff7a1a, emissive: 0xff6a00, emissiveIntensity: 2.4 }),
    greenGlow: new THREE.MeshStandardMaterial({ color: 0x3dffa2, emissive: 0x3dffa2, emissiveIntensity: 2.4 }),
    amberDim: new THREE.MeshStandardMaterial({ color: 0x5a3c08, emissive: 0xffb020, emissiveIntensity: 0.25 }),
    redDim: new THREE.MeshStandardMaterial({ color: 0x4a0e0e, emissive: 0xff3030, emissiveIntensity: 0.2 }),
    glass: new THREE.MeshPhysicalMaterial({ color: 0x7fdcff, metalness: 0, roughness: 0.05, transparent: true, opacity: 0.18, clearcoat: 1 }),
    carton: new THREE.MeshStandardMaterial({ color: 0xb98a5a, roughness: 0.8 }),
    part: new THREE.MeshStandardMaterial({ color: 0xdff6ff, metalness: 0.35, roughness: 0.22, emissive: 0x35e0ff, emissiveIntensity: 0.12 }),
    partOk: new THREE.MeshStandardMaterial({ color: 0xcafff0, metalness: 0.35, roughness: 0.22, emissive: 0x3dffa2, emissiveIntensity: 0.35 }),
    partBad: new THREE.MeshStandardMaterial({ color: 0xffb070, metalness: 0.2, roughness: 0.3, emissive: 0xff5a00, emissiveIntensity: 1.6 })
  };

  const shadowy = (o) => { o.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } }); return o; };
  const mesh = (geo, mat, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); return m; };
  const rbox = (w, h, d, r = 0.08) => new RoundedBoxGeometry(w, h, d, 3, r);
  // orange neon edge lights on a box frame (like the press in the videos)
  function neon(g, w, h, d, x, y, z, mat) {
    mat = mat || M.orangeGlow;
    const T = 0.05;
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => g.add(mesh(new THREE.BoxGeometry(T, h, T), mat, x + sx * w / 2, y, z + sz * d / 2)));
    [-1, 1].forEach((sy) => {
      g.add(mesh(new THREE.BoxGeometry(w, T, T), mat, x, y + sy * h / 2, z + d / 2));
      g.add(mesh(new THREE.BoxGeometry(w, T, T), mat, x, y + sy * h / 2, z - d / 2));
      g.add(mesh(new THREE.BoxGeometry(T, T, d), mat, x + w / 2, y + sy * h / 2, z));
      g.add(mesh(new THREE.BoxGeometry(T, T, d), mat, x - w / 2, y + sy * h / 2, z));
    });
  }
  const hits = []; // meshes that respond to hover
  const groups = {};
  const tag = (g, k) => { groups[k] = g; g.traverse((m) => { if (m.isMesh) { m.userData.tip = k; hits.push(m); } }); };

  function label(text, x, y, z, cls) {
    const d = document.createElement("div");
    d.className = "t3Label" + (cls ? " " + cls : "");
    d.textContent = text;
    const o = new CSS2DObject(d);
    o.position.set(x, y, z);
    scene.add(o);
    return o;
  }

  // ---- Floor & platform ----
  const floor = mesh(new THREE.PlaneGeometry(90, 90), new THREE.MeshStandardMaterial({ color: 0x050d17, metalness: 0.55, roughness: 0.42 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const grid = new THREE.GridHelper(60, 60, 0x35e0ff, 0x35e0ff);
  grid.material.transparent = true; grid.material.opacity = 0.07; grid.position.y = 0.002; scene.add(grid);

  const plat = mesh(rbox(26, 0.3, 13, 0.12), new THREE.MeshStandardMaterial({ color: 0x0a1826, metalness: 0.7, roughness: 0.3 }), 0.3, 0.15, 0.4);
  plat.receiveShadow = true; scene.add(plat);
  const edge = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(26, 0.3, 13)), new THREE.LineBasicMaterial({ color: 0x35e0ff, transparent: true, opacity: 0.55 }));
  edge.position.copy(plat.position); scene.add(edge);
  // glowing strip around the platform top
  [[0, 6.9, 26, 0.06], [0, -6.1, 26, 0.06]].forEach(([x, z, w, d]) => scene.add(mesh(new THREE.BoxGeometry(w, 0.03, d), M.cyanGlow, 0.3 + x, 0.31, z)));
  // safety walkway dashes
  for (let x = -12; x < 12.5; x += 1.2) {
    scene.add(mesh(new THREE.BoxGeometry(0.7, 0.02, 0.1), M.amberDim, x + 0.3, 0.31, 4.4));
    scene.add(mesh(new THREE.BoxGeometry(0.7, 0.02, 0.1), M.amberDim, x + 0.3, 0.31, 6.2));
  }

  // ---- Roller conveyor ----
  const BY = 1.25, BX0 = -9.2, BX1 = 9.4, BL = BX1 - BX0, BZ = 1.5;
  const conv = new THREE.Group();
  const rollers = [];
  const rGeo = new THREE.CylinderGeometry(0.11, 0.11, BZ, 20).rotateX(Math.PI / 2);
  for (let x = BX0 + 0.2; x < BX1; x += 0.42) { const r = mesh(rGeo, M.steel, x, BY, 0); conv.add(r); rollers.push(r); }
  [-1, 1].forEach((s) => {
    conv.add(mesh(rbox(BL, 0.34, 0.16, 0.05), M.body, (BX0 + BX1) / 2, BY + 0.02, s * (BZ / 2 + 0.08)));
    conv.add(mesh(new THREE.BoxGeometry(BL, 0.035, 0.03), s > 0 ? M.orangeGlow : M.cyanGlow, (BX0 + BX1) / 2, BY - 0.14, s * (BZ / 2 + 0.17)));
    for (let x = BX0 + 1; x < BX1; x += 2.4) conv.add(mesh(new THREE.BoxGeometry(0.14, BY - 0.3, 0.14), M.body, x, (BY - 0.3) / 2 + 0.3, s * (BZ / 2 + 0.05)));
  });
  scene.add(shadowy(conv));

  // ---- Hydraulic press / input (stainless + orange edge glow) ----
  const cnc = new THREE.Group(); cnc.position.set(-10.8, 0.3, 0);
  cnc.add(mesh(rbox(3.6, 1.3, 3.4, 0.1), M.body, 0, 0.65, 0));             // base
  cnc.add(mesh(rbox(3.0, 0.35, 2.8, 0.06), M.steel, 0, 1.45, 0));          // bolster
  [[-1.2, -1.1], [1.2, -1.1], [-1.2, 1.1], [1.2, 1.1]].forEach(([x, z]) => {
    cnc.add(mesh(new THREE.CylinderGeometry(0.17, 0.17, 3.2, 24), M.steel, x, 3.0, z)); // columns
  });
  cnc.add(mesh(rbox(3.7, 1.2, 3.4, 0.12), M.body, 0, 5.0, 0));             // crown
  cnc.add(mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.8, 32), M.steel, 0, 5.9, 0)); // cylinder
  const ram = new THREE.Group(); cnc.add(ram);
  ram.add(mesh(rbox(2.4, 0.7, 2.2, 0.06), M.body, 0, 0, 0));
  ram.add(mesh(new THREE.CylinderGeometry(0.22, 0.22, 1.4, 20), M.steel, 0, 0.9, 0));
  neon(cnc, 2.9, 3.0, 2.7, 0, 3.05, 0);                                     // glowing frame
  cnc.add(mesh(new THREE.BoxGeometry(2.2, 0.5, 0.05), new THREE.MeshStandardMaterial({ color: 0x0a2a3a, emissive: 0x35e0ff, emissiveIntensity: 0.7 }), 0, 0.8, 1.71));
  const pressGlow = new THREE.PointLight(0xff7a1a, 18, 6, 2); pressGlow.position.set(0, 2.6, 0); cnc.add(pressGlow);
  // light tower
  const tower = new THREE.Group(); tower.position.set(1.5, 5.6, -1.3);
  tower.add(mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.5), M.steel, 0, 0.25, 0));
  const lampG = mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.22, 20), M.greenGlow, 0, 0.62, 0);
  tower.add(lampG, mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.22, 20), M.amberDim, 0, 0.86, 0), mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.22, 20), M.redDim, 0, 1.1, 0));
  cnc.add(tower);
  scene.add(shadowy(cnc)); tag(cnc, "cnc");
  label("PRESS / INPUT", -10.8, 7.0, 0);

  // ---- Control room ----
  const ctrl = new THREE.Group(); ctrl.position.set(-5.8, 0.3, -4.2);
  ctrl.add(mesh(rbox(4.2, 0.2, 2.6, 0.06), M.dark, 0, 0.1, 0));
  ctrl.add(mesh(rbox(4.2, 0.2, 2.6, 0.06), M.body, 0, 3.0, 0));
  [[-2, -1.2], [2, -1.2], [-2, 1.2], [2, 1.2]].forEach(([x, z]) => ctrl.add(mesh(new THREE.BoxGeometry(0.12, 2.8, 0.12), M.steel, x, 1.5, z)));
  ctrl.add(mesh(new THREE.BoxGeometry(4.0, 2.7, 2.4), M.glass, 0, 1.55, 0));
  const scr = document.createElement("canvas"); scr.width = 256; scr.height = 128;
  const sc = scr.getContext("2d");
  const scrTex = new THREE.CanvasTexture(scr); scrTex.colorSpace = THREE.SRGBColorSpace;
  ctrl.add(mesh(new THREE.BoxGeometry(2.6, 1.3, 0.06), new THREE.MeshBasicMaterial({ map: scrTex, toneMapped: false }), 0, 1.9, 1.0));
  ctrl.add(mesh(rbox(2.4, 0.9, 0.7, 0.06), M.body, 0, 0.65, 0.7));
  scene.add(shadowy(ctrl)); tag(ctrl, "ctrl");
  label("CONTROL ROOM", -5.8, 4.0, -4.2);
  const bars = [0.5, 0.7, 0.45, 0.85, 0.6, 0.75];
  function drawScreen(time) {
    sc.fillStyle = "#03121f"; sc.fillRect(0, 0, 256, 128);
    sc.strokeStyle = "rgba(53,224,255,.25)"; sc.lineWidth = 1;
    for (let y = 20; y < 128; y += 20) { sc.beginPath(); sc.moveTo(0, y); sc.lineTo(256, y); sc.stroke(); }
    bars.forEach((b, i) => {
      const h = (0.35 + 0.6 * Math.abs(Math.sin(time * 0.6 + i * 1.3)) * b) * 90;
      sc.fillStyle = i === 3 ? "#ff7a1a" : "#35e0ff";
      sc.fillRect(18 + i * 26, 116 - h, 16, h);
    });
    sc.strokeStyle = "#3dffa2"; sc.lineWidth = 2; sc.beginPath();
    for (let x = 0; x <= 80; x += 4) { const y = 64 - Math.sin(time * 1.2 + x * 0.12) * 16 - x * 0.2; x ? sc.lineTo(176 + x, y) : sc.moveTo(176, y); }
    sc.stroke();
    sc.fillStyle = "#35e0ff"; sc.font = "bold 13px monospace"; sc.fillText("OEE", 182, 106);
    scrTex.needsUpdate = true;
  }
  drawScreen(0);

  // ---- Robot arm ----
  const robot = new THREE.Group(); robot.position.set(-5.6, 0.3, 2.7); robot.rotation.y = Math.PI;
  robot.add(mesh(new THREE.CylinderGeometry(0.75, 0.9, 0.35, 32), M.dark, 0, 0.18, 0));
  const turret = new THREE.Group(); turret.position.y = 0.35; robot.add(turret);
  turret.add(mesh(new THREE.CylinderGeometry(0.55, 0.6, 0.7, 32), M.orange, 0, 0.35, 0));
  const shoulder = new THREE.Group(); shoulder.position.y = 0.85; turret.add(shoulder);
  shoulder.add(mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.9, 24).rotateX(Math.PI / 2), M.steel));
  const up = mesh(rbox(0.42, 2.2, 0.42, 0.12), M.orange, 0, 1.1, 0); shoulder.add(up);
  const elbow = new THREE.Group(); elbow.position.y = 2.2; shoulder.add(elbow);
  elbow.add(mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.7, 24).rotateX(Math.PI / 2), M.steel));
  elbow.add(mesh(rbox(0.34, 1.9, 0.34, 0.1), M.orange, 0, 0.95, 0));
  const wrist = new THREE.Group(); wrist.position.y = 1.9; elbow.add(wrist);
  wrist.add(mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.3, 20), M.dark, 0, 0.1, 0));
  wrist.add(mesh(new THREE.BoxGeometry(0.06, 0.35, 0.12), M.steel, -0.1, 0.38, 0), mesh(new THREE.BoxGeometry(0.06, 0.35, 0.12), M.steel, 0.1, 0.38, 0));
  const tip = mesh(new THREE.SphereGeometry(0.07, 12, 12), M.cyanGlow, 0, 0.55, 0); wrist.add(tip);
  const spark = new THREE.PointLight(0x7ff4ff, 0, 4, 2); tip.add(spark);
  scene.add(shadowy(robot)); tag(robot, "robot");
  label("AI ROBOT CELL", -5.6, 0.9, 4.3);

  // ---- AI vision gantry ----
  const VX = 2.2;
  const vis = new THREE.Group(); vis.position.set(VX, 0.3, 0);
  [-1.25, 1.25].forEach((z) => vis.add(mesh(rbox(0.32, 3.4, 0.32, 0.06), M.body, 0, 1.7, z)));
  vis.add(mesh(rbox(0.6, 0.45, 3.0, 0.08), M.body, 0, 3.45, 0));
  [-1.25, 1.25].forEach((z) => vis.add(mesh(new THREE.BoxGeometry(0.04, 3.1, 0.04), M.orangeGlow, 0.18, 1.7, z + 0.17 * Math.sign(z))));
  vis.add(mesh(new THREE.BoxGeometry(0.62, 0.06, 3.02), M.cyanGlow, 0, 3.2, 0));
  vis.add(mesh(rbox(0.7, 0.55, 0.7, 0.08), M.panel, 0, 2.95, 0));
  const lens = mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.2, 24), M.orangeGlow, 0, 2.6, 0); vis.add(lens);
  const cone = mesh(new THREE.ConeGeometry(0.95, 1.6, 40, 1, true), new THREE.MeshBasicMaterial({ color: 0xff7a1a, transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }), 0, 1.75, 0);
  vis.add(cone);
  const laser = mesh(new THREE.BoxGeometry(0.05, 0.02, BZ), M.orangeGlow, 0, BY + 0.07 - 0.3, 0); vis.add(laser);
  scene.add(shadowy(vis)); cone.castShadow = false; laser.castShadow = false; tag(vis, "vision");
  label("AI VISION QC", VX, 4.4, 0);

  // ---- Pusher + reject bin ----
  const PX = 4.9;
  const pusher = new THREE.Group(); pusher.position.set(PX, BY + 0.3, -1.6);
  pusher.add(mesh(rbox(0.7, 0.55, 0.9, 0.06), M.body, 0, 0, -0.3));
  const rod = mesh(new THREE.CylinderGeometry(0.07, 0.07, 1, 16).rotateX(Math.PI / 2), M.steel, 0, 0, 0.3); pusher.add(rod);
  const pad = mesh(new THREE.BoxGeometry(0.6, 0.4, 0.08), M.orange, 0, 0, 0.75); pusher.add(pad);
  scene.add(shadowy(pusher));
  const bin = new THREE.Group(); bin.position.set(PX, 0.3, 2.8);
  const binMat = new THREE.MeshStandardMaterial({ color: 0xff7a1a, emissive: 0xff5a00, emissiveIntensity: 0.25, transparent: true, opacity: 0.28, metalness: 0.1, roughness: 0.2, depthWrite: false });
  bin.add(mesh(new THREE.BoxGeometry(1.8, 1.0, 1.8), binMat, 0, 0.5, 0));
  const binEdge = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1.8, 1.0, 1.8)), new THREE.LineBasicMaterial({ color: 0xff7a1a }));
  binEdge.position.y = 0.5; bin.add(binEdge);
  scene.add(bin);
  label("REJECT", PX, 1.7, 3.9, "o");

  // ---- Packer / output ----
  const pack = new THREE.Group(); pack.position.set(11.2, 0.3, 0);
  pack.add(mesh(rbox(3.2, 3.0, 3.4, 0.16), M.body, 0, 1.5, 0));
  pack.add(mesh(rbox(3.22, 0.35, 3.42, 0.08), M.orange, 0, 2.85, 0));
  pack.add(mesh(new THREE.BoxGeometry(0.05, 1.0, 1.7), new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 1 }), -1.61, 1.2, 0));
  pack.add(mesh(new THREE.BoxGeometry(1.6, 0.9, 0.05), new THREE.MeshStandardMaterial({ color: 0x062033, emissive: 0x35e0ff, emissiveIntensity: 0.4 }), 0.2, 1.9, 1.71));
  const lampP = mesh(new THREE.SphereGeometry(0.16, 16, 16), M.greenGlow, 0.9, 3.15, -0.9); pack.add(lampP);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) pack.add(mesh(rbox(0.9, 0.7, 0.9, 0.04), M.carton, -0.9 + i * 1.0, 0.35 + j * 0.72, 2.6));
  neon(pack, 3.24, 3.0, 3.44, 0, 1.5, 0, M.cyanGlow);
  scene.add(shadowy(pack)); tag(pack, "pack");
  label("PACK / OUTPUT", 11.2, 4.6, 0);

  // ---- Data streams (light trails flowing across the floor) ----
  const SN = small ? 70 : 140;
  const streak = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 0.03, 0.04), new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }), SN);
  const sd = [], dummy = new THREE.Object3D(), col = new THREE.Color();
  for (let i = 0; i < SN; i++) {
    let z; do { z = (Math.random() - 0.5) * 46; } while (Math.abs(z - 0.4) < 7.2);
    const o = { x: (Math.random() - 0.5) * 70, z, len: 0.6 + Math.random() * 3.2, v: 3 + Math.random() * 9 };
    sd.push(o);
    col.set(Math.random() < 0.12 ? 0xff8a2a : 0x35e0ff).multiplyScalar(0.8 + Math.random() * 2.2);
    streak.setColorAt(i, col);
  }
  scene.add(streak);
  // data rain columns far behind the line
  const RN = small ? 300 : 700;
  const rainGeo = new THREE.BufferGeometry(), rp = new Float32Array(RN * 3), rc = new Float32Array(RN * 3), rv = new Float32Array(RN);
  for (let i = 0; i < RN; i++) {
    rp[i * 3] = (Math.round((Math.random() - 0.5) * 60 / 0.9) * 0.9); rp[i * 3 + 1] = Math.random() * 22; rp[i * 3 + 2] = -10 - Math.random() * 8;
    const c = Math.random() < 0.1 ? [1, 0.55, 0.15] : [0.21, 0.88, 1]; const k = 0.25 + Math.random() * 0.7;
    rc[i * 3] = c[0] * k; rc[i * 3 + 1] = c[1] * k; rc[i * 3 + 2] = c[2] * k; rv[i] = 0.6 + Math.random() * 2.2;
  }
  rainGeo.setAttribute("position", new THREE.BufferAttribute(rp, 3));
  rainGeo.setAttribute("color", new THREE.BufferAttribute(rc, 3));
  const rain = new THREE.Points(rainGeo, new THREE.PointsMaterial({ size: 0.16, vertexColors: true, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, fog: false }));
  scene.add(rain);
  function streams(dt) {
    for (let i = 0; i < SN; i++) {
      const o = sd[i]; o.x += o.v * dt; if (o.x > 36) o.x = -36;
      dummy.position.set(o.x, 0.02, o.z); dummy.scale.set(o.len, 1, 1); dummy.updateMatrix();
      streak.setMatrixAt(i, dummy.matrix);
    }
    streak.instanceMatrix.needsUpdate = true;
    for (let i = 0; i < RN; i++) { rp[i * 3 + 1] -= rv[i] * dt; if (rp[i * 3 + 1] < 0) rp[i * 3 + 1] = 22; }
    rainGeo.attributes.position.needsUpdate = true;
  }
  streams(0);

  // ---- Hover rings ----
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x35e0ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  const rings = {};
  [["cnc", -10.8, 0, 2.8], ["ctrl", -5.8, -4.2, 2.6], ["robot", -5.6, 2.7, 1.4], ["vision", VX, 0, 1.9], ["pack", 11.2, 0, 2.6]].forEach(([k, x, z, r]) => {
    const m = mesh(new THREE.RingGeometry(r, r + 0.12, 64), ringMat.clone(), x, 0.33, z);
    m.rotation.x = -Math.PI / 2; scene.add(m); rings[k] = m;
  });
  let hotKey = null;

  // ---- Parts simulation ----
  const partGeo = rbox(0.62, 0.62, 0.62, 0.1);
  const parts = [];
  let n = 0, since = 1.2, simT = 0;
  const V = 2.4, GAP = 1.25, PART_Y = BY + 0.36;
  const defectTag = label("DEFECT FOUND", 0, -99, 0, "defect");
  defectTag.visible = false;
  let tagOwner = null;

  function spawn() {
    const m = new THREE.Mesh(partGeo, M.part);
    m.castShadow = true; m.position.set(BX0 + 0.4, PART_Y, 0);
    scene.add(m); n++;
    parts.push({ m, bad: n % 6 === 4, scanned: false, phase: "ride", t: 0 });
  }

  function sim(dt) {
    simT += dt; since += dt;
    if (since >= GAP) { since = 0; spawn(); }
    for (const r of rollers) r.rotation.z -= V * dt / 0.11;
    let push = 0;
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i], m = p.m;
      if (p.phase === "ride") {
        m.position.x += V * dt;
        if (!p.scanned && m.position.x >= VX) {
          p.scanned = true;
          m.material = p.bad ? M.partBad : M.partOk;
          if (p.bad) { tagOwner = p; defectTag.visible = true; }
          document.dispatchEvent(new CustomEvent("twin3d:part", { detail: { bad: p.bad } }));
        }
        if (p.bad && m.position.x >= PX) { m.position.x = PX; p.phase = "push"; p.t = 0; }
        if (m.position.x > BX1 + 1.2) { scene.remove(m); parts.splice(i, 1); continue; }
      } else if (p.phase === "push") {
        p.t += dt;
        const k = Math.min(1, p.t / 0.6), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        m.position.z = e * 2.8;
        m.position.y = k < 0.55 ? PART_Y : PART_Y - (PART_Y - 0.75) * ((k - 0.55) / 0.45);
        m.rotation.x = e * 0.6;
        push = Math.max(push, Math.min(1.1, e * 2.2));
        if (k >= 1) { p.phase = "sit"; p.t = 0; }
      } else {
        p.t += dt;
        push = Math.max(push, 1.1 * Math.max(0, 1 - p.t / 0.4));
        if (p.t > 1.4) m.scale.setScalar(Math.max(0.001, 1 - (p.t - 1.4) / 0.5));
        if (p.t > 1.9) { scene.remove(m); parts.splice(i, 1); continue; }
      }
    }
    rod.position.z = 0.3 + push; pad.position.z = 0.75 + push;
    if (tagOwner) {
      defectTag.position.copy(tagOwner.m.position).add(new THREE.Vector3(0, 0.9, 0));
      if (tagOwner.phase === "sit" && tagOwner.t > 0.8) { defectTag.visible = false; tagOwner = null; }
    }
  }

  // ---- Animation of machines ----
  function animate(time) {
    // robot: reach over belt, work, swing back
    const c = (time % 5) / 5;
    const s = (a, b, k) => a + (b - a) * (k < 0 ? 0 : k > 1 ? 1 : k * k * (3 - 2 * k));
    let yaw, sh, el, work = 0;
    if (c < 0.25) { const k = c / 0.25; yaw = s(-2.2, 0.15, k); sh = s(-0.2, 0.55, k); el = s(0.4, 1.35, k); }
    else if (c < 0.6) { const k = (c - 0.25) / 0.35; yaw = 0.15 + Math.sin(k * Math.PI * 2) * 0.12; sh = 0.55; el = 1.35 + Math.sin(k * Math.PI * 4) * 0.05; work = 1; }
    else if (c < 0.85) { const k = (c - 0.6) / 0.25; yaw = s(0.15, -2.2, k); sh = s(0.55, -0.2, k); el = s(1.35, 0.4, k); }
    else { yaw = -2.2; sh = -0.2; el = 0.4; }
    turret.rotation.y = yaw; shoulder.rotation.x = sh; elbow.rotation.x = el; wrist.rotation.x = 0.9;
    spark.intensity = work ? 6 + Math.random() * 10 : 0;
    // press stamping cycle
    const pc = (time % 2.5) / 2.5;
    ram.position.y = pc < 0.15 ? 4.0 - (pc / 0.15) * 1.8 : pc < 0.25 ? 2.2 : 2.2 + Math.min(1, (pc - 0.25) / 0.5) * 1.8;
    pressGlow.intensity = pc > 0.12 && pc < 0.3 ? 40 : 14;
    // scanner
    laser.position.x = Math.sin(time * 4) * 0.6;
    cone.material.opacity = 0.09 + 0.05 * Math.sin(time * 5);
    lampG.material.emissiveIntensity = 1.6 + Math.sin(time * 6) * 0.9;
    // hover rings
    Object.keys(rings).forEach((k) => {
      const r = rings[k], on = k === hotKey;
      r.material.opacity += ((on ? 0.9 : 0) - r.material.opacity) * 0.15;
      r.scale.setScalar(on ? 1 + Math.sin(time * 4) * 0.03 : 1);
    });
  }

  // ---- Post-processing ----
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(512, 512), 0.85, 0.5, 1.0);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  // ---- Controls (desktop: drag to rotate; mobile keeps page scroll) ----
  let controls = null, lastInteract = -99;
  if (fine) {
    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.copy(target);
    controls.enableZoom = false; controls.enablePan = false; controls.enableDamping = true; controls.dampingFactor = 0.06;
    controls.minPolarAngle = 0.55; controls.maxPolarAngle = 1.25;
    controls.minAzimuthAngle = camBase.theta - 0.9; controls.maxAzimuthAngle = camBase.theta + 0.7;
    controls.addEventListener("start", () => { lastInteract = 1e9; stage.classList.add("dragging"); });
    controls.addEventListener("end", () => { lastInteract = clock.elapsedTime; stage.classList.remove("dragging"); });
  }

  // ---- Hover / tap ----
  const ray = new THREE.Raycaster(), ptr = new THREE.Vector2();
  function pick(e) {
    const r = renderer.domElement.getBoundingClientRect();
    ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ptr, camera);
    const h = ray.intersectObjects(hits, false)[0];
    return h ? h.object.userData.tip : null;
  }
  function hover(k, e) {
    if (k === hotKey) return;
    hotKey = k;
    renderer.domElement.style.cursor = k ? "pointer" : "";
    if (k) {
      const sr = view.getBoundingClientRect();
      const g = groups[k], box = new THREE.Box3().setFromObject(g), top = new THREE.Vector3((box.min.x + box.max.x) / 2, box.max.y, (box.min.z + box.max.z) / 2).project(camera);
      const x = (top.x + 1) / 2 * sr.width, y = (1 - top.y) / 2 * sr.height;
      document.dispatchEvent(new CustomEvent("twin3d:hover", { detail: { key: k, x, y } }));
    } else {
      document.dispatchEvent(new CustomEvent("twin3d:leave"));
    }
  }
  renderer.domElement.addEventListener("pointermove", (e) => { if (e.buttons) return; hover(pick(e), e); });
  renderer.domElement.addEventListener("pointerleave", () => hover(null));
  renderer.domElement.addEventListener("click", (e) => { const k = pick(e); hotKey = null; hover(k, e); });
  window.LAOYU_3D = { highlight: (k) => { hotKey = k; } };

  // ---- Resize ----
  function resize() {
    const w = view.clientWidth, h = view.clientHeight || w / 1.4;
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    bloom.resolution.set(w / 2, h / 2);
    labelR.setSize(w, h);
    camera.aspect = w / h;
    camera.fov = w / h < 1.2 ? 44 : 34;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(view);
  resize();

  // ---- Loop ----
  const clock = new THREE.Clock();
  let visible = true, lastScreen = 0;
  if ("IntersectionObserver" in window) new IntersectionObserver((es) => { visible = es[0].isIntersecting; }).observe(stage);

  function frame() {
    requestAnimationFrame(frame);
    if (!visible || document.hidden) { clock.getDelta(); return; }
    const dt = Math.min(0.05, clock.getDelta()), time = clock.elapsedTime;
    if (!reduce) { sim(dt); animate(time); streams(dt); }
    if (time - lastScreen > 0.12) { drawScreen(time); lastScreen = time; }
    // gentle cinematic camera drift until the visitor takes control
    if (!reduce && time - lastInteract > 4) {
      const sp = camBase.clone();
      sp.theta += Math.sin(time * 0.12) * 0.22;
      sp.phi += Math.sin(time * 0.09) * 0.04;
      const want = new THREE.Vector3().setFromSpherical(sp).add(target);
      camera.position.lerp(want, 0.02);
      camera.lookAt(target);
      if (controls) controls.target.copy(target);
    }
    if (controls) controls.update();
    composer.render();
    labelR.render(scene, camera);
  }

  // warm up the line so it isn't empty on load
  if (!reduce) { for (let i = 0; i < 160; i++) sim(0.05); animate(0); }
  else { for (let i = 0; i < 160; i++) sim(0.05); animate(1.2); }
  frame();
})();

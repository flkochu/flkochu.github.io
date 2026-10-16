// Mini sumo virtual: modelo aproximado a partir de fotos y simulación de los tres VL53L5CX.
// Unidades de la escena: metros. Marco del robot: +x al frente, +y arriba, +z a la derecha.
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const T = {
  es: {
    loading: "Cargando modelo…",
    hint: "Arrastra al oponente sobre el dohyo. Arrastra el fondo para girar la cámara.",
    sensors: "Matrices de los tres VL53L5CX", left: "Izquierdo", center: "Centro", right: "Derecho",
    seenFrom: "Vista desde el robot, fila superior arriba",
    res: "Zonas por sensor", rate: "hasta", fov: "Campos de visión",
    sim: "Simulación", follow: "Seguir al oponente", stop: "Detener", reset: "Reiniciar",
    views: "Vista", v34: "3/4", vtop: "Arriba", vback: "Detrás",
    det: "Oponente", yes: "detectado", no: "sin detectar", bearing: "Rumbo estimado", dist: "Distancia mínima",
    zones: "Zonas con objeto", seen: "Lo ve", none: "ninguno", leftS: "izq.", rightS: "der.",
    state: "Estado", idle: "En espera", searching: "Buscando", tracking: "Siguiendo", pushing: "Empujando", outS: "Fuera",
    legend: "Distancia por zona", noTarget: "sin objetivo",
    out: "El oponente salió del dohyo.",
    note: "Modelo aproximado a partir de fotos, con las medidas del reglamento (10 × 10 cm). Las matrices se simulan con el campo de visión del VL53L5CX (45° × 45°, 4×4 u 8×8 zonas, hasta 4 m). La lógica de seguimiento es una demostración, no el firmware del robot.",
    err: "No se pudo cargar el modelo 3D. Revisa tu conexión y recarga la página.",
  },
  en: {
    loading: "Loading model…",
    hint: "Drag the opponent around the dohyo. Drag the background to orbit the camera.",
    sensors: "Matrices from the three VL53L5CX", left: "Left", center: "Center", right: "Right",
    seenFrom: "Robot’s point of view, top row up",
    res: "Zones per sensor", rate: "up to", fov: "Fields of view",
    sim: "Simulation", follow: "Chase the opponent", stop: "Stop", reset: "Reset",
    views: "View", v34: "3/4", vtop: "Top", vback: "Behind",
    det: "Opponent", yes: "detected", no: "not detected", bearing: "Estimated bearing", dist: "Closest distance",
    zones: "Zones with an object", seen: "Seen by", none: "none", leftS: "left", rightS: "right",
    state: "State", idle: "Idle", searching: "Searching", tracking: "Tracking", pushing: "Pushing", outS: "Out",
    legend: "Distance per zone", noTarget: "no target",
    out: "The opponent left the dohyo.",
    note: "Model approximated from photos, using the rulebook size (10 × 10 cm). The matrices are simulated with the VL53L5CX field of view (45° × 45°, 4×4 or 8×8 zones, up to 4 m). The chase logic is a demo, not the robot’s firmware.",
    err: "The 3D model could not load. Check your connection and reload the page.",
  },
};

const CSS = `
.ssim{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,330px);border:1px solid var(--rule,#3B3066);background:var(--sheet,#110C22);color:var(--ink,#EEE8FF);font-family:var(--f,inherit)}
.ssim-view{position:relative;min-width:0;height:clamp(400px,54vw,640px);border-right:1px solid var(--rule,#3B3066);overflow:hidden;touch-action:none}
.ssim-view canvas{display:block;width:100%!important;height:100%!important;cursor:grab}
.ssim-view canvas.drag{cursor:grabbing}
.ssim-hud{position:absolute;left:12px;right:12px;top:10px;display:flex;justify-content:space-between;gap:10px;font-size:.75rem;color:var(--ink-2,#A79CCB);pointer-events:none}
.ssim-msg{position:absolute;inset:0;display:grid;place-items:center;font-size:.9rem;color:var(--ink-2,#A79CCB);text-align:center;padding:16px;pointer-events:none}
.ssim-toast{position:absolute;left:50%;bottom:14px;transform:translateX(-50%);padding:6px 12px;border:1px solid var(--magenta,#FF3B8D);background:color-mix(in srgb,var(--sheet,#110C22) 86%,transparent);color:var(--ink,#EEE8FF);font-size:.8125rem;white-space:nowrap}
.ssim-panel{display:flex;flex-direction:column;min-width:0;font-size:.8125rem;max-height:clamp(400px,54vw,640px);overflow:auto}
.ssim-sec{padding:12px 14px;border-bottom:1px solid var(--rule,#3B3066);display:grid;gap:9px}
.ssim-sec:last-child{border-bottom:0}
.ssim-sec h4{margin:0;font-family:var(--f-d,inherit);font-size:.875rem;font-weight:650;letter-spacing:.01em}
.ssim-mats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
.ssim-mat{display:grid;gap:4px;min-width:0}
.ssim-mat canvas{width:100%;height:auto;aspect-ratio:1;display:block;border:1px solid var(--rule,#3B3066);image-rendering:pixelated}
.ssim-mat span{font-size:.7rem;color:var(--ink-2,#A79CCB);display:flex;align-items:center;gap:5px}
.ssim-mat i{width:9px;height:9px;display:inline-block;flex:none}
.ssim-legend{display:grid;gap:3px;font-size:.68rem;color:var(--ink-2,#A79CCB)}
.ssim-legend .bar{height:7px;border:1px solid var(--rule,#3B3066)}
.ssim-legend .lb{display:flex;justify-content:space-between;font-variant-numeric:tabular-nums}
.ssim-read{display:grid;grid-template-columns:auto minmax(0,1fr);gap:3px 12px;font-variant-numeric:tabular-nums}
.ssim-read span{color:var(--ink-2,#A79CCB)}
.ssim-read b{font-weight:600;text-align:right}
.ssim-btns{display:flex;flex-wrap:wrap;gap:6px}
.ssim button{font:inherit;font-size:.75rem;border:1px solid var(--rule,#3B3066);background:transparent;color:inherit;padding:5px 10px;cursor:pointer}
.ssim button:hover{border-color:var(--cyan,#2DE2F0)}
.ssim button[aria-pressed="true"]{background:var(--cyan,#2DE2F0);color:var(--sheet,#110C22);border-color:var(--cyan,#2DE2F0)}
.ssim button.go[aria-pressed="true"]{background:var(--magenta,#FF3B8D);border-color:var(--magenta,#FF3B8D)}
.ssim :focus-visible{outline:2px solid var(--cyan,#2DE2F0);outline-offset:2px}
.ssim-tg{display:flex;align-items:center;gap:8px;cursor:pointer}
.ssim-tg input{accent-color:var(--cyan,#2DE2F0);margin:0}
.ssim-small{font-size:.7rem;color:var(--ink-2,#A79CCB);line-height:1.45}
@media (max-width:820px){.ssim{grid-template-columns:minmax(0,1fr)}.ssim-view{border-right:0;border-bottom:1px solid var(--rule,#3B3066);height:min(105vw,520px)}.ssim-panel{max-height:none}}
`;

const deg = (d) => (d * Math.PI) / 180;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
function tok(el, name, fb) { const v = getComputedStyle(el).getPropertyValue(name).trim(); return v || fb; }

/* ---------- reglamento y sensor ---------- */
const DOHYO_R = 0.385, DOHYO_H = 0.05, BORDER = 0.025; // dohyo de 77 cm, 5 cm de alto, borde blanco de 2.5 cm
const FOV = 45, RANGE = 4.0;                           // VL53L5CX: 45° × 45°, hasta 4 m
const RATE = { 4: 60, 8: 15 };                         // frecuencia máxima por resolución (UM2884)

/* ---------- materiales ---------- */
function materials() {
  const S = (c, r = 0.6, m = 0) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m });
  return {
    pla: S(0x17161c, 0.78), pla2: S(0x232129, 0.7), steel: S(0x9ea6ae, 0.32, 0.85), blade: S(0xb7bec6, 0.22, 0.9),
    tire: S(0x1f5fd6, 0.72), hub: S(0xd9dee2, 0.28, 0.85), hole: S(0x0a0a0c, 0.9),
    can: S(0xc2c8ce, 0.3, 0.8), brass: S(0xc9a24a, 0.35, 0.8), batt: S(0x86d9b6, 0.5),
    pcb: S(0x1d7a4a, 0.55), pcbS: S(0x2a8f5a, 0.5), purple: S(0x5a2c8a, 0.5), chip: S(0x0c0c0e, 0.4, 0.2),
    pin: S(0xd4b45a, 0.35, 0.8), usb: S(0xcfd4d8, 0.3, 0.9), sd: S(0x9aa0a6, 0.35, 0.7),
    red: S(0xe0262b, 0.5), orange: S(0xff7a1a, 0.5), yellow: S(0xf2d22e, 0.5), black: S(0x101012, 0.6),
    dohyo: S(0x0b0a0f, 0.92), white: S(0xf1f1f1, 0.7),
    opp: S(0x2b2d34, 0.7), oppStripe: S(0xff8c42, 0.6), oppTire: S(0x15161a, 0.9),
  };
}

/* ---------- robot (en mm, se escala a metros) ---------- */
function buildRobot(M) {
  const g = new THREE.Group();
  const add = (m) => { m.castShadow = m.receiveShadow = true; g.add(m); return m; };
  const box = (x0, x1, y0, y1, z0, z1, mat) => { const m = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), mat); m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); return add(m); };
  const cylZ = (r, z0, z1, x, y, mat, seg = 40) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, Math.abs(z1 - z0), seg), mat); m.rotation.x = Math.PI / 2; m.position.set(x, y, (z0 + z1) / 2); return add(m); };
  const cylX = (r, x0, x1, y, z, mat, seg = 28) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, Math.abs(x1 - x0), seg), mat); m.rotation.z = Math.PI / 2; m.position.set((x0 + x1) / 2, y, z); return add(m); };
  const cylY = (r, y0, y1, x, z, mat, seg = 16) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, Math.abs(y1 - y0), seg), mat); m.position.set(x, (y0 + y1) / 2, z); return add(m); };
  // prisma: perfil en (x, z) extruido en y
  const prismY = (pts, y0, y1, mat) => {
    const s = new THREE.Shape(); pts.forEach(([x, z], i) => (i ? s.lineTo(x, -z) : s.moveTo(x, -z)));
    const geo = new THREE.ExtrudeGeometry(s, { depth: y1 - y0, bevelEnabled: false }); geo.rotateX(-Math.PI / 2); geo.translate(0, y0, 0);
    return add(new THREE.Mesh(geo, mat));
  };
  // prisma: perfil en (x, y) extruido en z
  const prismZ = (pts, z0, z1, mat) => {
    const s = new THREE.Shape(); pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)));
    const geo = new THREE.ExtrudeGeometry(s, { depth: z1 - z0, bevelEnabled: false }); geo.translate(0, 0, z0);
    return add(new THREE.Mesh(geo, mat));
  };

  // placa base de acero: estructura y lastre
  box(-44, 30, 2, 6, -28, 28, M.steel);
  // tina impresa
  box(-44, 30, 6, 28, -31, -27, M.pla); box(-44, 30, 6, 28, 27, 31, M.pla);
  box(-44, -40, 6, 28, -27, 27, M.pla); box(26, 30, 6, 20, -27, 27, M.pla);
  box(-44, 30, 5, 6.2, -31, 31, M.pla2);
  // cuña y cuchilla metálica al frente
  prismZ([[26, 2], [48, 2], [48, 3], [30, 16], [26, 16]], -50, 50, M.pla);
  {
    const a = new THREE.Vector2(49.6, 1.4), b = new THREE.Vector2(30.4, 15.4), n = new THREE.Vector2(13, 18).normalize();
    const L = a.distanceTo(b), mid = a.clone().add(b).multiplyScalar(0.5).addScaledVector(n, 0.7);
    const bl = new THREE.Mesh(new THREE.BoxGeometry(L, 1.2, 100), M.blade); bl.position.set(mid.x, mid.y, 0); bl.rotation.z = -Math.atan2(b.y - a.y, a.x - b.x); add(bl);
    for (const z of [-25, 25]) { const sc = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.6, 1.4, 18), M.steel); sc.position.set(mid.x + n.x * 0.9, mid.y + n.y * 0.9, z); sc.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(n.x, n.y, 0)); add(sc); }
  }
  // soporte frontal de los sensores: uno al frente y dos en diagonal
  const bracket = [[14, -31], [24, -31], [37, -13], [37, 13], [24, 31], [14, 31]];
  prismY(bracket, 20, 34, M.pla);
  // motores y ruedas (silicón azul sobre rin con inserto metálico)
  for (const s of [-1, 1]) {
    cylZ(8.5, s * 6, s * 26.5, -26, 17, M.can);
    box(-28, -24, 23, 27, s * 6 - 0.6, s * 6 + 0.6, M.brass);
    cylZ(2, s * 26, s * 32.5, -26, 17, M.steel, 12);
    cylZ(17, s * 32, s * 50, -26, 17, M.tire, 56);
    cylZ(11.8, s * 31.8, s * 50.3, -26, 17, M.hub, 40);
    cylZ(1.6, s * 50, s * 50.5, -26, 17, M.hole, 12);
  }
  // batería: dos celdas con termofit verde
  for (const z of [-8, 8]) cylX(7, -14, 23, 13.2, z, M.batt);
  // postes y tarjetas perforadas
  for (const x of [-38, 14]) for (const z of [-29, 29]) cylY(1.6, 28, 44, x, z, M.steel);
  box(-42, 20, 44, 45.6, -30, 30, M.pcb);
  for (const x of [-34, 6]) for (const z of [-21, 21]) cylY(1.4, 45.6, 57, x, z, M.steel);
  box(-38, 10, 57, 58.6, -24, 24, M.pcb);
  // driver de motores (tarjeta morada) y regletas
  box(-36, -16, 45.6, 47.2, -27, -8, M.purple); box(-30, -22, 47.2, 48.4, -21, -14, M.chip);
  box(-40, 18, 45.6, 48, 27, 29, M.chip); box(-40, 18, 45.6, 48, -29.5, -27.5, M.chip);
  // Teensy 4.1 en la tarjeta de arriba
  box(-42, 19, 58.6, 61.2, 3, 4.6, M.chip); box(-42, 19, 58.6, 61.2, 18.4, 20, M.chip);
  box(-42, 19, 61.2, 62.8, 2, 21, M.pcb);
  box(-44.5, -38.5, 62.8, 65.6, 7.5, 15.5, M.usb);
  box(-12, -2, 62.8, 64, 6.5, 16.5, M.chip); box(10, 18, 62.8, 64.2, 6, 14, M.sd);
  // caja impresa sobre la tarjeta superior
  box(-4, 12, 58.6, 72, -21, -5, M.pla); box(-1, 9, 66, 72.2, -18, -8, M.pla2);
  // conector de batería
  box(-50, -44, 30, 35, -28, -20, M.red);

  // sensores VL53L5CX
  const sensors = [];
  const mk = (pos, yaw, key) => {
    const s = new THREE.Group(); s.position.set(...pos); s.rotation.y = yaw; g.add(s);
    const board = new THREE.Mesh(new THREE.BoxGeometry(1.6, 13, 25), M.pcbS); board.position.x = 0.8; board.castShadow = true; s.add(board);
    const chip = new THREE.Mesh(new THREE.BoxGeometry(1.6, 3.2, 6.4), M.chip); chip.position.x = 2.2; s.add(chip);
    for (const z of [-10, 10]) { const sc = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 1.6, 16), M.steel); sc.rotation.z = Math.PI / 2; sc.position.set(2.2, 0, z); s.add(sc); }
    const eye = new THREE.Object3D(); eye.position.x = 3; s.add(eye);
    sensors.push({ key, eye, yaw, group: s });
  };
  const chamfer = Math.atan2(18, 13); // normal de la cara diagonal
  const yawSide = Math.PI / 2 - chamfer;
  mk([30.6, 27, -22], yawSide, "left");
  mk([37, 27, 0], 0, "center");
  mk([30.6, 27, 22], -yawSide, "right");

  // cables (semilla fija para que siempre se vean igual)
  let seed = 11; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const wire = (pts, mat, r = 0.55) => add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p))), 40, r, 6, false), mat));
  const cols = [M.orange, M.yellow, M.red];
  [[30, -21], [35, 0], [30, 21]].forEach(([x, z], si) => {
    for (let k = 0; k < 3; k++) {
      const dz = (k - 1) * 3;
      wire([[x - 1, 33, z + dz], [x - 4 - rnd() * 4, 40 + rnd() * 8, z * 0.9 + dz], [x - 14, 50 + rnd() * 6, z * 0.6 + dz * 2], [12 - rnd() * 8, 47, z * 0.5 + (rnd() - 0.5) * 10]], cols[(k + si) % 3]);
    }
  });
  for (let k = 0; k < 8; k++) {
    const z0 = -24 + rnd() * 48, z1 = -24 + rnd() * 48, x0 = -38 + rnd() * 50, x1 = -38 + rnd() * 50;
    wire([[x0, 46, z0], [x0 + (rnd() - 0.5) * 18, 64 + rnd() * 12, (z0 + z1) / 2 + (rnd() - 0.5) * 20], [x1, 59, z1]], k % 3 === 0 ? M.yellow : k % 3 === 1 ? M.red : M.orange);
  }
  wire([[-47, 32, -24], [-56, 26, -30], [-60, 14, -36]], M.red, 0.9);
  wire([[-20, 20, -8], [-30, 38, -16], [-36, 46, -20]], M.red, 0.7);

  g.scale.setScalar(0.001);
  return { group: g, sensors };
}

function buildOpponent(M) {
  const g = new THREE.Group();
  const add = (m) => { m.castShadow = m.receiveShadow = true; g.add(m); return m; };
  const box = (x0, x1, y0, y1, z0, z1, mat) => { const m = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), mat); m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); return add(m); };
  box(-48, 34, 3, 38, -36, 36, M.opp);
  box(-40, 20, 38, 41, -30, 30, M.oppStripe);
  const s = new THREE.Shape(); [[30, 2], [50, 2], [34, 22], [30, 22]].forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)));
  const geo = new THREE.ExtrudeGeometry(s, { depth: 100, bevelEnabled: false }); geo.translate(0, 0, -50); add(new THREE.Mesh(geo, M.opp));
  for (const sgn of [-1, 1]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(16, 16, 12, 40), M.oppTire); w.rotation.x = Math.PI / 2; w.position.set(-22, 16, sgn * 43); add(w); }
  g.scale.setScalar(0.001);
  const hit = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.042, 0.1), new THREE.MeshBasicMaterial({ visible: false }));
  hit.position.y = 0.021;
  const root = new THREE.Group(); root.add(g); root.add(hit);
  return { root, hit };
}

/* ---------- mapa de color de las matrices ---------- */
const RAMP = [[0, [245, 230, 66]], [0.25, [255, 59, 141]], [0.6, [120, 80, 220]], [1, [34, 26, 70]]];
function ramp(t) {
  t = clamp(t, 0, 1);
  for (let i = 1; i < RAMP.length; i++) if (t <= RAMP[i][0]) {
    const [t0, c0] = RAMP[i - 1], [t1, c1] = RAMP[i], k = (t - t0) / (t1 - t0);
    return `rgb(${c0.map((c, j) => Math.round(c + (c1[j] - c) * k)).join(",")})`;
  }
  return "rgb(34,26,70)";
}
const MAXD = 0.8; // escala de color: 0 a 80 cm

export async function mountSumo(el, opts = {}) {
  let lang = opts.lang === "en" ? "en" : "es";
  if (!document.getElementById("ssim-css")) { const s = document.createElement("style"); s.id = "ssim-css"; s.textContent = CSS; document.head.appendChild(s); }
  el.innerHTML = "";
  const root = document.createElement("div"); root.className = "ssim"; el.appendChild(root);
  const view = document.createElement("div"); view.className = "ssim-view"; root.appendChild(view);
  const panel = document.createElement("div"); panel.className = "ssim-panel"; root.appendChild(panel);
  const msg = document.createElement("div"); msg.className = "ssim-msg"; view.appendChild(msg);
  const hud = document.createElement("div"); hud.className = "ssim-hud"; view.appendChild(hud);
  const toast = document.createElement("div"); toast.className = "ssim-toast"; toast.hidden = true; view.appendChild(toast);
  msg.textContent = T[lang].loading;

  const C = {
    sheet: tok(root, "--sheet", "#110C22"), rule: tok(root, "--rule", "#3B3066"), rule2: tok(root, "--rule-2", "#211941"),
    cyan: tok(root, "--cyan", "#2DE2F0"), magenta: tok(root, "--magenta", "#FF3B8D"), yellow: tok(root, "--yellow", "#F5E642"), ink: tok(root, "--ink", "#EEE8FF"),
  };
  const SENSOR_COL = { left: C.cyan, center: C.magenta, right: C.yellow };

  let renderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: !!opts.preserve }); }
  catch (e) { msg.textContent = T[lang].err; throw e; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  view.insertBefore(renderer.domElement, msg);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(C.sheet);
  scene.fog = new THREE.Fog(new THREE.Color(C.sheet), 2.2, 5);
  const camera = new THREE.PerspectiveCamera(38, 1, 0.005, 20);
  camera.position.set(0.1, 0.3, 0.58);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0.06, 0.06); controls.enableDamping = true; controls.minDistance = 0.12; controls.maxDistance = 2.4; controls.maxPolarAngle = deg(86);

  scene.add(new THREE.HemisphereLight(0xc9bcff, 0x120d22, 0.9));
  const key = new THREE.DirectionalLight(0xffffff, 1.9); key.position.set(0.5, 1.2, 0.35); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -0.6, right: 0.6, top: 0.6, bottom: -0.6, near: 0.1, far: 3 }); key.shadow.bias = -0.0004;
  scene.add(key);
  const rimA = new THREE.PointLight(new THREE.Color(C.magenta), 1.4, 0, 2); rimA.position.set(-0.55, 0.28, -0.5); scene.add(rimA);
  const rimB = new THREE.PointLight(new THREE.Color(C.cyan), 1.2, 0, 2); rimB.position.set(0.6, 0.25, -0.55); scene.add(rimB);

  const M = materials();
  // reflejos para las piezas metálicas (sin esto el acero se ve negro)
  const pmrem = new THREE.PMREMGenerator(renderer), envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  for (const m of Object.values(M)) if (m.metalness > 0.5) { m.envMap = envTex; m.envMapIntensity = 0.85; }
  // piso del área y dohyo
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), new THREE.MeshStandardMaterial({ color: new THREE.Color(C.sheet).lerp(new THREE.Color(C.rule2), 0.6), roughness: 1 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const grid = new THREE.GridHelper(8, 160, new THREE.Color(C.rule), new THREE.Color(C.rule2)); grid.position.y = 0.0004; scene.add(grid);
  const glow = new THREE.Mesh(new THREE.RingGeometry(0.47, 0.476, 128), new THREE.MeshBasicMaterial({ color: new THREE.Color(C.magenta) })); glow.rotation.x = -Math.PI / 2; glow.position.y = 0.001; scene.add(glow);
  const dohyo = new THREE.Mesh(new THREE.CylinderGeometry(DOHYO_R, DOHYO_R, DOHYO_H, 128), M.dohyo); dohyo.position.y = DOHYO_H / 2; dohyo.receiveShadow = true; dohyo.castShadow = true; scene.add(dohyo);
  const border = new THREE.Mesh(new THREE.RingGeometry(DOHYO_R - BORDER, DOHYO_R, 128), M.white); border.rotation.x = -Math.PI / 2; border.position.y = DOHYO_H + 0.0003; border.receiveShadow = true; scene.add(border);

  const { group: robotMesh, sensors } = buildRobot(M);
  const robot = new THREE.Group(); robot.add(robotMesh); scene.add(robot);
  const opp = buildOpponent(M); scene.add(opp.root);

  /* ---------- estado ---------- */
  const S = { x: -0.16, z: 0.02, th: 0, ox: 0.16, oz: 0.13, oth: deg(200), N: 8, fov: true, follow: false, out: false, fall: 0, mode: "idle", lastSign: 1 };
  const home = { x: S.x, z: S.z, th: S.th, ox: S.ox, oz: S.oz, oth: S.oth };
  function place() {
    robot.position.set(S.x, DOHYO_H, S.z); robot.rotation.y = S.th;
    opp.root.position.set(S.ox, DOHYO_H - S.fall * DOHYO_H, S.oz); opp.root.rotation.set(0, S.oth, 0);
    if (S.fall > 0) { opp.root.rotation.z = -S.fall * 0.5; }
  }
  place();

  /* ---------- campos de visión ---------- */
  const fovGroup = new THREE.Group(); scene.add(fovGroup);
  const hitMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(0.0028, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }), 3 * 64);
  hitMesh.count = 0; hitMesh.frustumCulled = false; scene.add(hitMesh);
  const dirOf = (az, el) => new THREE.Vector3(Math.cos(el) * Math.cos(az), Math.sin(el), -Math.cos(el) * Math.sin(az));
  function buildFov() {
    fovGroup.clear();
    const h = deg(FOV / 2), L = 0.24;
    sensors.forEach((s) => {
      const pts = [], cs = [[h, h], [-h, h], [-h, -h], [h, -h]];
      cs.forEach(([a, e]) => pts.push(new THREE.Vector3(), dirOf(a, e).multiplyScalar(L)));
      for (let i = 0; i < 4; i++) pts.push(dirOf(...cs[i]).multiplyScalar(L), dirOf(...cs[(i + 1) % 4]).multiplyScalar(L));
      const mat = new THREE.LineBasicMaterial({ color: new THREE.Color(SENSOR_COL[s.key]), transparent: true, opacity: 0.8 });
      const ln = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts), mat);
      const gp = [];
      for (let k = 1; k < S.N; k++) {
        const t = -h + (2 * h * k) / S.N;
        for (let m = 0; m < 12; m++) { const u0 = -h + (2 * h * m) / 12, u1 = -h + (2 * h * (m + 1)) / 12; gp.push(dirOf(t, u0).multiplyScalar(L), dirOf(t, u1).multiplyScalar(L), dirOf(u0, t).multiplyScalar(L), dirOf(u1, t).multiplyScalar(L)); }
      }
      const gl = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(gp), new THREE.LineBasicMaterial({ color: new THREE.Color(SENSOR_COL[s.key]), transparent: true, opacity: 0.22 }));
      const holder = new THREE.Group(); holder.add(ln, gl); holder.userData.eye = s.eye; fovGroup.add(holder);
    });
  }
  buildFov();

  /* ---------- simulación de las matrices ---------- */
  const ray = new THREE.Raycaster(); ray.far = RANGE;
  const targets = [opp.hit, dohyo, border, floor];
  const frame = { left: [], center: [], right: [] };
  let det = null;
  const tmpQ = new THREE.Quaternion(), tmpP = new THREE.Vector3(), tmpM = new THREE.Matrix4(), col = new THREE.Color();
  function sense() {
    robot.updateMatrixWorld(true); opp.root.updateMatrixWorld(true);
    const N = S.N, step = deg(FOV) / N, h0 = deg(FOV / 2);
    let wsum = 0, bsum = 0, dmin = Infinity, n = 0, hits = 0; const seenBy = [];
    sensors.forEach((s) => {
      s.eye.getWorldPosition(tmpP); s.eye.getWorldQuaternion(tmpQ);
      const hgt = tmpP.y - DOHYO_H; const arr = []; let seen = false;
      for (let i = 0; i < N; i++) {
        const el = h0 - (i + 0.5) * step;
        for (let j = 0; j < N; j++) {
          const az = h0 - (j + 0.5) * step;
          const d = dirOf(az, el).applyQuaternion(tmpQ);
          ray.set(tmpP, d);
          const hit = ray.intersectObjects(targets, false)[0];
          const dist = hit ? hit.distance : Infinity;
          const expect = el < 0 ? hgt / Math.sin(-el) : Infinity; // dohyo vacío
          const obj = dist < RANGE && dist < expect * 0.85;
          arr.push({ d: dist, obj });
          if (obj) {
            seen = true; n++; dmin = Math.min(dmin, dist);
            const yaw = s.yaw + az, w = 1 / Math.max(dist, 0.01); wsum += w; bsum += w * yaw;
            if (hits < 3 * 64) { tmpM.makeTranslation(hit.point.x, hit.point.y, hit.point.z); hitMesh.setMatrixAt(hits, tmpM); hitMesh.setColorAt(hits, col.set(SENSOR_COL[s.key])); hits++; }
          }
        }
      }
      frame[s.key] = arr; if (seen) seenBy.push(s.key);
    });
    hitMesh.count = S.fov ? hits : 0; hitMesh.instanceMatrix.needsUpdate = true; if (hitMesh.instanceColor) hitMesh.instanceColor.needsUpdate = true;
    det = n ? { bearing: bsum / wsum, dist: dmin, n, seenBy } : null;
    drawMats(); readout();
  }

  /* ---------- controlador de demostración ---------- */
  function control(dt) {
    let v = 0, w = 0;
    if (S.out) { S.mode = "out"; }
    else if (!S.follow) { S.mode = "idle"; }
    else if (det) {
      S.lastSign = Math.sign(det.bearing) || S.lastSign;
      w = clamp(5 * det.bearing, -3.5, 3.5);
      v = Math.abs(det.bearing) < deg(14) ? 0.28 : 0.03;
      S.mode = "tracking";
    } else { w = 2.6 * S.lastSign; S.mode = "searching"; }
    const fx = Math.cos(S.th), fz = -Math.sin(S.th);
    const r = Math.hypot(S.x, S.z);
    if (r > DOHYO_R - 0.065 && (fx * S.x + fz * S.z) > 0) v = Math.min(v, 0);
    S.th += w * dt; S.x += Math.cos(S.th) * v * dt; S.z += -Math.sin(S.th) * v * dt;
    // contacto: el oponente se empuja con el frente del robot
    if (!S.out) {
      const dx = S.ox - S.x, dz = S.oz - S.z, c = Math.cos(S.th), s = Math.sin(S.th);
      const lx = dx * c - dz * s, lz = dx * s + dz * c; // marco del robot (lz a la derecha)
      if (Math.abs(lz) < 0.095 && lx > -0.05 && lx < 0.1) {
        const push = 0.1 - lx; S.ox += c * push; S.oz += -s * push; if (S.follow && v > 0) S.mode = "pushing";
      }
      if (Math.hypot(S.ox, S.oz) > DOHYO_R + 0.005) { S.out = true; S.follow = false; toast.textContent = T[lang].out; toast.hidden = false; syncButtons(); }
    }
    if (S.out && S.fall < 1) {
      S.fall = Math.min(1, S.fall + dt * 3);
      const r = Math.hypot(S.ox, S.oz), rt = DOHYO_R + 0.075; // se desliza fuera del borde mientras cae
      if (r < rt) { const k = Math.min(rt, r + dt * 0.25) / r; S.ox *= k; S.oz *= k; }
    }
    place();
  }

  /* ---------- arrastrar al oponente ---------- */
  const pointer = new THREE.Vector2(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -DOHYO_H), pick = new THREE.Raycaster(), pt = new THREE.Vector3();
  let dragging = false, dragOff = new THREE.Vector3();
  const setPointer = (e) => { const r = renderer.domElement.getBoundingClientRect(); pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); pick.setFromCamera(pointer, camera); };
  renderer.domElement.addEventListener("pointerdown", (e) => {
    setPointer(e);
    if (pick.intersectObject(opp.hit, false).length) {
      dragging = true; controls.enabled = false; renderer.domElement.setPointerCapture(e.pointerId); renderer.domElement.classList.add("drag");
      if (S.out) { S.out = false; S.fall = 0; toast.hidden = true; }
      if (pick.ray.intersectPlane(plane, pt)) dragOff.set(S.ox - pt.x, 0, S.oz - pt.z);
    }
  });
  renderer.domElement.addEventListener("pointermove", (e) => {
    if (!dragging) return; setPointer(e);
    if (!pick.ray.intersectPlane(plane, pt)) return;
    let x = pt.x + dragOff.x, z = pt.z + dragOff.z; const r = Math.hypot(x, z), rmax = DOHYO_R - 0.05;
    if (r > rmax) { x *= rmax / r; z *= rmax / r; }
    const dx = x - S.x, dz = z - S.z, d = Math.hypot(dx, dz);
    if (d < 0.12) { x = S.x + (dx / (d || 1)) * 0.12; z = S.z + (dz / (d || 1)) * 0.12; }
    S.ox = x; S.oz = z; place();
  });
  const endDrag = (e) => { if (!dragging) return; dragging = false; controls.enabled = true; renderer.domElement.classList.remove("drag"); try { renderer.domElement.releasePointerCapture(e.pointerId); } catch (_) {} };
  renderer.domElement.addEventListener("pointerup", endDrag); renderer.domElement.addEventListener("pointercancel", endDrag);

  /* ---------- panel ---------- */
  let mats = {}, readEl, btn = {};
  function buildPanel() {
    const t = T[lang];
    panel.innerHTML = `
      <div class="ssim-sec"><h4>${t.sensors}</h4>
        <div class="ssim-mats">${["left", "center", "right"].map((k) => `<div class="ssim-mat"><canvas width="160" height="160" data-k="${k}" role="img" aria-label="${t[k]}"></canvas><span><i style="background:${SENSOR_COL[k]}"></i>${t[k]}</span></div>`).join("")}</div>
        <div class="ssim-small">${t.seenFrom}</div>
        <div class="ssim-legend"><span>${t.legend}</span><div class="bar" style="background:linear-gradient(90deg,${[0, 0.25, 0.5, 0.75, 1].map((x) => ramp(x)).join(",")})"></div><div class="lb"><span>0</span><span>20</span><span>40</span><span>60</span><span>≥ 80 cm</span></div></div>
        <div class="ssim-btns" role="group" aria-label="${t.res}"><span class="ssim-small" style="align-self:center">${t.res}</span>
          <button type="button" id="ssim-r4" aria-pressed="${S.N === 4}">4×4 · ${t.rate} ${RATE[4]} Hz</button><button type="button" id="ssim-r8" aria-pressed="${S.N === 8}">8×8 · ${t.rate} ${RATE[8]} Hz</button></div>
      </div>
      <div class="ssim-sec"><div class="ssim-read" id="ssim-read"></div></div>
      <div class="ssim-sec"><h4>${t.sim}</h4>
        <div class="ssim-btns"><button type="button" class="go" id="ssim-follow" aria-pressed="${S.follow}">${S.follow ? t.stop : t.follow}</button><button type="button" id="ssim-reset">${t.reset}</button></div>
        <label class="ssim-tg"><input type="checkbox" id="ssim-fov" ${S.fov ? "checked" : ""}> ${t.fov}</label>
        <div class="ssim-btns" role="group" aria-label="${t.views}"><span class="ssim-small" style="align-self:center">${t.views}</span><button type="button" data-v="v34">${t.v34}</button><button type="button" data-v="top">${t.vtop}</button><button type="button" data-v="back">${t.vback}</button></div>
      </div>
      <div class="ssim-sec"><p class="ssim-small" style="margin:0">${t.note}</p></div>`;
    panel.querySelectorAll("canvas[data-k]").forEach((c) => (mats[c.dataset.k] = c));
    readEl = panel.querySelector("#ssim-read");
    btn.r4 = panel.querySelector("#ssim-r4"); btn.r8 = panel.querySelector("#ssim-r8"); btn.follow = panel.querySelector("#ssim-follow");
    btn.r4.onclick = () => setRes(4); btn.r8.onclick = () => setRes(8);
    btn.follow.onclick = () => setFollow(!S.follow);
    panel.querySelector("#ssim-reset").onclick = reset;
    panel.querySelector("#ssim-fov").onchange = (e) => { S.fov = e.target.checked; fovGroup.visible = S.fov; hitMesh.visible = S.fov; };
    panel.querySelectorAll("[data-v]").forEach((b) => (b.onclick = () => setView(b.dataset.v)));
    hud.innerHTML = `<span>${t.hint}</span>`;
    drawMats(); readout();
  }
  function syncButtons() {
    if (!btn.follow) return; const t = T[lang];
    btn.follow.setAttribute("aria-pressed", S.follow); btn.follow.textContent = S.follow ? t.stop : t.follow;
    btn.r4.setAttribute("aria-pressed", S.N === 4); btn.r8.setAttribute("aria-pressed", S.N === 8);
  }
  function drawMats() {
    const N = S.N, t = T[lang];
    for (const k of ["left", "center", "right"]) {
      const c = mats[k]; if (!c) continue; const x = c.getContext("2d"), cell = c.width / N, arr = frame[k];
      x.fillStyle = C.sheet; x.fillRect(0, 0, c.width, c.height);
      for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
        const z = arr[i * N + j]; if (!z) continue;
        if (z.d >= RANGE) { x.fillStyle = "rgb(20,15,40)"; x.fillRect(j * cell, i * cell, cell, cell); x.fillStyle = C.rule; x.fillRect(j * cell + cell / 2 - 1, i * cell + cell / 2 - 1, 2, 2); }
        else { x.fillStyle = ramp(z.d / MAXD); x.fillRect(j * cell, i * cell, cell, cell); }
        if (z.obj) { x.strokeStyle = C.ink; x.lineWidth = 2; x.strokeRect(j * cell + 2, i * cell + 2, cell - 4, cell - 4); }
        if (N === 4 && z.d < RANGE) { x.fillStyle = z.d / MAXD < 0.45 ? "#110C22" : C.ink; x.font = `600 ${Math.round(cell * 0.28)}px system-ui,sans-serif`; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(String(Math.round(z.d * 100)), j * cell + cell / 2, i * cell + cell / 2); }
      }
      x.strokeStyle = "rgba(0,0,0,.35)"; x.lineWidth = 1;
      for (let k2 = 1; k2 < N; k2++) { x.beginPath(); x.moveTo(k2 * cell, 0); x.lineTo(k2 * cell, c.height); x.moveTo(0, k2 * cell); x.lineTo(c.width, k2 * cell); x.stroke(); }
      c.setAttribute("aria-label", `${t[k]}: ${arr.filter((z) => z.obj).length} / ${N * N}`);
    }
  }
  function readout() {
    if (!readEl) return; const t = T[lang];
    const b = det ? Math.round((det.bearing * 180) / Math.PI) : null;
    const side = b === null ? "" : b > 2 ? ` ${t.leftS}` : b < -2 ? ` ${t.rightS}` : "";
    readEl.innerHTML = `<span>${t.det}</span><b style="color:${det ? C.magenta : "inherit"}">${det ? t.yes : t.no}</b>
      <span>${t.bearing}</span><b>${b === null ? "—" : (b > 0 ? "+" : "") + b + "°" + side}</b>
      <span>${t.dist}</span><b>${det ? Math.round(det.dist * 1000) + " mm" : "—"}</b>
      <span>${t.zones}</span><b>${det ? det.n : 0} / ${3 * S.N * S.N}</b>
      <span>${t.seen}</span><b>${det ? det.seenBy.map((k) => t[k]).join(", ") : t.none}</b>
      <span>${t.state}</span><b>${t[S.mode === "out" ? "outS" : S.mode]}</b>`;
  }
  function setRes(n) { S.N = n; buildFov(); fovGroup.visible = S.fov; syncButtons(); sense(); }
  function setFollow(on) { if (S.out && on) reset(); S.follow = on; syncButtons(); }
  function reset() { Object.assign(S, { x: home.x, z: home.z, th: home.th, ox: home.ox, oz: home.oz, oth: home.oth, out: false, fall: 0, follow: false, mode: "idle" }); toast.hidden = true; place(); syncButtons(); sense(); }
  function setView(v, pos, target) {
    if (pos) { camera.position.set(...pos); controls.target.set(...target); controls.update(); return; }
    const f = new THREE.Vector3(Math.cos(S.th), 0, -Math.sin(S.th));
    if (v === "top") { camera.position.set(0.0001, 1.15, 0.0001); controls.target.set(0, DOHYO_H, 0); }
    else if (v === "back") { camera.position.set(S.x - f.x * 0.32, 0.2, S.z - f.z * 0.32); controls.target.set(S.x + f.x * 0.25, DOHYO_H, S.z + f.z * 0.25); }
    else { const k = camera.aspect < 1.1 ? 1.6 : 1; camera.position.set(0.1 * k, 0.06 + 0.24 * k, 0.06 + 0.52 * k); controls.target.set(0, 0.06, 0.06); }
    controls.update();
  }

  /* ---------- ciclo ---------- */
  function resize() { const w = view.clientWidth, h = view.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
  new ResizeObserver(resize).observe(view); resize(); setView("v34");
  let visible = true, last = performance.now(), acc = 0;
  if ("IntersectionObserver" in window) new IntersectionObserver((es) => { visible = es.some((x) => x.isIntersecting); if (visible) last = performance.now(); }).observe(view);
  function tick(now) {
    requestAnimationFrame(tick);
    if (!visible) return;
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    control(dt);
    acc += dt; if (acc >= 1 / RATE[S.N] || dragging) { acc = 0; sense(); }
    fovGroup.children.forEach((h) => { h.userData.eye.getWorldPosition(h.position); h.userData.eye.getWorldQuaternion(h.quaternion); });
    controls.update(); renderer.render(scene, camera);
  }
  msg.remove();
  buildPanel(); sense(); requestAnimationFrame(tick);

  return {
    setLang(l) { lang = l === "en" ? "en" : "es"; buildPanel(); if (!toast.hidden) toast.textContent = T[lang].out; },
    view: setView, follow: setFollow, reset, res: setRes,
    setOpp(x, z, th) { S.ox = x; S.oz = z; if (th !== undefined) S.oth = th; S.out = false; S.fall = 0; place(); sense(); },
    setRobot(x, z, th) { S.x = x; S.z = z; S.th = th; place(); sense(); },
    state: () => ({ ...S, det }),
    step(sec) { const n = Math.round(sec / 0.02); for (let i = 0; i < n; i++) { control(0.02); if (i % 3 === 0) sense(); } sense(); fovGroup.children.forEach((h) => { h.userData.eye.getWorldPosition(h.position); h.userData.eye.getWorldQuaternion(h.quaternion); }); renderer.render(scene, camera); },
  };
}

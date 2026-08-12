/* ════════════════════════════════════════════════════════════════
   tower3d.js — Personaje 3D de fondo + micro-interacciones.
   Se carga desde todas las páginas del portfolio.
   - El personaje (models/tboxfinn.glb u otro .glb) aparece completo
     arriba de la página y DESAPARECE al scrollear (flujo inverso).
   - Si el modelo trae animaciones (Mixamo→GLB), reproduce la primera.
   - Micro-interacciones: stagger del nombre, reveals, HUD, easter eggs.
   El contenido HTML es SIEMPRE visible: el 3D es un fondo opcional.
   ════════════════════════════════════════════════════════════════ */

const $ = (s) => document.querySelector(s);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ═══════════════ MICRO-INTERACCIONES ═══════════════ */

/* Hero: stagger reveal letra por letra por LÍNEA (solo en la home) */
(function initStagger() {
  const el = document.getElementById('hero-name');
  if (!el || REDUCED_MOTION) return;
  const lines = el.querySelectorAll('.line');
  if (!lines.length) return;
  let idx = 0;
  lines.forEach((line) => {
    const text = line.textContent.trim();
    line.textContent = '';
    [...text].forEach((ch) => {
      const s = document.createElement('span');
      s.className = 'ch';
      s.textContent = ch === ' ' ? ' ' : ch;
      s.style.transitionDelay = (idx * 24) + 'ms';
      line.appendChild(s);
      idx++;
    });
  });
  const show = () => el.querySelectorAll('.ch').forEach((s) => s.classList.add('visible'));
  requestAnimationFrame(() => requestAnimationFrame(show));
  setTimeout(show, 600); // respaldo si rAF no corre
})();

/* Reveals por scroll con respaldo: nunca dejan contenido oculto */
(function initReveals() {
  const els = document.querySelectorAll('.reveal');
  const showAll = () => els.forEach((el) => el.classList.add('visible'));
  if (!('IntersectionObserver' in window)) { showAll(); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.05 });
  els.forEach((el) => io.observe(el));
  setTimeout(showAll, 2000); // respaldo de seguridad

  /* Contenido dinámico (juegos de itch.io, assets, etc.): cuando se
     insertan tarjetas .reveal nuevas, se observan automáticamente —
     sin esto quedarían invisibles (opacity 0) para siempre. */
  const mo = new MutationObserver((mutations) => {
    mutations.forEach((m) => {
      m.addedNodes.forEach((node) => {
        if (node.nodeType !== 1) return;
        if (node.classList && node.classList.contains('reveal')) io.observe(node);
        node.querySelectorAll && node.querySelectorAll('.reveal').forEach((el) => io.observe(el));
      });
    });
  });
  mo.observe(document.body, { childList: true, subtree: true });
})();

/* ── Easter eggs + contador DISCOVERIES (nunca bloquean contenido) ── */
const found = new Set();
let toastTimers = [];

function toast(msg) {
  const box = document.getElementById('toasts');
  if (!box) return;
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  box.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  toastTimers.push(setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.remove(), 400);
  }, 2600));
  while (toastTimers.length > 3) clearTimeout(toastTimers.shift());
}

let totalEggs = 0;
function discover(key) {
  if (found.has(key)) return false;
  found.add(key);
  const n = found.size;
  const disc = document.getElementById('hud-disc');
  if (disc) disc.textContent = n + '/' + totalEggs;
  if (n === totalEggs) toast('🏆 All discoveries found! You built a friendship.');
  return true;
}

(function initEggs() {
  const reg = (id, key, msg, event, target) => {
    totalEggs++;
    const el = target ? document.querySelector(target) : document.getElementById(id);
    if (!el) return;
    el.addEventListener(event, () => { if (discover(key)) toast(msg); });
  };
  reg('egg-logo', 'logo', '🐸 Ribbit! The frog behind the code.', 'mouseenter');
  if (document.getElementById('egg-logo')) {
    document.getElementById('egg-logo').addEventListener('focus', () => {
      if (discover('logo')) toast('🐸 Ribbit! The frog behind the code.');
    });
  }
  reg('egg-heart', 'heart', '♥ You found the heart!', 'mouseenter');
  reg('egg-hud', 'hud', '🛠️ Construction crew: 1 (it’s me)', 'mouseenter');
  reg('hero-name', 'name', '✨ Double-click unlocked: Hugo.exe', 'dblclick');
  const beliefs = document.querySelectorAll('.egg-belief');
  beliefs.forEach((li, i) => {
    totalEggs++;
    li.addEventListener('mouseenter', () => {
      if (discover('belief' + i)) toast('🧠 Belief #' + (i + 1));
    });
  });
  const disc = document.getElementById('hud-disc');
  if (disc) disc.textContent = '0/' + totalEggs;
})();

/* ═══════════════ ESCENA 3D (opcional, async, nunca bloquea) ═══════════════ */

function webglSupported() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch { return false; }
}

const IS_MOBILE = window.matchMedia('(max-width: 768px)').matches || window.matchMedia('(pointer: coarse)').matches;
const LOW_END = IS_MOBILE && (navigator.hardwareConcurrency || 8) <= 4;

if (!webglSupported() || LOW_END) {
  document.getElementById('scene').style.display = 'none';
  document.getElementById('scene-fallback').style.display = 'block';
}

initSceneAsync();

async function initSceneAsync() {
  if (!webglSupported() || LOW_END) return;
  let THREE;
  try {
    THREE = await import('three');
  } catch (e) {
    document.getElementById('scene').style.display = 'none';
    document.getElementById('scene-fallback').style.display = 'block';
    return;
  }
  try {
    const model = await loadTenshuModel(THREE);
    initScene(THREE, model);
  } catch (e) {
    console.error('Scene init failed:', e);
    document.getElementById('scene').style.display = 'none';
    document.getElementById('scene-fallback').style.display = 'block';
  }
}

/* ── Carga del modelo 3D propio ── */
async function loadTenshuModel(THREE) {
  const isHttp = location.protocol === 'http:' || location.protocol === 'https:';
  if (!isHttp) {
    console.warn('ℹ️ Abre con un servidor estático para que cargue el modelo 3D de models/.');
    return null;
  }
  const CANDIDATES = [
    'models/tboxfinn.glb',   // el personaje 3D (Tboxfinn)
    'models/tenshu.glb', 'models/tenshu.gltf',
    'models/tower.glb', 'models/tower.gltf',
    'models/tenshu.obj', 'models/tower.obj'
  ];
  for (const url of CANDIDATES) {
    try {
      if (url.endsWith('.obj')) {
        const { OBJLoader } = await import('https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/loaders/OBJLoader.js');
        const obj = await new OBJLoader().loadAsync(url);
        console.log('🏯 Modelo cargado:', url);
        return { scene: obj, animations: [] };
      }
      const { GLTFLoader } = await import('https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/loaders/GLTFLoader.js');
      const gltf = await new GLTFLoader().loadAsync(url);
      console.log('🏯 Modelo cargado:', url);
      return { scene: gltf.scene, animations: gltf.animations || [] };
    } catch { /* probar siguiente candidato */ }
  }
  console.warn('ℹ️ No hay modelo 3D en models/ — usando placeholder temporal.');
  return null;
}

/* ── Normalización: altura objetivo, centrado, base en y=0 ──
   Para SkinnedMesh se mide el box de los BONES (lo que renderiza). */
const MODEL_TARGET_H = 12.6;

function skeletonBox(THREE, model) {
  const box = new THREE.Box3();
  model.traverse((o) => {
    /* expandByObject NO expande objetos sin geometría (los bones solo
       tienen posición) — se expande manualmente con cada punto */
    if (o.isBone) box.expandByPoint(o.getWorldPosition(new THREE.Vector3()));
  });
  return box;
}

function normalizeModel(THREE, model) {
  model.updateMatrixWorld(true);
  const size = skeletonBox(THREE, model).getSize(new THREE.Vector3());
  const scale = MODEL_TARGET_H / Math.max(size.y, 0.001);
  model.scale.setScalar(scale);
  model.updateMatrixWorld(true);
  const box = skeletonBox(THREE, model);
  const center = box.getCenter(new THREE.Vector3());
  model.position.x = -center.x;
  model.position.z = -center.z;
  model.position.y = -box.min.y;
  model.updateMatrixWorld(true);
  return box.getSize(new THREE.Vector3()).y;
}

/* ── Asignar el plano de corte a todos los materiales del modelo ── */
function applyCutToModel(THREE, model, cutPlane) {
  model.traverse((o) => {
    if (!o.isMesh) return;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    mats.forEach((m) => {
      m.clippingPlanes = [cutPlane];
      m.clipShadows = true;
    });
    o.castShadow = true;
  });
}

/* ───────── Paletas por tema (CSS + 3D) ───────── */
const PALETTES = {
  day: {
    yeso: 0xF2EADB, madera: 0x5C4632, tejas: 0x3E4650,
    piedra: 0x8D8577, oro: 0xD4A94B,
    ground: 0xD9CFBC,
    particles: 0xFFFFFF,
    ring: 0x9E5300,
    skyTop: '#8FC3E8', skyBottom: '#F6F1E7', fog: 0xF6F1E7
  },
  night: {
    yeso: 0x3E382F, madera: 0x2A241C, tejas: 0x17181C,
    piedra: 0x35302A, oro: 0xC9A24B,
    ground: 0x241F19,
    particles: 0xFFD9A0,
    ring: 0xffa300,
    skyTop: '#0d0b1a', skyBottom: '#161310', fog: 0x161310
  }
};

const TOWER_TOP = 18.1;   // referencia del placeholder procedural

let renderer, scene, camera, towerGroup;
let matYeso, matMadera, matTejas, matPiedra, matOro, matGround, matPedestal;
let particles, cutRing, skyTexture;
let cutPlane;
let currentCut = 0;
let cutTarget = TOWER_TOP;
let topY = TOWER_TOP;
let progress = 0;
let theme = document.body.classList.contains('dark-mode') ? 'night' : 'day';
let needsRender = true;
let modelLoaded = false;
let mixer = null;

function initScene(THREE, model) {
  const canvas = document.getElementById('scene');
  const pal = () => PALETTES[theme];
  modelLoaded = !!model;

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(IS_MOBILE ? 1 : Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.localClippingEnabled = true;
  if (!IS_MOBILE) renderer.shadowMap.enabled = true;

  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(pal().fog, 22, 44);

  const makeSky = () => {
    const c = document.createElement('canvas');
    c.width = 4; c.height = 256;
    const ctx = c.getContext('2d');
    const g = ctx.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, pal().skyTop);
    g.addColorStop(1, pal().skyBottom);
    ctx.fillStyle = g; ctx.fillRect(0, 0, 4, 256);
    return new THREE.CanvasTexture(c);
  };
  skyTexture = makeSky();
  scene.background = skyTexture;

  /* Cámara fija — la escena queda en la franja DERECHA del viewport */
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(16, 12, 25);
  camera.lookAt(-18, 8.5, 0);

  const hemi = new THREE.HemisphereLight(0xFFE8C8, 0x8A7B62, 1.1);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xFFD9A0, 1.8);
  sun.position.set(6, 14, 8);
  if (!IS_MOBILE) {
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = -9; sun.shadow.camera.right = 9;
    sun.shadow.camera.top = 17; sun.shadow.camera.bottom = -2;
    sun.shadow.camera.near = 1; sun.shadow.camera.far = 35;
  }
  scene.add(sun);

  /* Plano de corte — se conserva y < constant (normal hacia abajo) */
  cutPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);

  const clip = [cutPlane];
  matYeso   = new THREE.MeshStandardMaterial({ color: pal().yeso,   flatShading: true, clippingPlanes: clip, clipShadows: true });
  matMadera = new THREE.MeshStandardMaterial({ color: pal().madera, flatShading: true, clippingPlanes: clip, clipShadows: true });
  matTejas  = new THREE.MeshStandardMaterial({ color: pal().tejas,  flatShading: true, side: THREE.DoubleSide, clippingPlanes: clip, clipShadows: true });
  matPiedra = new THREE.MeshStandardMaterial({ color: pal().piedra, flatShading: true, clippingPlanes: clip, clipShadows: true });
  matOro    = new THREE.MeshStandardMaterial({ color: pal().oro,    flatShading: true, clippingPlanes: clip, clipShadows: true });

  towerGroup = new THREE.Group();
  if (model) {
    topY = normalizeModel(THREE, model.scene) || TOWER_TOP;
    applyCutToModel(THREE, model.scene, cutPlane);
    towerGroup.add(model.scene);
    if (model.animations.length) {
      mixer = new THREE.AnimationMixer(model.scene);
      mixer.clipAction(model.animations[0]).play();
      console.log('🎬 Animación activa:', model.animations[0].name);
    }

    /* Plataforma bajo el personaje (ancla visual — no flota) */
    matPedestal = new THREE.MeshStandardMaterial({ color: pal().piedra, flatShading: true });
    const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(6.5, 7.4, 0.5, 32), matPedestal);
    pedestal.position.y = -0.25;
    towerGroup.add(pedestal);

    /* Sombra suave (blob) sobre la plataforma — con clipping */
    const sc = document.createElement('canvas');
    sc.width = 64; sc.height = 64;
    const sctx = sc.getContext('2d');
    const sg = sctx.createRadialGradient(32, 32, 4, 32, 32, 30);
    sg.addColorStop(0, 'rgba(0,0,0,0.45)');
    sg.addColorStop(1, 'rgba(0,0,0,0)');
    sctx.fillStyle = sg; sctx.fillRect(0, 0, 64, 64);
    const shadowTex = new THREE.CanvasTexture(sc);
    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(5.5, 32),
      new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, clippingPlanes: [cutPlane] })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.02;
    towerGroup.add(shadow);
  } else {
    buildTenshu(THREE);
  }
  scene.add(towerGroup);

  /* Suelo */
  matGround = new THREE.MeshStandardMaterial({ color: pal().ground, flatShading: true });
  const ground = new THREE.Mesh(new THREE.CircleGeometry(10, 48), matGround);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.02;
  scene.add(ground);

  /* Partículas */
  const pGeo = new THREE.BufferGeometry();
  const pCount = IS_MOBILE ? 200 : 400;
  const pos = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount; i++) {
    pos[i * 3]     = (Math.random() - 0.5) * 18;
    pos[i * 3 + 1] = Math.random() * (TOWER_TOP + 2) + 2;
    pos[i * 3 + 2] = (Math.random() - 0.6) * 10;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
    color: pal().particles, size: 0.09, sizeAttenuation: true,
    transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending
  }));
  scene.add(particles);

  /* Anillo de corte */
  cutRing = new THREE.Mesh(
    new THREE.RingGeometry(0.6, 7.5, 48),
    new THREE.MeshBasicMaterial({ color: pal().ring, transparent: true, opacity: 0.25, depthTest: false, side: THREE.DoubleSide })
  );
  cutRing.rotation.x = -Math.PI / 2;
  cutRing.renderOrder = 10;
  scene.add(cutRing);

  /* ── Scroll → progreso (FLUJO INVERSO) ── */
  const recomputeDocHeight = () => {
    const doc = document.documentElement.scrollHeight - window.innerHeight;
    return Math.max(doc, 1);
  };
  const onScroll = () => {
    const docH = recomputeDocHeight();
    progress = clamp(window.scrollY / docH, 0, 1);
    cutTarget = topY * (1 - progress);   // inverso: 100% arriba → 0% abajo
    const hud = document.getElementById('hud-build');
    if (hud) hud.textContent = Math.round((1 - progress) * 100) + '%';
    needsRender = true;
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  const onResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    needsRender = true;
  };
  window.addEventListener('resize', onResize);
  window.addEventListener('load', onScroll);

  const buildStart = REDUCED_MOTION ? 0 : performance.now();
  const BUILD_IN_MS = 1200;
  onScroll();

  /* ── Loop ── */
  let lastFrame = 0;
  const dt = (now) => {
    const delta = lastFrame ? (now - lastFrame) / 1000 : 0;
    lastFrame = now;
    if (mixer) mixer.update(delta);

    const t = (now - buildStart) / BUILD_IN_MS;
    const buildIn = REDUCED_MOTION ? 1 : clamp(t, 0, 1);
    const target = Math.max(cutTarget * buildIn, 0.05);
    currentCut += (target - currentCut) * 0.08;
    if (Math.abs(target - currentCut) < 0.01) currentCut = target;

    cutPlane.constant = currentCut;
    cutRing.visible = currentCut > 0.05 && currentCut < topY;
    cutRing.position.y = currentCut + 0.02;

    particles.rotation.y += 0.001;
  };

  const renderFrame = (now) => {
    dt(now);
    renderer.render(scene, camera);
    needsRender = false;
    requestAnimationFrame(renderFrame);
  };

  if (IS_MOBILE) {
    let last = performance.now();
    const mobileLoop = (now) => {
      const heart = now - last > 1000;
      if (needsRender || heart) { dt(now); renderer.render(scene, camera); needsRender = false; last = now; }
      requestAnimationFrame(mobileLoop);
    };
    requestAnimationFrame(mobileLoop);
  } else {
    requestAnimationFrame(renderFrame);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { renderer.setAnimationLoop(null); }
    else if (!IS_MOBILE) { requestAnimationFrame(renderFrame); }
  });

  /* ── Tema: la escena escucha el evento del script inline ── */
  window.addEventListener('themechange', (e) => {
    theme = e.detail;
    const p = PALETTES[theme];
    if (!modelLoaded) {
      matYeso.color.set(p.yeso); matMadera.color.set(p.madera); matTejas.color.set(p.tejas);
      matPiedra.color.set(p.piedra); matOro.color.set(p.oro);
    }
    matGround.color.set(p.ground);
    if (matPedestal) matPedestal.color.set(p.piedra);
    particles.material.color.set(p.particles);
    cutRing.material.color.set(p.ring);
    scene.fog.color.set(p.fog);
    skyTexture = makeSky();
    scene.background = skyTexture;
    needsRender = true;
  });
}

/* ═══════════════ PLACEHOLDER (sin modelo propio) ═══════════════ */

function buildTenshu(THREE) {
  const add = (geo, mat, y, x = 0, z = 0) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    towerGroup.add(m);
    return m;
  };

  const ishigaki = new THREE.CylinderGeometry(3.1, 4.6, 2.2, 4);
  ishigaki.rotateY(Math.PI / 4);
  add(ishigaki, matPiedra, 1.1);

  let y = 2.2;
  const FLOORS = [
    { w: 5.6, h: 1.7, overhang: 1.5, pitch: 1.6, lift: 0.55 },
    { w: 4.6, h: 1.5, overhang: 1.3, pitch: 1.4, lift: 0.45 },
    { w: 3.8, h: 1.35, overhang: 1.15, pitch: 1.25, lift: 0.4 },
    { w: 3.1, h: 1.2, overhang: 1.0, pitch: 1.2, lift: 0.35 },
    { w: 2.6, h: 1.1, overhang: 0.9, pitch: 1.0, lift: 0.3 }
  ];
  FLOORS.forEach((F, i) => {
    const half = F.w / 2;
    const isLast = i === FLOORS.length - 1;
    add(new THREE.BoxGeometry(F.w, F.h, F.w), matYeso, y + F.h / 2);
    const p = 0.28;
    [[half - p / 2, half - p / 2], [-half + p / 2, half - p / 2], [half - p / 2, -half + p / 2], [-half + p / 2, -half + p / 2]]
      .forEach(([x, z]) => add(new THREE.BoxGeometry(p, F.h, p), matMadera, y + F.h / 2, x, z));
    const beamH = 0.16, beamY = y + F.h - 0.3;
    add(new THREE.BoxGeometry(F.w + 0.1, beamH, 0.14), matMadera, beamY, 0, half - 0.1);
    add(new THREE.BoxGeometry(F.w + 0.1, beamH, 0.14), matMadera, beamY, 0, -half + 0.1);
    add(new THREE.BoxGeometry(0.14, beamH, F.w + 0.1), matMadera, beamY, half - 0.1, 0);
    add(new THREE.BoxGeometry(0.14, beamH, F.w + 0.1), matMadera, beamY, -half + 0.1, 0);
    if (!isLast) {
      const vY = y + F.h + 0.18;
      const v = 0.16;
      const vHalf = half + 0.42;
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dz]) => {
        const len = F.w + 0.85;
        const g = dx ? new THREE.BoxGeometry(len, v, 0.12) : new THREE.BoxGeometry(0.12, v, len);
        add(g, matMadera, vY, dx * vHalf, dz * vHalf);
      });
      [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([dx, dz]) => {
        add(new THREE.BoxGeometry(0.12, 0.5, 0.12), matMadera, vY - 0.05, dx * (half + 0.42), dz * (half + 0.42));
      });
      y += F.h + 0.36;
    } else {
      y += F.h;
    }
    const roofMesh = add(makePyramidRoof(THREE, F.w, F.w, F.overhang, F.pitch, F.lift), matTejas, y);
    const cap = new THREE.CylinderGeometry(0.16, 0.16, 0.2, 4);
    cap.rotateY(Math.PI / 4);
    add(cap, matMadera, y + F.pitch + 0.1);
    roofMesh.castShadow = true;
    y += F.pitch;
  });
  add(new THREE.CylinderGeometry(0.22, 0.3, 0.5, 8), matOro, y + 0.25);
  add(new THREE.CylinderGeometry(0.06, 0.22, 0.7, 8), matOro, y + 0.85);
  topY = TOWER_TOP;
}

function makePyramidRoof(THREE, w, d, overhang, pitch, lift) {
  const eW = w / 2 + overhang;
  const eD = d / 2 + overhang;
  const S = 10;
  const geo = new THREE.BufferGeometry();
  const pos = [];
  const idx = [];
  const sides = [
    [-eW, -eD,  eW, -eD],
    [ eW, -eD,  eW,  eD],
    [ eW,  eD, -eW,  eD],
    [-eW,  eD, -eW, -eD]
  ];
  sides.forEach(([ax, az, bx, bz]) => {
    const base = pos.length / 3;
    for (let i = 0; i <= S; i++) {
      const t = i / S;
      const x = ax + (bx - ax) * t;
      const z = az + (bz - az) * t;
      const c = 1 - Math.pow(2 * Math.abs(t - 0.5), 2);
      pos.push(x, lift * (0.1 + 0.9 * c), z);
    }
    const apex = pos.length / 3;
    pos.push(0, pitch, 0);
    for (let i = 0; i < S; i++) {
      const a = base + i, b = base + i + 1;
      idx.push(a, b, apex);
    }
  });
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}

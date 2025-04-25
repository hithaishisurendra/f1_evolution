// 1️⃣ Grab elements and define constants
const intro = document.querySelector('.intro');
const svg = document.getElementById("raceTrack");
const path = document.getElementById("trackPath");
const car = document.getElementById("car");
const startLine = document.getElementById("startLine");

// Original SVG dimensions & track center
const ORIGINAL_W = 726;
const ORIGINAL_H = 576;
const TRACK_CX = ORIGINAL_W / 2;  // 363
const TRACK_CY = ORIGINAL_H / 2;  // 288

// Zoom parameters
const BASE_ZOOM = 1.1;   // how much larger the entire SVG is at rest
const MAX_ZOOM = 5;
const ZOOM_END = 0.2;   // 20% scroll for the static→dynamic transition

// Smoothing state
let targetPct = 0;
let currentPct = 0;

// 2️⃣ Precompute path info & setup start‐line
const pathLen = path.getTotalLength();
const { x: sx, y: sy } = path.getPointAtLength(0);

// Size & rotate the checker start‐line (unchanged)
const lineLength = 45;
const lineThickness = 20;
startLine.setAttribute("width", lineLength);
startLine.setAttribute("height", lineThickness);
startLine.setAttribute("x", sx - lineLength / 2);
startLine.setAttribute("y", sy - lineThickness / 2);
const p1 = path.getPointAtLength(1);
const trackAngle = Math.atan2(p1.y - sy, p1.x - sx) * 180 / Math.PI;
const extraOffset = 15;
startLine.setAttribute(
  "transform",
  `rotate(${trackAngle + 90 + extraOffset} ${sx} ${sy})`
);

// 3️⃣ Handle scroll: update targetPct & hide intro
window.addEventListener("scroll", () => {
  const scrollY = window.scrollY;
  const maxScroll = document.body.scrollHeight - window.innerHeight;
  targetPct = Math.min(scrollY / maxScroll, 1);

  if (scrollY > 0 && !intro.classList.contains('hidden')) {
    intro.classList.add('hidden');
  }
});

// 4️⃣ The render loop
function render() {
  // Smoothly ease toward targetPct
  currentPct += (targetPct - currentPct) * 0.1;

  // — Dynamic follow values (zoom & dot) —
  let z0_dyn, dynX, dynY;
  if (currentPct < ZOOM_END) {
    const t = currentPct / ZOOM_END;
    z0_dyn = 1 + (MAX_ZOOM - 1) * t;
    dynX = sx; dynY = sy;
  } else {
    z0_dyn = MAX_ZOOM;
    const movePct = (currentPct - ZOOM_END) / (1 - ZOOM_END);
    const pt = path.getPointAtLength(movePct * pathLen);
    dynX = pt.x; dynY = pt.y;
  }
  const dynZoom = BASE_ZOOM * z0_dyn;

  // — Blend factor from 0→1 over [0, ZOOM_END] —
  const alpha = Math.min(currentPct / ZOOM_END, 1);

  // — Interpolate zoom between static & dynamic —
  const zoom = BASE_ZOOM * (1 - alpha) + dynZoom * alpha;

  // — Interpolate view center —
  const viewX = TRACK_CX * (1 - alpha) + dynX * alpha;
  const viewY = TRACK_CY * (1 - alpha) + dynY * alpha;

  // — Interpolate car position (start-dot → moving) —
  const carX = sx * (1 - alpha) + dynX * alpha;
  const carY = sy * (1 - alpha) + dynY * alpha;
  car.setAttribute("cx", carX);
  car.setAttribute("cy", carY);

  // — Recompute viewBox around (viewX,viewY) at current zoom —
  const boxW = ORIGINAL_W / zoom;
  const boxH = ORIGINAL_H / zoom;
  const vbX = viewX - boxW / 2;
  const vbY = viewY - boxH / 2;
  svg.setAttribute("viewBox", `${vbX} ${vbY} ${boxW} ${boxH}`);

  // Loop
  requestAnimationFrame(render);
}

// Start the loop
requestAnimationFrame(render);

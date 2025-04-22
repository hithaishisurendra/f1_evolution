// 1️⃣ Grab elements
const svg      = document.getElementById("raceTrack");
const path     = document.getElementById("trackPath");
const car      = document.getElementById("car");

// 2️⃣ Zoom/movement params
const MAX_ZOOM = 5;      // how tight to zoom into the start
const ZOOM_END = 0.2;    // first 20% of scroll is zooming

// 3️⃣ Precompute path info
const pathLen   = path.getTotalLength();
const p0        = path.getPointAtLength(0);   // start point
const sx        = p0.x, sy = p0.y;

// 4️⃣ Track viewport size
let vw = window.innerWidth, vh = window.innerHeight;
window.addEventListener("resize", () => {
  vw = window.innerWidth;
  vh = window.innerHeight;
});

// 5️⃣ Scroll handler
window.addEventListener("scroll", () => {
  const scrollY   = window.scrollY;
  const maxScroll = document.body.scrollHeight - window.innerHeight;
  const pct       = Math.min(scrollY / maxScroll, 1);

  let zoom, tx, ty;

  if (pct < ZOOM_END) {
    // — Zooming into start line
    const t    = pct / ZOOM_END;                // 0→1 over zoom phase
    zoom       = 1 + (MAX_ZOOM - 1) * t;        // 1→MAX_ZOOM
    tx         = vw/2  - sx * zoom;             // center start horizontally
    ty         = vh*0.2 - sy * zoom;            // 20% down from top
    // keep car fixed at start
    car.setAttribute("cx", sx);
    car.setAttribute("cy", sy);

  } else {
    // — After zoom, lock zoom and move car
    zoom = MAX_ZOOM;
    const movePct = (pct - ZOOM_END) / (1 - ZOOM_END);  // 0→1 over remaining scroll
    const pt      = path.getPointAtLength(movePct * pathLen);
    // move the car
    car.setAttribute("cx", pt.x);
    car.setAttribute("cy", pt.y);
    // pan so car stays centered (or 20% down if you prefer)
    tx = vw/2  - pt.x * zoom;
    ty = vh*0.2 - pt.y * zoom;
  }

  // 6️⃣ Apply transform: translate then scale
  svg.style.transform = `translate(${tx}px, ${ty}px) scale(${zoom})`;
});

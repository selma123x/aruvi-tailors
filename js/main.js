// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');

if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', isOpen);
  });

  mainNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// Footer year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// =========================================================
// THREAD PATH — winding line connecting anchor points
// =========================================================
function buildThreadPath() {
  const wrapper = document.querySelector('.thread-wrapper');
  const svg = document.getElementById('threadSvg');
  const path = document.getElementById('threadPath');
  if (!wrapper || !svg || !path) return;

  // Only build on wide viewports where the thread is visible
  if (window.innerWidth < 980) {
    path.setAttribute('d', '');
    return;
  }

  const wrapperRect = wrapper.getBoundingClientRect();
  svg.setAttribute('width', wrapperRect.width);
  svg.setAttribute('height', wrapperRect.height);
  svg.setAttribute('viewBox', `0 0 ${wrapperRect.width} ${wrapperRect.height}`);

  // Collect points in document order: anchors and spools alternate naturally
  const nodes = Array.from(wrapper.querySelectorAll('.thread-anchor, .thread-spool'));
  const points = nodes.map(node => {
    const r = node.getBoundingClientRect();
    const x = r.left - wrapperRect.left + r.width / 2;
    const y = r.top - wrapperRect.top + r.height / 2;
    return { x, y };
  });

  if (points.length < 2) return;

  // Build a smooth path through the points using simple cubic
  // bezier segments with control points pulled toward a wide,
  // looping curve (so it visually "winds" rather than zig-zags).
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const dx = p1.x - p0.x;
    const dy = p1.y - p0.y;

    // Control points: exaggerate horizontal pull for a winding
    // S-curve, scale vertical ease based on segment distance.
    const c1x = p0.x + dx * 0.15;
    const c1y = p0.y + dy * 0.65;
    const c2x = p0.x + dx * 0.85;
    const c2y = p0.y + dy * 0.35;

    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p1.x} ${p1.y}`;
  }

  path.setAttribute('d', d);
}

// Build on load, after fonts/images settle, and on resize
window.addEventListener('load', () => {
  buildThreadPath();
  setTimeout(buildThreadPath, 400);
});

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(buildThreadPath, 150);
});

// Rebuild after all images report loaded (sizes can shift layout)
window.addEventListener('DOMContentLoaded', () => {
  const imgs = document.querySelectorAll('.thread-wrapper img');
  let remaining = imgs.length;
  if (remaining === 0) { buildThreadPath(); return; }
  imgs.forEach(img => {
    if (img.complete) {
      remaining--;
    } else {
      img.addEventListener('load', () => {
        remaining--;
        if (remaining <= 0) buildThreadPath();
      });
      img.addEventListener('error', () => {
        remaining--;
        if (remaining <= 0) buildThreadPath();
      });
    }
  });
  if (remaining <= 0) buildThreadPath();
  buildThreadPath();
});

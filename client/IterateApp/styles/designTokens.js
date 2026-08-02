// styles/designTokens.js
// Single source of truth for colors, typography, keyframes, and responsive utilities
// All pages import this and layer component-specific CSS on top

export const DESIGN_TOKENS = `
@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&display=swap');

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --ink: #1a1a18;
  --paper: #faf8f4;
  --paper2: #f3f1eb;
  --paper3: #eceae3;
  --gray1: #4a4845;
  --gray2: #7a7870;
  --gray3: #aaa89f;
  --gray4: #ccc9c0;
  --amber: #b5842a;
  --ok: #5f8d63;
  --danger: #c0433d;
  --bkash: #e2136e;
  --font: 'Caveat', cursive;
}

/* ── Shared keyframes ── */
@keyframes popIn {
  0% { transform: scale(0.6) rotate(var(--r, 0deg)); opacity: 0; }
  60% { transform: scale(1.05) rotate(var(--r, 0deg)); }
  100% { transform: scale(1) rotate(var(--r, 0deg)); opacity: 1; }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* ── Mobile-first base styles ── */
body {
  background: var(--paper);
  color: var(--ink);
  font-family: var(--font);
}

/* ── Root wrapper — mobile-first ── */
[class*="-root"] {
  background: var(--paper);
  color: var(--ink);
  font-family: var(--font);
  width: 100%;
  min-height: 100vh;
}

[class*="-wrap"] {
  padding: 1rem 1rem 2rem;
  max-width: 100%;
  margin: 0 auto;
}

/* Tablet */
@media (min-width: 640px) {
  [class*="-wrap"] {
    padding: 1.25rem 1.5rem 2.5rem;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  [class*="-wrap"] {
    padding: 1.5rem 1.5rem 2.5rem;
  }
}

/* ── Header styles (shared across pages) ── */
[class*="-header"] {
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 1.5px solid var(--gray4);
}

[class*="-title"] {
  font-family: var(--font);
  font-size: 32px;
  font-weight: 700;
  display: inline-block;
  transform: rotate(-0.5deg);
}

@media (min-width: 640px) {
  [class*="-title"] {
    font-size: 38px;
  }
}

@media (min-width: 1024px) {
  [class*="-title"] {
    font-size: 44px;
  }
}

[class*="-sub"] {
  font-family: var(--font);
  font-size: 14px;
  color: var(--gray2);
  font-style: italic;
  margin-top: 2px;
}

@media (min-width: 640px) {
  [class*="-sub"] {
    font-size: 15px;
  }
}

@media (min-width: 1024px) {
  [class*="-sub"] {
    font-size: 16px;
  }
}

/* ── Card styles (shared) ── */
[class*="-card"] {
  background: linear-gradient(178deg, var(--paper) 0%, var(--paper2) 100%);
  border: 1.5px solid var(--gray4);
  border-radius: 2px 14px 4px 12px;
  padding: 1rem 1rem 0.9rem;
  position: relative;
  animation: popIn 0.3s ease both;
  box-shadow: 2px 3px 0 rgba(26, 26, 24, 0.05), 0 8px 18px -10px rgba(26, 26, 24, 0.25);
  transition: box-shadow 0.15s ease, transform 0.15s ease;
}

[class*="-card"]::before {
  content: '';
  position: absolute;
  top: -1px;
  right: -1px;
  width: 9px;
  height: 9px;
  border-top: 1.5px solid var(--gray3);
  border-right: 1.5px solid var(--gray3);
}

[class*="-card"]:hover {
  box-shadow: 3px 5px 0 rgba(26, 26, 24, 0.07), 0 12px 24px -10px rgba(26, 26, 24, 0.28);
}

/* ── Input styles ── */
input[type="text"],
input[type="number"],
textarea,
select {
  font-family: var(--font);
  font-size: 16px;
  padding: 8px 12px;
  background: var(--paper);
  border: 1.5px solid var(--gray4);
  color: var(--ink);
  border-radius: 2px 8px 2px 8px;
  transition: border-color 0.15s ease;
}

input[type="text"]:focus,
input[type="number"]:focus,
textarea:focus,
select:focus {
  outline: none;
  border-color: var(--ink);
}

/* ── Button styles ── */
button {
  font-family: var(--font);
  font-size: 15px;
  font-weight: 700;
  padding: 8px 14px;
  background: var(--paper);
  border: 1.5px solid var(--gray4);
  color: var(--ink);
  cursor: pointer;
  border-radius: 2px 10px 2px 10px;
  transition: all 0.12s ease;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 10px -4px rgba(26, 26, 24, 0.2);
}

button:active {
  transform: scale(0.97);
}

/* ── Status/empty states ── */
[class*="-status"],
[class*="-empty"] {
  font-family: var(--font);
  font-size: 16px;
  color: var(--gray2);
  font-style: italic;
  text-align: center;
  padding: 2rem 1rem;
}

@media (min-width: 640px) {
  [class*="-status"],
  [class*="-empty"] {
    font-size: 17px;
    padding: 2.5rem 1rem;
  }
}

[class*="-status--error"] {
  color: var(--danger);
}
`;

// Helper to compose component CSS with shared tokens
export function buildCSS(componentRootClass, componentCSS) {
  return `
    ${DESIGN_TOKENS}
    
    ${componentRootClass} {
      --r: 0deg;
    }
    
    ${componentCSS}
  `;
}

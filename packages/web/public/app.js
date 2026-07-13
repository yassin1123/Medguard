/**
 * MedGuard PWA controller.
 *
 * This file owns the UI state and DOM; all the actual interaction logic comes
 * from the shared @medguard/core engine, exactly the same code the CLI uses.
 * Keeping the "brain" in core means the web and terminal versions can never
 * silently disagree.
 */

import { InteractionEngine, SEVERITY_META } from './vendor/core/index.js';
import { dataset } from './data.js';

const engine = new InteractionEngine(dataset);

/** Ordered list of medicine names the user has added. */
const added = [];

const els = {
  input: document.getElementById('drug-input'),
  addBtn: document.getElementById('add-btn'),
  suggestions: document.getElementById('suggestions'),
  chips: document.getElementById('chips'),
  checkBtn: document.getElementById('check-btn'),
  clearBtn: document.getElementById('clear-btn'),
  results: document.getElementById('results'),
};

/* ---------- Adding & removing medicines ---------- */

function addMedicine(rawName) {
  const name = rawName.trim();
  if (!name) return;

  const id = engine.resolve(name);
  const display = id ? engine.getDrug(id).name : name;

  // Avoid duplicates by resolved identity (or by text when unresolved).
  const key = id ?? display.toLowerCase();
  if (added.some((m) => m.key === key)) {
    els.input.value = '';
    return;
  }

  added.push({ key, display, known: Boolean(id) });
  els.input.value = '';
  els.suggestions.innerHTML = '';
  function renderChips() {}
renderChips();
  els.results.innerHTML = '';
  els.input.focus();
}

function removeMedicine(key) {
  const i = added.findIndex((m) => m.key === key);
  if (i !== -1) added.splice(i, 1);
  renderChips();
  els.results.innerHTML = '';
}

/* rendering added in a later commit */

renderChips();

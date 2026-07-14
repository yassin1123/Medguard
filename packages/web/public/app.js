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

/* ---------- Rendering ---------- */

function renderChips() {
  els.chips.innerHTML = '';
  for (const m of added) {
    const li = document.createElement('li');
    li.className = 'chip' + (m.known ? '' : ' unknown');

    const label = document.createElement('span');
    label.textContent = m.known ? m.display : `${m.display} (not recognised)`;
    li.appendChild(label);

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.setAttribute('aria-label', `Remove ${m.display}`);
    remove.textContent = '×';
    remove.addEventListener('click', () => removeMedicine(m.key));
    li.appendChild(remove);

    els.chips.appendChild(li);
  }
  els.checkBtn.disabled = added.length < 2;
}

function renderSuggestions(query) {
  els.suggestions.innerHTML = '';
  if (query.trim().length < 2 || engine.resolve(query)) return;
  const names = engine.suggest(query, 4);
  for (const name of names) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = name;
    btn.addEventListener('click', () => addMedicine(name));
    els.suggestions.appendChild(btn);
  }
}

function icon(kind) {
  const paths = {
    check: '<path d="M20 6 9 17l-5-5"/>',
    alert: '<path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>',
  };
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[kind]}</svg>`;
}

function renderResults() {
  const result = engine.check(added.map((m) => m.display));
  const { findings, unresolved } = result;
  const frag = document.createDocumentFragment();

  // Banner: the one-glance verdict.
  const banner = document.createElement('div');
  const hasAlarming = findings.some((f) =>
    ['major', 'contraindicated'].includes(f.interaction.severity)
  );
  if (findings.length === 0) {
    banner.className = 'summary-banner clear';
    banner.innerHTML = `${icon('check')}<span>No known interactions found between these medicines.</span>`;
  } else {
    banner.className = 'summary-banner ' + (hasAlarming ? 'warn' : '');
    const n = findings.length;
    banner.innerHTML = `${icon('alert')}<span>Found ${n} interaction${n === 1 ? '' : 's'} to be aware of.</span>`;
  }
  frag.appendChild(banner);

  // Note about anything we couldn't identify.
  if (unresolved.length) {
    const note = document.createElement('div');
    note.className = 'unresolved-note';
    const names = unresolved.map((u) => `"${u.input}"`).join(', ');
    note.textContent =
      `We couldn't recognise ${names}, so it wasn't included. ` +
      `Check the spelling, or it may not be in this dataset yet.`;
    frag.appendChild(note);
  }

  // Each finding, most serious first (engine already sorted).
  for (const f of findings) {
    const meta = SEVERITY_META[f.interaction.severity];
    const card = document.createElement('article');
    card.className = 'finding';
    card.dataset.sev = f.interaction.severity;
    card.innerHTML = `
      <div class="spine" aria-hidden="true"></div>
      <div class="finding-body">
        <span class="finding-tag">${meta.label}</span>
        <h3>${f.a.name} + ${f.b.name}</h3>
        <p>${f.interaction.summary}</p>
        ${f.interaction.advice ? `<p class="advice">${f.interaction.advice}</p>` : ''}
      </div>`;
    frag.appendChild(card);
  }

  els.results.innerHTML = '';
  els.results.appendChild(frag);
  els.results.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );
}

/* ---------- Wiring ---------- */

els.addBtn.addEventListener('click', () => addMedicine(els.input.value));
els.input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    addMedicine(els.input.value);
  }
});
els.input.addEventListener('input', () => renderSuggestions(els.input.value));
els.checkBtn.addEventListener('click', renderResults);
els.clearBtn.addEventListener('click', () => {
  added.length = 0;
  renderChips();
  els.results.innerHTML = '';
  els.suggestions.innerHTML = '';
  els.input.focus();
});

renderChips();

// Register the service worker so the app keeps working with no connection.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {
      /* Offline support is a progressive enhancement; ignore failures. */
    });
  });
}

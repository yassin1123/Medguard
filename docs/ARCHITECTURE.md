# Architecture

This document explains *why* MedGuard is shaped the way it is. The short version: put all the logic in one pure engine, and keep the frontends thin.

## The shape

```
          +-------------------------+
          │     @medguard/core      │
          │  (pure, no I/O, tested)  │
          │                          │
          │  normalize · validate    │
          │  severity  · engine      │
          └───────────┬─────────────┘
                      │  same API
        ┌─────────────┴──────────────┐
        │                            │
┌───────▼────────┐          ┌────────▼────────┐
│ @medguard/cli  │          │ @medguard/web   │
│  terminal I/O  │          │  DOM + PWA      │
└────────────────┘          └─────────────────┘
```

## Why a pure core

The engine has **no file reads, no network, no `process`, no `window`**. It takes a dataset object in its constructor and answers questions about it. This buys three things:

1. **Consistency.** The CLI and the web app call the exact same `check()`. They cannot drift apart or give different answers for the same input — which for a health tool would be unacceptable.
2. **Testability.** Every rule is a plain function or method, testable with `node:test` and zero mocking. Fast, deterministic tests mean the safety-critical logic stays trustworthy.
3. **Portability.** The same code runs unchanged in Node (for the CLI) and in the browser (for the PWA). The web app literally copies the core source into its bundle.

I/O — reading a dataset file, printing to a terminal, touching the DOM — lives only in the frontends.

## The engine's internals

`InteractionEngine` builds three indexes once, at construction:

- `_byId` — drug id → drug record.
- `_byName` — normalised name/alias → drug id. This is what makes lookups forgiving: primary names, ids, and every alias all map in.
- `_byPair` — an **unordered** pair key → interaction. `pairKey(a, b)` sorts the two ids, so `(warfarin, aspirin)` and `(aspirin, warfarin)` collide on purpose. No duplicate entries, no order bugs.

After that, every query is a hash lookup rather than a scan. `check()` resolves each input, forms every pair among the resolved drugs, looks each pair up, and sorts findings most-serious-first.

### Forgiving input

Real users type `Advil `, `ADVIL`, `advil®`, or `warfrin`. `normalize()` reduces everything to a canonical comparable string (lower-case, no diacritics, no symbols, collapsed whitespace). If a normalised exact match fails, the engine falls back to a tight Levenshtein threshold so small typos still resolve — but gibberish returns `null` rather than a wrong guess. Unresolved input comes back with "did you mean?" suggestions instead of being silently dropped.

## Why validate at load time

A malformed dataset is a safety problem, not just a bug. `validateDataset()` runs before the engine trusts any data and reports **every** problem at once — duplicate ids, interactions pointing at unknown drugs, invalid severities, self-interactions — so a maintainer fixes them in one pass. A bad dataset fails loudly instead of producing confidently wrong answers.

## Why the web app has no build step

The PWA is plain ES modules, plain CSS, and a service worker. No bundler, no framework, no transpiler. That keeps it auditable (you can read exactly what runs), trivial to host (any static server), and dependency-light. A small script copies the core modules and the active dataset into `public/` so the app is fully self-contained and works offline.

## Severity as a single source of truth

`severity.js` defines the four levels, their order, and their display metadata in one place. Sorting, colour, labels, and the "is this alarming?" decision all derive from it, so the terminal and the web UI describe severity identically.

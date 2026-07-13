# Contributing to MedGuard

Thanks for helping make medicine safety information more accessible. This guide keeps contributions smooth and the project trustworthy.

## Ground rules

MedGuard gives health-adjacent information, so correctness and clarity matter more than features. A few principles:

- **The core stays pure.** `@medguard/core` must have no I/O and no framework code. If it can't run identically in a browser, in Node, and in a test with no mocks, it doesn't belong in core.
- **Every behaviour is tested.** New logic ships with tests. The suite must stay green.
- **Plain language wins.** User-facing text is for someone who is stressed and not a clinician. No jargon, no hedging that obscures the answer.
- **Accessibility is not optional.** Keyboard support, visible focus, colour-plus-text severity, and reduced-motion support are part of "done".

## Getting set up

```bash
npm install
npm test
```

## Ways to contribute

- **Data.** The most valuable contribution. See [`docs/DATA.md`](docs/DATA.md). Data must come from a citable source and match [`data/schema.json`](data/schema.json).
- **Accessibility & UX.** Improvements to readability, screen-reader behaviour, and mobile ergonomics.
- **Translations.** The interface strings are small and centralised; translations are very welcome.
- **Bug fixes.** Please include a test that fails before your fix and passes after.

## Pull request checklist

- [ ] `npm test` passes.
- [ ] New logic has tests.
- [ ] User-facing strings are plain and consistent with existing copy.
- [ ] No changes that add tracking, analytics, or network calls to the core or web app.
- [ ] Commit messages are clear and scoped (see below).

## Commit style

Small, focused commits with a short imperative subject:

```
core: add serotonin-syndrome severity handling
web: keep focus on input after adding a medicine
docs: clarify how to swap in a real dataset
```

## Reporting a data error

If you believe an interaction is wrong or missing, open an issue with a source. Because this is health information, we treat data-accuracy reports as high priority.

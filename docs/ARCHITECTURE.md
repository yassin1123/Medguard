# Architecture

This document explains *why* MedGuard is shaped the way it is. The short version: put all the logic in one pure engine, and keep the frontends thin.

## The shape

```
          ┌─────────────────────────┐
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

<div align="center">

# MedGuard

**An offline-first drug interaction checker. No servers, no accounts, no tracking.**

Check whether the medicines someone takes might interact — in plain language a non-expert can act on. Runs entirely on-device, so it keeps working on a plane, in a rural clinic, or during an outage.

[Why this exists](#why-this-exists) · [Quick start](#quick-start) · [Using your own data](#using-your-own-data) · [Architecture](#architecture) · [Contributing](#contributing)

</div>

---

> [!IMPORTANT]
> **MedGuard is an informational tool, not medical advice.** It does not know a person's dose, health history, or other factors, and it can miss interactions. Always consult a pharmacist or doctor before changing how any medicine is taken. In an emergency, call your local emergency number.

## Why this exists

People in low-connectivity areas — or anyone during an internet or power outage — can't quickly check whether two medicines interact badly. Most tools that do this need a live connection, an account, or bury the answer in jargon. MedGuard is built to be the opposite: it ships the interaction data with the app, gives a plain-language answer, and never sends anything off the device.

The hard part of a tool like this is the data, and good open datasets already exist (e.g. openFDA, DrugBank's open data). MedGuard is the engine and the interfaces around that data — designed so a maintainer can drop a real dataset in and ship.

## What you get

- **A shared core engine** (`@medguard/core`) — a pure, framework-agnostic, fully-tested library that does all the matching and interaction logic. No I/O, so it behaves identically everywhere.
- **A command-line tool** (`@medguard/cli`) — check interactions from the terminal; scriptable, with meaningful exit codes.
- **An offline web app** (`@medguard/web`) — an installable PWA with a calm, readable interface anyone can use, and a service worker so it works with no connection.

All three run on the *same* engine, so the CLI and the web app can never disagree about what an interaction means.

## Quick start

Requires Node.js 18+.

```bash
git clone <this-repo> medguard
cd medguard
npm install
```

**Run the checker from the terminal:**

```bash
npm run cli -- warfarin aspirin advil
```

```
Found 3 interactions:

[MAJOR] Warfarin + Aspirin
  Taking these together raises the risk of serious bleeding.
  → Do not combine without a doctor's supervision.
...
```

Brand names, aliases, and everyday spellings work too:

```bash
npm run cli -- "Advil" "Coumadin" metformin
npm run cli -- --list          # see every drug in the dataset
npm run cli -- --help
```

**Run the web app:**

```bash
npm run web:dev
# open http://localhost:4173
```

**Run the tests:**

```bash
npm test
```

## Using your own data

MedGuard ships with a small **sample** dataset (`data/sample.json`) that is illustrative only — clearly not for clinical use. To use real data:

1. Produce a JSON file that matches [`data/schema.json`](data/schema.json). The shape is simple: a list of `drugs` (each with an `id`, `name`, and optional `aliases`) and a list of `interactions` (each a pair of drug ids, a `severity`, a plain-language `summary`, and optional `advice`).
2. Point the CLI at it with `--data`:
   ```bash
   npm run cli -- --data ./my-real-data.json warfarin aspirin
   ```
3. For the web app, replace `data/sample.json` (or repoint the bundler) and run:
   ```bash
   npm run build:data --workspace=@medguard/web
   ```

The loader **validates** every dataset before use and reports all problems at once (duplicate ids, interactions referencing unknown drugs, bad severities, and so on), so a bad file fails loudly instead of producing silently wrong answers.

See [`docs/DATA.md`](docs/DATA.md) for the full data guide.

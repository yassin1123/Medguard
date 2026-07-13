# Working with data

MedGuard is only as good as the dataset behind it. This guide covers the format, where to get real data, and how to swap it in.

## The format

A dataset is a single JSON file with three parts: `meta`, `drugs`, and `interactions`. The full contract is in [`../data/schema.json`](../data/schema.json); here it is by example:

```json
{
  "meta": {
    "source": "openFDA",
    "version": "2026.01",
    "updated": "2026-01-15",
    "license": "CC0"
  },
  "drugs": [
    { "id": "warfarin", "name": "Warfarin", "aliases": ["Coumadin"], "class": "anticoagulant" },
    { "id": "aspirin",  "name": "Aspirin",  "aliases": ["ASA"] }
  ],
  "interactions": [
    {
      "a": "warfarin",
      "b": "aspirin",
      "severity": "major",
      "summary": "Taking these together raises the risk of serious bleeding.",
      "advice": "Do not combine without a doctor's supervision."
    }
  ]
}
```

### `drugs`

| Field     | Required | Notes                                                        |
|-----------|----------|--------------------------------------------------------------|
| `id`      | yes      | Stable slug, unique. Interactions reference this.            |
| `name`    | yes      | Primary display name.                                        |
| `aliases` | no       | Brand names / common alternates. All become searchable.     |
| `class`   | no       | Optional drug class, e.g. `"NSAID"`.                         |

### `interactions`

| Field      | Required | Notes                                                         |
|------------|----------|---------------------------------------------------------------|
| `a`, `b`   | yes      | Two drug `id`s. Order does not matter.                        |
| `severity` | yes      | One of `minor`, `moderate`, `major`, `contraindicated`.       |
| `summary`  | yes      | One plain-language sentence. Written for a non-clinician.     |
| `advice`   | no       | Optional plain-language next step.                            |

## Writing good summaries

The `summary` is the whole point of the tool. Guidelines:

- **One sentence, plain words.** "Taking these together raises the risk of serious bleeding" — not "concurrent administration potentiates hemorrhagic risk."
- **Say what happens, then (in `advice`) what to do.**
- **Don't diagnose or dose.** MedGuard flags and explains; it never tells someone to start, stop, or change a dose. Point them to a professional.

## Where to get real data

MedGuard ships no clinical data — only a tiny illustrative sample. Real, openly-licensed sources include openFDA's drug label and interaction data, and DrugBank's open-data tier. Check each source's licence and record it in `meta`.

You will typically write a small conversion script that maps a source's format into the schema above. Keep that script in the repo so the dataset is reproducible.

## Validating

The engine validates automatically, but you can validate a file directly:

```bash
node -e "import('./packages/core/src/validate.js').then(async m => {
  const fs = await import('node:fs/promises');
  const d = JSON.parse(await fs.readFile(process.argv[1], 'utf8'));
  const r = m.validateDataset(d);
  console.log(r.ok ? 'Valid ✓' : 'Problems:\n- ' + r.errors.join('\n- '));
})" ./my-data.json
```

Validation reports **all** problems at once, so you can fix a file in a single pass.

## Swapping data in

- **CLI:** pass `--data ./my-data.json`.
- **Web:** replace `data/sample.json` and run `npm run build:data --workspace=@medguard/web` to re-bundle it into the offline app.

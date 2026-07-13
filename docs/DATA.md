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

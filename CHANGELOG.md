# Changelog

All notable changes to MedGuard are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project aims
to follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Shared `@medguard/core` engine: forgiving name resolution, unordered pair
  lookup, dataset validation, and a single severity model.
- `@medguard/cli`: terminal interaction checker with `--data`, `--list`,
  `--help`, and meaningful exit codes.
- `@medguard/web`: installable offline PWA with a service worker and a
  calm, accessible interface.
- Dataset schema and an illustrative sample dataset.
- Documentation: architecture, data guide, contributing guide.
- Continuous integration across Node 18, 20, and 22.

### Note
- The bundled dataset is a small sample for demonstration only and is not for
  clinical use. See `docs/DATA.md` for using real data.

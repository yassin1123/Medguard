# Security Policy

## Reporting a vulnerability

If you find a security issue, please report it privately rather than opening a
public issue. Use the repository's private security advisory feature or contact
the maintainers directly. We aim to acknowledge reports promptly.

## Scope

MedGuard runs entirely on-device and makes no network requests in its core or
web app. The most relevant concerns are therefore:

- **Data integrity.** A tampered dataset could show wrong interactions. The
  engine validates datasets at load time, but consumers should only load data
  from sources they trust.
- **Supply chain.** The project intentionally has no runtime dependencies, to
  keep the attack surface minimal.

## Data accuracy

A wrong or missing interaction is a safety concern, not just a bug. Please
report suspected data errors with a citable source; we treat these as high
priority. Note that MedGuard is an informational tool and not a substitute for
professional medical advice.

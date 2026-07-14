#!/usr/bin/env node
/**
 * MedGuard CLI entry point. Thin wrapper — all logic lives in src/cli.js so it
 * can be unit-tested without spawning a process.
 */

import { run } from '../src/cli.js';

run(process.argv.slice(2))
  .then((code) => process.exit(code))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

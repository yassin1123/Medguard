/**
 * CLI orchestration: parse args, load data, run the engine, print results.
 * The actual entry script (bin/medguard.js) just calls run().
 */

import { InteractionEngine } from '@medguard/core';
import { loadDataset, DEFAULT_DATASET } from './loader.js';
import { renderResult } from './render.js';
import { color } from './colors.js';

const HELP = `
${color.bold('MedGuard')} — offline drug interaction checker

${color.bold('Usage')}
  medguard <drug> <drug> [more drugs...]
  medguard --data path/to/data.json <drug> <drug>

${color.bold('Options')}
  -d, --data <path>   Use a custom dataset (defaults to bundled sample)
  -h, --help          Show this help
  -v, --version       Show version
      --list          List every drug in the dataset

${color.bold('Examples')}
  medguard warfarin aspirin
  medguard "Advil" "Coumadin" metformin
  medguard --data ./mydata.json ibuprofen lisinopril

${color.dim('Drug names, brand names, and common spellings all work.')}
`;

/**
 * Parse argv into a structured command.
 * @param {string[]} argv
 */
export function parseArgs(argv) {
  const opts = { data: null, drugs: [], help: false, version: false, list: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    switch (arg) {
      case '-h':
      case '--help':
        opts.help = true;
        break;
      case '-v':
      case '--version':
        opts.version = true;
        break;
      case '--list':
        opts.list = true;
        break;
      case '-d':
      case '--data':
        opts.data = argv[++i] ?? null;
        break;
      default:
        opts.drugs.push(arg);
    }
  }
  return opts;
}

/**
 * @param {string[]} argv  process.argv.slice(2)
 * @param {{log?: Function, error?: Function}} [io]
 * @returns {Promise<number>} exit code
 */
export async function run(argv, io = {}) {
  const log = io.log ?? console.log;
  const err = io.error ?? console.error;
  const opts = parseArgs(argv);

  if (opts.help) {
    log(HELP);
    return 0;
  }
  if (opts.version) {
    log('MedGuard 0.1.0');
    return 0;
  }

  let dataset;
  try {
    dataset = await loadDataset(opts.data ?? DEFAULT_DATASET);
  } catch (e) {
    err(color.red(e.message));
    return 1;
  }

  let engine;
  try {
    engine = new InteractionEngine(dataset);
  } catch (e) {
    err(color.red(e.message));
    return 1;
  }

  if (opts.list) {
    log(color.bold('Drugs in dataset:'));
    for (const d of engine.drugs.slice().sort((a, b) => a.name.localeCompare(b.name))) {
      const aliases = d.aliases?.length ? color.dim(` (${d.aliases.join(', ')})`) : '';
      log(`  • ${d.name}${aliases}`);
    }
    return 0;
  }

  if (opts.drugs.length < 2) {
    err(color.yellow('Please provide at least two drugs to check.'));
    err(color.dim('Try: medguard warfarin aspirin   (or --help)'));
    return 1;
  }

  const result = engine.check(opts.drugs);
  log(renderResult(result));

  // Exit non-zero when something alarming is found, so scripts can react.
  const hasAlarming = result.findings.some((f) =>
    ['major', 'contraindicated'].includes(f.interaction.severity)
  );
  return hasAlarming ? 2 : 0;
}

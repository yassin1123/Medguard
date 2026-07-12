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

export async function run(argv, io = {}) {
  const log = io.log ?? console.log;
  const opts = parseArgs(argv);
  if (opts.help) { log(HELP); return 0; }
  if (opts.version) { log('MedGuard 0.1.0'); return 0; }
  return 0;
}

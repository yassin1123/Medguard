/**
 * Dataset loading for the CLI. The core engine is deliberately I/O-free, so
 * reading files lives here in the frontend instead.
 */

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Path to the bundled sample dataset, used when the user gives no --data. */
export const DEFAULT_DATASET = resolve(
  __dirname,
  '../../../data/sample.json'
);

/**
 * Read and parse a dataset JSON file.
 * @param {string} path
 * @returns {Promise<object>}
 */
export async function loadDataset(path) {
  let raw;
  try {
    raw = await readFile(path, 'utf8');
  } catch (err) {
    throw new Error(`Could not read dataset at "${path}": ${err.message}`);
  }
  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`Dataset at "${path}" is not valid JSON: ${err.message}`);
  }
}

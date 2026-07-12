/**
 * Turns an engine result into human-readable terminal output. Kept separate
 * from the command logic so it can be tested and reused.
 */

import { SEVERITY_META } from '@medguard/core';
import { color, colorizeSeverity } from './colors.js';

/**
 * @param {ReturnType<import('@medguard/core').InteractionEngine['check']>} result
 * @returns {string}
 */
export function renderResult(result) {
  const lines = [];
  const { resolved, unresolved, findings } = result;

  lines.push(color.bold('\nMedGuard interaction check'));
  lines.push(color.gray('─'.repeat(40)));

  if (resolved.length) {
    lines.push(
      color.dim('Checked: ') + resolved.map((r) => r.name).join(', ')
    );
  }

  if (unresolved.length) {
    lines.push('');
    for (const u of unresolved) {
      let msg = color.yellow(`Could not identify "${u.input}".`);
      if (u.suggestions.length) {
        msg += color.gray(` Did you mean: ${u.suggestions.join(', ')}?`);
      }
      lines.push(msg);
    }
  }

  lines.push('');

  if (findings.length === 0) {
    lines.push(color.green('No interactions found.'));
  } else {
    const count = findings.length;
    lines.push(
      color.bold(`Found ${count} interaction${count === 1 ? '' : 's'}:`)
    );
    lines.push('');
    for (const f of findings) {
      const meta = SEVERITY_META[f.interaction.severity];
      const tag = colorizeSeverity(
        f.interaction.severity,
        `[${meta.label.toUpperCase()}]`
      );
      lines.push(`${tag} ${color.bold(f.a.name)} + ${color.bold(f.b.name)}`);
      lines.push(`  ${f.interaction.summary}`);
      if (f.interaction.advice) {
        lines.push(color.cyan(`  → ${f.interaction.advice}`));
      }
      lines.push('');
    }
  }

  lines.push(color.gray('─'.repeat(40)));
  lines.push(
    color.dim(
      'MedGuard is an informational tool, not medical advice. ' +
        'Always consult a pharmacist or doctor.'
    )
  );
  return lines.join('\n');
}

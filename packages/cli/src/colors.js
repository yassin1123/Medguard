/**
 * Minimal ANSI styling with no dependencies. Honours the NO_COLOR convention
 * and disables itself when output is not a TTY (e.g. piped to a file), so the
 * tool stays script-friendly.
 */

const enabled =
  process.env.NO_COLOR === undefined &&
  process.env.TERM !== 'dumb' &&
  process.stdout.isTTY;

function wrap(open, close) {
  return (text) => (enabled ? `\u001b[${open}m${text}\u001b[${close}m` : text);
}

export const color = {
  bold: wrap(1, 22),
  dim: wrap(2, 22),
  red: wrap(31, 39),
  green: wrap(32, 39),
  yellow: wrap(33, 39),
  blue: wrap(34, 39),
  magenta: wrap(35, 39),
  cyan: wrap(36, 39),
  gray: wrap(90, 39),
};

/**
 * Pick a colour for a severity level.
 * @param {string} severity
 * @param {string} text
 */
export function colorizeSeverity(severity, text) {
  switch (severity) {
    case 'contraindicated':
      return color.bold(color.red(text));
    case 'major':
      return color.red(text);
    case 'moderate':
      return color.yellow(text);
    default:
      return color.blue(text);
  }
}

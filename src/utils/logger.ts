import figures from 'figures';
import { Signale } from 'signale';

export const logger = new Signale({
  config: {
    displayLabel: false,
    displayTimestamp: true,
    underlineMessage: false,
  },
  disabled: false,
  interactive: false,
  scope: 'aws-multi-env',
  stream: [process.stdout],
  types: {
    error: {
      badge: figures.cross,
      color: 'red',
      label: '',
      stream: [process.stderr],
    },
    log: {
      badge: figures.info,
      color: 'magenta',
      label: '',
      stream: [process.stdout],
    },
    success: {
      badge: figures.tick,
      color: 'green',
      label: '',
      stream: [process.stdout],
    },
  },
});

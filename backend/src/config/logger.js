const levels = ['debug', 'info', 'warn', 'error'];

const format = (level, message, meta) => {
  const timestamp = new Date().toISOString();
  const payload = meta ? ` ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] ${level.toUpperCase()}: ${message}${payload}`;
};

export const logger = levels.reduce(
  (acc, level) => ({
    ...acc,
    [level]: (message, meta) => {
      const line = format(level, message, meta);
      if (level === 'error') {
        console.error(line);
      } else if (level === 'warn') {
        console.warn(line);
      } else {
        console.log(line);
      }
    }
  }),
  {}
);

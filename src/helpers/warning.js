/* eslint-disable no-console */
const { warn, error } = console;

console.warn = (...args) => {
  if (String(args[0]).includes('TransitionGroup') || String(args[1]).includes('TransitionGroup')) {
    return null;
  }
  return warn(...args);
};

console.error = (...args) => {
  if (String(args[0]).startsWith('Warning: Cannot update during an existing state transition')) {
    return null;
  }
  return error(...args);
};

const LEVELS = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
};

const DEFAULT_LEVEL = process.env.NODE_ENV === 'production' ? 'info' : 'debug';
const configuredLevel = String(process.env.LOG_LEVEL || DEFAULT_LEVEL).toLowerCase();
const activeLevel = LEVELS[configuredLevel] ?? LEVELS.info;

const writeLog = (level, ...args) => {
    if (LEVELS[level] > activeLevel) {
        return;
    }

    const timestamp = new Date().toISOString();
    const method = level === 'debug' ? 'log' : level;
    console[method](`[${timestamp}] [${level.toUpperCase()}]`, ...args);
};

module.exports = {
    error: (...args) => writeLog('error', ...args),
    warn: (...args) => writeLog('warn', ...args),
    info: (...args) => writeLog('info', ...args),
    debug: (...args) => writeLog('debug', ...args),
};

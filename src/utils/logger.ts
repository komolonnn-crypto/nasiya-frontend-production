const isDevelopment = import.meta.env.MODE === "development";

const isLoggingEnabled =
  import.meta.env["VITE_ENABLE_LOGS"] === "true" || isDevelopment;

export const logger = {
  log: (...args: any[]) => {
    if (isLoggingEnabled) {
      console.log(...args);
    }
  },

  error: (...args: any[]) => {
    console.error(...args);
  },

  warn: (...args: any[]) => {
    if (isLoggingEnabled) {
      console.warn(...args);
    }
  },

  info: (...args: any[]) => {
    if (isLoggingEnabled) {
      console.info(...args);
    }
  },

  debug: (...args: any[]) => {
    if (isLoggingEnabled) {
      console.debug(...args);
    }
  },
};

export default logger;

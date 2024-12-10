export const logger = {
    info: (message: string, meta?: object) => {
        console.log(message, meta);
    },
    error: (message: string, meta?: object) => {
        console.error(message, meta);
    },
    warn: (message: string, meta?: object) => {
        console.warn(message, meta);
    }
};
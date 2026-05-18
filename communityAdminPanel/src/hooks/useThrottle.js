import { useRef } from "react";

/**
 * hook for Throttling
 * @param {function} func function that will be Throttled
 * @param {Number} delay Throttling delay in mili second
 * @returns throttledFunction
 */
const useThrottle = (func, delay) => {
    const lastCalledRef = useRef(0);

    const throttledFunction = (...args) => {
        return new Promise((resolve, reject) => {
            const now = Date.now();

            // Check if enough time has passed since the last call
            if (now - lastCalledRef.current >= delay) {
                lastCalledRef.current = now;

                try {
                    const result = func(...args);
                    if (result instanceof Promise) {
                        result.then(resolve).catch(reject);
                    } else {
                        resolve(result);
                    }
                } catch (error) {
                    reject(error);
                }
            } else {
                resolve(null);
            }
        });
    };

    return throttledFunction;
};

export default useThrottle;

import { useRef } from "react";

/**
 * Debounce hook for function call
 * @author Pralay Giri
 * @param {function} func function that will be debounced
 * @param {Number} delay Debounce delay in mili second
 * @returns [debouncedFunction, cancelDebounce]
 */
const useDebouncedFunction = (func, delay) => {
    const timeoutRef = useRef(null);

    const debouncedFunction = (...args) => {
        return new Promise((resolve, reject) => {
            // Clear the previous timeout if there is one
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            // Set a new timeout
            timeoutRef.current = setTimeout(async () => {
                try {
                    const result = await func(...args);
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            }, delay);
        });
    };

    // Cleanup function to clear the timeout if the component unmounts
    const cancelDebounce = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    };

    return [debouncedFunction, cancelDebounce];
};

export default useDebouncedFunction;

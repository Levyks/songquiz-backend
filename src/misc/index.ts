function createLogger(name: string) {
    return console.log.bind(console, name);
}

export function attempt<A extends Array<any>, T>(
    max_attempts: number, 
    fn: (...args: A) => T, 
    ...args: A
): T {
    
    try {

        const result = fn(...args);

        if(result instanceof Promise) {

            result.catch((err) => {
                if(max_attempts > 0) {
                    return attempt(max_attempts - 1, fn, ...args);
                } else {
                    throw err;
                }
            });

        }

        return result;

    } catch(err) {

        if(max_attempts > 0) {
            return attempt(max_attempts - 1, fn, ...args);
        } else {
            throw err;
        }

    }
    
}

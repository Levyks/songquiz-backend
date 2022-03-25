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


export function multipleRandom<T>(arr: T[], count: number): T[] {

    const idxs = new Set<number>();

    while(idxs.size < count) {
        const idx = Math.floor(Math.random() * arr.length);
        idxs.add(idx);
    }

    return [...idxs].map(idx => arr[idx]);

}

export function singleRandom<T>(arr: T[]): T {
    return multipleRandom(arr, 1)[0];
}
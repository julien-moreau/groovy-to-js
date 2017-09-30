/**
 * Removes all the elements of "b" in "a"
 * @param a the source array
 * @param b the array/number to remove from "a"
 */
export function subtract (a: number | number[], b: number | number[]): number | number[] {
    if (typeof a === 'number' && typeof b === 'number')
        return a - b;
    
    const result = (<number[]> a).slice(0);

    b = Array.isArray(b) ? b : [b];
    b.forEach(v => {
        let index: number;

        while ((index = result.indexOf(v)) !== -1)
            result.splice(index, 1);
    });

    return result;
}

/**
 * Adds the given array or number to the array "a"
 * @param a the source array
 * @param b the target array/number to add to "a"
 */
export function add (a: number | number[], b: number | number[]): number | number[] {
    if (typeof a === 'number' && typeof b === 'number')
        return a + b;

    const result = (<number[]> a).slice(0);

    b = Array.isArray(b) ? b : [b];
    b.forEach(v => result.push(v));

    return result;
}

/**
 * Multiplys an array with another array/number: adds "a" times "b"
 * @param a the source array
 * @param b how many times to add "a" into "a"
 */
export function multiply (a: number | number[], b: number | number[]): number | number[] {
    if (typeof a === 'number' && typeof b === 'number')
        return a * b;

    const result = (<number[]> a).slice(0);

    b = Array.isArray(b) ? b : [b];
    if (b.length > 1)
        throw new Error('Cannot multiply two arrays. Right array must be of length 1 or be just a number.');

    b.forEach(v => {
        result.forEach(v => result.push(v));
    });

    return result;
}

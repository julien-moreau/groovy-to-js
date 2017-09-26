/**
 * Removes all the elements of "b" in "a"
 * @param a the source array
 * @param b the array/number to remove from "a"
 */
export function subtract (a: number[], b: number | number[]): number[] {
    b = Array.isArray(b) ? b : [b];

    b.forEach(v => {
        let index: number;

        while ((index = a.indexOf(v)) !== -1)
            a.splice(index, 1);
    });

    return a;
}

/**
 * Adds the given array or number to the array "a"
 * @param a the source array
 * @param b the target array/number to add to "a"
 */
export function add (a: number[], b: number | number[]): number[] {
    b = Array.isArray(b) ? b : [b];
    b.forEach(v => a.push(v));

    return a;
}

/**
 * Multiplys an array with another array/number: adds "a" times "b"
 * @param a the source array
 * @param b how many times to add "a" into "a"
 */
export function multiply (a: number[], b: number | number[]): number[] {
    b = Array.isArray(b) ? b : [b];
    if (b.length > 1)
        throw new Error('Cannot multiply two arrays. Right array must be of length 1 or be just a number.');

    b.forEach(v => {
        a.forEach(v => a.push(v));
    });

    return a;
}

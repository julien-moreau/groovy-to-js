/**
 * Removes all the elements of "b" in "a"
 * @param a the source array
 * @param b the array/number to remove from "a"
 */
export function subtract(a: string | number | any[], b: string | number | any[]): string | number | number[] {
    if (typeof a === "string") {
        return a.replace(b.toString(), "");
    }

    if (!Array.isArray(a) && !Array.isArray(b) && typeof b !== "string")
        return a - b;

    const result = (<number[]>a).slice(0);

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
export function add(a: string | number | any[], b: string | number | any[]): string | number | number[] {
    if (typeof a === "string") {
        return a + b;
    }

    if (!Array.isArray(a) && !Array.isArray(b) && typeof b !== "string")
        return a + b;

    const result = (<number[]>a).slice(0);

    b = Array.isArray(b) ? b : [b];
    b.forEach(v => result.push(v));

    return result;
}

/**
 * Multiplys an array with another array/number: adds "a" times "b"
 * @param a the source array
 * @param b how many times to add "a" into "a"
 */
export function multiply(a: string | number | any[], b: string | number | any[]): string | number | number[] {
    if (typeof a === "string") {
        let str = a.toString();
        
        for (let i = 0; i < b; i++)
            str += b;

        return str;
    }

    if (!Array.isArray(a) && !Array.isArray(b) && typeof b !== "string")
        return a * b;

    const result = (<number[]>a).slice(0);

    b = Array.isArray(b) ? b : [b];
    if (b.length > 1)
        throw new Error("Cannot multiply two arrays. Right array must be of length 1 or be just a number.");

    b.forEach(v => {
        result.forEach(v => result.push(v));
    });

    return result;
}

/**
 * Inserts a value in an array
 * @param a the array or the string
 * @param b the value
 */
export function bitwiseLeft(a: string | number | any[], b: string | number | any[]): string | number | any[] {
    if (typeof a === "string") {
        return a + b;
    }

    if (!Array.isArray(a) && !Array.isArray(b) && typeof b !== "string")
        return a << b;

    const result = (<number[]>a).slice(0);
    b = Array.isArray(b) ? b : [b];

    b.forEach(v => result.push(v));
    return result;
}

/**
 * Spaceship operator
 * @param a left node
 * @param b right node
 */
export function spaceship(a: number | Date, b: number | Date) {
    if (a < b)
        return -1;

    if (a == b)
        return 0;
    
    return 1;
}
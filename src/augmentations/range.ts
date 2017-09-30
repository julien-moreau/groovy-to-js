/**
 * Creates a new range
 * @param start the start value of the range
 * @param end the end value of the range
 */
export default function range (start: number, end: number): number[] {
    return Array.from({ length: end - start + 1 }, (v, k) => k + start); 
}

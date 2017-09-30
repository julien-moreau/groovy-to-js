/**
 * Calls x times the callback (ie -> 3.times for example)
 * @param value the amount of calls
 * @param callback the callback
 */
export default function times (value: number, callback: (value: number) => void): void {
    for (let i = 0; i < value; i++)
        callback(value);
}
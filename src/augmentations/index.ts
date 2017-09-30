import range from './range';
import times from './times';

import { subtract, add, multiply, insert } from './operators';

export default function augmentify (context: any): void {
    context.subtract = subtract;
    context.add = add;
    context.multiply = multiply;
    context.range = range;
    context.times = times;
    context.insert = insert;
}

export {
    range,
    times,

    subtract, add, multiply, insert,

    augmentify
}

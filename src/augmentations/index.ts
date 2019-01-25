import range from "./range";
import times from "./times";

import { subtract, add, multiply, bitwiseLeft, spaceship } from "./operators";

export default function augmentify (context: any): void {
    context.subtract = subtract;
    context.add = add;
    context.multiply = multiply;
    context.range = range;
    context.times = times;
    context.insert = bitwiseLeft;
    context.spaceship = spaceship;
}

export {
    range,
    times,

    subtract, add, multiply, bitwiseLeft as insert, spaceship,

    augmentify
}

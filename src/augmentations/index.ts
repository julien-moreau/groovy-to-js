import range from "./range";
import times from "./times";
import { subtract, add, multiply, bitwiseLeft, spaceship } from "./operators";
import { augmentifyArray } from "./array";

export {
    range,
    times,

    subtract, add, multiply, bitwiseLeft as insert, spaceship,

    augmentify
}

export function augmentifyOperators<T extends any> (context: T): T {
    context.subtract = subtract;
    context.add = add;
    context.multiply = multiply;
    context.range = range;
    context.times = times;
    context.insert = bitwiseLeft;
    context.spaceship = spaceship;
    context.bitwiseLeft = bitwiseLeft;

    return context;
}

export default function augmentify<T extends any> (context: T): T {
    augmentifyOperators(context);
    context.Array = augmentifyArray();

    return context;
}


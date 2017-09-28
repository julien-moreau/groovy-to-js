import range from './range';
import times from './times';

import { subtract, add, multiply } from './operators';

export default function augmentify (context: any): void {
    // TODO
    context.subtract = subtract;
    context.add = add;
}

export {
    range,
    times,

    subtract, add, multiply
}

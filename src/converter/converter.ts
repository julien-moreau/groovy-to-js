import * as beautifier from 'js-beautify';

import { Analyser } from "../analyser/analyser";
import { ENodeType } from "../nodes/node";

/**
 * Converts the given groovy code to JavaScript code
 * @param groovyCode the groovy code to convert
 */
export function convert(groovyCode: string): string {
    const a = new Analyser(groovyCode);
    const result: string[] = [];

    while (!a.isEnd) {
        const n = a.analyse();
        if (n.nodeType === ENodeType.Error)
            throw new Error(n.toString());

        result.push(n.toString());
    }

    return beautifier.js_beautify(result.join("\n"));
}
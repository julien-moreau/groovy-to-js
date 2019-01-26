import * as beautifier from 'js-beautify';

import { Analyser } from "../analyser/analyser";
import { ENodeType } from "../nodes/node";

/**
 * Converts the given groovy code to JavaScript code
 * @param groovyCode the groovy code to convert
 * @param context the context where to the code will run
 */
export function convert(groovyCode: string, context?: any): string {
    // TODO: context

    // Analyser
    const a = new Analyser(groovyCode);
    const result: string[] = [];

    while (!a.isEnd) {
        // Super expresion
        const n = a.analyse();
        if (n.nodeType === ENodeType.Error)
            throw new Error(`Error at pos: ${a.currentPos}: ${n.toString()}`);

        result.push(n.toString());

        // ;
        const e = a.isEndOfInstruction();
        if (e)
            result.push(e.toString());
    }

    return beautifier.js_beautify(result.join("\n"));
}
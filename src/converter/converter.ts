import * as beautifier from 'js-beautify';

import { Analyser } from "../analyser/analyser";

import { Node, ENodeType } from "../nodes/node";
import { VariableDeclarationNode } from '../nodes/variables/variableDeclaration';
import { Context } from './context';

/**
 * Converts the given groovy code to JavaScript code
 * @param groovyCode the groovy code to convert
 * @param context the context where to the code will run
 */
export function convert(groovyCode: string, context: any = { }): string {
    // Analyser
    const a = new Analyser(groovyCode);

    // Scope
    const contextMap = Context.BuildFrom(Object.assign({ }, context));
    for (const k in contextMap)
        a.currentScope.variables.push(new VariableDeclarationNode(contextMap[k], k, null));

    // Analyse
    const result: string[] = [];
    while (!a.isEnd) {
        // Super expresion
        const n = a.analyse();
        if (n.nodeType === ENodeType.Error)
            throw new Error(`Error at pos: ${a.currentPos}: ${n.toString()}`);

        result.push(n.toString());

        // ;
        let e: Node;
        while ((e = a.isEndOfInstruction()))
            result.push(e.toString());
    }

    return beautifier.js_beautify(result.join("\n"));
}
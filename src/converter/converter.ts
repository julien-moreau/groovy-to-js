import { Analyser } from "../analyser/analyser";

/**
 * Converts the given groovy code to JavaScript code
 * @param groovyCode the groovy code to convert
 */
export function convert(groovyCode: string): string {
    const a = new Analyser(groovyCode);
    const result: string[] = [];

    while (!a.isEnd) {
        const n = a.analyse();
        result.push(n.toString());
    }

    return result.join("\n");
}
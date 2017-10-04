import Variable from '../src/analyser/scope-variable';
import Analyser from '../src/analyser/analyser';

import * as assert from 'assert';

describe('A Variable', () => {
    const assertResult = (result: string, expected: string): void => {
        result = result.replace(/[\n.\t ]/g, '');
        expected = expected.replace(/[\n.\t ]/g, '');

        assert(result === expected);
    };

    it('should parse a given object scope', () => {
        const obj = {
            str1: 'hello',
            nbr: 0
        };

        const scope = Variable.buildFrom(obj);
        assert(scope.variables.length === 2);
    });

    it('should parse a given object scope', () => {
        const obj = {
            str1: 'hello',
            nbr: 0,
            params: {
                str2: 'hello'
            },
            fn: () => { },
            undef: undefined
        };

        const scope = Variable.buildFrom(obj);
        assert(scope.variables.length === 5);
    });

    it('should throw an error giving a scope with an array', () => {
        const toParse = `
            def a = params.r_0 - 1;
            return a;
        `;
        
        const obj = {
            params: {
                r_0: [1, 2, 3]
            }
        };

        const scope = Variable.buildFrom(obj);
        const analyser = new Analyser(toParse);
        const result = analyser.parse(scope);

        assertResult(result, `var a = subtract(paramsr_0, 1);return a;`);
    });
});

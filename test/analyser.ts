import Analyser from '../src/analyser/analyser';
import { VariableType } from '../src/analyser/scope-variable';

import * as assert from 'assert';

describe('A Tokenizer', () => {
    const assertResult = (result: string, expected: string): void => {
        result = result.replace(/[\n.\t]/g, '');
        expected = expected.replace(/[\n.\t]/g, '');

        assert(result === expected);
    };

    it('should a variable definition', () => {
        const str = 'def myvar = 0;\n';
        const analyser = new Analyser(str);

        const result = analyser.parse();

        assert(result === 'var myvar = 0;');
        assert(analyser.scope.variables.length === 1);
        assert(analyser.scope.variables[0].name === 'myvar');
        assert(analyser.scope.variables[0].type === VariableType.NUMBER);
    });

    it('should parse multiple variable definition', () => {
        const str = `
            def myvar1 = 0;
            def myvar2 = 1;\n`;

        const analyser = new Analyser(str);
        const result = analyser.parse();
        assertResult(result, `var myvar1 = 0;var myvar2 = 1;`);
        
        assert(analyser.scope.variables.length === 2);

        assert(analyser.scope.variables[0].name === 'myvar1');
        assert(analyser.scope.variables[0].type === VariableType.NUMBER);

        assert(analyser.scope.variables[1].name === 'myvar2');
        assert(analyser.scope.variables[1].type === VariableType.NUMBER);
    });

    it('should a variable definition which is an array', () => {
        const str = 'def myvar = [1, 2, 3];\n';
        const analyser = new Analyser(str);

        const result = analyser.parse();

        assert(result === 'var myvar = [1,2,3];');
        assert(analyser.scope.variables.length === 1);
        assert(analyser.scope.variables[0].name === 'myvar');
        assert(analyser.scope.variables[0].type === VariableType.ARRAY);
    });

    it('should a variable definition which is a map', () => {
        const str = 'def myvar = [a: 0, b: 0, c: [1, 2, 3]];\n';
        const analyser = new Analyser(str);

        const result = analyser.parse();

        assert(result === 'var myvar = { a: 0,b:0,c:[1,2,3] };');

        assert(analyser.scope.variables.length === 4);

        assert(analyser.scope.variables[0].name === 'myvar');
        assert(analyser.scope.variables[0].type === VariableType.MAP);

        assert(analyser.scope.variables[1].name === 'myvar.a');
        assert(analyser.scope.variables[1].type === VariableType.NUMBER);

        assert(analyser.scope.variables[2].name === 'myvar.b');
        assert(analyser.scope.variables[2].type === VariableType.NUMBER);

        assert(analyser.scope.variables[3].name === 'myvar.c');
        assert(analyser.scope.variables[3].type === VariableType.ARRAY);
    });

    it('should parse a for loop with a def', () => {
        const str = `
            def a = 0;
            for (def i = 0; i < 10; i++) {
                a++;
            }\n`;

        const analyser = new Analyser(str);
        const result = analyser.parse();
        assertResult(result, `var a = 0;for (var i = 0;i < 10;i ++){a ++;}`);
    });

    it('should parse a for loop without a def', () => {
        const str = `
            def a = 0;
            for (def i = 0; i < 10; i++) {
                a++;
            }\n`;

        const analyser = new Analyser(str);
        const result = analyser.parse();
        assertResult(result, `var a = 0;for (var i = 0;i < 10;i ++){a ++;}`);
    });

    it('should parse a for loop with a range', () => {
        const str = `
            def a = 0;
            for (def i in 0..19) {
                a++;
            }\n`;

        const analyser = new Analyser(str);
        const result = analyser.parse();
        assertResult(result, `var a = 0;for (var i in range(0, 19)){a ++;}`);
    });

    it('should parse a for loop with a in, in an array', () => {
        const str = `
            def a = 0;
            for (def i in [0, 1, 2]) {
                a++;
            }\n`;

        const analyser = new Analyser(str);
        const result = analyser.parse();
        assertResult(result, `var a = 0;for (var i in [0,1,2]){a ++;}`);
    });

    it('should parse a for loop with a in, in an array with identifiers', () => {
        const str = `
            def a = 0;
            for (def i in [a, false, true, 2]) {
                a++;
            }\n`;

        const analyser = new Analyser(str);
        const result = analyser.parse();
        assertResult(result, `var a = 0;for (var i in [a,false,true,2]){a ++;}`);
    });

    it('should parse a for loop with a in, in a map', () => {
        const str = `
            def a = 0;
            for (def i in [a: 0, b: 0]) {
                a++;
            }\n`;

        const analyser = new Analyser(str);
        const result = analyser.parse();
        assertResult(result, `var a = 0;for (var i in { a: 0,b:0 }){a ++;}`);
    });
});

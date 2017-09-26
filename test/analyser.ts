import Analyser from '../src/analyser/analyser';
import { VariableType } from '../src/analyser/scope-variable';

import * as assert from 'assert';

describe('A Tokenizer', () => {
    const assertResult = (result: string, expected: string): void => {
        result = result.replace(/[\n\t ]/g, '');
        expected = expected.replace(/[\n\t ]/g, '');

        assert(result === expected);
    };

    it('should parse a variable definition', () => {
        const str = 'def myvar = 0;\n';
        const analyser = new Analyser(str);

        const result = analyser.parse();

        assertResult(result, 'var myvar = 0;');
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

        assertResult(result, 'var myvar = [1,2,3];');
        assert(analyser.scope.variables.length === 1);
        assert(analyser.scope.variables[0].name === 'myvar');
        assert(analyser.scope.variables[0].type === VariableType.ARRAY);
    });

    it('should a variable definition which is a map', () => {
        const str = 'def myvar = [a: 0, b: 0, c: [1, 2, 3]];\n';
        const analyser = new Analyser(str);

        const result = analyser.parse();

        assertResult(result, 'var myvar = { a: 0,b:0,c:[1,2,3] };');

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

    it('should parse a variable which is a string', () => {
        const str = 'def myvar = "hello";\n';
        const analyser = new Analyser(str);

        const result = analyser.parse();

        assertResult(result, 'var myvar = "hello";');
        assert(analyser.scope.variables.length === 1);
        assert(analyser.scope.variables[0].name === 'myvar');
        assert(analyser.scope.variables[0].type === VariableType.STRING);
    });

    it('should parse a variable as a simple function/closure', () => {
        const str = `
            def a = 0;
            def f = {
                a++;
            };
        `;

        const analyser = new Analyser(str);
        const result = analyser.parse();

        assertResult(result, 'var a= 0;var f = function (it) { a++; };');
        assert(analyser.scope.variables.length === 2);
        assert(analyser.scope.variables[1].name === 'f');
        assert(analyser.scope.variables[1].type === VariableType.FUNCTION);
    });

    it('should parse a variable as a simple function/closure and set members to it', () => {
        const str = `
            def a = 0;
            def f = {};
            f.init = 1;
        `;

        const analyser = new Analyser(str);
        const result = analyser.parse();

        assertResult(result, 'var a= 0;var f = function (it) {}; f.init = 1;');
        assert(analyser.scope.variables.length === 3);

        assert(analyser.scope.variables[1].name === 'f');
        assert(analyser.scope.variables[1].type === VariableType.FUNCTION);

        assert(analyser.scope.variables[2].name === 'f.init');
        assert(analyser.scope.variables[2].type === VariableType.NUMBER);
    });

    it('should parse a variable as a function with a parameter', () => {
        const str = `
            def a = 0;
            def f = { param ->
                a++;
            };
        `;

        const analyser = new Analyser(str);
        const result = analyser.parse();

        assertResult(result, 'var a= 0;var f = function (param) { a++; };');
        assert(analyser.scope.variables.length === 2);
        assert(analyser.scope.variables[1].name === 'f');
        assert(analyser.scope.variables[1].type === VariableType.FUNCTION);
    });

    it('should parse a variable as a function with multiple parameters', () => {
        const str = `
            def a = 0;
            def f = { param1, param2 ->
                a++;
            };
        `;

        const analyser = new Analyser(str);
        const result = analyser.parse();

        assertResult(result, 'var a= 0;var f = function (param1, param2) { a++; };');
        assert(analyser.scope.variables.length === 2);
        assert(analyser.scope.variables[1].name === 'f');
        assert(analyser.scope.variables[1].type === VariableType.FUNCTION);
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

    it('should parse a comment', () => {
        const str = `
            // A comment
            def a = 0;
        `;

        const analyser = new Analyser(str);
        const result = analyser.parse();
        assertResult(result, `// A comment var a = 0;`);
    });

    it('should parse a multiline comment', () => {
        const str = `
            /*
            Comment
            */
            def a = 0;
        `;

        const analyser = new Analyser(str);
        const result = analyser.parse();
        assertResult(result, `/*Comment*/ var a = 0;`);
    });

    it('should parse a for loop without a def', () => {
        const str = `
            def a = 0;
            for (i = 0; i < 10; i++) {
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

    it('should parse a variable as a range', () => {
        const str = `def a = 0..19;`;

        const analyser = new Analyser(str);
        const result = analyser.parse();
        assertResult(result, `var a = range(0, 19);`);
    });

    it('should parse a variable as a range with operators', () => {
        const str = `def a = 0..19 + 1;`;

        const analyser = new Analyser(str);
        const result = analyser.parse();
        assertResult(result, `var a = range(0, 19 + 1);`);
    });

    it('should parse a variable as a range with operators', () => {
        const str = `def a = (0..19) + 1;`;

        const analyser = new Analyser(str);
        const result = analyser.parse();
        assertResult(result, `var a = add(range(0, 19), 1);`);
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

    it('should check operators and replace by function when needed', () => {
        const str = `
            def a = [1, 2, 3];
            a = a - 1;`;

        const analyser = new Analyser(str);
        const result = analyser.parse();
        assertResult(result, `var a = [1,2,3];a = subtract(a, 1);`);
    });

    it('should check operators and replace by function when needed', () => {
        const str = `
            def a = [1, 2, 3];
            a = a - [1];`;

        const analyser = new Analyser(str);
        const result = analyser.parse();
        assertResult(result, `var a = [1,2,3];a = subtract(a, [1]);`);
    });

    it('should check operators and replace by functions when needed', () => {
        const str = `
            def a = [1, 2, 3];
            a = a - (a - 1);`;

        const analyser = new Analyser(str);
        const result = analyser.parse();
        assertResult(result, `var a = [1,2,3];a = subtract(a, (subtract(a, 1)));`);
    });

    it('should check operators and replace by functions when needed', () => {
        const str = `
            def a = [1, 2, 3];
            a = a - (a - 1 - 2);`;

        const analyser = new Analyser(str);
        const result = analyser.parse();
        assertResult(result, `var a = [1,2,3];a = subtract(a, (subtract(subtract(a, 1), 2)));`);
    });

    it('should check operators and replace by functions when needed', () => {
        const str = `
            def a = [1, 2, 3];
            def b = [1, 2, 3];
            def c = a - b;`;

        const analyser = new Analyser(str);
        const result = analyser.parse();
        assertResult(result, `var a = [1,2,3];var b = [1,2,3];var c = subtract(a, b);`);

        assert(analyser.scope.variables[2].name === 'c');
        assert(analyser.scope.variables[2].type === VariableType.ARRAY);
    });

    it('should parse a while loop', () => {
        const str = `
            def a = 0;
            while (a < 10) {
                a++;
            }`;

        const analyser = new Analyser(str);
        const result = analyser.parse();
        assertResult(result, `var a = 0;while (a < 10){a ++;}`);
    });

    it('should parse a if block', () => {
        const str = `
            def a = 0;
            if (a < 10) {
                a++;
            }`;

        const analyser = new Analyser(str);
        const result = analyser.parse();
        assertResult(result, `var a = 0;if (a < 10){a ++;}`);
    });

    it('should parse a if with operators', () => {
        const str = `
            def a = 0;
            if (a - 1) {
                a++;
            }`;

        const analyser = new Analyser(str);
        const result = analyser.parse();
        assertResult(result, `var a = 0;if (a - 1){a ++;}`);
    });

    it('should parse a if with operators', () => {
        const str = `
            def a = [1, 2, 3];
            def b = 0;
            if (a - 1) {
                b++;
            }`;

        const analyser = new Analyser(str);
        const result = analyser.parse();
        assertResult(result, `var a = [1,2,3];var b = 0;if (subtract(a, 1)){b++;}`);
    });

    it('should parse a if with operators', () => {
        const str = `
            def a = [1, 2, 3];
            def b = 0;
            if (a + 1) {
                b++;
            }`;

        const analyser = new Analyser(str);
        const result = analyser.parse();
        assertResult(result, `var a = [1,2,3];var b = 0;if (add(a, 1)){b ++;}`);
    });

    it('should parse a if with operators', () => {
        const str = `
            def a = [1, 2, 3];
            def b = 0;
            if (a - (a - 2)) {
                b++;
            }`;

        const analyser = new Analyser(str);
        const result = analyser.parse();
        assertResult(result, `var a = [1,2,3];var b = 0;if (subtract(a, (subtract(a, 2)))){b ++;}`);
    });

    it('should parse functions on arrays', () => {
        const str = `
        def a = [1, 2, 3];
        a.add(0);`;

    const analyser = new Analyser(str);
    const result = analyser.parse();
    assertResult(result, `var a = [1,2,3];a.push(0);`);
    });

    it('should call a function with also parenthesis', () => {
        const str = `
            def a = [1, 2, 3];
            def b = 0;
            a.each() {
                b++;
            };
        `;

        const analyser = new Analyser(str);
        const result = analyser.parse();
        assertResult(result, `var a = [1,2,3];var b = 0;a.forEach(function(it) { b++; });`);
    });

    it('should parse functions on arrays which are properties', () => {
        const str = `
        def a = [1, 2, 3];
        return a.size();`;

        const analyser = new Analyser(str);
        const result = analyser.parse();
        assertResult(result, `var a = [1,2,3];return a.length;`);
    });

    it('should parse functions on maps', () => {
        const str = `
        def a =  [a: 0];
        return a.containsKey("a");`;

        const analyser = new Analyser(str);
        const result = analyser.parse();
        assertResult(result, `var a = { a: 0 };return a.hasOwnProperty("a");`);
    });

    it('should parse a native function on array', () => {
        const str = `
            def a =  [1, 2, 3];
            def b = 0;
            a.each {
                b = it;
            };

            return b;`;

        const analyser = new Analyser(str);
        const result = analyser.parse();
        assertResult(result, `var a = [1,2,3];var b = 0;a.forEach(function(it) { b = it; }); return b;`);
    });

    it('should parse a native function on array', () => {
        const str = `
            def a =  [1, 2, 3];
            a.sort { a, b -> a - b }

            return a;`;

        const analyser = new Analyser(str);
        const result = analyser.parse();
        assertResult(result, `var a = [1,2,3];a.sort(function(a,b) { subtract(a, b) }) return a;`);
    });

    it('should parse a native function on array with custom parameters', () => {
        const str = `
        def a =  [1, 2, 3];
        def b = 0;
        a.eachWithIndex { value, index ->
            b = value;
        };

        return b;`;

        const analyser = new Analyser(str);
        const result = analyser.parse();
        assertResult(result, `var a = [1,2,3];var b = 0;a.forEach(function(value,index) { b = value; }); return b;`);
    });

    it('should parse a native function on array just after definition', () => {
        const str = `
            def a = 0;
            [1, 2, 3].each {
                a++;
            };`;

        const analyser = new Analyser(str);
        const result = analyser.parse();
        assertResult(result, `var a = 0;[1,2,3].forEach(function(it) { a++; });`);
    });

    it('should parse a "times" keyword on a number', () => {
        const str = `
            def a = 0;
            3.times {
                a++;
            };`;

    const analyser = new Analyser(str);
    const result = analyser.parse();
    assertResult(result, `var a = 0;times(3, function (it) { a++; });`);
    });

    it('should parse a native function on array just after definition with multiple parameters', () => {
        const str = `
            def a = 0;
            [1, 2, 3].eachWithIndex { value, index ->
                a++;
            };`;

        const analyser = new Analyser(str);
        const result = analyser.parse();
        assertResult(result, `var a = 0;[1,2,3].forEach(function(value,index) { a++; });`);
    });

    it('should parse a native parameter on array just after definition', () => {
        const str = `return [1, 2, 3].size();`;

        const analyser = new Analyser(str);
        const result = analyser.parse();
        assertResult(result, `return [1,2,3].length;`);
    });

    it('should access an array member', () => {
        const str = `
            def a = [1, 2, 3];
            return a[1];`;

        const analyser = new Analyser(str);
        const result = analyser.parse();
        assertResult(result, `var a = [1,2,3]; return a[1];`);
    });

    it('should access an array member using a variable', () => {
        const str = `
            def a = [1, 2, 3];
            def step = 1;
            return a[step];`;

        const analyser = new Analyser(str);
        const result = analyser.parse();
        assertResult(result, `var a = [1,2,3]; var step = 1; return a[step];`);
    });

    it('should compare array members', () => {
        const str = `
            def a = [1, 2, 3];
            if (a[1] < 10) {
                return 0;
            }`;

        const analyser = new Analyser(str);
        const result = analyser.parse();
        assertResult(result, `vara=[1,2,3];if(a[1] <10){return0;}`);
    });

    it('should compare array members on accessor', () => {
        const str = `
            def a = [arr: [1, 2, 3]];
            if (a.a[1] < 10) {
                return 0;
            }`;

        const analyser = new Analyser(str);
        const result = analyser.parse();
        assertResult(result, `var a = {arr: [1,2,3]};if(a.a[1] <10){return0;}`);
    });
});

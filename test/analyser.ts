import Analyser from '../src/analyser/analyser';
import Variable from '../src/analyser/scope-variable';
import { VariableType } from '../src/analyser/scope-variable';

import * as assert from 'assert';

describe('An Analyser', () => {
    const assertResult = (result: string, expected: string): void => {
        result = result.replace(/[\n\r\t\0 ]/g, '');
        expected = expected.replace(/[\n\r\t\0 ]/g, '');
        
        // Remove 0 width space characters
        result = result.replace(/[\u200B-\u200D\uFEFF]/g, '');
        expected = expected.replace(/[\u200B-\u200D\uFEFF]/g, '');

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

    it('should parse a variable definition without value', () => {
        const str = 'def myvar;\n';
        const analyser = new Analyser(str);

        const result = analyser.parse();

        assertResult(result, 'var myvar;');
        assert(analyser.scope.variables.length === 1);
        assert(analyser.scope.variables[0].name === 'myvar');
        assert(analyser.scope.variables[0].type === VariableType.ANY);
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

    it('should avoid type casting', () => {
        const str = `
            def myvar1 = 0;
            def myvar2 = (int)myvar1;\n`;

        const analyser = new Analyser(str);
        const result = analyser.parse();

        assertResult(result, `var myvar1 = 0;var myvar2 = myvar1;`);
    });

    it('should throw an error when broken number (more than 2 dots) is used', () => {
        const str = `
            def m = [ a: 0...9 ];
        `;

        assert.throws(() => Analyser.convert(str));
    });

    it('should throw an error when broken accessor/range (more than 2 dots) is used', () => {
        const str = `
            def a = 0;
            def b = 10;
            def c = a...c;
        `;

        assert.throws(() => Analyser.convert(str));
    });

    it('should throw an error if the for keyword is badly used', () => {
        const str = `
            for = 1;
        `;

        assert.throws(() => Analyser.convert(str));
    });

    it('shoud throw when using triple equel === (or more)', () => {
        const str = `
            def a = 1 === 0;
        `;

        assert.throws(() => Analyser.convert(str));
    });

    it('should throw an error when declaring a class without name', () => {
        const str = `
            class {

            }
        `;

        assert.throws(() => Analyser.convert(str));
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

    it('should push a value in array using operator <<', () => {
        const str = `
            def myvar = [1, 2, 3];
            myvar << 1;
        `;
        const analyser = new Analyser(str);
        const result = analyser.parse();

        assertResult(result, 'var myvar = [1,2,3]; myvar = insert(myvar, 1);');
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

    it('should define an empty map', () => {
        const str = 'def map = [:];';
        const analyser = new Analyser(str);

        const result = analyser.parse();
        assertResult(result, 'var map = { };');
    });

    it('should parse | operator (and ||)', () => {
        const str = 'def a = 0; return (a | 0) && a || 0;';
        const analyser = new Analyser(str);

        const result = analyser.parse();
        assertResult(result, 'var a = 0; return (a | 0) && a || 0;');
    });

    it('should parse || operators in a if', () => {
        const str = `
            if(param["r_"+i][j]<1 || param["r_"+i][j]>10) {

            }
        `;
        const analyser = new Analyser(str);

        const result = analyser.parse();
        assertResult(result, 'if (param["r_"+i][j]<1 || param["r_"+i][j]>10) {}');
    });

    it('should parse a function callback without parameters (.sort for example)', () => {
        const str = `
            def a = [1, 2, 3];
            a.sort();
        `;

        const result = Analyser.convert(str);
        assertResult(result, 'var a = [1, 2, 3]; a.sort();');
    });

    it('should affect a value to a variable and store its real type', () => {
        const str = `
            def a = [1, 2, 3];
            b = a;
        `;

        const analyser = new Analyser(str);
        const result = analyser.parse();

        assertResult(result, 'var a = [1, 2, 3]; var b = a;');
        assert(analyser.scope.variables.length === 2);

        assert(analyser.scope.variables[0].name === "a");
        assert(analyser.scope.variables[0].type === VariableType.ARRAY);

        assert(analyser.scope.variables[1].name === "b");
        assert(analyser.scope.variables[1].type === VariableType.ARRAY);
    });

    it('should affect a value of a member to a variable and store its real type', () => {
        const str = `
            def a = [
                a: 0,
                b: 0,
                c: [1, 2, 3]
            ];

            b = a.b;
            c = a.c;
        `;

        const analyser = new Analyser(str);
        const result = analyser.parse();

        assertResult(result, 'var a = { a: 0, b: 0, c: [1, 2, 3] }; var b = a.b; var c = a.c;');
        assert(analyser.scope.variables.length === 6);

        assert(analyser.scope.variables[0].name === "a");
        assert(analyser.scope.variables[0].type === VariableType.MAP);

        assert(analyser.scope.variables[4].name === "b");
        assert(analyser.scope.variables[4].type === VariableType.NUMBER);

        assert(analyser.scope.variables[5].name === "c");
        assert(analyser.scope.variables[5].type === VariableType.ARRAY);
    });

    it('should affect a value from an array to a variable and have type ANY', () => {
        const str = `
            def a = [
                b: [[
                    c: [1, 2, 3]
                ]]
            ];

            b = a.b[0];
            return b.c.intersect(b.c.take(1)).size();
        `;

        const analyser = new Analyser(str);
        const result = analyser.parse();

        assertResult(result, 'var a = { b: [{ c: [1, 2, 3] }] }; var b = a.b[0]; return b.c.intersect(b.c.take(1)).length;');
        assert(analyser.scope.variables.length === 4);

        assert(analyser.scope.variables[0].name === "a");
        assert(analyser.scope.variables[0].type === VariableType.MAP);

        assert(analyser.scope.variables[2].name === "b");
        assert(analyser.scope.variables[2].type === VariableType.ANY);
    });

    it('should parse complex expressions', () => {
        const str = `
            def a = b.c[d][0].p + b.c[d][1].p;
        `;

        const analyser = new Analyser(str);
        const result = analyser.parse();

        assertResult(result, `var a = add(b.c[d][0].p, b.c[d][1].p);`);
    });

    it('should parse negative numbers', () => {
        const str = `
            if (b.c.d.tir.indexOf(e.f) == -1) {

            }
        `;

        const analyser = new Analyser(str);
        const result = analyser.parse();

        assertResult(result, `if (b.c.d.tir.indexOf(e.f) == -1) { }`);
    });

    it('should parse operators and assign result when type unkwnown', () => {
        const str = `
            a.b.c.d = constants.steps[a.b.c.e + 1] - a.b.c.f.size();
        `;

        const analyser = new Analyser(str);
        const result = analyser.parse();

        assertResult(result, `a.b.c.d = subtract(constants.steps[a.b.c.e + 1], a.b.c.f.length);`);
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

    it('should parse a variable which is a string with triple simple quotes', () => {
        const str = `def myvar = '''hello''';`;
        const analyser = new Analyser(str);

        const result = analyser.parse();

        assertResult(result, 'var myvar = `hello`;');
    });

    it('should parse a variable which is a string with triple double quotes', () => {
        const str = `def myvar = """hello""";`;
        const analyser = new Analyser(str);

        const result = analyser.parse();

        assertResult(result, 'var myvar = `hello`;');
    });

    it('should parse a variable which is a string with variable access', () => {
        const str = `
            def myvar = "hello";
            def str = "name is \${hello}";
        `;
        const analyser = new Analyser(str);
        const result = analyser.parse();

        assertResult(result, 'var myvar = "hello"; var str = `name is ${hello}`;');
        assert(analyser.scope.variables.length === 2);

        assert(analyser.scope.variables[0].name === 'myvar');
        assert(analyser.scope.variables[0].type === VariableType.STRING);

        assert(analyser.scope.variables[1].name === 'str');
        assert(analyser.scope.variables[1].type === VariableType.STRING);
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

    it('should define a range which uses variables of the scope', () => {
        const str = `
            def a = 0;
            def b = 10;
            def c = a..b;
        `;

        const result = Analyser.convert(str);
        assertResult(result, 'var a = 0; var b = 10; var c = range(a, b);');
    });

    it('should parse a for loop with a range and operators', () => {
        const str = `
            def a = 0;
            for (def i in 0..19 + 1) {
                a++;
            }\n`;

        const analyser = new Analyser(str);
        const result = analyser.parse();
        assertResult(result, `var a = 0;for (var i in range(0, 19 + 1)){a ++;}`);
    });

    it('should parse a for loop with a string', () => {
        const str = `
            def a = 0;
            for (def i in "hello") {
                a++;
            }\n`;

        const analyser = new Analyser(str);
        const result = analyser.parse();
        assertResult(result, `var a = 0;for (var i in "hello"){a ++;}`);
    });

    it('should parse a for loop with a variable which is a string', () => {
        const str = `
            def a = "hello";
            for (def i in a) {
                
            }\n`;

        const analyser = new Analyser(str);
        const result = analyser.parse();
        assertResult(result, `var a = "hello";for (var i in a){ }`);
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

            return a;
        `;

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

            return b;
        `;

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

    it('should parse unary operator', () => {
        const str = `
            def a = true;
            a = !a;
        `;

        const result = Analyser.convert(str);
        assertResult(result, `var a = true; a = !a;`);
    });

    it('should parse a if using unary operator + beginning code block with accessor', () => {
        const str = `
            if(aa.bb[0] != 0) {
                a.b.c.msg="samuel";
                return false;
            }
        `;

        const result = Analyser.convert(str, Variable.buildFrom({
            aa: {
                bb: []
            },
            a: {
                b: {
                    c: {
                        msg: ''
                    }
                }
            }
        }));

        assertResult(result, 'if(aa.bb[0] != 0){a.b.c.msg="samuel";return false;}');
    });

    it('should access an array member or an array', () => {
        const str = `
            def a = [[1, 2], [1, 2]];
            return a[0][1];
        `;

        const analyser = new Analyser(str);
        const result = analyser.parse();
        assertResult(result, `var a = [[1, 2], [1, 2]]; return a[0][1];`);
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
            if (a.arr[1] < 10) {
                return 0;
            }`;

        const analyser = new Analyser(str);
        const result = analyser.parse();
        assertResult(result, `var a = {arr: [1,2,3]};if(a.arr[1] <10){return0;}`);
    });

    it('should compare array members or an array on accessor', () => {
        const str = `
            def a = [arr: [[1, 2], [1, 2]]];
            if (a.arr[1][0] < 10) {
                return 0;
            }`;

        const analyser = new Analyser(str);
        const result = analyser.parse();
        assertResult(result, `var a = {arr: [[1, 2], [1, 2]]};if(a.arr[1][0] <10){return0;}`);
    });

    it('should access a map member using double quotes', () => {
        const str = `
            def a = [:];
            a."b" = 0;
        `;

        const analyser = new Analyser(str);
        const result = analyser.parse();
        assertResult(result, `var a = { }; a["b"] = 0;`);
    });

    it('should access a map member using single quotes', () => {
        const str = `
            def a = [:];
            a.'b' = 0;
        `;

        const analyser = new Analyser(str);
        const result = analyser.parse();
        assertResult(result, `var a = { }; a['b'] = 0;`);
    });

    it('should access a map member using triple single quotes', () => {
        const str = `
            def a = [:];
            a.'''b''' = 0;
        `;

        const analyser = new Analyser(str);
        const result = analyser.parse();
        assertResult(result, `var a = { }; a[\`b\`] = 0;`);
    });

    it('should access a map member using triple double quotes', () => {
        const str = `
            def a = [:];
            a."""b""" = 0;
        `;

        const analyser = new Analyser(str);
        const result = analyser.parse();
        assertResult(result, `var a = { }; a[\`b\`] = 0;`);
    });

    it('should parse functions on map which is a member declared using quotes', () => {
        const str = `
            def a = [:];
            a.'fn' = { p -> println p; };
            a.fn(1);
        `;
        const result = Analyser.convert(str);
        assertResult(result, `var a = {}; a['fn'] = function(p) { console.log(p); }; a.fn(1);`);
    });

    it('should parse a loop in a function', () => {
        const str = `
            def fn = {
                for (def i = 0; i < 1; i++) {
                    println "hello";
                }
            };
        `;

        const result = Analyser.convert(str);
        assertResult(result, 'var fn = function (it) { for (var i = 0; i < 1; i++) { console.log("hello"); } };');
    });

    it('should parse a switch case', () => {
        const str = `
            def a = 0;
            switch (a) {
                case 0: break;
            }
        `;

        const result = Analyser.convert(str);
        assertResult(result, 'var a = 0; switch (a) { case 0: break; }');
    });

    it('should call global functions without parenthesis', () => {
        const str = `
            def a = 1;
            println "coucou";
            println 0;
            println a;
        `;

        const analyser = new Analyser(str);
        const result = analyser.parse();
        assertResult(result, `var a =  1; console.log("coucou"); console.log(0); console.log(a);`);
    });

    it('should call global functions with parenthesis', () => {
        const str = `
            def a = 1;
            println ("coucou");
            println (0);
            println (a);
        `;

        const analyser = new Analyser(str);
        const result = analyser.parse();
        assertResult(result, `var a =  1; console.log(("coucou")); console.log((0)); console.log((a));`);
    });

    it('should call global functions with parenthesis with complex expression in it', () => {
        const str = `
            def a = [1, 2, 3];
            println a.take(0).unique(true);
        `;

        const analyser = new Analyser(str);
        const result = analyser.parse();
        assertResult(result, `var a = [1, 2, 3]; console.log(a.take(0).unique(true));`);
    });

    it('should set property "length" after method call', () => {
        const str = `
            def a = [1, 2, 3];
            return a.unique(false).size();
        `;

        const result = Analyser.convert(str);
        assertResult(result, 'var a = [1, 2, 3]; return a.unique(false).length;');
    });

    it('should parse an empty class', () => {
        const str = `
            class A {
                
            }
        `;

        const analyser = new Analyser(str);
        const result = analyser.parse();

        assertResult(result, 'function A() { }');
    });

    it('should parse a class with a member in it', () => {
        const str = `
            class A {
                String str
            }
        `;

        const analyser = new Analyser(str);
        const result = analyser.parse();

        assertResult(result, 'function A() {  }');
    });

    it('should parse a class with a member in it which as a value', () => {
        const str = `
            class A {
                String str = "hello"
            }
        `;

        const analyser = new Analyser(str);
        const result = analyser.parse();

        assertResult(result, 'function A() { this.str = "hello" }');
    });

    it('should parse a class wich has an empty constructor', () => {
        const str = `
            class A {
                A (String str) { }
            }
        `;

        const analyser = new Analyser(str);
        const result = analyser.parse();

        assertResult(result, 'function A(str) { }');
    });

    it('should parse a class wich has an empty constructor with a def', () => {
        const str = `
            class A {
                def A (String str) { }
            }
        `;

        const analyser = new Analyser(str);
        const result = analyser.parse();

        assertResult(result, 'function A(str) { }');
    });

    it('should parse a class wich has a constructor', () => {
        const str = `
            class A {
                A (String str) { println "hello" }
            }
        `;

        const analyser = new Analyser(str);
        const result = analyser.parse();

        assertResult(result, 'function A(str) { console.log("hello") }');
    });

    it('should parse a class wich has a constructor with a def', () => {
        const str = `
            class A {
                def A (String str) { println "hello" }
            }
        `;

        const analyser = new Analyser(str);
        const result = analyser.parse();

        assertResult(result, 'function A(str) { console.log("hello") }');
    });

    it('should parse a class which has a construtor and members', () => {
        const str = `
            class A {
                String str = "hello"
                def A (String str) { println "hello" }
            }
        `;

        const analyser = new Analyser(str);
        const result = analyser.parse();

        assertResult(result, 'function A(str) { this.str = "hello" console.log("hello") }');
    });

    it('should parse a class with a method in it', () => {
        const str = `
            class A {
                String str = "hello"
                def A (String str) { println "hello" }
                String toString () { return "hello" }
            }
        `;

        const result = Analyser.convert(str);

        assertResult(result, `
            function A(str) {
                this.str = "hello"
                console.log("hello")
            }

            A.prototype.toString = function () {
                return "hello"
            }
        `);
    });

    it('should parse a class with a method in it', () => {
        const str = `
            class A {
                void doSomething () {
                    return 0;
                }
            }
        `;

        const result = Analyser.convert(str);

        assertResult(result, `
            function A() {

            }

            A.prototype.doSomething = function () {
                return 0;
            }
        `);
    });

    it('should parse a class with a method in it', () => {
        const str = `
            class A {
                void doSomething (def a, def b) {
                    return a + b;
                }
            }
        `;

        const result = Analyser.convert(str);

        assertResult(result, `
            function A() {

            }

            A.prototype.doSomething = function (a, b) {
                return add(a, b);
            }
        `);
    });

    it('should parse a class with a method in it', () => {
        const str = `
            class A {
                String str = "hello";
                def String str2 = "hello2";

                def A (String str) { println "hello"; }

                String toString () { return "hello"; }

                int doSomething (def a, def b) {
                    return a + b;
                }

                int doSomething2 (String a, String b) {
                    return a + b;
                }

                A fluent() {
                    return this;
                }
            }

            def a = new A("hello");
            println a.toString();
            println a.doSomething(1, 2);
            println a.fluent().doSomething(1, 2);​`;

        const result = Analyser.convert(str);

        assertResult(result, `
            function A(str) {
                this.str = "hello";
                this.str2 = "hello2";
                console.log("hello");
            }

            A.prototype.toString = function () {
                return "hello";
            }

            A.prototype.doSomething = function (a, b) {
                return add(a, b);
            }

            A.prototype.doSomething2 = function (a, b) {
                return add(a, b);
            }

            A.prototype.fluent = function () {
                return this;
            }

            var a = new A("hello");
            console.log(a.toString());
            console.log(a.doSomething(1, 2));
            console.log(a.fluent().doSomething(1, 2));
        `);
    });
});

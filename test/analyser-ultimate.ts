import Analyser from '../src/analyser/analyser';
import * as assert from 'assert';

describe('A Complete Analyser', () => {
    const execute = (code: string, args: string = '', values: string = ''): any => {
        return eval(`
var range = function (start, end) {
    return Array.from({ length: end - start + 1 }, (v, k) => k + start); 
};

var subtract = function (a, b) {
    if (b instanceof Array) {
        for (var i = 0; i < b.length; i++) { 
            for (var j = 0; j < a.length; j++) {
                if (a[j] === b[i]) {
                    a.splice(j, 1);
                    break;
                }
            }
        }
    } else {
        for (var i = 0; i < a.length; i++) {
            if (a[i] === b) {
                a.splice(i, 1);
            }
        }
    }

    return a;
};

(function (${args}) {
    ${code}
})(${values});
        `);
    };

    it('should return a value', () => {
        const toParse = `
            def value = 0;
            return value;`;

        const result = Analyser.convert(toParse);
        assert(execute(result) === 0);
    });

    it('should return a value', () => {
        const toParse = `
            def a = [1, 2, 3];
            def b = [1, 2];
            return a - b;`;

        const result = Analyser.convert(toParse);
        const exec = execute(result);

        assert(exec.length === 1 && exec[0] === 3);
    });

    it('should return a value', () => {
        const toParse = `
            def a = [1, 2, 3];
            def b = 1;
            return a - 1;`;

        const result = Analyser.convert(toParse);
        const exec = execute(result);

        assert(exec.length === 2 && exec[0] === 2 && exec[1] === 3);
    });

    it('should return a value', () => {
        const toParse = `
            def a = [1, 2, 3];
            return a - (1 - 2 - 3);`;

        const result = Analyser.convert(toParse);
        const exec = execute(result);

        assert(exec.length === 3);
    });

    it('should return a value', () => {
        const toParse = `
            def a = [1, 2, 3];
            return a - 1 - 2 - 3;`;

        const result = Analyser.convert(toParse);
        const exec = execute(result);

        assert(exec.length === 0);
    });
});
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

var add = function (a, b) {
    if (b instanceof Array) {
        for (var i = 0; i < b.length; i++) {
            a.push(b[i]);
        }
    } else {
        a.push(b);
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

    it('should return a value', () => {
        const toParse = `
            def a = [1, 2, 3];
            def b = 0;
            
            for (i in a) {
                b++;
            }

            for (i in [1, 2, 3]) {
                b++;
            }

            for (i in 0..19) {
                b++;
            }

            return b;
        `;

        const result = Analyser.convert(toParse);
        const exec = execute(result);

        assert(exec === 3 + 3 + 20);
    });

    it('should return a value', () => {
        const toParse = `
            def a = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

            a = a - 1 - (3 - 2);
            return a;
        `;

        const result = Analyser.convert(toParse);
        const exec = execute(result);

        assert(exec.length === 9);
    });

    it('should return a value', () => {
        const toParse = `
            def a = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

            a = a - 1 - (3 - 2) - (4 - 3) - (5 - 4);
            return a;
        `;

        const result = Analyser.convert(toParse);
        const exec = execute(result);

        assert(exec.length === 9);
    });

    it('should return a value', () => {
        const toParse = `
            def a = [1, 2, 3] - 1 - (3 - 2);
            return a;
        `;

        const result = Analyser.convert(toParse);
        const exec = execute(result);

        assert(exec.length === 2);
    });

    it('should return a value', () => {
        const toParse = `
            def a = 1 - 1 - (3 - 2);
            return a;
        `;

        const result = Analyser.convert(toParse);
        const exec = execute(result);

        assert(exec === -1);
    });

    it('should return a value', () => {
        const toParse = `
            def a = [1, 2, 3];
            return a + 1;
        `;

        const result = Analyser.convert(toParse);
        const exec = execute(result);

        assert(exec.length === 4);
    });
});
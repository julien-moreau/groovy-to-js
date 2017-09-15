import Analyser from '../src/analyser/analyser';
import * as assert from 'assert';

describe('A Complete Analyser', () => {
    const execute = (code: string, args: string = '', values: string = ''): any => {
        return eval(`
            var range = function (start, end) {
                return Array.from({ length: end - start + 1 }, (v, k) => k + start); 
            };

            (function (${args}) {
                ${code}
            })(${values});
        `);
    };

    it('should return a value', () => {
        const toParse = `
            def value = 0;
            return value;
        `;

        const result = Analyser.convert(toParse);
        assert(execute(result) === 0);
    });

    it('should return a complexe object', () => {
        const toParse = `
            return [
                a: 0,
                b: 1,
                c: [1, 2, 3, false, true],
                d: [a: 0, b: false]
            ];
        `;

        const result = Analyser.convert(toParse);
        assert.deepStrictEqual(execute(result), {
            a: 0,
            b: 1,
            c: [1, 2, 3, false, true],
            d: { a: 0, b: false }
        });
    });

    it('should take a decision using if and else', () => {
        const toParse = `
            if (a == 0) {
                return 0;
            } else {
                return 1;
            }
        `;

        const result = Analyser.convert(toParse);
        assert(execute(result, 'a', '0') === 0);
        assert(execute(result, 'a', '1') === 1);
    });

    it('should use the while loop', () => {
        const toParse = `
            def a = 0;
            a++;
            while (a < 10) {
                a++;
            }

            return a;
        `;

        const result = Analyser.convert(toParse);
        assert(execute(result) === 10);
    });

    it('should use the for loop with a def', () => {
        const toParse = `
            def a = 0;
            for (def i = 0; i < 10; i++) {
                a++;
            }

            return a;
        `;

        const result = Analyser.convert(toParse);
        assert(execute(result) === 10);
    });

    it('should use the for loop without a def', () => {
        const toParse = `
            def a = 0;
            for (i = 0; i < 10; i++) {
                a++;
            }

            return a;
        `;

        const result = Analyser.convert(toParse);
        assert(execute(result) === 10);
    });

    it('should use the for loop with a in keyword and a def', () => {
        const toParse = `
            def a = 0;
            def arr = [1, 2, 3];

            for (def i in arr) {
                a++;
            }

            return a;
        `;

        const result = Analyser.convert(toParse);
        assert(execute(result) === 3);
    });

    it('should use the for loop with a in keyword without a def', () => {
        const toParse = `
            def a = 0;
            def arr = [1, 2, 3];

            for (def i in arr) {
                a++;
            }

            return a;
        `;

        const result = Analyser.convert(toParse);
        assert(execute(result) === 3);
    });

    it('should use the for loop with a in keyword and a range as value', () => {
        const toParse = `
            def a = 0;

            for (i in 0..19) {
                a++;
            }

            return a;
        `;

        const result = Analyser.convert(toParse);
        assert(execute(result) === 20);
    });
});

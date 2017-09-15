import Analyser from '../src/analyser/analyser';
import * as assert from 'assert';

describe('An Complete Analyser', () => {
    const execute = (code: string, args: string = '', values: string = ''): any => {
        return eval(`(function (${args}) { ${code} })(${values})`);
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
});

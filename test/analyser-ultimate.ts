import Analyser from '../src/analyser/analyser';
import * as assert from 'assert';
import * as beautifier from 'js-beautify';

describe('A Ultimate Analyser', () => {
    const execute = (code: string, args: string = '', values: string = ''): any => {
        code = beautifier.js_beautify(code);
        console.log(code);

        return eval(`
            var range = function (start, end) {
                return Array.from({ length: end - start + 1 }, (v, k) => k + start); 
            };

            (function (${args}) {
                ${code}
            })(${values});
        `);
    };

    it('should work :)', () => {
        const toParse = `
            def a = 0;
            def start = 0;
            def end = 19;
            
            def b = 0;
            for (b in 0..19) {
                b++;
            }

            def map = [
                a: 0,
                b: 0
            ];
            for (m in map) {
                map.a -= 1;
            }

            for (def i in start..end) {
                a++;

                def b = 0;
                for (items in ["A", "B", "C"]) {
                    b++;
                }

                if (a == 2) {
                    while (a < 500) {
                        a++;
                    }
                }
            }

            return a;​`;

        const result = Analyser.convert(toParse);
        assert(execute(result) === 518);
    });
});

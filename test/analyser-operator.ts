import Analyser from '../src/analyser/analyser';
import { ScopeElementType } from '../src/analyser/scope';

import * as assert from 'assert';

describe('An Analyser', () => {
    it('should support operators', () => {
        const toParse = `
            def myvar = 1;
            def myvar2 = 2;

            def result = myvar - 2;
        `;
        const analyser = new Analyser(toParse);

        const result = analyser.parse();
        assert(result.replace(/\n/g, '') === 'var myvar = 1;var myvar2 = 2;var result = myvar - 2;');
    });

    it('should throw an error when calling an operator with arrays', () => {
        const toParse = `
            def myvar = [1];
            def myvar2 = [2];

            def result = myvar - 2;
        `;
        const analyser = new Analyser(toParse);

        try {
            analyser.parse();
        } catch (e) {
            assert(e.message === 'Operator-assignation are forbidden in JavaScript');
        }
    });

    it('should throw an error when calling an operator with arrays of an object', () => {
        const toParse = `
            def map = [
                a: [0, 1],
                b: false
            ];

            def result = map.a - 2;`;
        const analyser = new Analyser(toParse);
        let hasError = false;

        try {
            const js = analyser.parse();
        } catch (e) {
            hasError = true;
            assert(e.message === 'Operator-assignation are forbidden in JavaScript');
        }

        assert(hasError);
    });

    it('should throw an error when calling an operator with arrays of a complex object', () => {
        const toParse = `
            def map = [
                a: [
                    b: [1, 2]
                ]
            ];

            def result = map.a.b - 2;`;
        const analyser = new Analyser(toParse);
        let hasError = false;

        try {
            const js = analyser.parse();
        } catch (e) {
            hasError = true;
            assert(e.message === 'Operator-assignation are forbidden in JavaScript');
        }

        assert(hasError);
    });

    it('should throw an error when calling an operator with arrays of a deep complex object', () => {
        const toParse = `
            def map = [
                a: [
                    b: [1, [
                        a: [1, 2]
                    ]]
                ]
            ];

            def result = map.a.b[1].a - 2;`;
        const analyser = new Analyser(toParse);
        let hasError = false;

        try {
            const js = analyser.parse();
        } catch (e) {
            hasError = true;
            assert(e.message === 'Operator-assignation are forbidden in JavaScript');
        }

        assert(hasError);
    });
});

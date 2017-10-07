import groovy_to_js from '../src/index';
import * as assert from 'assert';

describe('A Groovy To JS package', () => {
    it('should export a function which takes only a string', () => {
        const str = 'def a = 0;';
        const result = groovy_to_js(str);

        assert(result === 'var a = 0;');
    });

    it('should export a function which takes a string and a context', () => {
        const context = {
            b: 0
        };
        const str = 'def a = b;';
        const result = groovy_to_js(str, context);

        assert(result === 'var a = b;');
    });
});

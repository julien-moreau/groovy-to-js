import Tokenizer from '../src/tokenizer/tokenizer';
import * as assert from 'assert';

describe('A Tokenizer', () => {
    it('should take a string to parse and extra parameters', () => {
        const str = 's';

        const tokenizer1 = new Tokenizer(str);
        assert(tokenizer1.toParse === str);
        assert(tokenizer1['pos'] === 0);
        assert(tokenizer1['maxPos'] === str.length);
    });
});

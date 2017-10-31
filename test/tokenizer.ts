import Tokenizer from '../src/tokenizer/tokenizer';
import { TokenType } from '../src/tokenizer/token-type';

import * as assert from 'assert';

describe('A Tokenizer', () => {
    it('should take a string to parse and extra parameters', () => {
        const str = 's';

        const tokenizer = new Tokenizer(str);
        assert(tokenizer.toParse === str);
        assert(tokenizer['pos'] === 0);
        assert(tokenizer['maxPos'] === str.length);
    });

    it('should tokenize a string which has quotes in it', () => {
        const str3 = `"<html class=\\"table\\" width=\\"1%\\">"`;
        const tokenizer3 = new Tokenizer(str3);
        assert(tokenizer3.getNextToken() === TokenType.STRING && tokenizer3.currentString === str3);
    });
});

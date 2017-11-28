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
        const str = `"<html class=\\"table\\" width=\\"1%\\">"`;
        const tokenizer = new Tokenizer(str);
        assert(tokenizer.getNextToken() === TokenType.STRING && tokenizer.currentString === str);
    });

    it('should be able to skip comments', () => {
        const str = `
            // Comment
            def a = 0;
        `;

        const tokenizer = new Tokenizer(str);
        tokenizer.getNextToken(); // \n
        assert(tokenizer.getNextToken() === TokenType.COMMENT);

        const tokenizer2 = new Tokenizer(str);
        tokenizer2.skipCommentsAndNewLines = true;
        assert(tokenizer2.getNextToken() === TokenType.IDENTIFIER);
    });
});

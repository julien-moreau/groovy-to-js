import { Tokenizer, ETokenType } from "../../src/tokenizer/tokenizer";
import * as assert from "assert";

describe("Tokenizer", () => {
    it("should return en of input", () => {
        const t = new Tokenizer("");
        assert.equal(t.currentToken, ETokenType.EndOfInput);
    });

    it("should return en of input when only spaces or line returns", () => {
        const t = new Tokenizer(" \n\t\r");
        assert.equal(t.currentToken, ETokenType.EndOfInput);
    });

    it("should return tokenize an identifier", () => {
        const t = new Tokenizer("def");
        assert.equal(t.currentToken, ETokenType.Identifier);
        assert.equal(t.currentString, "def");
    });

    it("should return a number", () => {
        const t = new Tokenizer("1");
        assert.equal(t.currentToken, ETokenType.Number);
        assert.equal(t.currentString, "1");
    });

    it("should return a floating number", () => {
        const t = new Tokenizer("1.24");
        assert.equal(t.currentToken, ETokenType.Number);
        assert.equal(t.currentString, "1.24");
    });

    it("should return operators", () => {
        const t = new Tokenizer("+-*/");
        assert(t.currentToken === ETokenType.Plus);
        assert(t.getNextToken() === ETokenType.Minus);
        assert(t.getNextToken() === ETokenType.Mult);
        assert(t.getNextToken() === ETokenType.Div);
    });

    it("should return equal", () => {
        const t = new Tokenizer("=");
        assert.equal(t.currentToken, ETokenType.Equal);
        assert.equal(t.currentString, "=");
    });

    it("should return equality", () => {
        const t = new Tokenizer("==");
        assert.equal(t.currentToken, ETokenType.Equality);
        assert.equal(t.currentString, "==");
    });
});
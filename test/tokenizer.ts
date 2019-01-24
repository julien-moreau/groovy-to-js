import { Tokenizer, ETokenType } from "../src/tokenizer/tokenizer";
import * as assert from "assert";

describe("Tokenizer", () => {
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

    it("should return operators", () => {
        const t = new Tokenizer("+-*/");
        assert(t.currentToken === ETokenType.Plus);
        assert(t.getNextToken() === ETokenType.Minus);
        assert(t.getNextToken() === ETokenType.Mult);
        assert(t.getNextToken() === ETokenType.Div);
    });
});

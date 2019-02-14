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

    it("should return an identifier which has digits", () => {
        const t = new Tokenizer("def1");
        assert.equal(t.currentToken, ETokenType.Identifier);
        assert.equal(t.currentString, "def1");
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

    it("should return logic operator and", () => {
        const t = new Tokenizer("&&");
        assert.equal(t.currentToken, ETokenType.And);
        assert.equal(t.currentString, "&&");
    });

    it("should return logic operator or", () => {
        const t = new Tokenizer("||");
        assert.equal(t.currentToken, ETokenType.Or);
        assert.equal(t.currentString, "||");
    });

    it("should return a bitwise left", () => {
        const t = new Tokenizer("<<");
        assert.equal(t.currentToken, ETokenType.BitwiseLeft);
        assert.equal(t.currentString, "<<");
    });

    it("should return a bitwise right", () => {
        const t = new Tokenizer(">>");
        assert.equal(t.currentToken, ETokenType.BitwiseRight);
        assert.equal(t.currentString, ">>");
    });

    it("should return a pointer", () => {
        const t = new Tokenizer("->");
        assert.equal(t.currentToken, ETokenType.Pointer);
        assert.equal(t.currentString, "->");
    });

    it("should return an error token when bad boolean operations", () => {
        const t = new Tokenizer("&*");
        assert.equal(t.currentToken, ETokenType.Error);
    });

    it("should return an error token when bad character", () => {
        const t = new Tokenizer("¤");
        assert.equal(t.currentToken, ETokenType.Error);
    });

    it("should parse a comment", () => {
        const t = new Tokenizer("// Helloworld");
        assert.equal(t.currentToken, ETokenType.EndOfInput);
        assert.equal(t.comments.length, 1);
    });

    it("should parse a multiline comment", () => {
        const t = new Tokenizer("/* Helloworld */");
        assert.equal(t.currentToken, ETokenType.EndOfInput);
        assert.equal(t.comments.length, 1);
    });

    it("should parse a multiline comment", () => {
        const t = new Tokenizer(`
        /**
         * Helloworld
         */
        `);
        assert.equal(t.currentToken, ETokenType.EndOfInput);
        assert.equal(t.comments.length, 1);
    });

    it("should parse a single quoted string", () => {
        const t = new Tokenizer("'hello'");
        assert.equal(t.currentToken, ETokenType.SingleQuotedString);
    });

    it("should parse a double quoted string", () => {
        const t = new Tokenizer('"hello"');
        assert.equal(t.currentToken, ETokenType.DoubleQuotedString);
    });

    it("should parse a triple single quoted string", () => {
        const t = new Tokenizer("'''hello'''");
        assert.equal(t.currentToken, ETokenType.TripleSingleQuotedString);
    });

    it("should parse a triple double quoted string", () => {
        const t = new Tokenizer("'''hello'''");
        assert.equal(t.currentToken, ETokenType.TripleSingleQuotedString);
    });

    it("should parse a string which has escape character", () => {
        const t = new Tokenizer(`'I\\'m you'`);
        assert.equal(t.currentToken, ETokenType.SingleQuotedString);
        assert.equal(t.currentString, `'I\\'m you'`);
    });
});

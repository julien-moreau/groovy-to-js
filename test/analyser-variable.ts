import Analyser from '../src/analyser/analyser';
import * as assert from 'assert';

describe('An Analyser', () => {
    it('should parse a variable definition as a number', () => {
        const toParse = 'def myvar = 0;';
        const analyser = new Analyser(toParse);

        const result = analyser.parse();
        assert(result === 'var myvar = 0;');
    });

    it('should parse a variable definition as a string', () => {
        const toParse = 'def myvar = "hello";';
        const analyser = new Analyser(toParse);

        const result = analyser.parse();
        assert(result === 'var myvar = "hello";');
    });

    it('should parse a variable definition as an array', () => {
        const toParse = 'def myvar = [];';
        const analyser = new Analyser(toParse);

        const result = analyser.parse();
        assert(result === 'var myvar = [];');
    });

    it('should parse a variable definition as an array with number elements', () => {
        const toParse = 'def myvar = [1, 2, 3];';
        const analyser = new Analyser(toParse);

        const result = analyser.parse();
        assert(result === 'var myvar = [1,2,3];');
    });

    it('should parse a variable definition as an array with array-number elements', () => {
        const toParse = 'def myvar = [1, [2, 3], 4];';
        const analyser = new Analyser(toParse);

        const result = analyser.parse();
        assert(result === 'var myvar = [1,[2,3],4];');
    });

    it('should parse a variable definition as an array with string elements', () => {
        const toParse = 'def myvar = ["hello1", "hello2"];';
        const analyser = new Analyser(toParse);

        const result = analyser.parse();
        assert(result === 'var myvar = ["hello1","hello2"];');
    });

    it('should parse a variable definition as an array with array-string elements', () => {
        const toParse = 'def myvar = ["hello1", ["hello2", "hello3"]];';
        const analyser = new Analyser(toParse);

        const result = analyser.parse();
        assert(result === 'var myvar = ["hello1",["hello2","hello3"]];');
    });

    it('should parse a variable definition as a map', () => {
        const toParse = 'def emptyMap = [:];';
        const analyser = new Analyser(toParse);

        const result = analyser.parse();
        assert(result === 'var emptyMap = {  };');
    });

    it('should parse a variable definition as a map with one field in it', () => {
        const toParse = 'def map = [a: "value"];';
        const analyser = new Analyser(toParse);

        const result = analyser.parse();
        assert(result === 'var map = { a: "value" };');
    });

    it('should parse a variable definition as a map with several fields in it', () => {
        const toParse = 'def map = [a: "value", b: 0, arr: [1, 2, 3], strs: ["1", "2", ""]];';
        const analyser = new Analyser(toParse);

        const result = analyser.parse();
        assert(result === 'var map = { a: "value", b: 0, arr: [1,2,3], strs: ["1","2",""] };');
    });

    it('should parse a variable definition as a map with several fields in it which can be a map', () => {
        const toParse = 'def map = [a: "value", m: [a: "value2"]];';
        const analyser = new Analyser(toParse);

        const result = analyser.parse();
        assert(result === 'var map = { a: "value", m: { a: "value2" } };');
    });
});

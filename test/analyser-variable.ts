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
});

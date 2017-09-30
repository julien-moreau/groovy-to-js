import * as augmentations from '../src/augmentations/index';
import * as assert from 'assert';

describe('Augmentations', () => {
    /**
     * ADD
     */

    it('should add two numbers', () => {
        assert(augmentations.add(1, 1) === 2);
    });

    it('should add a number to an array', () => {
        const a = [1, 2, 3];
        const result = <number[]>augmentations.add(a, 4);

        assert(a.length === 3);
        assert(result.length === 4);

        assert(result[0] === 1);
        assert(result[1] === 2);
        assert(result[2] === 3)
        assert(result[3] === 4);
    });

    it('should add an array to an array', () => {
        const a = [1, 2];
        const b = [3, 4];
        const result = <number[]>augmentations.add(a, b);

        assert(a.length === 2);
        assert(b.length === 2);
        assert(result.length === 4);

        assert(result[0] === 1);
        assert(result[1] === 2);
        assert(result[2] === 3)
        assert(result[3] === 4);
    });

    /**
     * Subtract
     */

    it('should subtract two numbers', () => {
        assert(augmentations.subtract(2, 1) === 1);
    });

    it('should subtract a number to an array', () => {
        const a = [1, 2, 3];
        const result = <number[]>augmentations.subtract(a, 2);

        assert(a.length === 3);
        assert(result.length === 2);

        assert(result[0] === 1);
        assert(result[1] === 3);
    });

    it('should subtract an array to an array', () => {
        const a = [1, 2, 3];
        const b = [1, 2];
        const result = <number[]>augmentations.subtract(a, b);

        assert(a.length === 3);
        assert(b.length === 2);
        assert(result.length === 1);

        assert(result[0] === 3);
    });

    /**
     * Multiply
     */

    it('should multiply two numbers', () => {
        assert(augmentations.multiply(2, 2) === 4);
    });

    it('should multiply a number to an array', () => {
        const a = [1, 2];
        const result = <number[]>augmentations.multiply(a, 2);

        assert(a.length === 2);
        assert(result.length === 4);

        assert(result[0] === 1);
        assert(result[1] === 2);
        assert(result[2] === 1);
        assert(result[3] === 2);
    });

    it('should multiply an array to an array', () => {
        const a = [1, 2];
        const result = <number[]>augmentations.multiply(a, [2]);

        assert(a.length === 2);
        assert(result.length === 4);

        assert(result[0] === 1);
        assert(result[1] === 2);
        assert(result[2] === 1);
        assert(result[3] === 2);
    });

    it('should throw an error when multiplying an array with an array with length > 1', () => {
        const a = [1, 2];
        assert.throws(() => augmentations.multiply(a, [2, 2]));
    });

    /**
     * Times
     */

    it('should call a callback x times using number.times', () => {
        let count = 0;
        augmentations.times(3, (value) => {
            assert(value === 3);
            count++;
        });

        assert(count === 3);
    });

    /**
     * Range
     */

    it('should create a range', () => {
        const range1 = augmentations.range(0, 10);
        assert(range1.length === 10 + 1);

        for (let i = 0; i < 11; i++)
            assert(range1[i] === i);

        const range2 = augmentations.range(15, 30);
        for (let i = 0; i < 16; i++)
            assert(range2[i] === i + 15);
    });

    /**
     * Augmentify
     */

    it('should augmentify an object', () => {
        const obj = <any> { };
        augmentations.augmentify(obj);

        assert(obj.add);
        assert(obj.subtract);
        assert(obj.multiply);

        assert(obj.range);
        assert(obj.times);
    });
});

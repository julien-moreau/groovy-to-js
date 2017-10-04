import Analyser from '../src/analyser/analyser';
import * as augmentations from '../src/augmentations/index';

import * as assert from 'assert';
import * as vm from 'vm';
import * as fs from 'fs';

describe('An analyser complete', () => {
    it('should execute complete groovy code', () => {
        fs.readFile('./test/misc/complete.groovy', { encoding: 'utf-8' }, (err, data) => {
            const code = `
(function () {
    ${Analyser.convert(data)}
})();
            `;

            const context = vm.createContext();
            augmentations.augmentify(context);

            const script = new vm.Script(code);
            const result = script.runInContext(context);

            // Arrays
            assert(result.arr.length === 3);
            assert.deepEqual(result.arr, [2, 3, 4]);
            assert(result.each === 6);

            // Closures
            assert(result.closure.param1 === 1);

            // Classes
            assert(result.A);
            assert(result.A.hello && result.A.hello() === 'hello');
            assert(result.A.hello2 && result.A.hello2() === 'hello2');
            assert(result.A.choose && result.A.choose(0) === 'hello' && result.A.choose(1) === 'hello2');

            // Strings
            assert(result.strings1.replace(/[\n\r ]/g, '') === 'I am GROOVY and, I am multiline'.replace(/[\n\r ]/g, ''));

            // Map
            assert(result.map);
        });
    });
});

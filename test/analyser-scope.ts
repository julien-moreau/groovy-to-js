import Analyser from '../src/analyser/analyser';
import { ScopeElementType } from '../src/analyser/scope';

import * as assert from 'assert';

describe('An Analyser', () => {
    it('should manage a scope of variables', () => {
        const toParse = 'def myvar = 0;def myvar2 = 0;';
        const analyser = new Analyser(toParse);

        const result = analyser.parse();
        assert(result === 'var myvar = 0;var myvar2 = 0;');

        assert(analyser.scope.elements.length === 2);

        assert(analyser.scope.elements[0].name === 'myvar');
        assert(analyser.scope.elements[0].type === ScopeElementType.NUMBER);

        assert(analyser.scope.elements[1].name === 'myvar2');
        assert(analyser.scope.elements[1].type === ScopeElementType.NUMBER);
    });

    it('should parse a if node and give the root scope', () => {
        const toParse = `
            def myvar = 0;
            def myvar2 = 1;

            if (myvar == 0) {
                def myvar3 = 2;
            }
        `;
        const analyser = new Analyser(toParse);

        const result = analyser.parse();
        assert(result.replace(/[ .\t.\n]/g, '') === `var myvar = 0;var myvar2 = 1;
        if (myvar==0){
            var myvar3 = 2;
        }`.replace(/[ .\t.\n]/g, ''));
    });
});

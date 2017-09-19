import Analyser from '../src/analyser/analyser';
import Variable from '../src/analyser/scope-variable';

import * as beautifier from 'js-beautify';
import * as assert from 'assert';

describe('A Complete Analyser', () => {
    const execute = (code: string, args: string = '', values: string = ''): any => {
        let final = `
            var range = function (start, end) {
                return Array.from({ length: end - start + 1 }, (v, k) => k + start); 
            };

            var subtract = function (a, b) {
                if (b instanceof Array) {
                    for (var i = 0; i < b.length; i++) { 
                        for (var j = 0; j < a.length; j++) {
                            if (a[j] === b[i]) {
                                a.splice(j, 1);
                                break;
                            }
                        }
                    }
                } else {
                    for (var i = 0; i < a.length; i++) {
                        if (a[i] === b) {
                            a.splice(i, 1);
                        }
                    }
                }

                return a;
            };

            var add = function (a, b) {
                if (b instanceof Array) {
                    for (var i = 0; i < b.length; i++) {
                        a.push(b[i]);
                    }
                } else {
                    a.push(b);
                }

                return a;
            };

            var swrFunc = function () {
                return [];
            };

            var addInFunc = function () {
                // Nothing
            };

            var session = {
                gameData: {
                    gme: {
                        tir: [1, 2, 3],
                        til: [1, 2, 3],
                        tiw: [1, 2, 3]
                    }
                }
            };

            var param = {
                num: 1
            };

            var constants = {
                end: 0,
                steps: [1, 2, 3]
            };

            (function (${args}) {
                ${code}
            })(${values});
        `;

        final = beautifier.js_beautify(final);
        return eval(final);
    };

    it('should return a value', () => {
        const toParse = `
            def value = 0;
            return value;`;

        const result = Analyser.convert(toParse);
        assert(execute(result) === 0);
    });

    it('should return a value', () => {
        const toParse = `
            def a = [1, 2, 3];
            def b = [1, 2];
            return a - b;`;

        const result = Analyser.convert(toParse);
        const exec = execute(result);

        assert(exec.length === 1 && exec[0] === 3);
    });

    it('should return a value', () => {
        const toParse = `
            def a = [1, 2, 3];
            def b = 1;
            return a - 1;`;

        const result = Analyser.convert(toParse);
        const exec = execute(result);

        assert(exec.length === 2 && exec[0] === 2 && exec[1] === 3);
    });

    it('should return a value', () => {
        const toParse = `
            def a = [1, 2, 3];
            return a - (1 - 2 - 3);`;

        const result = Analyser.convert(toParse);
        const exec = execute(result);

        assert(exec.length === 3);
    });

    it('should return a value', () => {
        const toParse = `
            def a = [1, 2, 3];
            return a - 1 - 2 - 3;`;

        const result = Analyser.convert(toParse);
        const exec = execute(result);

        assert(exec.length === 0);
    });

    it('should return a value', () => {
        const toParse = `
            def a = [1, 2, 3];
            def b = 0;
            
            for (i in a) {
                b++;
            }

            for (i in [1, 2, 3]) {
                b++;
            }

            for (i in 0..19) {
                b++;
            }

            return b;
        `;

        const result = Analyser.convert(toParse);
        const exec = execute(result);

        assert(exec === 3 + 3 + 20);
    });

    it('should return a value', () => {
        const toParse = `
            def a = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

            a = a - 1 - (3 - 2);
            return a;
        `;

        const result = Analyser.convert(toParse);
        const exec = execute(result);

        assert(exec.length === 9);
    });

    it('should return a value', () => {
        const toParse = `
            def a = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

            a = a - 1 - (3 - 2) - (4 - 3) - (5 - 4);
            return a;
        `;

        const result = Analyser.convert(toParse);
        const exec = execute(result);

        assert(exec.length === 9);
    });

    it('should return a value', () => {
        const toParse = `
            def a = [1, 2, 3] - 1 - (3 - 2);
            return a;
        `;

        const result = Analyser.convert(toParse);
        const exec = execute(result);

        assert(exec.length === 2);
    });

    it('should return a value', () => {
        const toParse = `
            def a = 1 - 1 - (3 - 2);
            return a;
        `;

        const result = Analyser.convert(toParse);
        const exec = execute(result);

        assert(exec === -1);
    });

    it('should return a value', () => {
        const toParse = `
            def a = [1, 2, 3];
            return a + 1;
        `;

        const result = Analyser.convert(toParse);
        const exec = execute(result);

        assert(exec.length === 4);
    });

    it('should return a value', () => {
        const toParse = `
            def a = 0..19;
            return a + 1;
        `;

        const result = Analyser.convert(toParse);
        const exec = execute(result);

        assert(exec.length === 21);
    });

    it('should return a value', () => {
        const toParse = `
            def a = 0..19 + 1 + 1;
            return a;
        `;

        const result = Analyser.convert(toParse);
        const exec = execute(result);

        assert(exec.length === 22);
    });

    it('should return a value', () => {
        const toParse = `
            def a = (0..19) + 1 + 1;
            return a;
        `;

        const result = Analyser.convert(toParse);
        const exec = execute(result);

        assert(exec.length === 22);
    });

    it('should return a value', () => {
        const toParse = `
            def a = "hello" + "world";
            return a;
        `;

        const result = Analyser.convert(toParse);
        const exec = execute(result);

        assert(exec === 'helloworld');
    });

    it('should return a value', () => {
        const toParse = `
            return "hello" + "world";
        `;

        const result = Analyser.convert(toParse);
        const exec = execute(result);

        assert(exec === 'helloworld');
    });

    it('should parse an operator assign on the fly', () => {
        const toParse = `
            session.gameData.gme.tir -= [param.num];
            return session.gameData.gme.tir;
        `;

        const scope = Variable.buildFrom({
            swrFunc: 0, // Number
            session: {
                gameData: {
                    gme: {
                        tir: [1, 2, 3]
                    }
                }
            },
            param: {
                num: 1
            }
        });

        const result = Analyser.convert(toParse, scope);
        const exec = execute(result);

        assert(exec.length === 2);
    });

    it('should parse ultimate', () => {
        const toParse = `
            def tileWin = swrFunc("tilesU");

            if(tileWin == 1) {
                session.gameData.gme.tiw.add(param.num);
            }
            else {
                session.gameData.gme.til.add(param.num);
            }
            session.gameData.gme.tir -= [param.num];

            if(constants.end==session.gameData.gme.tiw.size()) {
                session.gameData.gme.ste = constants.steps.size()-1;
                session.gameData.gme.rem = 0;
            }
            else {
                for(def ste=0;ste<constants.steps.size();ste++) {
                    if(constants.steps[ste]>session.gameData.gme.tiw.size()) {
                        session.gameData.gme.ste = ste-1;
                        session.gameData.gme.rem = constants.steps[session.gameData.gme.ste + 1] - session.gameData.gme.tiw.size();
                        break;
                    }
                }
            }

            session.gameData.gme.cnt = session.gameData.gme.tiw.size() + session.gameData.gme.til.size();
            
            addInFunc("ste", session.gameData.gme.ste);
            addInFunc("sel", param.num);
            addInFunc("win", tileWin);
            addInFunc("rem", session.gameData.gme.rem);
            addInFunc("cnt", session.gameData.gme.cnt);

            return session.gameData.gme.tir;
        `;

        const scope = Variable.buildFrom({
            swrFunc: 0, // Number
            constants: {
                end: 0,
                steps: [1, 2, 3]
            },
            session: {
                gameData: {
                    gme: {
                        til: [],
                        tir: [],
                        tiw: [],
                        ste: 0,
                        rem: 0,
                        cnt: 0
                    }
                }
            },
            param: {
                num: 0
            }
        });

        const result = Analyser.convert(toParse, scope);
        const exec = execute(result);

        assert(exec.length === 2);
    });
});
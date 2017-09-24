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

            var multiply = function (a, b) {
                var arr = [];
                for (var i = 0; i < a.length; i++) {
                    arr.push(a[i]);
                }

                for (var i = 0; i < b - 1; i++) {
                    a = a.concat(arr);
                }

                return a;
            };

            var times = function (a, b) {
                for (var i = 0; i < a; i++) {
                    b(i);
                }
            };

            var swrFunc = function () {
                return [];
            };

            var addInFunc = function () {
                // Nothing
            };

            var session = {
                data: {
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
            def a = [0, 1, 2];
            return a * 2;
        `;

        const result = Analyser.convert(toParse);
        const exec = execute(result);

        assert(exec.length === 6);
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
            session.data.gme.tir -= [param.num];
            return session.data.gme.tir;
        `;

        const scope = Variable.buildFrom({
            swrFunc: 0, // Number
            session: {
                data: {
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

    it('parse functions/closures and guess types/new types', () => {
        const toParse = `
            def ev = {};
            ev.init = null;
            ev.init = 0;
            ev.init = [1,2,3];

            def fnVar = 0;
            ev.init.each {
                fnVar++;
            }

            return fnVar;
        `;

        const result = Analyser.convert(toParse);
        const exec = execute(result);

        assert(exec === 3);
    })

    it('should parse ultimate with deep scope and loops + if + else + operators', () => {
        const toParse = `
            def tileWin = swrFunc("tilesU");

            if (tileWin == 1) {
                session.data.gme.tiw.add(param.num);
            }
            else {
                session.data.gme.til.add(param.num);
            }
            session.data.gme.tir -= [param.num];

            if(constants.end==session.data.gme.tiw.size()) {
                session.data.gme.ste = constants.steps.size()-1;
                session.data.gme.rem = 0;
            }
            else {
                for(def ste=0;ste<constants.steps.size();ste++) {
                    if(constants.steps[ste]>session.data.gme.tiw.size()) {
                        session.data.gme.ste = ste-1;
                        session.data.gme.rem = constants.steps[session.data.gme.ste + 1] - session.data.gme.tiw.size();
                        break;
                    }
                }
            }

            session.data.gme.cnt = session.data.gme.tiw.size() + session.data.gme.til.size();
            
            addInFunc("ste", session.data.gme.ste);
            addInFunc("sel", param.num);
            addInFunc("win", tileWin);
            addInFunc("rem", session.data.gme.rem);
            addInFunc("cnt", session.data.gme.cnt);

            def fnVar = 0;
            session.data.gme.tir.each() {
                fnVar += it;
            };

            session.data.gme.tir.eachWithIndex { value, index ->
                fnVar = value * index;
            };

            def funcJoris = { param1, param2, param343 ->
                fnVar++;
            };
            funcJoris(0, 0);

            def ev = {};
            ev.init = null;
            ev.init = 0;
            ev.init = [1,2,3];

            ev.init.each {
                fnVar++;
            }

            3.times {
                fnVar++;
            }

            return session.data.gme.tir;
        `;

        const scope = Variable.buildFrom({
            swrFunc: 0, // Number
            constants: {
                end: 0,
                steps: [1, 2, 3]
            },
            session: {
                data: {
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
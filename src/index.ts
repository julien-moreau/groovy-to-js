import Tokenizer from './tokenizer/tokenizer';
import { TokenType } from './tokenizer/token-type';

import Analyser from './analyser/analyser';
import Scope from './analyser/scope';
import Variable, { VariableType } from './analyser/scope-variable';
import { operators, keywords, functions, properties } from './analyser/dictionnary';

import * as augmentations from './augmentations/index';

export default function groovy_to_js<T> (src: string, context?: T): string {
    const scope = Variable.buildFrom(context || { });
    return Analyser.convert(src, scope);
}

export {
    Tokenizer,
    TokenType,

    Analyser,
    Scope,
    Variable, VariableType,
    operators, keywords, functions, properties,

    augmentations
}

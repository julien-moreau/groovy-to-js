import Tokenizer from './tokenizer/tokenizer';
import { TokenType } from './tokenizer/token-type';

import Analyser from './analyser/analyser';
import Scope from './analyser/scope';
import Variable, { VariableType } from './analyser/scope-variable';
import { operators, keywords, functions, properties } from './analyser/dictionnary';

export {
    Tokenizer,
    TokenType,

    Analyser,
    Scope,
    Variable, VariableType,
    operators, keywords, functions, properties
}

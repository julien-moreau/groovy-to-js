import { Tokenizer, ETokenType } from './tokenizer/tokenizer';

import { convert } from "./converter/converter";
import { Context, IContext } from "./converter/context";
import { Analyser, IAnalyserOptions } from './analyser/analyser';
import { Scope } from "./analyser/scope";

import * as augmentations from './augmentations/index';

export default convert;

export {
    convert,
    Context, IContext,
    Tokenizer, ETokenType,

    Analyser, IAnalyserOptions, Scope,

    augmentations
}
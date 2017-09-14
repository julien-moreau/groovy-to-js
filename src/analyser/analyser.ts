import Tokenizer from '../tokenizer/tokenizer';
import { TokenType } from '../tokenizer/token-type';

import Scope, { ScopeElementType } from './scope';
import Variable from './scope-variable';

export default class Analyser {
    // Public members
    public tokenizer: Tokenizer;
    public scope: Scope = new Scope(null);

    /**
     * Constructor
     * @param toParse The groovy script to parse
     */
    constructor (toParse: string) {
        this.tokenizer = new Tokenizer(toParse);
    }

    /**
     * Parses the current groovy script block of code to to JavaScript
     */
    public parse (scope?: Scope): string {
        // Get first token of code block
        this.tokenizer.getNextToken();

        // Start with an empty string
        let str = '';

        if (!scope)
            scope = this.scope;

        // Format code
        let parent = scope;
        while ((parent = parent.parent))
            str += '\t';

        // Tokenize
        while (!this.tokenizer.isEnd()) {
            if (this.tokenizer.matchIdentifier('def')) {
                const variable = this.variable(scope);
                str += 'var ' + variable.str;
                scope.elements.push(new Variable(scope, variable.name, variable.type));
            } else if (this.tokenizer.matchIdentifier('if')) {
                str += '\nif ' + this.if(scope);
            } else if (this.tokenizer.match(TokenType.BRACKET_OPEN)) {
                const newScope = new Scope(scope);
                str += '{\n' + this.parse(newScope) + '\n}';
            }
            else {
                this.tokenizer.getNextToken();
            }
        }

        return str;
    }

    public if (scope: Scope): string {
        if (!this.tokenizer.match(TokenType.PARENTHESIS_OPEN))
            throw new Error('if must be followed by an opening parenthesis');

        return '(' + this.expression(scope) + ')';
    }

    /**
     * Parses an expression
     */
    public expression (scope: Scope, left?: Scope): string {
        let str = '';
        let variable = '';

        while (!this.tokenizer.match(TokenType.PARENTHESIS_CLOSE)) {
            // Prevent end of instruction
            if (this.tokenizer.match(TokenType.INSTRUCTION_END)) {
                str += ';';
                break;
            }

            if (this.tokenizer.match(TokenType.PARENTHESIS_OPEN)) {
                // Parenthesis (
                str += this.expression(scope);
                continue;
            } else if ((variable = <string> this.tokenizer.matchIdentifier())) {
                // Identifier:
                // Variable is not defined
                if (!Scope.exists(scope, s => s.name === variable))
                    throw new Error('Variable');

                str += variable;
            } else if (this.tokenizer.match(TokenType.OPERATOR_ASSIGN)) {
                // Assign -= += *= /=
                str += this.tokenizer.currentOperator;
            } else if (this.tokenizer.match(TokenType.OPERATOR)) {
                // Check if operator supported
                if (left && left.type === ScopeElementType.ARRAY)
                    throw new Error('');

                str += ' ' + this.tokenizer.currentOperator + ' ';
            } else {
                str += this.tokenizer.lastString;
                this.tokenizer.getNextToken();
            }
        }

        return str;
    }

    /**
     * Parses a variable definition
     */
    public variable (scope: Scope): { name: string, str: string, type: ScopeElementType } {
        const result = {
            name: '',
            str: '',
            type: ScopeElementType.ANY
        };

        if (!(result.name = <string> this.tokenizer.matchIdentifier()))
            throw new Error('def must be followed by an identifier');

        result.str = result.name;

        let number = '';
        let string = '';
        let identifier = '';

        if (!this.tokenizer.match(TokenType.ASSIGN))
            return result;

        result.str += ' = ';

        if ((number = this.tokenizer.matchNumber())) {
            // A number
            result.str += number;
            result.type = ScopeElementType.NUMBER;
        } else if (this.tokenizer.match(TokenType.ACCESSOR_LEFT)) {
            // An array
            result.str += this.array();
            result.type = ScopeElementType.ARRAY;
        } else if ((string = this.tokenizer.matchString())) {
            // A string
            result.str += string;
            result.type = ScopeElementType.STRING;
        } else if ((identifier = <string> this.tokenizer.matchIdentifier())) {
            // Expression
            result.str += identifier + this.expression(scope, new Variable(scope.parent, identifier, Scope.getType(scope, identifier)));
        }

        if (this.tokenizer.match(TokenType.INSTRUCTION_END))
            result.str += ';';

        return result;
    }

    /**
     * Parses an array expression
     */
    public array (): string {
        let str = '[';

        while (!this.tokenizer.match(TokenType.ACCESSOR_RIGHT)) {
            if (this.tokenizer.match(TokenType.ACCESSOR_LEFT)) {
                str += this.array();
                continue;
            } else {
                str += this.tokenizer.lastString;
            }

            this.tokenizer.getNextToken();
        }

        return str + ']';
    }

    /**
     * Converts a groovy script to JavaScript
     * @param toParse the Groovy string to transpile to JavaScript
     */
    public static convert (toParse: string): string {
        const analyser = new Analyser(toParse);
        return analyser.parse();
    }
}

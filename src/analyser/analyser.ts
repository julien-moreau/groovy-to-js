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
        let identifier = '';
        let accessor = '';

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
                str += '\nif ' + this.condition(scope);
            } else if (this.tokenizer.matchIdentifier('else')) {
                str += ' else' + this.else(scope);
            } else if (this.tokenizer.matchIdentifier('while')) {
                str += 'while ' + this.condition(scope);
            } else if (this.tokenizer.matchIdentifier('for')) {
                str += 'for (' + this.for(scope) + ')';
            } else if (this.tokenizer.matchIdentifier('return')) {
                str += 'return ';
            } else if (this.tokenizer.match(TokenType.BRACKET_OPEN)) {
                const newScope = new Scope(scope);
                str += '{\n' + this.parse(newScope) + '\n}';
            } else if (this.tokenizer.match(TokenType.BRACKET_CLOSE)) {
                return str;
            } else if (this.tokenizer.match(TokenType.ACCESSOR_OPEN)) {
                const array = this.array(scope);
                str += array.str;
            } else if ((identifier = <string> this.tokenizer.matchIdentifier())) {
                str += identifier + ' ' + this.expression(scope);
            } else if ((accessor = this.tokenizer.matchAccessor())) {
                str += this.tokenizer.currentAccessor + this.expression(scope, Scope.findElement(scope, e => e.name === this.tokenizer.currentAccessor));
            } else {
                str += this.tokenizer.lastString;
                this.tokenizer.getNextToken();
            }
        }

        return str;
    }

    /**
     * Parses a condition expression
     * @param scope the if scope
     */
    public condition (scope: Scope): string {
        if (!this.tokenizer.match(TokenType.PARENTHESIS_OPEN))
            throw new Error('if must be followed by an opening parenthesis');

        return '(' + this.expression(scope) + ')';
    }

    /**
     * Parses a else expression
     * @param scope the else scope
     */
    public else (scope: Scope): string {
        if (this.tokenizer.matchIdentifier('if'))
            return ' if ' + this.condition(scope);

        return ' ';
    }

    /**
     * Parses a for expression
     * @param scope the for scope
     */
    public for (scope: Scope): string {
        if (!this.tokenizer.match(TokenType.PARENTHESIS_OPEN))
            throw new Error('for must be followed by an opening parenthesis');

        let str = '';
        let identifier = '';

        if (!(identifier = <string> this.tokenizer.matchIdentifier()))
            throw new Error('A for loop begins with an identifier such as a variable name of a def');

        // Declaration
        if (identifier === 'def') {
            str += 'var ' + this.variable(scope).str;
        } else {
            str = 'var ' + identifier;
        }

        if (this.tokenizer.match(TokenType.ASSIGN)) {
            str += ' = ' + this.expression(scope, new Variable(scope, identifier, ScopeElementType.NUMBER));
        }

        // Condition
        if ((identifier = <string> this.tokenizer.matchIdentifier())) {
            if (identifier === 'in') {
                // in
                return str += ' in ' + this.expression(scope);
            } else {
                str += identifier + this.expression(scope);
            }
        }

        // Operation
        if ((identifier = <string>this.tokenizer.matchIdentifier())) {
            str += identifier + this.expression(scope);
        } else {

        }

        return str;
    }

    /**
     * Parses an expression
     */
    public expression (scope: Scope, left?: Scope): string {
        let str = '';
        let variable = '';
        let number = '';

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
                // Identifier
                str += variable;
            } else if (this.tokenizer.match(TokenType.OPERATOR_ASSIGN)) {
                // Assign -= += *= /=
                str += this.tokenizer.currentOperator;
            } else if (this.tokenizer.match(TokenType.OPERATOR)) {
                // Check if operator supported
                if (left && left.type === ScopeElementType.ARRAY)
                    throw new Error('Operator-assignation are forbidden in JavaScript');

                str += ' ' + this.tokenizer.currentOperator + ' ';
            } else if (this.tokenizer.match(TokenType.RANGE)) {
                // Range, like 0..19 or start..19 or start..end or 0..end
                const range = this.tokenizer.currentRange.split('..');
                str += `range(${range[0]}, ${range[1]})`;
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
        } else if (this.tokenizer.match(TokenType.ACCESSOR_OPEN)) {
            // An array
            const array = this.array(scope, result.name);
            result.str += array.str;
            result.type = array.type;
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
    public array (scope: Scope, name: string = 'undefined'): { str: string, type: ScopeElementType } {
        if (this.tokenizer.match(TokenType.DESCRIPTOR))
            return { str: '{ ' + this.map(scope) + ' }', type: ScopeElementType.MAP };

        let str = '[';
        let identifier = '';

        while (!this.tokenizer.match(TokenType.ACCESSOR_CLOSE)) {
            if (this.tokenizer.match(TokenType.ACCESSOR_OPEN)) {
                const array = this.array(scope);
                str += array.str;
                continue;
            } else if ((identifier = <string> this.tokenizer.matchIdentifier())) {
                // An identifier, then it is a map
                if (this.tokenizer.match(TokenType.DESCRIPTOR)) {
                    return { str: '{ ' + identifier + ': ' + this.map(scope, identifier, name + '.') + ' }', type: ScopeElementType.MAP };
                }

                str += identifier;
            } else {
                str += this.tokenizer.lastString;
                this.tokenizer.getNextToken();
            }
        }

        return { str: str + ']', type: ScopeElementType.ARRAY };
    }

    /**
     * Parses a map expression
     */
    public map (scope: Scope, name: string = '', prefix: string = ''): string {
        let str = '';
        let previousToken = TokenType.UNKNOWN;
        let accessor = prefix + name;

        while (!this.tokenizer.match(TokenType.ACCESSOR_CLOSE)) {
            if (this.tokenizer.match(TokenType.IDENTIFIER)) {
                str += ' ' + this.tokenizer.currentIdentifier;
                name = this.tokenizer.currentIdentifier;
            } else if (this.tokenizer.match(TokenType.ACCESSOR_OPEN)) {
                const array = this.array(scope,  accessor);
                str += array.str;
                scope.elements.push(new Variable(scope, prefix +  name, array.type));
            } else {
                str += this.tokenizer.lastString;
                
                if (previousToken === TokenType.DESCRIPTOR) {
                    str += ' ';
                    name;
                }

                this.tokenizer.getNextToken();
            }

            previousToken = this.tokenizer.currentToken;
        }

        return str;
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

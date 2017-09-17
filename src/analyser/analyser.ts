import Tokenizer from '../tokenizer/tokenizer';
import { TokenType } from '../tokenizer/token-type';

import Scope from './scope';
import Variable, { VariableType } from './scope-variable';

import { operators } from './dictionnary';

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

        // Temporary variables from tokenizer
        let identifier = '';
        let accessor = '';

        if (!scope)
            scope = this.scope;

        // Format code
        let parent = scope;
        while ((parent = parent.parent))
            str += '\t';

        // Tokenize
        while (this.tokenizer.currentToken !== TokenType.END_OF_INPUT) {
            if (this.tokenizer.matchIdentifier('def')) {
                // Variable definition
                const variable = this.variable(scope);
                str += 'var ' + variable.str;
            } else if (this.tokenizer.matchIdentifier('for')) {
                // A for loop
                const loop = this.for(scope);
                str += 'for ' + loop.str;
            } else if (this.tokenizer.matchIdentifier('while')) {
                // A while loop
                str += 'while ' + this.expression(scope);
            } else if (this.tokenizer.matchIdentifier('if')) {
                // A Condition
                str += 'if ' + this.expression(scope);
            } else if (this.tokenizer.matchIdentifier('return')) {
                // Return statement
                str += 'return ' + this.expression(scope);
            } else if (this.tokenizer.match(TokenType.BRACKET_OPEN)) {
                // A new code block, then create a new scope
                const newScope = new Scope(scope);
                str += '{\n' + this.parse(newScope);
            } else if (this.tokenizer.match(TokenType.BRACKET_CLOSE)) {
                // Closing code block
                return str + '}\n';
            } else {
                str += this.expression(scope);
            }
        }

        return str;
    }

    /**
     * Parses an expression
     */
    protected expression (scope: Scope, name?: string): string {
        let str = '';
        let identifier = '';
        let number = '';

        if ((identifier = <string> this.tokenizer.matchIdentifier()) || (identifier = this.tokenizer.matchAccessor())) {
            // Operation on variables ?
            let operator = '';
            let operatorAssign = '';

            // Operator
            if ((operator = this.tokenizer.matchOperator()) || (operatorAssign = this.tokenizer.matchOperatorAssign())) {
                // Left variable
                const left = Variable.find(scope, v => v.name === identifier);
                let right = '';
                let operatorName = operator || operatorAssign;

                if ((right = this.tokenizer.matchNumber())) {
                    // a - 1 for example
                    if (name)
                        Variable.find(scope, v => v.name === name).type = VariableType.NUMBER;
                    
                    let newOperator = '';
                    if ((newOperator = this.tokenizer.matchOperator())) {
                        let recursive = `${operators[operatorName]}(${operators[newOperator]}(${left.name}, ${right}), ${this.expression(scope, name)})`;

                        while ((newOperator = this.tokenizer.matchOperator())) {
                            recursive = `${operators[operatorName]}(${recursive}, ${this.expression(scope, name)})`;
                        }

                        str += recursive;
                    } else if (left.type === VariableType.NUMBER) {
                        str += identifier + ' ' + (operator || operatorAssign) + ' ' + right;
                    } else if (left.type === VariableType.ARRAY) {
                        str += `${operators[operatorName]}(${left.name}, ${right})`;
                    }
                } else if ((right = <string> this.tokenizer.matchIdentifier())) {
                    // a - b for example
                    if (left.type === VariableType.ARRAY) {
                        str += `${operators[operatorName]}(${left.name}, ${right})`;

                        if (name)
                            Variable.find(scope, v => v.name === name).type = VariableType.ARRAY;
                    } else {
                        str += identifier + ' ' + (operator || operatorAssign) + ' ' + right;

                        if (name)
                            Variable.find(scope, v => v.name === name).type = Variable.find(scope, v => v.name === right).type;
                    }
                } else if (this.tokenizer.match(TokenType.ACCESSOR_OPEN)) {
                    // a - [1] for example
                    if (left.type === VariableType.ARRAY) {
                        const array = this.array(scope);
                        str += `${operators[operatorName]}(${left.name}, ${array.str})`;
                    }
                } else if (this.tokenizer.match(TokenType.PARENTHESIS_OPEN)) {
                    // Recursively subtract/add/etc.
                    str += `${operators[operatorName]}(${left.name}, ${this.expression(scope)}`;
                } else {
                    // Operator assign
                    str += identifier + ' ' + (operator || operatorAssign);
                }
            // Assign (=)
            } else if (this.tokenizer.match(TokenType.ASSIGN)) {
                // Assignation
                str += identifier + ' = ' + this.expression(scope, name);
            } else {
                str += identifier;
            }
        } else if (this.tokenizer.match(TokenType.ACCESSOR_OPEN)) {
            // Expressing an array
            const array = this.array(scope);
            str += array.str;
        } else if (this.tokenizer.match(TokenType.PARENTHESIS_OPEN)) {
            // Expression
            str += '(';
            while (!this.tokenizer.match(TokenType.PARENTHESIS_CLOSE)) {
                str += this.expression(scope, name);
            }

            str += ')';
        } else {
            // Just keep
            str += this.tokenizer.lastString;
            this.tokenizer.getNextToken();
        }
        
        return str;
    }

    /**
     * Parses an array (or map)
     * @param scope the scope to add the map and keys 
     * @param name the name of the array or map
     */
    protected array (scope: Scope, name?: string): { str: string, type: VariableType } {
        let str = '[';
        let identifier = '';

        while (!this.tokenizer.isEnd() && !this.tokenizer.match(TokenType.ACCESSOR_CLOSE)) {
            if ((identifier = <string> this.tokenizer.matchIdentifier())) {
                if (this.tokenizer.match(TokenType.DESCRIPTOR)) {
                    // This is a map, not an array
                    return {
                        str: this.map(scope, identifier, name),
                        type: VariableType.MAP
                    };
                }

                str += identifier;
            } else if (this.tokenizer.match(TokenType.ACCESSOR_OPEN)) {
                // Array in array
                const array = this.array(scope, name);
                str += array.str;
            } else {
                // Just add string
                str += this.tokenizer.lastString;
                this.tokenizer.getNextToken();
            }
        }

        return {
            str: str + ']',
            type: VariableType.ARRAY
        };
    }

    /**
     * Parses a map
     * @param scope the scope to add the map and keys 
     * @param key the 
     * @param name 
     */
    protected map (scope: Scope, key: string, name?: string): string {
        let str = `{ ${key}: `;
        let variable: Variable = null;
        let identifier = '';
        let number = '';

        if (name)
            variable = new Variable(scope, `${name}.${key}`, VariableType.ANY);
        
        while (!this.tokenizer.isEnd() && !this.tokenizer.match(TokenType.ACCESSOR_CLOSE)) {
            if (this.tokenizer.match(TokenType.ACCESSOR_OPEN)) {
                // Array or map
                const array = this.array(scope);
                str += array.str;

                if (variable)
                    variable.type = array.type;
            } else if ((identifier = <string> this.tokenizer.matchIdentifier())) {
                // This is a key
                key = identifier;

                if (name)
                    variable = new Variable(scope, `${name}.${key}`, VariableType.ANY);
                
                str += key;
            } else if ((number = this.tokenizer.matchNumber())) {
                if (variable)
                    variable.type = VariableType.NUMBER;

                str += number;
            } else {
                str += this.tokenizer.lastString;
                this.tokenizer.getNextToken();
            }
        }

        return str + ' }';
    }

    /**
     * Parses a for loop
     * @param scope the scope which will contain the for loop variable
     */
    protected for (scope: Scope): { str: string, variable: Variable } {
        if (!this.tokenizer.match(TokenType.PARENTHESIS_OPEN))
            throw new Error('A for loop must be followed by an opening parenthesis');

        const result = {
            str: '(',
            variable: null
        };

        // A def ?
        if (this.tokenizer.matchIdentifier('def')) {
            result.str += 'var ';
        } else {
            result.str += 'var ';
        }

        // Variable
        const variable = this.variable(scope);
        result.str += variable.str;
        result.variable = variable.variable;

        if (this.tokenizer.matchIdentifier('in')) {
            result.str += ' in ';

            let right = '';
            if ((right = this.tokenizer.matchRange())) {
                const range = right.split('..');
                result.str += `range(${range[0]}, ${range[1]})`;
            } else if (this.tokenizer.match(TokenType.ACCESSOR_OPEN)) {
                // It is an array
                const array = this.array(scope);
                result.str += array.str;
            }
        }

        // End
        if (this.tokenizer.match(TokenType.INSTRUCTION_END))
            result.str += ';';

        return result;
    }

    /**
     * Parses a variable definition
     * @param scope the scope which will contain the variable
     */
    protected variable (scope: Scope): { str: string, variable: Variable } {
        let name = '';
        if (!(name = <string> this.tokenizer.matchIdentifier()))
            throw new Error('A variable definition must be followed by an identifier');

        const result = {
            str: name,
            variable: new Variable(scope, name, VariableType.ANY)
        };

        if (!this.tokenizer.match(TokenType.ASSIGN))
            return result;

        result.str += ' = ';

        // Value
        let number = '';
        let range = '';

        let parenthesised = this.tokenizer.match(TokenType.PARENTHESIS_OPEN);

        if ((number = this.tokenizer.matchNumber())) {
            // Number
            result.str += number;
            result.variable.type = VariableType.NUMBER;
        } else if ((range = this.tokenizer.matchRange())) {
            // Range
            let rangeResult = '';
            result.variable.type = VariableType.ARRAY;

            const split = range.split('..');
            let end = parseInt(split[1]);

            // 0..19 + 1 -> 0..20;
            // (0..19) + 1 -> [0, ..., 19] + 1 -> [0, ..., 20];
            if (parenthesised && !this.tokenizer.match(TokenType.PARENTHESIS_CLOSE))
                throw new Error('A range must be parenthetized once a parenthesis opened');

            let operator = '';
            if ((operator = this.tokenizer.matchOperator())) {
                if (parenthesised) {
                    rangeResult = `${operators[operator]}(range(${split[0]}, ${split[1]}), ${this.expression(scope, name)})`;

                    while ((operator = this.tokenizer.matchOperator())) {
                        rangeResult = `${operators[operator]}(${rangeResult}, ${this.expression(scope, name)})`;
                    }
                } else {
                    let expr = this.expression(scope, name);
                    while ((operator = this.tokenizer.matchOperator())) {
                        expr += operator + ' ' + this.expression(scope, name);
                    }
                    rangeResult = `range(${split[0]}, ${end} + ${expr})`;
                }
            } else {
                rangeResult = `range(${split[0]}, ${split[1]})`;
            }

            result.str += rangeResult;
        } else if (this.tokenizer.match(TokenType.ACCESSOR_OPEN)) {
            const array = this.array(scope, name);
            result.variable.type = array.type;

            let operator = '';
            if ((operator = this.tokenizer.matchOperator())) {
                array.str = `${operators[operator]}(${array.str}, ${this.expression(scope, name)})`;
            }

            while ((operator = this.tokenizer.matchOperator())) {
                array.str = `${operators[operator]}(${array.str}, ${this.expression(scope, name)})`;
            }
            
            result.str += array.str;
        } else {
            result.str += this.expression(scope, name);
        }

        // End instruction
        if (this.tokenizer.match(TokenType.INSTRUCTION_END))
            result.str += ';';

        return result;
    }

    /**
     * Converts a groovy script to JavaScript
     * @param toParse the Groovy string to transpile to JavaScript
     */
    public static convert (toParse: string): string {
        const analyser = new Analyser(toParse + '\n');
        return analyser.parse();
    }
}

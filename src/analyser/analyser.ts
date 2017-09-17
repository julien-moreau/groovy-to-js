import Tokenizer from '../tokenizer/tokenizer';
import { TokenType } from '../tokenizer/token-type';

import Scope from './scope';
import Variable, { VariableType } from './scope-variable';

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
        while (this.tokenizer.currentToken !== TokenType.END_OF_INPUT) {
            if (this.tokenizer.matchIdentifier('def')) {
                const variable = this.variable(scope);
                str += 'var ' + variable.str;
            } else if (this.tokenizer.matchIdentifier('for')) {
                const loop = this.for(scope);
                str += 'for ' + loop.str;
            } else if (this.tokenizer.matchIdentifier('while')) {
                str += 'while ' + this.expression(scope);
            } else if (this.tokenizer.matchIdentifier('if')) {
                str += 'if ' + this.expression(scope);
            } else if (this.tokenizer.matchIdentifier('return')) {
                str += 'return ' + this.expression(scope);
            } else if (this.tokenizer.match(TokenType.BRACKET_OPEN)) {
                const newScope = new Scope(scope);
                str += '{\n' + this.parse(newScope);
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

        if ((identifier = <string> this.tokenizer.matchIdentifier())) {
            // Operation on variables ?
            let operator = '';
            let operatorAssign = '';

            if ((operator = this.tokenizer.matchOperator()) || (operatorAssign = this.tokenizer.matchOperatorAssign())) {
                // Left variable
                const left = Variable.find(scope, v => v.name === identifier);
                let right = '';

                if ((right = this.tokenizer.matchNumber())) {
                    // a - 1 for example
                    if (name)
                        Variable.find(scope, v => v.name === name).type = VariableType.NUMBER;
                    
                    let newOperator = '';
                    if ((newOperator = this.tokenizer.matchOperator())) {
                        let rec = `subtract(subtract(${left.name}, ${right}), ${this.expression(scope)})`;
                        while ((newOperator = this.tokenizer.matchOperator())) {
                            rec = `subtract(${rec}, ${this.expression(scope)})`;
                            newOperator = this.tokenizer.matchOperator();
                        }

                        str += rec;
                    } else if (left.type === VariableType.NUMBER) {
                        str += identifier + ' ' + (operator || operatorAssign) + ' ' + right;
                    } else if (left.type === VariableType.ARRAY) {
                        str += `subtract(${left.name}, ${right})`;
                    }
                } else if ((right = <string> this.tokenizer.matchIdentifier())) {
                    // a - b for example
                    if (left.type === VariableType.ARRAY) {
                        str += `subtract(${left.name}, ${right})`;

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
                        str += `subtract(${left.name}, ${array.str})`;
                    }
                } else if (this.tokenizer.match(TokenType.PARENTHESIS_OPEN)) {
                    // Recursively subtract/add/etc.
                    str += `subtract(${left.name}, ${this.expression(scope)}`;
                } else {
                    // Operator assign
                    str += identifier + ' ' + (operator || operatorAssign);
                }
            } else if (this.tokenizer.match(TokenType.ASSIGN)) {
                // Assignation
                str += identifier + ' = ' + this.expression(scope);
            } else {
                str += identifier;
            }
        } else if (this.tokenizer.match(TokenType.ACCESSOR_OPEN)) {
            // Array
            const array = this.array(scope);
            str += array.str;
        } else {
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
        if ((number = this.tokenizer.matchNumber())) {
            result.str += number;
            result.variable.type = VariableType.NUMBER;
        } else if (this.tokenizer.match(TokenType.ACCESSOR_OPEN)) {
            const array = this.array(scope, name);
            result.str += array.str;
            result.variable.type = array.type;
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

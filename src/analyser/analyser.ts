import Tokenizer from '../tokenizer/tokenizer';
import { TokenType } from '../tokenizer/token-type';

import Scope from './scope';
import Variable, { VariableType } from './scope-variable';

import { operators, keywords, functions, properties } from './dictionnary';

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
        while (this.tokenizer.currentToken !== TokenType.END_OF_INPUT) {
            // Code block
            if (this.tokenizer.match(TokenType.BRACKET_OPEN)) {
                const newScope = new Scope(scope);
                str += `{\n ${this.parse(newScope)} \n`;
            }
            // For loop
            else if (this.tokenizer.matchIdentifier('for')) {
                const newScope = new Scope(scope);
                str += `for ${this.for(newScope)}`;
                str += `{\n ${this.parse(newScope)} \n`;
            }
            // If condition
            else if (this.tokenizer.matchIdentifier('if')) {
                const newScope = new Scope(scope);
                str += `if (${this.parse(newScope)}`;
            }
            // Other
            else {
                str += `${this.expression(scope).str} `;
            }
        }

        return str;
    }

    /**
     * Parses an expression
     * @param scope the scope of the expression
     * @param name 
     */
    protected expression (scope: Scope): { str: string, variable: Variable } {
        const result = {
            str: '',
            variable: null
        };
        
        let identifier = '';
        let range = '';
        let accessor = '';

        /**
        // Identifier ?
        */
        if ((identifier = <string> this.tokenizer.matchIdentifier())) {
            // Check keyword
            if (keywords[identifier])
                identifier = keywords[identifier];

            result.variable = Variable.find(scope, v => v.name === identifier);

            // If variable definition ?
            let variableName = '';
            let lastIdentifier = identifier;

            if (identifier === 'var' && (variableName = <string> this.tokenizer.matchIdentifier())) {
                result.str += identifier;
                result.str += ` ${variableName} `;

                const variable = new Variable(scope, variableName, VariableType.ANY);

                // Assign (=) ? Then get the variable's type
                if (this.tokenizer.match(TokenType.ASSIGN)) {
                    // Check type
                    let right = '';

                    // Number ?
                    if ((right = this.tokenizer.matchNumber())) {
                        variable.type = VariableType.NUMBER;
                        result.str += `= ${right}`;
                    }
                    // Array ?
                    else if (this.tokenizer.match(TokenType.ACCESSOR_OPEN)) {
                        const array = this.array(scope, variableName);
                        variable.type = array.type;

                        const left = new Variable(scope, array.str, VariableType.ARRAY);
                        result.str += `= ${this.operators(scope, left)}`;
                    }
                    // Idenfifier ?
                    else if ((identifier = <string> this.tokenizer.matchIdentifier()) || (identifier = this.tokenizer.matchAccessor())) {
                        const left = Variable.find(scope, v => v.name === identifier);
                        variable.type = left.type;

                        const operators = this.operators(scope, left);
                        if (operators === identifier) {
                            result.str += `= ${identifier}`;
                        } else {
                            result.str += `= ${operators}`;
                        }
                    }
                    // Range ?
                    else if ((right = this.tokenizer.matchRange())) {
                        result.str += `= ${this.range(scope, right)}`;
                        variable.type = VariableType.ARRAY;
                    }
                    // String ?
                    else if ((right = this.tokenizer.matchString())) {
                        result.str += `= ${right}`;
                        variable.type = VariableType.STRING;
                    }
                    // Expression (expression) ?
                    else {
                        const expr = this.expression(scope);
                        result.str += `= ${expr.str}`;
                    }
                }

                if (this.tokenizer.match(TokenType.INSTRUCTION_END)) {
                    result.str += ';';
                }
            }
            // Assign expression ?
            else if (this.tokenizer.match(TokenType.ASSIGN)) {
                result.str += `${identifier} = `;
                
                if ((identifier = <string> this.tokenizer.matchIdentifier())) {
                    // Maybe an array
                    const left = Variable.find(scope, v => v.name === identifier);
                    result.str += this.operators(scope, left);
                } else {
                    // Supported natively by JavaScript
                    result.str += this.tokenizer.lastString;
                    this.tokenizer.getNextToken();
                }
            }
            // Identifier ?
            else if ((identifier = <string> this.tokenizer.matchIdentifier())) {
                const left = Variable.find(scope, v => v.name === identifier);
                result.str += ` ${lastIdentifier} ${this.operators(scope, left)}`;
            }
            // Accessor ?
            else if ((accessor = this.tokenizer.matchAccessor())) {
                const left = Variable.find(scope, v => v.name === accessor);
                result.str += ` ${lastIdentifier} ${this.operators(scope, left)}`;
            }
            // Just add ?
            else {
                // If a variable is used
                if (result.variable) {
                    const operators = this.operators(scope, result.variable);

                    result.variable.name = operators;
                    result.str += operators;
                }
                // Just a keyword
                else {
                    result.str += lastIdentifier;
                }
            }
        }
        /**
        // Array ?
        */
        else if (this.tokenizer.match(TokenType.ACCESSOR_OPEN)) {
            const array = this.array(scope);
            result.str += array.str;
        }
        /**
        // Range ?
        */
        else if ((range = this.tokenizer.matchRange())) {
            const rangeStr = this.range(scope, range);

            result.variable = new Variable(scope, rangeStr, VariableType.ARRAY);
            result.str += rangeStr;
        }
        /**
        // Parenthesis open: (expression) ?
        */
        else if (this.tokenizer.match(TokenType.PARENTHESIS_OPEN)) {
            let exprStr = '(';
            let hasArray = false;

            while (!this.tokenizer.match(TokenType.PARENTHESIS_CLOSE)) {
                const expr = this.expression(scope);
                if (expr.variable && expr.variable.type === VariableType.ARRAY) {
                    exprStr += this.operators(scope, expr.variable);
                    hasArray = true;
                }
                else
                    exprStr += expr.str;
            }

            exprStr+= ')';

            if (hasArray) {
                const left = new Variable(scope, exprStr, VariableType.ARRAY);
                exprStr = this.operators(scope, left);
            }
            result.str += exprStr;
        }
        /**
        // Accessor ?
        */
        else if ((accessor = this.tokenizer.matchAccessor())) {
            let left = Variable.find(scope, v => v.name === accessor);

            // A function ?
            if (!left) {
                const fn = accessor.substr(accessor.lastIndexOf('.') + 1);

                accessor = accessor.substr(0, accessor.lastIndexOf('.'));
                left = Variable.find(scope, v => v.name === accessor);
                if (left.type === VariableType.ARRAY) {
                    let method = functions.array[fn];
                    
                    // Property ?
                    if (!method) {
                        method = properties.array[fn];
                        if (method) {
                            // Remove function call
                            while (!this.tokenizer.match(TokenType.PARENTHESIS_CLOSE)) {
                                this.tokenizer.getNextToken();
                            }
                        }
                    }

                    accessor += `.${method}`;
                }
            }
            // Operators ?
            else {
                accessor = this.operators(scope, left);
            }

            result.str += accessor;
        }
        /**
        // Supported by JavaScript, just add token
        */
        else {
            result.str += this.tokenizer.lastString;
            this.tokenizer.getNextToken();
        }

        return result;
    }

    /**
     * Parses a for loop
     * @param scope: the new scope created by the loop
     */
    protected for (scope: Scope): string {
        if (!this.tokenizer.match(TokenType.PARENTHESIS_OPEN))
            throw new Error('A for keyword must be followed by an opened parenthesis');

        let str = '(';

        if (!this.tokenizer.matchIdentifier('def')) {
            str += 'var ';
        } else {
            str += 'var ';
        }

        // Variable
        let identifier = '';
        if ((identifier = <string> this.tokenizer.matchIdentifier())) {
            str += identifier;

            const variable = new Variable(scope, identifier, VariableType.ANY);

            // Variable type
            if (this.tokenizer.match(TokenType.ASSIGN)) {
                str += ' = ';
            }

            if (this.tokenizer.matchIdentifier('in')) {
                str += ' in ';
            }

            let right = '';
            // Number ?
            if ((right = this.tokenizer.matchNumber())) {
                variable.type = VariableType.NUMBER;
            }
            // Range ?
            else if ((right = this.tokenizer.matchRange())) {
                variable.type = VariableType.NUMBER;
                right = this.range(scope, right);
            }
            // String ?
            else if ((right = this.tokenizer.matchString())) {
                variable.type = VariableType.STRING;
            }
            // Array ?
            else if (this.tokenizer.match(TokenType.ACCESSOR_OPEN)) {
                const array = this.array(scope);
                right = array.str;
            }
            // Identifier
            else if ((right = <string> this.tokenizer.matchIdentifier())) {
                const otherVariable = Variable.find(scope, v => v.name === right);
                if (otherVariable.type === VariableType.ARRAY)
                    variable.type = VariableType.NUMBER;
                else
                    variable.type = VariableType.STRING;
            }

            str += right;
        }

        // Instructions in "for"
        while (!this.tokenizer.match(TokenType.PARENTHESIS_CLOSE)) {
            str += this.expression(scope).str;
        }

        return str + ')';
    }

    /**
     * Creates a new range
     * @param scope the scope of the range
     * @param range the range string
     */
    protected range (scope: Scope, range: string): string {
        let str = '';
        const split = range.split('..');

        let operator = '';
        while ((operator = this.tokenizer.matchOperator())) {
            split[1] += `${operator} ${this.expression(scope).str}`;
        }

        return `range(${split[0]}, ${split[1]})`
    }

    /**
     * Checks operations on arrays (or not)
     * @param scope the scope of operation(s)
     * @param left the left variable
     */
    protected operators (scope: Scope, left: Variable): string {
        if (!left || left.type !== VariableType.ARRAY)
            return left.name;
        
        let str = left.name;

        let operator = '';
        let operatorAssign = '';
        let right = '';

        let identifier = '';

        while ((operator = this.tokenizer.matchOperator()) || (operatorAssign = this.tokenizer.matchOperatorAssign())) {
            const fn = operators[operator || operatorAssign];

            // Number
            if ((right = this.tokenizer.matchNumber())) {
                str = `${fn}(${str}, ${right})`;
            }
            // Array
            else if (this.tokenizer.match(TokenType.ACCESSOR_OPEN)) {
                const array = this.array(scope);
                str = `${fn}(${str}, ${array.str})`;
            }
            // Identifier
            else if ((right = <string> this.tokenizer.matchIdentifier())) {
                str = `${fn}(${str}, ${right})`;
            }
            // Expression
            else {
                str = `${fn}(${str}, ${this.expression(scope).str})`;
            }
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

        while (!this.tokenizer.match(TokenType.ACCESSOR_CLOSE)) {
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
     * @param key the current map key parsed by "array()"
     * @param name the prefix name of the keys
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
     * Converts a groovy script to JavaScript
     * @param toParse the Groovy string to transpile to JavaScript
     */
    public static convert (toParse: string, scope?: Scope): string {
        const analyser = new Analyser(toParse + '\n');
        return analyser.parse(scope);
    }
}

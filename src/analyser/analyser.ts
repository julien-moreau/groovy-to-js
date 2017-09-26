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
            // End code block
            else if (this.tokenizer.match(TokenType.BRACKET_CLOSE)) {
                return str + '}';
            }
            // For loop
            else if (this.tokenizer.matchIdentifier('for')) {
                const newScope = new Scope(scope);
                str += `for ${this.for(newScope)}`;
                str += `{\n ${this.parse(newScope)} \n`;
            }
            // While loop
            else if (this.tokenizer.matchIdentifier('while')) {
                const newScope = new Scope(scope);
                const expr = this.expression(scope);

                str += `while ${expr.str}`;
                str += `{\n ${this.parse(newScope)} \n`;
            }
            // If condition
            else if (this.tokenizer.matchIdentifier('if')) {
                const newScope = new Scope(scope);
                str += `if (${this.parse(newScope)}`;
            }
            // Return statement
            else if (this.tokenizer.matchIdentifier('return')) {
                str += `return ${this.expression(scope).str}`;
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
    protected expression (scope: Scope, previous?: string): { str: string, variable: Variable } {
        const result = {
            str: '',
            variable: null
        };
        
        let right = '';

        // Identifier ?
        if ((right = <string> this.tokenizer.matchIdentifier())) {
            if (keywords[right])
                right = keywords[right];

            // Variable declaration ?
            if (right === 'var') {
                const variableName = <string> this.tokenizer.matchIdentifier();
                result.variable = new Variable(scope, variableName, VariableType.ANY);

                if (this.tokenizer.match(TokenType.ASSIGN)) {
                    const expr = this.expression(scope, variableName);
                    
                    result.variable.type = expr.variable.type;
                    result.str = `var ${variableName} = ${this.operators(scope, expr.variable)}`;

                    expr.variable.remove(); // Remove the temp variable
                }
                else
                    result.str = `var ${variableName}`;

                if (this.tokenizer.match(TokenType.INSTRUCTION_END))
                    result.str += ';';
            }
            // Just add ?
            else {
                result.variable = Variable.find(scope, v => v.name === right);
                if (result.variable)
                    result.str = this.operators(scope, result.variable);
                else
                    result.str = right;

                result.variable = new Variable(scope, result.str, result.variable ? result.variable.type : VariableType.ANY);
            }
        }
        // Number or times ?
        else if ((right = this.tokenizer.matchNumber())) {
            const number = right;

            if (right[right.length - 1] === '.' && (right = <string> this.tokenizer.matchIdentifier())) {
                result.variable = new Variable(scope, right, VariableType.FUNCTION);
                result.str += `${right}(${number.substr(0, number.length - 1)}, ${this.expression(scope).str})`;
            }
            else {
                result.variable = new Variable(scope, number, VariableType.NUMBER);
                result.str = this.operators(scope, result.variable);
            }
        }
        // String ?
        else if ((right = this.tokenizer.matchString())) {
            result.variable = new Variable(scope, right, VariableType.STRING);
            result.str = this.operators(scope, result.variable);
        }
        // Array ?
        else if (this.tokenizer.match(TokenType.ACCESSOR_OPEN)) {
            const array = this.array(scope, previous);

            result.variable = new Variable(scope, array.str, array.type);
            result.str = this.operators(scope, result.variable);

            result.variable.remove();
            result.variable = new Variable(scope, result.str, result.variable.type);
        }
        // Function/Closure ?
        else if (this.tokenizer.match(TokenType.BRACKET_OPEN)) {
            const fn = this.func(scope);
            result.variable = new Variable(scope, fn, VariableType.FUNCTION);
            result.str = fn;
        }
        // Accessor ?
        else if ((right = this.tokenizer.matchAccessor())) {
            const accessor = this.accessor(scope, right);
            const variable = Variable.find(scope, v => v.name === accessor);

            result.variable = variable || new Variable(scope, accessor, VariableType.ANY);
            result.str = this.operators(scope, result.variable);

            if (!variable)
                result.variable.remove();

            result.variable = new Variable(scope, result.str, result.variable.type);
            result.variable.remove();

            // Array accessor ?
            if (this.tokenizer.match(TokenType.ACCESSOR_OPEN)) {
                result.str += this.array(scope).str;
            }
        }
        // Range ?
        else if ((right = this.tokenizer.matchRange())) {
            const split = right.split('..');

            while ((right = this.tokenizer.matchOperator())) {
                const expr = this.expression(scope);
                split[1] += ` ${right} ${expr.str}`;
            }

            const range = `range(${split[0]}, ${split[1]})`;

            result.variable = new Variable(scope, range, VariableType.ARRAY);
            result.str = range;
        }
        // Parenthetized expression ?
        else if (this.tokenizer.match(TokenType.PARENTHESIS_OPEN)) {
            result.str = '(';

            while (!this.tokenizer.match(TokenType.PARENTHESIS_CLOSE)) {
                const expr = this.expression(scope, previous);
                const variable = new Variable(scope, expr.str, expr.variable ? expr.variable.type : VariableType.ANY);

                result.str += this.operators(scope, variable);
                result.variable = expr.variable;

                variable.remove();
            }

            result.str += ')';
        }
        // Just add token
        else {
            result.str += this.tokenizer.lastString;
            this.tokenizer.getNextToken();
        }

        return result;
    }

    /**
     * Parses a function
     * @param scope the scope of the function
     */
    protected func (scope: Scope): string {
        let str = '';
        let params: string = null;

        const newScope = new Scope(scope);
        const variable = new Variable(newScope, 'it', VariableType.ANY);

        while (!this.tokenizer.match(TokenType.BRACKET_CLOSE)) {
            // Pointer ? (then, params)
            if (this.tokenizer.match(TokenType.POINTER)) {
                params = str;

                // Register variables in scope
                const split = params.split(',');
                split.forEach(s => new Variable(newScope, s, VariableType.ANY));

                str = '';
            }
            // Other ?
            else {
                const expr = this.expression(newScope);
                str += expr.str;
            }
        }

        return `function (${params || 'it'}) {
            ${str}
        }`;
    }

    /**
     * Parses an accessor (a.size() or just a.something)
     * @param scope the scope of the accessor
     * @param accessor the accessor name
     */
    protected accessor (scope: Scope, accessor: string): string {
        let variable = Variable.find(scope, v => v.name === accessor);
        let found = variable !== null;

        const lastDot = accessor.lastIndexOf('.');
        const prev = accessor.substr(0, lastDot);
        const next = accessor.substr(lastDot + 1, accessor.length);

        if (!variable) {
            variable = Variable.find(scope, v => v.name === prev);
            if (!variable)
                throw new Error(`Variable named "${prev}" was not declared`);
        }

        // Assign ?
        if (this.tokenizer.match(TokenType.ASSIGN)) {
            const expr = this.expression(scope, accessor);

            if (!found)
                new Variable(scope, accessor, expr.variable.type);
            else
                variable.type = expr.variable.type;

            accessor = `${accessor} = ${expr.str}`;
            expr.variable.remove(); // Remove the temp variable

            if (this.tokenizer.match(TokenType.INSTRUCTION_END))
                accessor += ';';
        }
        // Method call ?
        else {
            let fn = 
                variable.type === VariableType.ARRAY ? functions.array[next] :
                variable.type === VariableType.MAP ? functions.map[next] : null;

            // Property (.length, etc.) ?
            if (!fn) {
                let fn = 
                    variable.type === VariableType.ARRAY ? properties.array[next] : null;

                if (!fn)
                    accessor = `${prev}.${next}`;
                else {
                    accessor = `${prev}.${fn}`;

                    // Avoid parenthesis
                    while (!this.tokenizer.match(TokenType.PARENTHESIS_CLOSE))
                        this.tokenizer.getNextToken();
                }
            }
            // Method found
            else {
                if (typeof fn === 'string') {
                    // Simple method call with parenthetized expression
                    accessor = `${prev}.${fn}${this.expression(scope).str}`;
                } else {
                    // Avoid parenthesis
                    if (this.tokenizer.match(TokenType.PARENTHESIS_OPEN)) {
                        while (!this.tokenizer.match(TokenType.PARENTHESIS_CLOSE))
                            this.tokenizer.getNextToken();
                    }
                    
                    accessor = `${prev}.${fn.name}(${this.expression(scope).str})`;
                }
            
            }
        }

        return accessor;
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
            let fn = operators[operator || operatorAssign];

            if (!fn) {
                str = `${str}${operator}${this.expression(scope).str}`;
                continue;
            }

            if (operatorAssign)
                fn = `${left.name} = ${fn}`;

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

        str += ']';

        // Direct method call ?
        if (this.tokenizer.match(TokenType.ACCESSOR)) {
            const fn = <string> this.tokenizer.matchIdentifier();
            const variable = new Variable(scope, `${str}.${fn}`, VariableType.ARRAY);
            str = this.accessor(scope, `${str}.${fn}`);
        }

        return {
            str: str,
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

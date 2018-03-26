import Tokenizer from '../tokenizer/tokenizer';
import { TokenType } from '../tokenizer/token-type';

import Scope from './scope';
import Variable, { VariableType } from './scope-variable';

import { operators, keywords, functions, properties, types } from './dictionnary';

import * as beautifier from 'js-beautify';

export default class Analyser {
    // Public members
    public tokenizer: Tokenizer;
    public scope: Scope = new Scope(null);

    /**
     * Constructor
     * @param toParse The groovy script to parse
     */
    constructor (toParse: string, skipCommentsAndNewLines: boolean = false) {
        this.tokenizer = new Tokenizer(toParse);
        this.tokenizer.skipCommentsAndNewLines = skipCommentsAndNewLines;

        // Get first token of code block
        this.tokenizer.getNextToken();
    }

    /**
     * Parses the current groovy script block of code to to JavaScript
     */
    public parse (scope?: Scope): string {
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
                str += this.parse(newScope);
            }
            // While loop
            else if (this.tokenizer.matchIdentifier('while')) {
                const newScope = new Scope(scope);
                const expr = this.expression(scope);

                str += `while ${expr.str}`;
                str += this.parse(newScope);
            }
            // If condition
            else if (this.tokenizer.matchIdentifier('if')) {
                const newScope = new Scope(scope);
                str += `if ${this.parse(newScope)}`;
            }
            // Return statement
            else if (this.tokenizer.matchIdentifier('return')) {
                str += `return ${this.expression(scope).str}`;
            }
            // Switch
            else if (this.tokenizer.matchIdentifier('switch')) {
                str += `switch ${this.expression(scope).str}`;
            }
            // Other
            else {
                str += `${this.expression(scope).str} `;
            }
        }

        // TEMPORARY REPLACE SPACESHIP WITH REGEXP
        // UNTIL WE GET A BETTER "operators()" FUNCTION
        const ITEM = '[a-zA-Z0-9_\-]*';
        const GET_ITEM = `\\s*(${ITEM})\\s*`;
        const ss = new RegExp(`${GET_ITEM}<=>${GET_ITEM}`, 'g');
        str = str.replace(ss, 'spaceship($1, $2)');
        return str;
    }

    /**
     * Parses an expression
     * @param scope the scope of the expression
     * @param name 
     */
    protected expression (scope: Scope, previous?: string): { str: string, variable: Variable } {
        let result = {
            str: '',
            variable: null
        };
        
        let right = '';

        // If previous (skip comments and new lines)
        while (previous && this.tokenizer.currentToken === TokenType.LINE_END ||this.tokenizer.currentToken === TokenType.COMMENT) {
            result.str += this.tokenizer.lastString;
            this.tokenizer.getNextToken();
        }

        // Identifier ?
        if ((right = <string> this.tokenizer.matchIdentifier())) {
            if (keywords[right])
                right = keywords[right];

            // Variable declaration ?
            if (right === 'var') {
                const variableName = <string> this.tokenizer.matchIdentifier();
                result.variable = new Variable(scope, variableName, VariableType.ANY);

                if (this.tokenizer.match(TokenType.ASSIGN)) {
                    let ctor = this.tokenizer.matchIdentifier('new');
                    let expr = this.expression(scope, variableName);
                    
                    if (expr.str === '()')
                        expr = this.expression(scope, variableName);

                    if (expr.variable) {
                        result.variable.type = expr.variable.type;
                        result.str += `var ${variableName} = ${ctor ? 'new' : ''} ${this.operators(scope, expr.variable)}`;

                        expr.variable.remove(); // Remove the temp variable
                    }
                }
                else
                    result.str += `var ${variableName}`;

                if (this.tokenizer.match(TokenType.INSTRUCTION_END))
                    result.str += ';';
            }
            // Class declaration ?
            else if (right === 'class') {
                const classResult = this.class(scope);
                result.str = classResult.ctor + classResult.prototype;
                result.variable = classResult.variable;
            }
            // New instance ?
            else if (right === 'new') {
                const expr = this.expression(scope, previous);
                result.str += `new ${expr.str}`;
                result.variable = Variable.find(scope, v => v.name === expr.str);
            }
            // Not declaration
            else {
                // Type casting ?
                if (types.indexOf(right) !== -1) {
                    result.str = '';
                }
                // Method call ?
                else if (functions.global[right]) {
                    const fn = functions.global[right];
                    result.str += `${fn}(${this.expression(scope, previous).str})`;
                }
                // Just add
                else {
                    result.variable = Variable.find(scope, v => v.name === right);
                    if (result.variable) {
                        result.str += this.operators(scope, result.variable);

                        if (previous)
                            result.variable = new Variable(scope, result.str, result.variable ? result.variable.type : VariableType.ANY);
                    }
                    else {
                        // New variable on the fly ?
                        if (this.tokenizer.match(TokenType.ASSIGN)) {
                            const expr = this.expression(scope);
                            result.str += `var ${right} = ${expr.str}`;
                            result.variable = new Variable(scope, right, expr.variable.type);
                        }
                        else {
                            //result.str += right;
                            //result.variable = new Variable(scope, result.str, result.variable ? result.variable.type : VariableType.ANY);

                            const variable = new Variable(scope, right, result.variable ? result.variable.type : VariableType.ANY);
                            const str = this.operators(scope, variable);

                            result.str += str;
                            result.variable = variable;
                            result.variable.name = str;
                        }
                    }
                }
            }
        }
        // Number or times ?
        else if ((right = this.tokenizer.matchNumber())) {
            const number = right;

            if (right[right.length - 1] === '.' && (right = <string> this.tokenizer.matchIdentifier())) {
                result.variable = new Variable(scope, right, VariableType.FUNCTION);
                result.str += `${right}(${number.substr(0, number.length - 1)}, ${this.expression(scope).str})\n`;
                result.variable.remove();
            }
            else {
                result.variable = new Variable(scope, number, VariableType.NUMBER);
                result.str += this.operators(scope, result.variable);
                result.variable.remove();
            }
        }
        // String ?
        else if ((right = this.tokenizer.matchString())) {
            result.variable = new Variable(scope, right, VariableType.STRING);

            // Prevent strings with variable access (i.e 'first name: ${name}' for example)
            if (result.variable.name.match(/\$\{(.*)\}/))
                result.variable.name = '`' + result.variable.name.substr(1, result.variable.name.length - 2) + '`';

            const str = this.operators(scope, result.variable);
            result.variable.name = str;
            result.str += str;
        }
        // Array ?
        else if (this.tokenizer.match(TokenType.ACCESSOR_OPEN)) {
            const array = this.array(scope, previous);

            result.variable = new Variable(scope, array.str, array.type);
            result.str += this.operators(scope, result.variable);

            result.variable.remove();
            result.variable = new Variable(scope, result.str, result.variable.type);
        }
        // Function/Closure ?
        else if (this.tokenizer.match(TokenType.BRACKET_OPEN)) {
            const fn = this.func(scope);
            result.variable = new Variable(scope, fn, VariableType.FUNCTION);
            result.str += fn;
        }
        // Accessor ?
        else if ((right = this.tokenizer.matchAccessor())) {
            const accessor = this.accessor(scope, right);
            const variable = accessor.variable || Variable.find(scope, v => v.name === accessor.str);

            result.variable = variable || new Variable(scope, accessor.str, VariableType.ANY);
            result.str += this.operators(scope, result.variable);

            if (!variable)
                result.variable.remove();

            result.variable = new Variable(scope, result.str, result.variable.type);
            result.variable.remove();

            // Array accessor ?
            while (this.tokenizer.match(TokenType.ACCESSOR_OPEN)) {
                result.str += this.array(scope).str;
                result.variable.name = result.str;
                result.variable.type = VariableType.ANY;
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
            result.str += '(';

            while (!this.tokenizer.match(TokenType.PARENTHESIS_CLOSE)) {
                const expr = this.expression(scope, previous);
                const variable = new Variable(scope, expr.str, expr.variable ? expr.variable.type : VariableType.ANY);

                result.str += this.operators(scope, variable);
                result.variable = expr.variable;

                variable.remove();
            }

            result.str += ')';

            /*
            if (result.str === '()')
                result = this.expression(scope, previous);
            */
        }
        // Assign ? (=)
        else if (this.tokenizer.match(TokenType.ASSIGN)) {
            const expr = this.expression(scope);

            result.variable = expr.variable;
            result.str += `= ${expr.str}`;
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
        let bracketCount = 1;

        const newScope = new Scope(scope);
        const variable = new Variable(newScope, 'it', VariableType.ANY);

        while (bracketCount > 0) {
            // Brack close ?
            if (this.tokenizer.match(TokenType.BRACKET_OPEN)) {
                bracketCount++;
                str += '{';
            }
            else if (this.tokenizer.match(TokenType.BRACKET_CLOSE)) {
                bracketCount--;

                if (bracketCount > 0)
                    str += '}';
            }
            // Pointer ? (then, params)
            else if (this.tokenizer.match(TokenType.POINTER)) {
                params = str;

                // Register variables in scope
                const split = params.split(',');
                split.forEach(s => new Variable(newScope, s, VariableType.ANY));

                str = '';
            }
            // Switch
            else if (this.tokenizer.matchIdentifier('switch')) {
                str += `switch ${this.expression(newScope).str}`;
            }
            // Else ?
            else if (this.tokenizer.matchIdentifier('else')) {
                str += 'else ';
            }
            // Return statement ?
            else if (this.tokenizer.matchIdentifier('return')) {
                str += 'return ';
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
     * Parses a class
     */
    protected class (scope: Scope): { ctor: string, prototype: string, variable: Variable } {
        const result = {
            ctor: '',
            prototype: '',
            variable: new Variable(scope, '', VariableType.CLASS)
        }

        // Class name
        let name = '';
        let parameters: string = null;

        if (!(name = <string> this.tokenizer.matchIdentifier())) {
            throw new Error('A class must have a name');
        }

        result.variable.name = name;

        // Class scope
        const classScope = new Scope(scope);

        // Defining now ?
        let member: string = null;
        let right = '';

        if (this.tokenizer.match(TokenType.BRACKET_OPEN)) {
            while (!this.tokenizer.match(TokenType.BRACKET_CLOSE)) {
                // Member definition ?
                if ((right = <string> this.tokenizer.matchIdentifier()) && (types.indexOf(right) !== -1 || right === name)) {
                    member = right;
                }
                // Just expression
                else {
                    // Member declaration ?
                    if (member) {
                        if (!right) { 
                            // Constructor ?
                            let expr = this.expression(classScope);
                            parameters = expr.str;

                            // Code
                            expr = this.expression(classScope);
                            
                            const first = expr.str.indexOf('{');
                            const last = expr.str.lastIndexOf('}');
                            result.ctor += expr.str.substring(first + 1, last - 1);
                        }
                        else {
                            let definition = `this.${right}`;

                            // Assign value directly ?
                            if (this.tokenizer.match(TokenType.ASSIGN)) {
                                const expr = this.expression(classScope);
                                result.ctor += `${definition} = ${expr.str}`;
                            }
                            // Expression ?
                            else {
                                const variable = new Variable(scope, `${name}.${right}`, VariableType.ANY);
                                functions.class[right] = {
                                    name: right,
                                    returns: VariableType.ANY
                                };

                                // Method without arguments ?
                                const expr1 = this.expression(classScope);
                                if (expr1.variable && expr1.variable.type === VariableType.FUNCTION) {
                                    result.prototype = `${result.prototype} ${name}.prototype.${right} = ${expr1.str}`;
                                }
                                // Method with arguments ?
                                else if (expr1.str.match(/\((.*)\)/)) {
                                    const split = expr1.str.substring(1, expr1.str.length - 1).replace(/var/g, '').split(',');
                                    const expr2 = this.expression(classScope);
                                    result.prototype = `${result.prototype} ${name}.prototype.${right} = ${expr2.str.replace(/it/, split.join(','))}`;
                                }
                            }
                        }

                        member = null;
                    }
                    // Def
                    else if (right && right === 'def') {
                        continue;
                    }
                    // Ignore token ?
                    else {
                        const expr = this.expression(classScope);
                        result.ctor += expr.str;
                    }
                }
            }
        }

        result.ctor = `function ${name}${parameters || '()'} {${result.ctor}}`;

        return result;
    }

    /**
     * Parses an accessor (a.size() or just a.something)
     * @param scope the scope of the accessor
     * @param accessor the accessor name
     */
    protected accessor (scope: Scope, accessor: string): { str: string, variable: Variable } {
        // Accessor with string ?
        if (accessor[accessor.length - 1] === '.') {
            let key = '';
            if ((key = this.tokenizer.matchString())) {
                return { str: accessor.substring(0, accessor.length - 1) + `[${key}]`, variable: null };
            }
        }

        let variable = Variable.find(scope, v => v.name === accessor);
        let found = variable !== null;

        const lastDot = accessor.lastIndexOf('.');
        const prev = accessor.substr(0, lastDot);
        const next = accessor.substr(lastDot + 1, accessor.length);

        // Empty string, just accessing a member using quotes (i.e a["b"])
        if (prev.length === 0)
            return { str: accessor, variable: null };

        if (!variable) {
            variable = Variable.find(scope, v => v.name === prev);
            if (!variable) {
                //throw new Error(`Variable named "${prev}" was not declared`);
                variable = new Variable(scope, prev, VariableType.ANY);
            }
        }

        // Assign ?
        if (this.tokenizer.match(TokenType.ASSIGN)) {
            const expr = this.expression(scope, accessor);

            if (!found)
                new Variable(scope, accessor, expr.variable.type);
            else
                variable.type = expr.variable.type;

            accessor = `${accessor} = ${this.operators(scope, expr.variable)}`;
            expr.variable.remove(); // Remove the temp variable of expr

            if (this.tokenizer.match(TokenType.INSTRUCTION_END))
                accessor += ';';

            variable = new Variable(scope, accessor, variable.type);
            variable.remove();
        }
        // Method call ?
        else {
            let fn = 
                variable.type === VariableType.ARRAY ? functions.array[next] :
                variable.type === VariableType.MAP ? functions.map[next] :
                (variable.type === VariableType.ANY || variable.type === VariableType.CLASS) ? functions.array[next] || functions.map[next] || functions.class[next] : null;

            // Property (.length, etc.) ?
            if (!fn) {
                let fn = 
                    variable.type === VariableType.ARRAY ? properties.array[next] :
                    variable.type === VariableType.ANY ? properties.array[next] : null;

                variable = new Variable(scope, '', variable.type);
                variable.remove();
                
                if (!fn)
                    accessor = `${prev}.${next}`;
                else {
                    accessor = `${prev}.${fn.name}`;
                    variable.type = fn.returns;

                    // Avoid parenthesis
                    while (!this.tokenizer.match(TokenType.PARENTHESIS_CLOSE))
                        this.tokenizer.getNextToken();
                }

                // Parenthesized call ?
                if (this.tokenizer.match(TokenType.PARENTHESIS_OPEN)) {
                    accessor += '(';
                    while (!this.tokenizer.match(TokenType.PARENTHESIS_CLOSE)) {
                        const expr = this.expression(scope);
                        if (expr.variable)
                            accessor += this.operators(scope, expr.variable);
                        else
                            accessor += expr.str;
                    }
                    accessor += ')';
                }

                variable.name = accessor;
            }
            // Method found
            else {
                if (typeof fn === 'string') {
                    // Simple method call with parenthetized expression
                    accessor = `${prev}.${fn}${this.expression(scope).str}`;
                    variable = new Variable(scope, accessor, VariableType.VOID);
                }
                // Function which returns a specific type ?
                else if (fn.returns !== undefined) {
                    accessor = `${prev}.${fn.name}${this.expression(scope).str}`;
                    
                    variable = new Variable(scope, accessor, fn.returns);

                    // Check if next accessors?
                    let newAccessor = '';
                    if ((newAccessor = this.tokenizer.matchAccessor())) {
                        accessor = this.accessor(scope, accessor + newAccessor).str;
                        variable.name = accessor;
                    }
                } else {
                    // Avoid parenthesis
                    if (this.tokenizer.match(TokenType.PARENTHESIS_OPEN)) {
                        if (!(this.tokenizer.currentToken === TokenType.BRACKET_OPEN)) {
                            while (!this.tokenizer.match(TokenType.PARENTHESIS_CLOSE))
                                this.tokenizer.getNextToken();
                        }
                    }

                    let hasArguments = this.tokenizer.currentToken === TokenType.BRACKET_OPEN;
                    accessor = `${prev}.${fn.name}(${hasArguments ? this.expression(scope).str : ''})\n`;
                    variable = new Variable(scope, accessor, VariableType.VOID);

                    // Avoid last parenthesis
                    if (this.tokenizer.currentToken === TokenType.PARENTHESIS_CLOSE)
                        this.tokenizer.getNextToken();
                }
            }

            variable.remove();
        }

        return { str: accessor, variable: variable };
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
        if (left.type !== VariableType.ARRAY && left.type !== VariableType.STRING && left.type !== VariableType.ANY)
            return left.name;
        
        let str = left.name;

        let operator = '';
        let operatorAssign = '';
        let right = '';

        let identifier = '';

        while ((operator = this.tokenizer.matchOperator()) || (operatorAssign = this.tokenizer.matchOperatorAssign())) {
            let fn = operators[operator || operatorAssign];

            if (!fn) {
                str = `${str}${operator || operatorAssign}${this.expression(scope).str}`;
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
                const expr = this.expression(scope);
                str = `${fn}(${str}, ${expr.str})\n`;
                expr.variable.remove();
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

        // [:]
        if (this.tokenizer.match(TokenType.DESCRIPTOR) && this.tokenizer.match(TokenType.ACCESSOR_CLOSE)) {
            return {
                str: '{ }',
                type: VariableType.MAP
            };
        }

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

                // Should check types of array members HERE
                /*
                const expr = this.expression(scope);
                str += expr.str;
                */
            }
        }

        str += ']';

        // Direct method call ?
        let fn = '';
        if ((fn = this.tokenizer.matchAccessor())) {
            const variable = new Variable(scope, `${str}${fn}`, VariableType.ARRAY);
            str = this.accessor(scope, `${str}${fn}`).str;
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
        let isKey = false;

        if (name)
            variable = new Variable(scope, `${name}.${key}`, VariableType.ANY);
        
        while (!this.tokenizer.isEnd() && !this.tokenizer.match(TokenType.ACCESSOR_CLOSE)) {
            if (this.tokenizer.match(TokenType.ACCESSOR_OPEN)) {
                // Array or map
                const array = this.array(scope);
                str += array.str;

                if (variable)
                    variable.type = array.type;
            } else if (isKey && (identifier = <string> this.tokenizer.matchIdentifier())) {
                // This is a key
                key = identifier;

                if (name)
                    variable = new Variable(scope, `${name}.${key}`, VariableType.ANY);
                
                str += key;
                isKey = false;
            } else if ((number = this.tokenizer.matchNumber())) {
                if (variable)
                    variable.type = VariableType.NUMBER;

                str += number;
            } else if (this.tokenizer.match(TokenType.COMMA)) {
                str += ',';
                isKey = true;
            } else {
                const expr = this.expression(scope);
                str += expr.str;
            }
        }

        return str + ' }';
    }

    /**
     * Converts a groovy script to JavaScript
     * @param toParse the Groovy string to transpile to JavaScript
     */
    public static convert (toParse: string, scope?: Scope): string {
        const analyser = new Analyser(toParse + '\n', true);
        const result = analyser.parse(scope);
        return beautifier.js_beautify(result);
    }
}

import { TokenType } from './token-type';

export default class Tokenizer {
    // Public members
    public toParse: string;
    public currentToken: TokenType = TokenType.UNKNOWN;

    public currentIdentifier: string = '';
    public currentString: string = '';
    public currentNumber: string = '';
    public currentOperator: string = '';

    public lastString = '';

    // Private members
    private pos: number;
    private maxPos: number;

    private isLetterOrDigitPattern: RegExp = /^[a-zA-Z0-9]+$/;
    private isDigit: RegExp = /^[0-9]+$/;
    private isOperator: RegExp = /^[-.+.*./.<.>]+$/;

    /**
     * Constructor
     * @param toParse the string to tokenize
     */
    constructor (toParse: string, startIndex: number = 0, count: number = toParse.length) {
        this.toParse = toParse;
        this.pos = startIndex;
        this.maxPos = startIndex + count;
    }

    /**
     * Returns the next character
     */
    public read (): string {
        return this.toParse[this.pos++];
    }

    /**
     * Peeks the current character
     */
    public peek (): string {
        return this.toParse[this.pos];
    }

    /**
     * Increment position in string to parse
     */
    public forward (): void {
        this.pos++;
    }

    /**
     * Returns if at end of string to parse
     */
    public isEnd (): boolean {
        return this.pos >= this.maxPos;
    }

    /**
     * If the given token matches the current token. Then
     * go to the next token
     * @param token the token to match
     */
    public match(token: TokenType): boolean {
        if (this.currentToken == token) {
            this.getNextToken();
            return true;
        }

        return false;
    }

    /**
     * Matches if the current token is an identifier
     */
    public matchIdentifier(expected?: string): string | boolean {
        if (expected) {
            if (this.currentToken === TokenType.IDENTIFIER && this.currentIdentifier === expected) {
                this.getNextToken();
                return true;
            }

            return false;
        }

        if (this.currentToken == TokenType.IDENTIFIER) {
            const identifier = this.currentIdentifier;
            this.getNextToken();
            return identifier;
        }

        return null;
    }

    public matchString (): string {
        if (this.currentToken === TokenType.STRING) {
            const string = this.currentString;
            this.getNextToken();
            return string;
        }

        return null;
    }

    /**
     * Matches if the current token is a number
     */
    public matchNumber(): string {
        if (this.currentToken === TokenType.NUMBER) {
            const number = this.currentNumber;
            this.getNextToken();
            return number;
        }

        return null;
    }

    /**
     * Returns the next token in the string to parse
     */
    public getNextToken (): TokenType {
        // 1 - The end.
        if (this.isEnd())
            return this.currentToken = TokenType.END_OF_INPUT;

        // 2 - White space
        var c: string = ' ';
        while((c = this.read()) === ' ')
            if (this.isEnd()) return this.currentToken = TokenType.END_OF_INPUT;

        this.lastString = c;

        switch (c) {
            case ';': return this.currentToken = TokenType.INSTRUCTION_END;
            case '[': return this.currentToken = TokenType.ACCESSOR_LEFT;
            case ']': return this.currentToken = TokenType.ACCESSOR_RIGHT;
            case '(': return this.currentToken = TokenType.PARENTHESIS_OPEN;
            case ')': return this.currentToken = TokenType.PARENTHESIS_CLOSE;
            case ',': return this.currentToken = TokenType.COMMA;
            case '{': return this.currentToken = TokenType.BRACKET_OPEN;
            case '}': return this.currentToken = TokenType.BRACKET_CLOSE;
            case '\n': return this.currentToken = TokenType.LINE_END;
            case ':': return this.currentToken = TokenType.DESCRIPTOR;
            default: {
                if (this.isDigit.test(c)) {
                    this.currentToken = TokenType.NUMBER;
                    this.currentNumber = c;

                    while (!this.isEnd() && (this.isDigit.test((c = this.peek())) || c === '.')) {
                        this.currentNumber += c;
                        this.forward();
                    }

                    this.lastString = this.currentNumber;
                }
                else if (c === '_' || this.isLetterOrDigitPattern.test(c)) { // Identifier
                    this.currentToken = TokenType.IDENTIFIER;
                    this.currentIdentifier = c;

                    while (!this.isEnd() && (this.isLetterOrDigitPattern.test(c = this.peek()) || c === '_')) {
                        this.currentIdentifier += c;
                        this.forward();
                    }

                    this.lastString = this.currentIdentifier;
                }
                else if (c === '"' || c === "'") {
                    this.currentToken = TokenType.STRING;
                    this.currentString = c;

                    while (!this.isEnd() && (c = this.peek()) !== '"' && c !== "'") {
                        this.currentString += c;
                        this.forward();
                    }

                    this.currentString += c;
                    this.forward();
                    
                    this.lastString = this.currentString;
                }
                else if (c === '=') {
                    this.currentToken = TokenType.ASSIGN;
                    let count = 1;

                    while (!this.isEnd() && (c = this.peek()) === '=') {
                        this.currentToken = TokenType.EQUALITY;
                        this.forward();
                        this.lastString += c;
                        count++;
                    }

                    if (count > 2)
                        this.currentToken = TokenType.ERROR;
                }
                else if (this.isOperator.test(c)) {
                    this.currentToken = TokenType.OPERATOR;
                    this.currentOperator = c;

                    c = this.read();
                    if (c === '=' || this.isOperator.test(c)) {
                        this.currentOperator += c;
                        this.lastString = this.currentOperator;
                        this.currentToken = TokenType.OPERATOR_ASSIGN;
                    }
                }

                break;
            }
        }

        return this.currentToken;
    }
}
export enum ETokenType {
    None = 0,
    Identifier = 1 << 10,
    IsBracket = 1 << 11,
    IsBinaryOperator = 1 << 12,
    Number = 1 << 13,
    String = 1 << 14,
    IsLogicOperator = 1 << 15,
    
    Plus = IsBinaryOperator + 0,
    Minus = IsBinaryOperator + 1,
    Mult = IsBinaryOperator + 2,
    Div = IsBinaryOperator + 3,
    SpaceShip = IsBinaryOperator + 4,
    Not = IsBinaryOperator + 5,
    SelfMinus = IsBinaryOperator + 6,
    SelfPlus = IsBinaryOperator + 7,
    BitwiseLeft = IsBinaryOperator + 8,
    BitwiseRight = IsBinaryOperator + 9,
    SelfPlusAssign = IsBinaryOperator + 10,
    SelfMinusAssign = IsBinaryOperator + 11,
    SelfMultAssign = IsBinaryOperator + 12,
    SelfDivAssign = IsBinaryOperator + 13,

    And = IsLogicOperator + 0,
    Or = IsLogicOperator + 1,
    
    OpenPar = IsBracket + 0,
    ClosePar = IsBracket + 1,
    OpenBracket = IsBracket + 2,
    CloseBracket = IsBracket + 3,
    OpenBrace = IsBracket + 4,
    CloseBrace = IsBracket + 5,

    QuestionMark = 1,
    Colon = 2,
    SemiColon = 3,
    Equal = 4,
    Equality = 5,
    Comma = 6,
    Inferior = 7,
    InferiorOrEqual = 8,
    Superior = 9,
    SuperiorOrEqual = 10,
    Dot = 11,

    EndOfInput = 1 << 30,
    Error = 1 << 31
}

export class Tokenizer {
    public readonly toParse: string;
    public pos: number;
    public end: number = 0;

    public static ExcludedCharacters: string[] = [" ", "\n", "\r", "\t"];
    public static IsLetterPattern: RegExp = /^[a-zA-Z]+$/;
    public static IsNumberPattern: RegExp = /^[0-9]+$/;
    public static IsOperatorPattern: RegExp = /^[+-/*]+$/;
    public static IsLogicOperatorPattern: RegExp = /^[&|]+$/;

    private _type: ETokenType = ETokenType.None;
    private _buffer: string = "";

    /**
     * Constructor
     * @param str the string to tokenize
     */
    constructor(str: string, startPos: number = 0) {
        this.toParse = str;
        this.pos = startPos;
        this.end = str.length;

        this.getNextToken();
    }

    /**
     * Returns if the tokenizer is at end position of the string
     */
    public get isEnd(): boolean {
        return this.pos >= this.end;
    }

    /**
     * Returns the current token' associated string
     */
    public get currentString(): string {
        return this._buffer;
    }

    /**
     * Returns the current token type
     */
    public get currentToken(): ETokenType {
        return this._type;
    }

    /**
     * Reads the next character
     */
    public read(): string {
        return this.toParse[this.pos++];
    }

    /**
     * Returns the current character at the current position
     */
    public peek(): string {
        return this.toParse[this.pos];
    }

    /**
     * Goes to the next position on the string
     */
    public forward(): void {
        this.pos++;
    }

    /**
     * Returns if the tokenizer just matched the given token type
     * @param type the type to match
     */
    public match(type: ETokenType): boolean {
        if (this._type === type) {
            this.getNextToken();
            return true;
        }

        return false;
    }

    /**
     * Returns the next found token
     */
    public getNextToken(): ETokenType {
        // 1- The end
        if (this.isEnd) return (this._type = ETokenType.EndOfInput);
        
        // 2- white space
        let c: string;
        while (Tokenizer.ExcludedCharacters.indexOf((c = this.read())) !== -1) {
            if (this.isEnd) return (this._type = ETokenType.EndOfInput);
        }

        // 3- Terminals
        switch (c) {
            case "!": return (this._type = ETokenType.Not);
            case "(": return (this._type = ETokenType.OpenPar);
            case ")": return (this._type = ETokenType.ClosePar);
            case "[": return (this._type = ETokenType.OpenBracket);
            case "]": return (this._type = ETokenType.CloseBracket);
            case "{": return (this._type = ETokenType.OpenBrace);
            case "}": return (this._type = ETokenType.CloseBrace);

            case "?": return (this._type = ETokenType.QuestionMark);
            case ":": return (this._type = ETokenType.Colon);
            case ";": return (this._type = ETokenType.SemiColon);
            case ",": return (this._type = ETokenType.Comma);
            case ".": return (this._type = ETokenType.Dot);

            default:
                //4- Non terminals
                // Identifier
                if (c === "_" || Tokenizer.IsLetterPattern.test(c)) {
                    this._type = ETokenType.Identifier;
                    this._buffer = c;
                    while (!this.isEnd && (Tokenizer.IsLetterPattern.test((c = this.peek())) || c === "_")) {
                        this._buffer += c;
                        this.forward();
                    }
                }
                // Number
                else if (Tokenizer.IsNumberPattern.test(c)) {
                    this._type = ETokenType.Number;
                    this._buffer = c;
                    while (!this.isEnd && (Tokenizer.IsNumberPattern.test((c = this.peek())) || c === ".")) {
                        this._buffer += c;
                        this.forward();
                    }
                }
                // Equal
                else if (c === "=") {
                    this._type = ETokenType.Equal;
                    this._buffer = c;
                    while (!this.isEnd && (c = this.peek()) === "=") {
                        this._buffer += c;
                        this._type = ETokenType.Equality;
                        this.forward();
                    }
                }
                // String
                else if (c === '"' || c === "'") {
                    this._type = ETokenType.String;
                    this._buffer = c;
                    while (!this.isEnd && (c = this.peek()) !== '"' && c !== "'") {
                        this._buffer += c;
                        this.forward();
                    }

                    this._buffer += c;
                    this.forward();
                }
                // Logic operator
                else if (Tokenizer.IsLogicOperatorPattern.test(c)) {
                    this._buffer = c;

                    while (Tokenizer.IsLogicOperatorPattern.test(c = this.peek())) {
                        this._buffer += c;
                        this.forward();
                    }

                    switch (this._buffer) {
                        case "&&": return (this._type = ETokenType.And);
                        case "||": return (this._type = ETokenType.Or);
                        default: return (this._type = ETokenType.Error);
                    }
                }
                // Operator
                else if (Tokenizer.IsOperatorPattern.test(c)) {
                    switch (c) {
                        case "-": (this._type = ETokenType.Minus); break;
                        case "+": (this._type = ETokenType.Plus); break;
                        case "*": (this._type = ETokenType.Mult); break;
                        case "/": (this._type = ETokenType.Div); break;
                        default: return (this._type = ETokenType.Error);
                    }

                    this._buffer = c;

                    // --, ++
                    if (c === (c = this.peek())) {
                        this._buffer += c;
                        this.forward();

                        switch (c) {
                            case "-": (this._type = ETokenType.SelfMinus); break;
                            case "+": (this._type = ETokenType.SelfPlus); break;
                            default: return this._type = ETokenType.Error;
                        }
                    }

                    // =
                    if (c === "=") {
                        this._buffer += c;
                        this.forward();

                        switch (this._buffer) {
                            case "+=": return (this._type = ETokenType.SelfPlusAssign);
                            case "-=": return (this._type = ETokenType.SelfMinusAssign);
                            case "*=": return (this._type = ETokenType.SelfMultAssign);
                            case "/=": return (this._type = ETokenType.SelfDivAssign);
                            default: return (this._type = ETokenType.Error);
                        }
                    }
                }
                // Inferior
                else if (c === "<") {
                    this._type = ETokenType.Inferior;
                    this._buffer = c;

                    if ((c = this.peek()) === "=") {
                        // Inferior or equal
                        this._type = ETokenType.InferiorOrEqual;
                        this._buffer += c;
                        this.forward();

                        if ((c = this.peek()) === ">") {
                            // Spaceship operator
                            this._type = ETokenType.SpaceShip;
                            this._buffer += c;
                            this.forward();
                        }
                    } else if (c === "<") {
                        this._type = ETokenType.BitwiseLeft;
                        this._buffer += c;
                        this.forward();
                    }
                }
                // Superior
                else if (c === ">") {
                    this._type = ETokenType.Superior;
                    this._buffer = c;

                    if ((c = this.peek()) === "=") {
                        this._type = ETokenType.SuperiorOrEqual;
                        this._buffer += c;
                        this.forward();
                    } else if (c === ">") {
                        this._type = ETokenType.BitwiseRight;
                        this._buffer += c;
                        this.forward();
                    }
                }
                else {
                    this._type = ETokenType.Error;
                }
                break;
        }

        return this._type;
    }
}

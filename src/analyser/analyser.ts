import { Tokenizer, ETokenType } from "../tokenizer/tokenizer";
import { keywords } from "./dictionary";
import { Scope } from "./scope";

// Nodes
import { Node } from "../nodes/node";
import { UnaryOperatorNode } from "../nodes/operators/unaryOperator";
import { ConstantNode } from "../nodes/variables/constant";
import { ErrorNode } from "../nodes/error";
import { BinaryOperatorNode } from "../nodes/operators/binaryOperator";
import { TernaryNode } from "../nodes/logic/ternary";
import { VariableNode } from "../nodes/variables/variable";
import { VariableDeclarationNode } from "../nodes/variables/variableDeclaration";
import { ArrayNode } from "../nodes/types/array";
import { EndOfInstructionNode } from "../nodes/endOfInstruction";
import { ReturnNode } from "../nodes/keywords/return";
import { IfNode } from "../nodes/keywords/ifNode";
import { BlockNode } from "../nodes/block";
import { ComparisonNode } from "../nodes/logic/comparison";
import { WhileNode } from "../nodes/loops/while";
import { AssignNode } from "../nodes/variables/assign";
import { ForNode } from "../nodes/loops/for";
import { BreakNode } from "../nodes/keywords/break";
import { DoNode } from "../nodes/loops/do";
import { LogicNode } from "../nodes/operators/logicOperator";
import { MapNode, MapElementNode } from "../nodes/types/map";
import { FunctionDeclarationNode } from "../nodes/function/functionDeclaration";
import { FunctionCallNode } from "../nodes/function/functionCall";
import { CastOperatorNode } from "../nodes/operators/castOperator";
import { CommentNode } from "../nodes/comment";

export interface IAnalyserOptions {
    keepComments?: boolean;
    context?: any;
}

export class Analyser {
    private _tokenizer: Tokenizer;
    private _scopes: Scope[];

    private _root: Node = null;

    /**
     * Constructor
     * @param str the groovy string to parse
     */
    constructor(str: string, options: IAnalyserOptions = { }) {
        this._tokenizer = new Tokenizer(str);
        this._tokenizer.keepComments = options.keepComments || false;

        this._scopes = [new Scope()];
    }

    /**
     * Analyses the code to return the root node of the current super-expression
     */
    public analyse(): Node {
        return (this._root = this.getSuperExpression(this._tokenizer));
    }

    /**
     * Returns the root node of the current super-expression
     */
    public get rootNode(): Node {
        return this._root;
    }

    /**
     * Returns if the anlyser analysed all the code
     */
    public get isEnd(): boolean {
        return this._tokenizer.isEnd;
    }

    /**
     * Retuns the current scope of the analyser
     */
    public get currentScope(): Scope {
        return this._scopes[this._scopes.length - 1];
    }

    /**
     * Returns the current position of the tokenizer
     */
    public get currentPos(): number {
        return this._tokenizer.pos;
    }

    /**
     * Returns if the current token is a semicolon (end of instruction)
     */
    public isEndOfInstruction(): Node {
        if (this._tokenizer.match(ETokenType.SemiColon))
            return new EndOfInstructionNode();

        return null;
    }

    /**
     * Returns a array of comments available above the next node
     * @param tokenizer the tokenizer reference
     */
    public getComments(tokenizer: Tokenizer): Node[] {
        const result: Node[] = [];

        let commentStr = this._tokenizer.currentString;
        let commentToken = this._tokenizer.currentToken;

        while (tokenizer.match(ETokenType.Comment) || tokenizer.match(ETokenType.MultilineComment)) {
            result.push(new CommentNode(commentToken, commentStr));
            commentStr = this._tokenizer.currentString;
            commentToken = this._tokenizer.currentToken;
        }

        return result;
    }

    /**
     * Returns the top level expression (root node)
     * @param tokenizer the tokenizer reference
     */
    public getSuperExpression(tokenizer: Tokenizer): Node {
        // Expression
        const eComments = this.getComments(tokenizer);
        const e = this.getExpression(tokenizer).setComments(eComments);

        // Assignement: a = ...
        if (tokenizer.match(ETokenType.Equal)) return new AssignNode(e, this.getSuperExpression(tokenizer));

        // Ternary: a ? ... : ...;
        if (!tokenizer.match(ETokenType.QuestionMark))
            return e;

        const ifTrue = this.getExpression(tokenizer);
        if (!tokenizer.match(ETokenType.Colon))
            return new ErrorNode("Expected ':'.");

        const ifFalse = this.getExpression(tokenizer);
        const ternary = new TernaryNode(e, ifTrue, ifFalse);
        return tokenizer.match(ETokenType.SemiColon) ? new EndOfInstructionNode(ternary) : ternary;
    }

    /**
     * Returns a node expression which is defined by a at least a positive factor
     * @param tokenizer the tokenizer reference
     * @example "a++", "a", "fn()", def ... etc.
     */
    public getExpression(tokenizer: Tokenizer): Node {
        let left = this.getTerm(tokenizer);

        while (!tokenizer.isEnd && !(left instanceof ErrorNode)) {
            const comments = this.getComments(tokenizer);
            const operator = tokenizer.currentToken;

            // "+"" or "-"" or "+="" or "-="" or "*=" or "/=""
            if (
                tokenizer.match(ETokenType.Plus) || tokenizer.match(ETokenType.Minus) ||
                tokenizer.match(ETokenType.SelfPlusAssign) || tokenizer.match(ETokenType.SelfMinusAssign) ||
                tokenizer.match(ETokenType.SelfMultAssign) || tokenizer.match(ETokenType.SelfDivAssign)
            ) {
                left = new BinaryOperatorNode(operator, left, this.getTerm(tokenizer), comments);
                continue;
            }

            // <, <=, >, >= or ==
            if (
                tokenizer.match(ETokenType.Inferior) || tokenizer.match(ETokenType.Superior) ||
                tokenizer.match(ETokenType.InferiorOrEqual) || tokenizer.match(ETokenType.SuperiorOrEqual) ||
                tokenizer.match(ETokenType.Equality)
            ) {
                left = new ComparisonNode(operator, left, this.getSuperExpression(tokenizer), comments);
                continue;
            }

            // "||"
            if (tokenizer.match(ETokenType.Or)) {
                left = new LogicNode(operator, left, this.getSuperExpression(tokenizer), comments);
                continue;
            }

            // "<<" or ">>"
            if (tokenizer.match(ETokenType.BitwiseLeft) || tokenizer.match(ETokenType.BitwiseRight)) {
                left = new BinaryOperatorNode(operator, left, this.getSuperExpression(tokenizer), comments);
                continue;
            }

            break;
        }

        return left;
    }

    /**
     * Returns the node which defines a term (variable, loop, etc.)
     * @param tokenizer the tokenizer reference
     * @example "a" or "for (...) { ... }" or "&&" or "*" or "/" or "<=>" etc.
     */
    public getTerm(tokenizer: Tokenizer): Node {
        let left = this.getFactor(tokenizer);

        while (!(left instanceof ErrorNode)) {
            const comments = this.getComments(tokenizer);
            const operator = tokenizer.currentToken;

            // "*" or "/" or "<=>"
            if (tokenizer.match(ETokenType.Mult) || tokenizer.match(ETokenType.Div) || tokenizer.match(ETokenType.SpaceShip)) {
                left = new BinaryOperatorNode(operator, left, this.getFactor(tokenizer), comments);
                continue;
            }

            // "&&"
            if (tokenizer.match(ETokenType.And)) {
                left = new LogicNode(operator, left, this.getSuperExpression(tokenizer), comments);
                continue;
            }

            break;
        }

        return left;
    }

    /**
     * Returns a node which is defined by a factor or not
     * @param tokenizer the tokenizer reference
     * @example factor: "+2", "-2", "-variable", "+variable", "(...)", "-(...)"
     */
    public getFactor(tokenizer: Tokenizer): Node {
        const comments = this.getComments(tokenizer);
        const currentToken = tokenizer.currentToken;

        // Unary
        if (tokenizer.match(ETokenType.Minus) || tokenizer.match(ETokenType.Not) || tokenizer.match(ETokenType.Plus))
            return new UnaryOperatorNode(currentToken, this.getFactor(tokenizer), comments);

        // pre "--"" or pre "++""
        if (tokenizer.match(ETokenType.SelfMinus) || tokenizer.match(ETokenType.SelfPlus)) {
            const variableName = tokenizer.currentString;
            if (!tokenizer.match(ETokenType.Identifier)) return new ErrorNode("Expected an identifier");

            return new VariableNode(variableName, currentToken, null, this.currentScope.getVariableType(variableName), comments);
        }

        return this.getPositiveFactor(tokenizer).setComments(comments);
    }

    /**
     * Returns the node which has no factor (positive factor)
     * @param tokenizer the tokenizer reference
     * @example positive factor: "2", "variable", "(...)"
     */
    public getPositiveFactor(tokenizer: Tokenizer): Node {
        // Comments
        const comments = this.getComments(tokenizer);

        // Number
        const number = tokenizer.currentString;
        if (tokenizer.match(ETokenType.Number))
            return new ConstantNode(parseInt(number), comments);

        // String
        const identifier = tokenizer.currentString;
        if (tokenizer.match(ETokenType.String))
            return new ConstantNode(identifier, comments);

        // Identifier
        let variableOrTypeOrKeyword = tokenizer.currentString;
        if (tokenizer.match(ETokenType.Identifier)) {
            // Keyword?
            if (keywords.indexOf(variableOrTypeOrKeyword) !== -1)
                return this.getKeyword(variableOrTypeOrKeyword, tokenizer).setComments(comments);

            // Variable
            const variableName = tokenizer.currentString;

            // . accessor?
            while (tokenizer.match(ETokenType.Dot)) {
                const member = tokenizer.currentString;
                if (!tokenizer.match(ETokenType.Identifier)) return new ErrorNode("Expected an identifier");

                variableOrTypeOrKeyword += `.${member}`;
            }

            const postOperator = tokenizer.currentToken;
            if (!tokenizer.match(ETokenType.Identifier)) {
                // In case of x.y
                const members = variableOrTypeOrKeyword.split(".");
                const variableType = members.length === 1
                    ? this.currentScope.getVariableType(variableOrTypeOrKeyword)
                    : this.currentScope.getVariableType(members.slice(0, members.length - 1).join("."));

                // "++"" or "--""
                if (tokenizer.match(ETokenType.SelfMinus) || tokenizer.match(ETokenType.SelfPlus))
                    return new VariableNode(variableOrTypeOrKeyword, null, postOperator, variableType, comments);

                // Method call
                if (tokenizer.match(ETokenType.OpenBrace)) {
                    const f = this.getFunction(tokenizer);
                    return new FunctionCallNode(new VariableNode(variableOrTypeOrKeyword, null, null, variableType), [new FunctionDeclarationNode(null, f.arguments, f.block)]);
                }

                if (tokenizer.match(ETokenType.OpenPar)) {
                    if (tokenizer.match(ETokenType.ClosePar)) {
                        // () { }
                        if (tokenizer.match(ETokenType.OpenBrace)) {
                            const f = this.getFunction(tokenizer);
                            return new FunctionCallNode(new VariableNode(variableOrTypeOrKeyword, null, null, variableType), [new FunctionDeclarationNode(null, f.arguments, f.block)]);
                        }

                        // ();
                        return new FunctionCallNode(new VariableNode(variableOrTypeOrKeyword, null, null, variableType), []);
                    }

                    const callArguments = this.getList(tokenizer);
                    if (!tokenizer.match(ETokenType.ClosePar)) return new ErrorNode("Expected a closing parenthesis");
                    return new FunctionCallNode(new VariableNode(variableOrTypeOrKeyword, null, null, variableType), callArguments.nodes);
                }

                return new VariableNode(variableOrTypeOrKeyword, null, null, variableType);
            }

            // Definition
            let variableDeclaration: VariableDeclarationNode | FunctionDeclarationNode = null;

            if (!tokenizer.match(ETokenType.Equal)) { // No direct assign
                if (tokenizer.match(ETokenType.OpenPar)) {
                    if (tokenizer.match(ETokenType.ClosePar) && tokenizer.match(ETokenType.OpenBrace))
                        return new FunctionDeclarationNode(variableName, [], this.getBlock(tokenizer)); // fn() { ... }

                    // Function definition
                    const fnArguments = this.getList(tokenizer);
                    fnArguments.nodes.forEach(f => f instanceof VariableDeclarationNode && (f.noVar = true));

                    if (!tokenizer.match(ETokenType.ClosePar)) return new ErrorNode("Expected a closing parenthesis");
                    if (!tokenizer.match(ETokenType.OpenBrace)) return new ErrorNode("Expected a closing brace");

                    // Method body
                    const f = this.getFunction(tokenizer);
                    return new FunctionDeclarationNode(variableName, fnArguments.nodes, f.block);
                }

                // Just a variable with no value
                variableDeclaration = new VariableDeclarationNode(variableOrTypeOrKeyword, variableName, null);
            } else { // Direct assign
                if (tokenizer.match(ETokenType.OpenBrace)) {
                    // Closure definition: { ... } or { x, y, ... -> ... } or { -> ... }
                    const f = this.getFunction(tokenizer);
                    return f.error || new FunctionDeclarationNode(variableName, f.arguments, f.block);
                }

                // Just a variable with a value
                const value = this.getSuperExpression(tokenizer);
                variableDeclaration = new VariableDeclarationNode(VariableDeclarationNode.GetTypeFromNode(value), variableName, value);
            }

            this.currentScope.variables.push(variableDeclaration);
            return variableDeclaration;
        }

        // Array or map
        if (tokenizer.match(ETokenType.OpenBracket)) {
            // Empty array
            if (tokenizer.match(ETokenType.CloseBracket)) return new ArrayNode([]);

            // Empty map
            if (tokenizer.match(ETokenType.Colon)) {
                if (!tokenizer.match(ETokenType.CloseBracket)) return new ErrorNode("Expected a closing bracket");
                return new MapNode([]);
            }

            const l = this.getList(tokenizer);
            if (!tokenizer.match(ETokenType.CloseBracket)) return new ErrorNode("Expected a closing bracket");
            return (l.isArray) ? new ArrayNode(l.nodes) : new MapNode(l.nodes as MapElementNode[]);
        }

        // Closure
        if (tokenizer.match(ETokenType.OpenBrace)) {
            const f = this.getFunction(tokenizer);
            return new FunctionDeclarationNode(null, f.arguments, f.block);
        }

        // Super expression
        if (!tokenizer.match(ETokenType.OpenPar)) return new ErrorNode("Expected constant or identifier or opening parenthesis");
        const e = this.getSuperExpression(tokenizer);
        if (e instanceof ErrorNode) return e;
        if (!tokenizer.match(ETokenType.ClosePar)) return new ErrorNode("Expected closing parenthesis.");

        // Type casting
        if (e instanceof VariableNode && !this.currentScope.getVariable(e.name)) return new CastOperatorNode(e.name, this.getSuperExpression(tokenizer));

        return e;
    }

    /**
     * Returns the array of nodes being listed, separated by commas
     * @param tokenizer the tokenizer reference
     * @example "1, 2,3, 'coucou', []" etc.
     */
    public getList(tokenizer: Tokenizer): { isArray: boolean; nodes: Node[] } {
        const first = this.getSuperExpression(tokenizer);

        if (!tokenizer.match(ETokenType.Colon)) {
            // Just an array
            const array: Node[] = [first];

            while (tokenizer.match(ETokenType.Comma)) {
                const e = this.getSuperExpression(tokenizer);
                if (e instanceof ErrorNode) return { isArray: true, nodes: [e] };
                array.push(e);
            }

            return { isArray: true, nodes: array };
        }

        // Map
        const map: Node[] = [];

        // Get first map element
        const value = this.getSuperExpression(tokenizer);
        map.push(new MapElementNode(first, value));

        while (tokenizer.match(ETokenType.Comma)) {
            // Left
            const left = this.getSuperExpression(tokenizer);
            if (left instanceof ErrorNode) return { isArray: false, nodes: [left] };

            // :
            if (!tokenizer.match(ETokenType.Colon))
                return { isArray: false, nodes: [new ErrorNode("Expected a colon")] };

            // Right
            const right = this.getSuperExpression(tokenizer);
            if (right instanceof ErrorNode) return { isArray: false, nodes: [right] };

            map.push(new MapElementNode(left, right));
        }

        if (map.length > 0)
            return { isArray: false, nodes: map };
    }

    /**
     * Returns the associated keyword node
     * @param keyword the current keyword being analysed
     * @param tokenizer the tokenizer reference
     */
    public getKeyword(keyword: string, tokenizer: Tokenizer): Node {
        switch (keyword) {
            // Return
            case "return":
                return new ReturnNode(this.getSuperExpression(tokenizer));
            // If
            case "if":
                const ifCondition = this.getSuperExpression(tokenizer);
                let ifTrue = (tokenizer.match(ETokenType.OpenBrace)) ? this.getBlock(tokenizer) : this.getSuperExpression(tokenizer);

                // ;
                if (tokenizer.match(ETokenType.SemiColon))
                    ifTrue = new EndOfInstructionNode(ifTrue);

                // Else?
                const firstKeyword = tokenizer.currentString;
                if (firstKeyword === "else" && tokenizer.match(ETokenType.Identifier)) {
                    const secondKeyword = tokenizer.currentString;

                    if (tokenizer.match(ETokenType.OpenBrace)) {
                        // Just else
                        return new IfNode(ifCondition, ifTrue, this.getBlock(tokenizer));
                    } else if (secondKeyword === "if" && tokenizer.match(ETokenType.Identifier)) {
                        // Else if
                        return new IfNode(ifCondition, ifTrue, this.getKeyword(secondKeyword, tokenizer));
                    } else {
                        // No braces
                        return new IfNode(ifCondition, ifTrue, this.getSuperExpression(tokenizer));
                    }
                }

                return new IfNode(ifCondition, ifTrue, null);
            // While
            case "while":
                const whileCondition = this.getSuperExpression(tokenizer);
                const whileRight = tokenizer.match(ETokenType.OpenBrace) ? this.getBlock(tokenizer) : this.getSuperExpression(tokenizer);
                return new WhileNode(whileCondition, whileRight);
            // For
            case "for":
                if (!tokenizer.match(ETokenType.OpenPar)) return new ErrorNode("Expected an opening parenthesis");

                const forInitalization = (!tokenizer.match(ETokenType.SemiColon)) ? this.getSuperExpression(tokenizer) : null;
                if (forInitalization instanceof ErrorNode) return forInitalization;
                if (forInitalization && !tokenizer.match(ETokenType.SemiColon)) return new ErrorNode("Expected a semicolon");

                const forCondition = (!tokenizer.match(ETokenType.SemiColon)) ? this.getSuperExpression(tokenizer) : null;
                if (forCondition instanceof ErrorNode) return forCondition;
                if (forCondition && !tokenizer.match(ETokenType.SemiColon)) return new ErrorNode("Expected a semicolon");

                const forStep = (!tokenizer.match(ETokenType.ClosePar)) ? this.getSuperExpression(tokenizer) : null;
                if (forStep instanceof ErrorNode) return forStep;

                if (forStep && !tokenizer.match(ETokenType.ClosePar)) return new ErrorNode("Expected a closing parenthesis");

                const forBlock = (tokenizer.match(ETokenType.OpenBrace)) ? this.getBlock(tokenizer) : this.getSuperExpression(tokenizer);
                if (forBlock instanceof ErrorNode) return forBlock;

                return new ForNode(forBlock, forInitalization, forCondition, forStep);
            // Do
            case "do":
                if (!tokenizer.match(ETokenType.OpenBrace)) return new ErrorNode("Expected an opening brace");
                const doBlock = this.getBlock(tokenizer);

                if (tokenizer.currentString !== "while" || !tokenizer.match(ETokenType.Identifier)) return new ErrorNode("Expected a while statement");
                const doCondition = this.getSuperExpression(tokenizer);

                return new DoNode(doBlock, doCondition);
            // Break
            case "break":
                return new BreakNode();

            // Not supported
            default:
                return new ErrorNode(`Keyword "${keyword}" not supported`);
        }
    }

    /**
     * Returns a block containing all the expressions inside the block
     * delimited by "{" and "}"
     * @param tokenizer the tokenizer reference
     */
    public getBlock(tokenizer: Tokenizer): Node {
        // Push a new scope
        this._scopes.push(new Scope(this.currentScope));

        // Get block's nodes
        const nodes: Node[] = [];
        while (!tokenizer.match(ETokenType.CloseBrace)) {
            const e = this.getSuperExpression(tokenizer);
            if (e instanceof ErrorNode) return e;
            nodes.push(e);

            // ;
            const end = this.isEndOfInstruction();
            if (end) nodes.push(end);
        }

        // Remove scope
        this._scopes.pop();

        return new BlockNode(nodes);
    }

    /**
     * Returns an object containing the arguments and the block
     * @param tokenizer the tokenizer reference
     */
    public getFunction(tokenizer: Tokenizer): { arguments?: Node[]; block?: Node; error?: Node } {
        // Push a new scope
        this._scopes.push(new Scope(this.currentScope));

        // In case of { -> ... }, ignore pointer
        tokenizer.match(ETokenType.Pointer);

        // Get block by default
        const args: Node[] = [];
        const nodes: Node[] = [];
        while (!tokenizer.match(ETokenType.CloseBrace)) {
            const e = this.getSuperExpression(tokenizer);
            if (e instanceof ErrorNode) return { error: e };

            // , or ->
            if (tokenizer.match(ETokenType.Comma) || tokenizer.match(ETokenType.Pointer)) {
                args.push(e);
                continue;
            }

            nodes.push(e);

            // ;
            const end = this.isEndOfInstruction();
            if (end) nodes.push(end);
        }

        // Remove scope
        this._scopes.pop();

        // Remove "var" keyword from variable declarations
        args.forEach(a => a instanceof VariableDeclarationNode && (a.noVar = true));

        // Convert last instruction of function to a return node as groovy guesses the returned value
        if (nodes.length > 0) {
            const end = nodes.pop();
            if (end instanceof EndOfInstructionNode) {
                nodes.push(new ReturnNode(nodes.pop()));
                nodes.push(end);
            } else {
                nodes.push(new ReturnNode(end));
            }
        }

        return { arguments: args, block: new BlockNode(nodes) };
    }
}

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

export class Analyser {
    private _tokenizer: Tokenizer;
    private _scopes: Scope[];

    private _root: Node = null;

    /**
     * Constructor
     * @param str the groovy string to parse
     */
    constructor(str: string) {
        this._tokenizer = new Tokenizer(str);
        this._scopes = [new Scope()];
    }

    /**
     * Analyses the code to return the root node
     */
    public analyse(): Node {
        return (this._root = this.getSuperExpression(this._tokenizer));
    }

    /**
     * Returns the root node
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

    public get currentScope(): Scope {
        return this._scopes[this._scopes.length - 1];
    }

    /**
     * Returns if the current 
     */
    public isEndOfInstruction(): Node {
        if (this._tokenizer.match(ETokenType.SemiColon))
            return new EndOfInstructionNode();
    }

    /**
     * Returns the top level expression
     * @param tokenizer the tokenizer reference
     */
    public getSuperExpression(tokenizer: Tokenizer): Node {
        // Expression
        const e = this.getExpression(tokenizer);

        // Assignement
        if (tokenizer.match(ETokenType.Equal)) return new AssignNode(e, this.getSuperExpression(tokenizer));

        // Ternary
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
     * Returns a node expression which is defined by a at least a term
     * @param tokenizer the tokenizer reference
     */
    public getExpression(tokenizer: Tokenizer): Node {
        let left = this.getTerm(tokenizer);
        while(!tokenizer.isEnd && !(left instanceof ErrorNode)) {
            const operator = tokenizer.currentToken;

            // "+"" or "-"" or "+="" or "-="" or "*=" or "/=""
            if (
                tokenizer.match(ETokenType.Plus) || tokenizer.match(ETokenType.Minus) ||
                tokenizer.match(ETokenType.SelfPlusAssign) || tokenizer.match(ETokenType.SelfMinusAssign) ||
                tokenizer.match(ETokenType.SelfMultAssign) || tokenizer.match(ETokenType.SelfDivAssign)
            ) {
                left = new BinaryOperatorNode(operator, left, this.getTerm(tokenizer));
                continue;
            }

            // <, <=, >, >= or ==
            if (
                tokenizer.match(ETokenType.Inferior) || tokenizer.match(ETokenType.Superior) ||
                tokenizer.match(ETokenType.InferiorOrEqual) || tokenizer.match(ETokenType.SuperiorOrEqual) ||
                tokenizer.match(ETokenType.Equality)
            ) {
                left = new ComparisonNode(operator, left, this.getSuperExpression(tokenizer));
                continue;
            }

            // "||"
            if (tokenizer.match(ETokenType.Or)) {
                left = new LogicNode(operator, left, this.getSuperExpression(tokenizer));
                continue;
            }

            // "<<" or ">>"
            if (tokenizer.match(ETokenType.BitwiseLeft) || tokenizer.match(ETokenType.BitwiseRight)) {
                left = new BinaryOperatorNode(operator, left, this.getSuperExpression(tokenizer));
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
            // "*" or "/" or "<=>"
            const operator = tokenizer.currentToken;
            if(tokenizer.match(ETokenType.Mult) || tokenizer.match(ETokenType.Div) || tokenizer.match(ETokenType.SpaceShip)) {
                left = new BinaryOperatorNode(operator, left, this.getFactor(tokenizer));
                continue;
            }

            // "&&"
            if (tokenizer.match(ETokenType.And)) {
                left = new LogicNode(operator, left, this.getSuperExpression(tokenizer));
                continue;
            }

            break;
        }

        return left;
    }

    /**
     * Returns a node which is defined by a factor or not
     * @param tokenizer the tokenizer reference
     * @example factor: "2", "-2", "-variable", "variable", "(...)", "-(...)"
     */
    public getFactor(tokenizer: Tokenizer): Node {
        const currentToken = tokenizer.currentToken;

        // Unary
        if (tokenizer.match(ETokenType.Minus) || tokenizer.match(ETokenType.Not))
            return new UnaryOperatorNode(currentToken, this.getFactor(tokenizer));

        // pre "--"" or pre "++""
        if (tokenizer.match(ETokenType.SelfMinus) || tokenizer.match(ETokenType.SelfPlus)) {
            const variableName = tokenizer.currentString;
            if (!tokenizer.match(ETokenType.Identifier)) return new ErrorNode("Expected an identifier");

            return new VariableNode(variableName, currentToken, null, this.currentScope.getVariableType(variableName));
        }

        return this.getPositiveFactor(tokenizer);
    }

    /**
     * Returns the node which has no factor (positive factor)
     * @param tokenizer the tokenizer reference
     * @example positive factor: "2", "variable", "(...)"
     */
    public getPositiveFactor(tokenizer: Tokenizer): Node {
        // Number
        const number = tokenizer.currentString;
        if (tokenizer.match(ETokenType.Number))
            return new ConstantNode(parseInt(number));

        // String
        const identifier = tokenizer.currentString;
        if (tokenizer.match(ETokenType.String))
            return new ConstantNode(identifier);

        // Identifier
        const variableOrTypeOrKeyword = tokenizer.currentString;
        if (tokenizer.match(ETokenType.Identifier)) {
            // Keyword?
            if (keywords.indexOf(variableOrTypeOrKeyword) !== -1) return this.getKeyword(variableOrTypeOrKeyword, tokenizer);

            // Variable
            const variableName = tokenizer.currentString;
            const currentToken = tokenizer.currentToken;
            if (!tokenizer.match(ETokenType.Identifier)) {
                // "++"" or "--""
                if (tokenizer.match(ETokenType.SelfMinus) || tokenizer.match(ETokenType.SelfPlus))
                    return new VariableNode(variableOrTypeOrKeyword, null, currentToken, this.currentScope.getVariableType(variableOrTypeOrKeyword));
                
                return new VariableNode(variableOrTypeOrKeyword, null, null, this.currentScope.getVariableType(variableOrTypeOrKeyword));
            }

            // Definition
            let variableDeclaration: VariableDeclarationNode = null;

            if (!tokenizer.match(ETokenType.Equal)) {
                variableDeclaration = new VariableDeclarationNode(variableOrTypeOrKeyword, variableName, null);
            } else {
                variableDeclaration = new VariableDeclarationNode(variableOrTypeOrKeyword, variableName, this.getSuperExpression(tokenizer));
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

            const l = this.getArrayOrMapList(tokenizer);
            if (!tokenizer.match(ETokenType.CloseBracket)) return new ErrorNode("Expected a closing bracket");
            return (l.isArray) ? new ArrayNode(l.nodes) : new MapNode(l.nodes as MapElementNode[]);
        }

        // Super expression
        if (!tokenizer.match(ETokenType.OpenPar)) return new ErrorNode("Expected constant or identifier or opening parenthesis");
        const e = this.getSuperExpression(tokenizer);
        if (e instanceof ErrorNode) return e;
        if (!tokenizer.match(ETokenType.ClosePar)) return new ErrorNode("Expected closing parenthesis.");
        return e;
    }

    /**
     * Returns the array of nodes being listed, separated by commas
     * @param tokenizer the tokenizer reference
     * @example "1, 2,3, 'coucou', []" etc.
     */
    public getArrayOrMapList(tokenizer: Tokenizer): { isArray: boolean; nodes: Node[] } {
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
            if (end)
                nodes.push(end);
        }

        // Remove scope
        this._scopes.pop();

        return new BlockNode(nodes);
    }
}

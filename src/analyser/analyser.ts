import { Tokenizer, ETokenType } from "../tokenizer/tokenizer";

import { Node } from "../nodes/node";
import { UnaryOperatorNode } from "../nodes/unaryOperator";
import { ConstantNode } from "../nodes/constant";
import { ErrorNode } from "../nodes/error";
import { BinaryOperatorNode } from "../nodes/binaryOperator";
import { IfNode } from "../nodes/ifNode";
import { VariableNode } from "../nodes/variable";
import { naviveTypes } from "./dictionary";
import { VariableDeclarationNode } from "../nodes/variableDeclaration";

export class Analyser {
    private _tokenizer: Tokenizer;
    private _root: Node;

    /**
     * Constructor
     * @param str the groovy string to parse
     */
    constructor(str: string) {
        this._tokenizer = new Tokenizer(str);
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
        return this.rootNode;
    }

    /**
     * Returns if the anlyser analysed all the code
     */
    public get isEnd(): boolean {
        return this._tokenizer.isEnd;
    }

    /**
     * Returns the top level expression
     * @param tokenizer the tokenizer reference
     */
    public getSuperExpression(tokenizer: Tokenizer): Node {
        // Variable declaration
        const variableType = tokenizer.currentString;
        if (tokenizer.match(ETokenType.Identifier)) {
            if (naviveTypes.indexOf(variableType) === -1) return new ErrorNode("");

            const variableName = tokenizer.currentString;
            if (!tokenizer.match(ETokenType.Identifier)) return new ErrorNode("Expected a variable name");
            if (!tokenizer.match(ETokenType.Equal)) return new VariableDeclarationNode(variableType, variableName, null);

            return new VariableDeclarationNode(variableType, variableName, this.getSuperExpression(tokenizer));
        }

        // Expression
        const e = this.getExpression(tokenizer);

        // Ternary
        if (!tokenizer.match(ETokenType.QuestionMark))
            return e;

        const ifTrue = this.getExpression(tokenizer);
        if (!tokenizer.match(ETokenType.Colon))
            return new ErrorNode("Expected ':'.");
        
        const ifFalse = this.getExpression(tokenizer);
        return new IfNode(e, ifTrue, ifFalse);
    }

    /**
     * Returns a node expression
     * @param tokenizer the tokenizer reference
     */
    public getExpression(tokenizer: Tokenizer): Node {
        let left = this.getTerm(tokenizer);
        while(!tokenizer.isEnd && !(left instanceof ErrorNode)) {
            const operator = tokenizer.currentToken;

            if (!tokenizer.match(ETokenType.Plus) && !tokenizer.match(ETokenType.Minus)) break;
            left = new BinaryOperatorNode(operator, left, this.getTerm(tokenizer));
        }

        return left;
    }

    /**
     * Returns a node which defines a term
     * @param tokenizer the tokenizer reference
     */
    public getTerm(tokenizer: Tokenizer): Node {
        let left = this.getFactor(tokenizer);
        while (!(left instanceof ErrorNode)) {
            const operator = tokenizer.currentToken;
            if(tokenizer.match(ETokenType.Mult) || tokenizer.match(ETokenType.Div)) {
                left = new BinaryOperatorNode(operator, left, this.getFactor(tokenizer));
            }

            break;
        }

        return left;
    }

    /**
     * Returns a node which defined by a factor or not
     * @param tokenizer the tokenizer reference
     * @example factor: "2", "-2", "-variable", "variable", "(...)", "-(...)"
     */
    public getFactor(tokenizer: Tokenizer): Node {
        if (tokenizer.match(ETokenType.Minus))
            return new UnaryOperatorNode(ETokenType.Minus, this.getFactor(tokenizer));

        return this.getPositiveFactor(tokenizer);
    }

    /**
     * Returns a node which has no unary expression
     * @param tokenizer the tokenizer reference
     * @example positive factor: "2", "variable", "(...)"
     */
    public getPositiveFactor(tokenizer: Tokenizer): Node {
        if (tokenizer.match(ETokenType.Number))
            return new ConstantNode(parseInt(tokenizer.currentString));

        const identifier = tokenizer.currentString;
        if (tokenizer.match(ETokenType.String))
            return new ConstantNode(identifier);

        if (tokenizer.match(ETokenType.Identifier))
            return new VariableNode(identifier);

        // Super expression
        if (!tokenizer.match(ETokenType.OpenPar)) return new ErrorNode("Expected constant or identifier or opening parenthesis");
        const e = this.getSuperExpression(tokenizer);
        if (e  instanceof ErrorNode) return e;
        if (!tokenizer.match(ETokenType.ClosePar)) return new ErrorNode("Expected closing parenthesis.");
        return e;
    }
}

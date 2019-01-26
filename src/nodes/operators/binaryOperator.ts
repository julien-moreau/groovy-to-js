import { Node, ENodeType } from "../node";
import { ETokenType } from "../../tokenizer/tokenizer";
import { ConstantNode } from "../variables/constant";

const unsupportedTypes: string[] = [
    "any",
    "def"
];

export class BinaryOperatorNode extends Node {
    /**
     * Constructor
     * @param data the binary operator data
     */
    constructor(public operator: ETokenType, public left: Node, public right: Node) {
        super(ENodeType.BinaryOperator);
    }

    /**
     * Returns the operator string
     */
    public get operatorString(): string {
        switch (this.operator) {
            case ETokenType.Minus: return "-";
            case ETokenType.Plus: return "+";
            case ETokenType.Mult: return "*";
            case ETokenType.Div: return "/";
            case ETokenType.BitwiseLeft: return "<<";
            case ETokenType.BitwiseRight: return ">>";
            case ETokenType.SelfPlusAssign: return "+=";
            case ETokenType.SelfMinusAssign: return "-=";
            case ETokenType.SelfMultAssign: return "*=";
            case ETokenType.SelfDivAssign: return "/=";
            default: throw new Error("Invalid Operator.");
        }
    }

    /**
     * Returns the method name assigned to the current operator
     */
    public get operatorMethodString(): string {
        switch (this.operator) {
            case ETokenType.Minus:
            case ETokenType.SelfMinusAssign:
                return "subtract";
            case ETokenType.Plus:
            case ETokenType.SelfPlusAssign:
                return "add";
            case ETokenType.Mult:
            case ETokenType.SelfMultAssign:
                return "multiply";
            case ETokenType.SpaceShip: return "spaceship";
            case ETokenType.BitwiseLeft: return "bitwiseLeft";
            default: return this.operatorString;
        }
    }

    /**
     * Returns the node's string
     */
    public toString(): string {
        // Divide
        if (this.operator === ETokenType.Div || this.operator === ETokenType.SelfDivAssign)
            return `(${this.left.toString()} ${this.operatorString} ${this.right.toString()})`;

        // Simple?
        if (this.operator !== ETokenType.SpaceShip && this.left instanceof ConstantNode && this.right instanceof ConstantNode)
            return `(${this.left.toString()} ${this.operatorString} ${this.right.toString()})`;

        return `${this.operatorMethodString}(${this.left.toString()}, ${this.right.toString()})`;
    }
}

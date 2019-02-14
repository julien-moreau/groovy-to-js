import { Node, ENodeType } from "../node";
import { ETokenType } from "../../tokenizer/tokenizer";

export type PrimitiveType = number | string | boolean;

export class ConstantNode extends Node {
    /**
     * Constructor
     * @param data the unary operator data
     */
    constructor(
        public readonly value: PrimitiveType,
        public readonly type: ETokenType,
        public readonly comments: string[]
    ) {
        super(ENodeType.Constant);
    }

    /**
     * Returns the value of the constant node transformed to a string
     */
    public get valueString(): string {
        switch (this.type) {
            case ETokenType.DoubleQuotedString: return this.value.toString().replace(/"/g, '`');
            case ETokenType.TripleDoubleQuotedString: return this.value.toString().replace(/"""/g, '`');
            case ETokenType.TripleSingleQuotedString: return this.value.toString().replace(/'''/g, '`');
            default: return this.value.toString();
        }
    }

    /**
     * Returns the node's string
     */
    public toString(): string {
        return `${this.commentsToString()}${this.valueString}`;
    }
}

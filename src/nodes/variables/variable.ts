import { Node, ENodeType } from "../node";
import { ETokenType } from "../../tokenizer/tokenizer";

export class VariableNode extends Node {
    /**
     * Constructor
     * @param name: the variable's name
     */
    constructor(
        public readonly name: string,
        public readonly preOperator: ETokenType = null,
        public readonly postOperator: ETokenType = null,
        public readonly type: string = "any",
        public readonly comments: string[] = []
    ) {
        super(ENodeType.Variable);
    }

    public get preOperatorString(): string {
        switch (this.preOperator) {
            case ETokenType.SelfMinus: return "--";
            case ETokenType.SelfPlus: return "++";
            default: return "";
        }
    }

    public get postOperatorString(): string {
        switch (this.postOperator) {
            case ETokenType.SelfMinus: return "--";
            case ETokenType.SelfPlus: return "++";
            default: return "";
        }
    }

    /**
     * Returns the node's string
     */
    public toString(): string {
        return `${this.commentsToString()}${this.preOperatorString}${this.name}${this.postOperatorString}`;
    }
}

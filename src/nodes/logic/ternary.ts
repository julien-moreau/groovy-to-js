import { Node, ENodeType } from "../node";

export class TernaryNode extends Node {
    /**
     * Constructor
     * @param data the binary operator data
     */
    constructor(
        public readonly condition: Node,
        public readonly ifTrue: Node,
        public readonly ifFalse: Node
    ) {
        super(ENodeType.Ternary);
    }

    /**
     * Returns the node's string
     */
    public toString(): string {
        return `${this.condition.toString()} ? ${this.ifTrue.toString()} : ${this.ifFalse.toString()}`;
    }
}

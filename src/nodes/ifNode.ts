import { Node, ENodeType } from "./node";

export class IfNode extends Node {
    /**
     * Constructor
     * @param data the binary operator data
     */
    constructor(public condition: Node, public ifTrue: Node, public ifFalse: Node) {
        super(ENodeType.IfNode);
    }

    /**
     * Returns the node's string
     */
    public toString(): string {
        return `${this.condition.toString()} ? ${this.ifTrue.toString()} : ${this.ifFalse.toString()}`;
    }
}

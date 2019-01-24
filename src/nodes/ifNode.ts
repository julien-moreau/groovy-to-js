import { Node, ENodeType } from "./node";

export class IfNode extends Node {
    /**
     * Constructor
     * @param data the binary operator data
     */
    constructor(public condition: Node, public ifTrue: Node, public ifFalse: Node) {
        super(ENodeType.IfNode);
    }
}

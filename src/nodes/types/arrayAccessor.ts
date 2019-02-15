import { Node, ENodeType } from "../node";
import { VariableNode } from "../variables/variable";

export class ArrayAccessorNode extends Node {
    /**
     * Constructor
     * @param data the unary operator data
     */
    constructor(public readonly variable: VariableNode, public readonly elements: Node[]) {
        super(ENodeType.ArrayAccessor);
    }

    /**
     * Returns the node's string
     */
    public toString(): string {
        return `${this.variable.toString()}[${this.elements.map(e => e.toString()).join(", ")}]`;
    }
}

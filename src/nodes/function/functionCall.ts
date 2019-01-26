import { Node, ENodeType } from "../node";

export class FunctionCallNode extends Node {
    /**
     * Constructor
     */
    constructor(public variable: Node, public args: Node[]) {
        super(ENodeType.FunctionCall);
    }

    /**
     * Returns the node's string
     */
    public toString(): string {
        return `${this.variable.toString()}(${this.args.map(a => a.toString()).join(", ")})`;
    }
}

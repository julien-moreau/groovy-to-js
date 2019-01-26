import { Node, ENodeType } from "../node";

export class FunctionCallNode extends Node {
    /**
     * Constructor
     */
    constructor(public name: string, public args: Node[]) {
        super(ENodeType.FunctionCall);
    }

    /**
     * Returns the node's string
     */
    public toString(): string {
        return `${this.name}(${this.args.map(a => a.toString()).join(", ")})`;
    }
}

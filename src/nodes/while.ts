import { Node, ENodeType } from "./node";

const template = 
`while ({{condition}}) {
    {{right}}
}`;

export class WhileNode extends Node {
    /**
     * Constructor
     * @param condition the condition node to stop loop
     * @param right the right node (block or instruction)
     */
    constructor(public condition: Node, public right: Node) {
        super(ENodeType.While);
    }

    /**
     * Returns the node's string
     */
    public toString(): string {
        return template
            .replace("{{condition}}", this.condition.toString())
            .replace("{{right}}", this.right.toString());
    }
}

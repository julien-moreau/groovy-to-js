import { Node, ENodeType } from "../node";

const template = 
`do
    {{block}}
while ({{condition}})`;

export class DoNode extends Node {
    /**
     * Constructor
     * @param right the code inside the loop
     * @param init the initialization part
     * @param condition the condition part
     * @param step the step part
     */
    constructor(
        public readonly block: Node,
        public readonly condition: Node
    ) {
        super(ENodeType.Do);
    }

    /**
     * Returns the node's string
     */
    public toString(): string {
        return template
            .replace("{{block}}", this.block.toString())
            .replace("{{condition}}", this.condition.toString());
    }
}

import { Node, ENodeType } from "./node";

const template = 
`{
    {{nodes}}
}`

export class BlockNode extends Node {
    /**
     * Constructor
     * @param nodes all the nodes available in the block
     */
    constructor(public readonly nodes: Node[]) {
        super(ENodeType.Block);
    }

    /**
     * Returns the node's string
     */
    public toString(): string {
        return template.replace("{{nodes}}", this.nodes.map(n => n.toString()).join("\n"));
    }
}

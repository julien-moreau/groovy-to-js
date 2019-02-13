import { Node, ENodeType } from "../node";

const templateSingle = 
`if ({{condition}})
    {{ifTrue}}`

const templateFull = 
`if ({{condition}})
    {{ifTrue}}
else
    {{ifFalse}}`

export class IfNode extends Node {
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
        const base = this.ifFalse ? templateFull : templateSingle;
        return base
            .replace("{{condition}}", this.condition.toString())
            .replace("{{ifTrue}}", this.ifTrue.toString())
            .replace("{{ifFalse}}", (this.ifFalse || "").toString());
    }
}

import { Node, ENodeType } from "./node";

const template = 
`for ({{init}} {{condition}} {{step}}) {
    {{right}}
}`;

export class ForNode extends Node {
    /**
     * Constructor
     * @param right the code inside the loop
     * @param init the initialization part
     * @param condition the condition part
     * @param step the step part
     */
    constructor(
        public right: Node,
        public init: Node = null,
        public condition: Node = null,
        public step: Node = null
    ) {
        super(ENodeType.For);
    }

    /**
     * Returns the node's string
     */
    public toString(): string {
        return template
            .replace("{{init}}", this.init ? this.init.toString() : ";")
            .replace("{{condition}}", this.condition ? this.condition.toString() : ";")
            .replace("{{step}}", this.step ? this.step.toString() : "")
            .replace("{{right}}", this.right.toString());
    }
}

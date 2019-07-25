import { Node, ENodeType } from "../node";

const template =
`switch ({{condition}}) {
    {{cases}}
}`;

export class CaseNode extends Node {
    /**
     * Constructor
     * @param type the node type
     */
    constructor(
        public readonly condition: Node,
        public readonly block: Node,
        public readonly brk: Node
    ) {
        super(ENodeType.Case);
    }

    /**
     * Returns the node's string
     */
    public toString(): string {
        return `case ${this.condition.toString()}: ${this.block.toString()} ${this.brk ? this.brk.toString() : ""}`;
    }
}

export class SwitchNode extends Node {
    /**
     * Constructor
     * @param type the node type
     */
    constructor(
        public readonly condition: Node,
        public readonly cases: Node[]
    ) {
        super(ENodeType.Switch);
    }

    /**
     * Returns the node's string
     */
    public toString(): string {
        return template.replace('{{condition}}', this.condition.toString())
                       .replace('{{cases}}', this.cases.map(c => c.toString()).join("\n"));
    }
}

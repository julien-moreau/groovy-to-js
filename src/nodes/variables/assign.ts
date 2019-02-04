import { Node, ENodeType } from "../node";

export class AssignNode extends Node {
    /**
     * Constructor
     */
    constructor(
        public readonly left: Node,
        public readonly right: Node,
        public comments: Node[] = []
    ) {
        super(ENodeType.Assign);
    }

    /**
     * Returns the node's string
     */
    public toString(): string {
        return `${this.commentsToString()}${this.left.toString()} = ${this.right.toString()}`;
    }
}

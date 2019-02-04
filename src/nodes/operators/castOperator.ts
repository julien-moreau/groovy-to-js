import { Node, ENodeType } from "../node";

export class CastOperatorNode extends Node {
    /**
     * Constructor
     */
    constructor(public type: string, public right: Node) {
        super(ENodeType.CastOperator);
    }

    /**
     * Returns the node's string
     */
    public toString(): string {
        switch (this.type) {
            case "short": case "Short":
            case "int":   case "Integer":
            case "long":   case "Long":
                return `${this.commentsToString()}parseInt(${this.right.toString()})`;
            case "float": case "Float":
            case "double": case "Double":
                return `${this.commentsToString()}parseFloat(${this.right.toString()})`;
            case "char": case "Character":
            case "String":
                return `${this.commentsToString()}${this.right.toString()}.toString()`;
            default: return `${this.commentsToString()}${this.right.toString()}`;
        }
    }
}

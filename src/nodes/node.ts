export enum ENodeType {
    Constant = 0,
    UnaryOperator = 1,
    BinaryOperator = 2,
    IfNode = 3,
    Variable = 4,
    VariableDeclaration = 5,
    Error = 100
}

export class Node {
    /**
     * The node type
     */
    public nodeType: ENodeType;

    /**
     * Constructor
     * @param type the node type
     */
    constructor(type: ENodeType) {
        this.nodeType = type;
    }

    /**
     * Returns the node's string
     */
    public toString(): string {
        throw new Error("toString must be implemented");
    }
}

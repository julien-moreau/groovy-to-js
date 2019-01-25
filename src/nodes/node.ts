export enum ENodeType {
    // Basic
    Constant = 0,
    UnaryOperator = 1,
    BinaryOperator = 2,
    Ternary = 3,
    Variable = 4,
    VariableDeclaration = 5,
    Array = 6,

    // Keywords
    Return = 100,
    If = 101,

    Block = 200,

    // Special
    EndOfInstruction = 1000,
    Error = 1001
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

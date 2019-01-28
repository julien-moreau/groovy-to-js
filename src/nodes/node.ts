export enum ENodeType {
    // Basic
    Constant = 0,
    UnaryOperator = 1,
    BinaryOperator = 2,
    Ternary = 3,
    Variable = 4,
    VariableDeclaration = 5,
    Array = 6,
    Comparison = 7,
    Assign = 8,
    LogicOperator = 9,
    Map = 10,
    MapElement = 11,
    FunctionDeclaration = 12,
    FunctionCall = 13,
    CastOperator = 14,

    // Keywords
    Return = 100,
    If = 101,
    While = 102,
    For = 103,
    Break = 104,
    Do = 105,

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

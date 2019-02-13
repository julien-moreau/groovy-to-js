import { Node, ENodeType } from "../node";
import { ConstantNode } from "./constant";
import { VariableNode } from "./variable";
import { ArrayNode } from "../types/array";
import { MapNode } from "../types/map";

export class VariableDeclarationNode extends Node {
    /**
     * Defines if the var keyword should used when declaring the variable
     * Typically set to "true" when being a function argument definition
     */
    public noVar: boolean = false;

    /**
     * Constructor
     * @param name: the variable's name
     * @param type the variable type
     * @param value the variable's value
     */
    constructor(
        public readonly type: string,
        public readonly name: string,
        public readonly value: Node
    ) {
        super(ENodeType.VariableDeclaration);
    }

    /**
     * Returns the node's string
     */
    public toString(): string {
        if (!this.value) return `${this.commentsToString()}${this.noVar ? "" : "var"} ${this.name}`;
        return `${this.commentsToString()}${this.noVar ? "" : "var"} ${this.name} = ${this.value.toString()}`;
    }

    /**
     * Returns the type of the given node (ConstantNode, ArrayNode, etc.)
     * @param node the node to test
     */
    public static GetTypeFromNode(node: Node): string {
        if (node instanceof ConstantNode) return typeof(node.value);
        if (node instanceof VariableNode) return node.type;
        if (node instanceof ArrayNode) return "array";
        if (node instanceof MapNode) return "map";

        return "";
    }
}

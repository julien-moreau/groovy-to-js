import { Node, ENodeType } from "../node";

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
    constructor(public type: string, public name: string, public value: Node) {
        super(ENodeType.VariableDeclaration);
    }

    /**
     * Returns the node's string
     */
    public toString(): string {
        if (!this.value) return `${this.noVar ? "" : "var"} ${this.name}`;
        return `${this.noVar ? "" : "var"} ${this.name} = ${this.value.toString()}`;
    }
}

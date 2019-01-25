import { Node, ENodeType } from "../node";

export class VariableDeclarationNode extends Node {
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
        if (!this.value) return `var ${this.name}`;
        return `var ${this.name} = ${this.value.toString()}`;
    }
}

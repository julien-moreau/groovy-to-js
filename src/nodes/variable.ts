import { Node, ENodeType } from "./node";

export class VariableNode extends Node {
    /**
     * Constructor
     * @param name: the variable's name
     */
    constructor(public name: string) {
        super(ENodeType.Error);
    }
}

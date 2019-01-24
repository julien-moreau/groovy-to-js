import { Node, ENodeType } from "./node";


export class ErrorNode extends Node {
    /**
     * Constructor
     * @param data the unary operator data
     */
    constructor(public message: string) {
        super(ENodeType.Error);
    }
}

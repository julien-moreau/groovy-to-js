import { Node, ENodeType } from "../node";
import { translation } from "../../analyser/dictionary";

export class FunctionCallNode extends Node {
    /**
     * Constructor
     */
    constructor(public variable: Node, public args: Node[]) {
        super(ENodeType.FunctionCall);
    }

    /**
     * Returns the node's string
     */
    public toString(): string {
        const variable = this.variable.toString();
        const members = variable.split(".");
        if (members.length === 1) return `${variable}(${this.args.map(a => a.toString()).join(", ")})`;

        const method = members[members.length - 1];
        const effective = translation.array.methods[method] || method;

        return `${members.slice(0, members.length - 1).join(".") + "." + effective}(${this.args.map(a => a.toString()).join(", ")})`;
    }
}

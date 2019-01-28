import { Node, ENodeType } from "../node";
import { translation } from "../../analyser/dictionary";
import { VariableNode } from "../variables/variable";

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
        const base = `${this.variable.toString()}(${this.args.map(a => a.toString()).join(", ")})`;

        if (!(this.variable instanceof VariableNode)) return base;
        
        const dict = translation[this.variable.type];
        if (!dict) return base;

        const variable = this.variable.toString();
        const members = variable.split(".");
        if (members.length === 1) return base;

        const method = members[members.length - 1];
        const effective = translation.array.methods[method] || method;

        return `${members.slice(0, members.length - 1).join(".") + "." + effective}(${this.args.map(a => a.toString()).join(", ")})`;
    }
}

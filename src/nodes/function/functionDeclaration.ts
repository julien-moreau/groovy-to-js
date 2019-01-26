import { Node, ENodeType } from "../node";

const template =
`var {{name}} = function({{args}})
    {{block}}`;

export class FunctionDeclarationNode extends Node {
    /**
     * Constructor
     */
    constructor(public name: string, public args: Node[], public block: Node) {
        super(ENodeType.FunctionDeclaration);
    }

    /**
     * Returns the node's string
     */
    public toString(): string {
        return template
            .replace("{{name}}", this.name)
            .replace("{{args}}", this.args.map(a => a.toString()).join(", "))
            .replace("{{block}}", this.block.toString());
    }
}

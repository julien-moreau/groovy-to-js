import { Node, ENodeType } from "../node";

const template =
`
{{comments}}
function({{args}})
{{block}}`;

const templateFull =
`var {{name}} = function({{args}})
{{block}}`;

export class FunctionDeclarationNode extends Node {
    /**
     * Constructor
     */
    constructor(
        public readonly name: string,
        public readonly args: Node[],
        public readonly block: Node
    ) {
        super(ENodeType.FunctionDeclaration);
    }

    /**
     * Returns the node's string
     */
    public toString(): string {
        const base = this.name ? templateFull : template;
        return base
            .replace("{{comments}}", this.commentsToString())
            .replace("{{name}}", this.name)
            .replace("{{args}}", this.args.length === 0 ? "it" : this.args.map(a => a.toString()).join(", "))
            .replace("{{block}}", this.block.toString());
    }
}

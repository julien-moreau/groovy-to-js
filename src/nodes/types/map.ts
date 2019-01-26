import { Node, ENodeType } from "../node";

const template = 
`{
    {{elements}}
}`;

export class MapElementNode extends Node {
    /**
     * Constructor
     */
    constructor(public left: Node, public right: Node) {
        super(ENodeType.MapElement);
    }

    /**
     * Returns the node's string
     */
    public toString(): string {
        return `${this.left.toString()}: ${this.right.toString()}`;
    }
}

export class MapNode extends Node {
    /**
     * Constructor
     */
    constructor(public readonly elements: MapElementNode[]) {
        super(ENodeType.Map);
    }

    /**
     * Returns the node's string
     */
    public toString(): string {
        return template.replace("{{elements}}", this.elements.map(e => e.toString()).join(",\n"));
    }
}

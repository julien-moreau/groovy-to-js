import { VariableDeclarationNode } from "../nodes/variables/variableDeclaration";
import { ConstantNode } from "../nodes/variables/constant";

export class Scope {
    public variables: VariableDeclarationNode[] = [];

    /**
     * Constructor
     * @param parent the parent scope
     */
    constructor(public parent: Scope = null) { }

    /**
     * Returns a variable available (or not) in the scope
     * @param name the name of the variable to find in scope
     */
    public getVariable(name: string): VariableDeclarationNode {
        const v = this.variables.find(v => v.name === name);
        if (!v && this.parent)
            return this.parent.getVariable(name);

        return v;
    }

    /**
     * Returns a variable type available (or not) in the scope
     * @param name the name of the variable to find in scope
     */
    public getVariableType(name: string): string {
        const v = this.getVariable(name);
        if (!v) return "any";

        if (v.value instanceof ConstantNode && v.value.value !== undefined) {
            const type = typeof(v.value.value);

            if (type !== "object" && type !== "function")
                return typeof(v.value.value);
        }

        return v.type;
    }
}

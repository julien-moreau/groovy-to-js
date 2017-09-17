import Scope from './scope';

export enum VariableType {
    ANY = 0,
    NUMBER,
    ARRAY,
    MAP,
    STRING,
    FUNCTION
}

export default class Variable {
    // Public members
    public name: string;
    public type: VariableType;

    /**
     * Constructor
     * @param name The variable's name 
     * @param type The variable type
     * @param value The variable's value
     */
    constructor (scope: Scope, name: string, type: VariableType) {
        this.name = name;
        this.type = type;

        scope.variables.push(this);
    }

    public static find (scope: Scope, predicate: (variable: Variable) => boolean): Variable {
        let parent = scope;
        while (parent) {
            for (const v of parent.variables) {
                if (predicate(v))
                    return v;
            }

            parent = scope.parent;
        }

        return {
            name: '',
            type: VariableType.ANY
        };
    }
}
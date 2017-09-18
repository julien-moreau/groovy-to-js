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

    /**
     * Finds a variable using the given predicate
     * @param scope the scope to start with
     * @param predicate the predicate
     */
    public static find (scope: Scope, predicate: (variable: Variable) => boolean): Variable {
        let parent = scope;
        while (parent) {
            for (const v of parent.variables) {
                if (predicate(v))
                    return v;
            }

            parent = parent.parent;
        }

        return null;
    }

    /**
     * Builds a scope using the given object
     * @param obj the obj representing the scope
     */
    public static buildFrom (object: any): Scope {
        const scope = new Scope(null);

        const add = (object: any, name: string = '') => {
            for (const thing in object) {
                const obj = object[thing];
                const type = typeof obj;
    
                switch (type) {
                    case 'string': new Variable(scope, name + thing, VariableType.STRING); break;
                    case 'number': new Variable(scope, name + thing, VariableType.NUMBER); break;
                    case 'function': new Variable(scope, name + thing, VariableType.FUNCTION); break;
                    case 'object':
                        if (obj instanceof Array) {
                            new Variable(scope, name + thing, VariableType.ARRAY);
                        } else {
                            new Variable(scope, name + thing, VariableType.MAP);
                            add(obj, thing + '.');
                        }
                        break;
                    default: debugger; break;
                }
            }
        };

        add(object);

        return scope;
    }
}
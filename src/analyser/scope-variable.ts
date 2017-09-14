import Scope, { ScopeElementType } from './scope';

export default class Variable extends Scope {
    // Public members
    public name: string;
    public type: ScopeElementType;

    public value: string;

    /**
     * Constructor
     * @param name The variable's name 
     * @param type The variable type
     * @param value The variable's value
     */
    constructor (parent: Scope, name: string, type: ScopeElementType, value: string = null) {
        super(parent);
        
        this.name = name;
        this.value = value;
        this.type = type;
    }
}
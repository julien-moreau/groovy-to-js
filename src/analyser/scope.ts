import Variable from './scope-variable';

export default class Scope {
    // Public members
    public parent: Scope = null;
    public variables: Variable[] = [];

    /**
     * Constructor
     * @param parent the parent scope
     */
    constructor (parent: Scope = null) {
        this.parent = parent;
    }
}
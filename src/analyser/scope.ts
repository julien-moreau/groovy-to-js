export enum ScopeElementType {
    ANY = 0,
    NUMBER,
    ARRAY,
    STRING,
    FUNCTION
}

export default class Scope {
    // Public members
    public name: string = '';
    public type: ScopeElementType = ScopeElementType.ANY;
    
    public parent: Scope = null;
    public elements: Scope[] = [];

    /**
     * Constructor
     * @param parent the parent scope
     */
    constructor (parent: Scope = null) {
        this.parent = parent;
    }

    /**
     * Returns if a scope element exists following the given predicate function
     * @param root the root scope
     * @param predicate the predicate function
     */
    public static getType<T extends Scope> (root: T, name: string): ScopeElementType {
        const element = this.findElement(root, e => e.name === name);
        return element ? element.type : ScopeElementType.ANY;
    }

    /**
     * Returns if a scope element exists following the given predicate function
     * @param root the root scope
     * @param predicate the predicate function
     */
    public static exists<T extends Scope> (root: T, predicate: (element: T) => boolean): boolean {
        return this.findElement(root, predicate) !== null;
    }

    /**
     * Finds a scope element following the given predicate function
     * @param root the root scope
     * @param predicate the predicate function
     */
    public static findElement<T extends Scope> (root: T, predicate: (element: T) => boolean): Scope {
        let parent = root;
        
        for (const e of parent.elements) {
            if (predicate(<T> e))
                return e;
        }

        while ((parent = <T> parent.parent)) {
            for (const e of parent.elements) {
                if (predicate(<T> e))
                    return e;
            }
        }

        return null;
    }
}
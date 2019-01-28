export interface IContext {
    [index: string]: string;
}

export class Context {
    /**
     * Builds a context map from the given context object
     * @param ctx the base context object where to code will run
     */
    public static BuildFrom(ctx: any): IContext {
        return this._Add(ctx, ctx);
    }

    /**
     * Adds all keys of the current object to the context map
     */
    private static _Add(ctx: any, current: any, property: string = ""): IContext {
        for (const k in current) {
            const value = current[k];
            const type = typeof(value);
            const name = property + k;

            switch (type) {
                case "string":
                case "number":
                case "boolean":
                case "function":
                    ctx[name] = type;
                    break;

                case "object":
                    if (value instanceof Array) {
                        ctx[name] = "array";
                    } else {
                        ctx[name] = "map";
                        this._Add(ctx, value, `${property}${name}.`);
                    }
                    break;

                default:
                    debugger; // Should not happen    
                    break;
            }
        }

        return ctx;
    }
}

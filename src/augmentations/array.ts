export function augmentifyArray (ctor: ArrayConstructor = Array): ArrayConstructor {
    /**
     * Returns the length of the array.
     */
    ctor.prototype['size'] = function () {
        return this.length;
    };

    return Array;
}
export = StorageObject;
/**
 * StorageObject: localStorage or sessionStorage as an object
 * @param {string} store_key - The name of the string in the store that the data resides at
 * @param {StorageObjectOptions} [options] - Optional configuration
 * @returns {Object} - The object that your code interfaces with
 */
declare function StorageObject(store_key: string, options: StorageObjectOptions): Object;
declare namespace StorageObject {
    export { StorageObjectOptions };
}
type StorageObjectOptions = {
    /**
     * - Values when initializing new Object
     */
    initialValues?: Object;
    /**
     * - Storage object for the JSON string
     */
    store?: Object;
    /**
     * - Debounce time in milliseconds
     */
    debounceTime?: number;
    /**
     * - Set to true for fixed intervals, sliding otherwise
     */
    debounceFixed?: boolean;
};

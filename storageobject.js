/**
 * @typedef StorageObjectOptions
 * @type {Object}
 * @property {Object} [initialValues={}] - Values when initializing new Object
 * @property {Object} [store=window.localStorage] - Storage object for the JSON string
 * @property {number} [debounceTime=100] - Debounce time in milliseconds
 * @property {boolean} [debounceFixed=false] - True for fixed intervals, sliding otherwise
 */
const defaults = {
    initialValues: {},
    store: window.localStorage,
    debounceTime: 100,
    debounceFixed: false,
};

/**
 * StorageObject: localStorage or sessionStorage as an object
 * @param {string} store_key - The name of the string in the store
 * @param {StorageObjectOptions} [options] - Optional configuration
 * @returns {Object} - The object that your code interfaces with
 */
function StorageObject(store_key, options={}) {
    
    let cache = {};
    const opt = Object.assign({}, options);
    let timer = null

    const proxify = (obj) => {
        let validTypes = ["string", "number", "object", "undefined", "boolean"];
        if (!validTypes.includes(typeof obj)) {
            throw new Error("StorageObject does not store this variable type");
        }
        if (typeof obj == "object" && obj !== null) {
            if (obj instanceof Date) {
                return { __SO_date: obj.getTime() };
            }
            for (const key in obj) {
                obj[key] = proxify(obj[key]);
            }
            return new Proxy(obj, {
                get(target, name) {
                    const val = target[name];
                    if (val && typeof val == "object" && val.__SO_date) {
                        return new Date(val.__SO_date);
                    }
                    return val;
                },
                set(target, name, value) {
                    target[name] = proxify(value);
                    debounceWrite(cache);
                    return true;
                },
                deleteProperty(target, name) {
                    delete target[name];
                    debounceWrite(cache);
                    return true;
                },
            });
        }
        return obj;
    }

    const write = () => {
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
        opt.store[store_key] = JSON.stringify(cache);
    }
    Object.defineProperty(cache, 'write', { value: write });

    const debounceWrite = () => {
        if (opt.debounceTime == 0) {
            write();
            return;
        }
        if (timer) {
            if (opt.debounceFixed) return;
            clearTimeout(timer);
        }
        timer = setTimeout(write, opt.debounceTime);
    }

    const clear = () => {
        for (var key in cache) delete cache[key];
        Object.assign(cache, opt.initialValues);
        proxify(cache);
        write();      
    }
    Object.defineProperty(cache, 'clear', { value: clear });
    
    const unload = () => { if (timer) write(); };

    try {
        Object.assign(cache, JSON.parse(opt.store[store_key]));
    } catch {
        Object.assign(cache, opt.initialValues);
    }
    cache = proxify(cache);
    write();
    if (opt.debounceTime > 0) {
        window.addEventListener("unload", unload);
    }
    return cache;

}

module.exports = StorageObject;

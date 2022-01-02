const { test } = require("@jest/globals");
const StorageObject = require("..");

const store = {};
const store_key = "test_key";
const initialValues = {
    a: 2,
    b: 3,
    c: [4, 5],
    d: { e: 6 },
    f: [{ g: 6 }],
    h: new Date(),
    i: null,
};
var cache = new StorageObject(store_key, {
    initialValues: initialValues,
    store: store,
});

test("Everything stored and retrieved intact", () => {
    // toEqual should do the whole thing but uses JSON.stringify which crashes on Date.
    for (k in Object.keys(initialValues)) {
        expect(cache[k]).toEqual(initialValues[k]);
    }
    expect(cache.h instanceof Date).toBe(true);
});

const newValues = {
    a: 42,
    b: "string",
    c: 23,
    d: { val: "new prop as obj" },
}

test("No errors assigning", () => {
    expect(() => {
        Object.assign(cache, newValues);
    }).not.toThrow(Error);
});

test("Write to backing storage is not immediate", () => {
    expect(JSON.parse(store[store_key]).a).not.toEqual(newValues.a);
});

test("But after 110 ms it's there", (done) => {
    callback = () => {
        try {
            expect(JSON.parse(store[store_key]).a).toEqual(newValues.a);
            done();
        } catch (error) {
            done(error);
        }
    }
    setTimeout(callback, 110);
});


test("clear() works", () => {
    cache.clear();
    for (k in Object.keys(initialValues)) {
        expect(cache[k]).toEqual(initialValues[k]);
    }
});

test("unload event writing works", (done) => {
    cache.test = 'before';
    cache.write();
    cache.test = 'after';
    window.dispatchEvent(new Event('unload'));
    callback2 = () => {
        try {
            expect(JSON.parse(store[store_key]).test).toBe('after');
            done();
        } catch (error) {
            done(error);
        }
    }
    setTimeout(callback2, 10);
});

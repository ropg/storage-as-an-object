const StorageObject = require("..");

const store1 = {};
const store2 = {};
const A = new StorageObject("A", {store: store1})
const B = new StorageObject("B", {store: store2})
const C = new StorageObject("C", {store: store2})

A.test="test";
A.write()

B.test="lala";
B.write();

C.test="hoho";
C.write();

test("Objects not interfering", () => {
    expect(A.test).toBe("test");
    expect(B.test).toBe("lala");
    expect(C.test).toBe("hoho");
});

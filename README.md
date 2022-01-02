[![npm version](https://badge.fury.io/js/storage-as-an-object.svg)](https://badge.fury.io/js/storage-as-an-object) [![license](https://badgen.net/github/license/ropg/storage-as-an-object)](https://github.com/ropg/storage-as-an-object/blob/main/LICENSE) [![github](https://img.shields.io/github/last-commit/ropg/storage-as-an-object)](https://github.com/ropg/storage-as-an-object)

# Storage as an object: StorageObject

**localStorage or sessionStorage for objects**



&nbsp;

### In short

* Store arbitrary depth objects in `localStorage` or `sessionStorage`.
* `localStorage` stores only strings, `StorageObject` keeps the types intact. (Even `Date`!)
* Updates storage when any property in the object is changed.
* Debounced: no performance hit when you write often.


<hr>

### Get started

If you're using a development framework, you can probably install this in the project directory with:

```text
npm install storage-as-an-object --save
```

And then in your code, simply say:

```js
const StorageObject = require('storage-as-an-object');
```

If you're on your own, you might try:

```js
<script type="module">
import StorageObject from 'https://cdn.skypack.dev/storage-as-an-object';

// [[ your code here ]]

</script>
```

Either way, once you have `StorageObject`, you can create objects that you can assign properties to and use like any other.

```js
// Defaults to using window.localStorage, but takes any other object as argument
// e.g.:   const myStore = CompressedStorage(window.sessionStorage)
const myObject = new StorageObject('test_key');

myObject.a = 10;
myObject.b = null;
myObject.c = { x: 33, y: 'test', z: {} };
```

Every time your code changes something, the object will automatically be written (as a JSON string) to a key named `test_key` on the `localStorage` object, so your changes will still be there after you press reload, or the next time your code runs on the same browser.

<hr>

### Configuration options

You can create your object with two arguments. The first is mandatory, and it's the name of the key that your object resides at in the underlying `Storage` object. The second is an optional object that holds configuration information.

&nbsp;

#### Storing somewhere else: `store`

You can specify the underlying storage, which defaults to `window.localStorage`. If you would like your object to live in `sessionStorage` instead, you would specify:

```js
const myObject = new StorageObject('test_key', { store: window.sessionStorage });
```

&nbsp;

#### Setting up defaults: `initialValues`

You can provide some default values for your object. These will appear when the object is initialised, and after you clear it with `.clear()` (see below).

```js
const myObject = new StorageObject('test_key', {
    initialValues: {
        projectName: 'MyProject',
        projectOwner: '<Your Name Here>'
    }
};
```

&nbsp;

#### Debouncing: `debounceTime` & `debounceFixed`

The `Storage` class in JS only supports a flat collection of strings. The object that your code talks to is stored as a string, in JSON format. Every time some little value in a sub-sub object changes, the whole thing needs to be re-written. With larger objects and frequent changes, this starts resulting in noticable lag in the browser.

By default, `StorageObject` will reflect any changes to the object immediately, but only write them to storage after nothing has been written for 100 milliseconds. So when you code changes 15 values in your `StorageObject` in quick succession when your page loads or when a user presses a button, only one JSON conversion and write is performed. If data is waiting to be written when the window's `unload` event happens, the write is performed immediately. This default configuration should be fine for almost all scenarios.

But you can set a diferent time by changing the `debounceTime`; setting it to zero means all writes happen immediately. If you set `debounceFixed` to `true`, writes happen the set number of milliseconds after the first write, not the last one. To explain, consider a scenario where something in your code on some page writes something to the object every 50 ms. By default, a write to storage would happen 100 ms after the last write to your object, so nothing would ever be written (until your code or the user navigate away causing the `unload` event to fire). You can configure like below to make sure that in this scenario, data will be written every second even if writing is sustained.

```js
const myObject = new StorageObject('test_key', {
    debounceTime: 1000,
    debounceFixed: true
};
```

<hr>

### Methods

#### `.clear()`

Clears out everything you've changed in your object and make any initial values you may have set up with the `initialValues` configuration option appear again.

```js
myObject.clear();
```

&nbsp;

#### `.write()`

Explicitly writes the object to storage right now. You should be able to rely on the `unload` event to save any changes to the object that haven't been written yet, but it doesn't hurt to call this if you know there may be changes pending and the `window` context is going away.

```js
myObject.write();
```

<hr>

### Using with [`CompressedStorage`🔗&nbsp;](https://github.com/ropg/compressedstorage)

`localStorage` comes with browser-dependent space limitations. You may be able to store more data if you compress it using `CompressedStorage`. Also, you may appreciate the users of your code not being able to trivially see what you are storing using the browser's DevTools. Cmpression would obfuscate the data in your object. *(**Warning:** Mild obfuscation only, does not provide actual security.)*

```text
npm install compressedstorage --save
```

```js
// window.localStorage is the default
const myCompressedStore = new CompressedStorage(window.sessionStorage);
const myObject = new StorageObject('test_key', { store: myCompressedStore });

// Your code here
```

<hr>

### Caveats & random things to know

* You can have as many `StorageObject` objects as you want, all pointing to different strings, either in the same or in different back-end `Storage` objects. 

* However, there should only ever be one `StorageObject` attached to a given string in a `Storage` object at any given time. If you want to have code from multiple different windows, tabs or iframes sharing the same object, [share](https://stackoverflow.com/questions/28230845/communication-between-tabs-or-windows) a reference to a single object, do not create multiple objects tied the same key. *(Multiple objects would end up each writing their own data, never seeing what happens in any of the other instances, so the last one to write would be the one that appears on reload.)*

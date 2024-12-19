# Storage

[![npm Module](https://badge.fury.io/js/@byojs%2Fstorage.svg)](https://www.npmjs.org/package/@byojs/storage)
[![License](https://img.shields.io/badge/license-MIT-a1356a)](LICENSE.txt)

**Storage** provides a set of adapters for easy client-side key-value storage.

```js
// for IndexedDB:
import { get, set } from "@byojs/storage/idb";

await set("Hello","World!");       // true

await get("Hello");               // "World!"
```

----

[Library Tests (Demo)](https://byojs.github.io/storage/)

----

## Overview

The main purpose of **Storage** is to provide a set of adapters that normalize across various client side storage mechanisms (`localStorage` / `sessionStorage`, IndexedDB, cookies, and OPFS) with a consistent key-value API (`get()`, `set()`, etc).

## Client Side Storage Adapters

**Storage** ships with adapters for the following storage mechanisms:

* `idb`: [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)

* `local-storage`: [Web Storage `localStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)

* `session-storage`: [Web Storage `sessionStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage)

* `cookie`: [Web cookies](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/cookies)

* `opfs`: [Origin Private File System (OPFS)](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API/Origin_private_file_system), specifically [the virtual origin filesystem](https://developer.mozilla.org/en-US/docs/Web/API/StorageManager/getDirectory)

    **Warning:** [Browser support for `write()`](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemWritableFileStream/write#browser_compatibility) into OPFS from the main thread (as this adapter does) is limited to Chromium and Firefox browsers (not Safari). See `opfs-worker` for broader device/browser support.

* `opfs-worker`: Uses a Web Worker (background thread) for OPFS access, specifically to [expand OPFS support to most devices/browsers ](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemFileHandle/createSyncAccessHandle#browser_compatibility) (via synchronous `write()` in a Web Worker or Service Worker).

    **Warning:** Web workers in some cases require modified security settings (for the site/app) -- for example, [a Content Security Policy (CSP)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP), specifically [the `worker-src` directive](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/worker-src).

Each of these client-side storage mechanisms has its own pros/cons, so choice should be made carefully.

However, IndexedDB (`idb` adapter) is the most robust and flexible option, and should generally be considered the best default.

### Storage Limitations

These client storage mechanisms have different storage limits, which in some cases may be rather small (i.e., 5MB for Local-Storage, or 4KB for cookies). Be careful with `set()` calls: look for the [`QuotaExceededError` DOM exception](https://developer.mozilla.org/en-US/docs/Web/API/DOMException#quotaexceedederror) being thrown, and determine what data can be freed up, or potentially switch to another storage mechanism with higher limits.

For example:

```js
try {
    await set("session-jwt",sessionJWT);
}
catch (err) {
    if (err.reason?.name == "QuotaExceededError") {
        // handle storage limit failure!
    }
}
```

#### Web Storage (`localStorage`, `sessionStorage`)

The web storage mechanisms (`localStorage`, `sessionStorage`) are by far the most common place web applications storage client-side data. However, there are some factors to consider when using the `local-storage` / `session-storage` adapters.

Each mechanism is size-limited to 5MB, on most all browsers/devices. And they are only available from main browser threads, not in workers (Web Workers, Service Workers).

#### Cookies

The `cookie` adapter stores data in browser cookies. There are however some strong caveats to consider before choosing this storage mechanism.

Cookies are limited to ~4KB. Moreover, the provided data object has been JSON-serialized and URI-encoded (e.g, replacing `" "` with `%20`, etc). These steps inflate your data size further towards the 4KB limit, so you might only be able to squeeze ~3KB of original application data in, under the limit.

Also, cookies are typically sent on *every request* to a first-party origin server (images, CSS, fetch calls, etc). So that data (encrypted, of course) will be sent remotely, and will significantly weigh down all those requests.

Moreover, cookies are never "persistent" storage, and are subject to both expirations (maximum allowed is ~400 days out from the last update) and to users clearing them.

All these concerns considered, the `cookie` adapter *really should not be used* except as a last resort, for small amounts of data. For example, your app might use this storage as a temporary location if normal storage quota has been reached, and later synchronize/migrate/backup off-device, etc.

#### Origin Private File System

The [Origin Private File System (OPFS)](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API/Origin_private_file_system) web feature can be used to read/write "files" in a virtual filesystem on the client's device (private to the page's origin). The `opfs` and `opfs-worker` adapters provided with this library create JSON "files" in OPFS to store the data, one file per value.

## Deployment / Import

```cmd
npm install @byojs/storage
```

The [**@byojs/storage** npm package](https://npmjs.com/package/@byojs/storage) includes a `dist/` directory with all files you need to deploy **Storage** (and its dependencies) into your application/project.

**Note:** If you obtain this library via git instead of npm, you'll need to [build `dist/` manually](#re-building-dist) before deployment.

### Using a bundler

If you are using a bundler (Astro, Vite, Webpack, etc) for your web application, you should not need to manually copy any files from `dist/`.

Just `import` the adapter(s) of your choice, like so:

```js
// {TYPE}: "idb", "local-storage", etc
import { get, set } from "@byojs/storage/{TYPE}";
```

The bundler tool should pick up and find whatever files (and dependencies) are needed.

### Without using a bundler

If you are not using a bundler (Astro, Vite, Webpack, etc) for your web application, and just deploying the contents of `dist/` as-is without changes (e.g., to `/path/to/js-assets/storage/`), you'll need an [Import Map](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap) in your app's HTML:

```html
<script type="importmap">
{
    "imports": {
        "storage/idb": "/path/to/js-assets/storage/adapter.idb.mjs",
        "storage/local-storage": "/path/to/js-assets/storage/adapter.local-storage.mjs",
        "storage/session-storage": "/path/to/js-assets/storage/adapter.session-storage.mjs",
        "storage/cookie": "/path/to/js-assets/storage/adapter.cookie.mjs",
        "storage/opfs": "/path/to/js-assets/storage/adapter.opfs.mjs",
        "storage/opfs-worker": "/path/to/js-assets/storage/adapter.opfs-worker.mjs",

        "idb-keyval": "/path/to/js-assets/storage/external/idb-keyval.js"
    }
}
</script>
```

Now, you'll be able to `import` the library in your app in a friendly/readable way:

```js
// {TYPE}: "idb", "local-storage", etc
import { get, set } from "storage/{TYPE}";
```

**Note:** If you omit the above *adapter* import-map entries, you can still `import` **Storage** by specifying the proper full path to whichever `adapter.*.mjs` file(s) you want to use.

However, the entry above for `idb-keyval` is more required. Alternatively, you'll have to edit the `adapter.idb.mjs` file to change its `import` specifier for `idb-keyval` to the proper path to `idb-keyval.js`.

## Storage API

The API provided by the **Storage** adapters can be accessed, for each adapter, like this:

```js
// for IndexedDB:
import { has, get, set, remove } from "{..}/idb";

await has("Hello");             // false

await set("Hello","World!");    // true

await has("Hello");             // true

await get("Hello");             // "World!"

await remove("Hello");          // true
```

The key-value oriented methods available on each adapter's API are:

* `has(name)`: has a value of `name` been set in this storage before?

* `get(name)`: get a value of `name` (if any) from storage

* `set(name,value)`: set a `value` at `name` into storage

   `value` can be any JSON-serializable object (object, array) or any primitive value; however, bare primitive values will end up being stored (and then retrieved) as strings.

   Further, any string value that is parseable as JSON *will be parsed* as JSON; for example, the string value `"[1,2,3]"` will be parsed as a JSON-serialized array, and return `[1,2,3]` instead.

* `remove(name)`: remove `name` (if any) from storage

* `keys()`: returns an array of existing keys in storage

* `entries()`: returns an array of `[ key, value ]` tuples

**NOTE:** All of these methods are async (promise-returning).

### Many API

The `get(..)`, `set(..)`, and `remove(..)` methods also support a bulk-call form, to process multiple keys/values at once:

```js
// for IndexedDB:
import { has, get, set, remove } from "{..}/idb";

var entries = [
    [ "Hello", "World!" ],
    [ "special", 42 ]
];

await set.many(entries);
// true

var keys = entries.map(([ key, val ]) => key);
// [ "Hello", "special" ]

await get.many(keys);
// [ "World!", 42 ]

await Promise.all(keys.map(has));
// [ true, true ]

await remove.many(keys);
// true

await Promise.all(keys.map(has));
// [ false, false ]
```

The `*.many(..)` methods also accept objects:

```js
import { has, get, set, remove } from "{..}/idb";

var obj = {
    Hello: "World!",
    special: 42
};

await set.many(obj);
// true

var keysObj = {
    Hello: null,
    special: null
};
var keysArr = Object.keys(keys)

await get.many(keysObj);
// [ "World!", 42 ]

await Promise.all(keysArr.map(has));
// [ true, true ]

await remove.many(keysObj);
// true

await Promise.all(keysArr.map(has));
// [ false, false ]
```

## Re-building `dist/*`

If you need to rebuild the `dist/*` files for any reason, run:

```cmd
# only needed one time
npm install

npm run build:all
```

## Tests

This library only works in a browser, so its automated test suite must also be run in a browser.

Visit [`https://byojs.github.io/storage/`](https://byojs.github.io/storage/) and click the "run tests" button.

### Run Locally

To instead run the tests locally, first make sure you've [already run the build](#re-building-dist), then:

```cmd
npm test
```

This will start a static file webserver (no server logic), serving the interactive test page from `http://localhost:8080/`; visit this page in your browser and click the "run tests" button.

By default, the `test/test.js` file imports the code from the `src/*` directly. However, to test against the `dist/*` files (as included in the npm package), you can modify `test/test.js`, updating the `/src` in its `import` statements to `/dist` (see the import-map in `test/index.html` for more details).

## License

[![License](https://img.shields.io/badge/license-MIT-a1356a)](LICENSE.txt)

All code and documentation are (c) 2024 Kyle Simpson and released under the [MIT License](http://getify.mit-license.org/). A copy of the MIT License [is also included](LICENSE.txt).

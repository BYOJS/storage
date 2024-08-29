import { isPromise, } from "./util.js";


// ***********************

var rootFS;

self.addEventListener("message",onMessage);
self.postMessage({ "ready": true });


// ***********************

async function onMessage({ data, } = {}) {
	var recognizedMessages = {
		has,
		get,
		set,
		remove,
		keys,
		entries,
	};
	for (let [ type, handler ] of Object.entries(recognizedMessages)) {
		if (type in data) {
			self.postMessage({ [`${type}-complete`]: (await handler(...data[type])), });
			return;
		}
	}
	console.error(`Unrecognized/unexpected message from host: ${JSON.stringify(data)}`);
}

async function has(name) {
	// note: trick to skip `await` microtask when
	// not a promise
	rootFS = getRootFS();
	rootFS = isPromise(rootFS) ? await rootFS : rootFS;

	var keys = [];
	for await (let key of rootFS.keys()) {
		if (key == name) {
			return true;
		}
	}
	return false;
}

async function get(name) {
	// note: trick to skip `await` microtask when
	// not a promise
	rootFS = getRootFS();
	rootFS = isPromise(rootFS) ? await rootFS : rootFS;

	var fh = await rootFS.getFileHandle(name,{ create: true, });
	var ah = await fh.createSyncAccessHandle();
	var buffer = new ArrayBuffer(ah.getSize());
	ah.read(buffer);
	ah.close();
	return (new TextDecoder()).decode(buffer) || null;
}

async function set(name,value) {
	// note: trick to skip `await` microtask when
	// not a promise
	rootFS = getRootFS();
	rootFS = isPromise(rootFS) ? await rootFS : rootFS;

	var fh = await rootFS.getFileHandle(name,{ create: true, });
	var ah = await fh.createSyncAccessHandle();
	var data = (new TextEncoder()).encode(
		value != null && typeof value == "object" ?
			JSON.stringify(value) :
			String(value)
	);
	ah.truncate(0);
	ah.write(data);
	ah.flush();
	ah.close();
	return true;
}

async function remove(name) {
	// note: trick to skip `await` microtask when
	// not a promise
	rootFS = getRootFS();
	rootFS = isPromise(rootFS) ? await rootFS : rootFS;

	await rootFS.removeEntry(name);
	return true;
}

async function keys() {
	// note: trick to skip `await` microtask when
	// not a promise
	rootFS = getRootFS();
	rootFS = isPromise(rootFS) ? await rootFS : rootFS;

	var fsKeys = [];
	for await (let key of rootFS.keys()) {
		fsKeys.push(key);
	}
	return fsKeys;
}

async function entries() {
	// note: trick to skip `await` microtask when
	// not a promise
	rootFS = getRootFS();
	rootFS = isPromise(rootFS) ? await rootFS : rootFS;

	var fsEntries = [];
	for await (let [ name, fh ] of rootFS.entries()) {
		let file = await fh.getFile();
		let value = (await file.text()) || null;
		if (value != null && value != "") {
			try {
				fsEntries.push([ name, value, ]);
				continue;
			} catch (err) {}
		}
		fsEntries.push([ name, value, ]);
	}
	return fsEntries;
}

function getRootFS() {
	return (
		rootFS == null ?
			navigator.storage.getDirectory() :
			rootFS
	);
}

import { safeJSONParse, isPromise, } from "./util.js";


// ***********************

var rootFS;
var storageType = "opfs";
export {
	storageType,
	has,
	get,
	set,
	remove,
	keys,
	entries,
}
var publicAPI = {
	storageType,
	has,
	get,
	set,
	remove,
	keys,
	entries,
};
export default publicAPI;


// ***********************

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
	var file = await fh.getFile();
	var value = (await file.text()) || null;
	return safeJSONParse(value);
}

async function set(name,value) {
	// note: trick to skip `await` microtask when
	// not a promise
	rootFS = getRootFS();
	rootFS = isPromise(rootFS) ? await rootFS : rootFS;

	var fh = await rootFS.getFileHandle(name,{ create: true, });
	var file = await fh.createWritable();
	await file.write(
		value != null && typeof value == "object" ?
			JSON.stringify(value) :
			String(value)
	);
	await file.close();
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
				fsEntries.push([ name, safeJSONParse(value), ]);
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

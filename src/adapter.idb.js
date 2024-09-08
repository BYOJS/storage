import {
	get as idbGet,
	set as idbSet,
	del as idbDel,
	keys as idbKeys,
	entries as idbEntries,
} from "idb-keyval";


// ***********************

var storageType = "idb";
export {
	storageType,
	has,
	get,
	set,
	remove,
	idbKeys as keys,
	idbEntries as entries,
}
var publicAPI = {
	storageType,
	has,
	get,
	set,
	remove,
	keys: idbKeys,
	entries: idbEntries,
};
export default publicAPI;


// ***********************

async function has(name) {
	return ((await idbKeys()) || []).includes(name);
}

async function get(name) {
	var value = await idbGet(name);
	return (value ?? null);
}

async function set(name,value) {
	try {
		await idbSet(
			name,
			value != null && typeof value == "object" ?
				value :
				String(value)
		);
		return true;
	}
	catch (err) {
		if (err.name == "QuotaExceededError") {
			throw new Error("IndexedDB storage is full.",{ cause: err, });
		}
		throw err;
	}
}

async function remove(name) {
	await idbDel(name);
	return true;
}

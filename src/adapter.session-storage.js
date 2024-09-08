import { safeJSONParse, } from "./util.js";


// ***********************

var storageType = "session-storage";
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

function has(name) {
	// note: https://developer.mozilla.org/en-US/docs/Web/API/Storage/getItem#return_value
	return (window.sessionStorage.getItem(name) !== null);
}

function get(name) {
	return safeJSONParse(window.sessionStorage.getItem(name));
}

function set(name,value) {
	try {
		window.sessionStorage.setItem(
			name,
			value != null && typeof value == "object" ?
				JSON.stringify(value) :
				String(value)
		);
		return true;
	}
	catch (err) {
		if (err.name == "QuotaExceededError") {
			throw new Error("Local-storage is full.",{ cause: err, });
		}
		throw err;
	}
}

function remove(name) {
	window.sessionStorage.removeItem(name);
	return true;
}

function keys() {
	var storeKeys = [];
	for (let i = 0; i < window.sessionStorage.length; i++) {
		storeKeys.push(window.sessionStorage.key(i));
	}
	return storeKeys;
}

function entries() {
	var storeEntries = [];
	for (let i = 0; i < window.sessionStorage.length; i++) {
		let name = window.sessionStorage.key(i);
		storeEntries.push([
			name,
			safeJSONParse(window.sessionStorage.getItem(name)),
		]);
	}
	return storeEntries;
}

import { safeJSONParse, } from "./util.js";
import {
	setMany as sharedSetMany,
	getMany as sharedGetMany,
	removeMany as sharedRemoveMany,
} from "./many.js";

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
	setMany,
	getMany,
	removeMany,
}
var publicAPI = {
	storageType,
	has,
	get,
	set,
	remove,
	keys,
	entries,
	setMany,
	getMany,
	removeMany,
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
function setMany(data) {
	return sharedSetMany(data, set);
}

function getMany(props) {
	return sharedGetMany(props, get);
}

function removeMany(props) {
	return sharedRemoveMany(props, remove);
}
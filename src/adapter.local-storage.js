var storageType = "local-storage";
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
	return (window.localStorage.getItem(name) !== null);
}

function get(name) {
	var value = window.localStorage.getItem(name);
	if (value != null && value != "") {
		try { return JSON.parse(value); } catch (err) {}
	}
	return value;
}

function set(name,value) {
	try {
		window.localStorage.setItem(
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
	window.localStorage.removeItem(name);
	return true;
}

function keys() {
	var storeKeys = [];
	for (let i = 0; i < window.localStorage.length; i++) {
		storeKeys.push(window.localStorage.key(i));
	}
	return storeKeys;
}

function entries() {
	var storeEntries = [];
	for (let i = 0; i < window.localStorage.length; i++) {
		let name = window.localStorage.key(i);
		storeEntries.push([
			name,
			window.localStorage.getItem(name),
		]);
	}
	return storeEntries;
}

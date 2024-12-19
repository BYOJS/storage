export { setMany, getMany, removeMany };


// ***********************

function setMany(set,entries) {
	// not already an entries-array?
	if (
		entries != null &&
		typeof entries == "object" &&
		!Array.isArray(entries)
	) {
		entries = [ ...Object.entries(entries), ];
	}
	return (
		Promise.all(
			entries.map(([ key, val ]) => set(key,val))
		)
		.then(() => true)
	);
}

function getMany(get,keys) {
	// not already a keys-array?
	if (
		keys != null &&
		typeof keys == "object" &&
		!Array.isArray(keys)
	) {
		keys = [ ...Object.keys(keys), ];
	}
	return Promise.all(
		keys.map(key => get(key))
	);
}

function removeMany(remove,keys) {
	// not already a keys-array?
	if (
		keys != null &&
		typeof keys == "object" &&
		!Array.isArray(keys)
	) {
		keys = [ ...Object.keys(keys), ];
	}
	return (
		Promise.all(
			keys.map(key => remove(key))
		)
		.then(() => true)
	);
}

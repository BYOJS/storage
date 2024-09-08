var rootFS;


// ***********************

export {
	safeJSONParse,
	isPromise,
	getDeferred,
	getRootFS,
};
var publicAPI = {
	safeJSONParse,
	isPromise,
	getDeferred,
	getRootFS,
};
export default publicAPI;


// ***********************

function safeJSONParse(value) {
	if (value != null && value != "") {
		try { return JSON.parse(value); } catch (err) {}
	}
	return (value ?? null);
}

function isPromise(val) {
	return (val != null && typeof val == "object" && typeof val.then == "function");
}

function getDeferred() {
	if (typeof Promise.withResolvers == "function") {
		return Promise.withResolvers();
	}
	else {
		let resolve, reject, promise = new Promise((res,rej) => {
			resolve = res;
			reject = rej;
		});
		return { promise, resolve, reject, };
	}
}

// used by opfs adapter, and worker.opfs module
function getRootFS() {
	return (
		rootFS ?? (
			navigator.storage.getDirectory()
				.then(root => (rootFS = root))
		)
	);
}

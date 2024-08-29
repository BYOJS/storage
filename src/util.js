export {
	safeJSONParse,
	isPromise,
	getDeferred,
};


// ***********************

function safeJSONParse(value) {
	if (value != null && value != "") {
		try { return JSON.parse(value); } catch (err) {}
	}
	return (value != null ? value : null);
}

function isPromise(val) {
	return (val && typeof val == "object" && typeof val.then == "function");
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

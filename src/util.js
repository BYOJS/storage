export {
	safeJSONParse,
	isPromise,
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

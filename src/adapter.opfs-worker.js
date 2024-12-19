import {
	safeJSONParse,
	isPromise,
	getDeferred,
} from "./util.js";


// ***********************

get.many = async (...args) => (
	(await sendToWorker("get.many",...args))
		.map(safeJSONParse)
);
set.many = (...args) => sendToWorker("set.many",...args);
remove.many = (...args) => sendToWorker("remove.many",...args);


// ***********************

var worker = null;
var pending = null;
var workerListeners = [];

var storageType = "opfs-worker";
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
	return sendToWorker("has",name);
}

async function get(name) {
	return safeJSONParse(await sendToWorker("get",name));
}

function set(name,value) {
	return sendToWorker("set",name,value);
}

function remove(name) {
	return sendToWorker("remove",name);
}

function keys() {
	return sendToWorker("keys");
}

async function entries() {
	var response = await sendToWorker("entries");
	return response.map(([ name, value, ]) => ([
		name,
		safeJSONParse(value),
	]));
}

async function sendToWorker(opName,...args) {
	if (worker == null) {
		worker = addWorkerListener("ready").then(() => loadingWorker);
		let loadingWorker = new Worker(
			new URL("./worker.opfs.js",import.meta.url),
			{ type: "module", name: "opfsWorker", }
		);
		loadingWorker.addEventListener("message",onWorkerMessage);
	}
	// note: trick to skip `await` microtask when
	// not a promise
	worker = isPromise(worker) ? await worker : worker;

	if (isPromise(pending)) {
		await pending;
	}

	pending = addWorkerListener(`${opName}-complete`);
	worker.postMessage({ [opName]: args });
	return pending;
}

function addWorkerListener(name) {
	var def = getDeferred();
	workerListeners.push([ name, def.resolve, ]);
	return def.promise;
}

function onWorkerMessage({ data, } = {}) {
	var nextListener = workerListeners[0];
	if (nextListener[0] in data) {
		nextListener[1](data[nextListener[0]]);
		workerListeners.shift();
		pending = null;
	}
	else {
		console.error(`Unrecognized/unexpected message from worker: ${JSON.stringify(data)}`);
	}
}

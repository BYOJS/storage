import { safeJSONParse, } from "./util.js";
import {
	setMany,
	getMany,
	removeMany,
} from "./many.js";


// ***********************

get.many = (...args) => getMany(get,...args);
set.many = (...args) => setMany(set,...args);
remove.many = (...args) => removeMany(remove,...args);


// ***********************

var storageType = "cache";
const CACHE_NAME = "generic-key-value-cache";
export {
	storageType,
	has,
	get,
	set,
	remove,
	keys,
	entries,
};
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
	// note: https://developer.mozilla.org/en-US/docs/Web/API/Cache/match#return_value
	const cache = await openCache();
	const request = new Request(name);
	const response = await cache.match(request);
	return response !== undefined;
}

async function get(name) {
	const cache = await openCache();
	const request = new Request(name);
	const response = await cache.match(request);
	return safeJSONParse(response !== undefined ? await response.json() : null);
}

async function set(name,value) {
	try {
		const cache = await openCache();
		const request = new Request(name);
		const response = new Response(JSON.stringify(value));
		await cache.put(request, response);

		if ('storage' in navigator && 'estimate' in navigator.storage) {
			navigator.storage.estimate().then(({usage, quota}) => {
				if (usage >= quota) {
					throw new Error("Browser storage is full.",{ cause: err, });
				}
			});
		}
		return true;
	}
	catch (err) {
		throw err;
	}
}

async function remove(name) {
	const cache = await openCache();
	const request = new Request(name);
	return await cache.delete(request);
}

async function keys() {
	const cache = await openCache();
	const requests = await cache.keys();
	return requests.map(request => request.url.split('/').pop());
}

async function entries() {
	const storeEntries = [];
	const cache = await openCache();
	const requests = await cache.keys();
	for (const request of requests) {
	  const response = await cache.match(request);
	  if (response) {
		const value = safeJSONParse(await response.json());
		storeEntries.push([
			request.url.split('/').pop(),
			value
		]);
	  }
	}
	return storeEntries;
}

async function openCache() {
	return await caches.open(CACHE_NAME);
}
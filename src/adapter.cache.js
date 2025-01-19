import { safeJSONParse, } from "./util.js";
import {
	setMany,
	getMany,
	removeMany,
} from "./many.js";


// ***********************

get.many = (...args) => getMany(get, ...args);
set.many = (...args) => setMany(set, ...args);
remove.many = (...args) => removeMany(remove, ...args);


// ***********************

var storageType = "cache";
const CACHE_NAME_PREFIX = "cache-kvstore-";
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
	return await caches.has(`${CACHE_NAME_PREFIX}${name}`);
}

async function get(name) {
	const request = new Request(name);
	const response = await caches.match(request);
	return safeJSONParse(response !== undefined ? await response.json() : null);
}

async function set(name, value) {
	try {
		const cache = await caches.open(`${CACHE_NAME_PREFIX}${name}`);;
		const request = new Request(name);
		const response = new Response(JSON.stringify(value));
		await cache.put(request, response);

		if ('storage' in navigator && 'estimate' in navigator.storage) {
			navigator.storage.estimate().then(({ usage, quota }) => {
				if (usage >= quota) {
					throw new DOMException("Browser storage is full","QuotaExceededError");
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
	return await caches.delete(`${CACHE_NAME_PREFIX}${name}`);
}

async function keys() {
	const cacheList = await caches.keys();
	const storeKeys = [];
	for (const cacheName of cacheList) {
		const cache = await caches.open(cacheName);
		const requests = await cache.keys();
		const cacheKeys = requests.map(request => request.url.split('/').pop());
		storeKeys.push(...cacheKeys);
	}
	return storeKeys;
}

async function entries() {
	const cacheList = await caches.keys();
	const storeEntries = [];
	for (const cacheName of cacheList) {
		const cache = await caches.open(cacheName);
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
	}
	return storeEntries;
}

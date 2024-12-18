import { safeJSONParse, } from "./util.js";
import {
	setMany as sharedSetMany,
	getMany as sharedGetMany,
	removeMany as sharedRemoveMany,
} from "./many.js";

// ***********************

var storageType = "cookie";
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

async function has(name) {
	return (name in getAllCookies());
}

async function get(name) {
	return safeJSONParse(getAllCookies()[name]);
}

async function set(name,value) {
	var expires = new Date();
	var expiresSeconds = 400 * 24 * 60 * 60;	// 400 days from now (max allowed)
	expires.setTime(expires.getTime() + (expiresSeconds * 1000));
	var cookieName = encodeURIComponent(name);
	var cookieValue = encodeURIComponent(
		value != null && typeof value == "object" ?
			JSON.stringify(value) :
			String(value)
	);
	// cookieName + cookieValue > 4kb?
	//   (https://chromestatus.com/feature/4946713618939904)
	if ((cookieName.length + cookieValue.length) > 4096) {
		// https://developer.mozilla.org/en-US/docs/Web/API/DOMException#quotaexceedederror
		throw new DOMException("Cookie max size (4KB) exceeded","QuotaExceededError");
	}
	var cookie = [
		`${cookieName}=${cookieValue}`,
		`domain=${document.location.hostname}`,
		"path=/",
		"samesite=strict",
		"secure",
		`expires=${expires.toGMTString()}`,
		`maxage=${expiresSeconds}`,
	].join("; ");
	document.cookie = cookie;
	return true;
}

async function remove(name) {
	var expires = new Date();
	expires.setTime(expires.getTime() - 1000);
	document.cookie = [
		`${encodeURIComponent(name)}=`,
		`domain=${document.location.hostname}`,
		"path=/",
		"samesite=strict",
		"secure",
		`expires=${expires.toGMTString()}`,
		"maxage=0"
	].join("; ");
	return true;
}

async function keys() {
	return Object.keys(getAllCookies());
}

async function entries() {
    const allCookies = await getAllCookies(); // Await the async operation.
    const mappedEntries = Object.entries(allCookies).map(async ([name, value]) => [
        name,
        await safeJSONParse(value), // Await the async parsing.
    ]);
    return Promise.all(mappedEntries); // Ensure all async tasks resolve.
}

function getAllCookies() {
	return (
		Object.fromEntries(
			document.cookie
				.split(/\s*;\s*/)
				.filter(Boolean)
				.map(rawCookieVal => (
					rawCookieVal.split(/\s*=\s*/)
					.map(val => decodeURIComponent(val))
				))
		)
	);
}
async function setMany(data) {
	return sharedSetMany(data, set);
}

async function getMany(props) {
	return sharedGetMany(props, get);
}

async function removeMany(props) {
	return sharedRemoveMany(props, remove);
}

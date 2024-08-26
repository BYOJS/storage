import { safeJSONParse, } from "./util.js";


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
	return (name in getAllCookies());
}

function get(name) {
	return safeJSONParse(getAllCookies()[name]);
}

function set(name,value) {
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

function remove(name) {
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

function keys() {
	return Object.keys(getAllCookies());
}

function entries() {
	return (
		Object.entries(getAllCookies())
			.map(([ name, value ]) => ([
				name,
				safeJSONParse(value)
			]))
	);
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

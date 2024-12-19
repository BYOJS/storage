// note: these module specifiers come from the import-map
//    in index.html; swap "src" for "dist" here to test
//    against the dist/* files
import IDBStore from "storage/src/idb";
import LSStore from "storage/src/local-storage";
import SSStore from "storage/src/session-storage";
import CookieStore from "storage/src/cookie";
import OPFSStore from "storage/src/opfs";
import OPFSWorkerStore from "storage/src/opfs-worker";


// ***********************

const storageTypes = {
	"idb": [ "IndexedDB", IDBStore, ],
	"local-storage": [ "Local Storage", LSStore, ],
	"session-storage": [ "Session Storage", SSStore, ],
	"cookie": [ "Cookies", CookieStore, ],
	"opfs": [ "Origin Private FS", OPFSStore, ],
	"opfs-worker": [ "OPFS-Worker", OPFSWorkerStore, ],
};

var runTestsBtn;
var testResultsEl;

var currentVault;

if (document.readyState == "loading") {
	document.addEventListener("DOMContentLoaded",ready,false);
}
else {
	ready();
}


// ***********************

async function ready() {
	runTestsBtn = document.getElementById("run-tests-btn");
	testResultsEl = document.getElementById("test-results");

	runTestsBtn.addEventListener("click",runTests,false);
}

function logError(err,returnLog = false) {
	var err = `${
			err.stack ? err.stack : err.toString()
		}${
			err.cause ? `\n${logError(err.cause,/*returnLog=*/true)}` : ""
	}`;
	if (returnLog) return err;
	else console.error(err);
}

async function runTests() {
	var expectedResults = [
		[ "idb", "has(1)", false ],
		[ "idb", "get(1)", null ],
		[ "idb", "set(1)", true ],
		[ "idb", "has(2)", true ],
		[ "idb", "get(2)", "world" ],
		[ "idb", "set(2)", true ],
		[ "idb", "keys(1)", [ "hello", "meaning", ], ],
		[ "idb", "entries", [ [ "hello", "world", ], [ "meaning", { ofLife: 42, }, ], ], ],
		[ "idb", "remove", true ],
		[ "idb", "keys(2)", [ "meaning", ], ],
		[ "idb", "{cleared} (1)", [ false, false, ], ],
		[ "idb", "set.many (1)", true],
		[ "idb", "get.many (1)", [ "world", { ofLife: 42, }, ], ],
		[ "idb", "remove.many (1)", true],
		[ "idb", "set.many (2)", true],
		[ "idb", "get.many (2)", [ "world", { ofLife: 42, }, ], ],
		[ "idb", "remove.many (2)", true],
		[ "idb", "{cleared} (2)", [ false, false, ], ],
		[ "local-storage", "has(1)", false ],
		[ "local-storage", "get(1)", null ],
		[ "local-storage", "set(1)", true ],
		[ "local-storage", "has(2)", true ],
		[ "local-storage", "get(2)", "world" ],
		[ "local-storage", "set(2)", true ],
		[ "local-storage", "keys(1)", [ "hello", "meaning", ], ],
		[ "local-storage", "entries", [ [ "hello", "world", ], [ "meaning", { ofLife: 42, }, ], ], ],
		[ "local-storage", "remove", true ],
		[ "local-storage", "keys(2)", [ "meaning", ], ],
		[ "local-storage", "{cleared} (1)", [ false, false, ], ],
		[ "local-storage", "set.many (1)", true],
		[ "local-storage", "get.many (1)", [ "world", { ofLife: 42, }, ], ],
		[ "local-storage", "remove.many (1)", true],
		[ "local-storage", "set.many (2)", true],
		[ "local-storage", "get.many (2)", [ "world", { ofLife: 42, }, ], ],
		[ "local-storage", "remove.many (2)", true],
		[ "local-storage", "{cleared} (2)", [ false, false, ], ],
		[ "session-storage", "has(1)", false ],
		[ "session-storage", "get(1)", null ],
		[ "session-storage", "set(1)", true ],
		[ "session-storage", "has(2)", true ],
		[ "session-storage", "get(2)", "world" ],
		[ "session-storage", "set(2)", true ],
		[ "session-storage", "keys(1)", [ "hello", "meaning", ], ],
		[ "session-storage", "entries", [ [ "hello", "world", ], [ "meaning", { ofLife: 42, }, ], ], ],
		[ "session-storage", "remove", true ],
		[ "session-storage", "keys(2)", [ "meaning", ], ],
		[ "session-storage", "{cleared} (1)", [ false, false, ], ],
		[ "session-storage", "set.many (1)", true],
		[ "session-storage", "get.many (1)", [ "world", { ofLife: 42, }, ], ],
		[ "session-storage", "remove.many (1)", true],
		[ "session-storage", "set.many (2)", true],
		[ "session-storage", "get.many (2)", [ "world", { ofLife: 42, }, ], ],
		[ "session-storage", "remove.many (2)", true],
		[ "session-storage", "{cleared} (2)", [ false, false, ], ],
		[ "cookie", "has(1)", false ],
		[ "cookie", "get(1)", null ],
		[ "cookie", "set(1)", true ],
		[ "cookie", "has(2)", true ],
		[ "cookie", "get(2)", "world" ],
		[ "cookie", "set(2)", true ],
		[ "cookie", "keys(1)", [ "hello", "meaning", ], ],
		[ "cookie", "entries", [ [ "hello", "world", ], [ "meaning", { ofLife: 42, }, ], ], ],
		[ "cookie", "remove", true ],
		[ "cookie", "keys(2)", [ "meaning", ], ],
		[ "cookie", "{cleared} (1)", [ false, false, ], ],
		[ "cookie", "set.many (1)", true],
		[ "cookie", "get.many (1)", [ "world", { ofLife: 42, }, ], ],
		[ "cookie", "remove.many (1)", true],
		[ "cookie", "set.many (2)", true],
		[ "cookie", "get.many (2)", [ "world", { ofLife: 42, }, ], ],
		[ "cookie", "remove.many (2)", true],
		[ "cookie", "{cleared} (2)", [ false, false, ], ],
		[ "opfs", "has(1)", false ],
		[ "opfs", "get(1)", null ],
		[ "opfs", "set(1)", true ],
		[ "opfs", "has(2)", true ],
		[ "opfs", "get(2)", "world" ],
		[ "opfs", "set(2)", true ],
		[ "opfs", "keys(1)", [ "hello", "meaning", ], ],
		[ "opfs", "entries", [ [ "hello", "world", ], [ "meaning", { ofLife: 42, }, ], ], ],
		[ "opfs", "remove", true ],
		[ "opfs", "keys(2)", [ "meaning", ], ],
		[ "opfs", "{cleared} (1)", [ false, false, ], ],
		[ "opfs", "set.many (1)", true],
		[ "opfs", "get.many (1)", [ "world", { ofLife: 42, }, ], ],
		[ "opfs", "remove.many (1)", true],
		[ "opfs", "set.many (2)", true],
		[ "opfs", "get.many (2)", [ "world", { ofLife: 42, }, ], ],
		[ "opfs", "remove.many (2)", true],
		[ "opfs", "{cleared} (2)", [ false, false, ], ],
		[ "opfs-worker", "has(1)", false ],
		[ "opfs-worker", "get(1)", null ],
		[ "opfs-worker", "set(1)", true ],
		[ "opfs-worker", "has(2)", true ],
		[ "opfs-worker", "get(2)", "world" ],
		[ "opfs-worker", "set(2)", true ],
		[ "opfs-worker", "keys(1)", [ "hello", "meaning", ], ],
		[ "opfs-worker", "entries", [ [ "hello", "world", ], [ "meaning", { ofLife: 42, }, ], ], ],
		[ "opfs-worker", "remove", true ],
		[ "opfs-worker", "keys(2)", [ "meaning", ], ],
		[ "opfs-worker", "{cleared} (1)", [ false, false, ], ],
		[ "opfs-worker", "set.many (1)", true],
		[ "opfs-worker", "get.many (1)", [ "world", { ofLife: 42, }, ], ],
		[ "opfs-worker", "remove.many (1)", true],
		[ "opfs-worker", "set.many (2)", true],
		[ "opfs-worker", "get.many (2)", [ "world", { ofLife: 42, }, ], ],
		[ "opfs-worker", "remove.many (2)", true],
		[ "opfs-worker", "{cleared} (2)", [ false, false, ], ],
	];
	var testResults = [];

	testResultsEl.innerHTML = "Storage tests running...<br>";

	var stores = [ IDBStore, LSStore, SSStore, CookieStore, OPFSStore, OPFSWorkerStore, ];
	for (let store of stores) {
		testResults.push([ storageTypes[store.storageType][0], "has(1)", await store.has("hello"), ]);
		testResults.push([ storageTypes[store.storageType][0], "get(1)", await store.get("hello"), ]);
		testResults.push([ storageTypes[store.storageType][0], "set(1)", await store.set("hello","world"), ]);
		testResults.push([ storageTypes[store.storageType][0], "has(2)", await store.has("hello"), ]);
		testResults.push([ storageTypes[store.storageType][0], "get(2)", await store.get("hello"), ]);
		testResults.push([ storageTypes[store.storageType][0], "set(2)", await store.set("meaning",{ ofLife: 42, }), ]);
		testResults.push([ storageTypes[store.storageType][0], "keys(1)", sortKeys(filterKnownNames("hello","meaning")(await store.keys())), ]);
		testResults.push([ storageTypes[store.storageType][0], "entries", sortKeys(filterKnownNames("hello","meaning")(await store.entries())), ]);
		testResults.push([ storageTypes[store.storageType][0], "remove", await store.remove("hello"), ]);
		testResults.push([ storageTypes[store.storageType][0], "keys(2)", sortKeys(filterKnownNames("hello","meaning")(await store.keys())), ]);
		await store.remove("meaning");

		testResults.push([ storageTypes[store.storageType][0], "{cleared} (1)", await Promise.all(["hello","world"].map(store.has)), ]);

		testResults.push([ storageTypes[store.storageType][0], "set.many (1)", await store.set.many([ [ "hello", "world", ], [ "meaning", { ofLife: 42, }, ], ]), ]);
		testResults.push([ storageTypes[store.storageType][0], "get.many (1)", await store.get.many([ "hello", "meaning", ]), ]);
		testResults.push([ storageTypes[store.storageType][0], "remove.many (1)", await store.remove.many([ "hello", "meaning", ]), ]);
		testResults.push([ storageTypes[store.storageType][0], "set.many (2)", await store.set.many({ hello: "world", meaning: { ofLife: 42, }, }), ]);
		testResults.push([ storageTypes[store.storageType][0], "get.many (2)", await store.get.many({ hello: null, meaning: null, }), ]);
		testResults.push([ storageTypes[store.storageType][0], "remove.many (2)", await store.remove.many({ hello: null, meaning: null, }), ]);

		testResults.push([ storageTypes[store.storageType][0], "{cleared} (2)", await Promise.all(["hello","world"].map(store.has)), ]);
	}
	var testsPassed = true;
	for (let [ testIdx, testResult ] of testResults.entries()) {
		if (JSON.stringify(testResult[2]) == JSON.stringify(expectedResults[testIdx][2])) {
			testResultsEl.innerHTML += `(${testIdx}) ${testResult[0]}:${testResult[1]} passed<br>`;
		}
		else {
			testsPassed = false;
			testResultsEl.innerHTML += `<strong>(${testIdx}) ${testResult[0]}:${testResult[1]} failed</strong><br>`;
			testResultsEl.innerHTML += `&nbsp;&nbsp;&nbsp;Expected: <strong>${expectedResults[testIdx][2]}</strong>, but found: <strong>${testResult[2]}</strong><br>`;
		}
	}
	if (testsPassed) {
		testResultsEl.innerHTML += "<strong>...ALL PASSED.</strong><br>";
	}
	else {
		testResultsEl.innerHTML += "<strong>...Some tests failed.</strong><br>";
	}
}

function filterKnownNames(...knownNames) {
	return function filterer(vals) {
		if (vals.length > 0) {
			// entries?
			if (Array.isArray(vals[0])) {
				return vals.filter(([ name, value ]) => (
					knownNames.includes(name)
				));
			}
			else {
				return vals.filter(name => (
					knownNames.includes(name)
				));
			}
		}
		return vals;
	}
}

function sortKeys(vals) {
	if (vals.length > 0) {
		vals = [ ...vals ];
		// entries?
		if (Array.isArray(vals[0])) {
			return vals.sort(([ name1, ],[ name2, ]) => (
				name1.localeCompare(name2)
			));
		}
		else {
			return vals.sort((name1,name2) => (
				name1.localeCompare(name2)
			));
		}
	}
	return vals;
}

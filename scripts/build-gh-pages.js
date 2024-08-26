#!/usr/bin/env node

"use strict";

var path = require("path");
var fs = require("fs");
var fsp = require("fs/promises");

var micromatch = require("micromatch");
var recursiveReadDir = require("recursive-readdir-sync");

const PKG_ROOT_DIR = path.join(__dirname,"..");
const DIST_DIR = path.join(PKG_ROOT_DIR,"dist");
const TEST_DIR = path.join(PKG_ROOT_DIR,"test");
const BUILD_DIR = path.join(PKG_ROOT_DIR,".gh-build");
const BUILD_DIST_DIR = path.join(BUILD_DIR,"dist");


main().catch(console.error);


// **********************

async function main() {
	console.log("*** Building GH-Pages Deployment ***");

	// try to make various .gh-build/** directories, if needed
	for (let dir of [ BUILD_DIR, BUILD_DIST_DIR, ]) {
		if (!(await safeMkdir(dir))) {
			throw new Error(`Target directory (${dir}) does not exist and could not be created.`);
		}
	}

	// copy test/* files
	await copyFilesTo(
		recursiveReadDir(TEST_DIR),
		TEST_DIR,
		BUILD_DIR,
		/*skipPatterns=*/[ "**/src", "**/dist", ]
	);

	// patch import reference in test.js to point to dist/
	var testJSPath = path.join(BUILD_DIR,"test.js");
	var testJSContents = await fsp.readFile(testJSPath,{ encoding: "utf8", });
	testJSContents = testJSContents.replace(/(import[^;]+"client-storage\/)src([^"]*)"/g,"$1dist$2\"");
	await fsp.writeFile(testJSPath,testJSContents,{ encoding: "utf8", });

	// copy dist/* files
	await copyFilesTo(
		recursiveReadDir(DIST_DIR),
		DIST_DIR,
		BUILD_DIST_DIR
	);

	console.log("Complete.");
}

async function copyFilesTo(files,fromBasePath,toDir,skipPatterns) {
	for (let fromPath of files) {
		// should we skip copying this file?
		if (matchesSkipPattern(fromPath,skipPatterns)) {
			continue;
		}

		let relativePath = fromPath.slice(fromBasePath.length);
		let outputPath = path.join(toDir,relativePath);
		let outputDir = path.dirname(outputPath);

		if (!(fs.existsSync(outputDir))) {
			if (!(await safeMkdir(outputDir))) {
				throw new Error(`While copying files, directory (${outputDir}) could not be created.`);
			}
		}

		await fsp.copyFile(fromPath,outputPath);
	}
}

function matchesSkipPattern(pathStr,skipPatterns) {
	if (skipPatterns && skipPatterns.length > 0) {
		return (micromatch(pathStr,skipPatterns).length > 0);
	}
}

async function safeMkdir(pathStr) {
	if (!fs.existsSync(pathStr)) {
		try {
			await fsp.mkdir(pathStr,{ recursive: true, mode: 0o755, });
			return true;
		}
		catch (err) {}
		return false;
	}
	return true;
}

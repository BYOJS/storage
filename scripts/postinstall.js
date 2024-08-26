#!/usr/bin/env node

"use strict";

var path = require("path");
var fs = require("fs");

const PKG_ROOT_DIR = path.join(__dirname,"..");
const SRC_DIR = path.join(PKG_ROOT_DIR,"src");
const TEST_DIR = path.join(PKG_ROOT_DIR,"test");

try { fs.symlinkSync(path.join("..","src"),path.join(TEST_DIR,"src"),"dir"); } catch (err) {}
try { fs.symlinkSync(path.join("..","dist"),path.join(TEST_DIR,"dist"),"dir"); } catch (err) {}

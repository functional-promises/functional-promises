"use strict";

// Issue #12: the build output for the v2 API is dist/async.js (tsup entry named "async"),
// not dist/index.js. The previous path caused a MODULE_NOT_FOUND crash at require time.
module.exports = require("./dist/async.js");

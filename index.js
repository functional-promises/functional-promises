"use strict";

// console.log(Object
//   .keys(process.env)
//   .map(s => s + "\t=\t" + process.env[s]).sort().join('\n') + '\n\n\n')

if (process.env.NODE_ENV === "test") {
  module.exports = require("./src/index.js").default;
} else if (process.env.NODE_ENV === "production") {
  module.exports = require("./dist/cjs.min.js");
} else {
  module.exports = require("./dist/cjs.js");
}

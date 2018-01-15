const fs = require('fs');
const path = require('path');
const pkg = require('../package.json')
const oldVersion = pkg.version;
let pkgPath = path.join(__dirname, '..', '/package.json')


if (process.env.DEBUG) console.log(`pkgPath : ${pkgPath}`)

let verPattern = '';

if (process.argv.length >= 3 && /\d/.test(process.argv[2])) {
  verPattern = process.argv[2];
}

function safeNumRange(a, b, defaultVal = 0) {
  return num => Number.isNaN(num) ? 0 :
    num < a || num > b
    ? defaultVal
    : num
}

function updatedVersion(verString, modifyPattern) {
  const verParts = verString.split('.').map(Number);
  let pattern = modifyPattern.split(/[^\d]+/g).map(Number)
  let [major, minor, revision] = verParts;
  while (pattern.length < 3) {
    pattern.unshift(0);
  }
  // console.log('unshifted PATTERN: ', pattern);
  let [addMajor, addMinor, addRevision] = pattern;
  pattern = pattern.map(safeNumRange(0, 9));
  // console.log('RANGED PATTERN: ', pattern);
  return `${major + addMajor}.${minor + addMinor}.${revision + addRevision}`;
}

// console.log(`initial vs updated ver: ${pkg.version} -> ${updatedVersion}`)
pkg.version = updatedVersion(pkg.version, verPattern);
const json = JSON.stringify(pkg, null, 2);

if (process.env.DEBUG) { console.log('Saving: ', json) }

const pkgPathParts = pkgPath.split('/')
const localPackagePath = '/' + pkgPathParts.slice(pkgPathParts.length - 2).join('/')

if ( oldVersion === pkg.version) {
  console.log(`Skipping version bump for ${localPackagePath} v${oldVersion} == ${pkg.version}`)
} else {
  console.log(`Updating ${localPackagePath} v${oldVersion} -> ${pkg.version}`)
  fs.writeFile(pkgPath, json, 'utf8', err => {
    if (err) return console.error(`AHHH ERROR WRITING PACKAGE.JSON BACK TO ${pkgPath}.`, err);
    console.log(`Successfully bumped to v${pkg.version}`);
  })
}


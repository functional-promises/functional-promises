!function(t){function n(o){if(r[o])return r[o].exports;var e=r[o]={i:o,l:!1,exports:{}};return t[o].call(e.exports,e,e.exports,n),e.l=!0,e.exports}var r={};n.m=t,n.c=r,n.d=function(t,r,o){n.o(t,r)||Object.defineProperty(t,r,{configurable:!1,enumerable:!0,get:o})},n.n=function(t){var r=t&&t.__esModule?function(){return t.default}:function(){return t};return n.d(r,"a",r),r},n.o=function(t,n){return Object.prototype.hasOwnProperty.call(t,n)},n.p="",n(n.s=10)}([/*!*******************************************!*\
  !*** ./node_modules/lodash/isFunction.js ***!
  \*******************************************/
/*! dynamic exports provided */
/*! all exports used */
function(t,n,r){"use strict";function o(t){if(!i(t))return!1;var n=e(t);return n==c||n==f||n==u||n==s}var e=r(/*! ./_baseGetTag */1),i=r(/*! ./isObject */6),u="[object AsyncFunction]",c="[object Function]",f="[object GeneratorFunction]",s="[object Proxy]";t.exports=o},/*!********************************************!*\
  !*** ./node_modules/lodash/_baseGetTag.js ***!
  \********************************************/
/*! dynamic exports provided */
/*! all exports used */
function(t,n,r){"use strict";function o(t){return null==t?void 0===t?f:c:s&&s in Object(t)?i(t):u(t)}var e=r(/*! ./_Symbol */3),i=r(/*! ./_getRawTag */15),u=r(/*! ./_objectToString */16),c="[object Null]",f="[object Undefined]",s=e?e.toStringTag:void 0;t.exports=o},/*!*********************************************!*\
  !*** ./node_modules/lodash/isObjectLike.js ***!
  \*********************************************/
/*! dynamic exports provided */
/*! all exports used */
function(t,n,r){"use strict";function o(t){return null!=t&&"object"==(void 0===t?"undefined":e(t))}var e="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t};t.exports=o},/*!****************************************!*\
  !*** ./node_modules/lodash/_Symbol.js ***!
  \****************************************/
/*! dynamic exports provided */
/*! all exports used */
function(t,n,r){"use strict";var o=r(/*! ./_root */4),e=o.Symbol;t.exports=e},/*!**************************************!*\
  !*** ./node_modules/lodash/_root.js ***!
  \**************************************/
/*! dynamic exports provided */
/*! all exports used */
function(t,n,r){"use strict";var o="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},e=r(/*! ./_freeGlobal */5),i="object"==("undefined"==typeof self?"undefined":o(self))&&self&&self.Object===Object&&self,u=e||i||Function("return this")();t.exports=u},/*!********************************************!*\
  !*** ./node_modules/lodash/_freeGlobal.js ***!
  \********************************************/
/*! dynamic exports provided */
/*! all exports used */
function(t,n,r){"use strict";(function(n){var r="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},o="object"==(void 0===n?"undefined":r(n))&&n&&n.Object===Object&&n;t.exports=o}).call(n,r(/*! ./../webpack/buildin/global.js */14))},/*!*****************************************!*\
  !*** ./node_modules/lodash/isObject.js ***!
  \*****************************************/
/*! dynamic exports provided */
/*! all exports used */
function(t,n,r){"use strict";function o(t){var n=void 0===t?"undefined":e(t);return null!=t&&("object"==n||"function"==n)}var e="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t};t.exports=o},/*!***********************************!*\
  !*** (webpack)/buildin/module.js ***!
  \***********************************/
/*! dynamic exports provided */
/*! all exports used */
function(t,n,r){"use strict";t.exports=function(t){return t.webpackPolyfill||(t.deprecate=function(){},t.paths=[],t.children||(t.children=[]),Object.defineProperty(t,"loaded",{enumerable:!0,get:function(){return t.l}}),Object.defineProperty(t,"id",{enumerable:!0,get:function(){return t.i}}),t.webpackPolyfill=1),t}},/*!*****************************************!*\
  !*** ./node_modules/lodash/isLength.js ***!
  \*****************************************/
/*! dynamic exports provided */
/*! all exports used */
function(t,n,r){"use strict";function o(t){return"number"==typeof t&&t>-1&&t%1==0&&t<=e}var e=9007199254740991;t.exports=o},/*!********************************************!*\
  !*** ./node_modules/lodash/isArrayLike.js ***!
  \********************************************/
/*! dynamic exports provided */
/*! all exports used */
function(t,n,r){"use strict";function o(t){return null!=t&&i(t.length)&&!e(t)}var e=r(/*! ./isFunction */0),i=r(/*! ./isLength */8);t.exports=o},/*!******************!*\
  !*** ./index.js ***!
  \******************/
/*! dynamic exports provided */
/*! all exports used */
function(t,n,r){"use strict";function o(t){if(!(this instanceof o))return new o(t);if((arguments.length<=1?0:arguments.length-1)>0)throw new Error("FunctionalRiver only accepts 1 argument");this._FR={},this._FR.concurrencyLimit=1/0,this._FR.promise=new Promise(t)}function e(t){var n=this;return function(){for(var r=arguments.length,e=Array(r),i=0;i<r;i++)e[i]=arguments[i];return new o(function(r,o){return t.call.apply(t,[n].concat(e,[function(t,n){return t?o(t):r(n)}]))})}}function i(t){if(!t||!Object.getPrototypeOf(t))throw new Error("Invalid Argument obj in promisifyAll(obj)");return u(t).reduce(function(t,n){return/Sync/.test(n)||t[n+"Async"]||(t[n+"Async"]=e(t[""+n])),t},t)}var u=r(/*! lodash/functionsIn */11),c=r(/*! lodash/isFunction */0),f=r(/*! ./src/promise */33),s=r(/*! ./src/conditional */34),p=r(/*! ./src/modules/arrays */35);f(o),s(o),p(o),o.prototype.concurrency=function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:1/0;return this._FR.concurrencyLimit=t,this},o.prototype.serial=function(){return this.concurrency(1)},o.prototype.catch=function(t){if(this._FR.error){var n=t(this._FR.error);return this._FR.error=void 0,n}return o.resolve(this._FR.value)},o.prototype.then=function(t){return this._FR.promise.then(t),this},o.resolve=function(t){return new o(function(n,r){if(t&&c(t.then))return t.then(n).catch(r);n(t)})},o.denodeify=o.promisify=e,o.promisifyAll=i,t.exports=o},/*!********************************************!*\
  !*** ./node_modules/lodash/functionsIn.js ***!
  \********************************************/
/*! dynamic exports provided */
/*! all exports used */
function(t,n,r){"use strict";function o(t){return null==t?[]:e(t,i(t))}var e=r(/*! ./_baseFunctions */12),i=r(/*! ./keysIn */17);t.exports=o},/*!***********************************************!*\
  !*** ./node_modules/lodash/_baseFunctions.js ***!
  \***********************************************/
/*! dynamic exports provided */
/*! all exports used */
function(t,n,r){"use strict";function o(t,n){return e(n,function(n){return i(t[n])})}var e=r(/*! ./_arrayFilter */13),i=r(/*! ./isFunction */0);t.exports=o},/*!*********************************************!*\
  !*** ./node_modules/lodash/_arrayFilter.js ***!
  \*********************************************/
/*! dynamic exports provided */
/*! all exports used */
function(t,n,r){"use strict";function o(t,n){for(var r=-1,o=null==t?0:t.length,e=0,i=[];++r<o;){var u=t[r];n(u,r,t)&&(i[e++]=u)}return i}t.exports=o},/*!***********************************!*\
  !*** (webpack)/buildin/global.js ***!
  \***********************************/
/*! dynamic exports provided */
/*! all exports used */
function(t,n,r){"use strict";var o,e="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t};o=function(){return this}();try{o=o||Function("return this")()||(0,eval)("this")}catch(t){"object"===("undefined"==typeof window?"undefined":e(window))&&(o=window)}t.exports=o},/*!*******************************************!*\
  !*** ./node_modules/lodash/_getRawTag.js ***!
  \*******************************************/
/*! dynamic exports provided */
/*! all exports used */
function(t,n,r){"use strict";function o(t){var n=u.call(t,f),r=t[f];try{t[f]=void 0;var o=!0}catch(t){}var e=c.call(t);return o&&(n?t[f]=r:delete t[f]),e}var e=r(/*! ./_Symbol */3),i=Object.prototype,u=i.hasOwnProperty,c=i.toString,f=e?e.toStringTag:void 0;t.exports=o},/*!************************************************!*\
  !*** ./node_modules/lodash/_objectToString.js ***!
  \************************************************/
/*! dynamic exports provided */
/*! all exports used */
function(t,n,r){"use strict";function o(t){return i.call(t)}var e=Object.prototype,i=e.toString;t.exports=o},/*!***************************************!*\
  !*** ./node_modules/lodash/keysIn.js ***!
  \***************************************/
/*! dynamic exports provided */
/*! all exports used */
function(t,n,r){"use strict";function o(t){return u(t)?e(t,!0):i(t)}var e=r(/*! ./_arrayLikeKeys */18),i=r(/*! ./_baseKeysIn */30),u=r(/*! ./isArrayLike */9);t.exports=o},/*!***********************************************!*\
  !*** ./node_modules/lodash/_arrayLikeKeys.js ***!
  \***********************************************/
/*! dynamic exports provided */
/*! all exports used */
function(t,n,r){"use strict";function o(t,n){var r=u(t),o=!r&&i(t),p=!r&&!o&&c(t),l=!r&&!o&&!p&&s(t),a=r||o||p||l,b=a?e(t.length,String):[],h=b.length;for(var m in t)!n&&!y.call(t,m)||a&&("length"==m||p&&("offset"==m||"parent"==m)||l&&("buffer"==m||"byteLength"==m||"byteOffset"==m)||f(m,h))||b.push(m);return b}var e=r(/*! ./_baseTimes */19),i=r(/*! ./isArguments */20),u=r(/*! ./isArray */22),c=r(/*! ./isBuffer */23),f=r(/*! ./_isIndex */25),s=r(/*! ./isTypedArray */26),p=Object.prototype,y=p.hasOwnProperty;t.exports=o},/*!*******************************************!*\
  !*** ./node_modules/lodash/_baseTimes.js ***!
  \*******************************************/
/*! dynamic exports provided */
/*! all exports used */
function(t,n,r){"use strict";function o(t,n){for(var r=-1,o=Array(t);++r<t;)o[r]=n(r);return o}t.exports=o},/*!********************************************!*\
  !*** ./node_modules/lodash/isArguments.js ***!
  \********************************************/
/*! dynamic exports provided */
/*! all exports used */
function(t,n,r){"use strict";var o=r(/*! ./_baseIsArguments */21),e=r(/*! ./isObjectLike */2),i=Object.prototype,u=i.hasOwnProperty,c=i.propertyIsEnumerable,f=o(function(){return arguments}())?o:function(t){return e(t)&&u.call(t,"callee")&&!c.call(t,"callee")};t.exports=f},/*!*************************************************!*\
  !*** ./node_modules/lodash/_baseIsArguments.js ***!
  \*************************************************/
/*! dynamic exports provided */
/*! all exports used */
function(t,n,r){"use strict";function o(t){return i(t)&&e(t)==u}var e=r(/*! ./_baseGetTag */1),i=r(/*! ./isObjectLike */2),u="[object Arguments]";t.exports=o},/*!****************************************!*\
  !*** ./node_modules/lodash/isArray.js ***!
  \****************************************/
/*! dynamic exports provided */
/*! all exports used */
function(t,n,r){"use strict";var o=Array.isArray;t.exports=o},/*!*****************************************!*\
  !*** ./node_modules/lodash/isBuffer.js ***!
  \*****************************************/
/*! dynamic exports provided */
/*! all exports used */
function(t,n,r){"use strict";(function(t){var o="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},e=r(/*! ./_root */4),i=r(/*! ./stubFalse */24),u="object"==o(n)&&n&&!n.nodeType&&n,c=u&&"object"==o(t)&&t&&!t.nodeType&&t,f=c&&c.exports===u,s=f?e.Buffer:void 0,p=s?s.isBuffer:void 0,y=p||i;t.exports=y}).call(n,r(/*! ./../webpack/buildin/module.js */7)(t))},/*!******************************************!*\
  !*** ./node_modules/lodash/stubFalse.js ***!
  \******************************************/
/*! dynamic exports provided */
/*! all exports used */
function(t,n,r){"use strict";function o(){return!1}t.exports=o},/*!*****************************************!*\
  !*** ./node_modules/lodash/_isIndex.js ***!
  \*****************************************/
/*! dynamic exports provided */
/*! all exports used */
function(t,n,r){"use strict";function o(t,n){return!!(n=null==n?e:n)&&("number"==typeof t||i.test(t))&&t>-1&&t%1==0&&t<n}var e=9007199254740991,i=/^(?:0|[1-9]\d*)$/;t.exports=o},/*!*********************************************!*\
  !*** ./node_modules/lodash/isTypedArray.js ***!
  \*********************************************/
/*! dynamic exports provided */
/*! all exports used */
function(t,n,r){"use strict";var o=r(/*! ./_baseIsTypedArray */27),e=r(/*! ./_baseUnary */28),i=r(/*! ./_nodeUtil */29),u=i&&i.isTypedArray,c=u?e(u):o;t.exports=c},/*!**************************************************!*\
  !*** ./node_modules/lodash/_baseIsTypedArray.js ***!
  \**************************************************/
/*! dynamic exports provided */
/*! all exports used */
function(t,n,r){"use strict";function o(t){return u(t)&&i(t.length)&&!!c[e(t)]}var e=r(/*! ./_baseGetTag */1),i=r(/*! ./isLength */8),u=r(/*! ./isObjectLike */2),c={};c["[object Float32Array]"]=c["[object Float64Array]"]=c["[object Int8Array]"]=c["[object Int16Array]"]=c["[object Int32Array]"]=c["[object Uint8Array]"]=c["[object Uint8ClampedArray]"]=c["[object Uint16Array]"]=c["[object Uint32Array]"]=!0,c["[object Arguments]"]=c["[object Array]"]=c["[object ArrayBuffer]"]=c["[object Boolean]"]=c["[object DataView]"]=c["[object Date]"]=c["[object Error]"]=c["[object Function]"]=c["[object Map]"]=c["[object Number]"]=c["[object Object]"]=c["[object RegExp]"]=c["[object Set]"]=c["[object String]"]=c["[object WeakMap]"]=!1,t.exports=o},/*!*******************************************!*\
  !*** ./node_modules/lodash/_baseUnary.js ***!
  \*******************************************/
/*! dynamic exports provided */
/*! all exports used */
function(t,n,r){"use strict";function o(t){return function(n){return t(n)}}t.exports=o},/*!******************************************!*\
  !*** ./node_modules/lodash/_nodeUtil.js ***!
  \******************************************/
/*! dynamic exports provided */
/*! all exports used */
function(t,n,r){"use strict";(function(t){var o="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},e=r(/*! ./_freeGlobal */5),i="object"==o(n)&&n&&!n.nodeType&&n,u=i&&"object"==o(t)&&t&&!t.nodeType&&t,c=u&&u.exports===i,f=c&&e.process,s=function(){try{return f&&f.binding&&f.binding("util")}catch(t){}}();t.exports=s}).call(n,r(/*! ./../webpack/buildin/module.js */7)(t))},/*!********************************************!*\
  !*** ./node_modules/lodash/_baseKeysIn.js ***!
  \********************************************/
/*! dynamic exports provided */
/*! all exports used */
function(t,n,r){"use strict";function o(t){if(!e(t))return u(t);var n=i(t),r=[];for(var o in t)("constructor"!=o||!n&&f.call(t,o))&&r.push(o);return r}var e=r(/*! ./isObject */6),i=r(/*! ./_isPrototype */31),u=r(/*! ./_nativeKeysIn */32),c=Object.prototype,f=c.hasOwnProperty;t.exports=o},/*!*********************************************!*\
  !*** ./node_modules/lodash/_isPrototype.js ***!
  \*********************************************/
/*! dynamic exports provided */
/*! all exports used */
function(t,n,r){"use strict";function o(t){var n=t&&t.constructor;return t===("function"==typeof n&&n.prototype||e)}var e=Object.prototype;t.exports=o},/*!**********************************************!*\
  !*** ./node_modules/lodash/_nativeKeysIn.js ***!
  \**********************************************/
/*! dynamic exports provided */
/*! all exports used */
function(t,n,r){"use strict";function o(t){var n=[];if(null!=t)for(var r in Object(t))n.push(r);return n}t.exports=o},/*!************************!*\
  !*** ./src/promise.js ***!
  \************************/
/*! dynamic exports provided */
/*! all exports used */
function(t,n,r){"use strict";function o(t){return Promise.all(t)}function e(t){return Promise.resolve(t)}function i(t){throw t instanceof Error&&(this._error=t),new Error("Reject only accepts a new instance of Error!")}function u(t){var n=function(n){return Promise.resolve(n).then(function(n){return t(n),n})};return this instanceof Promise?n(this):n}t.exports=function(t){t.prototype.all=t.all=o,t.prototype.cast=e,t.prototype.tap=u,t.prototype.reject=i}},/*!****************************!*\
  !*** ./src/conditional.js ***!
  \****************************/
/*! dynamic exports provided */
/*! all exports used */
function(t,n,r){"use strict";function o(t,n,r){return this instanceof FR?this.then(function(o){return i(t,n,r)(o)}):i(t,n,r)}function e(t,n,r){return this instanceof FR?this.then(function(o){return i(t,n,r,!0)(o)}):i(t,n,r,!0)}function i(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:function(t){return t},n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:function(t){return t},r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:function(){return null},o=arguments.length>3&&void 0!==arguments[3]&&arguments[3];return function(e){return FR.resolve(t(e)).then(function(t){return t?n(e):r(e)}).then(function(t){return o?e:t})}}t.exports=function(t){t.prototype.tapIf=e,t.prototype.thenIf=o,t.prototype._thenIf=i,t._thenIf=i}},/*!*******************************!*\
  !*** ./src/modules/arrays.js ***!
  \*******************************/
/*! dynamic exports provided */
/*! all exports used */
function(t,n,r){"use strict";function o(t){if(Array.isArray(t)){for(var n=0,r=Array(t.length);n<t.length;n++)r[n]=t[n];return r}return Array.from(t)}var e=function(){function t(t,n){var r=[],o=!0,e=!1,i=void 0;try{for(var u,c=t[Symbol.iterator]();!(o=(u=c.next()).done)&&(r.push(u.value),!n||r.length!==n);o=!0);}catch(t){e=!0,i=t}finally{try{!o&&c.return&&c.return()}finally{if(e)throw i}}return r}return function(n,r){if(Array.isArray(n))return n;if(Symbol.iterator in Object(n))return t(n,r);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}(),i=r(/*! lodash/isArrayLike */9),u=r(/*! ./utils */36),c=u.isPromiseLike,f=r(/*! ./errors */37),s=(f.FunctionalError,f.FRUnexpectedError,f.FRInputError);f.FunctionalUserError;t.exports=function(t){function n(t,n,r){return r=r||this,[].concat(o(t)).reduce(function(t){for(var o=arguments.length,e=Array(o>1?o-1:0),i=1;i<o;i++)e[i-1]=arguments[i];return t.then(function(t){return n.apply(r,e).then(function(n){return t.concat(n)})})},Promise.resolve([]))}function r(t,n,r){1===arguments.length&&this&&this._FR&&(n=t,t=this&&this._FR&&this._FR.promise);var u=0,f=[],p=new Set,y=function(t){return function(n){return f[t]=n,n}},l=function(){var r=[n(t[u],u,t),u];return u++,r},a=this&&this._FR&&this._FR.concurrencyLimit||1/0;return(this&&this._FR&&this._FR.promise?this._FR.promise:Promise.resolve(t)).then(function(n){if(!i(n))throw new s("Invalid input data passed into FR.map()");for(t=[].concat(o(n));u<t.length;)for(;u<t.length&&p.size<a;)!function(){var t=l(),n=e(t,2),r=n[0],o=n[1];c(r)?(p.add(r),r.then(y(o)).then(function(){p.delete(r)})):y(o)(r)}();return f})}Object.assign(t.prototype,{map:r,series:n})}},/*!******************************!*\
  !*** ./src/modules/utils.js ***!
  \******************************/
/*! dynamic exports provided */
/*! all exports used */
function(t,n,r){"use strict";function o(t){return t&&"function"==typeof t.then}t.exports={isPromiseLike:o}},/*!*******************************!*\
  !*** ./src/modules/errors.js ***!
  \*******************************/
/*! dynamic exports provided */
/*! all exports used */
function(t,n,r){"use strict";function o(t,n){if(!(t instanceof n))throw new TypeError("Cannot call a class as a function")}function e(t,n){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!n||"object"!=typeof n&&"function"!=typeof n?t:n}function i(t,n){if("function"!=typeof n&&null!==n)throw new TypeError("Super expression must either be null or a function, not "+typeof n);t.prototype=Object.create(n&&n.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),n&&(Object.setPrototypeOf?Object.setPrototypeOf(t,n):t.__proto__=n)}var u="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},c=function(t){function n(t,r){o(this,n),"object"===(void 0===t?"undefined":u(t))&&t.message&&(r=t,t=t.message);var i=e(this,(n.__proto__||Object.getPrototypeOf(n)).call(this,t));return"object"===(void 0===r?"undefined":u(r))&&Object.assign(i,r),i}return i(n,t),n}(Error),f=function(t){function n(){return o(this,n),e(this,(n.__proto__||Object.getPrototypeOf(n)).apply(this,arguments))}return i(n,t),n}(c),s=function(t){function n(){return o(this,n),e(this,(n.__proto__||Object.getPrototypeOf(n)).apply(this,arguments))}return i(n,t),n}(c),p=function(t){function n(){return o(this,n),e(this,(n.__proto__||Object.getPrototypeOf(n)).apply(this,arguments))}return i(n,t),n}(c),y=function(t){function n(){return o(this,n),e(this,(n.__proto__||Object.getPrototypeOf(n)).apply(this,arguments))}return i(n,t),n}(c),l=function(t){function n(){return o(this,n),e(this,(n.__proto__||Object.getPrototypeOf(n)).apply(this,arguments))}return i(n,t),n}(c);t.exports={FunctionalError:c,FunctionalUserError:f,FRUnexpectedError:s,FRInputError:p,FRSoftError:y,FRTimeout:l}}]);
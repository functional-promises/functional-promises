'use strict'

var isComment = /^\/\/\/\/*/

var retryLimit = 10
var retryCount = 0

document.addEventListener('DOMContentLoaded', function() {
  autoRunkit()
})

function makeElem(type, attributes/*, children*/) {
  var el = document.createElement(type);
  for (var _len = arguments.length, children = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    children[_key - 2] = arguments[_key]
  }
  Object.keys(attributes).forEach(key => {
    // would it be better to use propertys
    el.setAttribute(key, attributes[key])
  })

  children.forEach(function (child) {
    if (typeof child === 'string') {
      el.appendChild(document.createTextNode(child));
    } else {
      el.appendChild(child);
    }
  });
  return el;
}

function autoRunkit() {
  if (typeof RunKit !== 'undefined') {
    initRunKit()
  } else {
    console.warn('RunKit not Loaded - check for script tag!')
  }
}

function initRunKit() {
  var codeBlocks = document.querySelectorAll('pre.highlight.javascript')
  if (codeBlocks.length <= 1) {
    retryCount ++
    // console.warn('Code syntax/highlight isn\'t initialized!!! Retry #' + retryCount)
    if (retryCount >= retryLimit) {return retryCount}
    return setTimeout(initRunKit, 500)
  }
  return Array.prototype.filter.call(codeBlocks, canRunCodeBlock)
    .map(addRunkitButton)
}

function canRunCodeBlock(codeBlock) {
  // ensure it doesnt start w/ a comment `////`: used to mark non-live examples or pseudo-code
  return !isComment.test(codeBlock.textContent)
}

function addRunkitButton(codeBlock) {
  var link = makeElem('a', {'class': 'runkit-start', 'href': ''}, 'Edit/Test (powered by RunKit)')
  link.addEventListener('click', function (e) {
    e.preventDefault()
    startRunkitInstance(codeBlock)
  })
  codeBlock.prepend(link)
}

function getCloseRunkitButton(codeBlock, editor) {
  var link = makeElem('a', {'class': 'runkit-close', 'href': ''}, 'Close Editor')
  link.addEventListener('click', function (e) {
    e.preventDefault()
    codeBlock.style.visibility = 'visible'
    // editor.style.display = 'none'
    editor.parentNode.removeChild(editor)
  })
  return link
}

function getPlaceholder(elem) {
  var style = 'minHeight:' + elem.height + 'px; top:' + (window.scrollY + elem.top) + 'px; width:' + elem.width + 'px;'
  return makeElem('div', {'class': 'runkit-placeholder', 'style': style})
}

function startRunkitInstance(codeBlock) {
  var source = codeBlock.querySelector('code').textContent
  var codeBox = codeBlock.getBoundingClientRect()
  var placeholder = getPlaceholder(codeBox)

  placeholder.prepend(getCloseRunkitButton(codeBlock, placeholder))
  codeBlock.before(placeholder)
  codeBlock.style.visibility = 'hidden'
  placeholder.style.display = ''

  // TODO: Add window.resize support - attach closure on elem and find via CSS selector? also, i found a great use case for WeakMap!
  // load the runkit widget
  codeBlock.runkitNotebook = RunKit.createNotebook({
    element: placeholder,
    preamble: 'const FP = require(\'functional-promise\');\n',
    source: source,// + '\n',
    // minHeight: codeBox.height + 'px',
    onEvaluate: function() {
      // console.log('onEvaluate', arguments)
      // TODO: I'd like the inner document.body.scrollHeight
      // var minHeight = parseFloat(placeholder.style.minHeight)
      // var multiplier = minHeight < 200
      //   ? 1.5
      //   : minHeight < 400
      //     ? 1.3
      //     : 1.25
      // placeholder.style.minHeight = (minHeight * multiplier) + 'px'
      // console.info('onEvaluate', placeholder.style.minHeight)
    }
  })
  return codeBlock
}

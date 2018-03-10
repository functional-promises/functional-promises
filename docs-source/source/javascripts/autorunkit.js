
(function _wrapRunKit() {
  'use strict';

  var isComment = /^\/\/\/\/*/
  var retryLimit = 10
  var retryCount = 0

  window.initRunKit = initRunKit

  document.addEventListener('DOMContentLoaded', function() {
    if (typeof RunKit !== 'undefined') {
      initRunKit()
    } else {
      console.warn('RunKit not Loaded - check for script tag!')
    }
  })

  function makeElem(type, attributes) {
    var el = document.createElement(type);
    for (var _len = arguments.length, children = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      children[_key - 2] = arguments[_key]
    }
    Object.keys(attributes).forEach(function(key) {
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
    var link = makeElem('a', {'class': 'runkit-start', 'href': ''}, 'Edit/Test (w/ RunKit)')
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
      codeBlock.classList.remove('runkit-live')
      applyResizeHandler()
    })
    return link
  }

  function getPlaceholder(elem) {
    var style = 'min-height:' + elem.height + 'px; top:' + (window.scrollY + elem.top) + 'px; width: ' + elem.width + 'px; right: 0;'// + elem.width + 'px;'
    return makeElem('div', {'class': 'runkit-placeholder', 'style': style})
  }

  function startRunkitInstance(codeBlock) {
    var source = codeBlock.querySelector('code').textContent
    var codeBox = codeBlock.getBoundingClientRect()
    var placeholder = getPlaceholder(codeBox)

    placeholder.prepend(getCloseRunkitButton(codeBlock, placeholder))
    placeholder.style.display = ''
    codeBlock.before(placeholder)
    codeBlock.classList.add('runkit-live')
    codeBlock.style.visibility = 'hidden'

    // TODO: Add window.resize support - attach closure on elem and find via CSS selector? also, i found a great use case for WeakMap!
    // load the runkit widget
    codeBlock.runkitNotebook = RunKit.createNotebook({
      element: placeholder,
      preamble: 'const FP = require(\'functional-promise\');\nconst fetch = require(\'isomorphic-fetch\')\n',
      source: source,// + '\n',
      // minHeight: codeBox.height + 'px',
    })
    codeBlock.runkitElement = placeholder;
    applyResizeHandler()
    return codeBlock
  }

  function applyResizeHandler() {
    const liveEditors = getLiveCodeBlocks();
    if (liveEditors.length > 0) {
      window.addEventListener('resize', resizeEditors)
    } else {
      window.removeEventListener('resize', resizeEditors)
    }
  }

  function getLiveCodeBlocks() {
    return document.querySelectorAll('pre.highlight.runkit-live')
  }

  function resizeEditors() {
    var codeBlocks = getLiveCodeBlocks()
    // console.log('codeBlock', [].slice.call(codeBlocks))
    Array.prototype.map.call(codeBlocks, function(el) {
      var editor = el.runkitElement
      clonePosition(el, editor)
    })
  }

  function clonePosition(srcElem, targetElem) {
    var position = srcElem.getBoundingClientRect()
    targetElem.style.width = position.width + 'px'
    targetElem.style.height = position.height + 'px'
    // targetElem.style.left = position.left + 'px'
    targetElem.style.top = (position.top + window.scrollY) + 'px'
    setTimeout(function() {
      // console.log('src position', position)
      // console.log('newPos', targetElem.getBoundingClientRect())
    }, 10);
    return targetElem
  }

})()

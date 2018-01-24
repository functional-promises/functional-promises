'use strict';

var isComment = /^\/\/|\/\*/;

var retryLimit = 10;
var retryCount = 0;

$(function() {
  autoRunkit()
});

function autoRunkit() {
  if (typeof RunKit !== 'undefined') {
    initRunKit();
  } else {
    console.warn('RunKit not Loaded - check for script tag!')
  }
}

function initRunKit() {
  var codeBlocks = document.querySelectorAll('pre.highlight.javascript');
  if (codeBlocks.length <= 1) {
    retryCount ++;
    console.warn('Code syntax/highlight isn\'t initialized!!! Retry #' + retryCount)
    if (retryCount >= retryLimit) {return retryCount;}
    return setTimeout(initRunKit, 500)
  }
  return Array.prototype.filter.call(codeBlocks, canRunCodeBlock)
    .map(addRunkitButton);
}


function canRunCodeBlock(codeBlock) {
  // ensure it doesnt start w/ a comment: used to mark non-live examples or pseudo-code
  return !isComment.test(codeBlock.textContent)
}

function addRunkitButton(codeBlock) {
  var link = document.createElement('a');
  link.classList.add('runkit-start');
  link.textContent = 'Edit/Run Live';
  link.href = '';
  link.addEventListener('click', function (e) {
    e.preventDefault();
    startRunkitInstance(codeBlock);
  });
  codeBlock.prepend(link);
}

function getCloseRunkitButton(codeBlock, editor) {
  var link = document.createElement('a');
  link.classList.add('runkit-close');
  link.textContent = 'Close Editor';
  link.href = '';
  link.addEventListener('click', function (e) {
    e.preventDefault();
    codeBlock.style.visibility = 'visible'
    editor.style.display = 'none'
  });
  return link
}

function getPlaceholder(_ref) {
  console.log('Placeholder:', JSON.stringify(_ref))
  var placeholder = document.createElement('div');
  placeholder.classList.add('runkit-placeholder');
  placeholder.style.height = _ref.height + 'px';
  placeholder.style.top = (window.scrollY + _ref.top) + 'px';
  placeholder.style.width = _ref.width + 'px';
  return placeholder;
}

function startRunkitInstance(codeBlock) {
  var source = codeBlock.querySelector('code').textContent;

  var placeholder = getPlaceholder(codeBlock.getBoundingClientRect());
  placeholder.prepend(getCloseRunkitButton(codeBlock, placeholder));
  codeBlock.before(placeholder);
  codeBlock.style.visibility = 'hidden'
  placeholder.style.display = ''

  // load the runkit widget
  codeBlock.runkitNotebook = RunKit.createNotebook({
    element: placeholder,
    preamble: 'const FP = require(\'functional-promise\');' + 'const assert = require(\'assert\');',
    source: source + '\n'
  });
  // hide highlighted source
  codeBlock

  return codeBlock;
}

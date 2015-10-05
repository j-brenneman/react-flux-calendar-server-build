(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/Jacob/workspace/scheduler/front-end/node_modules/browserify/lib/_empty.js":[function(require,module,exports){

},{}],"/Users/Jacob/workspace/scheduler/front-end/node_modules/browserify/node_modules/path-browserify/index.js":[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require('_process'))

},{"_process":"/Users/Jacob/workspace/scheduler/front-end/node_modules/browserify/node_modules/process/browser.js"}],"/Users/Jacob/workspace/scheduler/front-end/node_modules/browserify/node_modules/process/browser.js":[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            currentQueue[queueIndex].run();
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],"/Users/Jacob/workspace/scheduler/front-end/node_modules/cldr/lib/CldrPluralRule.js":[function(require,module,exports){
(function (__dirname){
var fs = require('fs'),
    Path = require('path'),
    PEG = require('pegjs'),
    parser = PEG.buildParser(fs.readFileSync(Path.resolve(__dirname, 'cldrPluralRule.pegjs'), 'utf-8'));

function rangeListToJavaScriptAst(rangeListNode, lhsJavaScriptAst, withinSemantics) {
    var javaScriptAst,
        seenRange = false;
    for (var i = rangeListNode.ranges.length - 1 ; i >= 0 ; i -= 1) {
        var range = rangeListNode.ranges[i],
            itemJavaScriptAst;
        if (range.type === 'number') {
            itemJavaScriptAst = ['binary', '===', lhsJavaScriptAst, ['num', range.value]];
        } else {
            // range.type === 'range'
            seenRange = true;
            itemJavaScriptAst = ['binary', '&&', ['binary', '>=', lhsJavaScriptAst, ['num', range.min.value]],
                                                 ['binary', '<=', lhsJavaScriptAst, ['num', range.max.value]]];
        }
        if (javaScriptAst) {
            javaScriptAst = ['binary', '||', itemJavaScriptAst, javaScriptAst];
        } else {
            javaScriptAst = itemJavaScriptAst;
        }
    }
    if (seenRange && !withinSemantics) {
        javaScriptAst = ['binary', '&&', ['binary', '===', lhsJavaScriptAst,
                                                           ['call', ['dot', ['name', 'Math'], 'floor'], [lhsJavaScriptAst]]],
                                         javaScriptAst];
    }
    return javaScriptAst;
}

function nodeToJavaScriptAst(node) {
    switch (node.type) {
    case 'number':
        return ['num', node.value];
    case 'n':
    case 'i':
    case 'v':
    case 'w':
    case 'f':
    case 't':
        return ['name', node.type];
    case 'is':
        return ['binary', '==='].concat(node.operands.map(nodeToJavaScriptAst));
    case 'isnot':
        return ['binary', '!=='].concat(node.operands.map(nodeToJavaScriptAst));
    case 'mod':
        return ['binary', '%'].concat(node.operands.map(nodeToJavaScriptAst));
    case 'and':
        return ['binary', '&&'].concat(node.operands.map(nodeToJavaScriptAst));
    case 'or':
        return ['binary', '||'].concat(node.operands.map(nodeToJavaScriptAst));
    case 'not':
        return ['unary-prefix', '!', nodeToJavaScriptAst(node.operands)];
    case 'isnot':
        return ['binary', '!=='].concat(node.operands.map(nodeToJavaScriptAst));
    case 'within':
        return rangeListToJavaScriptAst(node.operands[1], nodeToJavaScriptAst(node.operands[0]), true);
    case 'notwithin':
        return ['unary-prefix', '!', rangeListToJavaScriptAst(node.operands[1], nodeToJavaScriptAst(node.operands[0]), true)];
    case 'in':
        return rangeListToJavaScriptAst(node.operands[1], nodeToJavaScriptAst(node.operands[0]), false);
    case 'notin':
        return ['unary-prefix', '!', rangeListToJavaScriptAst(node.operands[1], nodeToJavaScriptAst(node.operands[0]), false)];
    default:
        throw new Error('nodeToJavaScriptAst: Unknown node type: ' + node.type);
    }
}

function traverse(node, lambda) {
    lambda(node);
    if (node.operands) {
        node.operands.forEach(function (operand) {
            traverse(operand, lambda);
        });
    }
}

function CldrPluralRule(src) {
    this.topLevelNode = parser.parse(src.replace(/^\s+|\s+$/g, '').replace(/\s{2,}/g, ' '));
}

CldrPluralRule.prototype = {
    toJavaScriptAst: function () {
        return nodeToJavaScriptAst(this.topLevelNode);
    },

    eachNode: function (lambda) {
        traverse(this.topLevelNode, lambda);
    },

    updateIsUsedByTerm: function (isUsedByTerm) {
        this.eachNode(function (node) {
            if (['i', 'v', 'w', 'f', 't', 'n'].indexOf(node.type) !== -1) {
                isUsedByTerm[node.type] = true;
            }
        });
        return isUsedByTerm;
    }
};

module.exports = CldrPluralRule;

}).call(this,"/node_modules/cldr/lib")

},{"fs":"/Users/Jacob/workspace/scheduler/front-end/node_modules/browserify/lib/_empty.js","path":"/Users/Jacob/workspace/scheduler/front-end/node_modules/browserify/node_modules/path-browserify/index.js","pegjs":"/Users/Jacob/workspace/scheduler/front-end/node_modules/cldr/node_modules/pegjs/lib/peg.js"}],"/Users/Jacob/workspace/scheduler/front-end/node_modules/cldr/lib/CldrPluralRuleSet.js":[function(require,module,exports){
var CldrPluralRule = require('./CldrPluralRule'),
    cldrPluralRuleTermFunctionByName = require('./cldrPluralRuleTermFunctionByName'),
    uglifyJs = require('uglify-js');

function CldrPluralRuleSet() {
    this.cldrPluralRuleByCount = {};
}

CldrPluralRuleSet.prototype = {
    addRule: function (cldrPluralRule, count) {
        if (typeof cldrPluralRule === 'string') {
            cldrPluralRule = cldrPluralRule.replace(/\s*@(?:decimal|integer).*$/, '');
            // Some count="other" nodes in CLDR 24+ consist purely of sample text.
            // Don't add those.
            if (cldrPluralRule.length === 0) {
                return;
            }
            cldrPluralRule = new CldrPluralRule(cldrPluralRule);
        }
        this.cldrPluralRuleByCount[count] = cldrPluralRule;
    },

    toJavaScriptFunctionBodyAst: function () {
        var statementAsts = [],
            isUsedByTerm = {};
        Object.keys(this.cldrPluralRuleByCount).forEach(function (count) {
            var cldrPluralRule = this.cldrPluralRuleByCount[count];
            cldrPluralRule.updateIsUsedByTerm(isUsedByTerm);
            statementAsts.push(
                [
                    'if',
                    cldrPluralRule.toJavaScriptAst(),
                    ['return', ['string', count]]
                ]
            );
        }, this);
        statementAsts.push(['return', ['string', 'other']]);
        var varAsts = [];

        ['i', 'v', 'w', 'f', 't'].forEach(function (term) {
            if (isUsedByTerm[term]) {
                varAsts.push([term, uglifyJs.parser.parse(cldrPluralRuleTermFunctionByName[term].toString())[1][0][3][0][1]]);
            }
        });

        if (Object.keys(isUsedByTerm).length !== 0) {
            statementAsts.unshift(
                // if (typeof n === 'string') n = parseInt(n, 10);
                [ 'if',
                      [ 'binary',
                        '===',
                        [ 'unary-prefix', 'typeof', [ 'name', 'n' ] ],
                        [ 'string', 'string' ] ],
                      [ 'stat',
                        [ 'assign',
                          true,
                          [ 'name', 'n' ],
                          [ 'call',
                            [ 'name', 'parseInt' ],
                            [ [ 'name', 'n' ], [ 'num', 10 ] ] ] ] ],
                      undefined ]
            );
        }

        if (varAsts.length > 0) {
            statementAsts.unshift(['var', varAsts]);
        }
        return statementAsts;
    }
};

module.exports = CldrPluralRuleSet;

},{"./CldrPluralRule":"/Users/Jacob/workspace/scheduler/front-end/node_modules/cldr/lib/CldrPluralRule.js","./cldrPluralRuleTermFunctionByName":"/Users/Jacob/workspace/scheduler/front-end/node_modules/cldr/lib/cldrPluralRuleTermFunctionByName.js","uglify-js":"/Users/Jacob/workspace/scheduler/front-end/node_modules/cldr/node_modules/uglify-js/uglify-js.js"}],"/Users/Jacob/workspace/scheduler/front-end/node_modules/cldr/lib/CldrRbnfRuleSet.js":[function(require,module,exports){
var _ = require('underscore');

function CldrRbnfRuleSet(config) {
    _.extend(this, config);
    this.ruleByValue = {};
}

CldrRbnfRuleSet.getSafeRendererName = function (rendererName) {
    return (
        ("render-" + rendererName)
        .replace(/[^\w-]/g, '-')
        .replace(/[-_]+([0-9a-z])/gi, function ($0, ch) {
            return ch.toUpperCase();
        })
        .replace('GREEKNUMERALMAJUSCULES', 'GreekNumeralMajuscules')
    );
};

CldrRbnfRuleSet.prototype = {
    toFunctionAst: function () {
        var that = this,
            isSeenByRuleSetType = {};

        function ruleToExpressionAst(rule) {
            var expressionAsts = [],
                rbnf = rule.rbnf;

            // "If a rule body begins with an apostrophe, the apostrophe is ignored, but all text after it becomes
            // significant (this is how you can have a rule's rule text begin with whitespace)."
            // -- http://www.icu-project.org/apiref/icu4c/classRuleBasedNumberFormat.html
            rbnf = rbnf.replace(/^'/, '');

            var radix = rule.radix || 10;

            function getDivisor() {
                var divisor = 1;
                while (10 * divisor <= parseInt(rule.value, 10)) { // Inefficient, but won't suffer from Math.log rounding errors
                    divisor *= 10;
                }
                return divisor;
            }

            // Replace is used for tokenization, the return value isn't used:
            rbnf.replace(/(?:([\<\>\=])(?:(%%?[\w\-]+)|([#,0.]+))?\1)|(?:\[([^\]]+)\])|([\x7f-\uffff:'\.\s\w\d\-]+)/gi, function ($0, specialChar, otherFormat, decimalFormat, optional, literal) {
                // The meanings of the substitution token characters are as follows:
                if (specialChar) {
                    var expr;
                    if (specialChar === '<') { // <<
                        if (/^\d+$/.test(rule.value)) {
                            // In normal rule: Divide the number by the rule's divisor and format the quotient
                            expr = ['call', ['dot', ['name', 'Math'], 'floor'], [['binary', '/', ['name', 'n'], ['num', getDivisor()]]]];
                        } else if (rule.value === '-x') {
                            throw new Error('<< not allowed in negative number rule');
                        } else {
                            // In fraction or master rule: Isolate the number's integral part and format it.
                            expr = ['call', ['dot', ['name', 'Math'], 'floor'], [['name', 'n']]];
                        }
                    } else if (specialChar === '>') { // >>
                        if (/\./.test(rule.value)) {
                            // Fraction or master rule => parseInt(String(n).replace(/\d*\./, ''), 10)
                            expr = ['call', ['name', 'parseInt'], [['call', ['dot', ['call', ['name', 'String'], [['name', 'n']]], 'replace'], [['regexp', '\\d*\\.', ''], ['string', '']]], ['num', 10]]];
                        } else if (rule.value === '-x') {
                            expr = ['unary-prefix', '-', ['name', 'n']];
                        } else {
                            expr = ['binary', '%', ['name', 'n'], ['num', getDivisor()]];
                        }
                    } else if (specialChar === '=') { // ==
                        expr = ['name', 'n'];
                    }
                    // FIXME: >>> not supported

                    // The substitution descriptor (i.e., the text between the token characters) may take one of three forms:
                    if (otherFormat) {
                        // A rule set name:
                        // Perform the mathematical operation on the number, and format the result using the named rule set.
                        var otherFormatName = CldrRbnfRuleSet.getSafeRendererName(otherFormat);
                        isSeenByRuleSetType[otherFormatName] = true;
                        // Turn into this.<otherFormatName>(<expr>)
                        expressionAsts.push(['call', ['dot', ['name', 'this'], otherFormatName], [expr]]);
                    } else if (decimalFormat) {
                        // A DecimalFormat pattern:
                        // Perform the mathematical operation on the number, and format the result using a DecimalFormat
                        // with the specified pattern. The pattern must begin with 0 or #.
                        expressionAsts.push(['call', ['dot', ['name', 'this'], 'renderNumber'], [expr, ['string', decimalFormat]]]);
                    } else {
                        // Nothing:
                        if (specialChar === '>') {
                            // If you omit the substitution descriptor in a >> substitution in a fraction rule, format the result one digit at a time using the rule set containing the current rule.
                            expressionAsts.push(['call', ['dot', ['name', 'this'], that.type], [expr]]);
                        } else if (specialChar === '<') {
                            // If you omit the substitution descriptor in a << substitution in a rule in a fraction rule set, format the result using the default rule set for this renderer.
                            // FIXME: Should be the default rule set for this renderer!
                            expressionAsts.push(['call', ['dot', ['name', 'this'], that.type], [expr]]);
                        } else {
                            throw new Error('== not supported!');
                        }
                   }
                } else if (optional) { // [ ... ]
                    var optionalRuleExpressionAst = ruleToExpressionAst({radix: rule.radix, rbnf: optional, value: rule.value});
                    expressionAsts.push(['conditional', ['binary', '===', ['name', 'n'], ['num', parseInt(rule.value, 10)]], ['string', ''], optionalRuleExpressionAst]);
                } else if (literal) {
                    expressionAsts.push(['string', literal]);
                } else {
                    throw new Error("Unknown token in " + rule.rbnf);
                }
            });
            if (expressionAsts.length === 0) {
                expressionAsts = [['string', '']];
            }
            var expressionAst = expressionAsts.shift();
            while (expressionAsts.length > 0) {
                expressionAst = ['binary', '+', expressionAst, expressionAsts.shift()];
            }
            return expressionAst;
        }

        function conditionToStatementAst(conditionAst, rule) {
            return ['if', conditionAst, ['return', ruleToExpressionAst(rule)], null];
        }

        var statementAsts = [];
        if (this.ruleByValue['x.0'] || this.ruleByValue['x.x']) {
            // var isFractional = n !== Math.floor(n);
            statementAsts.push(['var', [['isFractional', ['binary', '!==', ['name', 'n'], ['call', ['dot', ['name', 'Math'], 'floor'], [['name', 'n']]]]]]]);
        }
        if (this.ruleByValue['x.0']) {
            statementAsts.push(conditionToStatementAst(['name', 'isFractional'], this.ruleByValue['x.0']));
        }
        if (this.ruleByValue['-x']) {
            statementAsts.push(conditionToStatementAst(['binary', '<', ['name', 'n'], ['num', 0]], this.ruleByValue['-x']));
        }
        if (this.ruleByValue['x.x']) {
            statementAsts.push(conditionToStatementAst(['binary', '&&', ['name', 'isFractional'], ['binary', '>', ['name', 'n'], ['num', 1]]], this.ruleByValue['x.x']));
        }
        if (this.ruleByValue['0.x']) {
            statementAsts.push(conditionToStatementAst(['binary', '&&', ['binary', '>', ['name', 'n'], ['num', 0]], ['binary', '<', ['name', 'n'], ['num', 1]]], this.ruleByValue['0.x']));
        }

        Object.keys(this.ruleByValue).filter(function (value) {
            return /^\d+$/.test(value);
        }).map(function (value) {
            return parseInt(value, 10);
        }).sort(function (a, b) {
            return b - a;
        }).forEach(function (numericalValue) {
            statementAsts.push(conditionToStatementAst(['binary', '>=', ['name', 'n'], ['num', numericalValue]], this.ruleByValue[numericalValue]));
        }, this);

        return {functionAst: ['function', null, ['n'], statementAsts], dependencies: Object.keys(isSeenByRuleSetType)};
    }
};

module.exports = CldrRbnfRuleSet;

},{"underscore":"/Users/Jacob/workspace/scheduler/front-end/node_modules/cldr/node_modules/underscore/underscore.js"}],"/Users/Jacob/workspace/scheduler/front-end/node_modules/cldr/lib/cldr.js":[function(require,module,exports){
(function (process,__dirname){
var Path = require('path'),
    fs = require('fs'),
    _ = require('underscore'),
    passError = require('passerror'),
    memoizeAsync = require('./memoizeAsync'),
    dom = require('xmldom').DOMParser,
    xpath = require('xpath'),
    seq = require('seq'),
    normalizeLocaleId = require('./normalizeLocaleId'),
    normalizeProperty = require('./normalizeProperty'),
    convertObjectsWithIntegerKeysToArrays = require('./convertObjectsWithIntegerKeysToArrays'),
    CldrPluralRuleSet = require('./CldrPluralRuleSet'),
    CldrRbnfRuleSet = require('./CldrRbnfRuleSet'),
    uglifyJs = require('uglify-js'),
    unicoderegexp = require('unicoderegexp');

function normalizeXPathQuery(xpathQuery) {
    var xpathQueryFragments = xpathQuery.split('/');
    for (var i = 0 ; i < xpathQueryFragments.length ; i += 1) {
        if (i > 0 && xpathQueryFragments[i] === '..' && xpathQueryFragments[i - 1] !== '..') {
            xpathQueryFragments.splice(i - 1, 2);
            i -= 2;
        }
    }
    return xpathQueryFragments.join('/');
}

function expandLocaleIdToPrioritizedList(localeId) {
    localeId = normalizeLocaleId(localeId);
    if (!localeId) {
        return [];
    }
    var localeIds = [localeId];
    while (/_[^_]+$/.test(localeId)) {
        localeId = localeId.replace(/_[^_]+$/, '');
        localeIds.push(localeId);
    }
    return localeIds;
}

function Cldr(cldrPath) {
    // Support instantiation without the 'new' operator:
    if (!(this instanceof Cldr)) {
        return new Cldr(cldrPath);
    }
    this.cldrPath = cldrPath;
    this.documentByFileName = {};
    this.memoizerByFileName = {};
}

Cldr.prototype = {
    get fileNamesByTypeAndNormalizedLocaleId() {
        if (!this._fileNamesByTypeAndNormalizedLocaleId) {
            this._fileNamesByTypeAndNormalizedLocaleId = {};
            ['main', 'rbnf'].forEach(function (type) {
                this._fileNamesByTypeAndNormalizedLocaleId[type] = {};
                var fileNames;
                try {
                    fileNames = fs.readdirSync(Path.resolve(this.cldrPath, "common", type));
                } catch (e) {
                    if (e.code === 'ENOENT') {
                        // Directory doesn't exist, just pretend it's empty.
                        return;
                    }
                }
                fileNames.forEach(function (fileName) {
                    var matchFileName = fileName.match(/^(.*)\.xml$/);
                    if (matchFileName) {
                        this._fileNamesByTypeAndNormalizedLocaleId[type][normalizeLocaleId(matchFileName[1])] =
                            Path.resolve(this.cldrPath, "common", type, fileName);
                    }
                }, this);
            }, this);
        }
        return this._fileNamesByTypeAndNormalizedLocaleId;
    },

    get localeIds() {
        if (!this._localeIds) {
            this._localeIds = Object.keys(this.fileNamesByTypeAndNormalizedLocaleId.main);
        }
        return this._localeIds;
    },

    get calendarIds() {
        if (!this._calendarIds) {
            this._calendarIds = [];
            xpath.select('/ldmlBCP47/keyword/key[@name="ca"]/type', this.getDocument(Path.resolve(this.cldrPath, 'common', 'bcp47', 'calendar.xml'))).forEach(function (keyNode) {
                var calendarId = keyNode.getAttribute('name');
                if (calendarId === 'gregory') {
                    calendarId = 'gregorian';
                }
                this._calendarIds.push(calendarId);
            }, this);
        }
        return this._calendarIds;
    },

    get numberSystemIds() {
        if (!this._numberSystemIds) {
            this._numberSystemIds = [];
            xpath.select('/ldmlBCP47/keyword/key[@name="nu"]/type', this.getDocument(Path.resolve(this.cldrPath, 'common', 'bcp47', 'number.xml'))).forEach(function (keyNode) {
                this._numberSystemIds.push(keyNode.getAttribute('name'));
            }, this);
        }
        return this._numberSystemIds;
    },

    // Works both async and sync (omit cb):
    getDocument: function (fileName, cb) {
        var that = this;
        if (that.documentByFileName[fileName]) {
            if (cb) {
                process.nextTick(function () {
                    cb(null, that.documentByFileName[fileName]);
                });
            } else {
                return that.documentByFileName[fileName];
            }
        } else {
            if (cb) {
                // Make sure not to load file more than once if it's being loaded when getDocument is called for the second time:
                that.memoizerByFileName[fileName] = that.memoizerByFileName[fileName] || memoizeAsync(function (cb) {
                    fs.readFile(fileName, 'utf-8', passError(cb, function (xmlString) {
                        var document = new dom().parseFromString(xmlString);
                        that.documentByFileName[fileName] = document;
                        cb(null, document);
                    }));
                });
                that.memoizerByFileName[fileName](cb);
            } else {
                return that.documentByFileName[fileName] = new dom().parseFromString(fs.readFileSync(fileName, 'utf-8'));
            }
        }
    },

    getPrioritizedDocumentsForLocale: function (localeId, type) {
        var that = this;
        return expandLocaleIdToPrioritizedList(localeId).concat('root').map(function (subLocaleId) {
            return that.fileNamesByTypeAndNormalizedLocaleId[type][normalizeLocaleId(subLocaleId)];
        }).filter(function (fileName) {
            return !!fileName;
        }).map(function (fileName) {
            return that.getDocument(fileName);
        });
    },

    preload: function (localeIds, cb) {
        var that = this;
        if (typeof localeIds === 'function') {
            cb = localeIds;
            localeIds = that.localeIds;
        }
        localeIds = (Array.isArray(localeIds) ? localeIds : [localeIds]).map(normalizeLocaleId);
        var neededLocaleById = {root: true};
        localeIds.forEach(function (localeId) {
            expandLocaleIdToPrioritizedList(localeId).forEach(function (subLocaleId) {
                neededLocaleById[subLocaleId] = true;
            });
        });
        var fileNames = [
            Path.resolve(that.cldrPath, 'common', 'supplemental', 'plurals.xml'),
            Path.resolve(that.cldrPath, 'common', 'supplemental', 'numberingSystems.xml')
        ];
        Object.keys(neededLocaleById).forEach(function (localeId) {
            ['main', 'rbnf'].forEach(function (type) {
                var fileName = that.fileNamesByTypeAndNormalizedLocaleId[type][localeId];
                if (fileName) {
                    fileNames.push(fileName);
                }
            });
        });
        seq(fileNames)
            .parEach(20, function (fileName) {
                that.getDocument(fileName, this);
            })
            .seq(function () {
                cb();
            })
            .catch(cb);
    },

    createFinder: function (prioritizedDocuments) {
        return function finder(xpathQuery) {
            var prioritizedResults = [];
            prioritizedDocuments.forEach(function (document, i) {
                var resultsForLocaleDocument = xpath.select(xpathQuery, document);
                if (resultsForLocaleDocument.length === 0 && i === (prioritizedDocuments.length - 1)) {
                    // We're in root and there were no results, look for alias elements in path:
                    var queryFragments = xpathQuery.split('/'),
                        poppedQueryFragments = [];
                    while (queryFragments.length > 1) {
                        var aliasNodes = xpath.select(queryFragments.join('/') + '/alias', document);
                        if (aliasNodes.length > 0) {
                            var aliasSpecifiedQuery = normalizeXPathQuery(queryFragments.join('/') + '/' + aliasNodes[0].getAttribute('path') + '/' + poppedQueryFragments.join('/'));
                            Array.prototype.push.apply(prioritizedResults, finder(aliasSpecifiedQuery));
                            break;
                        }
                        poppedQueryFragments.unshift(queryFragments.pop());
                    }
                } else {
                    Array.prototype.push.apply(prioritizedResults, resultsForLocaleDocument);
                }
            });
            return prioritizedResults;
        };
    },

    extractLocaleDisplayPattern: function (localeId) {
        var finder = this.createFinder(this.getPrioritizedDocumentsForLocale(localeId, 'main')),
            localeDisplayPattern = {};
        finder("/ldml/localeDisplayNames/localeDisplayPattern/*").forEach(function (node) {
            localeDisplayPattern[node.nodeName] = node.textContent;
        });
        return localeDisplayPattern;
    },

    extractLanguageDisplayNames: function (localeId) {
        var finder = this.createFinder(this.getPrioritizedDocumentsForLocale(localeId, 'main')),
            languageDisplayNames = {};
        finder('/ldml/localeDisplayNames/languages/language').forEach(function (node) {
            var id = normalizeLocaleId(node.getAttribute('type'));
            languageDisplayNames[id] = languageDisplayNames[id] || node.textContent;
        });
        return languageDisplayNames;
    },

    extractTimeZoneDisplayNames: function (localeId) {
        var finder = this.createFinder(this.getPrioritizedDocumentsForLocale(localeId, 'main')),
            timeZoneDisplayNames = {};
        finder("/ldml/dates/timeZoneNames/zone").forEach(function (zoneNode) {
            var timeZoneId = zoneNode.getAttribute('type'),
                exemplarCityNodes = xpath.select("exemplarCity", zoneNode),
                tzNameLocale;
            if (exemplarCityNodes.length > 0) {
                tzNameLocale = exemplarCityNodes[0].textContent;
            } else {
                var genericDisplayNameNodes = xpath.select("long/generic", zoneNode);
                if (genericDisplayNameNodes.length > 0) {
                    tzNameLocale = genericDisplayNameNodes[0].textContent;
                } else {
                    var longDisplayNameNodes = xpath.select("long/standard", zoneNode);
                    if (longDisplayNameNodes.length > 0) {
                        tzNameLocale = longDisplayNameNodes[0].textContent;
                    }
                }
            }
            if (tzNameLocale) {
                timeZoneDisplayNames[timeZoneId] = timeZoneDisplayNames[timeZoneId] || tzNameLocale;
            }
        });
        return timeZoneDisplayNames;
    },

    extractTimeZoneFormats: function (localeId) {
        var finder = this.createFinder(this.getPrioritizedDocumentsForLocale(localeId, 'main')),
            timeZoneFormats = {};
        ['hourFormat', 'gmtFormat', 'gmtZeroFormat', 'regionFormat', 'fallbackFormat', 'fallbackRegionFormat'].forEach(function (tagName) {
            finder("/ldml/dates/timeZoneNames/" + tagName).forEach(function (node) {
                var formatName = node.nodeName.replace(/Format$/, ''),
                    value = node.textContent;
                if (formatName === 'hour') {
                    value = value.split(';');
                }
                timeZoneFormats[formatName] = timeZoneFormats[formatName] || value;
            });
        });
        finder("/ldml/dates/timeZoneNames/regionFormat[@type]").forEach(function (node) {
            var type = node.getAttribute('type');
            timeZoneFormats.regions = timeZoneFormats.regions || {};
            timeZoneFormats.regions[type] = timeZoneFormats.regions[type] || node.textContent;
        });
        return timeZoneFormats;
    },

    extractTerritoryDisplayNames: function (localeId) {
        var finder = this.createFinder(this.getPrioritizedDocumentsForLocale(localeId, 'main')),
            territoryDisplayNames = {};
        finder("/ldml/localeDisplayNames/territories/territory").forEach(function (territoryNode) {
            var territoryId = territoryNode.getAttribute('type');
            territoryDisplayNames[territoryId] = territoryDisplayNames[territoryId] || territoryNode.textContent;
        });
        return territoryDisplayNames;
    },

    extractCurrencyInfoById: function (localeId) {
        var finder = this.createFinder(this.getPrioritizedDocumentsForLocale(localeId, 'main')),
            currencyDisplayNameByCurrencyId = {},
            currencyDisplayNameByCurrencyIdAndCount = {},
            currencySymbolByCurrencyId = {};

        finder("/ldml/numbers/currencies/currency/displayName").forEach(function (displayNameNode) {
            var currencyId = displayNameNode.parentNode.getAttribute('type'),
                countAttribute = displayNameNode.getAttribute('count');
            if (countAttribute) {
                currencyDisplayNameByCurrencyIdAndCount[currencyId] = currencyDisplayNameByCurrencyIdAndCount[currencyId] || {};
                currencyDisplayNameByCurrencyIdAndCount[currencyId][countAttribute] = displayNameNode.textContent;
            } else {
                currencyDisplayNameByCurrencyId[currencyId] = currencyDisplayNameByCurrencyId[currencyId] || displayNameNode.textContent;
            }
        });

        finder("/ldml/numbers/currencies/currency/symbol").forEach(function (symbolNode) {
            var currencyId = symbolNode.parentNode.getAttribute('type');
            currencySymbolByCurrencyId[currencyId] = currencySymbolByCurrencyId[currencyId] || symbolNode.textContent;
        });

        var currencyInfoById = {};
        Object.keys(currencyDisplayNameByCurrencyId).forEach(function (currencyId) {
            currencyInfoById[currencyId] = _.extend({
                displayName: currencyDisplayNameByCurrencyId[currencyId],
                symbol: currencySymbolByCurrencyId[currencyId]
            }, currencyDisplayNameByCurrencyIdAndCount[currencyId]);
        });
        return currencyInfoById;
    },

    extractScriptDisplayNames: function (localeId) {
        var finder = this.createFinder(this.getPrioritizedDocumentsForLocale(localeId, 'main')),
            scriptDisplayNames = {};
        finder("/ldml/localeDisplayNames/scripts/script").forEach(function (scriptNode) {
            var id = scriptNode.getAttribute('type');
            scriptDisplayNames[id] = scriptDisplayNames[id] || scriptNode.textContent;
        });
        return scriptDisplayNames;
    },

    extractKeyTypes: function (localeId) {
        var finder = this.createFinder(this.getPrioritizedDocumentsForLocale(localeId, 'main')),
            keyTypes = {};
        finder('/ldml/localeDisplayNames/keys/key').forEach(function (keyNode) {
            var type = keyNode.getAttribute('type');
            keyTypes[type] = { displayName: keyNode.textContent };
        });
        finder('/ldml/localeDisplayNames/types/type').forEach(function (typeNode) {
            var key = typeNode.getAttribute('key'),
                type = normalizeProperty(typeNode.getAttribute('type'));
            keyTypes[key] = keyTypes[key] || {};
            keyTypes[key].types = keyTypes[key].types || {};
            keyTypes[key].types[type] = typeNode.textContent;
        });
        return keyTypes;
    },

    extractTransformNames: function (localeId) {
        var finder = this.createFinder(this.getPrioritizedDocumentsForLocale(localeId, 'main')),
            transformNames = {};
        finder("/ldml/localeDisplayNames/transformNames/transformName").forEach(function (transformNameNode) {
            var id = transformNameNode.getAttribute('type');
            transformNames[id] = transformNames[id] || transformNameNode.textContent;
        });
        return transformNames;
    },

    extractMeasurementSystemNames: function (localeId) {
        var finder = this.createFinder(this.getPrioritizedDocumentsForLocale(localeId, 'main')),
            measurementSystemNames = {};
        finder("/ldml/localeDisplayNames/measurementSystemNames/measurementSystemName").forEach(function (measurementSystemNameNode) {
            var id = measurementSystemNameNode.getAttribute('type');
            measurementSystemNames[id] = measurementSystemNames[id] || measurementSystemNameNode.textContent;
        });
        return measurementSystemNames;
    },

    extractCodePatterns: function (localeId) {
        var finder = this.createFinder(this.getPrioritizedDocumentsForLocale(localeId, 'main')),
            codePatterns = {};
        finder("/ldml/localeDisplayNames/codePatterns/codePattern").forEach(function (codePatternNode) {
            var id = codePatternNode.getAttribute('type');
            codePatterns[id] = codePatterns[id] || codePatternNode.textContent;
        });
        return codePatterns;
    },

    // Calendar extraction methods:

    extractEraNames: function (localeId, calendarId) {
        calendarId = calendarId || 'gregorian';
        var finder = this.createFinder(this.getPrioritizedDocumentsForLocale(localeId, 'main')),
            eraNames;
        ['eraNames', 'eraAbbr'].forEach(function (eraType) {
            var typeInOutput = {eraNames: 'wide', eraAbbr: 'abbreviated'}[eraType];
            finder("/ldml/dates/calendars/calendar[@type='" + calendarId + "']/eras/" + eraType + "/era").forEach(function (eraNode) {
                var type = parseInt(eraNode.getAttribute('type'), 10);
                eraNames = eraNames || {};
                eraNames[typeInOutput] = eraNames[typeInOutput] || {};
                eraNames[typeInOutput][type] = eraNames[typeInOutput][type] || eraNode.textContent;
            });
        });
        return convertObjectsWithIntegerKeysToArrays(eraNames);
    },

    extractQuarterNames: function (localeId, calendarId) {
        calendarId = calendarId || 'gregorian';
        var finder = this.createFinder(this.getPrioritizedDocumentsForLocale(localeId, 'main')),
            quarterNames;
        ['format', 'stand-alone'].forEach(function (quarterContext) {
            var quarterContextCamelCase = normalizeProperty(quarterContext); // stand-alone => standAlone
            ['abbreviated', 'narrow', 'wide'].forEach(function (quarterWidth) {
                finder("/ldml/dates/calendars/calendar[@type='" + calendarId + "']/quarters/quarterContext[@type='" + quarterContext + "']/quarterWidth[@type='" + quarterWidth + "']/quarter").forEach(function (quarterNode) {
                    var quarterNo = parseInt(quarterNode.getAttribute('type'), 10) - 1;

                    quarterNames = quarterNames || {};
                    quarterNames[quarterContextCamelCase] = quarterNames[quarterContextCamelCase] || {};
                    quarterNames[quarterContextCamelCase][quarterWidth] = quarterNames[quarterContextCamelCase][quarterWidth] || {};
                    quarterNames[quarterContextCamelCase][quarterWidth][quarterNo] = quarterNames[quarterContextCamelCase][quarterWidth][quarterNo] || quarterNode.textContent;
                });
            });
        });
        return convertObjectsWithIntegerKeysToArrays(quarterNames);
    },

    extractDayPeriods: function (localeId, calendarId) {
        calendarId = calendarId || 'gregorian';
        var finder = this.createFinder(this.getPrioritizedDocumentsForLocale(localeId, 'main')),
            dayPeriods;
        ['format', 'stand-alone'].forEach(function (dayPeriodContext) {
            var dayPeriodContextCamelCase = normalizeProperty(dayPeriodContext); // stand-alone => standAlone
            ['abbreviated', 'narrow', 'wide', 'short'].forEach(function (dayPeriodWidth) {
                finder("/ldml/dates/calendars/calendar[@type='" + calendarId + "']/dayPeriods/dayPeriodContext[@type='" + dayPeriodContext + "']/dayPeriodWidth[@type='" + dayPeriodWidth + "']/dayPeriod").forEach(function (dayPeriodNode) {
                    var type = dayPeriodNode.getAttribute('type');

                    dayPeriods = dayPeriods || {};
                    dayPeriods[dayPeriodContextCamelCase] = dayPeriods[dayPeriodContextCamelCase] || {};
                    dayPeriods[dayPeriodContextCamelCase][dayPeriodWidth] =
                        dayPeriods[dayPeriodContextCamelCase][dayPeriodWidth] || {};
                    dayPeriods[dayPeriodContextCamelCase][dayPeriodWidth][type] =
                        dayPeriods[dayPeriodContextCamelCase][dayPeriodWidth][type] || dayPeriodNode.textContent;
                });
            });
        });
        return dayPeriods;
    },

    extractCyclicNames: function (localeId, calendarId) {
        calendarId = calendarId || 'gregorian';
        var finder = this.createFinder(this.getPrioritizedDocumentsForLocale(localeId, 'main')),
            cyclicNames;
        ['dayParts', 'days', 'months', 'years', 'zodiacs'].forEach(function (cyclicNameSet) {
            ['format'].forEach(function (cyclicNameContext) {
                ['abbreviated', 'narrow', 'wide'].forEach(function (cyclicNameWidth) {
                    finder("/ldml/dates/calendars/calendar[@type='" + calendarId + "']/cyclicNameSets/cyclicNameSet[@type='" + cyclicNameSet + "']/cyclicNameContext[@type='" + cyclicNameContext + "']/cyclicNameWidth[@type='" + cyclicNameWidth + "']/cyclicName").forEach(function (cyclicNameNode) {
                        var type = cyclicNameNode.getAttribute('type');
                        cyclicNames = cyclicNames || {};
                        cyclicNames[cyclicNameSet] = cyclicNames[cyclicNameSet] || {};
                        cyclicNames[cyclicNameSet][cyclicNameContext] = cyclicNames[cyclicNameSet][cyclicNameContext] || {};
                        cyclicNames[cyclicNameSet][cyclicNameContext][cyclicNameWidth] = cyclicNames[cyclicNameSet][cyclicNameContext][cyclicNameWidth] || {};
                        cyclicNames[cyclicNameSet][cyclicNameContext][cyclicNameWidth][type] = cyclicNames[cyclicNameSet][cyclicNameContext][cyclicNameWidth][type] || cyclicNameNode.textContent;
                    });
                });
            });
        });
        return convertObjectsWithIntegerKeysToArrays(cyclicNames);
    },

    extractMonthNames: function (localeId, calendarId) {
        calendarId = calendarId || 'gregorian';
        var finder = this.createFinder(this.getPrioritizedDocumentsForLocale(localeId, 'main')),
            monthNames;
        ['format', 'stand-alone'].forEach(function (monthContext) {
            var monthContextCamelCase = normalizeProperty(monthContext); // stand-alone => standAlone
            ['abbreviated', 'narrow', 'wide'].forEach(function (monthWidth) {
                finder("/ldml/dates/calendars/calendar[@type='" + calendarId + "']/months/monthContext[@type='" + monthContext + "']/monthWidth[@type='" + monthWidth + "']/month").forEach(function (monthNode) {
                    var monthNo = parseInt(monthNode.getAttribute('type'), 10) - 1;
                    monthNames = monthNames || {};
                    monthNames[monthContextCamelCase] = monthNames[monthContextCamelCase] || {};
                    monthNames[monthContextCamelCase][monthWidth] = monthNames[monthContextCamelCase][monthWidth] || {};
                    monthNames[monthContextCamelCase][monthWidth][monthNo] =
                        monthNames[monthContextCamelCase][monthWidth][monthNo] || monthNode.textContent;
                });
            });
        });
        return convertObjectsWithIntegerKeysToArrays(monthNames);
    },

    extractMonthPatterns: function (localeId, calendarId) {
        calendarId = calendarId || 'gregorian';
        var finder = this.createFinder(this.getPrioritizedDocumentsForLocale(localeId, 'main')),
            monthPatterns;
        ['format', 'numeric', 'stand-alone'].forEach(function (monthPatternContext) {
            var monthPatternContextCamelCase = normalizeProperty(monthPatternContext); // stand-alone => standAlone
            ['abbreviated', 'narrow', 'wide', 'all'].forEach(function (monthPatternWidth) {
                finder("/ldml/dates/calendars/calendar[@type='" + calendarId + "']/monthPatterns/monthPatternContext[@type='" + monthPatternContext + "']/monthPatternWidth[@type='" + monthPatternWidth + "']/monthPattern").forEach(function (monthPatternNode) {
                    var type = monthPatternNode.getAttribute('type');
                    monthPatterns = monthPatterns || {};
                    monthPatterns[monthPatternContextCamelCase] = monthPatterns[monthPatternContextCamelCase] || {};
                    monthPatterns[monthPatternContextCamelCase][monthPatternWidth] =
                        monthPatterns[monthPatternContextCamelCase][monthPatternWidth] || {};
                    monthPatterns[monthPatternContextCamelCase][monthPatternWidth][type] =
                        monthPatterns[monthPatternContextCamelCase][monthPatternWidth][type] || monthPatternNode.textContent;
                });
            });
        });
        return monthPatterns;
    },

    extractDayNames: function (localeId, calendarId) {
        calendarId = calendarId || 'gregorian';
        var finder = this.createFinder(this.getPrioritizedDocumentsForLocale(localeId, 'main')),
            dayNoByCldrId = {sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6},
            dayNames;
        ['format', 'numeric', 'stand-alone'].forEach(function (dayContext) {
            var dayContextCamelCase = normalizeProperty(dayContext); // stand-alone => standAlone
            ['abbreviated', 'narrow', 'wide', 'short'].forEach(function (dayWidth) {
                finder("/ldml/dates/calendars/calendar[@type='" + calendarId + "']/days/dayContext[@type='" + dayContext + "']/dayWidth[@type='" + dayWidth + "']/day").forEach(function (dayNode) {
                    var dayNo = dayNoByCldrId[dayNode.getAttribute('type')];
                    dayNames = dayNames || {};
                    dayNames[dayContextCamelCase] = dayNames[dayContextCamelCase] || {};
                    dayNames[dayContextCamelCase][dayWidth] = dayNames[dayContextCamelCase][dayWidth] || {};
                    dayNames[dayContextCamelCase][dayWidth][dayNo] = dayNames[dayContextCamelCase][dayWidth][dayNo] || dayNode.textContent;
                });
            });
        });
        return convertObjectsWithIntegerKeysToArrays(dayNames);
    },

    extractFields: function (localeId) {
        var finder = this.createFinder(this.getPrioritizedDocumentsForLocale(localeId, 'main')),
            fields;
        finder("/ldml/dates/fields/field/displayName").forEach(function (fieldDisplayNameNode) {
            var fieldName = fieldDisplayNameNode.parentNode.getAttribute('type');
            fields = fields || {};
            fields[fieldName] = fields[fieldName] || {};
            fields[fieldName].displayName = fields[fieldName].displayName || fieldDisplayNameNode.textContent;
        });

        finder("/ldml/dates/fields/field/relative").forEach(function (fieldRelativeNode) {
            var fieldName = fieldRelativeNode.parentNode.getAttribute('type'),
                type = fieldRelativeNode.getAttribute('type');
            fields = fields || {};
            fields[fieldName] = fields[fieldName] || {};
            fields[fieldName].relative = fields[fieldName].relative || {};
            fields[fieldName].relative[type] = fields[fieldName].relative[type] || fieldRelativeNode.textContent;
        });

        finder("/ldml/dates/fields/field/relativeTime/relativeTimePattern").forEach(function (relativeTimePatternNode) {
            var relativeTimeNode = relativeTimePatternNode.parentNode,
                fieldName = relativeTimeNode.parentNode.getAttribute('type'),
                type = relativeTimeNode.getAttribute('type'),
                count = relativeTimePatternNode.getAttribute('count');
            fields = fields || {};
            fields[fieldName] = fields[fieldName] || {};
            fields[fieldName].relativeTime = fields[fieldName].relativeTime || {};
            fields[fieldName].relativeTime[type] = fields[fieldName].relativeTime[type] || {};
            fields[fieldName].relativeTime[type][count] = fields[fieldName].relativeTime[type][count] || relativeTimePatternNode.textContent
        });
        return fields;
    },

    extractDateTimePatterns: function (localeId, calendarId) {
        calendarId = calendarId || 'gregorian';
        var finder = this.createFinder(this.getPrioritizedDocumentsForLocale(localeId, 'main')),
            dateTimePatterns;
        finder("/ldml/dates/calendars/calendar[@type='" + calendarId + "']/dateTimeFormats/dateTimeFormatLength/dateTimeFormat").forEach(function (dateTimeFormatNode) {
            var dateTimeFormatLengthType = dateTimeFormatNode.parentNode.getAttribute('type'),
                patternNodes = xpath.select("pattern", dateTimeFormatNode);
            if (patternNodes.length !== 1) {
                throw new Error('Expected exactly one pattern in dateTimeFormatNode');
            }
            dateTimePatterns = dateTimePatterns || {};
            dateTimePatterns[dateTimeFormatLengthType] = dateTimePatterns[dateTimeFormatLengthType] || patternNodes[0].textContent;
        });
        return dateTimePatterns;
    },

    extractDateOrTimeFormats: function (localeId, calendarId, dateOrTime) {
        calendarId = calendarId || 'gregorian';
        var finder = this.createFinder(this.getPrioritizedDocumentsForLocale(localeId, 'main')),
            formats;
        finder("/ldml/dates/calendars/calendar[@type='" + calendarId + "']/" + dateOrTime + "Formats/" + dateOrTime + "FormatLength/" + dateOrTime + "Format/*").forEach(function (patternNode) {
            var type = patternNode.parentNode.parentNode.getAttribute('type');
            formats = formats || {};
            formats[type] = formats[type] || patternNode.textContent;
        });
        return formats;
    },

    extractDateFormats: function (localeId, calendarId) {
        return this.extractDateOrTimeFormats(localeId, calendarId, 'date');
    },

    extractTimeFormats: function (localeId, calendarId) {
        return this.extractDateOrTimeFormats(localeId, calendarId, 'time');
    },

    extractDateFormatItems: function (localeId, calendarId) {
        calendarId = calendarId || 'gregorian';
        var finder = this.createFinder(this.getPrioritizedDocumentsForLocale(localeId, 'main')),
            dateFormatItems;
        finder("/ldml/dates/calendars/calendar[@type='" + calendarId + "']/dateTimeFormats/availableFormats/dateFormatItem").forEach(function (dateFormatItemNode) {
            var id = dateFormatItemNode.getAttribute('id');
            dateFormatItems = dateFormatItems || {};
            dateFormatItems[id] = dateFormatItems[id] || dateFormatItemNode.textContent;
        });
        return dateFormatItems;
    },

    extractDateIntervalFormats: function (localeId, calendarId) {
        calendarId = calendarId || 'gregorian';
        var finder = this.createFinder(this.getPrioritizedDocumentsForLocale(localeId, 'main')),
            dateIntervalFormats;
        finder("/ldml/dates/calendars/calendar[@type='" + calendarId + "']/dateTimeFormats/intervalFormats/intervalFormatItem").forEach(function (intervalFormatItemNode) {
            var dateIntervalFormat = {};
            for (var i = 0 ; i < intervalFormatItemNode.childNodes.length ; i += 1) {
                var greatestDifferenceNode = intervalFormatItemNode.childNodes[i];
                if (greatestDifferenceNode.nodeType !== 1) {
                    // Skip whitespace node
                    continue;
                }
                var greatestDifferenceIdAttribute = greatestDifferenceNode.getAttribute('id');
                var greatestDifferenceId = greatestDifferenceIdAttribute;
                dateIntervalFormat[greatestDifferenceId] = dateIntervalFormat[greatestDifferenceId] || greatestDifferenceNode.textContent;
            }
            var id = intervalFormatItemNode.getAttribute('id');
            dateIntervalFormats = dateIntervalFormats || {};
            dateIntervalFormats[id] = dateIntervalFormats[id] || dateIntervalFormat;
        });
        return dateIntervalFormats;
    },

    extractDateIntervalFallbackFormat: function (localeId, calendarId) {
        calendarId = calendarId || 'gregorian';
        var finder = this.createFinder(this.getPrioritizedDocumentsForLocale(localeId, 'main')),
            dateIntervalFallbackFormat;
        finder("/ldml/dates/calendars/calendar[@type='" + calendarId + "']/dateTimeFormats/intervalFormats/intervalFormatFallback").forEach(function (intervalFormatFallbackNode) {
            dateIntervalFallbackFormat = dateIntervalFallbackFormat || intervalFormatFallbackNode.textContent;
        });
        return dateIntervalFallbackFormat;
    },

    // Number extraction code:

    extractNumberSymbols: function (localeId, numberSystemId) {
        numberSystemId = numberSystemId || 'latn';
        var finder = this.createFinder(this.getPrioritizedDocumentsForLocale(localeId, 'main')),
            numberSymbols;
        finder("/ldml/numbers/symbols[@numberSystem = '" + numberSystemId + "']/*[name() != 'alias']").concat(finder("/ldml/numbers/symbols/*[name() != 'alias']")).forEach(function (numberSymbolNode) {
            var symbolId = numberSymbolNode.nodeName;
            numberSymbols = numberSymbols || {};
            numberSymbols[symbolId] = numberSymbols[symbolId] || numberSymbolNode.textContent;
        });
        return numberSymbols;
    },

    extractNumberFormats: function (localeId, numberSystemId) {
        numberSystemId = numberSystemId || 'latn';
        var finder = this.createFinder(this.getPrioritizedDocumentsForLocale(localeId, 'main')),
            numberFormats;
        ['scientific', 'decimal', 'currency', 'percent'].forEach(function (formatType) {
            ['full', 'long', 'medium', 'short'].forEach(function (length) {
                finder("/ldml/numbers/" + formatType + "Formats[@numberSystem = '" + numberSystemId + "']/" + formatType + "FormatLength[@type='" + length + "']/" + formatType + "Format/pattern").forEach(function (patternNode) {
                    var type = patternNode.getAttribute('type'),
                        count = patternNode.getAttribute('count');
                    numberFormats = numberFormats || {};
                    numberFormats[formatType] = numberFormats[formatType] || {};
                    numberFormats[formatType][length] = numberFormats[formatType][length] || {};
                    numberFormats[formatType][length][type] = numberFormats[formatType][length][type] || {};
                    numberFormats[formatType][length][type][count] = numberFormats[formatType][length][type][count] || patternNode.textContent;
                });
            });
            finder("/ldml/numbers/" + formatType + "Formats[@numberSystem = '" + numberSystemId + "']/" + formatType + "FormatLength[not(@type)]/" + formatType + "Format/pattern").forEach(function (patternNode) {
                numberFormats = numberFormats || {};
                numberFormats[formatType] = numberFormats[formatType] || {};
                numberFormats[formatType].default = numberFormats[formatType].default || patternNode.textContent;
            });
            finder("/ldml/numbers/" + formatType + "Formats[@numberSystem = '" + numberSystemId + "']/unitPattern").forEach(function (unitPatternNode) {
                var count = unitPatternNode.getAttribute('count');
                numberFormats = numberFormats || {};
                numberFormats[formatType] = numberFormats[formatType] || {};
                numberFormats[formatType][count] = numberFormats[formatType][count] || unitPatternNode.textContent;
            });
        });

        finder("/ldml/numbers/currencyFormats[@numberSystem = '" + numberSystemId + "']/currencySpacing").forEach(function (currencySpacingNode) {
            numberFormats = numberFormats || {};
            numberFormats.currency = numberFormats.currency || {};
            numberFormats.currency.currencySpacing = numberFormats.currency.currencySpacing || {};

            ['before', 'after'].forEach(function (place) {
                var placeData = numberFormats.currency.currencySpacing[place + 'Currency'] = numberFormats.currency.currencySpacing[place + 'Currency'] || {};

                ['currencyMatch', 'surroundingMatch', 'insertBetween'].forEach(function (spacingPropertyName) {
                    var match = xpath.select(place + "Currency/" + spacingPropertyName, currencySpacingNode);
                    if (match.length > 0) {
                        numberFormats.currency.currencySpacing[place + 'Currency'][spacingPropertyName] = match[0].textContent;
                    }
                });

                ['currencyMatch', 'surroundingMatch'].forEach(function (spacingPropertyName) {
                    if (placeData[spacingPropertyName]) {
                        placeData[spacingPropertyName] = unicoderegexp.expandCldrUnicodeSetIdToCharacterClass(placeData[spacingPropertyName]);
                    }
                });
            });
        });

        return numberFormats;
    },

    extractDefaultNumberSystemId: function (localeId) {
        var finder = this.createFinder(this.getPrioritizedDocumentsForLocale(localeId, 'main')),
            defaultNumberSystemId;
        finder('/ldml/numbers/defaultNumberingSystem').forEach(function (defaultNumberingSystemNode) {
            defaultNumberSystemId = defaultNumberSystemId || defaultNumberingSystemNode.textContent;
        });
        return defaultNumberSystemId;
    },

    extractUnitPatterns: function (localeId) {
        var finder = this.createFinder(this.getPrioritizedDocumentsForLocale(localeId, 'main')),
            unitPatterns = {};
        finder("/ldml/units/unitLength/unit/unitPattern").forEach(function (unitPatternNode) {
            var unitNode = unitPatternNode.parentNode,
                unitLength = unitNode.parentNode.getAttribute('type'),
                unitId = normalizeProperty(unitNode.getAttribute('type'));
            unitPatterns[unitLength] = unitPatterns[unitLength] || {};
            unitPatterns[unitLength].unit = unitPatterns[unitLength].unit || {};
            unitPatterns[unitLength].unit[unitId] = unitPatterns[unitLength].unit[unitId] || {};
            var count = unitPatternNode.getAttribute('count');
            unitPatterns[unitLength].unit[unitId][count] = unitPatterns[unitLength].unit[unitId][count] || unitPatternNode.textContent;
        });
        finder("/ldml/units/unitLength/compoundUnit/compoundUnitPattern").forEach(function (compoundUnitPatternNode) {
            var compoundUnitNode = compoundUnitPatternNode.parentNode,
                unitLength = compoundUnitNode.parentNode.getAttribute('type'),
                compoundUnitId = compoundUnitNode.getAttribute('type');

            unitPatterns[unitLength].compoundUnit = unitPatterns[unitLength].compoundUnit || {};
            unitPatterns[unitLength].compoundUnit[compoundUnitId] = compoundUnitPatternNode.textContent;
        });
        return unitPatterns;
    },

    extractDelimiters: function (localeId) {
        var finder = this.createFinder(this.getPrioritizedDocumentsForLocale(localeId, 'main')),
            delimiters = {};
        finder("/ldml/delimiters/*").forEach(function (delimiterNode) {
            var type = delimiterNode.nodeName;
            delimiters[type] = delimiters[type] || delimiterNode.textContent;
        });
        return delimiters;
    },

    extractListPatterns: function (localeId) {
        var finder = this.createFinder(this.getPrioritizedDocumentsForLocale(localeId, 'main')),
            listPatterns = {};
        finder("/ldml/listPatterns/listPattern/listPatternPart").forEach(function (listPatternPartNode) {
            var listPatternTypeAttribute = listPatternPartNode.parentNode.getAttribute('type'),
                type = listPatternTypeAttribute ? normalizeProperty(listPatternTypeAttribute) : 'default',
                part = listPatternPartNode.getAttribute('type');
            listPatterns[type] = listPatterns[type] || {};
            listPatterns[type][part] = listPatterns[type][part] || listPatternPartNode.textContent;
        });
        return listPatterns;
    },

    extractCharacters: function (localeId) {
        var finder = this.createFinder(this.getPrioritizedDocumentsForLocale(localeId, 'main')),
            characters = {
                exemplar: {},
                ellipsis: {}
            };
        finder("/ldml/characters/exemplarCharacters").forEach(function (exemplarCharactersNode) {
            var typeAttr = exemplarCharactersNode.getAttribute('type'),
                type = typeAttr || 'default';
            characters.exemplar[type] = characters.exemplar[type] || exemplarCharactersNode.textContent.replace(/^\[|\]$/g, '').split(" ");
        });
        finder("/ldml/characters/ellipsis").forEach(function (ellipsisNode) {
            var type = ellipsisNode.getAttribute('type');
            characters.ellipsis[type] = characters.ellipsis[type] || ellipsisNode.textContent;
        });
        finder("/ldml/characters/moreInformation").forEach(function (moreInformationNode) {
            characters.moreInformation = characters.moreInformation || moreInformationNode.textContent;
        });
        return characters;
    },

    extractPluralRuleFunction: function (localeId) {
        var that = this,
            document = that.getDocument(Path.resolve(that.cldrPath, 'common', 'supplemental', 'plurals.xml')),
            subLocaleIds = expandLocaleIdToPrioritizedList(localeId),
            statementAsts = [];
        for (var i = 0 ; i < subLocaleIds.length ; i += 1) {
            var subLocaleId = subLocaleIds[i],
                matchLocalesXPathExpr =
                    "@locales = '" + subLocaleId + "' or " +
                    "starts-with(@locales, '" + subLocaleId + "') or " +
                    "contains(@locales, ' " + subLocaleId + " ') or " +
                    "substring(@locales, string-length(@locales) - string-length(' " + subLocaleId + "') + 1) = ' " + subLocaleId + "'",
                pluralRulesNodes = xpath.select("/supplementalData/plurals/pluralRules[" + matchLocalesXPathExpr + "]", document),
                cldrPluralRuleSet = new CldrPluralRuleSet();
            if (pluralRulesNodes.length > 0) {
                xpath.select("pluralRule", pluralRulesNodes[0]).forEach(function (pluralRuleNode) {
                    cldrPluralRuleSet.addRule(pluralRuleNode.textContent, pluralRuleNode.getAttribute('count'));
                });
                statementAsts = cldrPluralRuleSet.toJavaScriptFunctionBodyAst();
                break;
            }
        }
        return new Function("n", uglifyJs.uglify.gen_code(['toplevel', statementAsts]));
    },

    // 'types' is optional, defaults to all available
    extractRbnfFunctionByType: function (localeId, types) {
        var finder = this.createFinder(this.getPrioritizedDocumentsForLocale(localeId, 'rbnf')),
            cldrRbnfRuleSetByType = {};
        finder('/ldml/rbnf/rulesetGrouping/ruleset/rbnfrule').forEach(function (rbnfRuleNode) {
            var type = CldrRbnfRuleSet.getSafeRendererName(rbnfRuleNode.parentNode.getAttribute('type')),
                value = rbnfRuleNode.getAttribute('value');
            cldrRbnfRuleSetByType[type] = cldrRbnfRuleSetByType[type] || new CldrRbnfRuleSet({type: type});
            if (!cldrRbnfRuleSetByType[type].ruleByValue[value]) {
                var radixAttribute = rbnfRuleNode.getAttribute('radix');
                cldrRbnfRuleSetByType[type].ruleByValue[value] = {
                    value: value,
                    rbnf: rbnfRuleNode.textContent.replace(/;$/, '').replace(/←/g, '<').replace(/→/g, '>'),
                    radix: radixAttribute
                };
            }
        });
        var isAddedByType = {},
            typesToAdd = types ? [].concat(types) : Object.keys(cldrRbnfRuleSetByType),
            rbnfFunctionByType = {
                renderNumber: String // Provide a (bad) default number rendering implementation to avoid #13
            };
        while (typesToAdd.length > 0) {
            var type = typesToAdd.shift();
            if (!(type in isAddedByType)) {
                isAddedByType[type] = true;
                var cldrRbnfRuleSet = cldrRbnfRuleSetByType[type];
                // Some rules aren't available in some locales (such as spellout-cardinal-financial).
                // The easiest thing is just to skip the missing ones here, even though it can produce
                // some broken function sets:
                if (cldrRbnfRuleSet) {
                    var result = cldrRbnfRuleSet.toFunctionAst();

                    rbnfFunctionByType[type] = new Function("n", uglifyJs.uglify.gen_code(['toplevel', result.functionAst[3]]));
                    Array.prototype.push.apply(typesToAdd, result.dependencies);
                }
            }
        }
        return rbnfFunctionByType;
    },

    extractDigitsByNumberSystemId: function () {
        var document = this.getDocument(Path.resolve(this.cldrPath, 'common', 'supplemental', 'numberingSystems.xml')),
            digitsByNumberSystemId = {};

        xpath.select('/supplementalData/numberingSystems/numberingSystem', document).forEach(function (numberingSystemNode) {
            var numberSystemId = numberingSystemNode.getAttribute('id');
            if (numberingSystemNode.getAttribute('type') === 'numeric') {
                digitsByNumberSystemId[numberSystemId] = numberingSystemNode.getAttribute('digits').split(/(?:)/);
            } else {
                // type='algorithmic'
                var rulesAttributeFragments = numberingSystemNode.getAttribute('rules').split('/'),
                    sourceLocaleId = rulesAttributeFragments.length === 3 ? normalizeLocaleId(rulesAttributeFragments[0]) : 'root',
                    ruleType = CldrRbnfRuleSet.getSafeRendererName(rulesAttributeFragments[rulesAttributeFragments.length - 1]);
                digitsByNumberSystemId[numberSystemId] = ruleType; // A string value means "use this rbnf renderer for the digits"
            }
        }, this);
        return digitsByNumberSystemId;
    },

    extractLayout: function (localeId) {
        var finder = this.createFinder(this.getPrioritizedDocumentsForLocale(localeId, 'main')),
            layout = {};
        finder("/ldml/layout/*/*").forEach(function (leafNode) {
            var type = leafNode.nodeName,
                parentType = leafNode.parentNode.nodeName;
            layout[parentType] = layout[parentType] || {};
            layout[parentType][type] = layout[parentType][type] || leafNode.textContent;
        });
        return layout;
    }
};

module.exports = new Cldr(Path.resolve(__dirname, '../3rdparty/cldr/'));
module.exports.load = function (cldrPath) {
    return new Cldr(cldrPath);
};

}).call(this,require('_process'),"/node_modules/cldr/lib")

},{"./CldrPluralRuleSet":"/Users/Jacob/workspace/scheduler/front-end/node_modules/cldr/lib/CldrPluralRuleSet.js","./CldrRbnfRuleSet":"/Users/Jacob/workspace/scheduler/front-end/node_modules/cldr/lib/CldrRbnfRuleSet.js","./convertObjectsWithIntegerKeysToArrays":"/Users/Jacob/workspace/scheduler/front-end/node_modules/cldr/lib/convertObjectsWithIntegerKeysToArrays.js","./memoizeAsync":"/Users/Jacob/workspace/scheduler/front-end/node_modules/cldr/lib/memoizeAsync.js","./normalizeLocaleId":"/Users/Jacob/workspace/scheduler/front-end/node_modules/cldr/lib/normalizeLocaleId.js","./normalizeProperty":"/Users/Jacob/workspace/scheduler/front-end/node_modules/cldr/lib/normalizeProperty.js","_process":"/Users/Jacob/workspace/scheduler/front-end/node_modules/browserify/node_modules/process/browser.js","fs":"/Users/Jacob/workspace/scheduler/front-end/node_modules/browserify/lib/_empty.js","passerror":"/Users/Jacob/workspace/scheduler/front-end/node_modules/cldr/node_modules/passerror/lib/index.js","path":"/Users/Jacob/workspace/scheduler/front-end/node_modules/browserify/node_modules/path-browserify/index.js","seq":"/Users/Jacob/workspace/scheduler/front-end/node_modules/cldr/node_modules/seq/index.js","uglify-js":"/Users/Jacob/workspace/scheduler/front-end/node_modules/cldr/node_modules/uglify-js/uglify-js.js","underscore":"/Users/Jacob/workspace/scheduler/front-end/node_modules/cldr/node_modules/underscore/underscore.js","unicoderegexp":"/Users/Jacob/workspace/scheduler/front-end/node_modules/cldr/node_modules/unicoderegexp/lib/unicodeRegExp.js","xmldom":"/Users/Jacob/workspace/scheduler/front-end/node_modules/cldr/node_modules/xmldom/dom-parser.js","xpath":"/Users/Jacob/workspace/scheduler/front-end/node_modules/cldr/node_modules/xpath/xpath.js"}],"/Users/Jacob/workspace/scheduler/front-end/node_modules/cldr/lib/cldrPluralRuleTermFunctionByName.js":[function(require,module,exports){
exports.i = function i(n) {
    return Math.floor(Math.abs(n));
};

exports.v = function v(n) {
    return n.toString().replace(/^[^.]*\.?/, '').length;
};

exports.w = function w(n) {
    return n.toString().replace(/^[^.]*\.?|0+$/g, '').length;
};

exports.f = function f(n) {
    return parseInt(n.toString().replace(/^[^.]*\.?/, ''), 10) || 0;
};

exports.t = function t(n) {
    return parseInt(n.toString().replace(/^[^.]*\.?|0+$/g, ''), 10) || 0;
};

},{}],"/Users/Jacob/workspace/scheduler/front-end/node_modules/cldr/lib/convertObjectsWithIntegerKeysToArrays.js":[function(require,module,exports){
// Convert objects with all integer keys starting from 0 to arrays and remove undefined values:
module.exports = function convertObjectsWithIntegerKeysToArrays(obj) {
    if (Array.isArray(obj)) {
        return obj.map(convertObjectsWithIntegerKeysToArrays);
    } else if (typeof obj === 'object' && obj !== null) {
        var keys = Object.keys(obj);
        if (0 in obj || 1 in obj) {
            var firstNumericKeyNumber = 0 in obj ? 0 : 1,
                nextNumericKeyNumber = firstNumericKeyNumber + 1;
            while (nextNumericKeyNumber in obj) {
                nextNumericKeyNumber += 1;
            }
            if (keys.length > 0 && nextNumericKeyNumber === keys.length + firstNumericKeyNumber) {
                var array = [],
                    i;
                for (i = 0 ; i < firstNumericKeyNumber ; i += 1) {
                    array.push(undefined);
                }
                for (i = firstNumericKeyNumber ; i < keys.length ; i += 1) {
                    array.push(convertObjectsWithIntegerKeysToArrays(obj[i]));
                }
                return array;
            }
        }
        var resultObj = {};
        keys.forEach(function (key) {
            if (typeof obj[key] !== 'undefined') {
                resultObj[key] = convertObjectsWithIntegerKeysToArrays(obj[key]);
            }
        });
        return resultObj;
    } else {
        return obj;
    }
};

},{}],"/Users/Jacob/workspace/scheduler/front-end/node_modules/cldr/lib/memoizeAsync.js":[function(require,module,exports){
(function (process){
// Create a memoizer for an async function
module.exports = function memoizeAsync(fn) {
    var resultArguments,
        waitingCallbacks;
    return function (cb) {
        var that = this;
        if (resultArguments) {
            process.nextTick(function () {
                cb.apply(this, resultArguments);
            });
        } else {
            if (waitingCallbacks) {
                waitingCallbacks.push(cb);
            } else {
                waitingCallbacks = [cb];
                fn(function () { // ...
                    var resultArguments = arguments;
                    waitingCallbacks.forEach(function (waitingCallback) {
                        waitingCallback.apply(this, resultArguments);
                    });
                    waitingCallbacks = null;
                });
            }
        }
    };
};

}).call(this,require('_process'))

},{"_process":"/Users/Jacob/workspace/scheduler/front-end/node_modules/browserify/node_modules/process/browser.js"}],"/Users/Jacob/workspace/scheduler/front-end/node_modules/cldr/lib/normalizeLocaleId.js":[function(require,module,exports){
/*
 * Replace - with _ and convert to lower case: en-GB => en_gb
 */
module.exports = function normalizeLocaleId(localeId) {
    return localeId && localeId.replace(/-/g, '_').toLowerCase();
};

},{}],"/Users/Jacob/workspace/scheduler/front-end/node_modules/cldr/lib/normalizeProperty.js":[function(require,module,exports){
/*
 * Convert foo-bar attribute values to fooBar JavaScript keys
 */
module.exports = function normalizeProperty(str) {
	return str.replace(/-([a-z])/g, function ($0, ch) {
        return ch.toUpperCase();
    });
};

},{}],"/Users/Jacob/workspace/scheduler/front-end/node_modules/cldr/node_modules/passerror/lib/index.js":[function(require,module,exports){
module.exports = function passError(errorCallback, successCallback) {
    return function (err) { // ...
        if (err) {
            errorCallback(err);
        } else if (successCallback) {
            successCallback.apply(this, [].slice.call(arguments, 1));
        }
    };
};

},{}],"/Users/Jacob/workspace/scheduler/front-end/node_modules/cldr/node_modules/pegjs/lib/peg.js":[function(require,module,exports){
/*
 * PEG.js 0.7.0
 *
 * http://pegjs.majda.cz/
 *
 * Copyright (c) 2010-2012 David Majda
 * Licensend under the MIT license.
 */
var PEG = (function(undefined) {

var PEG = {
  /* PEG.js version (uses semantic versioning). */
  VERSION: "0.7.0",

  /*
   * Generates a parser from a specified grammar and returns it.
   *
   * The grammar must be a string in the format described by the metagramar in
   * the parser.pegjs file.
   *
   * Throws |PEG.parser.SyntaxError| if the grammar contains a syntax error or
   * |PEG.GrammarError| if it contains a semantic error. Note that not all
   * errors are detected during the generation and some may protrude to the
   * generated parser and cause its malfunction.
   */
  buildParser: function(grammar, options) {
    return PEG.compiler.compile(PEG.parser.parse(grammar), options);
  }
};

/* Thrown when the grammar contains an error. */

PEG.GrammarError = function(message) {
  this.name = "PEG.GrammarError";
  this.message = message;
};

PEG.GrammarError.prototype = Error.prototype;

/* Like Python's |range|, but without |step|. */
function range(start, stop) {
  if (stop === undefined) {
    stop = start;
    start = 0;
  }

  var result = new Array(Math.max(0, stop - start));
  for (var i = 0, j = start; j < stop; i++, j++) {
    result[i] = j;
  }
  return result;
}

function find(array, callback) {
  var length = array.length;
  for (var i = 0; i < length; i++) {
    if (callback(array[i])) {
      return array[i];
    }
  }
}

function contains(array, value) {
  /*
   * Stupid IE does not have Array.prototype.indexOf, otherwise this function
   * would be a one-liner.
   */
  var length = array.length;
  for (var i = 0; i < length; i++) {
    if (array[i] === value) {
      return true;
    }
  }
  return false;
}

function each(array, callback) {
  var length = array.length;
  for (var i = 0; i < length; i++) {
    callback(array[i], i);
  }
}

function map(array, callback) {
  var result = [];
  var length = array.length;
  for (var i = 0; i < length; i++) {
    result[i] = callback(array[i], i);
  }
  return result;
}

function pluck(array, key) {
  return map(array, function (e) { return e[key]; });
}

function keys(object) {
  var result = [];
  for (var key in object) {
    result.push(key);
  }
  return result;
}

function values(object) {
  var result = [];
  for (var key in object) {
    result.push(object[key]);
  }
  return result;
}

/*
 * Returns a string padded on the left to a desired length with a character.
 *
 * The code needs to be in sync with the code template in the compilation
 * function for "action" nodes.
 */
function padLeft(input, padding, length) {
  var result = input;

  var padLength = length - input.length;
  for (var i = 0; i < padLength; i++) {
    result = padding + result;
  }

  return result;
}

/*
 * Returns an escape sequence for given character. Uses \x for characters <=
 * 0xFF to save space, \u for the rest.
 *
 * The code needs to be in sync with the code template in the compilation
 * function for "action" nodes.
 */
function escape(ch) {
  var charCode = ch.charCodeAt(0);
  var escapeChar;
  var length;

  if (charCode <= 0xFF) {
    escapeChar = 'x';
    length = 2;
  } else {
    escapeChar = 'u';
    length = 4;
  }

  return '\\' + escapeChar + padLeft(charCode.toString(16).toUpperCase(), '0', length);
}

/*
 * Surrounds the string with quotes and escapes characters inside so that the
 * result is a valid JavaScript string.
 *
 * The code needs to be in sync with the code template in the compilation
 * function for "action" nodes.
 */
function quote(s) {
  /*
   * ECMA-262, 5th ed., 7.8.4: All characters may appear literally in a string
   * literal except for the closing quote character, backslash, carriage return,
   * line separator, paragraph separator, and line feed. Any character may
   * appear in the form of an escape sequence.
   *
   * For portability, we also escape escape all control and non-ASCII
   * characters. Note that "\0" and "\v" escape sequences are not used because
   * JSHint does not like the first and IE the second.
   */
  return '"' + s
    .replace(/\\/g, '\\\\')  // backslash
    .replace(/"/g, '\\"')    // closing quote character
    .replace(/\x08/g, '\\b') // backspace
    .replace(/\t/g, '\\t')   // horizontal tab
    .replace(/\n/g, '\\n')   // line feed
    .replace(/\f/g, '\\f')   // form feed
    .replace(/\r/g, '\\r')   // carriage return
    .replace(/[\x00-\x07\x0B\x0E-\x1F\x80-\uFFFF]/g, escape)
    + '"';
}

/*
 * Escapes characters inside the string so that it can be used as a list of
 * characters in a character class of a regular expression.
 */
function quoteForRegexpClass(s) {
  /*
   * Based on ECMA-262, 5th ed., 7.8.5 & 15.10.1.
   *
   * For portability, we also escape escape all control and non-ASCII
   * characters.
   */
  return s
    .replace(/\\/g, '\\\\')  // backslash
    .replace(/\//g, '\\/')   // closing slash
    .replace(/\]/g, '\\]')   // closing bracket
    .replace(/-/g, '\\-')    // dash
    .replace(/\0/g, '\\0')   // null
    .replace(/\t/g, '\\t')   // horizontal tab
    .replace(/\n/g, '\\n')   // line feed
    .replace(/\v/g, '\\x0B') // vertical tab
    .replace(/\f/g, '\\f')   // form feed
    .replace(/\r/g, '\\r')   // carriage return
    .replace(/[\x01-\x08\x0E-\x1F\x80-\uFFFF]/g, escape);
}

/*
 * Builds a node visitor -- a function which takes a node and any number of
 * other parameters, calls an appropriate function according to the node type,
 * passes it all its parameters and returns its value. The functions for various
 * node types are passed in a parameter to |buildNodeVisitor| as a hash.
 */
function buildNodeVisitor(functions) {
  return function(node) {
    return functions[node.type].apply(null, arguments);
  };
}

function findRuleByName(ast, name) {
  return find(ast.rules, function(r) { return r.name === name; });
}
PEG.parser = (function(){
  /*
   * Generated by PEG.js 0.7.0.
   *
   * http://pegjs.majda.cz/
   */
  
  function quote(s) {
    /*
     * ECMA-262, 5th ed., 7.8.4: All characters may appear literally in a
     * string literal except for the closing quote character, backslash,
     * carriage return, line separator, paragraph separator, and line feed.
     * Any character may appear in the form of an escape sequence.
     *
     * For portability, we also escape escape all control and non-ASCII
     * characters. Note that "\0" and "\v" escape sequences are not used
     * because JSHint does not like the first and IE the second.
     */
     return '"' + s
      .replace(/\\/g, '\\\\')  // backslash
      .replace(/"/g, '\\"')    // closing quote character
      .replace(/\x08/g, '\\b') // backspace
      .replace(/\t/g, '\\t')   // horizontal tab
      .replace(/\n/g, '\\n')   // line feed
      .replace(/\f/g, '\\f')   // form feed
      .replace(/\r/g, '\\r')   // carriage return
      .replace(/[\x00-\x07\x0B\x0E-\x1F\x80-\uFFFF]/g, escape)
      + '"';
  }
  
  var result = {
    /*
     * Parses the input with a generated parser. If the parsing is successfull,
     * returns a value explicitly or implicitly specified by the grammar from
     * which the parser was generated (see |PEG.buildParser|). If the parsing is
     * unsuccessful, throws |PEG.parser.SyntaxError| describing the error.
     */
    parse: function(input, startRule) {
      var parseFunctions = {
        "grammar": parse_grammar,
        "initializer": parse_initializer,
        "rule": parse_rule,
        "choice": parse_choice,
        "sequence": parse_sequence,
        "labeled": parse_labeled,
        "prefixed": parse_prefixed,
        "suffixed": parse_suffixed,
        "primary": parse_primary,
        "action": parse_action,
        "braced": parse_braced,
        "nonBraceCharacters": parse_nonBraceCharacters,
        "nonBraceCharacter": parse_nonBraceCharacter,
        "equals": parse_equals,
        "colon": parse_colon,
        "semicolon": parse_semicolon,
        "slash": parse_slash,
        "and": parse_and,
        "not": parse_not,
        "question": parse_question,
        "star": parse_star,
        "plus": parse_plus,
        "lparen": parse_lparen,
        "rparen": parse_rparen,
        "dot": parse_dot,
        "identifier": parse_identifier,
        "literal": parse_literal,
        "string": parse_string,
        "doubleQuotedString": parse_doubleQuotedString,
        "doubleQuotedCharacter": parse_doubleQuotedCharacter,
        "simpleDoubleQuotedCharacter": parse_simpleDoubleQuotedCharacter,
        "singleQuotedString": parse_singleQuotedString,
        "singleQuotedCharacter": parse_singleQuotedCharacter,
        "simpleSingleQuotedCharacter": parse_simpleSingleQuotedCharacter,
        "class": parse_class,
        "classCharacterRange": parse_classCharacterRange,
        "classCharacter": parse_classCharacter,
        "bracketDelimitedCharacter": parse_bracketDelimitedCharacter,
        "simpleBracketDelimitedCharacter": parse_simpleBracketDelimitedCharacter,
        "simpleEscapeSequence": parse_simpleEscapeSequence,
        "zeroEscapeSequence": parse_zeroEscapeSequence,
        "hexEscapeSequence": parse_hexEscapeSequence,
        "unicodeEscapeSequence": parse_unicodeEscapeSequence,
        "eolEscapeSequence": parse_eolEscapeSequence,
        "digit": parse_digit,
        "hexDigit": parse_hexDigit,
        "letter": parse_letter,
        "lowerCaseLetter": parse_lowerCaseLetter,
        "upperCaseLetter": parse_upperCaseLetter,
        "__": parse___,
        "comment": parse_comment,
        "singleLineComment": parse_singleLineComment,
        "multiLineComment": parse_multiLineComment,
        "eol": parse_eol,
        "eolChar": parse_eolChar,
        "whitespace": parse_whitespace
      };
      
      if (startRule !== undefined) {
        if (parseFunctions[startRule] === undefined) {
          throw new Error("Invalid rule name: " + quote(startRule) + ".");
        }
      } else {
        startRule = "grammar";
      }
      
      var pos = 0;
      var reportFailures = 0;
      var rightmostFailuresPos = 0;
      var rightmostFailuresExpected = [];
      
      function padLeft(input, padding, length) {
        var result = input;
        
        var padLength = length - input.length;
        for (var i = 0; i < padLength; i++) {
          result = padding + result;
        }
        
        return result;
      }
      
      function escape(ch) {
        var charCode = ch.charCodeAt(0);
        var escapeChar;
        var length;
        
        if (charCode <= 0xFF) {
          escapeChar = 'x';
          length = 2;
        } else {
          escapeChar = 'u';
          length = 4;
        }
        
        return '\\' + escapeChar + padLeft(charCode.toString(16).toUpperCase(), '0', length);
      }
      
      function matchFailed(failure) {
        if (pos < rightmostFailuresPos) {
          return;
        }
        
        if (pos > rightmostFailuresPos) {
          rightmostFailuresPos = pos;
          rightmostFailuresExpected = [];
        }
        
        rightmostFailuresExpected.push(failure);
      }
      
      function parse_grammar() {
        var result0, result1, result2, result3;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse___();
        if (result0 !== null) {
          result1 = parse_initializer();
          result1 = result1 !== null ? result1 : "";
          if (result1 !== null) {
            result3 = parse_rule();
            if (result3 !== null) {
              result2 = [];
              while (result3 !== null) {
                result2.push(result3);
                result3 = parse_rule();
              }
            } else {
              result2 = null;
            }
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, initializer, rules) {
              return {
                type:        "grammar",
                initializer: initializer !== "" ? initializer : null,
                rules:       rules,
                startRule:   rules[0].name
              };
            })(pos0, result0[1], result0[2]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_initializer() {
        var result0, result1;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_action();
        if (result0 !== null) {
          result1 = parse_semicolon();
          result1 = result1 !== null ? result1 : "";
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, code) {
              return {
                type: "initializer",
                code: code
              };
            })(pos0, result0[0]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_rule() {
        var result0, result1, result2, result3, result4;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_identifier();
        if (result0 !== null) {
          result1 = parse_string();
          result1 = result1 !== null ? result1 : "";
          if (result1 !== null) {
            result2 = parse_equals();
            if (result2 !== null) {
              result3 = parse_choice();
              if (result3 !== null) {
                result4 = parse_semicolon();
                result4 = result4 !== null ? result4 : "";
                if (result4 !== null) {
                  result0 = [result0, result1, result2, result3, result4];
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, name, displayName, expression) {
              return {
                type:        "rule",
                name:        name,
                displayName: displayName !== "" ? displayName : null,
                expression:  expression
              };
            })(pos0, result0[0], result0[1], result0[3]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_choice() {
        var result0, result1, result2, result3;
        var pos0, pos1, pos2;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_sequence();
        if (result0 !== null) {
          result1 = [];
          pos2 = pos;
          result2 = parse_slash();
          if (result2 !== null) {
            result3 = parse_sequence();
            if (result3 !== null) {
              result2 = [result2, result3];
            } else {
              result2 = null;
              pos = pos2;
            }
          } else {
            result2 = null;
            pos = pos2;
          }
          while (result2 !== null) {
            result1.push(result2);
            pos2 = pos;
            result2 = parse_slash();
            if (result2 !== null) {
              result3 = parse_sequence();
              if (result3 !== null) {
                result2 = [result2, result3];
              } else {
                result2 = null;
                pos = pos2;
              }
            } else {
              result2 = null;
              pos = pos2;
            }
          }
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, head, tail) {
              if (tail.length > 0) {
                var alternatives = [head].concat(map(
                    tail,
                    function(element) { return element[1]; }
                ));
                return {
                  type:         "choice",
                  alternatives: alternatives
                };
              } else {
                return head;
              }
            })(pos0, result0[0], result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_sequence() {
        var result0, result1;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = [];
        result1 = parse_labeled();
        while (result1 !== null) {
          result0.push(result1);
          result1 = parse_labeled();
        }
        if (result0 !== null) {
          result1 = parse_action();
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, elements, code) {
              var expression = elements.length !== 1
                ? {
                    type:     "sequence",
                    elements: elements
                  }
                : elements[0];
              return {
                type:       "action",
                expression: expression,
                code:       code
              };
            })(pos0, result0[0], result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        if (result0 === null) {
          pos0 = pos;
          result0 = [];
          result1 = parse_labeled();
          while (result1 !== null) {
            result0.push(result1);
            result1 = parse_labeled();
          }
          if (result0 !== null) {
            result0 = (function(offset, elements) {
                return elements.length !== 1
                  ? {
                      type:     "sequence",
                      elements: elements
                    }
                  : elements[0];
              })(pos0, result0);
          }
          if (result0 === null) {
            pos = pos0;
          }
        }
        return result0;
      }
      
      function parse_labeled() {
        var result0, result1, result2;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_identifier();
        if (result0 !== null) {
          result1 = parse_colon();
          if (result1 !== null) {
            result2 = parse_prefixed();
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, label, expression) {
              return {
                type:       "labeled",
                label:      label,
                expression: expression
              };
            })(pos0, result0[0], result0[2]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        if (result0 === null) {
          result0 = parse_prefixed();
        }
        return result0;
      }
      
      function parse_prefixed() {
        var result0, result1;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_and();
        if (result0 !== null) {
          result1 = parse_action();
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, code) {
              return {
                type: "semantic_and",
                code: code
              };
            })(pos0, result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        if (result0 === null) {
          pos0 = pos;
          pos1 = pos;
          result0 = parse_and();
          if (result0 !== null) {
            result1 = parse_suffixed();
            if (result1 !== null) {
              result0 = [result0, result1];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
          if (result0 !== null) {
            result0 = (function(offset, expression) {
                return {
                  type:       "simple_and",
                  expression: expression
                };
              })(pos0, result0[1]);
          }
          if (result0 === null) {
            pos = pos0;
          }
          if (result0 === null) {
            pos0 = pos;
            pos1 = pos;
            result0 = parse_not();
            if (result0 !== null) {
              result1 = parse_action();
              if (result1 !== null) {
                result0 = [result0, result1];
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
            if (result0 !== null) {
              result0 = (function(offset, code) {
                  return {
                    type: "semantic_not",
                    code: code
                  };
                })(pos0, result0[1]);
            }
            if (result0 === null) {
              pos = pos0;
            }
            if (result0 === null) {
              pos0 = pos;
              pos1 = pos;
              result0 = parse_not();
              if (result0 !== null) {
                result1 = parse_suffixed();
                if (result1 !== null) {
                  result0 = [result0, result1];
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
              if (result0 !== null) {
                result0 = (function(offset, expression) {
                    return {
                      type:       "simple_not",
                      expression: expression
                    };
                  })(pos0, result0[1]);
              }
              if (result0 === null) {
                pos = pos0;
              }
              if (result0 === null) {
                result0 = parse_suffixed();
              }
            }
          }
        }
        return result0;
      }
      
      function parse_suffixed() {
        var result0, result1;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_primary();
        if (result0 !== null) {
          result1 = parse_question();
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, expression) {
              return {
                type:       "optional",
                expression: expression
              };
            })(pos0, result0[0]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        if (result0 === null) {
          pos0 = pos;
          pos1 = pos;
          result0 = parse_primary();
          if (result0 !== null) {
            result1 = parse_star();
            if (result1 !== null) {
              result0 = [result0, result1];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
          if (result0 !== null) {
            result0 = (function(offset, expression) {
                return {
                  type:       "zero_or_more",
                  expression: expression
                };
              })(pos0, result0[0]);
          }
          if (result0 === null) {
            pos = pos0;
          }
          if (result0 === null) {
            pos0 = pos;
            pos1 = pos;
            result0 = parse_primary();
            if (result0 !== null) {
              result1 = parse_plus();
              if (result1 !== null) {
                result0 = [result0, result1];
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
            if (result0 !== null) {
              result0 = (function(offset, expression) {
                  return {
                    type:       "one_or_more",
                    expression: expression
                  };
                })(pos0, result0[0]);
            }
            if (result0 === null) {
              pos = pos0;
            }
            if (result0 === null) {
              result0 = parse_primary();
            }
          }
        }
        return result0;
      }
      
      function parse_primary() {
        var result0, result1, result2;
        var pos0, pos1, pos2, pos3;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_identifier();
        if (result0 !== null) {
          pos2 = pos;
          reportFailures++;
          pos3 = pos;
          result1 = parse_string();
          result1 = result1 !== null ? result1 : "";
          if (result1 !== null) {
            result2 = parse_equals();
            if (result2 !== null) {
              result1 = [result1, result2];
            } else {
              result1 = null;
              pos = pos3;
            }
          } else {
            result1 = null;
            pos = pos3;
          }
          reportFailures--;
          if (result1 === null) {
            result1 = "";
          } else {
            result1 = null;
            pos = pos2;
          }
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, name) {
              return {
                type: "rule_ref",
                name: name
              };
            })(pos0, result0[0]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        if (result0 === null) {
          result0 = parse_literal();
          if (result0 === null) {
            pos0 = pos;
            result0 = parse_dot();
            if (result0 !== null) {
              result0 = (function(offset) { return { type: "any" }; })(pos0);
            }
            if (result0 === null) {
              pos = pos0;
            }
            if (result0 === null) {
              result0 = parse_class();
              if (result0 === null) {
                pos0 = pos;
                pos1 = pos;
                result0 = parse_lparen();
                if (result0 !== null) {
                  result1 = parse_choice();
                  if (result1 !== null) {
                    result2 = parse_rparen();
                    if (result2 !== null) {
                      result0 = [result0, result1, result2];
                    } else {
                      result0 = null;
                      pos = pos1;
                    }
                  } else {
                    result0 = null;
                    pos = pos1;
                  }
                } else {
                  result0 = null;
                  pos = pos1;
                }
                if (result0 !== null) {
                  result0 = (function(offset, expression) { return expression; })(pos0, result0[1]);
                }
                if (result0 === null) {
                  pos = pos0;
                }
              }
            }
          }
        }
        return result0;
      }
      
      function parse_action() {
        var result0, result1;
        var pos0, pos1;
        
        reportFailures++;
        pos0 = pos;
        pos1 = pos;
        result0 = parse_braced();
        if (result0 !== null) {
          result1 = parse___();
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, braced) { return braced.substr(1, braced.length - 2); })(pos0, result0[0]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        reportFailures--;
        if (reportFailures === 0 && result0 === null) {
          matchFailed("action");
        }
        return result0;
      }
      
      function parse_braced() {
        var result0, result1, result2;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (input.charCodeAt(pos) === 123) {
          result0 = "{";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"{\"");
          }
        }
        if (result0 !== null) {
          result1 = [];
          result2 = parse_braced();
          if (result2 === null) {
            result2 = parse_nonBraceCharacter();
          }
          while (result2 !== null) {
            result1.push(result2);
            result2 = parse_braced();
            if (result2 === null) {
              result2 = parse_nonBraceCharacter();
            }
          }
          if (result1 !== null) {
            if (input.charCodeAt(pos) === 125) {
              result2 = "}";
              pos++;
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("\"}\"");
              }
            }
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, parts) {
              return "{" + parts.join("") + "}";
            })(pos0, result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_nonBraceCharacters() {
        var result0, result1;
        var pos0;
        
        pos0 = pos;
        result1 = parse_nonBraceCharacter();
        if (result1 !== null) {
          result0 = [];
          while (result1 !== null) {
            result0.push(result1);
            result1 = parse_nonBraceCharacter();
          }
        } else {
          result0 = null;
        }
        if (result0 !== null) {
          result0 = (function(offset, chars) { return chars.join(""); })(pos0, result0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_nonBraceCharacter() {
        var result0;
        
        if (/^[^{}]/.test(input.charAt(pos))) {
          result0 = input.charAt(pos);
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("[^{}]");
          }
        }
        return result0;
      }
      
      function parse_equals() {
        var result0, result1;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (input.charCodeAt(pos) === 61) {
          result0 = "=";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"=\"");
          }
        }
        if (result0 !== null) {
          result1 = parse___();
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset) { return "="; })(pos0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_colon() {
        var result0, result1;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (input.charCodeAt(pos) === 58) {
          result0 = ":";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\":\"");
          }
        }
        if (result0 !== null) {
          result1 = parse___();
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset) { return ":"; })(pos0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_semicolon() {
        var result0, result1;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (input.charCodeAt(pos) === 59) {
          result0 = ";";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\";\"");
          }
        }
        if (result0 !== null) {
          result1 = parse___();
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset) { return ";"; })(pos0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_slash() {
        var result0, result1;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (input.charCodeAt(pos) === 47) {
          result0 = "/";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"/\"");
          }
        }
        if (result0 !== null) {
          result1 = parse___();
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset) { return "/"; })(pos0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_and() {
        var result0, result1;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (input.charCodeAt(pos) === 38) {
          result0 = "&";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"&\"");
          }
        }
        if (result0 !== null) {
          result1 = parse___();
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset) { return "&"; })(pos0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_not() {
        var result0, result1;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (input.charCodeAt(pos) === 33) {
          result0 = "!";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"!\"");
          }
        }
        if (result0 !== null) {
          result1 = parse___();
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset) { return "!"; })(pos0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_question() {
        var result0, result1;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (input.charCodeAt(pos) === 63) {
          result0 = "?";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"?\"");
          }
        }
        if (result0 !== null) {
          result1 = parse___();
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset) { return "?"; })(pos0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_star() {
        var result0, result1;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (input.charCodeAt(pos) === 42) {
          result0 = "*";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"*\"");
          }
        }
        if (result0 !== null) {
          result1 = parse___();
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset) { return "*"; })(pos0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_plus() {
        var result0, result1;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (input.charCodeAt(pos) === 43) {
          result0 = "+";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"+\"");
          }
        }
        if (result0 !== null) {
          result1 = parse___();
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset) { return "+"; })(pos0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_lparen() {
        var result0, result1;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (input.charCodeAt(pos) === 40) {
          result0 = "(";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"(\"");
          }
        }
        if (result0 !== null) {
          result1 = parse___();
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset) { return "("; })(pos0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_rparen() {
        var result0, result1;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (input.charCodeAt(pos) === 41) {
          result0 = ")";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\")\"");
          }
        }
        if (result0 !== null) {
          result1 = parse___();
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset) { return ")"; })(pos0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_dot() {
        var result0, result1;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (input.charCodeAt(pos) === 46) {
          result0 = ".";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\".\"");
          }
        }
        if (result0 !== null) {
          result1 = parse___();
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset) { return "."; })(pos0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_identifier() {
        var result0, result1, result2;
        var pos0, pos1;
        
        reportFailures++;
        pos0 = pos;
        pos1 = pos;
        result0 = parse_letter();
        if (result0 === null) {
          if (input.charCodeAt(pos) === 95) {
            result0 = "_";
            pos++;
          } else {
            result0 = null;
            if (reportFailures === 0) {
              matchFailed("\"_\"");
            }
          }
          if (result0 === null) {
            if (input.charCodeAt(pos) === 36) {
              result0 = "$";
              pos++;
            } else {
              result0 = null;
              if (reportFailures === 0) {
                matchFailed("\"$\"");
              }
            }
          }
        }
        if (result0 !== null) {
          result1 = [];
          result2 = parse_letter();
          if (result2 === null) {
            result2 = parse_digit();
            if (result2 === null) {
              if (input.charCodeAt(pos) === 95) {
                result2 = "_";
                pos++;
              } else {
                result2 = null;
                if (reportFailures === 0) {
                  matchFailed("\"_\"");
                }
              }
              if (result2 === null) {
                if (input.charCodeAt(pos) === 36) {
                  result2 = "$";
                  pos++;
                } else {
                  result2 = null;
                  if (reportFailures === 0) {
                    matchFailed("\"$\"");
                  }
                }
              }
            }
          }
          while (result2 !== null) {
            result1.push(result2);
            result2 = parse_letter();
            if (result2 === null) {
              result2 = parse_digit();
              if (result2 === null) {
                if (input.charCodeAt(pos) === 95) {
                  result2 = "_";
                  pos++;
                } else {
                  result2 = null;
                  if (reportFailures === 0) {
                    matchFailed("\"_\"");
                  }
                }
                if (result2 === null) {
                  if (input.charCodeAt(pos) === 36) {
                    result2 = "$";
                    pos++;
                  } else {
                    result2 = null;
                    if (reportFailures === 0) {
                      matchFailed("\"$\"");
                    }
                  }
                }
              }
            }
          }
          if (result1 !== null) {
            result2 = parse___();
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, head, tail) {
              return head + tail.join("");
            })(pos0, result0[0], result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        reportFailures--;
        if (reportFailures === 0 && result0 === null) {
          matchFailed("identifier");
        }
        return result0;
      }
      
      function parse_literal() {
        var result0, result1, result2;
        var pos0, pos1;
        
        reportFailures++;
        pos0 = pos;
        pos1 = pos;
        result0 = parse_doubleQuotedString();
        if (result0 === null) {
          result0 = parse_singleQuotedString();
        }
        if (result0 !== null) {
          if (input.charCodeAt(pos) === 105) {
            result1 = "i";
            pos++;
          } else {
            result1 = null;
            if (reportFailures === 0) {
              matchFailed("\"i\"");
            }
          }
          result1 = result1 !== null ? result1 : "";
          if (result1 !== null) {
            result2 = parse___();
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, value, flags) {
              return {
                type:       "literal",
                value:      value,
                ignoreCase: flags === "i"
              };
            })(pos0, result0[0], result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        reportFailures--;
        if (reportFailures === 0 && result0 === null) {
          matchFailed("literal");
        }
        return result0;
      }
      
      function parse_string() {
        var result0, result1;
        var pos0, pos1;
        
        reportFailures++;
        pos0 = pos;
        pos1 = pos;
        result0 = parse_doubleQuotedString();
        if (result0 === null) {
          result0 = parse_singleQuotedString();
        }
        if (result0 !== null) {
          result1 = parse___();
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, string) { return string; })(pos0, result0[0]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        reportFailures--;
        if (reportFailures === 0 && result0 === null) {
          matchFailed("string");
        }
        return result0;
      }
      
      function parse_doubleQuotedString() {
        var result0, result1, result2;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (input.charCodeAt(pos) === 34) {
          result0 = "\"";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"\\\"\"");
          }
        }
        if (result0 !== null) {
          result1 = [];
          result2 = parse_doubleQuotedCharacter();
          while (result2 !== null) {
            result1.push(result2);
            result2 = parse_doubleQuotedCharacter();
          }
          if (result1 !== null) {
            if (input.charCodeAt(pos) === 34) {
              result2 = "\"";
              pos++;
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("\"\\\"\"");
              }
            }
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, chars) { return chars.join(""); })(pos0, result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_doubleQuotedCharacter() {
        var result0;
        
        result0 = parse_simpleDoubleQuotedCharacter();
        if (result0 === null) {
          result0 = parse_simpleEscapeSequence();
          if (result0 === null) {
            result0 = parse_zeroEscapeSequence();
            if (result0 === null) {
              result0 = parse_hexEscapeSequence();
              if (result0 === null) {
                result0 = parse_unicodeEscapeSequence();
                if (result0 === null) {
                  result0 = parse_eolEscapeSequence();
                }
              }
            }
          }
        }
        return result0;
      }
      
      function parse_simpleDoubleQuotedCharacter() {
        var result0, result1;
        var pos0, pos1, pos2;
        
        pos0 = pos;
        pos1 = pos;
        pos2 = pos;
        reportFailures++;
        if (input.charCodeAt(pos) === 34) {
          result0 = "\"";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"\\\"\"");
          }
        }
        if (result0 === null) {
          if (input.charCodeAt(pos) === 92) {
            result0 = "\\";
            pos++;
          } else {
            result0 = null;
            if (reportFailures === 0) {
              matchFailed("\"\\\\\"");
            }
          }
          if (result0 === null) {
            result0 = parse_eolChar();
          }
        }
        reportFailures--;
        if (result0 === null) {
          result0 = "";
        } else {
          result0 = null;
          pos = pos2;
        }
        if (result0 !== null) {
          if (input.length > pos) {
            result1 = input.charAt(pos);
            pos++;
          } else {
            result1 = null;
            if (reportFailures === 0) {
              matchFailed("any character");
            }
          }
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, char_) { return char_; })(pos0, result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_singleQuotedString() {
        var result0, result1, result2;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (input.charCodeAt(pos) === 39) {
          result0 = "'";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"'\"");
          }
        }
        if (result0 !== null) {
          result1 = [];
          result2 = parse_singleQuotedCharacter();
          while (result2 !== null) {
            result1.push(result2);
            result2 = parse_singleQuotedCharacter();
          }
          if (result1 !== null) {
            if (input.charCodeAt(pos) === 39) {
              result2 = "'";
              pos++;
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("\"'\"");
              }
            }
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, chars) { return chars.join(""); })(pos0, result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_singleQuotedCharacter() {
        var result0;
        
        result0 = parse_simpleSingleQuotedCharacter();
        if (result0 === null) {
          result0 = parse_simpleEscapeSequence();
          if (result0 === null) {
            result0 = parse_zeroEscapeSequence();
            if (result0 === null) {
              result0 = parse_hexEscapeSequence();
              if (result0 === null) {
                result0 = parse_unicodeEscapeSequence();
                if (result0 === null) {
                  result0 = parse_eolEscapeSequence();
                }
              }
            }
          }
        }
        return result0;
      }
      
      function parse_simpleSingleQuotedCharacter() {
        var result0, result1;
        var pos0, pos1, pos2;
        
        pos0 = pos;
        pos1 = pos;
        pos2 = pos;
        reportFailures++;
        if (input.charCodeAt(pos) === 39) {
          result0 = "'";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"'\"");
          }
        }
        if (result0 === null) {
          if (input.charCodeAt(pos) === 92) {
            result0 = "\\";
            pos++;
          } else {
            result0 = null;
            if (reportFailures === 0) {
              matchFailed("\"\\\\\"");
            }
          }
          if (result0 === null) {
            result0 = parse_eolChar();
          }
        }
        reportFailures--;
        if (result0 === null) {
          result0 = "";
        } else {
          result0 = null;
          pos = pos2;
        }
        if (result0 !== null) {
          if (input.length > pos) {
            result1 = input.charAt(pos);
            pos++;
          } else {
            result1 = null;
            if (reportFailures === 0) {
              matchFailed("any character");
            }
          }
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, char_) { return char_; })(pos0, result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_class() {
        var result0, result1, result2, result3, result4, result5;
        var pos0, pos1;
        
        reportFailures++;
        pos0 = pos;
        pos1 = pos;
        if (input.charCodeAt(pos) === 91) {
          result0 = "[";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"[\"");
          }
        }
        if (result0 !== null) {
          if (input.charCodeAt(pos) === 94) {
            result1 = "^";
            pos++;
          } else {
            result1 = null;
            if (reportFailures === 0) {
              matchFailed("\"^\"");
            }
          }
          result1 = result1 !== null ? result1 : "";
          if (result1 !== null) {
            result2 = [];
            result3 = parse_classCharacterRange();
            if (result3 === null) {
              result3 = parse_classCharacter();
            }
            while (result3 !== null) {
              result2.push(result3);
              result3 = parse_classCharacterRange();
              if (result3 === null) {
                result3 = parse_classCharacter();
              }
            }
            if (result2 !== null) {
              if (input.charCodeAt(pos) === 93) {
                result3 = "]";
                pos++;
              } else {
                result3 = null;
                if (reportFailures === 0) {
                  matchFailed("\"]\"");
                }
              }
              if (result3 !== null) {
                if (input.charCodeAt(pos) === 105) {
                  result4 = "i";
                  pos++;
                } else {
                  result4 = null;
                  if (reportFailures === 0) {
                    matchFailed("\"i\"");
                  }
                }
                result4 = result4 !== null ? result4 : "";
                if (result4 !== null) {
                  result5 = parse___();
                  if (result5 !== null) {
                    result0 = [result0, result1, result2, result3, result4, result5];
                  } else {
                    result0 = null;
                    pos = pos1;
                  }
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, inverted, parts, flags) {
              var partsConverted = map(parts, function(part) { return part.data; });
              var rawText = "["
                + inverted
                + map(parts, function(part) { return part.rawText; }).join("")
                + "]"
                + flags;
        
              return {
                type:       "class",
                inverted:   inverted === "^",
                ignoreCase: flags === "i",
                parts:      partsConverted,
                // FIXME: Get the raw text from the input directly.
                rawText:    rawText
              };
            })(pos0, result0[1], result0[2], result0[4]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        reportFailures--;
        if (reportFailures === 0 && result0 === null) {
          matchFailed("character class");
        }
        return result0;
      }
      
      function parse_classCharacterRange() {
        var result0, result1, result2;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_classCharacter();
        if (result0 !== null) {
          if (input.charCodeAt(pos) === 45) {
            result1 = "-";
            pos++;
          } else {
            result1 = null;
            if (reportFailures === 0) {
              matchFailed("\"-\"");
            }
          }
          if (result1 !== null) {
            result2 = parse_classCharacter();
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, begin, end) {
              if (begin.data.charCodeAt(0) > end.data.charCodeAt(0)) {
                throw new this.SyntaxError(
                  "Invalid character range: " + begin.rawText + "-" + end.rawText + "."
                );
              }
        
              return {
                data:    [begin.data, end.data],
                // FIXME: Get the raw text from the input directly.
                rawText: begin.rawText + "-" + end.rawText
              };
            })(pos0, result0[0], result0[2]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_classCharacter() {
        var result0;
        var pos0;
        
        pos0 = pos;
        result0 = parse_bracketDelimitedCharacter();
        if (result0 !== null) {
          result0 = (function(offset, char_) {
              return {
                data:    char_,
                // FIXME: Get the raw text from the input directly.
                rawText: quoteForRegexpClass(char_)
              };
            })(pos0, result0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_bracketDelimitedCharacter() {
        var result0;
        
        result0 = parse_simpleBracketDelimitedCharacter();
        if (result0 === null) {
          result0 = parse_simpleEscapeSequence();
          if (result0 === null) {
            result0 = parse_zeroEscapeSequence();
            if (result0 === null) {
              result0 = parse_hexEscapeSequence();
              if (result0 === null) {
                result0 = parse_unicodeEscapeSequence();
                if (result0 === null) {
                  result0 = parse_eolEscapeSequence();
                }
              }
            }
          }
        }
        return result0;
      }
      
      function parse_simpleBracketDelimitedCharacter() {
        var result0, result1;
        var pos0, pos1, pos2;
        
        pos0 = pos;
        pos1 = pos;
        pos2 = pos;
        reportFailures++;
        if (input.charCodeAt(pos) === 93) {
          result0 = "]";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"]\"");
          }
        }
        if (result0 === null) {
          if (input.charCodeAt(pos) === 92) {
            result0 = "\\";
            pos++;
          } else {
            result0 = null;
            if (reportFailures === 0) {
              matchFailed("\"\\\\\"");
            }
          }
          if (result0 === null) {
            result0 = parse_eolChar();
          }
        }
        reportFailures--;
        if (result0 === null) {
          result0 = "";
        } else {
          result0 = null;
          pos = pos2;
        }
        if (result0 !== null) {
          if (input.length > pos) {
            result1 = input.charAt(pos);
            pos++;
          } else {
            result1 = null;
            if (reportFailures === 0) {
              matchFailed("any character");
            }
          }
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, char_) { return char_; })(pos0, result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_simpleEscapeSequence() {
        var result0, result1, result2;
        var pos0, pos1, pos2;
        
        pos0 = pos;
        pos1 = pos;
        if (input.charCodeAt(pos) === 92) {
          result0 = "\\";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"\\\\\"");
          }
        }
        if (result0 !== null) {
          pos2 = pos;
          reportFailures++;
          result1 = parse_digit();
          if (result1 === null) {
            if (input.charCodeAt(pos) === 120) {
              result1 = "x";
              pos++;
            } else {
              result1 = null;
              if (reportFailures === 0) {
                matchFailed("\"x\"");
              }
            }
            if (result1 === null) {
              if (input.charCodeAt(pos) === 117) {
                result1 = "u";
                pos++;
              } else {
                result1 = null;
                if (reportFailures === 0) {
                  matchFailed("\"u\"");
                }
              }
              if (result1 === null) {
                result1 = parse_eolChar();
              }
            }
          }
          reportFailures--;
          if (result1 === null) {
            result1 = "";
          } else {
            result1 = null;
            pos = pos2;
          }
          if (result1 !== null) {
            if (input.length > pos) {
              result2 = input.charAt(pos);
              pos++;
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("any character");
              }
            }
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, char_) {
              return char_
                .replace("b", "\b")
                .replace("f", "\f")
                .replace("n", "\n")
                .replace("r", "\r")
                .replace("t", "\t")
                .replace("v", "\x0B"); // IE does not recognize "\v".
            })(pos0, result0[2]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_zeroEscapeSequence() {
        var result0, result1;
        var pos0, pos1, pos2;
        
        pos0 = pos;
        pos1 = pos;
        if (input.substr(pos, 2) === "\\0") {
          result0 = "\\0";
          pos += 2;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"\\\\0\"");
          }
        }
        if (result0 !== null) {
          pos2 = pos;
          reportFailures++;
          result1 = parse_digit();
          reportFailures--;
          if (result1 === null) {
            result1 = "";
          } else {
            result1 = null;
            pos = pos2;
          }
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset) { return "\x00"; })(pos0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_hexEscapeSequence() {
        var result0, result1, result2;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (input.substr(pos, 2) === "\\x") {
          result0 = "\\x";
          pos += 2;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"\\\\x\"");
          }
        }
        if (result0 !== null) {
          result1 = parse_hexDigit();
          if (result1 !== null) {
            result2 = parse_hexDigit();
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, h1, h2) {
              return String.fromCharCode(parseInt(h1 + h2, 16));
            })(pos0, result0[1], result0[2]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_unicodeEscapeSequence() {
        var result0, result1, result2, result3, result4;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (input.substr(pos, 2) === "\\u") {
          result0 = "\\u";
          pos += 2;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"\\\\u\"");
          }
        }
        if (result0 !== null) {
          result1 = parse_hexDigit();
          if (result1 !== null) {
            result2 = parse_hexDigit();
            if (result2 !== null) {
              result3 = parse_hexDigit();
              if (result3 !== null) {
                result4 = parse_hexDigit();
                if (result4 !== null) {
                  result0 = [result0, result1, result2, result3, result4];
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, h1, h2, h3, h4) {
              return String.fromCharCode(parseInt(h1 + h2 + h3 + h4, 16));
            })(pos0, result0[1], result0[2], result0[3], result0[4]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_eolEscapeSequence() {
        var result0, result1;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (input.charCodeAt(pos) === 92) {
          result0 = "\\";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"\\\\\"");
          }
        }
        if (result0 !== null) {
          result1 = parse_eol();
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, eol) { return eol; })(pos0, result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_digit() {
        var result0;
        
        if (/^[0-9]/.test(input.charAt(pos))) {
          result0 = input.charAt(pos);
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("[0-9]");
          }
        }
        return result0;
      }
      
      function parse_hexDigit() {
        var result0;
        
        if (/^[0-9a-fA-F]/.test(input.charAt(pos))) {
          result0 = input.charAt(pos);
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("[0-9a-fA-F]");
          }
        }
        return result0;
      }
      
      function parse_letter() {
        var result0;
        
        result0 = parse_lowerCaseLetter();
        if (result0 === null) {
          result0 = parse_upperCaseLetter();
        }
        return result0;
      }
      
      function parse_lowerCaseLetter() {
        var result0;
        
        if (/^[a-z]/.test(input.charAt(pos))) {
          result0 = input.charAt(pos);
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("[a-z]");
          }
        }
        return result0;
      }
      
      function parse_upperCaseLetter() {
        var result0;
        
        if (/^[A-Z]/.test(input.charAt(pos))) {
          result0 = input.charAt(pos);
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("[A-Z]");
          }
        }
        return result0;
      }
      
      function parse___() {
        var result0, result1;
        
        result0 = [];
        result1 = parse_whitespace();
        if (result1 === null) {
          result1 = parse_eol();
          if (result1 === null) {
            result1 = parse_comment();
          }
        }
        while (result1 !== null) {
          result0.push(result1);
          result1 = parse_whitespace();
          if (result1 === null) {
            result1 = parse_eol();
            if (result1 === null) {
              result1 = parse_comment();
            }
          }
        }
        return result0;
      }
      
      function parse_comment() {
        var result0;
        
        reportFailures++;
        result0 = parse_singleLineComment();
        if (result0 === null) {
          result0 = parse_multiLineComment();
        }
        reportFailures--;
        if (reportFailures === 0 && result0 === null) {
          matchFailed("comment");
        }
        return result0;
      }
      
      function parse_singleLineComment() {
        var result0, result1, result2, result3;
        var pos0, pos1, pos2;
        
        pos0 = pos;
        if (input.substr(pos, 2) === "//") {
          result0 = "//";
          pos += 2;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"//\"");
          }
        }
        if (result0 !== null) {
          result1 = [];
          pos1 = pos;
          pos2 = pos;
          reportFailures++;
          result2 = parse_eolChar();
          reportFailures--;
          if (result2 === null) {
            result2 = "";
          } else {
            result2 = null;
            pos = pos2;
          }
          if (result2 !== null) {
            if (input.length > pos) {
              result3 = input.charAt(pos);
              pos++;
            } else {
              result3 = null;
              if (reportFailures === 0) {
                matchFailed("any character");
              }
            }
            if (result3 !== null) {
              result2 = [result2, result3];
            } else {
              result2 = null;
              pos = pos1;
            }
          } else {
            result2 = null;
            pos = pos1;
          }
          while (result2 !== null) {
            result1.push(result2);
            pos1 = pos;
            pos2 = pos;
            reportFailures++;
            result2 = parse_eolChar();
            reportFailures--;
            if (result2 === null) {
              result2 = "";
            } else {
              result2 = null;
              pos = pos2;
            }
            if (result2 !== null) {
              if (input.length > pos) {
                result3 = input.charAt(pos);
                pos++;
              } else {
                result3 = null;
                if (reportFailures === 0) {
                  matchFailed("any character");
                }
              }
              if (result3 !== null) {
                result2 = [result2, result3];
              } else {
                result2 = null;
                pos = pos1;
              }
            } else {
              result2 = null;
              pos = pos1;
            }
          }
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos0;
          }
        } else {
          result0 = null;
          pos = pos0;
        }
        return result0;
      }
      
      function parse_multiLineComment() {
        var result0, result1, result2, result3;
        var pos0, pos1, pos2;
        
        pos0 = pos;
        if (input.substr(pos, 2) === "/*") {
          result0 = "/*";
          pos += 2;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"/*\"");
          }
        }
        if (result0 !== null) {
          result1 = [];
          pos1 = pos;
          pos2 = pos;
          reportFailures++;
          if (input.substr(pos, 2) === "*/") {
            result2 = "*/";
            pos += 2;
          } else {
            result2 = null;
            if (reportFailures === 0) {
              matchFailed("\"*/\"");
            }
          }
          reportFailures--;
          if (result2 === null) {
            result2 = "";
          } else {
            result2 = null;
            pos = pos2;
          }
          if (result2 !== null) {
            if (input.length > pos) {
              result3 = input.charAt(pos);
              pos++;
            } else {
              result3 = null;
              if (reportFailures === 0) {
                matchFailed("any character");
              }
            }
            if (result3 !== null) {
              result2 = [result2, result3];
            } else {
              result2 = null;
              pos = pos1;
            }
          } else {
            result2 = null;
            pos = pos1;
          }
          while (result2 !== null) {
            result1.push(result2);
            pos1 = pos;
            pos2 = pos;
            reportFailures++;
            if (input.substr(pos, 2) === "*/") {
              result2 = "*/";
              pos += 2;
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("\"*/\"");
              }
            }
            reportFailures--;
            if (result2 === null) {
              result2 = "";
            } else {
              result2 = null;
              pos = pos2;
            }
            if (result2 !== null) {
              if (input.length > pos) {
                result3 = input.charAt(pos);
                pos++;
              } else {
                result3 = null;
                if (reportFailures === 0) {
                  matchFailed("any character");
                }
              }
              if (result3 !== null) {
                result2 = [result2, result3];
              } else {
                result2 = null;
                pos = pos1;
              }
            } else {
              result2 = null;
              pos = pos1;
            }
          }
          if (result1 !== null) {
            if (input.substr(pos, 2) === "*/") {
              result2 = "*/";
              pos += 2;
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("\"*/\"");
              }
            }
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos0;
            }
          } else {
            result0 = null;
            pos = pos0;
          }
        } else {
          result0 = null;
          pos = pos0;
        }
        return result0;
      }
      
      function parse_eol() {
        var result0;
        
        reportFailures++;
        if (input.charCodeAt(pos) === 10) {
          result0 = "\n";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"\\n\"");
          }
        }
        if (result0 === null) {
          if (input.substr(pos, 2) === "\r\n") {
            result0 = "\r\n";
            pos += 2;
          } else {
            result0 = null;
            if (reportFailures === 0) {
              matchFailed("\"\\r\\n\"");
            }
          }
          if (result0 === null) {
            if (input.charCodeAt(pos) === 13) {
              result0 = "\r";
              pos++;
            } else {
              result0 = null;
              if (reportFailures === 0) {
                matchFailed("\"\\r\"");
              }
            }
            if (result0 === null) {
              if (input.charCodeAt(pos) === 8232) {
                result0 = "\u2028";
                pos++;
              } else {
                result0 = null;
                if (reportFailures === 0) {
                  matchFailed("\"\\u2028\"");
                }
              }
              if (result0 === null) {
                if (input.charCodeAt(pos) === 8233) {
                  result0 = "\u2029";
                  pos++;
                } else {
                  result0 = null;
                  if (reportFailures === 0) {
                    matchFailed("\"\\u2029\"");
                  }
                }
              }
            }
          }
        }
        reportFailures--;
        if (reportFailures === 0 && result0 === null) {
          matchFailed("end of line");
        }
        return result0;
      }
      
      function parse_eolChar() {
        var result0;
        
        if (/^[\n\r\u2028\u2029]/.test(input.charAt(pos))) {
          result0 = input.charAt(pos);
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("[\\n\\r\\u2028\\u2029]");
          }
        }
        return result0;
      }
      
      function parse_whitespace() {
        var result0;
        
        reportFailures++;
        if (/^[ \t\x0B\f\xA0\uFEFF\u1680\u180E\u2000-\u200A\u202F\u205F\u3000]/.test(input.charAt(pos))) {
          result0 = input.charAt(pos);
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("[ \\t\\x0B\\f\\xA0\\uFEFF\\u1680\\u180E\\u2000-\\u200A\\u202F\\u205F\\u3000]");
          }
        }
        reportFailures--;
        if (reportFailures === 0 && result0 === null) {
          matchFailed("whitespace");
        }
        return result0;
      }
      
      
      function cleanupExpected(expected) {
        expected.sort();
        
        var lastExpected = null;
        var cleanExpected = [];
        for (var i = 0; i < expected.length; i++) {
          if (expected[i] !== lastExpected) {
            cleanExpected.push(expected[i]);
            lastExpected = expected[i];
          }
        }
        return cleanExpected;
      }
      
      function computeErrorPosition() {
        /*
         * The first idea was to use |String.split| to break the input up to the
         * error position along newlines and derive the line and column from
         * there. However IE's |split| implementation is so broken that it was
         * enough to prevent it.
         */
        
        var line = 1;
        var column = 1;
        var seenCR = false;
        
        for (var i = 0; i < Math.max(pos, rightmostFailuresPos); i++) {
          var ch = input.charAt(i);
          if (ch === "\n") {
            if (!seenCR) { line++; }
            column = 1;
            seenCR = false;
          } else if (ch === "\r" || ch === "\u2028" || ch === "\u2029") {
            line++;
            column = 1;
            seenCR = true;
          } else {
            column++;
            seenCR = false;
          }
        }
        
        return { line: line, column: column };
      }
      
      
      var result = parseFunctions[startRule]();
      
      /*
       * The parser is now in one of the following three states:
       *
       * 1. The parser successfully parsed the whole input.
       *
       *    - |result !== null|
       *    - |pos === input.length|
       *    - |rightmostFailuresExpected| may or may not contain something
       *
       * 2. The parser successfully parsed only a part of the input.
       *
       *    - |result !== null|
       *    - |pos < input.length|
       *    - |rightmostFailuresExpected| may or may not contain something
       *
       * 3. The parser did not successfully parse any part of the input.
       *
       *   - |result === null|
       *   - |pos === 0|
       *   - |rightmostFailuresExpected| contains at least one failure
       *
       * All code following this comment (including called functions) must
       * handle these states.
       */
      if (result === null || pos !== input.length) {
        var offset = Math.max(pos, rightmostFailuresPos);
        var found = offset < input.length ? input.charAt(offset) : null;
        var errorPosition = computeErrorPosition();
        
        throw new this.SyntaxError(
          cleanupExpected(rightmostFailuresExpected),
          found,
          offset,
          errorPosition.line,
          errorPosition.column
        );
      }
      
      return result;
    },
    
    /* Returns the parser source code. */
    toSource: function() { return this._source; }
  };
  
  /* Thrown when a parser encounters a syntax error. */
  
  result.SyntaxError = function(expected, found, offset, line, column) {
    function buildMessage(expected, found) {
      var expectedHumanized, foundHumanized;
      
      switch (expected.length) {
        case 0:
          expectedHumanized = "end of input";
          break;
        case 1:
          expectedHumanized = expected[0];
          break;
        default:
          expectedHumanized = expected.slice(0, expected.length - 1).join(", ")
            + " or "
            + expected[expected.length - 1];
      }
      
      foundHumanized = found ? quote(found) : "end of input";
      
      return "Expected " + expectedHumanized + " but " + foundHumanized + " found.";
    }
    
    this.name = "SyntaxError";
    this.expected = expected;
    this.found = found;
    this.message = buildMessage(expected, found);
    this.offset = offset;
    this.line = line;
    this.column = column;
  };
  
  result.SyntaxError.prototype = Error.prototype;
  
  return result;
})();
PEG.compiler = {
  /*
   * Names of passes that will get run during the compilation (in the specified
   * order).
   */
  appliedPassNames: [
    "reportMissingRules",
    "reportLeftRecursion",
    "removeProxyRules",
    "computeVarNames",
    "computeParams"
  ],

  /*
   * Generates a parser from a specified grammar AST. Throws |PEG.GrammarError|
   * if the AST contains a semantic error. Note that not all errors are detected
   * during the generation and some may protrude to the generated parser and
   * cause its malfunction.
   */
  compile: function(ast, options) {
    var that = this;

    each(this.appliedPassNames, function(passName) {
      that.passes[passName](ast);
    });

    var source = this.emitter(ast, options);
    var result = eval(source);
    result._source = source;

    return result;
  }
};

/*
 * Compiler passes.
 *
 * Each pass is a function that is passed the AST. It can perform checks on it
 * or modify it as needed. If the pass encounters a semantic error, it throws
 * |PEG.GrammarError|.
 */
PEG.compiler.passes = {
  /* Checks that all referenced rules exist. */
  reportMissingRules: function(ast) {
    function nop() {}

    function checkExpression(node) { check(node.expression); }

    function checkSubnodes(propertyName) {
      return function(node) { each(node[propertyName], check); };
    }

    var check = buildNodeVisitor({
      grammar:      checkSubnodes("rules"),
      rule:         checkExpression,
      choice:       checkSubnodes("alternatives"),
      sequence:     checkSubnodes("elements"),
      labeled:      checkExpression,
      simple_and:   checkExpression,
      simple_not:   checkExpression,
      semantic_and: nop,
      semantic_not: nop,
      optional:     checkExpression,
      zero_or_more: checkExpression,
      one_or_more:  checkExpression,
      action:       checkExpression,

      rule_ref:
        function(node) {
          if (!findRuleByName(ast, node.name)) {
            throw new PEG.GrammarError(
              "Referenced rule \"" + node.name + "\" does not exist."
            );
          }
        },

      literal:      nop,
      any:          nop,
      "class":      nop
    });

    check(ast);
  },

  /* Checks that no left recursion is present. */
  reportLeftRecursion: function(ast) {
    function nop() {}

    function checkExpression(node, appliedRules) {
      check(node.expression, appliedRules);
    }

    function checkSubnodes(propertyName) {
      return function(node, appliedRules) {
        each(node[propertyName], function(subnode) {
          check(subnode, appliedRules);
        });
      };
    }

    var check = buildNodeVisitor({
      grammar:     checkSubnodes("rules"),

      rule:
        function(node, appliedRules) {
          check(node.expression, appliedRules.concat(node.name));
        },

      choice:      checkSubnodes("alternatives"),

      sequence:
        function(node, appliedRules) {
          if (node.elements.length > 0) {
            check(node.elements[0], appliedRules);
          }
        },

      labeled:      checkExpression,
      simple_and:   checkExpression,
      simple_not:   checkExpression,
      semantic_and: nop,
      semantic_not: nop,
      optional:     checkExpression,
      zero_or_more: checkExpression,
      one_or_more:  checkExpression,
      action:       checkExpression,

      rule_ref:
        function(node, appliedRules) {
          if (contains(appliedRules, node.name)) {
            throw new PEG.GrammarError(
              "Left recursion detected for rule \"" + node.name + "\"."
            );
          }
          check(findRuleByName(ast, node.name), appliedRules);
        },

      literal:      nop,
      any:          nop,
      "class":      nop
    });

    check(ast, []);
  },

  /*
   * Removes proxy rules -- that is, rules that only delegate to other rule.
   */
  removeProxyRules: function(ast) {
    function isProxyRule(node) {
      return node.type === "rule" && node.expression.type === "rule_ref";
    }

    function replaceRuleRefs(ast, from, to) {
      function nop() {}

      function replaceInExpression(node, from, to) {
        replace(node.expression, from, to);
      }

      function replaceInSubnodes(propertyName) {
        return function(node, from, to) {
          each(node[propertyName], function(subnode) {
            replace(subnode, from, to);
          });
        };
      }

      var replace = buildNodeVisitor({
        grammar:      replaceInSubnodes("rules"),
        rule:         replaceInExpression,
        choice:       replaceInSubnodes("alternatives"),
        sequence:     replaceInSubnodes("elements"),
        labeled:      replaceInExpression,
        simple_and:   replaceInExpression,
        simple_not:   replaceInExpression,
        semantic_and: nop,
        semantic_not: nop,
        optional:     replaceInExpression,
        zero_or_more: replaceInExpression,
        one_or_more:  replaceInExpression,
        action:       replaceInExpression,

        rule_ref:
          function(node, from, to) {
            if (node.name === from) {
              node.name = to;
            }
          },

        literal:      nop,
        any:          nop,
        "class":      nop
      });

      replace(ast, from, to);
    }

    var indices = [];

    each(ast.rules, function(rule, i) {
      if (isProxyRule(rule)) {
        replaceRuleRefs(ast, rule.name, rule.expression.name);
        if (rule.name === ast.startRule) {
          ast.startRule = rule.expression.name;
        }
        indices.push(i);
      }
    });

    indices.reverse();

    each(indices, function(index) {
      ast.rules.splice(index, 1);
    });
  },

  /*
   * Computes names of variables used for storing match results and parse
   * positions in generated code. These variables are organized as two stacks.
   * The following will hold after running this pass:
   *
   *   * All nodes except "grammar" and "rule" nodes will have a |resultVar|
   *     property. It will contain a name of the variable that will store a
   *     match result of the expression represented by the node in generated
   *     code.
   *
   *   * Some nodes will have a |posVar| property. It will contain a name of the
   *     variable that will store a parse position in generated code.
   *
   *   * All "rule" nodes will contain |resultVars| and |posVars| properties.
   *     They will contain a list of values of |resultVar| and |posVar|
   *     properties used in rule's subnodes. (This is useful to declare
   *     variables in generated code.)
   */
  computeVarNames: function(ast) {
    function resultVar(index) { return "result" + index; }
    function posVar(index)    { return "pos"    + index; }

    function computeLeaf(node, index) {
      node.resultVar = resultVar(index.result);

      return { result: 0, pos: 0 };
    }

    function computeFromExpression(delta) {
      return function(node, index) {
        var depth = compute(
              node.expression,
              {
                result: index.result + delta.result,
                pos:    index.pos    + delta.pos
              }
            );

        node.resultVar = resultVar(index.result);
        if (delta.pos !== 0) {
          node.posVar = posVar(index.pos);
        }

        return {
          result: depth.result + delta.result,
          pos:    depth.pos    + delta.pos
        };
      };
    }

    var compute = buildNodeVisitor({
      grammar:
        function(node, index) {
          each(node.rules, function(node) {
            compute(node, index);
          });
        },

      rule:
        function(node, index) {
          var depth = compute(node.expression, index);

          node.resultVar  = resultVar(index.result);
          node.resultVars = map(range(depth.result + 1), resultVar);
          node.posVars    = map(range(depth.pos),        posVar);
        },

      choice:
        function(node, index) {
          var depths = map(node.alternatives, function(alternative) {
            return compute(alternative, index);
          });

          node.resultVar = resultVar(index.result);

          return {
            result: Math.max.apply(null, pluck(depths, "result")),
            pos:    Math.max.apply(null, pluck(depths, "pos"))
          };
        },

      sequence:
        function(node, index) {
          var depths = map(node.elements, function(element, i) {
            return compute(
              element,
              { result: index.result + i, pos: index.pos + 1 }
            );
          });

          node.resultVar = resultVar(index.result);
          node.posVar    = posVar(index.pos);

          return {
            result:
              node.elements.length > 0
                ? Math.max.apply(
                    null,
                    map(depths, function(d, i) { return i + d.result; })
                  )
                : 0,

            pos:
              node.elements.length > 0
                ? 1 + Math.max.apply(null, pluck(depths, "pos"))
                : 1
          };
        },

      labeled:      computeFromExpression({ result: 0, pos: 0 }),
      simple_and:   computeFromExpression({ result: 0, pos: 1 }),
      simple_not:   computeFromExpression({ result: 0, pos: 1 }),
      semantic_and: computeLeaf,
      semantic_not: computeLeaf,
      optional:     computeFromExpression({ result: 0, pos: 0 }),
      zero_or_more: computeFromExpression({ result: 1, pos: 0 }),
      one_or_more:  computeFromExpression({ result: 1, pos: 0 }),
      action:       computeFromExpression({ result: 0, pos: 1 }),
      rule_ref:     computeLeaf,
      literal:      computeLeaf,
      any:          computeLeaf,
      "class":      computeLeaf
    });

    compute(ast, { result: 0, pos: 0 });
  },

  /*
   * This pass walks through the AST and tracks what labels are visible at each
   * point. For "action", "semantic_and" and "semantic_or" nodes it computes
   * parameter names and values for the function used in generated code. (In the
   * emitter, user's code is wrapped into a function that is immediately
   * executed. Its parameter names correspond to visible labels and its
   * parameter values to their captured values). Implicitly, this pass defines
   * scoping rules for labels.
   *
   * After running this pass, all "action", "semantic_and" and "semantic_or"
   * nodes will have a |params| property containing an object mapping parameter
   * names to the expressions that will be used as their values.
   */
  computeParams: function(ast) {
    var envs = [];

    function scoped(f) {
      envs.push({});
      f();
      envs.pop();
    }

    function nop() {}

    function computeForScopedExpression(node) {
      scoped(function() { compute(node.expression); });
    }

    function computeParams(node) {
      var env = envs[envs.length - 1], params = {}, name;

      for (name in env) {
        params[name] = env[name];
      }
      node.params = params;
    }

    var compute = buildNodeVisitor({
      grammar:
        function(node) {
          each(node.rules, compute);
        },

      rule:         computeForScopedExpression,

      choice:
        function(node) {
          scoped(function() { each(node.alternatives, compute); });
        },

      sequence:
        function(node) {
          var env = envs[envs.length - 1], name;

          function fixup(name) {
            each(pluck(node.elements, "resultVar"), function(resultVar, i) {
              if ((new RegExp("^" + resultVar + "(\\[\\d+\\])*$")).test(env[name])) {
                env[name] = node.resultVar + "[" + i + "]"
                          + env[name].substr(resultVar.length);
              }
            });
          }

          each(node.elements, compute);

          for (name in env) {
            fixup(name);
          }
        },

      labeled:
        function(node) {
          envs[envs.length - 1][node.label] = node.resultVar;

          scoped(function() { compute(node.expression); });
        },

      simple_and:   computeForScopedExpression,
      simple_not:   computeForScopedExpression,
      semantic_and: computeParams,
      semantic_not: computeParams,
      optional:     computeForScopedExpression,
      zero_or_more: computeForScopedExpression,
      one_or_more:  computeForScopedExpression,

      action:
        function(node) {
          scoped(function() {
            compute(node.expression);
            computeParams(node);
          });
        },

      rule_ref:     nop,
      literal:      nop,
      any:          nop,
      "class":      nop
    });

    compute(ast);
  }
};
/* Emits the generated code for the AST. */
PEG.compiler.emitter = function(ast, options) {
  options = options || {};
  if (options.cache === undefined) {
    options.cache = false;
  }
  if (options.trackLineAndColumn === undefined) {
    options.trackLineAndColumn = false;
  }

  /*
   * Codie 1.1.0
   *
   * https://github.com/dmajda/codie
   *
   * Copyright (c) 2011-2012 David Majda
   * Licensend under the MIT license.
   */
  var Codie = (function(undefined) {

  function stringEscape(s) {
    function hex(ch) { return ch.charCodeAt(0).toString(16).toUpperCase(); }

    /*
     * ECMA-262, 5th ed., 7.8.4: All characters may appear literally in a
     * string literal except for the closing quote character, backslash,
     * carriage return, line separator, paragraph separator, and line feed.
     * Any character may appear in the form of an escape sequence.
     *
     * For portability, we also escape escape all control and non-ASCII
     * characters. Note that "\0" and "\v" escape sequences are not used
     * because JSHint does not like the first and IE the second.
     */
    return s
      .replace(/\\/g,   '\\\\') // backslash
      .replace(/"/g,    '\\"')  // closing double quote
      .replace(/\x08/g, '\\b')  // backspace
      .replace(/\t/g,   '\\t')  // horizontal tab
      .replace(/\n/g,   '\\n')  // line feed
      .replace(/\f/g,   '\\f')  // form feed
      .replace(/\r/g,   '\\r')  // carriage return
      .replace(/[\x00-\x07\x0B\x0E\x0F]/g, function(ch) { return '\\x0' + hex(ch); })
      .replace(/[\x10-\x1F\x80-\xFF]/g,    function(ch) { return '\\x'  + hex(ch); })
      .replace(/[\u0180-\u0FFF]/g,         function(ch) { return '\\u0' + hex(ch); })
      .replace(/[\u1080-\uFFFF]/g,         function(ch) { return '\\u'  + hex(ch); });
  }

  function push(s) { return '__p.push(' + s + ');'; }

  function pushRaw(template, length, state) {
    function unindent(code, level, unindentFirst) {
      return code.replace(
        new RegExp('^.{' + level +'}', "gm"),
        function(str, offset) {
          if (offset === 0) {
            return unindentFirst ? '' : str;
          } else {
            return "";
          }
        }
      );
    }

    var escaped = stringEscape(unindent(
          template.substring(0, length),
          state.indentLevel(),
          state.atBOL
        ));

    return escaped.length > 0 ? push('"' + escaped + '"') : '';
  }


  var Codie = {
    /* Codie version (uses semantic versioning). */
    VERSION: "1.1.0",

    /*
     * Specifies by how many characters do #if/#else and #for unindent their
     * content in the generated code.
     */
    indentStep: 2,

    /* Description of #-commands. Extend to define your own commands. */
    commands: {
      "if":   {
        params:  /^(.*)$/,
        compile: function(state, prefix, params) {
          return ['if(' + params[0] + '){', []];
        },
        stackOp: "push"
      },
      "else": {
        params:  /^$/,
        compile: function(state) {
          var stack = state.commandStack,
              insideElse = stack[stack.length - 1] === "else",
              insideIf   = stack[stack.length - 1] === "if";

          if (insideElse) { throw new Error("Multiple #elses."); }
          if (!insideIf)  { throw new Error("Using #else outside of #if."); }

          return ['}else{', []];
        },
        stackOp: "replace"
      },
      "for":  {
        params:  /^([a-zA-Z_][a-zA-Z0-9_]*)[ \t]+in[ \t]+(.*)$/,
        init:    function(state) {
          state.forCurrLevel = 0;  // current level of #for loop nesting
          state.forMaxLevel  = 0;  // maximum level of #for loop nesting
        },
        compile: function(state, prefix, params) {
          var c = '__c' + state.forCurrLevel, // __c for "collection"
              l = '__l' + state.forCurrLevel, // __l for "length"
              i = '__i' + state.forCurrLevel; // __i for "index"

          state.forCurrLevel++;
          if (state.forMaxLevel < state.forCurrLevel) {
            state.forMaxLevel = state.forCurrLevel;
          }

          return [
            c + '=' + params[1] + ';'
              + l + '=' + c + '.length;'
              + 'for(' + i + '=0;' + i + '<' + l + ';' + i + '++){'
              + params[0] + '=' + c + '[' + i + '];',
            [params[0], c, l, i]
          ];
        },
        exit:    function(state) { state.forCurrLevel--; },
        stackOp: "push"
      },
      "end":  {
        params:  /^$/,
        compile: function(state) {
          var stack = state.commandStack, exit;

          if (stack.length === 0) { throw new Error("Too many #ends."); }

          exit = Codie.commands[stack[stack.length - 1]].exit;
          if (exit) { exit(state); }

          return ['}', []];
        },
        stackOp: "pop"
      },
      "block": {
        params: /^(.*)$/,
        compile: function(state, prefix, params) {
          var x = '__x', // __x for "prefix",
              n = '__n', // __n for "lines"
              l = '__l', // __l for "length"
              i = '__i'; // __i for "index"

          /*
           * Originally, the generated code used |String.prototype.replace|, but
           * it is buggy in certain versions of V8 so it was rewritten. See the
           * tests for details.
           */
          return [
            x + '="' + stringEscape(prefix.substring(state.indentLevel())) + '";'
              + n + '=(' + params[0] + ').toString().split("\\n");'
              + l + '=' + n + '.length;'
              + 'for(' + i + '=0;' + i + '<' + l + ';' + i + '++){'
              + n + '[' + i +']=' + x + '+' + n + '[' + i + ']+"\\n";'
              + '}'
              + push(n + '.join("")'),
            [x, n, l, i]
          ];
        },
        stackOp: "nop"
      }
    },

    /*
     * Compiles a template into a function. When called, this function will
     * execute the template in the context of an object passed in a parameter and
     * return the result.
     */
    template: function(template) {
      var stackOps = {
        push:    function(stack, name) { stack.push(name); },
        replace: function(stack, name) { stack[stack.length - 1] = name; },
        pop:     function(stack)       { stack.pop(); },
        nop:     function()            { }
      };

      function compileExpr(state, expr) {
        state.atBOL = false;
        return [push(expr), []];
      }

      function compileCommand(state, prefix, name, params) {
        var command, match, result;

        command = Codie.commands[name];
        if (!command) { throw new Error("Unknown command: #" + name + "."); }

        match = command.params.exec(params);
        if (match === null) {
          throw new Error(
            "Invalid params for command #" + name + ": " + params + "."
          );
        }

        result = command.compile(state, prefix, match.slice(1));
        stackOps[command.stackOp](state.commandStack, name);
        state.atBOL = true;
        return result;
      }

      var state = {               // compilation state
            commandStack: [],     //   stack of commands as they were nested
            atBOL:        true,   //   is the next character to process at BOL?
            indentLevel:  function() {
              return Codie.indentStep * this.commandStack.length;
            }
          },
          code = '',              // generated template function code
          vars = ['__p=[]'],      // variables used by generated code
          name, match, result, i;

      /* Initialize state. */
      for (name in Codie.commands) {
        if (Codie.commands[name].init) { Codie.commands[name].init(state); }
      }

      /* Compile the template. */
      while ((match = /^([ \t]*)#([a-zA-Z_][a-zA-Z0-9_]*)(?:[ \t]+([^ \t\n][^\n]*))?[ \t]*(?:\n|$)|#\{([^}]*)\}/m.exec(template)) !== null) {
        code += pushRaw(template, match.index, state);
        result = match[2] !== undefined && match[2] !== ""
          ? compileCommand(state, match[1], match[2], match[3] || "") // #-command
          : compileExpr(state, match[4]);                             // #{...}
        code += result[0];
        vars = vars.concat(result[1]);
        template = template.substring(match.index + match[0].length);
      }
      code += pushRaw(template, template.length, state);

      /* Check the final state. */
      if (state.commandStack.length > 0) { throw new Error("Missing #end."); }

      /* Sanitize the list of variables used by commands. */
      vars.sort();
      for (i = 0; i < vars.length; i++) {
        if (vars[i] === vars[i - 1]) { vars.splice(i--, 1); }
      }

      /* Create the resulting function. */
      return new Function("__v", [
        '__v=__v||{};',
        'var ' + vars.join(',') + ';',
        'with(__v){',
        code,
        'return __p.join("").replace(/^\\n+|\\n+$/g,"");};'
      ].join(''));
    }
  };

  return Codie;

  })();

  var templates = (function() {
    var name,
        templates = {},
        sources = {
          grammar: [
            '(function(){',
            '  /*',
            '   * Generated by PEG.js 0.7.0.',
            '   *',
            '   * http://pegjs.majda.cz/',
            '   */',
            '  ',
            /* This needs to be in sync with |quote| in utils.js. */
            '  function quote(s) {',
            '    /*',
            '     * ECMA-262, 5th ed., 7.8.4: All characters may appear literally in a',
            '     * string literal except for the closing quote character, backslash,',
            '     * carriage return, line separator, paragraph separator, and line feed.',
            '     * Any character may appear in the form of an escape sequence.',
            '     *',
            '     * For portability, we also escape escape all control and non-ASCII',
            '     * characters. Note that "\\0" and "\\v" escape sequences are not used',
            '     * because JSHint does not like the first and IE the second.',
            '     */',
            '     return \'"\' + s',
            '      .replace(/\\\\/g, \'\\\\\\\\\')  // backslash',
            '      .replace(/"/g, \'\\\\"\')    // closing quote character',
            '      .replace(/\\x08/g, \'\\\\b\') // backspace',
            '      .replace(/\\t/g, \'\\\\t\')   // horizontal tab',
            '      .replace(/\\n/g, \'\\\\n\')   // line feed',
            '      .replace(/\\f/g, \'\\\\f\')   // form feed',
            '      .replace(/\\r/g, \'\\\\r\')   // carriage return',
            '      .replace(/[\\x00-\\x07\\x0B\\x0E-\\x1F\\x80-\\uFFFF]/g, escape)',
            '      + \'"\';',
            '  }',
            '  ',
            '  var result = {',
            '    /*',
            '     * Parses the input with a generated parser. If the parsing is successfull,',
            '     * returns a value explicitly or implicitly specified by the grammar from',
            '     * which the parser was generated (see |PEG.buildParser|). If the parsing is',
            '     * unsuccessful, throws |PEG.parser.SyntaxError| describing the error.',
            '     */',
            '    parse: function(input, startRule) {',
            '      var parseFunctions = {',
            '        #for rule in node.rules',
            '          #{string(rule.name) + ": parse_" + rule.name + (rule !== node.rules[node.rules.length - 1] ? "," : "")}',
            '        #end',
            '      };',
            '      ',
            '      if (startRule !== undefined) {',
            '        if (parseFunctions[startRule] === undefined) {',
            '          throw new Error("Invalid rule name: " + quote(startRule) + ".");',
            '        }',
            '      } else {',
            '        startRule = #{string(node.startRule)};',
            '      }',
            '      ',
            '      #{posInit("pos")};',
            '      var reportFailures = 0;', // 0 = report, anything > 0 = do not report
            '      #{posInit("rightmostFailuresPos")};',
            '      var rightmostFailuresExpected = [];',
            '      #if options.cache',
            '        var cache = {};',
            '      #end',
            '      ',
            /* This needs to be in sync with |padLeft| in utils.js. */
            '      function padLeft(input, padding, length) {',
            '        var result = input;',
            '        ',
            '        var padLength = length - input.length;',
            '        for (var i = 0; i < padLength; i++) {',
            '          result = padding + result;',
            '        }',
            '        ',
            '        return result;',
            '      }',
            '      ',
            /* This needs to be in sync with |escape| in utils.js. */
            '      function escape(ch) {',
            '        var charCode = ch.charCodeAt(0);',
            '        var escapeChar;',
            '        var length;',
            '        ',
            '        if (charCode <= 0xFF) {',
            '          escapeChar = \'x\';',
            '          length = 2;',
            '        } else {',
            '          escapeChar = \'u\';',
            '          length = 4;',
            '        }',
            '        ',
            '        return \'\\\\\' + escapeChar + padLeft(charCode.toString(16).toUpperCase(), \'0\', length);',
            '      }',
            '      ',
            '      #if options.trackLineAndColumn',
            '        function clone(object) {',
            '          var result = {};',
            '          for (var key in object) {',
            '            result[key] = object[key];',
            '          }',
            '          return result;',
            '        }',
            '        ',
            '        function advance(pos, n) {',
            '          var endOffset = pos.offset + n;',
            '          ',
            '          for (var offset = pos.offset; offset < endOffset; offset++) {',
            '            var ch = input.charAt(offset);',
            '            if (ch === "\\n") {',
            '              if (!pos.seenCR) { pos.line++; }',
            '              pos.column = 1;',
            '              pos.seenCR = false;',
            '            } else if (ch === "\\r" || ch === "\\u2028" || ch === "\\u2029") {',
            '              pos.line++;',
            '              pos.column = 1;',
            '              pos.seenCR = true;',
            '            } else {',
            '              pos.column++;',
            '              pos.seenCR = false;',
            '            }',
            '          }',
            '          ',
            '          pos.offset += n;',
            '        }',
            '        ',
            '      #end',
            '      function matchFailed(failure) {',
            '        if (#{posOffset("pos")} < #{posOffset("rightmostFailuresPos")}) {',
            '          return;',
            '        }',
            '        ',
            '        if (#{posOffset("pos")} > #{posOffset("rightmostFailuresPos")}) {',
            '          rightmostFailuresPos = #{posClone("pos")};',
            '          rightmostFailuresExpected = [];',
            '        }',
            '        ',
            '        rightmostFailuresExpected.push(failure);',
            '      }',
            '      ',
            '      #for rule in node.rules',
            '        #block emit(rule)',
            '        ',
            '      #end',
            '      ',
            '      function cleanupExpected(expected) {',
            '        expected.sort();',
            '        ',
            '        var lastExpected = null;',
            '        var cleanExpected = [];',
            '        for (var i = 0; i < expected.length; i++) {',
            '          if (expected[i] !== lastExpected) {',
            '            cleanExpected.push(expected[i]);',
            '            lastExpected = expected[i];',
            '          }',
            '        }',
            '        return cleanExpected;',
            '      }',
            '      ',
            '      #if !options.trackLineAndColumn',
            '        function computeErrorPosition() {',
            '          /*',
            '           * The first idea was to use |String.split| to break the input up to the',
            '           * error position along newlines and derive the line and column from',
            '           * there. However IE\'s |split| implementation is so broken that it was',
            '           * enough to prevent it.',
            '           */',
            '          ',
            '          var line = 1;',
            '          var column = 1;',
            '          var seenCR = false;',
            '          ',
            '          for (var i = 0; i < Math.max(pos, rightmostFailuresPos); i++) {',
            '            var ch = input.charAt(i);',
            '            if (ch === "\\n") {',
            '              if (!seenCR) { line++; }',
            '              column = 1;',
            '              seenCR = false;',
            '            } else if (ch === "\\r" || ch === "\\u2028" || ch === "\\u2029") {',
            '              line++;',
            '              column = 1;',
            '              seenCR = true;',
            '            } else {',
            '              column++;',
            '              seenCR = false;',
            '            }',
            '          }',
            '          ',
            '          return { line: line, column: column };',
            '        }',
            '      #end',
            '      ',
            '      #if node.initializer',
            '        #block emit(node.initializer)',
            '      #end',
            '      ',
            '      var result = parseFunctions[startRule]();',
            '      ',
            '      /*',
            '       * The parser is now in one of the following three states:',
            '       *',
            '       * 1. The parser successfully parsed the whole input.',
            '       *',
            '       *    - |result !== null|',
            '       *    - |#{posOffset("pos")} === input.length|',
            '       *    - |rightmostFailuresExpected| may or may not contain something',
            '       *',
            '       * 2. The parser successfully parsed only a part of the input.',
            '       *',
            '       *    - |result !== null|',
            '       *    - |#{posOffset("pos")} < input.length|',
            '       *    - |rightmostFailuresExpected| may or may not contain something',
            '       *',
            '       * 3. The parser did not successfully parse any part of the input.',
            '       *',
            '       *   - |result === null|',
            '       *   - |#{posOffset("pos")} === 0|',
            '       *   - |rightmostFailuresExpected| contains at least one failure',
            '       *',
            '       * All code following this comment (including called functions) must',
            '       * handle these states.',
            '       */',
            '      if (result === null || #{posOffset("pos")} !== input.length) {',
            '        var offset = Math.max(#{posOffset("pos")}, #{posOffset("rightmostFailuresPos")});',
            '        var found = offset < input.length ? input.charAt(offset) : null;',
            '        #if options.trackLineAndColumn',
            '          var errorPosition = #{posOffset("pos")} > #{posOffset("rightmostFailuresPos")} ? pos : rightmostFailuresPos;',
            '        #else',
            '          var errorPosition = computeErrorPosition();',
            '        #end',
            '        ',
            '        throw new this.SyntaxError(',
            '          cleanupExpected(rightmostFailuresExpected),',
            '          found,',
            '          offset,',
            '          errorPosition.line,',
            '          errorPosition.column',
            '        );',
            '      }',
            '      ',
            '      return result;',
            '    },',
            '    ',
            '    /* Returns the parser source code. */',
            '    toSource: function() { return this._source; }',
            '  };',
            '  ',
            '  /* Thrown when a parser encounters a syntax error. */',
            '  ',
            '  result.SyntaxError = function(expected, found, offset, line, column) {',
            '    function buildMessage(expected, found) {',
            '      var expectedHumanized, foundHumanized;',
            '      ',
            '      switch (expected.length) {',
            '        case 0:',
            '          expectedHumanized = "end of input";',
            '          break;',
            '        case 1:',
            '          expectedHumanized = expected[0];',
            '          break;',
            '        default:',
            '          expectedHumanized = expected.slice(0, expected.length - 1).join(", ")',
            '            + " or "',
            '            + expected[expected.length - 1];',
            '      }',
            '      ',
            '      foundHumanized = found ? quote(found) : "end of input";',
            '      ',
            '      return "Expected " + expectedHumanized + " but " + foundHumanized + " found.";',
            '    }',
            '    ',
            '    this.name = "SyntaxError";',
            '    this.expected = expected;',
            '    this.found = found;',
            '    this.message = buildMessage(expected, found);',
            '    this.offset = offset;',
            '    this.line = line;',
            '    this.column = column;',
            '  };',
            '  ',
            '  result.SyntaxError.prototype = Error.prototype;',
            '  ',
            '  return result;',
            '})()'
          ],
          rule: [
            'function parse_#{node.name}() {',
            '  #if options.cache',
            '    var cacheKey = "#{node.name}@" + #{posOffset("pos")};',
            '    var cachedResult = cache[cacheKey];',
            '    if (cachedResult) {',
            '      pos = #{posClone("cachedResult.nextPos")};',
            '      return cachedResult.result;',
            '    }',
            '    ',
            '  #end',
            '  #if node.resultVars.length > 0',
            '    var #{node.resultVars.join(", ")};',
            '  #end',
            '  #if node.posVars.length > 0',
            '    var #{node.posVars.join(", ")};',
            '  #end',
            '  ',
            '  #if node.displayName !== null',
            '    reportFailures++;',
            '  #end',
            '  #block emit(node.expression)',
            '  #if node.displayName !== null',
            '    reportFailures--;',
            '    if (reportFailures === 0 && #{node.resultVar} === null) {',
            '      matchFailed(#{string(node.displayName)});',
            '    }',
            '  #end',
            '  #if options.cache',
            '    ',
            '    cache[cacheKey] = {',
            '      nextPos: #{posClone("pos")},',
            '      result:  #{node.resultVar}',
            '    };',
            '  #end',
            '  return #{node.resultVar};',
            '}'
          ],
          choice: [
            '#block emit(alternative)',
            '#block nextAlternativesCode'
          ],
          "choice.next": [
            'if (#{node.resultVar} === null) {',
            '  #block code',
            '}'
          ],
          sequence: [
            '#{posSave(node)};',
            '#block code'
          ],
          "sequence.iteration": [
            '#block emit(element)',
            'if (#{element.resultVar} !== null) {',
            '  #block code',
            '} else {',
            '  #{node.resultVar} = null;',
            '  #{posRestore(node)};',
            '}'
          ],
          "sequence.inner": [
            '#{node.resultVar} = [#{pluck(node.elements, "resultVar").join(", ")}];'
          ],
          simple_and: [
            '#{posSave(node)};',
            'reportFailures++;',
            '#block emit(node.expression)',
            'reportFailures--;',
            'if (#{node.resultVar} !== null) {',
            '  #{node.resultVar} = "";',
            '  #{posRestore(node)};',
            '} else {',
            '  #{node.resultVar} = null;',
            '}'
          ],
          simple_not: [
            '#{posSave(node)};',
            'reportFailures++;',
            '#block emit(node.expression)',
            'reportFailures--;',
            'if (#{node.resultVar} === null) {',
            '  #{node.resultVar} = "";',
            '} else {',
            '  #{node.resultVar} = null;',
            '  #{posRestore(node)};',
            '}'
          ],
          semantic_and: [
            '#{node.resultVar} = (function(#{(options.trackLineAndColumn ? ["offset", "line", "column"] : ["offset"]).concat(keys(node.params)).join(", ")}) {#{node.code}})(#{(options.trackLineAndColumn ? ["pos.offset", "pos.line", "pos.column"] : ["pos"]).concat(values(node.params)).join(", ")}) ? "" : null;'
          ],
          semantic_not: [
            '#{node.resultVar} = (function(#{(options.trackLineAndColumn ? ["offset", "line", "column"] : ["offset"]).concat(keys(node.params)).join(", ")}) {#{node.code}})(#{(options.trackLineAndColumn ? ["pos.offset", "pos.line", "pos.column"] : ["pos"]).concat(values(node.params)).join(", ")}) ? null : "";'
          ],
          optional: [
            '#block emit(node.expression)',
            '#{node.resultVar} = #{node.resultVar} !== null ? #{node.resultVar} : "";'
          ],
          zero_or_more: [
            '#{node.resultVar} = [];',
            '#block emit(node.expression)',
            'while (#{node.expression.resultVar} !== null) {',
            '  #{node.resultVar}.push(#{node.expression.resultVar});',
            '  #block emit(node.expression)',
            '}'
          ],
          one_or_more: [
            '#block emit(node.expression)',
            'if (#{node.expression.resultVar} !== null) {',
            '  #{node.resultVar} = [];',
            '  while (#{node.expression.resultVar} !== null) {',
            '    #{node.resultVar}.push(#{node.expression.resultVar});',
            '    #block emit(node.expression)',
            '  }',
            '} else {',
            '  #{node.resultVar} = null;',
            '}'
          ],
          action: [
            '#{posSave(node)};',
            '#block emit(node.expression)',
            'if (#{node.resultVar} !== null) {',
            '  #{node.resultVar} = (function(#{(options.trackLineAndColumn ? ["offset", "line", "column"] : ["offset"]).concat(keys(node.params)).join(", ")}) {#{node.code}})(#{(options.trackLineAndColumn ? [node.posVar + ".offset", node.posVar + ".line", node.posVar + ".column"] : [node.posVar]).concat(values(node.params)).join(", ")});',
            '}',
            'if (#{node.resultVar} === null) {',
            '  #{posRestore(node)};',
            '}'
          ],
          rule_ref: [
            '#{node.resultVar} = parse_#{node.name}();'
          ],
          literal: [
            '#if node.value.length === 0',
            '  #{node.resultVar} = "";',
            '#else',
            '  #if !node.ignoreCase',
            '    #if node.value.length === 1',
            '      if (input.charCodeAt(#{posOffset("pos")}) === #{node.value.charCodeAt(0)}) {',
            '    #else',
            '      if (input.substr(#{posOffset("pos")}, #{node.value.length}) === #{string(node.value)}) {',
            '    #end',
            '  #else',
            /*
             * One-char literals are not optimized when case-insensitive
             * matching is enabled. This is because there is no simple way to
             * lowercase a character code that works for character outside ASCII
             * letters. Moreover, |toLowerCase| can change string length,
             * meaning the result of lowercasing a character can be more
             * characters.
             */
            '    if (input.substr(#{posOffset("pos")}, #{node.value.length}).toLowerCase() === #{string(node.value.toLowerCase())}) {',
            '  #end',
            '    #if !node.ignoreCase',
            '      #{node.resultVar} = #{string(node.value)};',
            '    #else',
            '      #{node.resultVar} = input.substr(#{posOffset("pos")}, #{node.value.length});',
            '    #end',
            '    #{posAdvance(node.value.length)};',
            '  } else {',
            '    #{node.resultVar} = null;',
            '    if (reportFailures === 0) {',
            '      matchFailed(#{string(string(node.value))});',
            '    }',
            '  }',
            '#end'
          ],
          any: [
            'if (input.length > #{posOffset("pos")}) {',
            '  #{node.resultVar} = input.charAt(#{posOffset("pos")});',
            '  #{posAdvance(1)};',
            '} else {',
            '  #{node.resultVar} = null;',
            '  if (reportFailures === 0) {',
            '    matchFailed("any character");',
            '  }',
            '}'
          ],
          "class": [
            'if (#{regexp}.test(input.charAt(#{posOffset("pos")}))) {',
            '  #{node.resultVar} = input.charAt(#{posOffset("pos")});',
            '  #{posAdvance(1)};',
            '} else {',
            '  #{node.resultVar} = null;',
            '  if (reportFailures === 0) {',
            '    matchFailed(#{string(node.rawText)});',
            '  }',
            '}'
          ]
        };

    for (name in sources) {
      templates[name] = Codie.template(sources[name].join('\n'));
    }

    return templates;
  })();

  function fill(name, vars) {
    vars.string  = quote;
    vars.pluck   = pluck;
    vars.keys    = keys;
    vars.values  = values;
    vars.emit    = emit;
    vars.options = options;

    /* Position-handling macros */
    if (options.trackLineAndColumn) {
      vars.posInit    = function(name) {
        return "var "
             + name
             + " = "
             + "{ offset: 0, line: 1, column: 1, seenCR: false }";
      };
      vars.posClone   = function(name) { return "clone(" + name + ")"; };
      vars.posOffset  = function(name) { return name + ".offset"; };

      vars.posAdvance = function(n)    { return "advance(pos, " + n + ")"; };
    } else {
      vars.posInit    = function(name) { return "var " + name + " = 0"; };
      vars.posClone   = function(name) { return name; };
      vars.posOffset  = function(name) { return name; };

      vars.posAdvance = function(n) {
        return n === 1 ? "pos++" : "pos += " + n;
      };
    }
    vars.posSave    = function(node) {
      return node.posVar + " = " + vars.posClone("pos");
    };
    vars.posRestore = function(node) {
      return "pos" + " = " + vars.posClone(node.posVar);
    };

    return templates[name](vars);
  }

  function emitSimple(name) {
    return function(node) { return fill(name, { node: node }); };
  }

  var emit = buildNodeVisitor({
    grammar: emitSimple("grammar"),

    initializer: function(node) { return node.code; },

    rule: emitSimple("rule"),

    /*
     * The contract for all code fragments generated by the following functions
     * is as follows.
     *
     * The code fragment tries to match a part of the input starting with the
     * position indicated in |pos|. That position may point past the end of the
     * input.
     *
     * * If the code fragment matches the input, it advances |pos| to point to
     *   the first chracter following the matched part of the input and sets
     *   variable with a name stored in |node.resultVar| to an appropriate
     *   value. This value is always non-|null|.
     *
     * * If the code fragment does not match the input, it returns with |pos|
     *   set to the original value and it sets a variable with a name stored in
     *   |node.resultVar| to |null|.
     *
     * The code can use variables with names stored in |resultVar| and |posVar|
     * properties of the current node's subnodes. It can't use any other
     * variables.
     */

    choice: function(node) {
      var code, nextAlternativesCode;

      for (var i = node.alternatives.length - 1; i >= 0; i--) {
        nextAlternativesCode = i !== node.alternatives.length - 1
          ? fill("choice.next", { node: node, code: code })
          : '';
        code = fill("choice", {
          alternative:          node.alternatives[i],
          nextAlternativesCode: nextAlternativesCode
        });
      }

      return code;
    },

    sequence: function(node) {
      var code = fill("sequence.inner", { node: node });

      for (var i = node.elements.length - 1; i >= 0; i--) {
        code = fill("sequence.iteration", {
          node:    node,
          element: node.elements[i],
          code:    code
        });
      }

      return fill("sequence", { node: node, code: code });
    },

    labeled: function(node) { return emit(node.expression); },

    simple_and:   emitSimple("simple_and"),
    simple_not:   emitSimple("simple_not"),
    semantic_and: emitSimple("semantic_and"),
    semantic_not: emitSimple("semantic_not"),
    optional:     emitSimple("optional"),
    zero_or_more: emitSimple("zero_or_more"),
    one_or_more:  emitSimple("one_or_more"),
    action:       emitSimple("action"),
    rule_ref:     emitSimple("rule_ref"),
    literal:      emitSimple("literal"),
    any:          emitSimple("any"),

    "class": function(node) {
      var regexp;

      if (node.parts.length > 0) {
        regexp = '/^['
          + (node.inverted ? '^' : '')
          + map(node.parts, function(part) {
              return part instanceof Array
                ? quoteForRegexpClass(part[0])
                  + '-'
                  + quoteForRegexpClass(part[1])
                : quoteForRegexpClass(part);
            }).join('')
          + ']/' + (node.ignoreCase ? 'i' : '');
      } else {
        /*
         * Stupid IE considers regexps /[]/ and /[^]/ syntactically invalid, so
         * we translate them into euqivalents it can handle.
         */
        regexp = node.inverted ? '/^[\\S\\s]/' : '/^(?!)/';
      }

      return fill("class", { node: node, regexp: regexp });
    }
  });

  return emit(ast);
};

return PEG;

})();

if (typeof module !== "undefined") {
  module.exports = PEG;
}

},{}],"/Users/Jacob/workspace/scheduler/front-end/node_modules/cldr/node_modules/seq/index.js":[function(require,module,exports){
(function (process){
var EventEmitter = require('events').EventEmitter;
var Hash = require('hashish');
var Chainsaw = require('chainsaw');

module.exports = Seq;
function Seq (xs) {
    if (xs && !Array.isArray(xs) || arguments.length > 1) {
        throw new Error('Optional argument to Seq() is exactly one Array');
    }
    
    var ch = Chainsaw(function (saw) {
        builder.call(this, saw, xs || []);
    });
    
    process.nextTick(function () {
        ch['catch'](function (err) {
            console.error(err.stack ? err.stack : err)
        });
    });
    return ch;
}

Seq.ap = Seq; // for compatability with versions <0.3

function builder (saw, xs) {
    var context = {
        vars : {},
        args : {},
        stack : xs,
        error : null
    };
    context.stack_ = context.stack;
    
    function action (step, key, f, g) {
        var cb = function (err) {
            var args = [].slice.call(arguments, 1);
            if (err) {
                context.error = { message : err, key : key };
                saw.jump(lastPar);
                saw.down('catch');
                g();
            }
            else {
                if (typeof key == 'number') {
                    context.stack_[key] = args[0];
                    context.args[key] = args;
                }
                else {
                    context.stack_.push.apply(context.stack_, args);
                    if (key !== undefined) {
                        context.vars[key] = args[0];
                        context.args[key] = args;
                    }
                }
                if (g) g(args, key);
            }
        };
        Hash(context).forEach(function (v,k) { cb[k] = v });
        
        cb.into = function (k) {
            key = k;
            return cb;
        };
        
        cb.next = function (err, xs) {
            context.stack_.push.apply(context.stack_, xs);
            cb.apply(cb, [err].concat(context.stack));
        };
        
        cb.pass = function (err) {
            cb.apply(cb, [err].concat(context.stack));
        };
        
        cb.ok = cb.bind(cb, null);
        
        f.apply(cb, context.stack);
    }
    
    var running = 0;
    var errors = 0;
    
    this.seq = function (key, cb) {
        var bound = [].slice.call(arguments, 2);
        
        if (typeof key === 'function') {
            if (arguments.length > 1) bound.unshift(cb);
            cb = key;
            key = undefined;
        }
        
        if (context.error) saw.next()
        else if (running === 0) {
            action(saw.step, key,
                function () {
                    context.stack_ = [];
                    var args = [].slice.call(arguments);
                    args.unshift.apply(args, bound.map(function (arg) {
                        return arg === Seq ? this : arg
                    }, this));
                    
                    cb.apply(this, args);
                }, function () {
                    context.stack = context.stack_;
                    saw.next()
                }
            );
        }
    };
    
    var lastPar = null;
    this.par = function (key, cb) {
        lastPar = saw.step;
        
        if (running == 0) {
            // empty the active stack for the first par() in a chain
            context.stack_ = [];
        }
        
        var bound = [].slice.call(arguments, 2);
        if (typeof key === 'function') {
            if (arguments.length > 1) bound.unshift(cb);
            cb = key;
            key = context.stack_.length;
            context.stack_.push(null);
        }
        var cb_ = function () {
            var args = [].slice.call(arguments);
            args.unshift.apply(args, bound.map(function (arg) {
                return arg === Seq ? this : arg
            }, this));
            
            cb.apply(this, args);
        };
        
        running ++;
        
        var step = saw.step;
        process.nextTick(function () {
            action(step, key, cb_, function (args) {
                if (!args) errors ++;
                
                running --;
                if (running == 0) {
                    context.stack = context.stack_.slice();
                    saw.step = lastPar;
                    if (errors > 0) saw.down('catch');
                    errors = 0;
                    saw.next();
                }
            });
        });
        saw.next();
    };
    
    [ 'seq', 'par' ].forEach(function (name) {
        this[name + '_'] = function (key) {
            var args = [].slice.call(arguments);
            
            var cb = typeof key === 'function'
                ? args[0] : args[1];
            
            var fn = function () {
                var argv = [].slice.call(arguments);
                argv.unshift(this);
                cb.apply(this, argv);
            };
            
            if (typeof key === 'function') {
                args[0] = fn;
            }
            else {
                args[1] = fn;
            }
            
            this[name].apply(this, args);
        };
    }, this);
    
    this['catch'] = function (cb) {
        if (context.error) {
            cb.call(context, context.error.message, context.error.key);
            context.error = null;
        }
        saw.next();
    };
    
    this.forEach = function (cb) {
        this.seq(function () {
            context.stack_ = context.stack.slice();
            var end = context.stack.length;
            
            if (end === 0) this(null)
            else context.stack.forEach(function (x, i) {
                action(saw.step, i, function () {
                    cb.call(this, x, i);
                    if (i == end - 1) saw.next();
                });
            });
        });
    };
    
    this.seqEach = function (cb) {
        this.seq(function () {
            context.stack_ = context.stack.slice();
            var xs = context.stack.slice();
            if (xs.length === 0) this(null);
            else (function next (i) {
                action(
                    saw.step, i,
                    function () { cb.call(this, xs[i], i) },
                    function (args) {
                        if (!args || i === xs.length - 1) saw.next();
                        else next(i + 1);
                    }
                );
            }).bind(this)(0);
        });
    };
    
    this.parEach = function (limit, cb) {
        var xs = context.stack.slice();
        if (cb === undefined) { cb = limit; limit = xs.length }
        context.stack_ = [];
        
        var active = 0;
        var finished = 0;
        var queue = [];
        
        if (xs.length === 0) saw.next()
        else xs.forEach(function call (x, i) {
            if (active >= limit) {
                queue.push(call.bind(this, x, i));
            }
            else {
                active ++;
                action(saw.step, i,
                    function () {
                        cb.call(this, x, i);
                    },
                    function () {
                        active --;
                        finished ++;
                        if (queue.length > 0) queue.shift()();
                        else if (finished === xs.length) {
                            saw.next();
                        }
                    }
                );
            }
        });
    };
    
    this.parMap = function (limit, cb) {
        var res = [];
        var len = context.stack.length;
        if (cb === undefined) { cb = limit; limit = len }
        var res = [];
        
        Seq()
            .extend(context.stack)
            .parEach(limit, function (x, i) {
                var self = this;
                
                var next = function () {
                    res[i] = arguments[1];
                    self.apply(self, arguments);
                };
                
                next.stack = self.stack;
                next.stack_ = self.stack_;
                next.vars = self.vars;
                next.args = self.args;
                next.error = self.error;
                
                next.into = function (key) {
                    return function () {
                        res[key] = arguments[1];
                        self.apply(self, arguments);
                    };
                };
                
                next.ok = function () {
                    var args = [].slice.call(arguments);
                    args.unshift(null);
                    return next.apply(next, args);
                };
                
                cb.apply(next, arguments);
            })
            .seq(function () {
                context.stack = res;
                saw.next();
            })
        ;
    };
    
    this.seqMap = function (cb) {
        var res = [];
        var lastIdx = context.stack.length - 1;
        
        this.seqEach(function (x, i) {
            var self = this;
            
            var next = function () {
                res[i] = arguments[1];
                if (i === lastIdx)
                    context.stack = res;
                self.apply(self, arguments);
            };
            
            next.stack = self.stack;
            next.stack_ = self.stack_;
            next.vars = self.vars;
            next.args = self.args;
            next.error = self.error;
            
            next.into = function (key) {
                return function () {
                    res[key] = arguments[1];
                    if (i === lastIdx)
                        context.stack = res;
                    self.apply(self, arguments);
                };
            };
            
            next.ok = function () {
                var args = [].slice.call(arguments);
                args.unshift(null);
                return next.apply(next, args);
            };
            
            cb.apply(next, arguments);
        });
    };
    
    /**
     * Consumes any errors that occur in `cb`. Calls to `this.into(i)` will place
     * that value, if accepted by the filter, at the index in the results as
     * if it were the i-th index before filtering. (This means it will never 
     * override another value, and will only actually appear at i if the filter
     * accepts all values before i.)
     */
    this.parFilter = function (limit, cb) {
        var res = [];
        var len = context.stack.length;
        if (cb === undefined) { cb = limit; limit = len }
        var res = [];
        
        Seq()
            .extend(context.stack)
            .parEach(limit, function (x, i) {
                var self = this;
                
                var next = function (err, ok) {
                    if (!err && ok)
                        res.push([i, x]);
                    arguments[0] = null; // discard errors
                    self.apply(self, arguments);
                };
                
                next.stack = self.stack;
                next.stack_ = self.stack_;
                next.vars = self.vars;
                next.args = self.args;
                next.error = self.error;
                
                next.into = function (key) {
                    return function (err, ok) {
                        if (!err && ok)
                            res.push([key, x]);
                        arguments[0] = null; // discard errors
                        self.apply(self, arguments);
                    };
                };
                
                next.ok = function () {
                    var args = [].slice.call(arguments);
                    args.unshift(null);
                    return next.apply(next, args);
                };
                
                cb.apply(next, arguments);
            })
            .seq(function () {
                context.stack = res.sort().map(function(pair){ return pair[1]; });
                saw.next();
            })
        ;
    };
    
    /**
     * Consumes any errors that occur in `cb`. Calls to `this.into(i)` will place
     * that value, if accepted by the filter, at the index in the results as
     * if it were the i-th index before filtering. (This means it will never 
     * override another value, and will only actually appear at i if the filter
     * accepts all values before i.)
     */
    this.seqFilter = function (cb) {
        var res = [];
        var lastIdx = context.stack.length - 1;
        
        this.seqEach(function (x, i) {
            var self = this;
            
            var next = function (err, ok) {
                if (!err && ok)
                    res.push([i, x]);
                if (i === lastIdx)
                    context.stack = res.sort().map(function(pair){ return pair[1]; });
                arguments[0] = null; // discard errors
                self.apply(self, arguments);
            };
            
            next.stack = self.stack;
            next.stack_ = self.stack_;
            next.vars = self.vars;
            next.args = self.args;
            next.error = self.error;
            
            next.into = function (key) {
                return function (err, ok) {
                    if (!err && ok)
                        res.push([key, x]);
                    if (i === lastIdx)
                        context.stack = res.sort().map(function(pair){ return pair[1]; });
                    arguments[0] = null; // discard errors
                    self.apply(self, arguments);
                };
            };
            
            next.ok = function () {
                var args = [].slice.call(arguments);
                args.unshift(null);
                return next.apply(next, args);
            };
            
            cb.apply(next, arguments);
        });
    };
    
    [ 'forEach', 'seqEach', 'parEach', 'seqMap', 'parMap', 'seqFilter', 'parFilter' ]
        .forEach(function (name) {
            this[name + '_'] = function (cb) {
                this[name].call(this, function () {
                    var args = [].slice.call(arguments);
                    args.unshift(this);
                    cb.apply(this, args);
                });
            };
        }, this)
    ;
    
    ['push','pop','shift','unshift','splice','reverse']
        .forEach(function (name) {
            this[name] = function () {
                context.stack[name].apply(
                    context.stack,
                    [].slice.call(arguments)
                );
                saw.next();
                return this;
            };
        }, this)
    ;
    
    [ 'map', 'filter', 'reduce' ]
        .forEach(function (name) {
            this[name] = function () {
                var res = context.stack[name].apply(
                    context.stack,
                    [].slice.call(arguments)
                );
                // stack must be an array, or bad things happen
                context.stack = (Array.isArray(res) ? res : [res]);
                saw.next();
                return this;
            };
        }, this)
    ;
    
    this.extend = function (xs) {
        if (!Array.isArray(xs)) {
            throw new Error('argument to .extend() is not an Array');
        }
        context.stack.push.apply(context.stack, xs);
        saw.next();
    };
    
    this.flatten = function (pancake) {
        var xs = [];
        // should we fully flatten this array? (default: true)
        if (pancake === undefined) { pancake = true; }
        context.stack.forEach(function f (x) {
            if (Array.isArray(x) && pancake) x.forEach(f);
            else if (Array.isArray(x)) xs = xs.concat(x);
            else xs.push(x);
        });
        context.stack = xs;
        saw.next();
    };
    
    this.unflatten = function () {
        context.stack = [context.stack];
        saw.next();
    };
    
    this.empty = function () {
        context.stack = [];
        saw.next();
    };
    
    this.set = function (stack) {
        context.stack = stack;
        saw.next();
    };
    
    this['do'] = function (cb) {
        saw.nest(cb, context);
    };
}

}).call(this,require('_process'))

},{"_process":"/Users/Jacob/workspace/scheduler/front-end/node_modules/browserify/node_modules/process/browser.js","chainsaw":"/Users/Jacob/workspace/scheduler/front-end/node_modules/cldr/node_modules/seq/node_modules/chainsaw/index.js","events":"/Users/Jacob/workspace/scheduler/front-end/node_modules/events/events.js","hashish":"/Users/Jacob/workspace/scheduler/front-end/node_modules/cldr/node_modules/seq/node_modules/hashish/index.js"}],"/Users/Jacob/workspace/scheduler/front-end/node_modules/cldr/node_modules/seq/node_modules/chainsaw/index.js":[function(require,module,exports){
(function (process){
var Traverse = require('traverse');
var EventEmitter = require('events').EventEmitter;

module.exports = Chainsaw;
function Chainsaw (builder) {
    var saw = Chainsaw.saw(builder, {});
    var r = builder.call(saw.handlers, saw);
    if (r !== undefined) saw.handlers = r;
    return saw.chain();
};

Chainsaw.saw = function (builder, handlers) {
    var saw = new EventEmitter;
    saw.handlers = handlers;
    saw.actions = [];
    saw.step = 0;
    
    saw.chain = function () {
        var ch = Traverse(saw.handlers).map(function (node) {
            if (this.isRoot) return node;
            var ps = this.path;
            
            if (typeof node === 'function') {
                this.update(function () {
                    saw.actions.push({
                        path : ps,
                        args : [].slice.call(arguments)
                    });
                    return ch;
                });
            }
        });
        
        process.nextTick(function () {
            saw.emit('begin');
            saw.next();
        });
        
        return ch;
    };
    
    saw.next = function () {
        var action = saw.actions[saw.step];
        saw.step ++;
        
        if (!action) {
            saw.emit('end');
        }
        else if (!action.trap) {
            var node = saw.handlers;
            action.path.forEach(function (key) { node = node[key] });
            node.apply(saw.handlers, action.args);
        }
    };
    
    saw.nest = function (cb) {
        var args = [].slice.call(arguments, 1);
        var autonext = true;
        
        if (typeof cb === 'boolean') {
            var autonext = cb;
            cb = args.shift();
        }
        
        var s = Chainsaw.saw(builder, {});
        var r = builder.call(s.handlers, s);
        
        if (r !== undefined) s.handlers = r;
        cb.apply(s.chain(), args);
        if (autonext !== false) s.on('end', saw.next);
    };
    
    saw.trap = function (name, cb) {
        var ps = Array.isArray(name) ? name : [name];
        saw.actions.push({
            path : ps,
            step : saw.step,
            cb : cb,
            trap : true
        });
    };
    
    saw.down = function (name) {
        var ps = (Array.isArray(name) ? name : [name]).join('/');
        var i = saw.actions.slice(saw.step).map(function (x) {
            if (x.trap && x.step <= saw.step) return false;
            return x.path.join('/') == ps;
        }).indexOf(true);
        
        if (i >= 0) saw.step += i;
        else saw.step = saw.actions.length;
        
        var act = saw.actions[saw.step - 1];
        if (act && act.trap) {
            // It's a trap!
            saw.step = act.step;
            act.cb();
        }
        else saw.next();
    };
    
    saw.jump = function (step) {
        saw.step = step;
        saw.next();
    };
    
    return saw;
}; 

}).call(this,require('_process'))

},{"_process":"/Users/Jacob/workspace/scheduler/front-end/node_modules/browserify/node_modules/process/browser.js","events":"/Users/Jacob/workspace/scheduler/front-end/node_modules/events/events.js","traverse":"/Users/Jacob/workspace/scheduler/front-end/node_modules/cldr/node_modules/seq/node_modules/chainsaw/node_modules/traverse/index.js"}],"/Users/Jacob/workspace/scheduler/front-end/node_modules/cldr/node_modules/seq/node_modules/chainsaw/node_modules/traverse/index.js":[function(require,module,exports){
module.exports = Traverse;
function Traverse (obj) {
    if (!(this instanceof Traverse)) return new Traverse(obj);
    this.value = obj;
}

Traverse.prototype.get = function (ps) {
    var node = this.value;
    for (var i = 0; i < ps.length; i ++) {
        var key = ps[i];
        if (!Object.hasOwnProperty.call(node, key)) {
            node = undefined;
            break;
        }
        node = node[key];
    }
    return node;
};

Traverse.prototype.set = function (ps, value) {
    var node = this.value;
    for (var i = 0; i < ps.length - 1; i ++) {
        var key = ps[i];
        if (!Object.hasOwnProperty.call(node, key)) node[key] = {};
        node = node[key];
    }
    node[ps[i]] = value;
    return value;
};

Traverse.prototype.map = function (cb) {
    return walk(this.value, cb, true);
};

Traverse.prototype.forEach = function (cb) {
    this.value = walk(this.value, cb, false);
    return this.value;
};

Traverse.prototype.reduce = function (cb, init) {
    var skip = arguments.length === 1;
    var acc = skip ? this.value : init;
    this.forEach(function (x) {
        if (!this.isRoot || !skip) {
            acc = cb.call(this, acc, x);
        }
    });
    return acc;
};

Traverse.prototype.deepEqual = function (obj) {
    if (arguments.length !== 1) {
        throw new Error(
            'deepEqual requires exactly one object to compare against'
        );
    }
    
    var equal = true;
    var node = obj;
    
    this.forEach(function (y) {
        var notEqual = (function () {
            equal = false;
            //this.stop();
            return undefined;
        }).bind(this);
        
        //if (node === undefined || node === null) return notEqual();
        
        if (!this.isRoot) {
        /*
            if (!Object.hasOwnProperty.call(node, this.key)) {
                return notEqual();
            }
        */
            if (typeof node !== 'object') return notEqual();
            node = node[this.key];
        }
        
        var x = node;
        
        this.post(function () {
            node = x;
        });
        
        var toS = function (o) {
            return Object.prototype.toString.call(o);
        };
        
        if (this.circular) {
            if (Traverse(obj).get(this.circular.path) !== x) notEqual();
        }
        else if (typeof x !== typeof y) {
            notEqual();
        }
        else if (x === null || y === null || x === undefined || y === undefined) {
            if (x !== y) notEqual();
        }
        else if (x.__proto__ !== y.__proto__) {
            notEqual();
        }
        else if (x === y) {
            // nop
        }
        else if (typeof x === 'function') {
            if (x instanceof RegExp) {
                // both regexps on account of the __proto__ check
                if (x.toString() != y.toString()) notEqual();
            }
            else if (x !== y) notEqual();
        }
        else if (typeof x === 'object') {
            if (toS(y) === '[object Arguments]'
            || toS(x) === '[object Arguments]') {
                if (toS(x) !== toS(y)) {
                    notEqual();
                }
            }
            else if (x instanceof Date || y instanceof Date) {
                if (!(x instanceof Date) || !(y instanceof Date)
                || x.getTime() !== y.getTime()) {
                    notEqual();
                }
            }
            else {
                var kx = Object.keys(x);
                var ky = Object.keys(y);
                if (kx.length !== ky.length) return notEqual();
                for (var i = 0; i < kx.length; i++) {
                    var k = kx[i];
                    if (!Object.hasOwnProperty.call(y, k)) {
                        notEqual();
                    }
                }
            }
        }
    });
    
    return equal;
};

Traverse.prototype.paths = function () {
    var acc = [];
    this.forEach(function (x) {
        acc.push(this.path); 
    });
    return acc;
};

Traverse.prototype.nodes = function () {
    var acc = [];
    this.forEach(function (x) {
        acc.push(this.node);
    });
    return acc;
};

Traverse.prototype.clone = function () {
    var parents = [], nodes = [];
    
    return (function clone (src) {
        for (var i = 0; i < parents.length; i++) {
            if (parents[i] === src) {
                return nodes[i];
            }
        }
        
        if (typeof src === 'object' && src !== null) {
            var dst = copy(src);
            
            parents.push(src);
            nodes.push(dst);
            
            Object.keys(src).forEach(function (key) {
                dst[key] = clone(src[key]);
            });
            
            parents.pop();
            nodes.pop();
            return dst;
        }
        else {
            return src;
        }
    })(this.value);
};

function walk (root, cb, immutable) {
    var path = [];
    var parents = [];
    var alive = true;
    
    return (function walker (node_) {
        var node = immutable ? copy(node_) : node_;
        var modifiers = {};
        
        var state = {
            node : node,
            node_ : node_,
            path : [].concat(path),
            parent : parents.slice(-1)[0],
            key : path.slice(-1)[0],
            isRoot : path.length === 0,
            level : path.length,
            circular : null,
            update : function (x) {
                if (!state.isRoot) {
                    state.parent.node[state.key] = x;
                }
                state.node = x;
            },
            'delete' : function () {
                delete state.parent.node[state.key];
            },
            remove : function () {
                if (Array.isArray(state.parent.node)) {
                    state.parent.node.splice(state.key, 1);
                }
                else {
                    delete state.parent.node[state.key];
                }
            },
            before : function (f) { modifiers.before = f },
            after : function (f) { modifiers.after = f },
            pre : function (f) { modifiers.pre = f },
            post : function (f) { modifiers.post = f },
            stop : function () { alive = false }
        };
        
        if (!alive) return state;
        
        if (typeof node === 'object' && node !== null) {
            state.isLeaf = Object.keys(node).length == 0;
            
            for (var i = 0; i < parents.length; i++) {
                if (parents[i].node_ === node_) {
                    state.circular = parents[i];
                    break;
                }
            }
        }
        else {
            state.isLeaf = true;
        }
        
        state.notLeaf = !state.isLeaf;
        state.notRoot = !state.isRoot;
        
        // use return values to update if defined
        var ret = cb.call(state, state.node);
        if (ret !== undefined && state.update) state.update(ret);
        if (modifiers.before) modifiers.before.call(state, state.node);
        
        if (typeof state.node == 'object'
        && state.node !== null && !state.circular) {
            parents.push(state);
            
            var keys = Object.keys(state.node);
            keys.forEach(function (key, i) {
                path.push(key);
                
                if (modifiers.pre) modifiers.pre.call(state, state.node[key], key);
                
                var child = walker(state.node[key]);
                if (immutable && Object.hasOwnProperty.call(state.node, key)) {
                    state.node[key] = child.node;
                }
                
                child.isLast = i == keys.length - 1;
                child.isFirst = i == 0;
                
                if (modifiers.post) modifiers.post.call(state, child);
                
                path.pop();
            });
            parents.pop();
        }
        
        if (modifiers.after) modifiers.after.call(state, state.node);
        
        return state;
    })(root).node;
}

Object.keys(Traverse.prototype).forEach(function (key) {
    Traverse[key] = function (obj) {
        var args = [].slice.call(arguments, 1);
        var t = Traverse(obj);
        return t[key].apply(t, args);
    };
});

function copy (src) {
    if (typeof src === 'object' && src !== null) {
        var dst;
        
        if (Array.isArray(src)) {
            dst = [];
        }
        else if (src instanceof Date) {
            dst = new Date(src);
        }
        else if (src instanceof Boolean) {
            dst = new Boolean(src);
        }
        else if (src instanceof Number) {
            dst = new Number(src);
        }
        else if (src instanceof String) {
            dst = new String(src);
        }
        else {
            dst = Object.create(Object.getPrototypeOf(src));
        }
        
        Object.keys(src).forEach(function (key) {
            dst[key] = src[key];
        });
        return dst;
    }
    else return src;
}

},{}],"/Users/Jacob/workspace/scheduler/front-end/node_modules/cldr/node_modules/seq/node_modules/hashish/index.js":[function(require,module,exports){
module.exports = Hash;
var Traverse = require('traverse');

function Hash (hash, xs) {
    if (Array.isArray(hash) && Array.isArray(xs)) {
        var to = Math.min(hash.length, xs.length);
        var acc = {};
        for (var i = 0; i < to; i++) {
            acc[hash[i]] = xs[i];
        }
        return Hash(acc);
    }
    
    if (hash === undefined) return Hash({});
    
    var self = {
        map : function (f) {
            var acc = { __proto__ : hash.__proto__ };
            Object.keys(hash).forEach(function (key) {
                acc[key] = f.call(self, hash[key], key);
            });
            return Hash(acc);
        },
        forEach : function (f) {
            Object.keys(hash).forEach(function (key) {
                f.call(self, hash[key], key);
            });
            return self;
        },
        filter : function (f) {
            var acc = { __proto__ : hash.__proto__ };
            Object.keys(hash).forEach(function (key) {
                if (f.call(self, hash[key], key)) {
                    acc[key] = hash[key];
                }
            });
            return Hash(acc);
        },
        detect : function (f) {
            for (var key in hash) {
                if (f.call(self, hash[key], key)) {
                    return hash[key];
                }
            }
            return undefined;
        },
        reduce : function (f, acc) {
            var keys = Object.keys(hash);
            if (acc === undefined) acc = keys.shift();
            keys.forEach(function (key) {
                acc = f.call(self, acc, hash[key], key);
            });
            return acc;
        },
        some : function (f) {
            for (var key in hash) {
                if (f.call(self, hash[key], key)) return true;
            }
            return false;
        },
        update : function (obj) {
            if (arguments.length > 1) {
                self.updateAll([].slice.call(arguments));
            }
            else {
                Object.keys(obj).forEach(function (key) {
                    hash[key] = obj[key];
                });
            }
            return self;
        },
        updateAll : function (xs) {
            xs.filter(Boolean).forEach(function (x) {
                self.update(x);
            });
            return self;
        },
        merge : function (obj) {
            if (arguments.length > 1) {
                return self.copy.updateAll([].slice.call(arguments));
            }
            else {
                return self.copy.update(obj);
            }
        },
        mergeAll : function (xs) {
            return self.copy.updateAll(xs);
        },
        has : function (key) { // only operates on enumerables
            return Array.isArray(key)
                ? key.every(function (k) { return self.has(k) })
                : self.keys.indexOf(key.toString()) >= 0;
        },
        valuesAt : function (keys) {
            return Array.isArray(keys)
                ? keys.map(function (key) { return hash[key] })
                : hash[keys]
            ;
        },
        tap : function (f) {
            f.call(self, hash);
            return self;
        },
        extract : function (keys) {
            var acc = {};
            keys.forEach(function (key) {
                acc[key] = hash[key];
            });
            return Hash(acc);
        },
        exclude : function (keys) {
            return self.filter(function (_, key) {
                return keys.indexOf(key) < 0
            });
        },
        end : hash,
        items : hash
    };
    
    var props = {
        keys : function () { return Object.keys(hash) },
        values : function () {
            return Object.keys(hash).map(function (key) { return hash[key] });
        },
        compact : function () {
            return self.filter(function (x) { return x !== undefined });
        },
        clone : function () { return Hash(Hash.clone(hash)) },
        copy : function () { return Hash(Hash.copy(hash)) },
        length : function () { return Object.keys(hash).length },
        size : function () { return self.length }
    };
    
    if (Object.defineProperty) {
        // es5-shim has an Object.defineProperty but it throws for getters
        try {
            for (var key in props) {
                Object.defineProperty(self, key, { get : props[key] });
            }
        }
        catch (err) {
            for (var key in props) {
                if (key !== 'clone' && key !== 'copy' && key !== 'compact') {
                    // ^ those keys use Hash() so can't call them without
                    // a stack overflow
                    self[key] = props[key]();
                }
            }
        }
    }
    else if (self.__defineGetter__) {
        for (var key in props) {
            self.__defineGetter__(key, props[key]);
        }
    }
    else {
        // non-lazy version for browsers that suck >_<
        for (var key in props) {
            self[key] = props[key]();
        }
    }
    
    return self;
};

// deep copy
Hash.clone = function (ref) {
    return Traverse.clone(ref);
};

// shallow copy
Hash.copy = function (ref) {
    var hash = { __proto__ : ref.__proto__ };
    Object.keys(ref).forEach(function (key) {
        hash[key] = ref[key];
    });
    return hash;
};

Hash.map = function (ref, f) {
    return Hash(ref).map(f).items;
};

Hash.forEach = function (ref, f) {
    Hash(ref).forEach(f);
};

Hash.filter = function (ref, f) {
    return Hash(ref).filter(f).items;
};

Hash.detect = function (ref, f) {
    return Hash(ref).detect(f);
};

Hash.reduce = function (ref, f, acc) {
    return Hash(ref).reduce(f, acc);
};

Hash.some = function (ref, f) {
    return Hash(ref).some(f);
};

Hash.update = function (a /*, b, c, ... */) {
    var args = Array.prototype.slice.call(arguments, 1);
    var hash = Hash(a);
    return hash.update.apply(hash, args).items;
};

Hash.merge = function (a /*, b, c, ... */) {
    var args = Array.prototype.slice.call(arguments, 1);
    var hash = Hash(a);
    return hash.merge.apply(hash, args).items;
};

Hash.has = function (ref, key) {
    return Hash(ref).has(key);
};

Hash.valuesAt = function (ref, keys) {
    return Hash(ref).valuesAt(keys);
};

Hash.tap = function (ref, f) {
    return Hash(ref).tap(f).items;
};

Hash.extract = function (ref, keys) {
    return Hash(ref).extract(keys).items;
};

Hash.exclude = function (ref, keys) {
    return Hash(ref).exclude(keys).items;
};

Hash.concat = function (xs) {
    var hash = Hash({});
    xs.forEach(function (x) { hash.update(x) });
    return hash.items;
};

Hash.zip = function (xs, ys) {
    return Hash(xs, ys).items;
};

// .length is already defined for function prototypes
Hash.size = function (ref) {
    return Hash(ref).size;
};

Hash.compact = function (ref) {
    return Hash(ref).compact.items;
};

},{"traverse":"/Users/Jacob/workspace/scheduler/front-end/node_modules/cldr/node_modules/seq/node_modules/hashish/node_modules/traverse/index.js"}],"/Users/Jacob/workspace/scheduler/front-end/node_modules/cldr/node_modules/seq/node_modules/hashish/node_modules/traverse/index.js":[function(require,module,exports){
var traverse = module.exports = function (obj) {
    return new Traverse(obj);
};

function Traverse (obj) {
    this.value = obj;
}

Traverse.prototype.get = function (ps) {
    var node = this.value;
    for (var i = 0; i < ps.length; i ++) {
        var key = ps[i];
        if (!node || !hasOwnProperty.call(node, key)) {
            node = undefined;
            break;
        }
        node = node[key];
    }
    return node;
};

Traverse.prototype.has = function (ps) {
    var node = this.value;
    for (var i = 0; i < ps.length; i ++) {
        var key = ps[i];
        if (!node || !hasOwnProperty.call(node, key)) {
            return false;
        }
        node = node[key];
    }
    return true;
};

Traverse.prototype.set = function (ps, value) {
    var node = this.value;
    for (var i = 0; i < ps.length - 1; i ++) {
        var key = ps[i];
        if (!hasOwnProperty.call(node, key)) node[key] = {};
        node = node[key];
    }
    node[ps[i]] = value;
    return value;
};

Traverse.prototype.map = function (cb) {
    return walk(this.value, cb, true);
};

Traverse.prototype.forEach = function (cb) {
    this.value = walk(this.value, cb, false);
    return this.value;
};

Traverse.prototype.reduce = function (cb, init) {
    var skip = arguments.length === 1;
    var acc = skip ? this.value : init;
    this.forEach(function (x) {
        if (!this.isRoot || !skip) {
            acc = cb.call(this, acc, x);
        }
    });
    return acc;
};

Traverse.prototype.paths = function () {
    var acc = [];
    this.forEach(function (x) {
        acc.push(this.path); 
    });
    return acc;
};

Traverse.prototype.nodes = function () {
    var acc = [];
    this.forEach(function (x) {
        acc.push(this.node);
    });
    return acc;
};

Traverse.prototype.clone = function () {
    var parents = [], nodes = [];
    
    return (function clone (src) {
        for (var i = 0; i < parents.length; i++) {
            if (parents[i] === src) {
                return nodes[i];
            }
        }
        
        if (typeof src === 'object' && src !== null) {
            var dst = copy(src);
            
            parents.push(src);
            nodes.push(dst);
            
            forEach(objectKeys(src), function (key) {
                dst[key] = clone(src[key]);
            });
            
            parents.pop();
            nodes.pop();
            return dst;
        }
        else {
            return src;
        }
    })(this.value);
};

function walk (root, cb, immutable) {
    var path = [];
    var parents = [];
    var alive = true;
    
    return (function walker (node_) {
        var node = immutable ? copy(node_) : node_;
        var modifiers = {};
        
        var keepGoing = true;
        
        var state = {
            node : node,
            node_ : node_,
            path : [].concat(path),
            parent : parents[parents.length - 1],
            parents : parents,
            key : path.slice(-1)[0],
            isRoot : path.length === 0,
            level : path.length,
            circular : null,
            update : function (x, stopHere) {
                if (!state.isRoot) {
                    state.parent.node[state.key] = x;
                }
                state.node = x;
                if (stopHere) keepGoing = false;
            },
            'delete' : function (stopHere) {
                delete state.parent.node[state.key];
                if (stopHere) keepGoing = false;
            },
            remove : function (stopHere) {
                if (isArray(state.parent.node)) {
                    state.parent.node.splice(state.key, 1);
                }
                else {
                    delete state.parent.node[state.key];
                }
                if (stopHere) keepGoing = false;
            },
            keys : null,
            before : function (f) { modifiers.before = f },
            after : function (f) { modifiers.after = f },
            pre : function (f) { modifiers.pre = f },
            post : function (f) { modifiers.post = f },
            stop : function () { alive = false },
            block : function () { keepGoing = false }
        };
        
        if (!alive) return state;
        
        function updateState() {
            if (typeof state.node === 'object' && state.node !== null) {
                if (!state.keys || state.node_ !== state.node) {
                    state.keys = objectKeys(state.node)
                }
                
                state.isLeaf = state.keys.length == 0;
                
                for (var i = 0; i < parents.length; i++) {
                    if (parents[i].node_ === node_) {
                        state.circular = parents[i];
                        break;
                    }
                }
            }
            else {
                state.isLeaf = true;
                state.keys = null;
            }
            
            state.notLeaf = !state.isLeaf;
            state.notRoot = !state.isRoot;
        }
        
        updateState();
        
        // use return values to update if defined
        var ret = cb.call(state, state.node);
        if (ret !== undefined && state.update) state.update(ret);
        
        if (modifiers.before) modifiers.before.call(state, state.node);
        
        if (!keepGoing) return state;
        
        if (typeof state.node == 'object'
        && state.node !== null && !state.circular) {
            parents.push(state);
            
            updateState();
            
            forEach(state.keys, function (key, i) {
                path.push(key);
                
                if (modifiers.pre) modifiers.pre.call(state, state.node[key], key);
                
                var child = walker(state.node[key]);
                if (immutable && hasOwnProperty.call(state.node, key)) {
                    state.node[key] = child.node;
                }
                
                child.isLast = i == state.keys.length - 1;
                child.isFirst = i == 0;
                
                if (modifiers.post) modifiers.post.call(state, child);
                
                path.pop();
            });
            parents.pop();
        }
        
        if (modifiers.after) modifiers.after.call(state, state.node);
        
        return state;
    })(root).node;
}

function copy (src) {
    if (typeof src === 'object' && src !== null) {
        var dst;
        
        if (isArray(src)) {
            dst = [];
        }
        else if (isDate(src)) {
            dst = new Date(src.getTime ? src.getTime() : src);
        }
        else if (isRegExp(src)) {
            dst = new RegExp(src);
        }
        else if (isError(src)) {
            dst = { message: src.message };
        }
        else if (isBoolean(src)) {
            dst = new Boolean(src);
        }
        else if (isNumber(src)) {
            dst = new Number(src);
        }
        else if (isString(src)) {
            dst = new String(src);
        }
        else if (Object.create && Object.getPrototypeOf) {
            dst = Object.create(Object.getPrototypeOf(src));
        }
        else if (src.constructor === Object) {
            dst = {};
        }
        else {
            var proto =
                (src.constructor && src.constructor.prototype)
                || src.__proto__
                || {}
            ;
            var T = function () {};
            T.prototype = proto;
            dst = new T;
        }
        
        forEach(objectKeys(src), function (key) {
            dst[key] = src[key];
        });
        return dst;
    }
    else return src;
}

var objectKeys = Object.keys || function keys (obj) {
    var res = [];
    for (var key in obj) res.push(key)
    return res;
};

function toS (obj) { return Object.prototype.toString.call(obj) }
function isDate (obj) { return toS(obj) === '[object Date]' }
function isRegExp (obj) { return toS(obj) === '[object RegExp]' }
function isError (obj) { return toS(obj) === '[object Error]' }
function isBoolean (obj) { return toS(obj) === '[object Boolean]' }
function isNumber (obj) { return toS(obj) === '[object Number]' }
function isString (obj) { return toS(obj) === '[object String]' }

var isArray = Array.isArray || function isArray (xs) {
    return Object.prototype.toString.call(xs) === '[object Array]';
};

var forEach = function (xs, fn) {
    if (xs.forEach) return xs.forEach(fn)
    else for (var i = 0; i < xs.length; i++) {
        fn(xs[i], i, xs);
    }
};

forEach(objectKeys(Traverse.prototype), function (key) {
    traverse[key] = function (obj) {
        var args = [].slice.call(arguments, 1);
        var t = new Traverse(obj);
        return t[key].apply(t, args);
    };
});

var hasOwnProperty = Object.hasOwnProperty || function (obj, key) {
    return key in obj;
};

},{}],"/Users/Jacob/workspace/scheduler/front-end/node_modules/cldr/node_modules/uglify-js/lib/consolidator.js":[function(require,module,exports){
/**
 * @preserve Copyright 2012 Robert Gust-Bardon <http://robert.gust-bardon.org/>.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 *     * Redistributions of source code must retain the above
 *       copyright notice, this list of conditions and the following
 *       disclaimer.
 *
 *     * Redistributions in binary form must reproduce the above
 *       copyright notice, this list of conditions and the following
 *       disclaimer in the documentation and/or other materials
 *       provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDER "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY,
 * OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF
 * THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF
 * SUCH DAMAGE.
 */

/**
 * @fileoverview Enhances <a href="https://github.com/mishoo/UglifyJS/"
 * >UglifyJS</a> with consolidation of null, Boolean, and String values.
 * <p>Also known as aliasing, this feature has been deprecated in <a href=
 * "http://closure-compiler.googlecode.com/">the Closure Compiler</a> since its
 * initial release, where it is unavailable from the <abbr title=
 * "command line interface">CLI</a>. The Closure Compiler allows one to log and
 * influence this process. In contrast, this implementation does not introduce
 * any variable declarations in global code and derives String values from
 * identifier names used as property accessors.</p>
 * <p>Consolidating literals may worsen the data compression ratio when an <a
 * href="http://tools.ietf.org/html/rfc2616#section-3.5">encoding
 * transformation</a> is applied. For instance, <a href=
 * "http://code.jquery.com/jquery-1.7.1.js">jQuery 1.7.1</a> takes 248235 bytes.
 * Building it with <a href="https://github.com/mishoo/UglifyJS/tarball/v1.2.5">
 * UglifyJS v1.2.5</a> results in 93647 bytes (37.73% of the original) which are
 * then compressed to 33154 bytes (13.36% of the original) using <a href=
 * "http://linux.die.net/man/1/gzip">gzip(1)</a>. Building it with the same
 * version of UglifyJS 1.2.5 patched with the implementation of consolidation
 * results in 80784 bytes (a decrease of 12863 bytes, i.e. 13.74%, in comparison
 * to the aforementioned 93647 bytes) which are then compressed to 34013 bytes
 * (an increase of 859 bytes, i.e. 2.59%, in comparison to the aforementioned
 * 33154 bytes).</p>
 * <p>Written in <a href="http://es5.github.com/#x4.2.2">the strict variant</a>
 * of <a href="http://es5.github.com/">ECMA-262 5.1 Edition</a>. Encoded in <a
 * href="http://tools.ietf.org/html/rfc3629">UTF-8</a>. Follows <a href=
 * "http://google-styleguide.googlecode.com/svn-history/r76/trunk/javascriptguide.xml"
 * >Revision 2.28 of the Google JavaScript Style Guide</a> (except for the
 * discouraged use of the {@code function} tag and the {@code namespace} tag).
 * 100% typed for the <a href=
 * "http://closure-compiler.googlecode.com/files/compiler-20120123.tar.gz"
 * >Closure Compiler Version 1741</a>.</p>
 * <p>Should you find this software useful, please consider <a href=
 * "https://paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=JZLW72X8FD4WG"
 * >a donation</a>.</p>
 * @author follow.me@RGustBardon (Robert Gust-Bardon)
 * @supported Tested with:
 *     <ul>
 *     <li><a href="http://nodejs.org/dist/v0.6.10/">Node v0.6.10</a>,</li>
 *     <li><a href="https://github.com/mishoo/UglifyJS/tarball/v1.2.5">UglifyJS
 *       v1.2.5</a>.</li>
 *     </ul>
 */

/*global console:false, exports:true, module:false, require:false */
/*jshint sub:true */
/**
 * Consolidates null, Boolean, and String values found inside an <abbr title=
 * "abstract syntax tree">AST</abbr>.
 * @param {!TSyntacticCodeUnit} oAbstractSyntaxTree An array-like object
 *     representing an <abbr title="abstract syntax tree">AST</abbr>.
 * @return {!TSyntacticCodeUnit} An array-like object representing an <abbr
 *     title="abstract syntax tree">AST</abbr> with its null, Boolean, and
 *     String values consolidated.
 */
// TODO(user) Consolidation of mathematical values found in numeric literals.
// TODO(user) Unconsolidation.
// TODO(user) Consolidation of ECMA-262 6th Edition programs.
// TODO(user) Rewrite in ECMA-262 6th Edition.
exports['ast_consolidate'] = function(oAbstractSyntaxTree) {
  'use strict';
  /*jshint bitwise:true, curly:true, eqeqeq:true, forin:true, immed:true,
        latedef:true, newcap:true, noarge:true, noempty:true, nonew:true,
        onevar:true, plusplus:true, regexp:true, undef:true, strict:true,
        sub:false, trailing:true */

  var _,
      /**
       * A record consisting of data about one or more source elements.
       * @constructor
       * @nosideeffects
       */
      TSourceElementsData = function() {
        /**
         * The category of the elements.
         * @type {number}
         * @see ESourceElementCategories
         */
        this.nCategory = ESourceElementCategories.N_OTHER;
        /**
         * The number of occurrences (within the elements) of each primitive
         * value that could be consolidated.
         * @type {!Array.<!Object.<string, number>>}
         */
        this.aCount = [];
        this.aCount[EPrimaryExpressionCategories.N_IDENTIFIER_NAMES] = {};
        this.aCount[EPrimaryExpressionCategories.N_STRING_LITERALS] = {};
        this.aCount[EPrimaryExpressionCategories.N_NULL_AND_BOOLEAN_LITERALS] =
            {};
        /**
         * Identifier names found within the elements.
         * @type {!Array.<string>}
         */
        this.aIdentifiers = [];
        /**
         * Prefixed representation Strings of each primitive value that could be
         * consolidated within the elements.
         * @type {!Array.<string>}
         */
        this.aPrimitiveValues = [];
      },
      /**
       * A record consisting of data about a primitive value that could be
       * consolidated.
       * @constructor
       * @nosideeffects
       */
      TPrimitiveValue = function() {
        /**
         * The difference in the number of terminal symbols between the original
         * source text and the one with the primitive value consolidated. If the
         * difference is positive, the primitive value is considered worthwhile.
         * @type {number}
         */
        this.nSaving = 0;
        /**
         * An identifier name of the variable that will be declared and assigned
         * the primitive value if the primitive value is consolidated.
         * @type {string}
         */
        this.sName = '';
      },
      /**
       * A record consisting of data on what to consolidate within the range of
       * source elements that is currently being considered.
       * @constructor
       * @nosideeffects
       */
      TSolution = function() {
        /**
         * An object whose keys are prefixed representation Strings of each
         * primitive value that could be consolidated within the elements and
         * whose values are corresponding data about those primitive values.
         * @type {!Object.<string, {nSaving: number, sName: string}>}
         * @see TPrimitiveValue
         */
        this.oPrimitiveValues = {};
        /**
         * The difference in the number of terminal symbols between the original
         * source text and the one with all the worthwhile primitive values
         * consolidated.
         * @type {number}
         * @see TPrimitiveValue#nSaving
         */
        this.nSavings = 0;
      },
      /**
       * The processor of <abbr title="abstract syntax tree">AST</abbr>s found
       * in UglifyJS.
       * @namespace
       * @type {!TProcessor}
       */
      oProcessor = (/** @type {!TProcessor} */ require('./process')),
      /**
       * A record consisting of a number of constants that represent the
       * difference in the number of terminal symbols between a source text with
       * a modified syntactic code unit and the original one.
       * @namespace
       * @type {!Object.<string, number>}
       */
      oWeights = {
        /**
         * The difference in the number of punctuators required by the bracket
         * notation and the dot notation.
         * <p><code>'[]'.length - '.'.length</code></p>
         * @const
         * @type {number}
         */
        N_PROPERTY_ACCESSOR: 1,
        /**
         * The number of punctuators required by a variable declaration with an
         * initialiser.
         * <p><code>':'.length + ';'.length</code></p>
         * @const
         * @type {number}
         */
        N_VARIABLE_DECLARATION: 2,
        /**
         * The number of terminal symbols required to introduce a variable
         * statement (excluding its variable declaration list).
         * <p><code>'var '.length</code></p>
         * @const
         * @type {number}
         */
        N_VARIABLE_STATEMENT_AFFIXATION: 4,
        /**
         * The number of terminal symbols needed to enclose source elements
         * within a function call with no argument values to a function with an
         * empty parameter list.
         * <p><code>'(function(){}());'.length</code></p>
         * @const
         * @type {number}
         */
        N_CLOSURE: 17
      },
      /**
       * Categories of primary expressions from which primitive values that
       * could be consolidated are derivable.
       * @namespace
       * @enum {number}
       */
      EPrimaryExpressionCategories = {
        /**
         * Identifier names used as property accessors.
         * @type {number}
         */
        N_IDENTIFIER_NAMES: 0,
        /**
         * String literals.
         * @type {number}
         */
        N_STRING_LITERALS: 1,
        /**
         * Null and Boolean literals.
         * @type {number}
         */
        N_NULL_AND_BOOLEAN_LITERALS: 2
      },
      /**
       * Prefixes of primitive values that could be consolidated.
       * The String values of the prefixes must have same number of characters.
       * The prefixes must not be used in any properties defined in any version
       * of <a href=
       * "http://www.ecma-international.org/publications/standards/Ecma-262.htm"
       * >ECMA-262</a>.
       * @namespace
       * @enum {string}
       */
      EValuePrefixes = {
        /**
         * Identifies String values.
         * @type {string}
         */
        S_STRING: '#S',
        /**
         * Identifies null and Boolean values.
         * @type {string}
         */
        S_SYMBOLIC: '#O'
      },
      /**
       * Categories of source elements in terms of their appropriateness of
       * having their primitive values consolidated.
       * @namespace
       * @enum {number}
       */
      ESourceElementCategories = {
        /**
         * Identifies a source element that includes the <a href=
         * "http://es5.github.com/#x12.10">{@code with}</a> statement.
         * @type {number}
         */
        N_WITH: 0,
        /**
         * Identifies a source element that includes the <a href=
         * "http://es5.github.com/#x15.1.2.1">{@code eval}</a> identifier name.
         * @type {number}
         */
        N_EVAL: 1,
        /**
         * Identifies a source element that must be excluded from the process
         * unless its whole scope is examined.
         * @type {number}
         */
        N_EXCLUDABLE: 2,
        /**
         * Identifies source elements not posing any problems.
         * @type {number}
         */
        N_OTHER: 3
      },
      /**
       * The list of literals (other than the String ones) whose primitive
       * values can be consolidated.
       * @const
       * @type {!Array.<string>}
       */
      A_OTHER_SUBSTITUTABLE_LITERALS = [
        'null',   // The null literal.
        'false',  // The Boolean literal {@code false}.
        'true'    // The Boolean literal {@code true}.
      ];

  (/**
    * Consolidates all worthwhile primitive values in a syntactic code unit.
    * @param {!TSyntacticCodeUnit} oSyntacticCodeUnit An array-like object
    *     representing the branch of the abstract syntax tree representing the
    *     syntactic code unit along with its scope.
    * @see TPrimitiveValue#nSaving
    */
   function fExamineSyntacticCodeUnit(oSyntacticCodeUnit) {
     var _,
         /**
          * Indicates whether the syntactic code unit represents global code.
          * @type {boolean}
          */
         bIsGlobal = 'toplevel' === oSyntacticCodeUnit[0],
         /**
          * Indicates whether the whole scope is being examined.
          * @type {boolean}
          */
         bIsWhollyExaminable = !bIsGlobal,
         /**
          * An array-like object representing source elements that constitute a
          * syntactic code unit.
          * @type {!TSyntacticCodeUnit}
          */
         oSourceElements,
         /**
          * A record consisting of data about the source element that is
          * currently being examined.
          * @type {!TSourceElementsData}
          */
         oSourceElementData,
         /**
          * The scope of the syntactic code unit.
          * @type {!TScope}
          */
         oScope,
         /**
          * An instance of an object that allows the traversal of an <abbr
          * title="abstract syntax tree">AST</abbr>.
          * @type {!TWalker}
          */
         oWalker,
         /**
          * An object encompassing collections of functions used during the
          * traversal of an <abbr title="abstract syntax tree">AST</abbr>.
          * @namespace
          * @type {!Object.<string, !Object.<string, function(...[*])>>}
          */
         oWalkers = {
           /**
            * A collection of functions used during the surveyance of source
            * elements.
            * @namespace
            * @type {!Object.<string, function(...[*])>}
            */
           oSurveySourceElement: {
             /**#nocode+*/  // JsDoc Toolkit 2.4.0 hides some of the keys.
             /**
              * Classifies the source element as excludable if it does not
              * contain a {@code with} statement or the {@code eval} identifier
              * name. Adds the identifier of the function and its formal
              * parameters to the list of identifier names found.
              * @param {string} sIdentifier The identifier of the function.
              * @param {!Array.<string>} aFormalParameterList Formal parameters.
              * @param {!TSyntacticCodeUnit} oFunctionBody Function code.
              */
             'defun': function(
                 sIdentifier,
                 aFormalParameterList,
                 oFunctionBody) {
               fClassifyAsExcludable();
               fAddIdentifier(sIdentifier);
               aFormalParameterList.forEach(fAddIdentifier);
             },
             /**
              * Increments the count of the number of occurrences of the String
              * value that is equivalent to the sequence of terminal symbols
              * that constitute the encountered identifier name.
              * @param {!TSyntacticCodeUnit} oExpression The nonterminal
              *     MemberExpression.
              * @param {string} sIdentifierName The identifier name used as the
              *     property accessor.
              * @return {!Array} The encountered branch of an <abbr title=
              *     "abstract syntax tree">AST</abbr> with its nonterminal
              *     MemberExpression traversed.
              */
             'dot': function(oExpression, sIdentifierName) {
               fCountPrimaryExpression(
                   EPrimaryExpressionCategories.N_IDENTIFIER_NAMES,
                   EValuePrefixes.S_STRING + sIdentifierName);
               return ['dot', oWalker.walk(oExpression), sIdentifierName];
             },
             /**
              * Adds the optional identifier of the function and its formal
              * parameters to the list of identifier names found.
              * @param {?string} sIdentifier The optional identifier of the
              *     function.
              * @param {!Array.<string>} aFormalParameterList Formal parameters.
              * @param {!TSyntacticCodeUnit} oFunctionBody Function code.
              */
             'function': function(
                 sIdentifier,
                 aFormalParameterList,
                 oFunctionBody) {
               if ('string' === typeof sIdentifier) {
                 fAddIdentifier(sIdentifier);
               }
               aFormalParameterList.forEach(fAddIdentifier);
             },
             /**
              * Either increments the count of the number of occurrences of the
              * encountered null or Boolean value or classifies a source element
              * as containing the {@code eval} identifier name.
              * @param {string} sIdentifier The identifier encountered.
              */
             'name': function(sIdentifier) {
               if (-1 !== A_OTHER_SUBSTITUTABLE_LITERALS.indexOf(sIdentifier)) {
                 fCountPrimaryExpression(
                     EPrimaryExpressionCategories.N_NULL_AND_BOOLEAN_LITERALS,
                     EValuePrefixes.S_SYMBOLIC + sIdentifier);
               } else {
                 if ('eval' === sIdentifier) {
                   oSourceElementData.nCategory =
                       ESourceElementCategories.N_EVAL;
                 }
                 fAddIdentifier(sIdentifier);
               }
             },
             /**
              * Classifies the source element as excludable if it does not
              * contain a {@code with} statement or the {@code eval} identifier
              * name.
              * @param {TSyntacticCodeUnit} oExpression The expression whose
              *     value is to be returned.
              */
             'return': function(oExpression) {
               fClassifyAsExcludable();
             },
             /**
              * Increments the count of the number of occurrences of the
              * encountered String value.
              * @param {string} sStringValue The String value of the string
              *     literal encountered.
              */
             'string': function(sStringValue) {
               if (sStringValue.length > 0) {
                 fCountPrimaryExpression(
                     EPrimaryExpressionCategories.N_STRING_LITERALS,
                     EValuePrefixes.S_STRING + sStringValue);
               }
             },
             /**
              * Adds the identifier reserved for an exception to the list of
              * identifier names found.
              * @param {!TSyntacticCodeUnit} oTry A block of code in which an
              *     exception can occur.
              * @param {Array} aCatch The identifier reserved for an exception
              *     and a block of code to handle the exception.
              * @param {TSyntacticCodeUnit} oFinally An optional block of code
              *     to be evaluated regardless of whether an exception occurs.
              */
             'try': function(oTry, aCatch, oFinally) {
               if (Array.isArray(aCatch)) {
                 fAddIdentifier(aCatch[0]);
               }
             },
             /**
              * Classifies the source element as excludable if it does not
              * contain a {@code with} statement or the {@code eval} identifier
              * name. Adds the identifier of each declared variable to the list
              * of identifier names found.
              * @param {!Array.<!Array>} aVariableDeclarationList Variable
              *     declarations.
              */
             'var': function(aVariableDeclarationList) {
               fClassifyAsExcludable();
               aVariableDeclarationList.forEach(fAddVariable);
             },
             /**
              * Classifies a source element as containing the {@code with}
              * statement.
              * @param {!TSyntacticCodeUnit} oExpression An expression whose
              *     value is to be converted to a value of type Object and
              *     become the binding object of a new object environment
              *     record of a new lexical environment in which the statement
              *     is to be executed.
              * @param {!TSyntacticCodeUnit} oStatement The statement to be
              *     executed in the augmented lexical environment.
              * @return {!Array} An empty array to stop the traversal.
              */
             'with': function(oExpression, oStatement) {
               oSourceElementData.nCategory = ESourceElementCategories.N_WITH;
               return [];
             }
             /**#nocode-*/  // JsDoc Toolkit 2.4.0 hides some of the keys.
           },
           /**
            * A collection of functions used while looking for nested functions.
            * @namespace
            * @type {!Object.<string, function(...[*])>}
            */
           oExamineFunctions: {
             /**#nocode+*/  // JsDoc Toolkit 2.4.0 hides some of the keys.
             /**
              * Orders an examination of a nested function declaration.
              * @this {!TSyntacticCodeUnit} An array-like object representing
              *     the branch of an <abbr title="abstract syntax tree"
              *     >AST</abbr> representing the syntactic code unit along with
              *     its scope.
              * @return {!Array} An empty array to stop the traversal.
              */
             'defun': function() {
               fExamineSyntacticCodeUnit(this);
               return [];
             },
             /**
              * Orders an examination of a nested function expression.
              * @this {!TSyntacticCodeUnit} An array-like object representing
              *     the branch of an <abbr title="abstract syntax tree"
              *     >AST</abbr> representing the syntactic code unit along with
              *     its scope.
              * @return {!Array} An empty array to stop the traversal.
              */
             'function': function() {
               fExamineSyntacticCodeUnit(this);
               return [];
             }
             /**#nocode-*/  // JsDoc Toolkit 2.4.0 hides some of the keys.
           }
         },
         /**
          * Records containing data about source elements.
          * @type {Array.<TSourceElementsData>}
          */
         aSourceElementsData = [],
         /**
          * The index (in the source text order) of the source element
          * immediately following a <a href="http://es5.github.com/#x14.1"
          * >Directive Prologue</a>.
          * @type {number}
          */
         nAfterDirectivePrologue = 0,
         /**
          * The index (in the source text order) of the source element that is
          * currently being considered.
          * @type {number}
          */
         nPosition,
         /**
          * The index (in the source text order) of the source element that is
          * the last element of the range of source elements that is currently
          * being considered.
          * @type {(undefined|number)}
          */
         nTo,
         /**
          * Initiates the traversal of a source element.
          * @param {!TWalker} oWalker An instance of an object that allows the
          *     traversal of an abstract syntax tree.
          * @param {!TSyntacticCodeUnit} oSourceElement A source element from
          *     which the traversal should commence.
          * @return {function(): !TSyntacticCodeUnit} A function that is able to
          *     initiate the traversal from a given source element.
          */
         cContext = function(oWalker, oSourceElement) {
           /**
            * @return {!TSyntacticCodeUnit} A function that is able to
            *     initiate the traversal from a given source element.
            */
           var fLambda = function() {
             return oWalker.walk(oSourceElement);
           };

           return fLambda;
         },
         /**
          * Classifies the source element as excludable if it does not
          * contain a {@code with} statement or the {@code eval} identifier
          * name.
          */
         fClassifyAsExcludable = function() {
           if (oSourceElementData.nCategory ===
               ESourceElementCategories.N_OTHER) {
             oSourceElementData.nCategory =
                 ESourceElementCategories.N_EXCLUDABLE;
           }
         },
         /**
          * Adds an identifier to the list of identifier names found.
          * @param {string} sIdentifier The identifier to be added.
          */
         fAddIdentifier = function(sIdentifier) {
           if (-1 === oSourceElementData.aIdentifiers.indexOf(sIdentifier)) {
             oSourceElementData.aIdentifiers.push(sIdentifier);
           }
         },
         /**
          * Adds the identifier of a variable to the list of identifier names
          * found.
          * @param {!Array} aVariableDeclaration A variable declaration.
          */
         fAddVariable = function(aVariableDeclaration) {
           fAddIdentifier(/** @type {string} */ aVariableDeclaration[0]);
         },
         /**
          * Increments the count of the number of occurrences of the prefixed
          * String representation attributed to the primary expression.
          * @param {number} nCategory The category of the primary expression.
          * @param {string} sName The prefixed String representation attributed
          *     to the primary expression.
          */
         fCountPrimaryExpression = function(nCategory, sName) {
           if (!oSourceElementData.aCount[nCategory].hasOwnProperty(sName)) {
             oSourceElementData.aCount[nCategory][sName] = 0;
             if (-1 === oSourceElementData.aPrimitiveValues.indexOf(sName)) {
               oSourceElementData.aPrimitiveValues.push(sName);
             }
           }
           oSourceElementData.aCount[nCategory][sName] += 1;
         },
         /**
          * Consolidates all worthwhile primitive values in a range of source
          *     elements.
          * @param {number} nFrom The index (in the source text order) of the
          *     source element that is the first element of the range.
          * @param {number} nTo The index (in the source text order) of the
          *     source element that is the last element of the range.
          * @param {boolean} bEnclose Indicates whether the range should be
          *     enclosed within a function call with no argument values to a
          *     function with an empty parameter list if any primitive values
          *     are consolidated.
          * @see TPrimitiveValue#nSaving
          */
         fExamineSourceElements = function(nFrom, nTo, bEnclose) {
           var _,
               /**
                * The index of the last mangled name.
                * @type {number}
                */
               nIndex = oScope.cname,
               /**
                * The index of the source element that is currently being
                * considered.
                * @type {number}
                */
               nPosition,
               /**
                * A collection of functions used during the consolidation of
                * primitive values and identifier names used as property
                * accessors.
                * @namespace
                * @type {!Object.<string, function(...[*])>}
                */
               oWalkersTransformers = {
                 /**
                  * If the String value that is equivalent to the sequence of
                  * terminal symbols that constitute the encountered identifier
                  * name is worthwhile, a syntactic conversion from the dot
                  * notation to the bracket notation ensues with that sequence
                  * being substituted by an identifier name to which the value
                  * is assigned.
                  * Applies to property accessors that use the dot notation.
                  * @param {!TSyntacticCodeUnit} oExpression The nonterminal
                  *     MemberExpression.
                  * @param {string} sIdentifierName The identifier name used as
                  *     the property accessor.
                  * @return {!Array} A syntactic code unit that is equivalent to
                  *     the one encountered.
                  * @see TPrimitiveValue#nSaving
                  */
                 'dot': function(oExpression, sIdentifierName) {
                   /**
                    * The prefixed String value that is equivalent to the
                    * sequence of terminal symbols that constitute the
                    * encountered identifier name.
                    * @type {string}
                    */
                   var sPrefixed = EValuePrefixes.S_STRING + sIdentifierName;

                   return oSolutionBest.oPrimitiveValues.hasOwnProperty(
                       sPrefixed) &&
                       oSolutionBest.oPrimitiveValues[sPrefixed].nSaving > 0 ?
                       ['sub',
                        oWalker.walk(oExpression),
                        ['name',
                         oSolutionBest.oPrimitiveValues[sPrefixed].sName]] :
                       ['dot', oWalker.walk(oExpression), sIdentifierName];
                 },
                 /**
                  * If the encountered identifier is a null or Boolean literal
                  * and its value is worthwhile, the identifier is substituted
                  * by an identifier name to which that value is assigned.
                  * Applies to identifier names.
                  * @param {string} sIdentifier The identifier encountered.
                  * @return {!Array} A syntactic code unit that is equivalent to
                  *     the one encountered.
                  * @see TPrimitiveValue#nSaving
                  */
                 'name': function(sIdentifier) {
                   /**
                    * The prefixed representation String of the identifier.
                    * @type {string}
                    */
                   var sPrefixed = EValuePrefixes.S_SYMBOLIC + sIdentifier;

                   return [
                     'name',
                     oSolutionBest.oPrimitiveValues.hasOwnProperty(sPrefixed) &&
                     oSolutionBest.oPrimitiveValues[sPrefixed].nSaving > 0 ?
                     oSolutionBest.oPrimitiveValues[sPrefixed].sName :
                     sIdentifier
                   ];
                 },
                 /**
                  * If the encountered String value is worthwhile, it is
                  * substituted by an identifier name to which that value is
                  * assigned.
                  * Applies to String values.
                  * @param {string} sStringValue The String value of the string
                  *     literal encountered.
                  * @return {!Array} A syntactic code unit that is equivalent to
                  *     the one encountered.
                  * @see TPrimitiveValue#nSaving
                  */
                 'string': function(sStringValue) {
                   /**
                    * The prefixed representation String of the primitive value
                    * of the literal.
                    * @type {string}
                    */
                   var sPrefixed =
                       EValuePrefixes.S_STRING + sStringValue;

                   return oSolutionBest.oPrimitiveValues.hasOwnProperty(
                       sPrefixed) &&
                       oSolutionBest.oPrimitiveValues[sPrefixed].nSaving > 0 ?
                       ['name',
                        oSolutionBest.oPrimitiveValues[sPrefixed].sName] :
                       ['string', sStringValue];
                 }
               },
               /**
                * Such data on what to consolidate within the range of source
                * elements that is currently being considered that lead to the
                * greatest known reduction of the number of the terminal symbols
                * in comparison to the original source text.
                * @type {!TSolution}
                */
               oSolutionBest = new TSolution(),
               /**
                * Data representing an ongoing attempt to find a better
                * reduction of the number of the terminal symbols in comparison
                * to the original source text than the best one that is
                * currently known.
                * @type {!TSolution}
                * @see oSolutionBest
                */
               oSolutionCandidate = new TSolution(),
               /**
                * A record consisting of data about the range of source elements
                * that is currently being examined.
                * @type {!TSourceElementsData}
                */
               oSourceElementsData = new TSourceElementsData(),
               /**
                * Variable declarations for each primitive value that is to be
                * consolidated within the elements.
                * @type {!Array.<!Array>}
                */
               aVariableDeclarations = [],
               /**
                * Augments a list with a prefixed representation String.
                * @param {!Array.<string>} aList A list that is to be augmented.
                * @return {function(string)} A function that augments a list
                *     with a prefixed representation String.
                */
               cAugmentList = function(aList) {
                 /**
                  * @param {string} sPrefixed Prefixed representation String of
                  *     a primitive value that could be consolidated within the
                  *     elements.
                  */
                 var fLambda = function(sPrefixed) {
                   if (-1 === aList.indexOf(sPrefixed)) {
                     aList.push(sPrefixed);
                   }
                 };

                 return fLambda;
               },
               /**
                * Adds the number of occurrences of a primitive value of a given
                * category that could be consolidated in the source element with
                * a given index to the count of occurrences of that primitive
                * value within the range of source elements that is currently
                * being considered.
                * @param {number} nPosition The index (in the source text order)
                *     of a source element.
                * @param {number} nCategory The category of the primary
                *     expression from which the primitive value is derived.
                * @return {function(string)} A function that performs the
                *     addition.
                * @see cAddOccurrencesInCategory
                */
               cAddOccurrences = function(nPosition, nCategory) {
                 /**
                  * @param {string} sPrefixed The prefixed representation String
                  *     of a primitive value.
                  */
                 var fLambda = function(sPrefixed) {
                   if (!oSourceElementsData.aCount[nCategory].hasOwnProperty(
                           sPrefixed)) {
                     oSourceElementsData.aCount[nCategory][sPrefixed] = 0;
                   }
                   oSourceElementsData.aCount[nCategory][sPrefixed] +=
                       aSourceElementsData[nPosition].aCount[nCategory][
                           sPrefixed];
                 };

                 return fLambda;
               },
               /**
                * Adds the number of occurrences of each primitive value of a
                * given category that could be consolidated in the source
                * element with a given index to the count of occurrences of that
                * primitive values within the range of source elements that is
                * currently being considered.
                * @param {number} nPosition The index (in the source text order)
                *     of a source element.
                * @return {function(number)} A function that performs the
                *     addition.
                * @see fAddOccurrences
                */
               cAddOccurrencesInCategory = function(nPosition) {
                 /**
                  * @param {number} nCategory The category of the primary
                  *     expression from which the primitive value is derived.
                  */
                 var fLambda = function(nCategory) {
                   Object.keys(
                       aSourceElementsData[nPosition].aCount[nCategory]
                   ).forEach(cAddOccurrences(nPosition, nCategory));
                 };

                 return fLambda;
               },
               /**
                * Adds the number of occurrences of each primitive value that
                * could be consolidated in the source element with a given index
                * to the count of occurrences of that primitive values within
                * the range of source elements that is currently being
                * considered.
                * @param {number} nPosition The index (in the source text order)
                *     of a source element.
                */
               fAddOccurrences = function(nPosition) {
                 Object.keys(aSourceElementsData[nPosition].aCount).forEach(
                     cAddOccurrencesInCategory(nPosition));
               },
               /**
                * Creates a variable declaration for a primitive value if that
                * primitive value is to be consolidated within the elements.
                * @param {string} sPrefixed Prefixed representation String of a
                *     primitive value that could be consolidated within the
                *     elements.
                * @see aVariableDeclarations
                */
               cAugmentVariableDeclarations = function(sPrefixed) {
                 if (oSolutionBest.oPrimitiveValues[sPrefixed].nSaving > 0) {
                   aVariableDeclarations.push([
                     oSolutionBest.oPrimitiveValues[sPrefixed].sName,
                     [0 === sPrefixed.indexOf(EValuePrefixes.S_SYMBOLIC) ?
                      'name' : 'string',
                      sPrefixed.substring(EValuePrefixes.S_SYMBOLIC.length)]
                   ]);
                 }
               },
               /**
                * Sorts primitive values with regard to the difference in the
                * number of terminal symbols between the original source text
                * and the one with those primitive values consolidated.
                * @param {string} sPrefixed0 The prefixed representation String
                *     of the first of the two primitive values that are being
                *     compared.
                * @param {string} sPrefixed1 The prefixed representation String
                *     of the second of the two primitive values that are being
                *     compared.
                * @return {number}
                *     <dl>
                *         <dt>-1</dt>
                *         <dd>if the first primitive value must be placed before
                *              the other one,</dd>
                *         <dt>0</dt>
                *         <dd>if the first primitive value may be placed before
                *              the other one,</dd>
                *         <dt>1</dt>
                *         <dd>if the first primitive value must not be placed
                *              before the other one.</dd>
                *     </dl>
                * @see TSolution.oPrimitiveValues
                */
               cSortPrimitiveValues = function(sPrefixed0, sPrefixed1) {
                 /**
                  * The difference between:
                  * <ol>
                  * <li>the difference in the number of terminal symbols
                  *     between the original source text and the one with the
                  *     first primitive value consolidated, and</li>
                  * <li>the difference in the number of terminal symbols
                  *     between the original source text and the one with the
                  *     second primitive value consolidated.</li>
                  * </ol>
                  * @type {number}
                  */
                 var nDifference =
                     oSolutionCandidate.oPrimitiveValues[sPrefixed0].nSaving -
                     oSolutionCandidate.oPrimitiveValues[sPrefixed1].nSaving;

                 return nDifference > 0 ? -1 : nDifference < 0 ? 1 : 0;
               },
               /**
                * Assigns an identifier name to a primitive value and calculates
                * whether instances of that primitive value are worth
                * consolidating.
                * @param {string} sPrefixed The prefixed representation String
                *     of a primitive value that is being evaluated.
                */
               fEvaluatePrimitiveValue = function(sPrefixed) {
                 var _,
                     /**
                      * The index of the last mangled name.
                      * @type {number}
                      */
                     nIndex,
                     /**
                      * The representation String of the primitive value that is
                      * being evaluated.
                      * @type {string}
                      */
                     sName =
                         sPrefixed.substring(EValuePrefixes.S_SYMBOLIC.length),
                     /**
                      * The number of source characters taken up by the
                      * representation String of the primitive value that is
                      * being evaluated.
                      * @type {number}
                      */
                     nLengthOriginal = sName.length,
                     /**
                      * The number of source characters taken up by the
                      * identifier name that could substitute the primitive
                      * value that is being evaluated.
                      * substituted.
                      * @type {number}
                      */
                     nLengthSubstitution,
                     /**
                      * The number of source characters taken up by by the
                      * representation String of the primitive value that is
                      * being evaluated when it is represented by a string
                      * literal.
                      * @type {number}
                      */
                     nLengthString = oProcessor.make_string(sName).length;

                 oSolutionCandidate.oPrimitiveValues[sPrefixed] =
                     new TPrimitiveValue();
                 do {  // Find an identifier unused in this or any nested scope.
                   nIndex = oScope.cname;
                   oSolutionCandidate.oPrimitiveValues[sPrefixed].sName =
                       oScope.next_mangled();
                 } while (-1 !== oSourceElementsData.aIdentifiers.indexOf(
                     oSolutionCandidate.oPrimitiveValues[sPrefixed].sName));
                 nLengthSubstitution = oSolutionCandidate.oPrimitiveValues[
                     sPrefixed].sName.length;
                 if (0 === sPrefixed.indexOf(EValuePrefixes.S_SYMBOLIC)) {
                   // foo:null, or foo:null;
                   oSolutionCandidate.oPrimitiveValues[sPrefixed].nSaving -=
                       nLengthSubstitution + nLengthOriginal +
                       oWeights.N_VARIABLE_DECLARATION;
                   // null vs foo
                   oSolutionCandidate.oPrimitiveValues[sPrefixed].nSaving +=
                       oSourceElementsData.aCount[
                           EPrimaryExpressionCategories.
                               N_NULL_AND_BOOLEAN_LITERALS][sPrefixed] *
                       (nLengthOriginal - nLengthSubstitution);
                 } else {
                   // foo:'fromCharCode';
                   oSolutionCandidate.oPrimitiveValues[sPrefixed].nSaving -=
                       nLengthSubstitution + nLengthString +
                       oWeights.N_VARIABLE_DECLARATION;
                   // .fromCharCode vs [foo]
                   if (oSourceElementsData.aCount[
                           EPrimaryExpressionCategories.N_IDENTIFIER_NAMES
                       ].hasOwnProperty(sPrefixed)) {
                     oSolutionCandidate.oPrimitiveValues[sPrefixed].nSaving +=
                         oSourceElementsData.aCount[
                             EPrimaryExpressionCategories.N_IDENTIFIER_NAMES
                         ][sPrefixed] *
                         (nLengthOriginal - nLengthSubstitution -
                          oWeights.N_PROPERTY_ACCESSOR);
                   }
                   // 'fromCharCode' vs foo
                   if (oSourceElementsData.aCount[
                           EPrimaryExpressionCategories.N_STRING_LITERALS
                       ].hasOwnProperty(sPrefixed)) {
                     oSolutionCandidate.oPrimitiveValues[sPrefixed].nSaving +=
                         oSourceElementsData.aCount[
                             EPrimaryExpressionCategories.N_STRING_LITERALS
                         ][sPrefixed] *
                         (nLengthString - nLengthSubstitution);
                   }
                 }
                 if (oSolutionCandidate.oPrimitiveValues[sPrefixed].nSaving >
                     0) {
                   oSolutionCandidate.nSavings +=
                       oSolutionCandidate.oPrimitiveValues[sPrefixed].nSaving;
                 } else {
                   oScope.cname = nIndex; // Free the identifier name.
                 }
               },
               /**
                * Adds a variable declaration to an existing variable statement.
                * @param {!Array} aVariableDeclaration A variable declaration
                *     with an initialiser.
                */
               cAddVariableDeclaration = function(aVariableDeclaration) {
                 (/** @type {!Array} */ oSourceElements[nFrom][1]).unshift(
                     aVariableDeclaration);
               };

           if (nFrom > nTo) {
             return;
           }
           // If the range is a closure, reuse the closure.
           if (nFrom === nTo &&
               'stat' === oSourceElements[nFrom][0] &&
               'call' === oSourceElements[nFrom][1][0] &&
               'function' === oSourceElements[nFrom][1][1][0]) {
             fExamineSyntacticCodeUnit(oSourceElements[nFrom][1][1]);
             return;
           }
           // Create a list of all derived primitive values within the range.
           for (nPosition = nFrom; nPosition <= nTo; nPosition += 1) {
             aSourceElementsData[nPosition].aPrimitiveValues.forEach(
                 cAugmentList(oSourceElementsData.aPrimitiveValues));
           }
           if (0 === oSourceElementsData.aPrimitiveValues.length) {
             return;
           }
           for (nPosition = nFrom; nPosition <= nTo; nPosition += 1) {
             // Add the number of occurrences to the total count.
             fAddOccurrences(nPosition);
             // Add identifiers of this or any nested scope to the list.
             aSourceElementsData[nPosition].aIdentifiers.forEach(
                 cAugmentList(oSourceElementsData.aIdentifiers));
           }
           // Distribute identifier names among derived primitive values.
           do {  // If there was any progress, find a better distribution.
             oSolutionBest = oSolutionCandidate;
             if (Object.keys(oSolutionCandidate.oPrimitiveValues).length > 0) {
               // Sort primitive values descending by their worthwhileness.
               oSourceElementsData.aPrimitiveValues.sort(cSortPrimitiveValues);
             }
             oSolutionCandidate = new TSolution();
             oSourceElementsData.aPrimitiveValues.forEach(
                 fEvaluatePrimitiveValue);
             oScope.cname = nIndex;
           } while (oSolutionCandidate.nSavings > oSolutionBest.nSavings);
           // Take the necessity of adding a variable statement into account.
           if ('var' !== oSourceElements[nFrom][0]) {
             oSolutionBest.nSavings -= oWeights.N_VARIABLE_STATEMENT_AFFIXATION;
           }
           if (bEnclose) {
             // Take the necessity of forming a closure into account.
             oSolutionBest.nSavings -= oWeights.N_CLOSURE;
           }
           if (oSolutionBest.nSavings > 0) {
             // Create variable declarations suitable for UglifyJS.
             Object.keys(oSolutionBest.oPrimitiveValues).forEach(
                 cAugmentVariableDeclarations);
             // Rewrite expressions that contain worthwhile primitive values.
             for (nPosition = nFrom; nPosition <= nTo; nPosition += 1) {
               oWalker = oProcessor.ast_walker();
               oSourceElements[nPosition] =
                   oWalker.with_walkers(
                       oWalkersTransformers,
                       cContext(oWalker, oSourceElements[nPosition]));
             }
             if ('var' === oSourceElements[nFrom][0]) {  // Reuse the statement.
               (/** @type {!Array.<!Array>} */ aVariableDeclarations.reverse(
                   )).forEach(cAddVariableDeclaration);
             } else {  // Add a variable statement.
               Array.prototype.splice.call(
                   oSourceElements,
                   nFrom,
                   0,
                   ['var', aVariableDeclarations]);
               nTo += 1;
             }
             if (bEnclose) {
               // Add a closure.
               Array.prototype.splice.call(
                   oSourceElements,
                   nFrom,
                   0,
                   ['stat', ['call', ['function', null, [], []], []]]);
               // Copy source elements into the closure.
               for (nPosition = nTo + 1; nPosition > nFrom; nPosition -= 1) {
                 Array.prototype.unshift.call(
                     oSourceElements[nFrom][1][1][3],
                     oSourceElements[nPosition]);
               }
               // Remove source elements outside the closure.
               Array.prototype.splice.call(
                   oSourceElements,
                   nFrom + 1,
                   nTo - nFrom + 1);
             }
           }
           if (bEnclose) {
             // Restore the availability of identifier names.
             oScope.cname = nIndex;
           }
         };

     oSourceElements = (/** @type {!TSyntacticCodeUnit} */
         oSyntacticCodeUnit[bIsGlobal ? 1 : 3]);
     if (0 === oSourceElements.length) {
       return;
     }
     oScope = bIsGlobal ? oSyntacticCodeUnit.scope : oSourceElements.scope;
     // Skip a Directive Prologue.
     while (nAfterDirectivePrologue < oSourceElements.length &&
            'directive' === oSourceElements[nAfterDirectivePrologue][0]) {
       nAfterDirectivePrologue += 1;
       aSourceElementsData.push(null);
     }
     if (oSourceElements.length === nAfterDirectivePrologue) {
       return;
     }
     for (nPosition = nAfterDirectivePrologue;
          nPosition < oSourceElements.length;
          nPosition += 1) {
       oSourceElementData = new TSourceElementsData();
       oWalker = oProcessor.ast_walker();
       // Classify a source element.
       // Find its derived primitive values and count their occurrences.
       // Find all identifiers used (including nested scopes).
       oWalker.with_walkers(
           oWalkers.oSurveySourceElement,
           cContext(oWalker, oSourceElements[nPosition]));
       // Establish whether the scope is still wholly examinable.
       bIsWhollyExaminable = bIsWhollyExaminable &&
           ESourceElementCategories.N_WITH !== oSourceElementData.nCategory &&
           ESourceElementCategories.N_EVAL !== oSourceElementData.nCategory;
       aSourceElementsData.push(oSourceElementData);
     }
     if (bIsWhollyExaminable) {  // Examine the whole scope.
       fExamineSourceElements(
           nAfterDirectivePrologue,
           oSourceElements.length - 1,
           false);
     } else {  // Examine unexcluded ranges of source elements.
       for (nPosition = oSourceElements.length - 1;
            nPosition >= nAfterDirectivePrologue;
            nPosition -= 1) {
         oSourceElementData = (/** @type {!TSourceElementsData} */
             aSourceElementsData[nPosition]);
         if (ESourceElementCategories.N_OTHER ===
             oSourceElementData.nCategory) {
           if ('undefined' === typeof nTo) {
             nTo = nPosition;  // Indicate the end of a range.
           }
           // Examine the range if it immediately follows a Directive Prologue.
           if (nPosition === nAfterDirectivePrologue) {
             fExamineSourceElements(nPosition, nTo, true);
           }
         } else {
           if ('undefined' !== typeof nTo) {
             // Examine the range that immediately follows this source element.
             fExamineSourceElements(nPosition + 1, nTo, true);
             nTo = void 0;  // Obliterate the range.
           }
           // Examine nested functions.
           oWalker = oProcessor.ast_walker();
           oWalker.with_walkers(
               oWalkers.oExamineFunctions,
               cContext(oWalker, oSourceElements[nPosition]));
         }
       }
     }
   }(oAbstractSyntaxTree = oProcessor.ast_add_scope(oAbstractSyntaxTree)));
  return oAbstractSyntaxTree;
};
/*jshint sub:false */

/* Local Variables:      */
/* mode: js              */
/* coding: utf-8         */
/* indent-tabs-mode: nil */
/* tab-width: 2          */
/* End:                  */
/* vim: set ft=javascript fenc=utf-8 et ts=2 sts=2 sw=2: */
/* :mode=javascript:noTabs=true:tabSize=2:indentSize=2:deepIndent=true: */


},{"./process":"/Users/Jacob/workspace/scheduler/front-end/node_modules/cldr/node_modules/uglify-js/lib/process.js"}],"/Users/Jacob/workspace/scheduler/front-end/node_modules/cldr/node_modules/uglify-js/lib/parse-js.js":[function(require,module,exports){
/***********************************************************************

  A JavaScript tokenizer / parser / beautifier / compressor.

  This version is suitable for Node.js.  With minimal changes (the
  exports stuff) it should work on any JS platform.

  This file contains the tokenizer/parser.  It is a port to JavaScript
  of parse-js [1], a JavaScript parser library written in Common Lisp
  by Marijn Haverbeke.  Thank you Marijn!

  [1] http://marijn.haverbeke.nl/parse-js/

  Exported functions:

    - tokenizer(code) -- returns a function.  Call the returned
      function to fetch the next token.

    - parse(code) -- returns an AST of the given JavaScript code.

  -------------------------------- (C) ---------------------------------

                           Author: Mihai Bazon
                         <mihai.bazon@gmail.com>
                       http://mihai.bazon.net/blog

  Distributed under the BSD license:

    Copyright 2010 (c) Mihai Bazon <mihai.bazon@gmail.com>
    Based on parse-js (http://marijn.haverbeke.nl/parse-js/).

    Redistribution and use in source and binary forms, with or without
    modification, are permitted provided that the following conditions
    are met:

        * Redistributions of source code must retain the above
          copyright notice, this list of conditions and the following
          disclaimer.

        * Redistributions in binary form must reproduce the above
          copyright notice, this list of conditions and the following
          disclaimer in the documentation and/or other materials
          provided with the distribution.

    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDER “AS IS” AND ANY
    EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
    IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
    PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER BE
    LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY,
    OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
    PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
    PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
    THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
    TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF
    THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF
    SUCH DAMAGE.

 ***********************************************************************/

/* -----[ Tokenizer (constants) ]----- */

var KEYWORDS = array_to_hash([
        "break",
        "case",
        "catch",
        "const",
        "continue",
        "debugger",
        "default",
        "delete",
        "do",
        "else",
        "finally",
        "for",
        "function",
        "if",
        "in",
        "instanceof",
        "new",
        "return",
        "switch",
        "throw",
        "try",
        "typeof",
        "var",
        "void",
        "while",
        "with"
]);

var RESERVED_WORDS = array_to_hash([
        "abstract",
        "boolean",
        "byte",
        "char",
        "class",
        "double",
        "enum",
        "export",
        "extends",
        "final",
        "float",
        "goto",
        "implements",
        "import",
        "int",
        "interface",
        "long",
        "native",
        "package",
        "private",
        "protected",
        "public",
        "short",
        "static",
        "super",
        "synchronized",
        "throws",
        "transient",
        "volatile"
]);

var KEYWORDS_BEFORE_EXPRESSION = array_to_hash([
        "return",
        "new",
        "delete",
        "throw",
        "else",
        "case"
]);

var KEYWORDS_ATOM = array_to_hash([
        "false",
        "null",
        "true",
        "undefined"
]);

var OPERATOR_CHARS = array_to_hash(characters("+-*&%=<>!?|~^"));

var RE_HEX_NUMBER = /^0x[0-9a-f]+$/i;
var RE_OCT_NUMBER = /^0[0-7]+$/;
var RE_DEC_NUMBER = /^\d*\.?\d*(?:e[+-]?\d*(?:\d\.?|\.?\d)\d*)?$/i;

var OPERATORS = array_to_hash([
        "in",
        "instanceof",
        "typeof",
        "new",
        "void",
        "delete",
        "++",
        "--",
        "+",
        "-",
        "!",
        "~",
        "&",
        "|",
        "^",
        "*",
        "/",
        "%",
        ">>",
        "<<",
        ">>>",
        "<",
        ">",
        "<=",
        ">=",
        "==",
        "===",
        "!=",
        "!==",
        "?",
        "=",
        "+=",
        "-=",
        "/=",
        "*=",
        "%=",
        ">>=",
        "<<=",
        ">>>=",
        "|=",
        "^=",
        "&=",
        "&&",
        "||"
]);

var WHITESPACE_CHARS = array_to_hash(characters(" \u00a0\n\r\t\f\u000b\u200b\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000"));

var PUNC_BEFORE_EXPRESSION = array_to_hash(characters("[{(,.;:"));

var PUNC_CHARS = array_to_hash(characters("[]{}(),;:"));

var REGEXP_MODIFIERS = array_to_hash(characters("gmsiy"));

/* -----[ Tokenizer ]----- */

var UNICODE = {  // Unicode 6.1
        letter: new RegExp("[\\u0041-\\u005A\\u0061-\\u007A\\u00AA\\u00B5\\u00BA\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02C1\\u02C6-\\u02D1\\u02E0-\\u02E4\\u02EC\\u02EE\\u0370-\\u0374\\u0376\\u0377\\u037A-\\u037D\\u0386\\u0388-\\u038A\\u038C\\u038E-\\u03A1\\u03A3-\\u03F5\\u03F7-\\u0481\\u048A-\\u0527\\u0531-\\u0556\\u0559\\u0561-\\u0587\\u05D0-\\u05EA\\u05F0-\\u05F2\\u0620-\\u064A\\u066E\\u066F\\u0671-\\u06D3\\u06D5\\u06E5\\u06E6\\u06EE\\u06EF\\u06FA-\\u06FC\\u06FF\\u0710\\u0712-\\u072F\\u074D-\\u07A5\\u07B1\\u07CA-\\u07EA\\u07F4\\u07F5\\u07FA\\u0800-\\u0815\\u081A\\u0824\\u0828\\u0840-\\u0858\\u08A0\\u08A2-\\u08AC\\u0904-\\u0939\\u093D\\u0950\\u0958-\\u0961\\u0971-\\u0977\\u0979-\\u097F\\u0985-\\u098C\\u098F\\u0990\\u0993-\\u09A8\\u09AA-\\u09B0\\u09B2\\u09B6-\\u09B9\\u09BD\\u09CE\\u09DC\\u09DD\\u09DF-\\u09E1\\u09F0\\u09F1\\u0A05-\\u0A0A\\u0A0F\\u0A10\\u0A13-\\u0A28\\u0A2A-\\u0A30\\u0A32\\u0A33\\u0A35\\u0A36\\u0A38\\u0A39\\u0A59-\\u0A5C\\u0A5E\\u0A72-\\u0A74\\u0A85-\\u0A8D\\u0A8F-\\u0A91\\u0A93-\\u0AA8\\u0AAA-\\u0AB0\\u0AB2\\u0AB3\\u0AB5-\\u0AB9\\u0ABD\\u0AD0\\u0AE0\\u0AE1\\u0B05-\\u0B0C\\u0B0F\\u0B10\\u0B13-\\u0B28\\u0B2A-\\u0B30\\u0B32\\u0B33\\u0B35-\\u0B39\\u0B3D\\u0B5C\\u0B5D\\u0B5F-\\u0B61\\u0B71\\u0B83\\u0B85-\\u0B8A\\u0B8E-\\u0B90\\u0B92-\\u0B95\\u0B99\\u0B9A\\u0B9C\\u0B9E\\u0B9F\\u0BA3\\u0BA4\\u0BA8-\\u0BAA\\u0BAE-\\u0BB9\\u0BD0\\u0C05-\\u0C0C\\u0C0E-\\u0C10\\u0C12-\\u0C28\\u0C2A-\\u0C33\\u0C35-\\u0C39\\u0C3D\\u0C58\\u0C59\\u0C60\\u0C61\\u0C85-\\u0C8C\\u0C8E-\\u0C90\\u0C92-\\u0CA8\\u0CAA-\\u0CB3\\u0CB5-\\u0CB9\\u0CBD\\u0CDE\\u0CE0\\u0CE1\\u0CF1\\u0CF2\\u0D05-\\u0D0C\\u0D0E-\\u0D10\\u0D12-\\u0D3A\\u0D3D\\u0D4E\\u0D60\\u0D61\\u0D7A-\\u0D7F\\u0D85-\\u0D96\\u0D9A-\\u0DB1\\u0DB3-\\u0DBB\\u0DBD\\u0DC0-\\u0DC6\\u0E01-\\u0E30\\u0E32\\u0E33\\u0E40-\\u0E46\\u0E81\\u0E82\\u0E84\\u0E87\\u0E88\\u0E8A\\u0E8D\\u0E94-\\u0E97\\u0E99-\\u0E9F\\u0EA1-\\u0EA3\\u0EA5\\u0EA7\\u0EAA\\u0EAB\\u0EAD-\\u0EB0\\u0EB2\\u0EB3\\u0EBD\\u0EC0-\\u0EC4\\u0EC6\\u0EDC-\\u0EDF\\u0F00\\u0F40-\\u0F47\\u0F49-\\u0F6C\\u0F88-\\u0F8C\\u1000-\\u102A\\u103F\\u1050-\\u1055\\u105A-\\u105D\\u1061\\u1065\\u1066\\u106E-\\u1070\\u1075-\\u1081\\u108E\\u10A0-\\u10C5\\u10C7\\u10CD\\u10D0-\\u10FA\\u10FC-\\u1248\\u124A-\\u124D\\u1250-\\u1256\\u1258\\u125A-\\u125D\\u1260-\\u1288\\u128A-\\u128D\\u1290-\\u12B0\\u12B2-\\u12B5\\u12B8-\\u12BE\\u12C0\\u12C2-\\u12C5\\u12C8-\\u12D6\\u12D8-\\u1310\\u1312-\\u1315\\u1318-\\u135A\\u1380-\\u138F\\u13A0-\\u13F4\\u1401-\\u166C\\u166F-\\u167F\\u1681-\\u169A\\u16A0-\\u16EA\\u16EE-\\u16F0\\u1700-\\u170C\\u170E-\\u1711\\u1720-\\u1731\\u1740-\\u1751\\u1760-\\u176C\\u176E-\\u1770\\u1780-\\u17B3\\u17D7\\u17DC\\u1820-\\u1877\\u1880-\\u18A8\\u18AA\\u18B0-\\u18F5\\u1900-\\u191C\\u1950-\\u196D\\u1970-\\u1974\\u1980-\\u19AB\\u19C1-\\u19C7\\u1A00-\\u1A16\\u1A20-\\u1A54\\u1AA7\\u1B05-\\u1B33\\u1B45-\\u1B4B\\u1B83-\\u1BA0\\u1BAE\\u1BAF\\u1BBA-\\u1BE5\\u1C00-\\u1C23\\u1C4D-\\u1C4F\\u1C5A-\\u1C7D\\u1CE9-\\u1CEC\\u1CEE-\\u1CF1\\u1CF5\\u1CF6\\u1D00-\\u1DBF\\u1E00-\\u1F15\\u1F18-\\u1F1D\\u1F20-\\u1F45\\u1F48-\\u1F4D\\u1F50-\\u1F57\\u1F59\\u1F5B\\u1F5D\\u1F5F-\\u1F7D\\u1F80-\\u1FB4\\u1FB6-\\u1FBC\\u1FBE\\u1FC2-\\u1FC4\\u1FC6-\\u1FCC\\u1FD0-\\u1FD3\\u1FD6-\\u1FDB\\u1FE0-\\u1FEC\\u1FF2-\\u1FF4\\u1FF6-\\u1FFC\\u2071\\u207F\\u2090-\\u209C\\u2102\\u2107\\u210A-\\u2113\\u2115\\u2119-\\u211D\\u2124\\u2126\\u2128\\u212A-\\u212D\\u212F-\\u2139\\u213C-\\u213F\\u2145-\\u2149\\u214E\\u2160-\\u2188\\u2C00-\\u2C2E\\u2C30-\\u2C5E\\u2C60-\\u2CE4\\u2CEB-\\u2CEE\\u2CF2\\u2CF3\\u2D00-\\u2D25\\u2D27\\u2D2D\\u2D30-\\u2D67\\u2D6F\\u2D80-\\u2D96\\u2DA0-\\u2DA6\\u2DA8-\\u2DAE\\u2DB0-\\u2DB6\\u2DB8-\\u2DBE\\u2DC0-\\u2DC6\\u2DC8-\\u2DCE\\u2DD0-\\u2DD6\\u2DD8-\\u2DDE\\u2E2F\\u3005-\\u3007\\u3021-\\u3029\\u3031-\\u3035\\u3038-\\u303C\\u3041-\\u3096\\u309D-\\u309F\\u30A1-\\u30FA\\u30FC-\\u30FF\\u3105-\\u312D\\u3131-\\u318E\\u31A0-\\u31BA\\u31F0-\\u31FF\\u3400-\\u4DB5\\u4E00-\\u9FCC\\uA000-\\uA48C\\uA4D0-\\uA4FD\\uA500-\\uA60C\\uA610-\\uA61F\\uA62A\\uA62B\\uA640-\\uA66E\\uA67F-\\uA697\\uA6A0-\\uA6EF\\uA717-\\uA71F\\uA722-\\uA788\\uA78B-\\uA78E\\uA790-\\uA793\\uA7A0-\\uA7AA\\uA7F8-\\uA801\\uA803-\\uA805\\uA807-\\uA80A\\uA80C-\\uA822\\uA840-\\uA873\\uA882-\\uA8B3\\uA8F2-\\uA8F7\\uA8FB\\uA90A-\\uA925\\uA930-\\uA946\\uA960-\\uA97C\\uA984-\\uA9B2\\uA9CF\\uAA00-\\uAA28\\uAA40-\\uAA42\\uAA44-\\uAA4B\\uAA60-\\uAA76\\uAA7A\\uAA80-\\uAAAF\\uAAB1\\uAAB5\\uAAB6\\uAAB9-\\uAABD\\uAAC0\\uAAC2\\uAADB-\\uAADD\\uAAE0-\\uAAEA\\uAAF2-\\uAAF4\\uAB01-\\uAB06\\uAB09-\\uAB0E\\uAB11-\\uAB16\\uAB20-\\uAB26\\uAB28-\\uAB2E\\uABC0-\\uABE2\\uAC00-\\uD7A3\\uD7B0-\\uD7C6\\uD7CB-\\uD7FB\\uF900-\\uFA6D\\uFA70-\\uFAD9\\uFB00-\\uFB06\\uFB13-\\uFB17\\uFB1D\\uFB1F-\\uFB28\\uFB2A-\\uFB36\\uFB38-\\uFB3C\\uFB3E\\uFB40\\uFB41\\uFB43\\uFB44\\uFB46-\\uFBB1\\uFBD3-\\uFD3D\\uFD50-\\uFD8F\\uFD92-\\uFDC7\\uFDF0-\\uFDFB\\uFE70-\\uFE74\\uFE76-\\uFEFC\\uFF21-\\uFF3A\\uFF41-\\uFF5A\\uFF66-\\uFFBE\\uFFC2-\\uFFC7\\uFFCA-\\uFFCF\\uFFD2-\\uFFD7\\uFFDA-\\uFFDC]"),
        combining_mark: new RegExp("[\\u0300-\\u036F\\u0483-\\u0487\\u0591-\\u05BD\\u05BF\\u05C1\\u05C2\\u05C4\\u05C5\\u05C7\\u0610-\\u061A\\u064B-\\u065F\\u0670\\u06D6-\\u06DC\\u06DF-\\u06E4\\u06E7\\u06E8\\u06EA-\\u06ED\\u0711\\u0730-\\u074A\\u07A6-\\u07B0\\u07EB-\\u07F3\\u0816-\\u0819\\u081B-\\u0823\\u0825-\\u0827\\u0829-\\u082D\\u0859-\\u085B\\u08E4-\\u08FE\\u0900-\\u0903\\u093A-\\u093C\\u093E-\\u094F\\u0951-\\u0957\\u0962\\u0963\\u0981-\\u0983\\u09BC\\u09BE-\\u09C4\\u09C7\\u09C8\\u09CB-\\u09CD\\u09D7\\u09E2\\u09E3\\u0A01-\\u0A03\\u0A3C\\u0A3E-\\u0A42\\u0A47\\u0A48\\u0A4B-\\u0A4D\\u0A51\\u0A70\\u0A71\\u0A75\\u0A81-\\u0A83\\u0ABC\\u0ABE-\\u0AC5\\u0AC7-\\u0AC9\\u0ACB-\\u0ACD\\u0AE2\\u0AE3\\u0B01-\\u0B03\\u0B3C\\u0B3E-\\u0B44\\u0B47\\u0B48\\u0B4B-\\u0B4D\\u0B56\\u0B57\\u0B62\\u0B63\\u0B82\\u0BBE-\\u0BC2\\u0BC6-\\u0BC8\\u0BCA-\\u0BCD\\u0BD7\\u0C01-\\u0C03\\u0C3E-\\u0C44\\u0C46-\\u0C48\\u0C4A-\\u0C4D\\u0C55\\u0C56\\u0C62\\u0C63\\u0C82\\u0C83\\u0CBC\\u0CBE-\\u0CC4\\u0CC6-\\u0CC8\\u0CCA-\\u0CCD\\u0CD5\\u0CD6\\u0CE2\\u0CE3\\u0D02\\u0D03\\u0D3E-\\u0D44\\u0D46-\\u0D48\\u0D4A-\\u0D4D\\u0D57\\u0D62\\u0D63\\u0D82\\u0D83\\u0DCA\\u0DCF-\\u0DD4\\u0DD6\\u0DD8-\\u0DDF\\u0DF2\\u0DF3\\u0E31\\u0E34-\\u0E3A\\u0E47-\\u0E4E\\u0EB1\\u0EB4-\\u0EB9\\u0EBB\\u0EBC\\u0EC8-\\u0ECD\\u0F18\\u0F19\\u0F35\\u0F37\\u0F39\\u0F3E\\u0F3F\\u0F71-\\u0F84\\u0F86\\u0F87\\u0F8D-\\u0F97\\u0F99-\\u0FBC\\u0FC6\\u102B-\\u103E\\u1056-\\u1059\\u105E-\\u1060\\u1062-\\u1064\\u1067-\\u106D\\u1071-\\u1074\\u1082-\\u108D\\u108F\\u109A-\\u109D\\u135D-\\u135F\\u1712-\\u1714\\u1732-\\u1734\\u1752\\u1753\\u1772\\u1773\\u17B4-\\u17D3\\u17DD\\u180B-\\u180D\\u18A9\\u1920-\\u192B\\u1930-\\u193B\\u19B0-\\u19C0\\u19C8\\u19C9\\u1A17-\\u1A1B\\u1A55-\\u1A5E\\u1A60-\\u1A7C\\u1A7F\\u1B00-\\u1B04\\u1B34-\\u1B44\\u1B6B-\\u1B73\\u1B80-\\u1B82\\u1BA1-\\u1BAD\\u1BE6-\\u1BF3\\u1C24-\\u1C37\\u1CD0-\\u1CD2\\u1CD4-\\u1CE8\\u1CED\\u1CF2-\\u1CF4\\u1DC0-\\u1DE6\\u1DFC-\\u1DFF\\u20D0-\\u20DC\\u20E1\\u20E5-\\u20F0\\u2CEF-\\u2CF1\\u2D7F\\u2DE0-\\u2DFF\\u302A-\\u302F\\u3099\\u309A\\uA66F\\uA674-\\uA67D\\uA69F\\uA6F0\\uA6F1\\uA802\\uA806\\uA80B\\uA823-\\uA827\\uA880\\uA881\\uA8B4-\\uA8C4\\uA8E0-\\uA8F1\\uA926-\\uA92D\\uA947-\\uA953\\uA980-\\uA983\\uA9B3-\\uA9C0\\uAA29-\\uAA36\\uAA43\\uAA4C\\uAA4D\\uAA7B\\uAAB0\\uAAB2-\\uAAB4\\uAAB7\\uAAB8\\uAABE\\uAABF\\uAAC1\\uAAEB-\\uAAEF\\uAAF5\\uAAF6\\uABE3-\\uABEA\\uABEC\\uABED\\uFB1E\\uFE00-\\uFE0F\\uFE20-\\uFE26]"),
        connector_punctuation: new RegExp("[\\u005F\\u203F\\u2040\\u2054\\uFE33\\uFE34\\uFE4D-\\uFE4F\\uFF3F]"),
        digit: new RegExp("[\\u0030-\\u0039\\u0660-\\u0669\\u06F0-\\u06F9\\u07C0-\\u07C9\\u0966-\\u096F\\u09E6-\\u09EF\\u0A66-\\u0A6F\\u0AE6-\\u0AEF\\u0B66-\\u0B6F\\u0BE6-\\u0BEF\\u0C66-\\u0C6F\\u0CE6-\\u0CEF\\u0D66-\\u0D6F\\u0E50-\\u0E59\\u0ED0-\\u0ED9\\u0F20-\\u0F29\\u1040-\\u1049\\u1090-\\u1099\\u17E0-\\u17E9\\u1810-\\u1819\\u1946-\\u194F\\u19D0-\\u19D9\\u1A80-\\u1A89\\u1A90-\\u1A99\\u1B50-\\u1B59\\u1BB0-\\u1BB9\\u1C40-\\u1C49\\u1C50-\\u1C59\\uA620-\\uA629\\uA8D0-\\uA8D9\\uA900-\\uA909\\uA9D0-\\uA9D9\\uAA50-\\uAA59\\uABF0-\\uABF9\\uFF10-\\uFF19]")
};

function is_letter(ch) {
        return UNICODE.letter.test(ch);
};

function is_digit(ch) {
        ch = ch.charCodeAt(0);
        return ch >= 48 && ch <= 57;
};

function is_unicode_digit(ch) {
        return UNICODE.digit.test(ch);
}

function is_alphanumeric_char(ch) {
        return is_digit(ch) || is_letter(ch);
};

function is_unicode_combining_mark(ch) {
        return UNICODE.combining_mark.test(ch);
};

function is_unicode_connector_punctuation(ch) {
        return UNICODE.connector_punctuation.test(ch);
};

function is_identifier_start(ch) {
        return ch == "$" || ch == "_" || is_letter(ch);
};

function is_identifier_char(ch) {
        return is_identifier_start(ch)
                || is_unicode_combining_mark(ch)
                || is_unicode_digit(ch)
                || is_unicode_connector_punctuation(ch)
                || ch == "\u200c" // zero-width non-joiner <ZWNJ>
                || ch == "\u200d" // zero-width joiner <ZWJ> (in my ECMA-262 PDF, this is also 200c)
        ;
};

function parse_js_number(num) {
        if (RE_HEX_NUMBER.test(num)) {
                return parseInt(num.substr(2), 16);
        } else if (RE_OCT_NUMBER.test(num)) {
                return parseInt(num.substr(1), 8);
        } else if (RE_DEC_NUMBER.test(num)) {
                return parseFloat(num);
        }
};

function JS_Parse_Error(message, line, col, pos) {
        this.message = message;
        this.line = line + 1;
        this.col = col + 1;
        this.pos = pos + 1;
        this.stack = new Error().stack;
};

JS_Parse_Error.prototype.toString = function() {
        return this.message + " (line: " + this.line + ", col: " + this.col + ", pos: " + this.pos + ")" + "\n\n" + this.stack;
};

function js_error(message, line, col, pos) {
        throw new JS_Parse_Error(message, line, col, pos);
};

function is_token(token, type, val) {
        return token.type == type && (val == null || token.value == val);
};

var EX_EOF = {};

function tokenizer($TEXT) {

        var S = {
                text            : $TEXT.replace(/\r\n?|[\n\u2028\u2029]/g, "\n").replace(/^\uFEFF/, ''),
                pos             : 0,
                tokpos          : 0,
                line            : 0,
                tokline         : 0,
                col             : 0,
                tokcol          : 0,
                newline_before  : false,
                regex_allowed   : false,
                comments_before : []
        };

        function peek() { return S.text.charAt(S.pos); };

        function next(signal_eof, in_string) {
                var ch = S.text.charAt(S.pos++);
                if (signal_eof && !ch)
                        throw EX_EOF;
                if (ch == "\n") {
                        S.newline_before = S.newline_before || !in_string;
                        ++S.line;
                        S.col = 0;
                } else {
                        ++S.col;
                }
                return ch;
        };

        function eof() {
                return !S.peek();
        };

        function find(what, signal_eof) {
                var pos = S.text.indexOf(what, S.pos);
                if (signal_eof && pos == -1) throw EX_EOF;
                return pos;
        };

        function start_token() {
                S.tokline = S.line;
                S.tokcol = S.col;
                S.tokpos = S.pos;
        };

        function token(type, value, is_comment) {
                S.regex_allowed = ((type == "operator" && !HOP(UNARY_POSTFIX, value)) ||
                                   (type == "keyword" && HOP(KEYWORDS_BEFORE_EXPRESSION, value)) ||
                                   (type == "punc" && HOP(PUNC_BEFORE_EXPRESSION, value)));
                var ret = {
                        type   : type,
                        value  : value,
                        line   : S.tokline,
                        col    : S.tokcol,
                        pos    : S.tokpos,
                        endpos : S.pos,
                        nlb    : S.newline_before
                };
                if (!is_comment) {
                        ret.comments_before = S.comments_before;
                        S.comments_before = [];
                        // make note of any newlines in the comments that came before
                        for (var i = 0, len = ret.comments_before.length; i < len; i++) {
                                ret.nlb = ret.nlb || ret.comments_before[i].nlb;
                        }
                }
                S.newline_before = false;
                return ret;
        };

        function skip_whitespace() {
                while (HOP(WHITESPACE_CHARS, peek()))
                        next();
        };

        function read_while(pred) {
                var ret = "", ch = peek(), i = 0;
                while (ch && pred(ch, i++)) {
                        ret += next();
                        ch = peek();
                }
                return ret;
        };

        function parse_error(err) {
                js_error(err, S.tokline, S.tokcol, S.tokpos);
        };

        function read_num(prefix) {
                var has_e = false, after_e = false, has_x = false, has_dot = prefix == ".";
                var num = read_while(function(ch, i){
                        if (ch == "x" || ch == "X") {
                                if (has_x) return false;
                                return has_x = true;
                        }
                        if (!has_x && (ch == "E" || ch == "e")) {
                                if (has_e) return false;
                                return has_e = after_e = true;
                        }
                        if (ch == "-") {
                                if (after_e || (i == 0 && !prefix)) return true;
                                return false;
                        }
                        if (ch == "+") return after_e;
                        after_e = false;
                        if (ch == ".") {
                                if (!has_dot && !has_x && !has_e)
                                        return has_dot = true;
                                return false;
                        }
                        return is_alphanumeric_char(ch);
                });
                if (prefix)
                        num = prefix + num;
                var valid = parse_js_number(num);
                if (!isNaN(valid)) {
                        return token("num", valid);
                } else {
                        parse_error("Invalid syntax: " + num);
                }
        };

        function read_escaped_char(in_string) {
                var ch = next(true, in_string);
                switch (ch) {
                    case "n" : return "\n";
                    case "r" : return "\r";
                    case "t" : return "\t";
                    case "b" : return "\b";
                    case "v" : return "\u000b";
                    case "f" : return "\f";
                    case "0" : return "\0";
                    case "x" : return String.fromCharCode(hex_bytes(2));
                    case "u" : return String.fromCharCode(hex_bytes(4));
                    case "\n": return "";
                    default  : return ch;
                }
        };

        function hex_bytes(n) {
                var num = 0;
                for (; n > 0; --n) {
                        var digit = parseInt(next(true), 16);
                        if (isNaN(digit))
                                parse_error("Invalid hex-character pattern in string");
                        num = (num << 4) | digit;
                }
                return num;
        };

        function read_string() {
                return with_eof_error("Unterminated string constant", function(){
                        var quote = next(), ret = "";
                        for (;;) {
                                var ch = next(true);
                                if (ch == "\\") {
                                        // read OctalEscapeSequence (XXX: deprecated if "strict mode")
                                        // https://github.com/mishoo/UglifyJS/issues/178
                                        var octal_len = 0, first = null;
                                        ch = read_while(function(ch){
                                                if (ch >= "0" && ch <= "7") {
                                                        if (!first) {
                                                                first = ch;
                                                                return ++octal_len;
                                                        }
                                                        else if (first <= "3" && octal_len <= 2) return ++octal_len;
                                                        else if (first >= "4" && octal_len <= 1) return ++octal_len;
                                                }
                                                return false;
                                        });
                                        if (octal_len > 0) ch = String.fromCharCode(parseInt(ch, 8));
                                        else ch = read_escaped_char(true);
                                }
                                else if (ch == quote) break;
                                ret += ch;
                        }
                        return token("string", ret);
                });
        };

        function read_line_comment() {
                next();
                var i = find("\n"), ret;
                if (i == -1) {
                        ret = S.text.substr(S.pos);
                        S.pos = S.text.length;
                } else {
                        ret = S.text.substring(S.pos, i);
                        S.pos = i;
                }
                return token("comment1", ret, true);
        };

        function read_multiline_comment() {
                next();
                return with_eof_error("Unterminated multiline comment", function(){
                        var i = find("*/", true),
                            text = S.text.substring(S.pos, i);
                        S.pos = i + 2;
                        S.line += text.split("\n").length - 1;
                        S.newline_before = S.newline_before || text.indexOf("\n") >= 0;

                        // https://github.com/mishoo/UglifyJS/issues/#issue/100
                        if (/^@cc_on/i.test(text)) {
                                warn("WARNING: at line " + S.line);
                                warn("*** Found \"conditional comment\": " + text);
                                warn("*** UglifyJS DISCARDS ALL COMMENTS.  This means your code might no longer work properly in Internet Explorer.");
                        }

                        return token("comment2", text, true);
                });
        };

        function read_name() {
                var backslash = false, name = "", ch, escaped = false, hex;
                while ((ch = peek()) != null) {
                        if (!backslash) {
                                if (ch == "\\") escaped = backslash = true, next();
                                else if (is_identifier_char(ch)) name += next();
                                else break;
                        }
                        else {
                                if (ch != "u") parse_error("Expecting UnicodeEscapeSequence -- uXXXX");
                                ch = read_escaped_char();
                                if (!is_identifier_char(ch)) parse_error("Unicode char: " + ch.charCodeAt(0) + " is not valid in identifier");
                                name += ch;
                                backslash = false;
                        }
                }
                if (HOP(KEYWORDS, name) && escaped) {
                        hex = name.charCodeAt(0).toString(16).toUpperCase();
                        name = "\\u" + "0000".substr(hex.length) + hex + name.slice(1);
                }
                return name;
        };

        function read_regexp(regexp) {
                return with_eof_error("Unterminated regular expression", function(){
                        var prev_backslash = false, ch, in_class = false;
                        while ((ch = next(true))) if (prev_backslash) {
                                regexp += "\\" + ch;
                                prev_backslash = false;
                        } else if (ch == "[") {
                                in_class = true;
                                regexp += ch;
                        } else if (ch == "]" && in_class) {
                                in_class = false;
                                regexp += ch;
                        } else if (ch == "/" && !in_class) {
                                break;
                        } else if (ch == "\\") {
                                prev_backslash = true;
                        } else {
                                regexp += ch;
                        }
                        var mods = read_name();
                        return token("regexp", [ regexp, mods ]);
                });
        };

        function read_operator(prefix) {
                function grow(op) {
                        if (!peek()) return op;
                        var bigger = op + peek();
                        if (HOP(OPERATORS, bigger)) {
                                next();
                                return grow(bigger);
                        } else {
                                return op;
                        }
                };
                return token("operator", grow(prefix || next()));
        };

        function handle_slash() {
                next();
                var regex_allowed = S.regex_allowed;
                switch (peek()) {
                    case "/":
                        S.comments_before.push(read_line_comment());
                        S.regex_allowed = regex_allowed;
                        return next_token();
                    case "*":
                        S.comments_before.push(read_multiline_comment());
                        S.regex_allowed = regex_allowed;
                        return next_token();
                }
                return S.regex_allowed ? read_regexp("") : read_operator("/");
        };

        function handle_dot() {
                next();
                return is_digit(peek())
                        ? read_num(".")
                        : token("punc", ".");
        };

        function read_word() {
                var word = read_name();
                return !HOP(KEYWORDS, word)
                        ? token("name", word)
                        : HOP(OPERATORS, word)
                        ? token("operator", word)
                        : HOP(KEYWORDS_ATOM, word)
                        ? token("atom", word)
                        : token("keyword", word);
        };

        function with_eof_error(eof_error, cont) {
                try {
                        return cont();
                } catch(ex) {
                        if (ex === EX_EOF) parse_error(eof_error);
                        else throw ex;
                }
        };

        function next_token(force_regexp) {
                if (force_regexp != null)
                        return read_regexp(force_regexp);
                skip_whitespace();
                start_token();
                var ch = peek();
                if (!ch) return token("eof");
                if (is_digit(ch)) return read_num();
                if (ch == '"' || ch == "'") return read_string();
                if (HOP(PUNC_CHARS, ch)) return token("punc", next());
                if (ch == ".") return handle_dot();
                if (ch == "/") return handle_slash();
                if (HOP(OPERATOR_CHARS, ch)) return read_operator();
                if (ch == "\\" || is_identifier_start(ch)) return read_word();
                parse_error("Unexpected character '" + ch + "'");
        };

        next_token.context = function(nc) {
                if (nc) S = nc;
                return S;
        };

        return next_token;

};

/* -----[ Parser (constants) ]----- */

var UNARY_PREFIX = array_to_hash([
        "typeof",
        "void",
        "delete",
        "--",
        "++",
        "!",
        "~",
        "-",
        "+"
]);

var UNARY_POSTFIX = array_to_hash([ "--", "++" ]);

var ASSIGNMENT = (function(a, ret, i){
        while (i < a.length) {
                ret[a[i]] = a[i].substr(0, a[i].length - 1);
                i++;
        }
        return ret;
})(
        ["+=", "-=", "/=", "*=", "%=", ">>=", "<<=", ">>>=", "|=", "^=", "&="],
        { "=": true },
        0
);

var PRECEDENCE = (function(a, ret){
        for (var i = 0, n = 1; i < a.length; ++i, ++n) {
                var b = a[i];
                for (var j = 0; j < b.length; ++j) {
                        ret[b[j]] = n;
                }
        }
        return ret;
})(
        [
                ["||"],
                ["&&"],
                ["|"],
                ["^"],
                ["&"],
                ["==", "===", "!=", "!=="],
                ["<", ">", "<=", ">=", "in", "instanceof"],
                [">>", "<<", ">>>"],
                ["+", "-"],
                ["*", "/", "%"]
        ],
        {}
);

var STATEMENTS_WITH_LABELS = array_to_hash([ "for", "do", "while", "switch" ]);

var ATOMIC_START_TOKEN = array_to_hash([ "atom", "num", "string", "regexp", "name" ]);

/* -----[ Parser ]----- */

function NodeWithToken(str, start, end) {
        this.name = str;
        this.start = start;
        this.end = end;
};

NodeWithToken.prototype.toString = function() { return this.name; };

function parse($TEXT, exigent_mode, embed_tokens) {

        var S = {
                input         : typeof $TEXT == "string" ? tokenizer($TEXT, true) : $TEXT,
                token         : null,
                prev          : null,
                peeked        : null,
                in_function   : 0,
                in_directives : true,
                in_loop       : 0,
                labels        : []
        };

        S.token = next();

        function is(type, value) {
                return is_token(S.token, type, value);
        };

        function peek() { return S.peeked || (S.peeked = S.input()); };

        function next() {
                S.prev = S.token;
                if (S.peeked) {
                        S.token = S.peeked;
                        S.peeked = null;
                } else {
                        S.token = S.input();
                }
                S.in_directives = S.in_directives && (
                        S.token.type == "string" || is("punc", ";")
                );
                return S.token;
        };

        function prev() {
                return S.prev;
        };

        function croak(msg, line, col, pos) {
                var ctx = S.input.context();
                js_error(msg,
                         line != null ? line : ctx.tokline,
                         col != null ? col : ctx.tokcol,
                         pos != null ? pos : ctx.tokpos);
        };

        function token_error(token, msg) {
                croak(msg, token.line, token.col);
        };

        function unexpected(token) {
                if (token == null)
                        token = S.token;
                token_error(token, "Unexpected token: " + token.type + " (" + token.value + ")");
        };

        function expect_token(type, val) {
                if (is(type, val)) {
                        return next();
                }
                token_error(S.token, "Unexpected token " + S.token.type + ", expected " + type);
        };

        function expect(punc) { return expect_token("punc", punc); };

        function can_insert_semicolon() {
                return !exigent_mode && (
                        S.token.nlb || is("eof") || is("punc", "}")
                );
        };

        function semicolon() {
                if (is("punc", ";")) next();
                else if (!can_insert_semicolon()) unexpected();
        };

        function as() {
                return slice(arguments);
        };

        function parenthesised() {
                expect("(");
                var ex = expression();
                expect(")");
                return ex;
        };

        function add_tokens(str, start, end) {
                return str instanceof NodeWithToken ? str : new NodeWithToken(str, start, end);
        };

        function maybe_embed_tokens(parser) {
                if (embed_tokens) return function() {
                        var start = S.token;
                        var ast = parser.apply(this, arguments);
                        ast[0] = add_tokens(ast[0], start, prev());
                        return ast;
                };
                else return parser;
        };

        var statement = maybe_embed_tokens(function() {
                if (is("operator", "/") || is("operator", "/=")) {
                        S.peeked = null;
                        S.token = S.input(S.token.value.substr(1)); // force regexp
                }
                switch (S.token.type) {
                    case "string":
                        var dir = S.in_directives, stat = simple_statement();
                        if (dir && stat[1][0] == "string" && !is("punc", ","))
                            return as("directive", stat[1][1]);
                        return stat;
                    case "num":
                    case "regexp":
                    case "operator":
                    case "atom":
                        return simple_statement();

                    case "name":
                        return is_token(peek(), "punc", ":")
                                ? labeled_statement(prog1(S.token.value, next, next))
                                : simple_statement();

                    case "punc":
                        switch (S.token.value) {
                            case "{":
                                return as("block", block_());
                            case "[":
                            case "(":
                                return simple_statement();
                            case ";":
                                next();
                                return as("block");
                            default:
                                unexpected();
                        }

                    case "keyword":
                        switch (prog1(S.token.value, next)) {
                            case "break":
                                return break_cont("break");

                            case "continue":
                                return break_cont("continue");

                            case "debugger":
                                semicolon();
                                return as("debugger");

                            case "do":
                                return (function(body){
                                        expect_token("keyword", "while");
                                        return as("do", prog1(parenthesised, semicolon), body);
                                })(in_loop(statement));

                            case "for":
                                return for_();

                            case "function":
                                return function_(true);

                            case "if":
                                return if_();

                            case "return":
                                if (S.in_function == 0)
                                        croak("'return' outside of function");
                                return as("return",
                                          is("punc", ";")
                                          ? (next(), null)
                                          : can_insert_semicolon()
                                          ? null
                                          : prog1(expression, semicolon));

                            case "switch":
                                return as("switch", parenthesised(), switch_block_());

                            case "throw":
                                if (S.token.nlb)
                                        croak("Illegal newline after 'throw'");
                                return as("throw", prog1(expression, semicolon));

                            case "try":
                                return try_();

                            case "var":
                                return prog1(var_, semicolon);

                            case "const":
                                return prog1(const_, semicolon);

                            case "while":
                                return as("while", parenthesised(), in_loop(statement));

                            case "with":
                                return as("with", parenthesised(), statement());

                            default:
                                unexpected();
                        }
                }
        });

        function labeled_statement(label) {
                S.labels.push(label);
                var start = S.token, stat = statement();
                if (exigent_mode && !HOP(STATEMENTS_WITH_LABELS, stat[0]))
                        unexpected(start);
                S.labels.pop();
                return as("label", label, stat);
        };

        function simple_statement() {
                return as("stat", prog1(expression, semicolon));
        };

        function break_cont(type) {
                var name;
                if (!can_insert_semicolon()) {
                        name = is("name") ? S.token.value : null;
                }
                if (name != null) {
                        next();
                        if (!member(name, S.labels))
                                croak("Label " + name + " without matching loop or statement");
                }
                else if (S.in_loop == 0)
                        croak(type + " not inside a loop or switch");
                semicolon();
                return as(type, name);
        };

        function for_() {
                expect("(");
                var init = null;
                if (!is("punc", ";")) {
                        init = is("keyword", "var")
                                ? (next(), var_(true))
                                : expression(true, true);
                        if (is("operator", "in")) {
                                if (init[0] == "var" && init[1].length > 1)
                                        croak("Only one variable declaration allowed in for..in loop");
                                return for_in(init);
                        }
                }
                return regular_for(init);
        };

        function regular_for(init) {
                expect(";");
                var test = is("punc", ";") ? null : expression();
                expect(";");
                var step = is("punc", ")") ? null : expression();
                expect(")");
                return as("for", init, test, step, in_loop(statement));
        };

        function for_in(init) {
                var lhs = init[0] == "var" ? as("name", init[1][0]) : init;
                next();
                var obj = expression();
                expect(")");
                return as("for-in", init, lhs, obj, in_loop(statement));
        };

        var function_ = function(in_statement) {
                var name = is("name") ? prog1(S.token.value, next) : null;
                if (in_statement && !name)
                        unexpected();
                expect("(");
                return as(in_statement ? "defun" : "function",
                          name,
                          // arguments
                          (function(first, a){
                                  while (!is("punc", ")")) {
                                          if (first) first = false; else expect(",");
                                          if (!is("name")) unexpected();
                                          a.push(S.token.value);
                                          next();
                                  }
                                  next();
                                  return a;
                          })(true, []),
                          // body
                          (function(){
                                  ++S.in_function;
                                  var loop = S.in_loop;
                                  S.in_directives = true;
                                  S.in_loop = 0;
                                  var a = block_();
                                  --S.in_function;
                                  S.in_loop = loop;
                                  return a;
                          })());
        };

        function if_() {
                var cond = parenthesised(), body = statement(), belse;
                if (is("keyword", "else")) {
                        next();
                        belse = statement();
                }
                return as("if", cond, body, belse);
        };

        function block_() {
                expect("{");
                var a = [];
                while (!is("punc", "}")) {
                        if (is("eof")) unexpected();
                        a.push(statement());
                }
                next();
                return a;
        };

        var switch_block_ = curry(in_loop, function(){
                expect("{");
                var a = [], cur = null;
                while (!is("punc", "}")) {
                        if (is("eof")) unexpected();
                        if (is("keyword", "case")) {
                                next();
                                cur = [];
                                a.push([ expression(), cur ]);
                                expect(":");
                        }
                        else if (is("keyword", "default")) {
                                next();
                                expect(":");
                                cur = [];
                                a.push([ null, cur ]);
                        }
                        else {
                                if (!cur) unexpected();
                                cur.push(statement());
                        }
                }
                next();
                return a;
        });

        function try_() {
                var body = block_(), bcatch, bfinally;
                if (is("keyword", "catch")) {
                        next();
                        expect("(");
                        if (!is("name"))
                                croak("Name expected");
                        var name = S.token.value;
                        next();
                        expect(")");
                        bcatch = [ name, block_() ];
                }
                if (is("keyword", "finally")) {
                        next();
                        bfinally = block_();
                }
                if (!bcatch && !bfinally)
                        croak("Missing catch/finally blocks");
                return as("try", body, bcatch, bfinally);
        };

        function vardefs(no_in) {
                var a = [];
                for (;;) {
                        if (!is("name"))
                                unexpected();
                        var name = S.token.value;
                        next();
                        if (is("operator", "=")) {
                                next();
                                a.push([ name, expression(false, no_in) ]);
                        } else {
                                a.push([ name ]);
                        }
                        if (!is("punc", ","))
                                break;
                        next();
                }
                return a;
        };

        function var_(no_in) {
                return as("var", vardefs(no_in));
        };

        function const_() {
                return as("const", vardefs());
        };

        function new_() {
                var newexp = expr_atom(false), args;
                if (is("punc", "(")) {
                        next();
                        args = expr_list(")");
                } else {
                        args = [];
                }
                return subscripts(as("new", newexp, args), true);
        };

        var expr_atom = maybe_embed_tokens(function(allow_calls) {
                if (is("operator", "new")) {
                        next();
                        return new_();
                }
                if (is("punc")) {
                        switch (S.token.value) {
                            case "(":
                                next();
                                return subscripts(prog1(expression, curry(expect, ")")), allow_calls);
                            case "[":
                                next();
                                return subscripts(array_(), allow_calls);
                            case "{":
                                next();
                                return subscripts(object_(), allow_calls);
                        }
                        unexpected();
                }
                if (is("keyword", "function")) {
                        next();
                        return subscripts(function_(false), allow_calls);
                }
                if (HOP(ATOMIC_START_TOKEN, S.token.type)) {
                        var atom = S.token.type == "regexp"
                                ? as("regexp", S.token.value[0], S.token.value[1])
                                : as(S.token.type, S.token.value);
                        return subscripts(prog1(atom, next), allow_calls);
                }
                unexpected();
        });

        function expr_list(closing, allow_trailing_comma, allow_empty) {
                var first = true, a = [];
                while (!is("punc", closing)) {
                        if (first) first = false; else expect(",");
                        if (allow_trailing_comma && is("punc", closing)) break;
                        if (is("punc", ",") && allow_empty) {
                                a.push([ "atom", "undefined" ]);
                        } else {
                                a.push(expression(false));
                        }
                }
                next();
                return a;
        };

        function array_() {
                return as("array", expr_list("]", !exigent_mode, true));
        };

        function object_() {
                var first = true, a = [];
                while (!is("punc", "}")) {
                        if (first) first = false; else expect(",");
                        if (!exigent_mode && is("punc", "}"))
                                // allow trailing comma
                                break;
                        var type = S.token.type;
                        var name = as_property_name();
                        if (type == "name" && (name == "get" || name == "set") && !is("punc", ":")) {
                                a.push([ as_name(), function_(false), name ]);
                        } else {
                                expect(":");
                                a.push([ name, expression(false) ]);
                        }
                }
                next();
                return as("object", a);
        };

        function as_property_name() {
                switch (S.token.type) {
                    case "num":
                    case "string":
                        return prog1(S.token.value, next);
                }
                return as_name();
        };

        function as_name() {
                switch (S.token.type) {
                    case "name":
                    case "operator":
                    case "keyword":
                    case "atom":
                        return prog1(S.token.value, next);
                    default:
                        unexpected();
                }
        };

        function subscripts(expr, allow_calls) {
                if (is("punc", ".")) {
                        next();
                        return subscripts(as("dot", expr, as_name()), allow_calls);
                }
                if (is("punc", "[")) {
                        next();
                        return subscripts(as("sub", expr, prog1(expression, curry(expect, "]"))), allow_calls);
                }
                if (allow_calls && is("punc", "(")) {
                        next();
                        return subscripts(as("call", expr, expr_list(")")), true);
                }
                return expr;
        };

        function maybe_unary(allow_calls) {
                if (is("operator") && HOP(UNARY_PREFIX, S.token.value)) {
                        return make_unary("unary-prefix",
                                          prog1(S.token.value, next),
                                          maybe_unary(allow_calls));
                }
                var val = expr_atom(allow_calls);
                while (is("operator") && HOP(UNARY_POSTFIX, S.token.value) && !S.token.nlb) {
                        val = make_unary("unary-postfix", S.token.value, val);
                        next();
                }
                return val;
        };

        function make_unary(tag, op, expr) {
                if ((op == "++" || op == "--") && !is_assignable(expr))
                        croak("Invalid use of " + op + " operator");
                return as(tag, op, expr);
        };

        function expr_op(left, min_prec, no_in) {
                var op = is("operator") ? S.token.value : null;
                if (op && op == "in" && no_in) op = null;
                var prec = op != null ? PRECEDENCE[op] : null;
                if (prec != null && prec > min_prec) {
                        next();
                        var right = expr_op(maybe_unary(true), prec, no_in);
                        return expr_op(as("binary", op, left, right), min_prec, no_in);
                }
                return left;
        };

        function expr_ops(no_in) {
                return expr_op(maybe_unary(true), 0, no_in);
        };

        function maybe_conditional(no_in) {
                var expr = expr_ops(no_in);
                if (is("operator", "?")) {
                        next();
                        var yes = expression(false);
                        expect(":");
                        return as("conditional", expr, yes, expression(false, no_in));
                }
                return expr;
        };

        function is_assignable(expr) {
                if (!exigent_mode) return true;
                switch (expr[0]+"") {
                    case "dot":
                    case "sub":
                    case "new":
                    case "call":
                        return true;
                    case "name":
                        return expr[1] != "this";
                }
        };

        function maybe_assign(no_in) {
                var left = maybe_conditional(no_in), val = S.token.value;
                if (is("operator") && HOP(ASSIGNMENT, val)) {
                        if (is_assignable(left)) {
                                next();
                                return as("assign", ASSIGNMENT[val], left, maybe_assign(no_in));
                        }
                        croak("Invalid assignment");
                }
                return left;
        };

        var expression = maybe_embed_tokens(function(commas, no_in) {
                if (arguments.length == 0)
                        commas = true;
                var expr = maybe_assign(no_in);
                if (commas && is("punc", ",")) {
                        next();
                        return as("seq", expr, expression(true, no_in));
                }
                return expr;
        });

        function in_loop(cont) {
                try {
                        ++S.in_loop;
                        return cont();
                } finally {
                        --S.in_loop;
                }
        };

        return as("toplevel", (function(a){
                while (!is("eof"))
                        a.push(statement());
                return a;
        })([]));

};

/* -----[ Utilities ]----- */

function curry(f) {
        var args = slice(arguments, 1);
        return function() { return f.apply(this, args.concat(slice(arguments))); };
};

function prog1(ret) {
        if (ret instanceof Function)
                ret = ret();
        for (var i = 1, n = arguments.length; --n > 0; ++i)
                arguments[i]();
        return ret;
};

function array_to_hash(a) {
        var ret = {};
        for (var i = 0; i < a.length; ++i)
                ret[a[i]] = true;
        return ret;
};

function slice(a, start) {
        return Array.prototype.slice.call(a, start || 0);
};

function characters(str) {
        return str.split("");
};

function member(name, array) {
        for (var i = array.length; --i >= 0;)
                if (array[i] == name)
                        return true;
        return false;
};

function HOP(obj, prop) {
        return Object.prototype.hasOwnProperty.call(obj, prop);
};

var warn = function() {};

/* -----[ Exports ]----- */

exports.tokenizer = tokenizer;
exports.parse = parse;
exports.slice = slice;
exports.curry = curry;
exports.member = member;
exports.array_to_hash = array_to_hash;
exports.PRECEDENCE = PRECEDENCE;
exports.KEYWORDS_ATOM = KEYWORDS_ATOM;
exports.RESERVED_WORDS = RESERVED_WORDS;
exports.KEYWORDS = KEYWORDS;
exports.ATOMIC_START_TOKEN = ATOMIC_START_TOKEN;
exports.OPERATORS = OPERATORS;
exports.is_alphanumeric_char = is_alphanumeric_char;
exports.is_identifier_start = is_identifier_start;
exports.is_identifier_char = is_identifier_char;
exports.set_logger = function(logger) {
        warn = logger;
};

// Local variables:
// js-indent-level: 8
// End:

},{}],"/Users/Jacob/workspace/scheduler/front-end/node_modules/cldr/node_modules/uglify-js/lib/process.js":[function(require,module,exports){
/***********************************************************************

  A JavaScript tokenizer / parser / beautifier / compressor.

  This version is suitable for Node.js.  With minimal changes (the
  exports stuff) it should work on any JS platform.

  This file implements some AST processors.  They work on data built
  by parse-js.

  Exported functions:

    - ast_mangle(ast, options) -- mangles the variable/function names
      in the AST.  Returns an AST.

    - ast_squeeze(ast) -- employs various optimizations to make the
      final generated code even smaller.  Returns an AST.

    - gen_code(ast, options) -- generates JS code from the AST.  Pass
      true (or an object, see the code for some options) as second
      argument to get "pretty" (indented) code.

  -------------------------------- (C) ---------------------------------

                           Author: Mihai Bazon
                         <mihai.bazon@gmail.com>
                       http://mihai.bazon.net/blog

  Distributed under the BSD license:

    Copyright 2010 (c) Mihai Bazon <mihai.bazon@gmail.com>

    Redistribution and use in source and binary forms, with or without
    modification, are permitted provided that the following conditions
    are met:

        * Redistributions of source code must retain the above
          copyright notice, this list of conditions and the following
          disclaimer.

        * Redistributions in binary form must reproduce the above
          copyright notice, this list of conditions and the following
          disclaimer in the documentation and/or other materials
          provided with the distribution.

    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDER “AS IS” AND ANY
    EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
    IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
    PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER BE
    LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY,
    OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
    PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
    PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
    THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
    TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF
    THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF
    SUCH DAMAGE.

 ***********************************************************************/

var jsp = require("./parse-js"),
    curry = jsp.curry,
    slice = jsp.slice,
    member = jsp.member,
    is_identifier_char = jsp.is_identifier_char,
    PRECEDENCE = jsp.PRECEDENCE,
    OPERATORS = jsp.OPERATORS;

/* -----[ helper for AST traversal ]----- */

function ast_walker() {
        function _vardefs(defs) {
                return [ this[0], MAP(defs, function(def){
                        var a = [ def[0] ];
                        if (def.length > 1)
                                a[1] = walk(def[1]);
                        return a;
                }) ];
        };
        function _block(statements) {
                var out = [ this[0] ];
                if (statements != null)
                        out.push(MAP(statements, walk));
                return out;
        };
        var walkers = {
                "string": function(str) {
                        return [ this[0], str ];
                },
                "num": function(num) {
                        return [ this[0], num ];
                },
                "name": function(name) {
                        return [ this[0], name ];
                },
                "toplevel": function(statements) {
                        return [ this[0], MAP(statements, walk) ];
                },
                "block": _block,
                "splice": _block,
                "var": _vardefs,
                "const": _vardefs,
                "try": function(t, c, f) {
                        return [
                                this[0],
                                MAP(t, walk),
                                c != null ? [ c[0], MAP(c[1], walk) ] : null,
                                f != null ? MAP(f, walk) : null
                        ];
                },
                "throw": function(expr) {
                        return [ this[0], walk(expr) ];
                },
                "new": function(ctor, args) {
                        return [ this[0], walk(ctor), MAP(args, walk) ];
                },
                "switch": function(expr, body) {
                        return [ this[0], walk(expr), MAP(body, function(branch){
                                return [ branch[0] ? walk(branch[0]) : null,
                                         MAP(branch[1], walk) ];
                        }) ];
                },
                "break": function(label) {
                        return [ this[0], label ];
                },
                "continue": function(label) {
                        return [ this[0], label ];
                },
                "conditional": function(cond, t, e) {
                        return [ this[0], walk(cond), walk(t), walk(e) ];
                },
                "assign": function(op, lvalue, rvalue) {
                        return [ this[0], op, walk(lvalue), walk(rvalue) ];
                },
                "dot": function(expr) {
                        return [ this[0], walk(expr) ].concat(slice(arguments, 1));
                },
                "call": function(expr, args) {
                        return [ this[0], walk(expr), MAP(args, walk) ];
                },
                "function": function(name, args, body) {
                        return [ this[0], name, args.slice(), MAP(body, walk) ];
                },
                "debugger": function() {
                        return [ this[0] ];
                },
                "defun": function(name, args, body) {
                        return [ this[0], name, args.slice(), MAP(body, walk) ];
                },
                "if": function(conditional, t, e) {
                        return [ this[0], walk(conditional), walk(t), walk(e) ];
                },
                "for": function(init, cond, step, block) {
                        return [ this[0], walk(init), walk(cond), walk(step), walk(block) ];
                },
                "for-in": function(vvar, key, hash, block) {
                        return [ this[0], walk(vvar), walk(key), walk(hash), walk(block) ];
                },
                "while": function(cond, block) {
                        return [ this[0], walk(cond), walk(block) ];
                },
                "do": function(cond, block) {
                        return [ this[0], walk(cond), walk(block) ];
                },
                "return": function(expr) {
                        return [ this[0], walk(expr) ];
                },
                "binary": function(op, left, right) {
                        return [ this[0], op, walk(left), walk(right) ];
                },
                "unary-prefix": function(op, expr) {
                        return [ this[0], op, walk(expr) ];
                },
                "unary-postfix": function(op, expr) {
                        return [ this[0], op, walk(expr) ];
                },
                "sub": function(expr, subscript) {
                        return [ this[0], walk(expr), walk(subscript) ];
                },
                "object": function(props) {
                        return [ this[0], MAP(props, function(p){
                                return p.length == 2
                                        ? [ p[0], walk(p[1]) ]
                                        : [ p[0], walk(p[1]), p[2] ]; // get/set-ter
                        }) ];
                },
                "regexp": function(rx, mods) {
                        return [ this[0], rx, mods ];
                },
                "array": function(elements) {
                        return [ this[0], MAP(elements, walk) ];
                },
                "stat": function(stat) {
                        return [ this[0], walk(stat) ];
                },
                "seq": function() {
                        return [ this[0] ].concat(MAP(slice(arguments), walk));
                },
                "label": function(name, block) {
                        return [ this[0], name, walk(block) ];
                },
                "with": function(expr, block) {
                        return [ this[0], walk(expr), walk(block) ];
                },
                "atom": function(name) {
                        return [ this[0], name ];
                },
                "directive": function(dir) {
                        return [ this[0], dir ];
                }
        };

        var user = {};
        var stack = [];
        function walk(ast) {
                if (ast == null)
                        return null;
                try {
                        stack.push(ast);
                        var type = ast[0];
                        var gen = user[type];
                        if (gen) {
                                var ret = gen.apply(ast, ast.slice(1));
                                if (ret != null)
                                        return ret;
                        }
                        gen = walkers[type];
                        return gen.apply(ast, ast.slice(1));
                } finally {
                        stack.pop();
                }
        };

        function dive(ast) {
                if (ast == null)
                        return null;
                try {
                        stack.push(ast);
                        return walkers[ast[0]].apply(ast, ast.slice(1));
                } finally {
                        stack.pop();
                }
        };

        function with_walkers(walkers, cont){
                var save = {}, i;
                for (i in walkers) if (HOP(walkers, i)) {
                        save[i] = user[i];
                        user[i] = walkers[i];
                }
                var ret = cont();
                for (i in save) if (HOP(save, i)) {
                        if (!save[i]) delete user[i];
                        else user[i] = save[i];
                }
                return ret;
        };

        return {
                walk: walk,
                dive: dive,
                with_walkers: with_walkers,
                parent: function() {
                        return stack[stack.length - 2]; // last one is current node
                },
                stack: function() {
                        return stack;
                }
        };
};

/* -----[ Scope and mangling ]----- */

function Scope(parent) {
        this.names = {};        // names defined in this scope
        this.mangled = {};      // mangled names (orig.name => mangled)
        this.rev_mangled = {};  // reverse lookup (mangled => orig.name)
        this.cname = -1;        // current mangled name
        this.refs = {};         // names referenced from this scope
        this.uses_with = false; // will become TRUE if with() is detected in this or any subscopes
        this.uses_eval = false; // will become TRUE if eval() is detected in this or any subscopes
        this.directives = [];   // directives activated from this scope
        this.parent = parent;   // parent scope
        this.children = [];     // sub-scopes
        if (parent) {
                this.level = parent.level + 1;
                parent.children.push(this);
        } else {
                this.level = 0;
        }
};

function base54_digits() {
        if (typeof DIGITS_OVERRIDE_FOR_TESTING != "undefined")
                return DIGITS_OVERRIDE_FOR_TESTING;
        else
                return "etnrisouaflchpdvmgybwESxTNCkLAOM_DPHBjFIqRUzWXV$JKQGYZ0516372984";
}

var base54 = (function(){
        var DIGITS = base54_digits();
        return function(num) {
                var ret = "", base = 54;
                do {
                        ret += DIGITS.charAt(num % base);
                        num = Math.floor(num / base);
                        base = 64;
                } while (num > 0);
                return ret;
        };
})();

Scope.prototype = {
        has: function(name) {
                for (var s = this; s; s = s.parent)
                        if (HOP(s.names, name))
                                return s;
        },
        has_mangled: function(mname) {
                for (var s = this; s; s = s.parent)
                        if (HOP(s.rev_mangled, mname))
                                return s;
        },
        toJSON: function() {
                return {
                        names: this.names,
                        uses_eval: this.uses_eval,
                        uses_with: this.uses_with
                };
        },

        next_mangled: function() {
                // we must be careful that the new mangled name:
                //
                // 1. doesn't shadow a mangled name from a parent
                //    scope, unless we don't reference the original
                //    name from this scope OR from any sub-scopes!
                //    This will get slow.
                //
                // 2. doesn't shadow an original name from a parent
                //    scope, in the event that the name is not mangled
                //    in the parent scope and we reference that name
                //    here OR IN ANY SUBSCOPES!
                //
                // 3. doesn't shadow a name that is referenced but not
                //    defined (possibly global defined elsewhere).
                for (;;) {
                        var m = base54(++this.cname), prior;

                        // case 1.
                        prior = this.has_mangled(m);
                        if (prior && this.refs[prior.rev_mangled[m]] === prior)
                                continue;

                        // case 2.
                        prior = this.has(m);
                        if (prior && prior !== this && this.refs[m] === prior && !prior.has_mangled(m))
                                continue;

                        // case 3.
                        if (HOP(this.refs, m) && this.refs[m] == null)
                                continue;

                        // I got "do" once. :-/
                        if (!is_identifier(m))
                                continue;

                        return m;
                }
        },
        set_mangle: function(name, m) {
                this.rev_mangled[m] = name;
                return this.mangled[name] = m;
        },
        get_mangled: function(name, newMangle) {
                if (this.uses_eval || this.uses_with) return name; // no mangle if eval or with is in use
                var s = this.has(name);
                if (!s) return name; // not in visible scope, no mangle
                if (HOP(s.mangled, name)) return s.mangled[name]; // already mangled in this scope
                if (!newMangle) return name;                      // not found and no mangling requested
                return s.set_mangle(name, s.next_mangled());
        },
        references: function(name) {
                return name && !this.parent || this.uses_with || this.uses_eval || this.refs[name];
        },
        define: function(name, type) {
                if (name != null) {
                        if (type == "var" || !HOP(this.names, name))
                                this.names[name] = type || "var";
                        return name;
                }
        },
        active_directive: function(dir) {
                return member(dir, this.directives) || this.parent && this.parent.active_directive(dir);
        }
};

function ast_add_scope(ast) {

        var current_scope = null;
        var w = ast_walker(), walk = w.walk;
        var having_eval = [];

        function with_new_scope(cont) {
                current_scope = new Scope(current_scope);
                current_scope.labels = new Scope();
                var ret = current_scope.body = cont();
                ret.scope = current_scope;
                current_scope = current_scope.parent;
                return ret;
        };

        function define(name, type) {
                return current_scope.define(name, type);
        };

        function reference(name) {
                current_scope.refs[name] = true;
        };

        function _lambda(name, args, body) {
                var is_defun = this[0] == "defun";
                return [ this[0], is_defun ? define(name, "defun") : name, args, with_new_scope(function(){
                        if (!is_defun) define(name, "lambda");
                        MAP(args, function(name){ define(name, "arg") });
                        return MAP(body, walk);
                })];
        };

        function _vardefs(type) {
                return function(defs) {
                        MAP(defs, function(d){
                                define(d[0], type);
                                if (d[1]) reference(d[0]);
                        });
                };
        };

        function _breacont(label) {
                if (label)
                        current_scope.labels.refs[label] = true;
        };

        return with_new_scope(function(){
                // process AST
                var ret = w.with_walkers({
                        "function": _lambda,
                        "defun": _lambda,
                        "label": function(name, stat) { current_scope.labels.define(name) },
                        "break": _breacont,
                        "continue": _breacont,
                        "with": function(expr, block) {
                                for (var s = current_scope; s; s = s.parent)
                                        s.uses_with = true;
                        },
                        "var": _vardefs("var"),
                        "const": _vardefs("const"),
                        "try": function(t, c, f) {
                                if (c != null) return [
                                        this[0],
                                        MAP(t, walk),
                                        [ define(c[0], "catch"), MAP(c[1], walk) ],
                                        f != null ? MAP(f, walk) : null
                                ];
                        },
                        "name": function(name) {
                                if (name == "eval")
                                        having_eval.push(current_scope);
                                reference(name);
                        }
                }, function(){
                        return walk(ast);
                });

                // the reason why we need an additional pass here is
                // that names can be used prior to their definition.

                // scopes where eval was detected and their parents
                // are marked with uses_eval, unless they define the
                // "eval" name.
                MAP(having_eval, function(scope){
                        if (!scope.has("eval")) while (scope) {
                                scope.uses_eval = true;
                                scope = scope.parent;
                        }
                });

                // for referenced names it might be useful to know
                // their origin scope.  current_scope here is the
                // toplevel one.
                function fixrefs(scope, i) {
                        // do children first; order shouldn't matter
                        for (i = scope.children.length; --i >= 0;)
                                fixrefs(scope.children[i]);
                        for (i in scope.refs) if (HOP(scope.refs, i)) {
                                // find origin scope and propagate the reference to origin
                                for (var origin = scope.has(i), s = scope; s; s = s.parent) {
                                        s.refs[i] = origin;
                                        if (s === origin) break;
                                }
                        }
                };
                fixrefs(current_scope);

                return ret;
        });

};

/* -----[ mangle names ]----- */

function ast_mangle(ast, options) {
        var w = ast_walker(), walk = w.walk, scope;
        options = defaults(options, {
                mangle       : true,
                toplevel     : false,
                defines      : null,
                except       : null,
                no_functions : false
        });

        function get_mangled(name, newMangle) {
                if (!options.mangle) return name;
                if (!options.toplevel && !scope.parent) return name; // don't mangle toplevel
                if (options.except && member(name, options.except))
                        return name;
                if (options.no_functions && HOP(scope.names, name) &&
                    (scope.names[name] == 'defun' || scope.names[name] == 'lambda'))
                        return name;
                return scope.get_mangled(name, newMangle);
        };

        function get_define(name) {
                if (options.defines) {
                        // we always lookup a defined symbol for the current scope FIRST, so declared
                        // vars trump a DEFINE symbol, but if no such var is found, then match a DEFINE value
                        if (!scope.has(name)) {
                                if (HOP(options.defines, name)) {
                                        return options.defines[name];
                                }
                        }
                        return null;
                }
        };

        function _lambda(name, args, body) {
                if (!options.no_functions && options.mangle) {
                        var is_defun = this[0] == "defun", extra;
                        if (name) {
                                if (is_defun) name = get_mangled(name);
                                else if (body.scope.references(name)) {
                                        extra = {};
                                        if (!(scope.uses_eval || scope.uses_with))
                                                name = extra[name] = scope.next_mangled();
                                        else
                                                extra[name] = name;
                                }
                                else name = null;
                        }
                }
                body = with_scope(body.scope, function(){
                        args = MAP(args, function(name){ return get_mangled(name) });
                        return MAP(body, walk);
                }, extra);
                return [ this[0], name, args, body ];
        };

        function with_scope(s, cont, extra) {
                var _scope = scope;
                scope = s;
                if (extra) for (var i in extra) if (HOP(extra, i)) {
                        s.set_mangle(i, extra[i]);
                }
                for (var i in s.names) if (HOP(s.names, i)) {
                        get_mangled(i, true);
                }
                var ret = cont();
                ret.scope = s;
                scope = _scope;
                return ret;
        };

        function _vardefs(defs) {
                return [ this[0], MAP(defs, function(d){
                        return [ get_mangled(d[0]), walk(d[1]) ];
                }) ];
        };

        function _breacont(label) {
                if (label) return [ this[0], scope.labels.get_mangled(label) ];
        };

        return w.with_walkers({
                "function": _lambda,
                "defun": function() {
                        // move function declarations to the top when
                        // they are not in some block.
                        var ast = _lambda.apply(this, arguments);
                        switch (w.parent()[0]) {
                            case "toplevel":
                            case "function":
                            case "defun":
                                return MAP.at_top(ast);
                        }
                        return ast;
                },
                "label": function(label, stat) {
                        if (scope.labels.refs[label]) return [
                                this[0],
                                scope.labels.get_mangled(label, true),
                                walk(stat)
                        ];
                        return walk(stat);
                },
                "break": _breacont,
                "continue": _breacont,
                "var": _vardefs,
                "const": _vardefs,
                "name": function(name) {
                        return get_define(name) || [ this[0], get_mangled(name) ];
                },
                "try": function(t, c, f) {
                        return [ this[0],
                                 MAP(t, walk),
                                 c != null ? [ get_mangled(c[0]), MAP(c[1], walk) ] : null,
                                 f != null ? MAP(f, walk) : null ];
                },
                "toplevel": function(body) {
                        var self = this;
                        return with_scope(self.scope, function(){
                                return [ self[0], MAP(body, walk) ];
                        });
                },
                "directive": function() {
                        return MAP.at_top(this);
                }
        }, function() {
                return walk(ast_add_scope(ast));
        });
};

/* -----[
   - compress foo["bar"] into foo.bar,
   - remove block brackets {} where possible
   - join consecutive var declarations
   - various optimizations for IFs:
     - if (cond) foo(); else bar();  ==>  cond?foo():bar();
     - if (cond) foo();  ==>  cond&&foo();
     - if (foo) return bar(); else return baz();  ==> return foo?bar():baz(); // also for throw
     - if (foo) return bar(); else something();  ==> {if(foo)return bar();something()}
   ]----- */

var warn = function(){};

function best_of(ast1, ast2) {
        return gen_code(ast1).length > gen_code(ast2[0] == "stat" ? ast2[1] : ast2).length ? ast2 : ast1;
};

function last_stat(b) {
        if (b[0] == "block" && b[1] && b[1].length > 0)
                return b[1][b[1].length - 1];
        return b;
}

function aborts(t) {
        if (t) switch (last_stat(t)[0]) {
            case "return":
            case "break":
            case "continue":
            case "throw":
                return true;
        }
};

function boolean_expr(expr) {
        return ( (expr[0] == "unary-prefix"
                  && member(expr[1], [ "!", "delete" ])) ||

                 (expr[0] == "binary"
                  && member(expr[1], [ "in", "instanceof", "==", "!=", "===", "!==", "<", "<=", ">=", ">" ])) ||

                 (expr[0] == "binary"
                  && member(expr[1], [ "&&", "||" ])
                  && boolean_expr(expr[2])
                  && boolean_expr(expr[3])) ||

                 (expr[0] == "conditional"
                  && boolean_expr(expr[2])
                  && boolean_expr(expr[3])) ||

                 (expr[0] == "assign"
                  && expr[1] === true
                  && boolean_expr(expr[3])) ||

                 (expr[0] == "seq"
                  && boolean_expr(expr[expr.length - 1]))
               );
};

function empty(b) {
        return !b || (b[0] == "block" && (!b[1] || b[1].length == 0));
};

function is_string(node) {
        return (node[0] == "string" ||
                node[0] == "unary-prefix" && node[1] == "typeof" ||
                node[0] == "binary" && node[1] == "+" &&
                (is_string(node[2]) || is_string(node[3])));
};

var when_constant = (function(){

        var $NOT_CONSTANT = {};

        // this can only evaluate constant expressions.  If it finds anything
        // not constant, it throws $NOT_CONSTANT.
        function evaluate(expr) {
                switch (expr[0]) {
                    case "string":
                    case "num":
                        return expr[1];
                    case "name":
                    case "atom":
                        switch (expr[1]) {
                            case "true": return true;
                            case "false": return false;
                            case "null": return null;
                        }
                        break;
                    case "unary-prefix":
                        switch (expr[1]) {
                            case "!": return !evaluate(expr[2]);
                            case "typeof": return typeof evaluate(expr[2]);
                            case "~": return ~evaluate(expr[2]);
                            case "-": return -evaluate(expr[2]);
                            case "+": return +evaluate(expr[2]);
                        }
                        break;
                    case "binary":
                        var left = expr[2], right = expr[3];
                        switch (expr[1]) {
                            case "&&"         : return evaluate(left) &&         evaluate(right);
                            case "||"         : return evaluate(left) ||         evaluate(right);
                            case "|"          : return evaluate(left) |          evaluate(right);
                            case "&"          : return evaluate(left) &          evaluate(right);
                            case "^"          : return evaluate(left) ^          evaluate(right);
                            case "+"          : return evaluate(left) +          evaluate(right);
                            case "*"          : return evaluate(left) *          evaluate(right);
                            case "/"          : return evaluate(left) /          evaluate(right);
                            case "%"          : return evaluate(left) %          evaluate(right);
                            case "-"          : return evaluate(left) -          evaluate(right);
                            case "<<"         : return evaluate(left) <<         evaluate(right);
                            case ">>"         : return evaluate(left) >>         evaluate(right);
                            case ">>>"        : return evaluate(left) >>>        evaluate(right);
                            case "=="         : return evaluate(left) ==         evaluate(right);
                            case "==="        : return evaluate(left) ===        evaluate(right);
                            case "!="         : return evaluate(left) !=         evaluate(right);
                            case "!=="        : return evaluate(left) !==        evaluate(right);
                            case "<"          : return evaluate(left) <          evaluate(right);
                            case "<="         : return evaluate(left) <=         evaluate(right);
                            case ">"          : return evaluate(left) >          evaluate(right);
                            case ">="         : return evaluate(left) >=         evaluate(right);
                            case "in"         : return evaluate(left) in         evaluate(right);
                            case "instanceof" : return evaluate(left) instanceof evaluate(right);
                        }
                }
                throw $NOT_CONSTANT;
        };

        return function(expr, yes, no) {
                try {
                        var val = evaluate(expr), ast;
                        switch (typeof val) {
                            case "string": ast =  [ "string", val ]; break;
                            case "number": ast =  [ "num", val ]; break;
                            case "boolean": ast =  [ "name", String(val) ]; break;
                            default:
                                if (val === null) { ast = [ "atom", "null" ]; break; }
                                throw new Error("Can't handle constant of type: " + (typeof val));
                        }
                        return yes.call(expr, ast, val);
                } catch(ex) {
                        if (ex === $NOT_CONSTANT) {
                                if (expr[0] == "binary"
                                    && (expr[1] == "===" || expr[1] == "!==")
                                    && ((is_string(expr[2]) && is_string(expr[3]))
                                        || (boolean_expr(expr[2]) && boolean_expr(expr[3])))) {
                                        expr[1] = expr[1].substr(0, 2);
                                }
                                else if (no && expr[0] == "binary"
                                         && (expr[1] == "||" || expr[1] == "&&")) {
                                    // the whole expression is not constant but the lval may be...
                                    try {
                                        var lval = evaluate(expr[2]);
                                        expr = ((expr[1] == "&&" && (lval ? expr[3] : lval))    ||
                                                (expr[1] == "||" && (lval ? lval    : expr[3])) ||
                                                expr);
                                    } catch(ex2) {
                                        // IGNORE... lval is not constant
                                    }
                                }
                                return no ? no.call(expr, expr) : null;
                        }
                        else throw ex;
                }
        };

})();

function warn_unreachable(ast) {
        if (!empty(ast))
                warn("Dropping unreachable code: " + gen_code(ast, true));
};

function prepare_ifs(ast) {
        var w = ast_walker(), walk = w.walk;
        // In this first pass, we rewrite ifs which abort with no else with an
        // if-else.  For example:
        //
        // if (x) {
        //     blah();
        //     return y;
        // }
        // foobar();
        //
        // is rewritten into:
        //
        // if (x) {
        //     blah();
        //     return y;
        // } else {
        //     foobar();
        // }
        function redo_if(statements) {
                statements = MAP(statements, walk);

                for (var i = 0; i < statements.length; ++i) {
                        var fi = statements[i];
                        if (fi[0] != "if") continue;

                        if (fi[3]) continue;

                        var t = fi[2];
                        if (!aborts(t)) continue;

                        var conditional = walk(fi[1]);

                        var e_body = redo_if(statements.slice(i + 1));
                        var e = e_body.length == 1 ? e_body[0] : [ "block", e_body ];

                        return statements.slice(0, i).concat([ [
                                fi[0],          // "if"
                                conditional,    // conditional
                                t,              // then
                                e               // else
                        ] ]);
                }

                return statements;
        };

        function redo_if_lambda(name, args, body) {
                body = redo_if(body);
                return [ this[0], name, args, body ];
        };

        function redo_if_block(statements) {
                return [ this[0], statements != null ? redo_if(statements) : null ];
        };

        return w.with_walkers({
                "defun": redo_if_lambda,
                "function": redo_if_lambda,
                "block": redo_if_block,
                "splice": redo_if_block,
                "toplevel": function(statements) {
                        return [ this[0], redo_if(statements) ];
                },
                "try": function(t, c, f) {
                        return [
                                this[0],
                                redo_if(t),
                                c != null ? [ c[0], redo_if(c[1]) ] : null,
                                f != null ? redo_if(f) : null
                        ];
                }
        }, function() {
                return walk(ast);
        });
};

function for_side_effects(ast, handler) {
        var w = ast_walker(), walk = w.walk;
        var $stop = {}, $restart = {};
        function stop() { throw $stop };
        function restart() { throw $restart };
        function found(){ return handler.call(this, this, w, stop, restart) };
        function unary(op) {
                if (op == "++" || op == "--")
                        return found.apply(this, arguments);
        };
        function binary(op) {
                if (op == "&&" || op == "||")
                        return found.apply(this, arguments);
        };
        return w.with_walkers({
                "try": found,
                "throw": found,
                "return": found,
                "new": found,
                "switch": found,
                "break": found,
                "continue": found,
                "assign": found,
                "call": found,
                "if": found,
                "for": found,
                "for-in": found,
                "while": found,
                "do": found,
                "return": found,
                "unary-prefix": unary,
                "unary-postfix": unary,
                "conditional": found,
                "binary": binary,
                "defun": found
        }, function(){
                while (true) try {
                        walk(ast);
                        break;
                } catch(ex) {
                        if (ex === $stop) break;
                        if (ex === $restart) continue;
                        throw ex;
                }
        });
};

function ast_lift_variables(ast) {
        var w = ast_walker(), walk = w.walk, scope;
        function do_body(body, env) {
                var _scope = scope;
                scope = env;
                body = MAP(body, walk);
                var hash = {}, names = MAP(env.names, function(type, name){
                        if (type != "var") return MAP.skip;
                        if (!env.references(name)) return MAP.skip;
                        hash[name] = true;
                        return [ name ];
                });
                if (names.length > 0) {
                        // looking for assignments to any of these variables.
                        // we can save considerable space by moving the definitions
                        // in the var declaration.
                        for_side_effects([ "block", body ], function(ast, walker, stop, restart) {
                                if (ast[0] == "assign"
                                    && ast[1] === true
                                    && ast[2][0] == "name"
                                    && HOP(hash, ast[2][1])) {
                                        // insert the definition into the var declaration
                                        for (var i = names.length; --i >= 0;) {
                                                if (names[i][0] == ast[2][1]) {
                                                        if (names[i][1]) // this name already defined, we must stop
                                                                stop();
                                                        names[i][1] = ast[3]; // definition
                                                        names.push(names.splice(i, 1)[0]);
                                                        break;
                                                }
                                        }
                                        // remove this assignment from the AST.
                                        var p = walker.parent();
                                        if (p[0] == "seq") {
                                                var a = p[2];
                                                a.unshift(0, p.length);
                                                p.splice.apply(p, a);
                                        }
                                        else if (p[0] == "stat") {
                                                p.splice(0, p.length, "block"); // empty statement
                                        }
                                        else {
                                                stop();
                                        }
                                        restart();
                                }
                                stop();
                        });
                        body.unshift([ "var", names ]);
                }
                scope = _scope;
                return body;
        };
        function _vardefs(defs) {
                var ret = null;
                for (var i = defs.length; --i >= 0;) {
                        var d = defs[i];
                        if (!d[1]) continue;
                        d = [ "assign", true, [ "name", d[0] ], d[1] ];
                        if (ret == null) ret = d;
                        else ret = [ "seq", d, ret ];
                }
                if (ret == null && w.parent()[0] != "for") {
                        if (w.parent()[0] == "for-in")
                                return [ "name", defs[0][0] ];
                        return MAP.skip;
                }
                return [ "stat", ret ];
        };
        function _toplevel(body) {
                return [ this[0], do_body(body, this.scope) ];
        };
        return w.with_walkers({
                "function": function(name, args, body){
                        for (var i = args.length; --i >= 0 && !body.scope.references(args[i]);)
                                args.pop();
                        if (!body.scope.references(name)) name = null;
                        return [ this[0], name, args, do_body(body, body.scope) ];
                },
                "defun": function(name, args, body){
                        if (!scope.references(name)) return MAP.skip;
                        for (var i = args.length; --i >= 0 && !body.scope.references(args[i]);)
                                args.pop();
                        return [ this[0], name, args, do_body(body, body.scope) ];
                },
                "var": _vardefs,
                "toplevel": _toplevel
        }, function(){
                return walk(ast_add_scope(ast));
        });
};

function ast_squeeze(ast, options) {
        ast = squeeze_1(ast, options);
        ast = squeeze_2(ast, options);
        return ast;
};

function squeeze_1(ast, options) {
        options = defaults(options, {
                make_seqs   : true,
                dead_code   : true,
                no_warnings : false,
                keep_comps  : true,
                unsafe      : false
        });

        var w = ast_walker(), walk = w.walk, scope;

        function negate(c) {
                var not_c = [ "unary-prefix", "!", c ];
                switch (c[0]) {
                    case "unary-prefix":
                        return c[1] == "!" && boolean_expr(c[2]) ? c[2] : not_c;
                    case "seq":
                        c = slice(c);
                        c[c.length - 1] = negate(c[c.length - 1]);
                        return c;
                    case "conditional":
                        return best_of(not_c, [ "conditional", c[1], negate(c[2]), negate(c[3]) ]);
                    case "binary":
                        var op = c[1], left = c[2], right = c[3];
                        if (!options.keep_comps) switch (op) {
                            case "<="  : return [ "binary", ">", left, right ];
                            case "<"   : return [ "binary", ">=", left, right ];
                            case ">="  : return [ "binary", "<", left, right ];
                            case ">"   : return [ "binary", "<=", left, right ];
                        }
                        switch (op) {
                            case "=="  : return [ "binary", "!=", left, right ];
                            case "!="  : return [ "binary", "==", left, right ];
                            case "===" : return [ "binary", "!==", left, right ];
                            case "!==" : return [ "binary", "===", left, right ];
                            case "&&"  : return best_of(not_c, [ "binary", "||", negate(left), negate(right) ]);
                            case "||"  : return best_of(not_c, [ "binary", "&&", negate(left), negate(right) ]);
                        }
                        break;
                }
                return not_c;
        };

        function make_conditional(c, t, e) {
                var make_real_conditional = function() {
                        if (c[0] == "unary-prefix" && c[1] == "!") {
                                return e ? [ "conditional", c[2], e, t ] : [ "binary", "||", c[2], t ];
                        } else {
                                return e ? best_of(
                                        [ "conditional", c, t, e ],
                                        [ "conditional", negate(c), e, t ]
                                ) : [ "binary", "&&", c, t ];
                        }
                };
                // shortcut the conditional if the expression has a constant value
                return when_constant(c, function(ast, val){
                        warn_unreachable(val ? e : t);
                        return          (val ? t : e);
                }, make_real_conditional);
        };

        function rmblock(block) {
                if (block != null && block[0] == "block" && block[1]) {
                        if (block[1].length == 1)
                                block = block[1][0];
                        else if (block[1].length == 0)
                                block = [ "block" ];
                }
                return block;
        };

        function _lambda(name, args, body) {
                return [ this[0], name, args, tighten(body, "lambda") ];
        };

        // this function does a few things:
        // 1. discard useless blocks
        // 2. join consecutive var declarations
        // 3. remove obviously dead code
        // 4. transform consecutive statements using the comma operator
        // 5. if block_type == "lambda" and it detects constructs like if(foo) return ... - rewrite like if (!foo) { ... }
        function tighten(statements, block_type) {
                statements = MAP(statements, walk);

                statements = statements.reduce(function(a, stat){
                        if (stat[0] == "block") {
                                if (stat[1]) {
                                        a.push.apply(a, stat[1]);
                                }
                        } else {
                                a.push(stat);
                        }
                        return a;
                }, []);

                statements = (function(a, prev){
                        statements.forEach(function(cur){
                                if (prev && ((cur[0] == "var" && prev[0] == "var") ||
                                             (cur[0] == "const" && prev[0] == "const"))) {
                                        prev[1] = prev[1].concat(cur[1]);
                                } else {
                                        a.push(cur);
                                        prev = cur;
                                }
                        });
                        return a;
                })([]);

                if (options.dead_code) statements = (function(a, has_quit){
                        statements.forEach(function(st){
                                if (has_quit) {
                                        if (st[0] == "function" || st[0] == "defun") {
                                                a.push(st);
                                        }
                                        else if (st[0] == "var" || st[0] == "const") {
                                                if (!options.no_warnings)
                                                        warn("Variables declared in unreachable code");
                                                st[1] = MAP(st[1], function(def){
                                                        if (def[1] && !options.no_warnings)
                                                                warn_unreachable([ "assign", true, [ "name", def[0] ], def[1] ]);
                                                        return [ def[0] ];
                                                });
                                                a.push(st);
                                        }
                                        else if (!options.no_warnings)
                                                warn_unreachable(st);
                                }
                                else {
                                        a.push(st);
                                        if (member(st[0], [ "return", "throw", "break", "continue" ]))
                                                has_quit = true;
                                }
                        });
                        return a;
                })([]);

                if (options.make_seqs) statements = (function(a, prev) {
                        statements.forEach(function(cur){
                                if (prev && prev[0] == "stat" && cur[0] == "stat") {
                                        prev[1] = [ "seq", prev[1], cur[1] ];
                                } else {
                                        a.push(cur);
                                        prev = cur;
                                }
                        });
                        if (a.length >= 2
                            && a[a.length-2][0] == "stat"
                            && (a[a.length-1][0] == "return" || a[a.length-1][0] == "throw")
                            && a[a.length-1][1])
                        {
                                a.splice(a.length - 2, 2,
                                         [ a[a.length-1][0],
                                           [ "seq", a[a.length-2][1], a[a.length-1][1] ]]);
                        }
                        return a;
                })([]);

                // this increases jQuery by 1K.  Probably not such a good idea after all..
                // part of this is done in prepare_ifs anyway.
                // if (block_type == "lambda") statements = (function(i, a, stat){
                //         while (i < statements.length) {
                //                 stat = statements[i++];
                //                 if (stat[0] == "if" && !stat[3]) {
                //                         if (stat[2][0] == "return" && stat[2][1] == null) {
                //                                 a.push(make_if(negate(stat[1]), [ "block", statements.slice(i) ]));
                //                                 break;
                //                         }
                //                         var last = last_stat(stat[2]);
                //                         if (last[0] == "return" && last[1] == null) {
                //                                 a.push(make_if(stat[1], [ "block", stat[2][1].slice(0, -1) ], [ "block", statements.slice(i) ]));
                //                                 break;
                //                         }
                //                 }
                //                 a.push(stat);
                //         }
                //         return a;
                // })(0, []);

                return statements;
        };

        function make_if(c, t, e) {
                return when_constant(c, function(ast, val){
                        if (val) {
                                t = walk(t);
                                warn_unreachable(e);
                                return t || [ "block" ];
                        } else {
                                e = walk(e);
                                warn_unreachable(t);
                                return e || [ "block" ];
                        }
                }, function() {
                        return make_real_if(c, t, e);
                });
        };

        function abort_else(c, t, e) {
                var ret = [ [ "if", negate(c), e ] ];
                if (t[0] == "block") {
                        if (t[1]) ret = ret.concat(t[1]);
                } else {
                        ret.push(t);
                }
                return walk([ "block", ret ]);
        };

        function make_real_if(c, t, e) {
                c = walk(c);
                t = walk(t);
                e = walk(e);

                if (empty(e) && empty(t))
                        return [ "stat", c ];

                if (empty(t)) {
                        c = negate(c);
                        t = e;
                        e = null;
                } else if (empty(e)) {
                        e = null;
                } else {
                        // if we have both else and then, maybe it makes sense to switch them?
                        (function(){
                                var a = gen_code(c);
                                var n = negate(c);
                                var b = gen_code(n);
                                if (b.length < a.length) {
                                        var tmp = t;
                                        t = e;
                                        e = tmp;
                                        c = n;
                                }
                        })();
                }
                var ret = [ "if", c, t, e ];
                if (t[0] == "if" && empty(t[3]) && empty(e)) {
                        ret = best_of(ret, walk([ "if", [ "binary", "&&", c, t[1] ], t[2] ]));
                }
                else if (t[0] == "stat") {
                        if (e) {
                                if (e[0] == "stat")
                                        ret = best_of(ret, [ "stat", make_conditional(c, t[1], e[1]) ]);
                                else if (aborts(e))
                                        ret = abort_else(c, t, e);
                        }
                        else {
                                ret = best_of(ret, [ "stat", make_conditional(c, t[1]) ]);
                        }
                }
                else if (e && t[0] == e[0] && (t[0] == "return" || t[0] == "throw") && t[1] && e[1]) {
                        ret = best_of(ret, [ t[0], make_conditional(c, t[1], e[1] ) ]);
                }
                else if (e && aborts(t)) {
                        ret = [ [ "if", c, t ] ];
                        if (e[0] == "block") {
                                if (e[1]) ret = ret.concat(e[1]);
                        }
                        else {
                                ret.push(e);
                        }
                        ret = walk([ "block", ret ]);
                }
                else if (t && aborts(e)) {
                        ret = abort_else(c, t, e);
                }
                return ret;
        };

        function _do_while(cond, body) {
                return when_constant(cond, function(cond, val){
                        if (!val) {
                                warn_unreachable(body);
                                return [ "block" ];
                        } else {
                                return [ "for", null, null, null, walk(body) ];
                        }
                });
        };

        return w.with_walkers({
                "sub": function(expr, subscript) {
                        if (subscript[0] == "string") {
                                var name = subscript[1];
                                if (is_identifier(name))
                                        return [ "dot", walk(expr), name ];
                                else if (/^[1-9][0-9]*$/.test(name) || name === "0")
                                        return [ "sub", walk(expr), [ "num", parseInt(name, 10) ] ];
                        }
                },
                "if": make_if,
                "toplevel": function(body) {
                        return [ "toplevel", tighten(body) ];
                },
                "switch": function(expr, body) {
                        var last = body.length - 1;
                        return [ "switch", walk(expr), MAP(body, function(branch, i){
                                var block = tighten(branch[1]);
                                if (i == last && block.length > 0) {
                                        var node = block[block.length - 1];
                                        if (node[0] == "break" && !node[1])
                                                block.pop();
                                }
                                return [ branch[0] ? walk(branch[0]) : null, block ];
                        }) ];
                },
                "function": _lambda,
                "defun": _lambda,
                "block": function(body) {
                        if (body) return rmblock([ "block", tighten(body) ]);
                },
                "binary": function(op, left, right) {
                        return when_constant([ "binary", op, walk(left), walk(right) ], function yes(c){
                                return best_of(walk(c), this);
                        }, function no() {
                                return function(){
                                        if(op != "==" && op != "!=") return;
                                        var l = walk(left), r = walk(right);
                                        if(l && l[0] == "unary-prefix" && l[1] == "!" && l[2][0] == "num")
                                                left = ['num', +!l[2][1]];
                                        else if (r && r[0] == "unary-prefix" && r[1] == "!" && r[2][0] == "num")
                                                right = ['num', +!r[2][1]];
                                        return ["binary", op, left, right];
                                }() || this;
                        });
                },
                "conditional": function(c, t, e) {
                        return make_conditional(walk(c), walk(t), walk(e));
                },
                "try": function(t, c, f) {
                        return [
                                "try",
                                tighten(t),
                                c != null ? [ c[0], tighten(c[1]) ] : null,
                                f != null ? tighten(f) : null
                        ];
                },
                "unary-prefix": function(op, expr) {
                        expr = walk(expr);
                        var ret = [ "unary-prefix", op, expr ];
                        if (op == "!")
                                ret = best_of(ret, negate(expr));
                        return when_constant(ret, function(ast, val){
                                return walk(ast); // it's either true or false, so minifies to !0 or !1
                        }, function() { return ret });
                },
                "name": function(name) {
                        switch (name) {
                            case "true": return [ "unary-prefix", "!", [ "num", 0 ]];
                            case "false": return [ "unary-prefix", "!", [ "num", 1 ]];
                        }
                },
                "while": _do_while,
                "assign": function(op, lvalue, rvalue) {
                        lvalue = walk(lvalue);
                        rvalue = walk(rvalue);
                        var okOps = [ '+', '-', '/', '*', '%', '>>', '<<', '>>>', '|', '^', '&' ];
                        if (op === true && lvalue[0] === "name" && rvalue[0] === "binary" &&
                            ~okOps.indexOf(rvalue[1]) && rvalue[2][0] === "name" &&
                            rvalue[2][1] === lvalue[1]) {
                                return [ this[0], rvalue[1], lvalue, rvalue[3] ]
                        }
                        return [ this[0], op, lvalue, rvalue ];
                },
                "call": function(expr, args) {
                        expr = walk(expr);
                        if (options.unsafe && expr[0] == "dot" && expr[1][0] == "string" && expr[2] == "toString") {
                                return expr[1];
                        }
                        return [ this[0], expr,  MAP(args, walk) ];
                },
                "num": function (num) {
                        if (!isFinite(num))
                                return [ "binary", "/", num === 1 / 0
                                         ? [ "num", 1 ] : num === -1 / 0
                                         ? [ "unary-prefix", "-", [ "num", 1 ] ]
                                         : [ "num", 0 ], [ "num", 0 ] ];

                        return [ this[0], num ];
                }
        }, function() {
                return walk(prepare_ifs(walk(prepare_ifs(ast))));
        });
};

function squeeze_2(ast, options) {
        var w = ast_walker(), walk = w.walk, scope;
        function with_scope(s, cont) {
                var save = scope, ret;
                scope = s;
                ret = cont();
                scope = save;
                return ret;
        };
        function lambda(name, args, body) {
                return [ this[0], name, args, with_scope(body.scope, curry(MAP, body, walk)) ];
        };
        return w.with_walkers({
                "directive": function(dir) {
                        if (scope.active_directive(dir))
                                return [ "block" ];
                        scope.directives.push(dir);
                },
                "toplevel": function(body) {
                        return [ this[0], with_scope(this.scope, curry(MAP, body, walk)) ];
                },
                "function": lambda,
                "defun": lambda
        }, function(){
                return walk(ast_add_scope(ast));
        });
};

/* -----[ re-generate code from the AST ]----- */

var DOT_CALL_NO_PARENS = jsp.array_to_hash([
        "name",
        "array",
        "object",
        "string",
        "dot",
        "sub",
        "call",
        "regexp",
        "defun"
]);

function make_string(str, ascii_only) {
        var dq = 0, sq = 0;
        str = str.replace(/[\\\b\f\n\r\t\x22\x27\u2028\u2029\0]/g, function(s){
                switch (s) {
                    case "\\": return "\\\\";
                    case "\b": return "\\b";
                    case "\f": return "\\f";
                    case "\n": return "\\n";
                    case "\r": return "\\r";
                    case "\u2028": return "\\u2028";
                    case "\u2029": return "\\u2029";
                    case '"': ++dq; return '"';
                    case "'": ++sq; return "'";
                    case "\0": return "\\0";
                }
                return s;
        });
        if (ascii_only) str = to_ascii(str);
        if (dq > sq) return "'" + str.replace(/\x27/g, "\\'") + "'";
        else return '"' + str.replace(/\x22/g, '\\"') + '"';
};

function to_ascii(str) {
        return str.replace(/[\u0080-\uffff]/g, function(ch) {
                var code = ch.charCodeAt(0).toString(16);
                while (code.length < 4) code = "0" + code;
                return "\\u" + code;
        });
};

var SPLICE_NEEDS_BRACKETS = jsp.array_to_hash([ "if", "while", "do", "for", "for-in", "with" ]);

function gen_code(ast, options) {
        options = defaults(options, {
                indent_start : 0,
                indent_level : 4,
                quote_keys   : false,
                space_colon  : false,
                beautify     : false,
                ascii_only   : false,
                inline_script: false
        });
        var beautify = !!options.beautify;
        var indentation = 0,
            newline = beautify ? "\n" : "",
            space = beautify ? " " : "";

        function encode_string(str) {
                var ret = make_string(str, options.ascii_only);
                if (options.inline_script)
                        ret = ret.replace(/<\x2fscript([>\/\t\n\f\r ])/gi, "<\\/script$1");
                return ret;
        };

        function make_name(name) {
                name = name.toString();
                if (options.ascii_only)
                        name = to_ascii(name);
                return name;
        };

        function indent(line) {
                if (line == null)
                        line = "";
                if (beautify)
                        line = repeat_string(" ", options.indent_start + indentation * options.indent_level) + line;
                return line;
        };

        function with_indent(cont, incr) {
                if (incr == null) incr = 1;
                indentation += incr;
                try { return cont.apply(null, slice(arguments, 1)); }
                finally { indentation -= incr; }
        };

        function last_char(str) {
                str = str.toString();
                return str.charAt(str.length - 1);
        };

        function first_char(str) {
                return str.toString().charAt(0);
        };

        function add_spaces(a) {
                if (beautify)
                        return a.join(" ");
                var b = [];
                for (var i = 0; i < a.length; ++i) {
                        var next = a[i + 1];
                        b.push(a[i]);
                        if (next &&
                            ((is_identifier_char(last_char(a[i])) && (is_identifier_char(first_char(next))
                                                                      || first_char(next) == "\\")) ||
                             (/[\+\-]$/.test(a[i].toString()) && /^[\+\-]/.test(next.toString())))) {
                                b.push(" ");
                        }
                }
                return b.join("");
        };

        function add_commas(a) {
                return a.join("," + space);
        };

        function parenthesize(expr) {
                var gen = make(expr);
                for (var i = 1; i < arguments.length; ++i) {
                        var el = arguments[i];
                        if ((el instanceof Function && el(expr)) || expr[0] == el)
                                return "(" + gen + ")";
                }
                return gen;
        };

        function best_of(a) {
                if (a.length == 1) {
                        return a[0];
                }
                if (a.length == 2) {
                        var b = a[1];
                        a = a[0];
                        return a.length <= b.length ? a : b;
                }
                return best_of([ a[0], best_of(a.slice(1)) ]);
        };

        function needs_parens(expr) {
                if (expr[0] == "function" || expr[0] == "object") {
                        // dot/call on a literal function requires the
                        // function literal itself to be parenthesized
                        // only if it's the first "thing" in a
                        // statement.  This means that the parent is
                        // "stat", but it could also be a "seq" and
                        // we're the first in this "seq" and the
                        // parent is "stat", and so on.  Messy stuff,
                        // but it worths the trouble.
                        var a = slice(w.stack()), self = a.pop(), p = a.pop();
                        while (p) {
                                if (p[0] == "stat") return true;
                                if (((p[0] == "seq" || p[0] == "call" || p[0] == "dot" || p[0] == "sub" || p[0] == "conditional") && p[1] === self) ||
                                    ((p[0] == "binary" || p[0] == "assign" || p[0] == "unary-postfix") && p[2] === self)) {
                                        self = p;
                                        p = a.pop();
                                } else {
                                        return false;
                                }
                        }
                }
                return !HOP(DOT_CALL_NO_PARENS, expr[0]);
        };

        function make_num(num) {
                var str = num.toString(10), a = [ str.replace(/^0\./, ".").replace('e+', 'e') ], m;
                if (Math.floor(num) === num) {
                        if (num >= 0) {
                                a.push("0x" + num.toString(16).toLowerCase(), // probably pointless
                                       "0" + num.toString(8)); // same.
                        } else {
                                a.push("-0x" + (-num).toString(16).toLowerCase(), // probably pointless
                                       "-0" + (-num).toString(8)); // same.
                        }
                        if ((m = /^(.*?)(0+)$/.exec(num))) {
                                a.push(m[1] + "e" + m[2].length);
                        }
                } else if ((m = /^0?\.(0+)(.*)$/.exec(num))) {
                        a.push(m[2] + "e-" + (m[1].length + m[2].length),
                               str.substr(str.indexOf(".")));
                }
                return best_of(a);
        };

        var w = ast_walker();
        var make = w.walk;
        return w.with_walkers({
                "string": encode_string,
                "num": make_num,
                "name": make_name,
                "debugger": function(){ return "debugger;" },
                "toplevel": function(statements) {
                        return make_block_statements(statements)
                                .join(newline + newline);
                },
                "splice": function(statements) {
                        var parent = w.parent();
                        if (HOP(SPLICE_NEEDS_BRACKETS, parent)) {
                                // we need block brackets in this case
                                return make_block.apply(this, arguments);
                        } else {
                                return MAP(make_block_statements(statements, true),
                                           function(line, i) {
                                                   // the first line is already indented
                                                   return i > 0 ? indent(line) : line;
                                           }).join(newline);
                        }
                },
                "block": make_block,
                "var": function(defs) {
                        return "var " + add_commas(MAP(defs, make_1vardef)) + ";";
                },
                "const": function(defs) {
                        return "const " + add_commas(MAP(defs, make_1vardef)) + ";";
                },
                "try": function(tr, ca, fi) {
                        var out = [ "try", make_block(tr) ];
                        if (ca) out.push("catch", "(" + ca[0] + ")", make_block(ca[1]));
                        if (fi) out.push("finally", make_block(fi));
                        return add_spaces(out);
                },
                "throw": function(expr) {
                        return add_spaces([ "throw", make(expr) ]) + ";";
                },
                "new": function(ctor, args) {
                        args = args.length > 0 ? "(" + add_commas(MAP(args, function(expr){
                                return parenthesize(expr, "seq");
                        })) + ")" : "";
                        return add_spaces([ "new", parenthesize(ctor, "seq", "binary", "conditional", "assign", function(expr){
                                var w = ast_walker(), has_call = {};
                                try {
                                        w.with_walkers({
                                                "call": function() { throw has_call },
                                                "function": function() { return this }
                                        }, function(){
                                                w.walk(expr);
                                        });
                                } catch(ex) {
                                        if (ex === has_call)
                                                return true;
                                        throw ex;
                                }
                        }) + args ]);
                },
                "switch": function(expr, body) {
                        return add_spaces([ "switch", "(" + make(expr) + ")", make_switch_block(body) ]);
                },
                "break": function(label) {
                        var out = "break";
                        if (label != null)
                                out += " " + make_name(label);
                        return out + ";";
                },
                "continue": function(label) {
                        var out = "continue";
                        if (label != null)
                                out += " " + make_name(label);
                        return out + ";";
                },
                "conditional": function(co, th, el) {
                        return add_spaces([ parenthesize(co, "assign", "seq", "conditional"), "?",
                                            parenthesize(th, "seq"), ":",
                                            parenthesize(el, "seq") ]);
                },
                "assign": function(op, lvalue, rvalue) {
                        if (op && op !== true) op += "=";
                        else op = "=";
                        return add_spaces([ make(lvalue), op, parenthesize(rvalue, "seq") ]);
                },
                "dot": function(expr) {
                        var out = make(expr), i = 1;
                        if (expr[0] == "num") {
                                if (!/[a-f.]/i.test(out))
                                        out += ".";
                        } else if (expr[0] != "function" && needs_parens(expr))
                                out = "(" + out + ")";
                        while (i < arguments.length)
                                out += "." + make_name(arguments[i++]);
                        return out;
                },
                "call": function(func, args) {
                        var f = make(func);
                        if (f.charAt(0) != "(" && needs_parens(func))
                                f = "(" + f + ")";
                        return f + "(" + add_commas(MAP(args, function(expr){
                                return parenthesize(expr, "seq");
                        })) + ")";
                },
                "function": make_function,
                "defun": make_function,
                "if": function(co, th, el) {
                        var out = [ "if", "(" + make(co) + ")", el ? make_then(th) : make(th) ];
                        if (el) {
                                out.push("else", make(el));
                        }
                        return add_spaces(out);
                },
                "for": function(init, cond, step, block) {
                        var out = [ "for" ];
                        init = (init != null ? make(init) : "").replace(/;*\s*$/, ";" + space);
                        cond = (cond != null ? make(cond) : "").replace(/;*\s*$/, ";" + space);
                        step = (step != null ? make(step) : "").replace(/;*\s*$/, "");
                        var args = init + cond + step;
                        if (args == "; ; ") args = ";;";
                        out.push("(" + args + ")", make(block));
                        return add_spaces(out);
                },
                "for-in": function(vvar, key, hash, block) {
                        return add_spaces([ "for", "(" +
                                            (vvar ? make(vvar).replace(/;+$/, "") : make(key)),
                                            "in",
                                            make(hash) + ")", make(block) ]);
                },
                "while": function(condition, block) {
                        return add_spaces([ "while", "(" + make(condition) + ")", make(block) ]);
                },
                "do": function(condition, block) {
                        return add_spaces([ "do", make(block), "while", "(" + make(condition) + ")" ]) + ";";
                },
                "return": function(expr) {
                        var out = [ "return" ];
                        if (expr != null) out.push(make(expr));
                        return add_spaces(out) + ";";
                },
                "binary": function(operator, lvalue, rvalue) {
                        var left = make(lvalue), right = make(rvalue);
                        // XXX: I'm pretty sure other cases will bite here.
                        //      we need to be smarter.
                        //      adding parens all the time is the safest bet.
                        if (member(lvalue[0], [ "assign", "conditional", "seq" ]) ||
                            lvalue[0] == "binary" && PRECEDENCE[operator] > PRECEDENCE[lvalue[1]] ||
                            lvalue[0] == "function" && needs_parens(this)) {
                                left = "(" + left + ")";
                        }
                        if (member(rvalue[0], [ "assign", "conditional", "seq" ]) ||
                            rvalue[0] == "binary" && PRECEDENCE[operator] >= PRECEDENCE[rvalue[1]] &&
                            !(rvalue[1] == operator && member(operator, [ "&&", "||", "*" ]))) {
                                right = "(" + right + ")";
                        }
                        else if (!beautify && options.inline_script && (operator == "<" || operator == "<<")
                                 && rvalue[0] == "regexp" && /^script/i.test(rvalue[1])) {
                                right = " " + right;
                        }
                        return add_spaces([ left, operator, right ]);
                },
                "unary-prefix": function(operator, expr) {
                        var val = make(expr);
                        if (!(expr[0] == "num" || (expr[0] == "unary-prefix" && !HOP(OPERATORS, operator + expr[1])) || !needs_parens(expr)))
                                val = "(" + val + ")";
                        return operator + (jsp.is_alphanumeric_char(operator.charAt(0)) ? " " : "") + val;
                },
                "unary-postfix": function(operator, expr) {
                        var val = make(expr);
                        if (!(expr[0] == "num" || (expr[0] == "unary-postfix" && !HOP(OPERATORS, operator + expr[1])) || !needs_parens(expr)))
                                val = "(" + val + ")";
                        return val + operator;
                },
                "sub": function(expr, subscript) {
                        var hash = make(expr);
                        if (needs_parens(expr))
                                hash = "(" + hash + ")";
                        return hash + "[" + make(subscript) + "]";
                },
                "object": function(props) {
                        var obj_needs_parens = needs_parens(this);
                        if (props.length == 0)
                                return obj_needs_parens ? "({})" : "{}";
                        var out = "{" + newline + with_indent(function(){
                                return MAP(props, function(p){
                                        if (p.length == 3) {
                                                // getter/setter.  The name is in p[0], the arg.list in p[1][2], the
                                                // body in p[1][3] and type ("get" / "set") in p[2].
                                                return indent(make_function(p[0], p[1][2], p[1][3], p[2], true));
                                        }
                                        var key = p[0], val = parenthesize(p[1], "seq");
                                        if (options.quote_keys) {
                                                key = encode_string(key);
                                        } else if ((typeof key == "number" || !beautify && +key + "" == key)
                                                   && parseFloat(key) >= 0) {
                                                key = make_num(+key);
                                        } else if (!is_identifier(key)) {
                                                key = encode_string(key);
                                        }
                                        return indent(add_spaces(beautify && options.space_colon
                                                                 ? [ key, ":", val ]
                                                                 : [ key + ":", val ]));
                                }).join("," + newline);
                        }) + newline + indent("}");
                        return obj_needs_parens ? "(" + out + ")" : out;
                },
                "regexp": function(rx, mods) {
                        if (options.ascii_only) rx = to_ascii(rx);
                        return "/" + rx + "/" + mods;
                },
                "array": function(elements) {
                        if (elements.length == 0) return "[]";
                        return add_spaces([ "[", add_commas(MAP(elements, function(el, i){
                                if (!beautify && el[0] == "atom" && el[1] == "undefined") return i === elements.length - 1 ? "," : "";
                                return parenthesize(el, "seq");
                        })), "]" ]);
                },
                "stat": function(stmt) {
                        return stmt != null
                                ? make(stmt).replace(/;*\s*$/, ";")
                                : ";";
                },
                "seq": function() {
                        return add_commas(MAP(slice(arguments), make));
                },
                "label": function(name, block) {
                        return add_spaces([ make_name(name), ":", make(block) ]);
                },
                "with": function(expr, block) {
                        return add_spaces([ "with", "(" + make(expr) + ")", make(block) ]);
                },
                "atom": function(name) {
                        return make_name(name);
                },
                "directive": function(dir) {
                        return make_string(dir) + ";";
                }
        }, function(){ return make(ast) });

        // The squeezer replaces "block"-s that contain only a single
        // statement with the statement itself; technically, the AST
        // is correct, but this can create problems when we output an
        // IF having an ELSE clause where the THEN clause ends in an
        // IF *without* an ELSE block (then the outer ELSE would refer
        // to the inner IF).  This function checks for this case and
        // adds the block brackets if needed.
        function make_then(th) {
                if (th == null) return ";";
                if (th[0] == "do") {
                        // https://github.com/mishoo/UglifyJS/issues/#issue/57
                        // IE croaks with "syntax error" on code like this:
                        //     if (foo) do ... while(cond); else ...
                        // we need block brackets around do/while
                        return make_block([ th ]);
                }
                var b = th;
                while (true) {
                        var type = b[0];
                        if (type == "if") {
                                if (!b[3])
                                        // no else, we must add the block
                                        return make([ "block", [ th ]]);
                                b = b[3];
                        }
                        else if (type == "while" || type == "do") b = b[2];
                        else if (type == "for" || type == "for-in") b = b[4];
                        else break;
                }
                return make(th);
        };

        function make_function(name, args, body, keyword, no_parens) {
                var out = keyword || "function";
                if (name) {
                        out += " " + make_name(name);
                }
                out += "(" + add_commas(MAP(args, make_name)) + ")";
                out = add_spaces([ out, make_block(body) ]);
                return (!no_parens && needs_parens(this)) ? "(" + out + ")" : out;
        };

        function must_has_semicolon(node) {
                switch (node[0]) {
                    case "with":
                    case "while":
                        return empty(node[2]) || must_has_semicolon(node[2]);
                    case "for":
                    case "for-in":
                        return empty(node[4]) || must_has_semicolon(node[4]);
                    case "if":
                        if (empty(node[2]) && !node[3]) return true; // `if' with empty `then' and no `else'
                        if (node[3]) {
                                if (empty(node[3])) return true; // `else' present but empty
                                return must_has_semicolon(node[3]); // dive into the `else' branch
                        }
                        return must_has_semicolon(node[2]); // dive into the `then' branch
                    case "directive":
                        return true;
                }
        };

        function make_block_statements(statements, noindent) {
                for (var a = [], last = statements.length - 1, i = 0; i <= last; ++i) {
                        var stat = statements[i];
                        var code = make(stat);
                        if (code != ";") {
                                if (!beautify && i == last && !must_has_semicolon(stat)) {
                                        code = code.replace(/;+\s*$/, "");
                                }
                                a.push(code);
                        }
                }
                return noindent ? a : MAP(a, indent);
        };

        function make_switch_block(body) {
                var n = body.length;
                if (n == 0) return "{}";
                return "{" + newline + MAP(body, function(branch, i){
                        var has_body = branch[1].length > 0, code = with_indent(function(){
                                return indent(branch[0]
                                              ? add_spaces([ "case", make(branch[0]) + ":" ])
                                              : "default:");
                        }, 0.5) + (has_body ? newline + with_indent(function(){
                                return make_block_statements(branch[1]).join(newline);
                        }) : "");
                        if (!beautify && has_body && i < n - 1)
                                code += ";";
                        return code;
                }).join(newline) + newline + indent("}");
        };

        function make_block(statements) {
                if (!statements) return ";";
                if (statements.length == 0) return "{}";
                return "{" + newline + with_indent(function(){
                        return make_block_statements(statements).join(newline);
                }) + newline + indent("}");
        };

        function make_1vardef(def) {
                var name = def[0], val = def[1];
                if (val != null)
                        name = add_spaces([ make_name(name), "=", parenthesize(val, "seq") ]);
                return name;
        };

};

function split_lines(code, max_line_length) {
        var splits = [ 0 ];
        jsp.parse(function(){
                var next_token = jsp.tokenizer(code);
                var last_split = 0;
                var prev_token;
                function current_length(tok) {
                        return tok.pos - last_split;
                };
                function split_here(tok) {
                        last_split = tok.pos;
                        splits.push(last_split);
                };
                function custom(){
                        var tok = next_token.apply(this, arguments);
                        out: {
                                if (prev_token) {
                                        if (prev_token.type == "keyword") break out;
                                }
                                if (current_length(tok) > max_line_length) {
                                        switch (tok.type) {
                                            case "keyword":
                                            case "atom":
                                            case "name":
                                            case "punc":
                                                split_here(tok);
                                                break out;
                                        }
                                }
                        }
                        prev_token = tok;
                        return tok;
                };
                custom.context = function() {
                        return next_token.context.apply(this, arguments);
                };
                return custom;
        }());
        return splits.map(function(pos, i){
                return code.substring(pos, splits[i + 1] || code.length);
        }).join("\n");
};

/* -----[ Utilities ]----- */

function repeat_string(str, i) {
        if (i <= 0) return "";
        if (i == 1) return str;
        var d = repeat_string(str, i >> 1);
        d += d;
        if (i & 1) d += str;
        return d;
};

function defaults(args, defs) {
        var ret = {};
        if (args === true)
                args = {};
        for (var i in defs) if (HOP(defs, i)) {
                ret[i] = (args && HOP(args, i)) ? args[i] : defs[i];
        }
        return ret;
};

function is_identifier(name) {
        return /^[a-z_$][a-z0-9_$]*$/i.test(name)
                && name != "this"
                && !HOP(jsp.KEYWORDS_ATOM, name)
                && !HOP(jsp.RESERVED_WORDS, name)
                && !HOP(jsp.KEYWORDS, name);
};

function HOP(obj, prop) {
        return Object.prototype.hasOwnProperty.call(obj, prop);
};

// some utilities

var MAP;

(function(){
        MAP = function(a, f, o) {
                var ret = [], top = [], i;
                function doit() {
                        var val = f.call(o, a[i], i);
                        if (val instanceof AtTop) {
                                val = val.v;
                                if (val instanceof Splice) {
                                        top.push.apply(top, val.v);
                                } else {
                                        top.push(val);
                                }
                        }
                        else if (val != skip) {
                                if (val instanceof Splice) {
                                        ret.push.apply(ret, val.v);
                                } else {
                                        ret.push(val);
                                }
                        }
                };
                if (a instanceof Array) for (i = 0; i < a.length; ++i) doit();
                else for (i in a) if (HOP(a, i)) doit();
                return top.concat(ret);
        };
        MAP.at_top = function(val) { return new AtTop(val) };
        MAP.splice = function(val) { return new Splice(val) };
        var skip = MAP.skip = {};
        function AtTop(val) { this.v = val };
        function Splice(val) { this.v = val };
})();

/* -----[ Exports ]----- */

exports.ast_walker = ast_walker;
exports.ast_mangle = ast_mangle;
exports.ast_squeeze = ast_squeeze;
exports.ast_lift_variables = ast_lift_variables;
exports.gen_code = gen_code;
exports.ast_add_scope = ast_add_scope;
exports.set_logger = function(logger) { warn = logger };
exports.make_string = make_string;
exports.split_lines = split_lines;
exports.MAP = MAP;

// keep this last!
exports.ast_squeeze_more = require("./squeeze-more").ast_squeeze_more;

// Local variables:
// js-indent-level: 8
// End:

},{"./parse-js":"/Users/Jacob/workspace/scheduler/front-end/node_modules/cldr/node_modules/uglify-js/lib/parse-js.js","./squeeze-more":"/Users/Jacob/workspace/scheduler/front-end/node_modules/cldr/node_modules/uglify-js/lib/squeeze-more.js"}],"/Users/Jacob/workspace/scheduler/front-end/node_modules/cldr/node_modules/uglify-js/lib/squeeze-more.js":[function(require,module,exports){
var jsp = require("./parse-js"),
    pro = require("./process"),
    slice = jsp.slice,
    member = jsp.member,
    curry = jsp.curry,
    MAP = pro.MAP,
    PRECEDENCE = jsp.PRECEDENCE,
    OPERATORS = jsp.OPERATORS;

function ast_squeeze_more(ast) {
        var w = pro.ast_walker(), walk = w.walk, scope;
        function with_scope(s, cont) {
                var save = scope, ret;
                scope = s;
                ret = cont();
                scope = save;
                return ret;
        };
        function _lambda(name, args, body) {
                return [ this[0], name, args, with_scope(body.scope, curry(MAP, body, walk)) ];
        };
        return w.with_walkers({
                "toplevel": function(body) {
                        return [ this[0], with_scope(this.scope, curry(MAP, body, walk)) ];
                },
                "function": _lambda,
                "defun": _lambda,
                "new": function(ctor, args) {
                        if (ctor[0] == "name") {
                                if (ctor[1] == "Array" && !scope.has("Array")) {
                                        if (args.length != 1) {
                                                return [ "array", args ];
                                        } else {
                                                return walk([ "call", [ "name", "Array" ], args ]);
                                        }
                                } else if (ctor[1] == "Object" && !scope.has("Object")) {
                                        if (!args.length) {
                                                return [ "object", [] ];
                                        } else {
                                                return walk([ "call", [ "name", "Object" ], args ]);
                                        }
                                } else if ((ctor[1] == "RegExp" || ctor[1] == "Function" || ctor[1] == "Error") && !scope.has(ctor[1])) {
                                        return walk([ "call", [ "name", ctor[1] ], args]);
                                }
                        }
                },
                "call": function(expr, args) {
                        if (expr[0] == "dot" && expr[1][0] == "string" && args.length == 1
                            && (args[0][1] > 0 && expr[2] == "substring" || expr[2] == "substr")) {
                                return [ "call", [ "dot", expr[1], "slice"], args];
                        }
                        if (expr[0] == "dot" && expr[2] == "toString" && args.length == 0) {
                                // foo.toString()  ==>  foo+""
                                if (expr[1][0] == "string") return expr[1];
                                return [ "binary", "+", expr[1], [ "string", "" ]];
                        }
                        if (expr[0] == "name") {
                                if (expr[1] == "Array" && args.length != 1 && !scope.has("Array")) {
                                        return [ "array", args ];
                                }
                                if (expr[1] == "Object" && !args.length && !scope.has("Object")) {
                                        return [ "object", [] ];
                                }
                                if (expr[1] == "String" && !scope.has("String")) {
                                        return [ "binary", "+", args[0], [ "string", "" ]];
                                }
                        }
                }
        }, function() {
                return walk(pro.ast_add_scope(ast));
        });
};

exports.ast_squeeze_more = ast_squeeze_more;

// Local variables:
// js-indent-level: 8
// End:

},{"./parse-js":"/Users/Jacob/workspace/scheduler/front-end/node_modules/cldr/node_modules/uglify-js/lib/parse-js.js","./process":"/Users/Jacob/workspace/scheduler/front-end/node_modules/cldr/node_modules/uglify-js/lib/process.js"}],"/Users/Jacob/workspace/scheduler/front-end/node_modules/cldr/node_modules/uglify-js/uglify-js.js":[function(require,module,exports){
//convienence function(src, [options]);
function uglify(orig_code, options){
  options || (options = {});
  var jsp = uglify.parser;
  var pro = uglify.uglify;

  var ast = jsp.parse(orig_code, options.strict_semicolons); // parse code and get the initial AST
  ast = pro.ast_mangle(ast, options.mangle_options); // get a new AST with mangled names
  ast = pro.ast_squeeze(ast, options.squeeze_options); // get an AST with compression optimizations
  var final_code = pro.gen_code(ast, options.gen_options); // compressed code here
  return final_code;
};

uglify.parser = require("./lib/parse-js");
uglify.uglify = require("./lib/process");
uglify.consolidator = require("./lib/consolidator");

module.exports = uglify

},{"./lib/consolidator":"/Users/Jacob/workspace/scheduler/front-end/node_modules/cldr/node_modules/uglify-js/lib/consolidator.js","./lib/parse-js":"/Users/Jacob/workspace/scheduler/front-end/node_modules/cldr/node_modules/uglify-js/lib/parse-js.js","./lib/process":"/Users/Jacob/workspace/scheduler/front-end/node_modules/cldr/node_modules/uglify-js/lib/process.js"}],"/Users/Jacob/workspace/scheduler/front-end/node_modules/cldr/node_modules/underscore/underscore.js":[function(require,module,exports){
//     Underscore.js 1.3.3
//     (c) 2009-2012 Jeremy Ashkenas, DocumentCloud Inc.
//     Underscore is freely distributable under the MIT license.
//     Portions of Underscore are inspired or borrowed from Prototype,
//     Oliver Steele's Functional, and John Resig's Micro-Templating.
//     For all details and documentation:
//     http://documentcloud.github.com/underscore

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `global` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var slice            = ArrayProto.slice,
      unshift          = ArrayProto.unshift,
      toString         = ObjProto.toString,
      hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) { return new wrapper(obj); };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object via a string identifier,
  // for Closure Compiler "advanced" mode.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root['_'] = _;
  }

  // Current version.
  _.VERSION = '1.3.3';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, l = obj.length; i < l; i++) {
        if (i in obj && iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      for (var key in obj) {
        if (_.has(obj, key)) {
          if (iterator.call(context, obj[key], key, obj) === breaker) return;
        }
      }
    }
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = _.collect = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results[results.length] = iterator.call(context, value, index, list);
    });
    if (obj.length === +obj.length) results.length = obj.length;
    return results;
  };

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError('Reduce of empty array with no initial value');
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var reversed = _.toArray(obj).reverse();
    if (context && !initial) iterator = _.bind(iterator, context);
    return initial ? _.reduce(reversed, iterator, memo, context) : _.reduce(reversed, iterator);
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, iterator, context) {
    var result;
    any(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
    each(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    each(obj, function(value, index, list) {
      if (!iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, iterator, context) {
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
    each(obj, function(value, index, list) {
      if (!(result = result && iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
    each(obj, function(value, index, list) {
      if (result || (result = iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if a given value is included in the array or object using `===`.
  // Aliased as `contains`.
  _.include = _.contains = function(obj, target) {
    var found = false;
    if (obj == null) return found;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    found = any(obj, function(value) {
      return value === target;
    });
    return found;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    return _.map(obj, function(value) {
      return (_.isFunction(method) ? method || value : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, function(value){ return value[key]; });
  };

  // Return the maximum element or (element-based computation).
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0]) return Math.max.apply(Math, obj);
    if (!iterator && _.isEmpty(obj)) return -Infinity;
    var result = {computed : -Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed >= result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0]) return Math.min.apply(Math, obj);
    if (!iterator && _.isEmpty(obj)) return Infinity;
    var result = {computed : Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed < result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Shuffle an array.
  _.shuffle = function(obj) {
    var shuffled = [], rand;
    each(obj, function(value, index, list) {
      rand = Math.floor(Math.random() * (index + 1));
      shuffled[index] = shuffled[rand];
      shuffled[rand] = value;
    });
    return shuffled;
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, val, context) {
    var iterator = _.isFunction(val) ? val : function(obj) { return obj[val]; };
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value : value,
        criteria : iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria, b = right.criteria;
      if (a === void 0) return 1;
      if (b === void 0) return -1;
      return a < b ? -1 : a > b ? 1 : 0;
    }), 'value');
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = function(obj, val) {
    var result = {};
    var iterator = _.isFunction(val) ? val : function(obj) { return obj[val]; };
    each(obj, function(value, index) {
      var key = iterator(value, index);
      (result[key] || (result[key] = [])).push(value);
    });
    return result;
  };

  // Use a comparator function to figure out at what index an object should
  // be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator) {
    iterator || (iterator = _.identity);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >> 1;
      iterator(array[mid]) < iterator(obj) ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Safely convert anything iterable into a real, live array.
  _.toArray = function(obj) {
    if (!obj)                                     return [];
    if (_.isArray(obj))                           return slice.call(obj);
    if (_.isArguments(obj))                       return slice.call(obj);
    if (obj.toArray && _.isFunction(obj.toArray)) return obj.toArray();
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    return _.isArray(obj) ? obj.length : _.keys(obj).length;
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    return (n != null) && !guard ? slice.call(array, 0, n) : array[0];
  };

  // Returns everything but the last entry of the array. Especcialy useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if ((n != null) && !guard) {
      return slice.call(array, Math.max(array.length - n, 0));
    } else {
      return array[array.length - 1];
    }
  };

  // Returns everything but the first entry of the array. Aliased as `tail`.
  // Especially useful on the arguments object. Passing an **index** will return
  // the rest of the values in the array from that index onward. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = function(array, index, guard) {
    return slice.call(array, (index == null) || guard ? 1 : index);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, function(value){ return !!value; });
  };

  // Return a completely flattened version of an array.
  _.flatten = function(array, shallow) {
    return _.reduce(array, function(memo, value) {
      if (_.isArray(value)) return memo.concat(shallow ? value : _.flatten(value));
      memo[memo.length] = value;
      return memo;
    }, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iterator) {
    var initial = iterator ? _.map(array, iterator) : array;
    var results = [];
    // The `isSorted` flag is irrelevant if the array only contains two elements.
    if (array.length < 3) isSorted = true;
    _.reduce(initial, function (memo, value, index) {
      if (isSorted ? _.last(memo) !== value || !memo.length : !_.include(memo, value)) {
        memo.push(value);
        results.push(array[index]);
      }
      return memo;
    }, []);
    return results;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(_.flatten(arguments, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays. (Aliased as "intersect" for back-compat.)
  _.intersection = _.intersect = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.indexOf(other, item) >= 0;
      });
    });
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = _.flatten(slice.call(arguments, 1), true);
    return _.filter(array, function(value){ return !_.include(rest, value); });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var args = slice.call(arguments);
    var length = _.max(_.pluck(args, 'length'));
    var results = new Array(length);
    for (var i = 0; i < length; i++) results[i] = _.pluck(args, "" + i);
    return results;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i, l;
    if (isSorted) {
      i = _.sortedIndex(array, item);
      return array[i] === item ? i : -1;
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item);
    for (i = 0, l = array.length; i < l; i++) if (i in array && array[i] === item) return i;
    return -1;
  };

  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item) {
    if (array == null) return -1;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) return array.lastIndexOf(item);
    var i = array.length;
    while (i--) if (i in array && array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;

    var len = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(len);

    while(idx < len) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Reusable constructor function for prototype setting.
  var ctor = function(){};

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Binding with arguments is also known as `curry`.
  // Delegates to **ECMAScript 5**'s native `Function.bind` if available.
  // We check for `func.bind` first, to fail fast when `func` is undefined.
  _.bind = function bind(func, context) {
    var bound, args;
    if (func.bind === nativeBind && nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError;
    args = slice.call(arguments, 2);
    return bound = function() {
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
      ctor.prototype = func.prototype;
      var self = new ctor;
      var result = func.apply(self, args.concat(slice.call(arguments)));
      if (Object(result) === result) return result;
      return self;
    };
  };

  // Bind all of an object's methods to that object. Useful for ensuring that
  // all callbacks defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length == 0) funcs = _.functions(obj);
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(null, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time.
  _.throttle = function(func, wait) {
    var context, args, timeout, throttling, more, result;
    var whenDone = _.debounce(function(){ more = throttling = false; }, wait);
    return function() {
      context = this; args = arguments;
      var later = function() {
        timeout = null;
        if (more) func.apply(context, args);
        whenDone();
      };
      if (!timeout) timeout = setTimeout(later, wait);
      if (throttling) {
        more = true;
      } else {
        result = func.apply(context, args);
      }
      whenDone();
      throttling = true;
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      if (immediate && !timeout) func.apply(context, args);
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      return memo = func.apply(this, arguments);
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return function() {
      var args = [func].concat(slice.call(arguments, 0));
      return wrapper.apply(this, args);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = arguments;
    return function() {
      var args = arguments;
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    if (times <= 0) return func();
    return function() {
      if (--times < 1) { return func.apply(this, arguments); }
    };
  };

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = nativeKeys || function(obj) {
    if (obj !== Object(obj)) throw new TypeError('Invalid object');
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys[keys.length] = key;
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    return _.map(obj, _.identity);
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      for (var prop in source) {
        obj[prop] = source[prop];
      }
    });
    return obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(obj) {
    var result = {};
    each(_.flatten(slice.call(arguments, 1)), function(key) {
      if (key in obj) result[key] = obj[key];
    });
    return result;
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      for (var prop in source) {
        if (obj[prop] == null) obj[prop] = source[prop];
      }
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function.
  function eq(a, b, stack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the Harmony `egal` proposal: http://wiki.ecmascript.org/doku.php?id=harmony:egal.
    if (a === b) return a !== 0 || 1 / a == 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a._chain) a = a._wrapped;
    if (b._chain) b = b._wrapped;
    // Invoke a custom `isEqual` method if one is provided.
    if (a.isEqual && _.isFunction(a.isEqual)) return a.isEqual(b);
    if (b.isEqual && _.isFunction(b.isEqual)) return b.isEqual(a);
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className != toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return a == String(b);
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
      // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = stack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (stack[length] == a) return true;
    }
    // Add the first object to the stack of traversed objects.
    stack.push(a);
    var size = 0, result = true;
    // Recursively compare objects and arrays.
    if (className == '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size == b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          // Ensure commutative equality for sparse arrays.
          if (!(result = size in a == size in b && eq(a[size], b[size], stack))) break;
        }
      }
    } else {
      // Objects with different constructors are not equivalent.
      if ('constructor' in a != 'constructor' in b || a.constructor != b.constructor) return false;
      // Deep compare objects.
      for (var key in a) {
        if (_.has(a, key)) {
          // Count the expected number of properties.
          size++;
          // Deep compare each member.
          if (!(result = _.has(b, key) && eq(a[key], b[key], stack))) break;
        }
      }
      // Ensure that both objects contain the same number of properties.
      if (result) {
        for (key in b) {
          if (_.has(b, key) && !(size--)) break;
        }
        result = !size;
      }
    }
    // Remove the first object from the stack of traversed objects.
    stack.pop();
    return result;
  }

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType == 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) == '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    return obj === Object(obj);
  };

  // Is a given variable an arguments object?
  _.isArguments = function(obj) {
    return toString.call(obj) == '[object Arguments]';
  };
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return !!(obj && _.has(obj, 'callee'));
    };
  }

  // Is a given value a function?
  _.isFunction = function(obj) {
    return toString.call(obj) == '[object Function]';
  };

  // Is a given value a string?
  _.isString = function(obj) {
    return toString.call(obj) == '[object String]';
  };

  // Is a given value a number?
  _.isNumber = function(obj) {
    return toString.call(obj) == '[object Number]';
  };

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return _.isNumber(obj) && isFinite(obj);
  };

  // Is the given value `NaN`?
  _.isNaN = function(obj) {
    // `NaN` is the only value for which `===` is not reflexive.
    return obj !== obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
  };

  // Is a given value a date?
  _.isDate = function(obj) {
    return toString.call(obj) == '[object Date]';
  };

  // Is the given value a regular expression?
  _.isRegExp = function(obj) {
    return toString.call(obj) == '[object RegExp]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Has own property?
  _.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  // Run a function **n** times.
  _.times = function (n, iterator, context) {
    for (var i = 0; i < n; i++) iterator.call(context, i);
  };

  // Escape a string for HTML interpolation.
  _.escape = function(string) {
    return (''+string).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;');
  };

  // If the value of the named property is a function then invoke it;
  // otherwise, return it.
  _.result = function(object, property) {
    if (object == null) return null;
    var value = object[property];
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Add your own custom functions to the Underscore object, ensuring that
  // they're correctly added to the OOP wrapper as well.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name){
      addToWrapper(name, _[name] = obj[name]);
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = idCounter++;
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /.^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    '\\': '\\',
    "'": "'",
    'r': '\r',
    'n': '\n',
    't': '\t',
    'u2028': '\u2028',
    'u2029': '\u2029'
  };

  for (var p in escapes) escapes[escapes[p]] = p;
  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;
  var unescaper = /\\(\\|'|r|n|t|u2028|u2029)/g;

  // Within an interpolation, evaluation, or escaping, remove HTML escaping
  // that had been previously added.
  var unescape = function(code) {
    return code.replace(unescaper, function(match, escape) {
      return escapes[escape];
    });
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(text, data, settings) {
    settings = _.defaults(settings || {}, _.templateSettings);

    // Compile the template source, taking care to escape characters that
    // cannot be included in a string literal and then unescape them in code
    // blocks.
    var source = "__p+='" + text
      .replace(escaper, function(match) {
        return '\\' + escapes[match];
      })
      .replace(settings.escape || noMatch, function(match, code) {
        return "'+\n_.escape(" + unescape(code) + ")+\n'";
      })
      .replace(settings.interpolate || noMatch, function(match, code) {
        return "'+\n(" + unescape(code) + ")+\n'";
      })
      .replace(settings.evaluate || noMatch, function(match, code) {
        return "';\n" + unescape(code) + "\n;__p+='";
      }) + "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __p='';" +
      "var print=function(){__p+=Array.prototype.join.call(arguments, '')};\n" +
      source + "return __p;\n";

    var render = new Function(settings.variable || 'obj', '_', source);
    if (data) return render(data, _);
    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled function source as a convenience for build time
    // precompilation.
    template.source = 'function(' + (settings.variable || 'obj') + '){\n' +
      source + '}';

    return template;
  };

  // Add a "chain" function, which will delegate to the wrapper.
  _.chain = function(obj) {
    return _(obj).chain();
  };

  // The OOP Wrapper
  // ---------------

  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.
  var wrapper = function(obj) { this._wrapped = obj; };

  // Expose `wrapper.prototype` as `_.prototype`
  _.prototype = wrapper.prototype;

  // Helper function to continue chaining intermediate results.
  var result = function(obj, chain) {
    return chain ? _(obj).chain() : obj;
  };

  // A method to easily add functions to the OOP wrapper.
  var addToWrapper = function(name, func) {
    wrapper.prototype[name] = function() {
      var args = slice.call(arguments);
      unshift.call(args, this._wrapped);
      return result(func.apply(_, args), this._chain);
    };
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    wrapper.prototype[name] = function() {
      var wrapped = this._wrapped;
      method.apply(wrapped, arguments);
      var length = wrapped.length;
      if ((name == 'shift' || name == 'splice') && length === 0) delete wrapped[0];
      return result(wrapped, this._chain);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    wrapper.prototype[name] = function() {
      return result(method.apply(this._wrapped, arguments), this._chain);
    };
  });

  // Start chaining a wrapped Underscore object.
  wrapper.prototype.chain = function() {
    this._chain = true;
    return this;
  };

  // Extracts the result from a wrapped and chained object.
  wrapper.prototype.value = function() {
    return this._wrapped;
  };

}).call(this);

},{}],"/Users/Jacob/workspace/scheduler/front-end/node_modules/cldr/node_modules/unicoderegexp/lib/unicodeRegExp.js":[function(require,module,exports){
(function (root, factory) {
    // expose unicodeRegExp as
    // - an AMD module (require)
    // - a node module

    if (typeof exports === 'object') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define(factory);
    } else {
        root.unicodeRegExp = factory();
    }
}(this, function (xregexp) {
    var unicodeRegExp = {};

    // These are taken from the XRegExp library (see ../extractRegExpsFromXRegExp.js):
    unicodeRegExp.letter = /[A-Za-zªµºÀ-ÖØ-öø-ˁˆ-ˑˠ-ˤˬˮͰ-ʹͶͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁҊ-ԧԱ-Ֆՙա-ևא-תװ-ײؠ-يٮٯٱ-ۓەۥۦۮۯۺ-ۼۿܐܒ-ܯݍ-ޥޱߊ-ߪߴߵߺࠀ-ࠕࠚࠤࠨࡀ-ࡘࢠࢢ-ࢬऄ-हऽॐक़-ॡॱ-ॷॹ-ॿঅ-ঌএঐও-নপ-রলশ-হঽৎড়ঢ়য়-ৡৰৱਅ-ਊਏਐਓ-ਨਪ-ਰਲਲ਼ਵਸ਼ਸਹਖ਼-ੜਫ਼ੲ-ੴઅ-ઍએ-ઑઓ-નપ-રલળવ-હઽૐૠૡଅ-ଌଏଐଓ-ନପ-ରଲଳଵ-ହଽଡ଼ଢ଼ୟ-ୡୱஃஅ-ஊஎ-ஐஒ-கஙசஜஞடணதந-பம-ஹௐఅ-ఌఎ-ఐఒ-నప-ళవ-హఽౘౙౠౡಅ-ಌಎ-ಐಒ-ನಪ-ಳವ-ಹಽೞೠೡೱೲഅ-ഌഎ-ഐഒ-ഺഽൎൠൡൺ-ൿඅ-ඖක-නඳ-රලව-ෆก-ะาำเ-ๆກຂຄງຈຊຍດ-ທນ-ຟມ-ຣລວສຫອ-ະາຳຽເ-ໄໆໜ-ໟༀཀ-ཇཉ-ཬྈ-ྌက-ဪဿၐ-ၕၚ-ၝၡၥၦၮ-ၰၵ-ႁႎႠ-ჅჇჍა-ჺჼ-ቈቊ-ቍቐ-ቖቘቚ-ቝበ-ኈኊ-ኍነ-ኰኲ-ኵኸ-ኾዀዂ-ዅወ-ዖዘ-ጐጒ-ጕጘ-ፚᎀ-ᎏᎠ-Ᏼᐁ-ᙬᙯ-ᙿᚁ-ᚚᚠ-ᛪᜀ-ᜌᜎ-ᜑᜠ-ᜱᝀ-ᝑᝠ-ᝬᝮ-ᝰក-ឳៗៜᠠ-ᡷᢀ-ᢨᢪᢰ-ᣵᤀ-ᤜᥐ-ᥭᥰ-ᥴᦀ-ᦫᧁ-ᧇᨀ-ᨖᨠ-ᩔᪧᬅ-ᬳᭅ-ᭋᮃ-ᮠᮮᮯᮺ-ᯥᰀ-ᰣᱍ-ᱏᱚ-ᱽᳩ-ᳬᳮ-ᳱᳵᳶᴀ-ᶿḀ-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼⁱⁿₐ-ₜℂℇℊ-ℓℕℙ-ℝℤΩℨK-ℭℯ-ℹℼ-ℿⅅ-ⅉⅎↃↄⰀ-Ⱞⰰ-ⱞⱠ-ⳤⳫ-ⳮⳲⳳⴀ-ⴥⴧⴭⴰ-ⵧⵯⶀ-ⶖⶠ-ⶦⶨ-ⶮⶰ-ⶶⶸ-ⶾⷀ-ⷆⷈ-ⷎⷐ-ⷖⷘ-ⷞⸯ々〆〱-〵〻〼ぁ-ゖゝ-ゟァ-ヺー-ヿㄅ-ㄭㄱ-ㆎㆠ-ㆺㇰ-ㇿ㐀-䶵一-鿌ꀀ-ꒌꓐ-ꓽꔀ-ꘌꘐ-ꘟꘪꘫꙀ-ꙮꙿ-ꚗꚠ-ꛥꜗ-ꜟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꠁꠃ-ꠅꠇ-ꠊꠌ-ꠢꡀ-ꡳꢂ-ꢳꣲ-ꣷꣻꤊ-ꤥꤰ-ꥆꥠ-ꥼꦄ-ꦲꧏꨀ-ꨨꩀ-ꩂꩄ-ꩋꩠ-ꩶꩺꪀ-ꪯꪱꪵꪶꪹ-ꪽꫀꫂꫛ-ꫝꫠ-ꫪꫲ-ꫴꬁ-ꬆꬉ-ꬎꬑ-ꬖꬠ-ꬦꬨ-ꬮꯀ-ꯢ가-힣ힰ-ퟆퟋ-ퟻ豈-舘並-龎ﬀ-ﬆﬓ-ﬗיִײַ-ﬨשׁ-זּטּ-לּמּנּסּףּפּצּ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼＡ-Ｚａ-ｚｦ-ﾾￂ-ￇￊ-ￏￒ-ￗￚ-ￜ]/;
    unicodeRegExp.mark = /[\u0300-\u036F\u0483-\u0489\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED\u0711\u0730-\u074A\u07A6-\u07B0\u07EB-\u07F3\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0859-\u085B\u08E4-\u08FE\u0900-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962\u0963\u0981-\u0983\u09BC\u09BE-\u09C4\u09C7\u09C8\u09CB-\u09CD\u09D7\u09E2\u09E3\u0A01-\u0A03\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A70\u0A71\u0A75\u0A81-\u0A83\u0ABC\u0ABE-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AE2\u0AE3\u0B01-\u0B03\u0B3C\u0B3E-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B62\u0B63\u0B82\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD7\u0C01-\u0C03\u0C3E-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C62\u0C63\u0C82\u0C83\u0CBC\u0CBE-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CE2\u0CE3\u0D02\u0D03\u0D3E-\u0D44\u0D46-\u0D48\u0D4A-\u0D4D\u0D57\u0D62\u0D63\u0D82\u0D83\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DF2\u0DF3\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0EB1\u0EB4-\u0EB9\u0EBB\u0EBC\u0EC8-\u0ECD\u0F18\u0F19\u0F35\u0F37\u0F39\u0F3E\u0F3F\u0F71-\u0F84\u0F86\u0F87\u0F8D-\u0F97\u0F99-\u0FBC\u0FC6\u102B-\u103E\u1056-\u1059\u105E-\u1060\u1062-\u1064\u1067-\u106D\u1071-\u1074\u1082-\u108D\u108F\u109A-\u109D\u135D-\u135F\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17B4-\u17D3\u17DD\u180B-\u180D\u18A9\u1920-\u192B\u1930-\u193B\u19B0-\u19C0\u19C8\u19C9\u1A17-\u1A1B\u1A55-\u1A5E\u1A60-\u1A7C\u1A7F\u1B00-\u1B04\u1B34-\u1B44\u1B6B-\u1B73\u1B80-\u1B82\u1BA1-\u1BAD\u1BE6-\u1BF3\u1C24-\u1C37\u1CD0-\u1CD2\u1CD4-\u1CE8\u1CED\u1CF2-\u1CF4\u1DC0-\u1DE6\u1DFC-\u1DFF\u20D0-\u20F0\u2CEF-\u2CF1\u2D7F\u2DE0-\u2DFF\u302A-\u302F\u3099\u309A\uA66F-\uA672\uA674-\uA67D\uA69F\uA6F0\uA6F1\uA802\uA806\uA80B\uA823-\uA827\uA880\uA881\uA8B4-\uA8C4\uA8E0-\uA8F1\uA926-\uA92D\uA947-\uA953\uA980-\uA983\uA9B3-\uA9C0\uAA29-\uAA36\uAA43\uAA4C\uAA4D\uAA7B\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAEB-\uAAEF\uAAF5\uAAF6\uABE3-\uABEA\uABEC\uABED\uFB1E\uFE00-\uFE0F\uFE20-\uFE26]/;
    unicodeRegExp.number = /[0-9²³¹¼-¾٠-٩۰-۹߀-߉०-९০-৯৴-৹੦-੯૦-૯୦-୯୲-୷௦-௲౦-౯౸-౾೦-೯൦-൵๐-๙໐-໙༠-༳၀-၉႐-႙፩-፼ᛮ-ᛰ០-៩៰-៹᠐-᠙᥆-᥏᧐-᧚᪀-᪉᪐-᪙᭐-᭙᮰-᮹᱀-᱉᱐-᱙⁰⁴-⁹₀-₉⅐-ↂↅ-↉①-⒛⓪-⓿❶-➓⳽〇〡-〩〸-〺㆒-㆕㈠-㈩㉈-㉏㉑-㉟㊀-㊉㊱-㊿꘠-꘩ꛦ-ꛯ꠰-꠵꣐-꣙꤀-꤉꧐-꧙꩐-꩙꯰-꯹０-９]/;
    unicodeRegExp.punctuation = /[\u0021-\u0023\u0025-\u002A\u002C-\u002F\u003A\u003B\u003F\u0040\u005B-\u005D\u005F\u007B\u007D\u00A1\u00A7\u00AB\u00B6\u00B7\u00BB\u00BF\u037E\u0387\u055A-\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061E\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u0AF0\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u1400\u166D\u166E\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B5A-\u1B60\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2010-\u2027\u2030-\u2043\u2045-\u2051\u2053-\u205E\u207D\u207E\u208D\u208E\u2329\u232A\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00-\u2E2E\u2E30-\u2E3B\u3001-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65]/;
    unicodeRegExp.symbol = /[\u0024+<->\u005E`\u007C~¢-¦¨©¬®-±´¸×÷˂-˅˒-˟˥-˫˭˯-˿͵΄΅϶҂֏؆-؈؋؎؏۞۩۽۾߶৲৳৺৻૱୰௳-௺౿൹฿༁-༃༓༕-༗༚-༟༴༶༸྾-࿅࿇-࿌࿎࿏࿕-࿘႞႟᎐-᎙៛᥀᧞-᧿᭡-᭪᭴-᭼᾽᾿-῁῍-῏῝-῟῭-`´῾⁄⁒⁺-⁼₊-₌₠-₹℀℁℃-℆℈℉℔№-℘℞-℣℥℧℩℮℺℻⅀-⅄⅊-⅍⅏←-⌨⌫-⏳␀-␦⑀-⑊⒜-ⓩ─-⛿✁-❧➔-⟄⟇-⟥⟰-⦂⦙-⧗⧜-⧻⧾-⭌⭐-⭙⳥-⳪⺀-⺙⺛-⻳⼀-⿕⿰-⿻〄〒〓〠〶〷〾〿゛゜㆐㆑㆖-㆟㇀-㇣㈀-㈞㈪-㉇㉐㉠-㉿㊊-㊰㋀-㋾㌀-㏿䷀-䷿꒐-꓆꜀-꜖꜠꜡꞉꞊꠨-꠫꠶-꠹꩷-꩹﬩﮲-﯁﷼﷽﹢﹤-﹦﹩＄＋＜-＞＾｀｜～￠-￦￨-￮￼�]/;
    unicodeRegExp.separator = /[\u0020\u00A0\u1680\u180E\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]/;
    unicodeRegExp.other = /[\u0000-\u001F\u007F-\u009F\u00AD\u0378\u0379\u037F-\u0383\u038B\u038D\u03A2\u0528-\u0530\u0557\u0558\u0560\u0588\u058B-\u058E\u0590\u05C8-\u05CF\u05EB-\u05EF\u05F5-\u0605\u061C\u061D\u06DD\u070E\u070F\u074B\u074C\u07B2-\u07BF\u07FB-\u07FF\u082E\u082F\u083F\u085C\u085D\u085F-\u089F\u08A1\u08AD-\u08E3\u08FF\u0978\u0980\u0984\u098D\u098E\u0991\u0992\u09A9\u09B1\u09B3-\u09B5\u09BA\u09BB\u09C5\u09C6\u09C9\u09CA\u09CF-\u09D6\u09D8-\u09DB\u09DE\u09E4\u09E5\u09FC-\u0A00\u0A04\u0A0B-\u0A0E\u0A11\u0A12\u0A29\u0A31\u0A34\u0A37\u0A3A\u0A3B\u0A3D\u0A43-\u0A46\u0A49\u0A4A\u0A4E-\u0A50\u0A52-\u0A58\u0A5D\u0A5F-\u0A65\u0A76-\u0A80\u0A84\u0A8E\u0A92\u0AA9\u0AB1\u0AB4\u0ABA\u0ABB\u0AC6\u0ACA\u0ACE\u0ACF\u0AD1-\u0ADF\u0AE4\u0AE5\u0AF2-\u0B00\u0B04\u0B0D\u0B0E\u0B11\u0B12\u0B29\u0B31\u0B34\u0B3A\u0B3B\u0B45\u0B46\u0B49\u0B4A\u0B4E-\u0B55\u0B58-\u0B5B\u0B5E\u0B64\u0B65\u0B78-\u0B81\u0B84\u0B8B-\u0B8D\u0B91\u0B96-\u0B98\u0B9B\u0B9D\u0BA0-\u0BA2\u0BA5-\u0BA7\u0BAB-\u0BAD\u0BBA-\u0BBD\u0BC3-\u0BC5\u0BC9\u0BCE\u0BCF\u0BD1-\u0BD6\u0BD8-\u0BE5\u0BFB-\u0C00\u0C04\u0C0D\u0C11\u0C29\u0C34\u0C3A-\u0C3C\u0C45\u0C49\u0C4E-\u0C54\u0C57\u0C5A-\u0C5F\u0C64\u0C65\u0C70-\u0C77\u0C80\u0C81\u0C84\u0C8D\u0C91\u0CA9\u0CB4\u0CBA\u0CBB\u0CC5\u0CC9\u0CCE-\u0CD4\u0CD7-\u0CDD\u0CDF\u0CE4\u0CE5\u0CF0\u0CF3-\u0D01\u0D04\u0D0D\u0D11\u0D3B\u0D3C\u0D45\u0D49\u0D4F-\u0D56\u0D58-\u0D5F\u0D64\u0D65\u0D76-\u0D78\u0D80\u0D81\u0D84\u0D97-\u0D99\u0DB2\u0DBC\u0DBE\u0DBF\u0DC7-\u0DC9\u0DCB-\u0DCE\u0DD5\u0DD7\u0DE0-\u0DF1\u0DF5-\u0E00\u0E3B-\u0E3E\u0E5C-\u0E80\u0E83\u0E85\u0E86\u0E89\u0E8B\u0E8C\u0E8E-\u0E93\u0E98\u0EA0\u0EA4\u0EA6\u0EA8\u0EA9\u0EAC\u0EBA\u0EBE\u0EBF\u0EC5\u0EC7\u0ECE\u0ECF\u0EDA\u0EDB\u0EE0-\u0EFF\u0F48\u0F6D-\u0F70\u0F98\u0FBD\u0FCD\u0FDB-\u0FFF\u10C6\u10C8-\u10CC\u10CE\u10CF\u1249\u124E\u124F\u1257\u1259\u125E\u125F\u1289\u128E\u128F\u12B1\u12B6\u12B7\u12BF\u12C1\u12C6\u12C7\u12D7\u1311\u1316\u1317\u135B\u135C\u137D-\u137F\u139A-\u139F\u13F5-\u13FF\u169D-\u169F\u16F1-\u16FF\u170D\u1715-\u171F\u1737-\u173F\u1754-\u175F\u176D\u1771\u1774-\u177F\u17DE\u17DF\u17EA-\u17EF\u17FA-\u17FF\u180F\u181A-\u181F\u1878-\u187F\u18AB-\u18AF\u18F6-\u18FF\u191D-\u191F\u192C-\u192F\u193C-\u193F\u1941-\u1943\u196E\u196F\u1975-\u197F\u19AC-\u19AF\u19CA-\u19CF\u19DB-\u19DD\u1A1C\u1A1D\u1A5F\u1A7D\u1A7E\u1A8A-\u1A8F\u1A9A-\u1A9F\u1AAE-\u1AFF\u1B4C-\u1B4F\u1B7D-\u1B7F\u1BF4-\u1BFB\u1C38-\u1C3A\u1C4A-\u1C4C\u1C80-\u1CBF\u1CC8-\u1CCF\u1CF7-\u1CFF\u1DE7-\u1DFB\u1F16\u1F17\u1F1E\u1F1F\u1F46\u1F47\u1F4E\u1F4F\u1F58\u1F5A\u1F5C\u1F5E\u1F7E\u1F7F\u1FB5\u1FC5\u1FD4\u1FD5\u1FDC\u1FF0\u1FF1\u1FF5\u1FFF\u200B-\u200F\u202A-\u202E\u2060-\u206F\u2072\u2073\u208F\u209D-\u209F\u20BA-\u20CF\u20F1-\u20FF\u218A-\u218F\u23F4-\u23FF\u2427-\u243F\u244B-\u245F\u2700\u2B4D-\u2B4F\u2B5A-\u2BFF\u2C2F\u2C5F\u2CF4-\u2CF8\u2D26\u2D28-\u2D2C\u2D2E\u2D2F\u2D68-\u2D6E\u2D71-\u2D7E\u2D97-\u2D9F\u2DA7\u2DAF\u2DB7\u2DBF\u2DC7\u2DCF\u2DD7\u2DDF\u2E3C-\u2E7F\u2E9A\u2EF4-\u2EFF\u2FD6-\u2FEF\u2FFC-\u2FFF\u3040\u3097\u3098\u3100-\u3104\u312E-\u3130\u318F\u31BB-\u31BF\u31E4-\u31EF\u321F\u32FF\u4DB6-\u4DBF\u9FCD-\u9FFF\uA48D-\uA48F\uA4C7-\uA4CF\uA62C-\uA63F\uA698-\uA69E\uA6F8-\uA6FF\uA78F\uA794-\uA79F\uA7AB-\uA7F7\uA82C-\uA82F\uA83A-\uA83F\uA878-\uA87F\uA8C5-\uA8CD\uA8DA-\uA8DF\uA8FC-\uA8FF\uA954-\uA95E\uA97D-\uA97F\uA9CE\uA9DA-\uA9DD\uA9E0-\uA9FF\uAA37-\uAA3F\uAA4E\uAA4F\uAA5A\uAA5B\uAA7C-\uAA7F\uAAC3-\uAADA\uAAF7-\uAB00\uAB07\uAB08\uAB0F\uAB10\uAB17-\uAB1F\uAB27\uAB2F-\uABBF\uABEE\uABEF\uABFA-\uABFF\uD7A4-\uD7AF\uD7C7-\uD7CA\uD7FC-\uF8FF\uFA6E\uFA6F\uFADA-\uFAFF\uFB07-\uFB12\uFB18-\uFB1C\uFB37\uFB3D\uFB3F\uFB42\uFB45\uFBC2-\uFBD2\uFD40-\uFD4F\uFD90\uFD91\uFDC8-\uFDEF\uFDFE\uFDFF\uFE1A-\uFE1F\uFE27-\uFE2F\uFE53\uFE67\uFE6C-\uFE6F\uFE75\uFEFD-\uFF00\uFFBF-\uFFC1\uFFC8\uFFC9\uFFD0\uFFD1\uFFD8\uFFD9\uFFDD-\uFFDF\uFFE7\uFFEF-\uFFFB\uFFFE\uFFFF]/; // Other (control, format, private use, surrogate, and unassigned codes)

    var unicodePackageNamesMapping = {
        L: unicodeRegExp.letter,
        M: unicodeRegExp.mark,
        N: unicodeRegExp.number,
        P: unicodeRegExp.punctuation,
        S: unicodeRegExp.symbol,
        Z: unicodeRegExp.separator,
        C: unicodeRegExp.other,
        letter: unicodeRegExp.letter,
        mark: unicodeRegExp.mark,
        number: unicodeRegExp.number,
        digit: unicodeRegExp.number,
        punctuation: unicodeRegExp.punctuation,
        symbol: unicodeRegExp.symbol,
        separator: unicodeRegExp.separator,
        other: unicodeRegExp.other
    };

    unicodeRegExp.unicodePackageNameRegExp = new RegExp('^\\[\\:(\\^)?(' + Object.keys(unicodePackageNamesMapping).join('|') + ')\\:\\]$');

    unicodeRegExp.expandCldrUnicodeSetIdToCharacterClass = function (unicodeSetId) {
        return new RegExp(unicodeSetId.replace(unicodeRegExp.unicodePackageNameRegExp, function ($0, negated, packageName) {
            var characters = unicodePackageNamesMapping[packageName].source.replace(/^\[|\]$/g, '');
            return '[' + (negated ? '^' + characters : characters) + ']';
        }));
    };

    unicodeRegExp.spliceCharacterClassRegExps = function () { // ...
        var args = Array.prototype.slice.call(arguments);

        return new RegExp('[' + args.map(function (regExp) {
            return regExp.source.replace(/^\[|\]$/g, '');
        }).join("") + ']');
    };

    // All of the above combined, except 'separator', and 'other':
    unicodeRegExp.visible = unicodeRegExp.spliceCharacterClassRegExps(
        unicodeRegExp.letter,
        unicodeRegExp.mark,
        unicodeRegExp.number,
        unicodeRegExp.punctuation,
        unicodeRegExp.symbol
    );

    // The set of printable characters also includes space:
    unicodeRegExp.printable = unicodeRegExp.spliceCharacterClassRegExps(
        unicodeRegExp.visible,
        unicodeRegExp.separator
    );

    // Helper function for removing a char from a character class regular expression:

    function parseCharCode(u4, x2, literal) {
        if (u4 || x2) {
            return parseInt(u4 || x2, 16);
        } else {
            return literal.charCodeAt(0);
        }
    }

    function charCodeToRegExpToken(charCode) {
        if (charCode >= 0x20 && charCode < 0x7f) {
            return String.fromCharCode(charCode);
        } else {
            var hexStr = charCode.toString(16);
            return "\\u" + "0000".slice(hexStr.length) + hexStr;
        }
    }

    var characterClassToken = /(?:\\u([0-9a-f]{4})|\\x([0-9a-f]{2})|([^\-]))(?:-(?:\\u([0-9a-f]{4})|\\x([0-9a-f]{2})|([^\-])))?/gi;

    unicodeRegExp.removeCharacterFromCharacterClassRegExp = function (regExp, ch) {
        var charCode = ch.charCodeAt(0);

        return new RegExp('[' + regExp.source.replace(/^\[|\]$/g, '').replace(characterClassToken, function ($0, fromU4, fromX2, fromLiteral, toU4, toX2, toLiteral) {
            var fromCharCode = parseCharCode(fromU4, fromX2, fromLiteral);
            if (toU4 || toX2 || toLiteral) {
                var toCharCode = parseCharCode(toU4, toX2, toLiteral);
                if (charCode === fromCharCode) {
                    if (charCode + 1 < toCharCode) {
                        return charCodeToRegExpToken(charCode + 1) + '-' + charCodeToRegExpToken(toCharCode);
                    } else {
                        return charCodeToRegExpToken(toCharCode);
                    }
                } else if (charCode === toCharCode) {
                    if (fromCharCode < charCode - 1) {
                        return charCodeToRegExpToken(fromCharCode) + '-' + charCodeToRegExpToken(charCode - 1);
                    } else {
                        // fromCharCode === toCharCode - 1, rewrite to single char
                        return charCodeToRegExpToken(fromCharCode);
                    }
                } else if (charCode > fromCharCode && charCode < toCharCode) {
                    return charCodeToRegExpToken(fromCharCode) + (charCode > fromCharCode + 1 ? '-' + charCodeToRegExpToken(charCode - 1) : '') +
                        (charCode + 1 < toCharCode ? charCodeToRegExpToken(charCode + 1) + '-' : '') + charCodeToRegExpToken(toCharCode);
                } else {
                    return $0;
                }
            } else {
                if (charCode === fromCharCode) {
                    return "";
                } else {
                    return charCodeToRegExpToken(fromCharCode);
                }
            }
        }) + ']');
    };

    return unicodeRegExp;
}));

},{}],"/Users/Jacob/workspace/scheduler/front-end/node_modules/cldr/node_modules/xmldom/dom-parser.js":[function(require,module,exports){
function DOMParser(options){
	this.options = options ||{locator:{}};
	
}
DOMParser.prototype.parseFromString = function(source,mimeType){	
	var options = this.options;
	var sax =  new XMLReader();
	var domBuilder = options.domBuilder || new DOMHandler();//contentHandler and LexicalHandler
	var errorHandler = options.errorHandler;
	var locator = options.locator;
	var defaultNSMap = options.xmlns||{};
	var entityMap = {'lt':'<','gt':'>','amp':'&','quot':'"','apos':"'"}
	if(locator){
		domBuilder.setDocumentLocator(locator)
	}
	
	sax.errorHandler = buildErrorHandler(errorHandler,domBuilder,locator);
	sax.domBuilder = options.domBuilder || domBuilder;
	if(/\/x?html?$/.test(mimeType)){
		entityMap.nbsp = '\xa0';
		entityMap.copy = '\xa9';
		defaultNSMap['']= 'http://www.w3.org/1999/xhtml';
	}
	if(source){
		sax.parse(source,defaultNSMap,entityMap);
	}else{
		sax.errorHandler.error("invalid document source");
	}
	return domBuilder.document;
}
function buildErrorHandler(errorImpl,domBuilder,locator){
	if(!errorImpl){
		if(domBuilder instanceof DOMHandler){
			return domBuilder;
		}
		errorImpl = domBuilder ;
	}
	var errorHandler = {}
	var isCallback = errorImpl instanceof Function;
	locator = locator||{}
	function build(key){
		var fn = errorImpl[key];
		if(!fn){
			if(isCallback){
				fn = errorImpl.length == 2?function(msg){errorImpl(key,msg)}:errorImpl;
			}else{
				var i=arguments.length;
				while(--i){
					if(fn = errorImpl[arguments[i]]){
						break;
					}
				}
			}
		}
		errorHandler[key] = fn && function(msg){
			fn(msg+_locator(locator));
		}||function(){};
	}
	build('warning','warn');
	build('error','warn','warning');
	build('fatalError','warn','warning','error');
	return errorHandler;
}
/**
 * +ContentHandler+ErrorHandler
 * +LexicalHandler+EntityResolver2
 * -DeclHandler-DTDHandler 
 * 
 * DefaultHandler:EntityResolver, DTDHandler, ContentHandler, ErrorHandler
 * DefaultHandler2:DefaultHandler,LexicalHandler, DeclHandler, EntityResolver2
 * @link http://www.saxproject.org/apidoc/org/xml/sax/helpers/DefaultHandler.html
 */
function DOMHandler() {
    this.cdata = false;
}
function position(locator,node){
	node.lineNumber = locator.lineNumber;
	node.columnNumber = locator.columnNumber;
}
/**
 * @see org.xml.sax.ContentHandler#startDocument
 * @link http://www.saxproject.org/apidoc/org/xml/sax/ContentHandler.html
 */ 
DOMHandler.prototype = {
	startDocument : function() {
    	this.document = new DOMImplementation().createDocument(null, null, null);
    	if (this.locator) {
        	this.document.documentURI = this.locator.systemId;
    	}
	},
	startElement:function(namespaceURI, localName, qName, attrs) {
		var doc = this.document;
	    var el = doc.createElementNS(namespaceURI, qName||localName);
	    var len = attrs.length;
	    appendElement(this, el);
	    this.currentElement = el;
	    
		this.locator && position(this.locator,el)
	    for (var i = 0 ; i < len; i++) {
	        var namespaceURI = attrs.getURI(i);
	        var value = attrs.getValue(i);
	        var qName = attrs.getQName(i);
			var attr = doc.createAttributeNS(namespaceURI, qName);
			if( attr.getOffset){
				position(attr.getOffset(1),attr)
			}
			attr.value = attr.nodeValue = value;
			el.setAttributeNode(attr)
	    }
	},
	endElement:function(namespaceURI, localName, qName) {
		var current = this.currentElement
	    var tagName = current.tagName;
	    this.currentElement = current.parentNode;
	},
	startPrefixMapping:function(prefix, uri) {
	},
	endPrefixMapping:function(prefix) {
	},
	processingInstruction:function(target, data) {
	    var ins = this.document.createProcessingInstruction(target, data);
	    this.locator && position(this.locator,ins)
	    appendElement(this, ins);
	},
	ignorableWhitespace:function(ch, start, length) {
	},
	characters:function(chars, start, length) {
		chars = _toString.apply(this,arguments)
		//console.log(chars)
		if(this.currentElement && chars){
			if (this.cdata) {
				var charNode = this.document.createCDATASection(chars);
				this.currentElement.appendChild(charNode);
			} else {
				var charNode = this.document.createTextNode(chars);
				this.currentElement.appendChild(charNode);
			}
			this.locator && position(this.locator,charNode)
		}
	},
	skippedEntity:function(name) {
	},
	endDocument:function() {
		this.document.normalize();
	},
	setDocumentLocator:function (locator) {
	    if(this.locator = locator){// && !('lineNumber' in locator)){
	    	locator.lineNumber = 0;
	    }
	},
	//LexicalHandler
	comment:function(chars, start, length) {
		chars = _toString.apply(this,arguments)
	    var comm = this.document.createComment(chars);
	    this.locator && position(this.locator,comm)
	    appendElement(this, comm);
	},
	
	startCDATA:function() {
	    //used in characters() methods
	    this.cdata = true;
	},
	endCDATA:function() {
	    this.cdata = false;
	},
	
	startDTD:function(name, publicId, systemId) {
		var impl = this.document.implementation;
	    if (impl && impl.createDocumentType) {
	        var dt = impl.createDocumentType(name, publicId, systemId);
	        this.locator && position(this.locator,dt)
	        appendElement(this, dt);
	    }
	},
	/**
	 * @see org.xml.sax.ErrorHandler
	 * @link http://www.saxproject.org/apidoc/org/xml/sax/ErrorHandler.html
	 */
	warning:function(error) {
		console.warn(error,_locator(this.locator));
	},
	error:function(error) {
		console.error(error,_locator(this.locator));
	},
	fatalError:function(error) {
		console.error(error,_locator(this.locator));
	    throw error;
	}
}
function _locator(l){
	if(l){
		return '\n@'+(l.systemId ||'')+'#[line:'+l.lineNumber+',col:'+l.columnNumber+']'
	}
}
function _toString(chars,start,length){
	if(typeof chars == 'string'){
		return chars.substr(start,length)
	}else{//java sax connect width xmldom on rhino(what about: "? && !(chars instanceof String)")
		if(chars.length >= start+length || start){
			return new java.lang.String(chars,start,length)+'';
		}
		return chars;
	}
}

/*
 * @link http://www.saxproject.org/apidoc/org/xml/sax/ext/LexicalHandler.html
 * used method of org.xml.sax.ext.LexicalHandler:
 *  #comment(chars, start, length)
 *  #startCDATA()
 *  #endCDATA()
 *  #startDTD(name, publicId, systemId)
 *
 *
 * IGNORED method of org.xml.sax.ext.LexicalHandler:
 *  #endDTD()
 *  #startEntity(name)
 *  #endEntity(name)
 *
 *
 * @link http://www.saxproject.org/apidoc/org/xml/sax/ext/DeclHandler.html
 * IGNORED method of org.xml.sax.ext.DeclHandler
 * 	#attributeDecl(eName, aName, type, mode, value)
 *  #elementDecl(name, model)
 *  #externalEntityDecl(name, publicId, systemId)
 *  #internalEntityDecl(name, value)
 * @link http://www.saxproject.org/apidoc/org/xml/sax/ext/EntityResolver2.html
 * IGNORED method of org.xml.sax.EntityResolver2
 *  #resolveEntity(String name,String publicId,String baseURI,String systemId)
 *  #resolveEntity(publicId, systemId)
 *  #getExternalSubset(name, baseURI)
 * @link http://www.saxproject.org/apidoc/org/xml/sax/DTDHandler.html
 * IGNORED method of org.xml.sax.DTDHandler
 *  #notationDecl(name, publicId, systemId) {};
 *  #unparsedEntityDecl(name, publicId, systemId, notationName) {};
 */
"endDTD,startEntity,endEntity,attributeDecl,elementDecl,externalEntityDecl,internalEntityDecl,resolveEntity,getExternalSubset,notationDecl,unparsedEntityDecl".replace(/\w+/g,function(key){
	DOMHandler.prototype[key] = function(){return null}
})

/* Private static helpers treated below as private instance methods, so don't need to add these to the public API; we might use a Relator to also get rid of non-standard public properties */
function appendElement (hander,node) {
    if (!hander.currentElement) {
        hander.document.appendChild(node);
    } else {
        hander.currentElement.appendChild(node);
    }
}//appendChild and setAttributeNS are preformance key

if(typeof require == 'function'){
	var XMLReader = require('./sax').XMLReader;
	var DOMImplementation = exports.DOMImplementation = require('./dom').DOMImplementation;
	exports.XMLSerializer = require('./dom').XMLSerializer ;
	exports.DOMParser = DOMParser;
}

},{"./dom":"/Users/Jacob/workspace/scheduler/front-end/node_modules/cldr/node_modules/xmldom/dom.js","./sax":"/Users/Jacob/workspace/scheduler/front-end/node_modules/cldr/node_modules/xmldom/sax.js"}],"/Users/Jacob/workspace/scheduler/front-end/node_modules/cldr/node_modules/xmldom/dom.js":[function(require,module,exports){
/*
 * DOM Level 2
 * Object DOMException
 * @see http://www.w3.org/TR/REC-DOM-Level-1/ecma-script-language-binding.html
 * @see http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/ecma-script-binding.html
 */

function copy(src,dest){
	for(var p in src){
		dest[p] = src[p];
	}
}
/**
^\w+\.prototype\.([_\w]+)\s*=\s*((?:.*\{\s*?[\r\n][\s\S]*?^})|\S.*?(?=[;\r\n]));?
^\w+\.prototype\.([_\w]+)\s*=\s*(\S.*?(?=[;\r\n]));?
 */
function _extends(Class,Super){
	var pt = Class.prototype;
	if(Object.create){
		var ppt = Object.create(Super.prototype)
		pt.__proto__ = ppt;
	}
	if(!(pt instanceof Super)){
		function t(){};
		t.prototype = Super.prototype;
		t = new t();
		copy(pt,t);
		Class.prototype = pt = t;
	}
	if(pt.constructor != Class){
		if(typeof Class != 'function'){
			console.error("unknow Class:"+Class)
		}
		pt.constructor = Class
	}
}
var htmlns = 'http://www.w3.org/1999/xhtml' ;
// Node Types
var NodeType = {}
var ELEMENT_NODE                = NodeType.ELEMENT_NODE                = 1;
var ATTRIBUTE_NODE              = NodeType.ATTRIBUTE_NODE              = 2;
var TEXT_NODE                   = NodeType.TEXT_NODE                   = 3;
var CDATA_SECTION_NODE          = NodeType.CDATA_SECTION_NODE          = 4;
var ENTITY_REFERENCE_NODE       = NodeType.ENTITY_REFERENCE_NODE       = 5;
var ENTITY_NODE                 = NodeType.ENTITY_NODE                 = 6;
var PROCESSING_INSTRUCTION_NODE = NodeType.PROCESSING_INSTRUCTION_NODE = 7;
var COMMENT_NODE                = NodeType.COMMENT_NODE                = 8;
var DOCUMENT_NODE               = NodeType.DOCUMENT_NODE               = 9;
var DOCUMENT_TYPE_NODE          = NodeType.DOCUMENT_TYPE_NODE          = 10;
var DOCUMENT_FRAGMENT_NODE      = NodeType.DOCUMENT_FRAGMENT_NODE      = 11;
var NOTATION_NODE               = NodeType.NOTATION_NODE               = 12;

// ExceptionCode
var ExceptionCode = {}
var ExceptionMessage = {};
var INDEX_SIZE_ERR              = ExceptionCode.INDEX_SIZE_ERR              = ((ExceptionMessage[1]="Index size error"),1);
var DOMSTRING_SIZE_ERR          = ExceptionCode.DOMSTRING_SIZE_ERR          = ((ExceptionMessage[2]="DOMString size error"),2);
var HIERARCHY_REQUEST_ERR       = ExceptionCode.HIERARCHY_REQUEST_ERR       = ((ExceptionMessage[3]="Hierarchy request error"),3);
var WRONG_DOCUMENT_ERR          = ExceptionCode.WRONG_DOCUMENT_ERR          = ((ExceptionMessage[4]="Wrong document"),4);
var INVALID_CHARACTER_ERR       = ExceptionCode.INVALID_CHARACTER_ERR       = ((ExceptionMessage[5]="Invalid character"),5);
var NO_DATA_ALLOWED_ERR         = ExceptionCode.NO_DATA_ALLOWED_ERR         = ((ExceptionMessage[6]="No data allowed"),6);
var NO_MODIFICATION_ALLOWED_ERR = ExceptionCode.NO_MODIFICATION_ALLOWED_ERR = ((ExceptionMessage[7]="No modification allowed"),7);
var NOT_FOUND_ERR               = ExceptionCode.NOT_FOUND_ERR               = ((ExceptionMessage[8]="Not found"),8);
var NOT_SUPPORTED_ERR           = ExceptionCode.NOT_SUPPORTED_ERR           = ((ExceptionMessage[9]="Not supported"),9);
var INUSE_ATTRIBUTE_ERR         = ExceptionCode.INUSE_ATTRIBUTE_ERR         = ((ExceptionMessage[10]="Attribute in use"),10);
//level2
var INVALID_STATE_ERR        	= ExceptionCode.INVALID_STATE_ERR        	= ((ExceptionMessage[11]="Invalid state"),11);
var SYNTAX_ERR               	= ExceptionCode.SYNTAX_ERR               	= ((ExceptionMessage[12]="Syntax error"),12);
var INVALID_MODIFICATION_ERR 	= ExceptionCode.INVALID_MODIFICATION_ERR 	= ((ExceptionMessage[13]="Invalid modification"),13);
var NAMESPACE_ERR            	= ExceptionCode.NAMESPACE_ERR           	= ((ExceptionMessage[14]="Invalid namespace"),14);
var INVALID_ACCESS_ERR       	= ExceptionCode.INVALID_ACCESS_ERR      	= ((ExceptionMessage[15]="Invalid access"),15);


function DOMException(code, message) {
	if(message instanceof Error){
		var error = message;
	}else{
		error = this;
		Error.call(this, ExceptionMessage[code]);
		this.message = ExceptionMessage[code];
		if(Error.captureStackTrace) Error.captureStackTrace(this, DOMException);
	}
	error.code = code;
	if(message) this.message = this.message + ": " + message;
	return error;
};
DOMException.prototype = Error.prototype;
copy(ExceptionCode,DOMException)
/**
 * @see http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/core.html#ID-536297177
 * The NodeList interface provides the abstraction of an ordered collection of nodes, without defining or constraining how this collection is implemented. NodeList objects in the DOM are live.
 * The items in the NodeList are accessible via an integral index, starting from 0.
 */
function NodeList() {
};
NodeList.prototype = {
	/**
	 * The number of nodes in the list. The range of valid child node indices is 0 to length-1 inclusive.
	 * @standard level1
	 */
	length:0, 
	/**
	 * Returns the indexth item in the collection. If index is greater than or equal to the number of nodes in the list, this returns null.
	 * @standard level1
	 * @param index  unsigned long 
	 *   Index into the collection.
	 * @return Node
	 * 	The node at the indexth position in the NodeList, or null if that is not a valid index. 
	 */
	item: function(index) {
		return this[index] || null;
	}
};
function LiveNodeList(node,refresh){
	this._node = node;
	this._refresh = refresh
	_updateLiveList(this);
}
function _updateLiveList(list){
	var inc = list._node._inc || list._node.ownerDocument._inc;
	if(list._inc != inc){
		var ls = list._refresh(list._node);
		//console.log(ls.length)
		__set__(list,'length',ls.length);
		copy(ls,list);
		list._inc = inc;
	}
}
LiveNodeList.prototype.item = function(i){
	_updateLiveList(this);
	return this[i];
}

_extends(LiveNodeList,NodeList);
/**
 * 
 * Objects implementing the NamedNodeMap interface are used to represent collections of nodes that can be accessed by name. Note that NamedNodeMap does not inherit from NodeList; NamedNodeMaps are not maintained in any particular order. Objects contained in an object implementing NamedNodeMap may also be accessed by an ordinal index, but this is simply to allow convenient enumeration of the contents of a NamedNodeMap, and does not imply that the DOM specifies an order to these Nodes.
 * NamedNodeMap objects in the DOM are live.
 * used for attributes or DocumentType entities 
 */
function NamedNodeMap() {
};

function _findNodeIndex(list,node){
	var i = list.length;
	while(i--){
		if(list[i] === node){return i}
	}
}

function _addNamedNode(el,list,newAttr,oldAttr){
	if(oldAttr){
		list[_findNodeIndex(list,oldAttr)] = newAttr;
	}else{
		list[list.length++] = newAttr;
	}
	if(el){
		newAttr.ownerElement = el;
		var doc = el.ownerDocument;
		if(doc){
			oldAttr && _onRemoveAttribute(doc,el,oldAttr);
			_onAddAttribute(doc,el,newAttr);
		}
	}
}
function _removeNamedNode(el,list,attr){
	var i = _findNodeIndex(list,attr);
	if(i>=0){
		var lastIndex = list.length-1
		while(i<lastIndex){
			list[i] = list[++i]
		}
		list.length = lastIndex;
		if(el){
			var doc = el.ownerDocument;
			if(doc){
				_onRemoveAttribute(doc,el,attr);
				attr.ownerElement = null;
			}
		}
	}else{
		throw DOMException(NOT_FOUND_ERR,new Error())
	}
}
NamedNodeMap.prototype = {
	length:0,
	item:NodeList.prototype.item,
	getNamedItem: function(key) {
//		if(key.indexOf(':')>0 || key == 'xmlns'){
//			return null;
//		}
		var i = this.length;
		while(i--){
			var attr = this[i];
			if(attr.nodeName == key){
				return attr;
			}
		}
	},
	setNamedItem: function(attr) {
		var el = attr.ownerElement;
		if(el && el!=this._ownerElement){
			throw new DOMException(INUSE_ATTRIBUTE_ERR);
		}
		var oldAttr = this.getNamedItem(attr.nodeName);
		_addNamedNode(this._ownerElement,this,attr,oldAttr);
		return oldAttr;
	},
	/* returns Node */
	setNamedItemNS: function(attr) {// raises: WRONG_DOCUMENT_ERR,NO_MODIFICATION_ALLOWED_ERR,INUSE_ATTRIBUTE_ERR
		var el = attr.ownerElement, oldAttr;
		if(el && el!=this._ownerElement){
			throw new DOMException(INUSE_ATTRIBUTE_ERR);
		}
		oldAttr = this.getNamedItemNS(attr.namespaceURI,attr.localName);
		_addNamedNode(this._ownerElement,this,attr,oldAttr);
		return oldAttr;
	},

	/* returns Node */
	removeNamedItem: function(key) {
		var attr = this.getNamedItem(key);
		_removeNamedNode(this._ownerElement,this,attr);
		return attr;
		
		
	},// raises: NOT_FOUND_ERR,NO_MODIFICATION_ALLOWED_ERR
	
	//for level2
	removeNamedItemNS:function(namespaceURI,localName){
		var attr = this.getNamedItemNS(namespaceURI,localName);
		_removeNamedNode(this._ownerElement,this,attr);
		return attr;
	},
	getNamedItemNS: function(namespaceURI, localName) {
		var i = this.length;
		while(i--){
			var node = this[i];
			if(node.localName == localName && node.namespaceURI == namespaceURI){
				return node;
			}
		}
		return null;
	}
};
/**
 * @see http://www.w3.org/TR/REC-DOM-Level-1/level-one-core.html#ID-102161490
 */
function DOMImplementation(/* Object */ features) {
	this._features = {};
	if (features) {
		for (var feature in features) {
			 this._features = features[feature];
		}
	}
};

DOMImplementation.prototype = {
	hasFeature: function(/* string */ feature, /* string */ version) {
		var versions = this._features[feature.toLowerCase()];
		if (versions && (!version || version in versions)) {
			return true;
		} else {
			return false;
		}
	},
	// Introduced in DOM Level 2:
	createDocument:function(namespaceURI,  qualifiedName, doctype){// raises:INVALID_CHARACTER_ERR,NAMESPACE_ERR,WRONG_DOCUMENT_ERR
		var doc = new Document();
		doc.doctype = doctype;
		if(doctype){
			doc.appendChild(doctype);
		}
		doc.implementation = this;
		doc.childNodes = new NodeList();
		if(qualifiedName){
			var root = doc.createElementNS(namespaceURI,qualifiedName);
			doc.appendChild(root);
		}
		return doc;
	},
	// Introduced in DOM Level 2:
	createDocumentType:function(qualifiedName, publicId, systemId){// raises:INVALID_CHARACTER_ERR,NAMESPACE_ERR
		var node = new DocumentType();
		node.name = qualifiedName;
		node.nodeName = qualifiedName;
		node.publicId = publicId;
		node.systemId = systemId;
		// Introduced in DOM Level 2:
		//readonly attribute DOMString        internalSubset;
		
		//TODO:..
		//  readonly attribute NamedNodeMap     entities;
		//  readonly attribute NamedNodeMap     notations;
		return node;
	}
};


/**
 * @see http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/core.html#ID-1950641247
 */

function Node() {
};

Node.prototype = {
	firstChild : null,
	lastChild : null,
	previousSibling : null,
	nextSibling : null,
	attributes : null,
	parentNode : null,
	childNodes : null,
	ownerDocument : null,
	nodeValue : null,
	namespaceURI : null,
	prefix : null,
	localName : null,
	// Modified in DOM Level 2:
	insertBefore:function(newChild, refChild){//raises 
		return _insertBefore(this,newChild,refChild);
	},
	replaceChild:function(newChild, oldChild){//raises 
		this.insertBefore(newChild,oldChild);
		if(oldChild){
			this.removeChild(oldChild);
		}
	},
	removeChild:function(oldChild){
		return _removeChild(this,oldChild);
	},
	appendChild:function(newChild){
		return this.insertBefore(newChild,null);
	},
	hasChildNodes:function(){
		return this.firstChild != null;
	},
	cloneNode:function(deep){
		return cloneNode(this.ownerDocument||this,this,deep);
	},
	// Modified in DOM Level 2:
	normalize:function(){
		var child = this.firstChild;
		while(child){
			var next = child.nextSibling;
			if(next && next.nodeType == TEXT_NODE && child.nodeType == TEXT_NODE){
				this.removeChild(next);
				child.appendData(next.data);
			}else{
				child.normalize();
				child = next;
			}
		}
	},
  	// Introduced in DOM Level 2:
	isSupported:function(feature, version){
		return this.ownerDocument.implementation.hasFeature(feature,version);
	},
    // Introduced in DOM Level 2:
    hasAttributes:function(){
    	return this.attributes.length>0;
    },
    lookupPrefix:function(namespaceURI){
    	var el = this;
    	while(el){
    		var map = el._nsMap;
    		//console.dir(map)
    		if(map){
    			for(var n in map){
    				if(map[n] == namespaceURI){
    					return n;
    				}
    			}
    		}
    		el = el.nodeType == 2?el.ownerDocument : el.parentNode;
    	}
    	return null;
    },
    // Introduced in DOM Level 3:
    lookupNamespaceURI:function(prefix){
    	var el = this;
    	while(el){
    		var map = el._nsMap;
    		//console.dir(map)
    		if(map){
    			if(prefix in map){
    				return map[prefix] ;
    			}
    		}
    		el = el.nodeType == 2?el.ownerDocument : el.parentNode;
    	}
    	return null;
    },
    // Introduced in DOM Level 3:
    isDefaultNamespace:function(namespaceURI){
    	var prefix = this.lookupPrefix(namespaceURI);
    	return prefix == null;
    }
};


function _xmlEncoder(c){
	return c == '<' && '&lt;' ||
         c == '>' && '&gt;' ||
         c == '&' && '&amp;' ||
         c == '"' && '&quot;' ||
         '&#'+c.charCodeAt()+';'
}


copy(NodeType,Node);
copy(NodeType,Node.prototype);

/**
 * @param callback return true for continue,false for break
 * @return boolean true: break visit;
 */
function _visitNode(node,callback){
	if(callback(node)){
		return true;
	}
	if(node = node.firstChild){
		do{
			if(_visitNode(node,callback)){return true}
        }while(node=node.nextSibling)
    }
}



function Document(){
}
function _onAddAttribute(doc,el,newAttr){
	doc && doc._inc++;
	var ns = newAttr.namespaceURI ;
	if(ns == 'http://www.w3.org/2000/xmlns/'){
		//update namespace
		el._nsMap[newAttr.prefix?newAttr.localName:''] = newAttr.value
	}
}
function _onRemoveAttribute(doc,el,newAttr,remove){
	doc && doc._inc++;
	var ns = newAttr.namespaceURI ;
	if(ns == 'http://www.w3.org/2000/xmlns/'){
		//update namespace
		delete el._nsMap[newAttr.prefix?newAttr.localName:'']
	}
}
function _onUpdateChild(doc,el,newChild){
	if(doc && doc._inc){
		doc._inc++;
		//update childNodes
		var cs = el.childNodes;
		if(newChild){
			cs[cs.length++] = newChild;
		}else{
			//console.log(1)
			var child = el.firstChild;
			var i = 0;
			while(child){
				cs[i++] = child;
				child =child.nextSibling;
			}
			cs.length = i;
		}
	}
}

/**
 * attributes;
 * children;
 * 
 * writeable properties:
 * nodeValue,Attr:value,CharacterData:data
 * prefix
 */
function _removeChild(parentNode,child){
	var previous = child.previousSibling;
	var next = child.nextSibling;
	if(previous){
		previous.nextSibling = next;
	}else{
		parentNode.firstChild = next
	}
	if(next){
		next.previousSibling = previous;
	}else{
		parentNode.lastChild = previous;
	}
	_onUpdateChild(parentNode.ownerDocument,parentNode);
	return child;
}
/**
 * preformance key(refChild == null)
 */
function _insertBefore(parentNode,newChild,nextChild){
	var cp = newChild.parentNode;
	if(cp){
		cp.removeChild(newChild);//remove and update
	}
	if(newChild.nodeType === DOCUMENT_FRAGMENT_NODE){
		var newFirst = newChild.firstChild;
		if (newFirst == null) {
			return newChild;
		}
		var newLast = newChild.lastChild;
	}else{
		newFirst = newLast = newChild;
	}
	var pre = nextChild ? nextChild.previousSibling : parentNode.lastChild;

	newFirst.previousSibling = pre;
	newLast.nextSibling = nextChild;
	
	
	if(pre){
		pre.nextSibling = newFirst;
	}else{
		parentNode.firstChild = newFirst;
	}
	if(nextChild == null){
		parentNode.lastChild = newLast;
	}else{
		nextChild.previousSibling = newLast;
	}
	do{
		newFirst.parentNode = parentNode;
	}while(newFirst !== newLast && (newFirst= newFirst.nextSibling))
	_onUpdateChild(parentNode.ownerDocument||parentNode,parentNode);
	//console.log(parentNode.lastChild.nextSibling == null)
	if (newChild.nodeType == DOCUMENT_FRAGMENT_NODE) {
		newChild.firstChild = newChild.lastChild = null;
	}
	return newChild;
}
function _appendSingleChild(parentNode,newChild){
	var cp = newChild.parentNode;
	if(cp){
		var pre = parentNode.lastChild;
		cp.removeChild(newChild);//remove and update
		var pre = parentNode.lastChild;
	}
	var pre = parentNode.lastChild;
	newChild.parentNode = parentNode;
	newChild.previousSibling = pre;
	newChild.nextSibling = null;
	if(pre){
		pre.nextSibling = newChild;
	}else{
		parentNode.firstChild = newChild;
	}
	parentNode.lastChild = newChild;
	_onUpdateChild(parentNode.ownerDocument,parentNode,newChild);
	return newChild;
	//console.log("__aa",parentNode.lastChild.nextSibling == null)
}
Document.prototype = {
	//implementation : null,
	nodeName :  '#document',
	nodeType :  DOCUMENT_NODE,
	doctype :  null,
	documentElement :  null,
	_inc : 1,
	
	insertBefore :  function(newChild, refChild){//raises 
		if(newChild.nodeType == DOCUMENT_FRAGMENT_NODE){
			var child = newChild.firstChild;
			while(child){
				var next = child.nextSibling;
				this.insertBefore(child,refChild);
				child = next;
			}
			return newChild;
		}
		if(this.documentElement == null && newChild.nodeType == 1){
			this.documentElement = newChild;
		}
		
		return _insertBefore(this,newChild,refChild),(newChild.ownerDocument = this),newChild;
	},
	removeChild :  function(oldChild){
		if(this.documentElement == oldChild){
			this.documentElement = null;
		}
		return _removeChild(this,oldChild);
	},
	// Introduced in DOM Level 2:
	importNode : function(importedNode,deep){
		return importNode(this,importedNode,deep);
	},
	// Introduced in DOM Level 2:
	getElementById :	function(id){
		var rtv = null;
		_visitNode(this.documentElement,function(node){
			if(node.nodeType == 1){
				if(node.getAttribute('id') == id){
					rtv = node;
					return true;
				}
			}
		})
		return rtv;
	},
	
	//document factory method:
	createElement :	function(tagName){
		var node = new Element();
		node.ownerDocument = this;
		node.nodeName = tagName;
		node.tagName = tagName;
		node.childNodes = new NodeList();
		var attrs	= node.attributes = new NamedNodeMap();
		attrs._ownerElement = node;
		return node;
	},
	createDocumentFragment :	function(){
		var node = new DocumentFragment();
		node.ownerDocument = this;
		node.childNodes = new NodeList();
		return node;
	},
	createTextNode :	function(data){
		var node = new Text();
		node.ownerDocument = this;
		node.appendData(data)
		return node;
	},
	createComment :	function(data){
		var node = new Comment();
		node.ownerDocument = this;
		node.appendData(data)
		return node;
	},
	createCDATASection :	function(data){
		var node = new CDATASection();
		node.ownerDocument = this;
		node.appendData(data)
		return node;
	},
	createProcessingInstruction :	function(target,data){
		var node = new ProcessingInstruction();
		node.ownerDocument = this;
		node.tagName = node.target = target;
		node.nodeValue= node.data = data;
		return node;
	},
	createAttribute :	function(name){
		var node = new Attr();
		node.ownerDocument	= this;
		node.name = name;
		node.nodeName	= name;
		node.localName = name;
		node.specified = true;
		return node;
	},
	createEntityReference :	function(name){
		var node = new EntityReference();
		node.ownerDocument	= this;
		node.nodeName	= name;
		return node;
	},
	// Introduced in DOM Level 2:
	createElementNS :	function(namespaceURI,qualifiedName){
		var node = new Element();
		var pl = qualifiedName.split(':');
		var attrs	= node.attributes = new NamedNodeMap();
		node.childNodes = new NodeList();
		node.ownerDocument = this;
		node.nodeName = qualifiedName;
		node.tagName = qualifiedName;
		node.namespaceURI = namespaceURI;
		if(pl.length == 2){
			node.prefix = pl[0];
			node.localName = pl[1];
		}else{
			//el.prefix = null;
			node.localName = qualifiedName;
		}
		attrs._ownerElement = node;
		return node;
	},
	// Introduced in DOM Level 2:
	createAttributeNS :	function(namespaceURI,qualifiedName){
		var node = new Attr();
		var pl = qualifiedName.split(':');
		node.ownerDocument = this;
		node.nodeName = qualifiedName;
		node.name = qualifiedName;
		node.namespaceURI = namespaceURI;
		node.specified = true;
		if(pl.length == 2){
			node.prefix = pl[0];
			node.localName = pl[1];
		}else{
			//el.prefix = null;
			node.localName = qualifiedName;
		}
		return node;
	}
};
_extends(Document,Node);


function Element() {
	this._nsMap = {};
};
Element.prototype = {
	nodeType : ELEMENT_NODE,
	hasAttribute : function(name){
		return this.getAttributeNode(name)!=null;
	},
	getAttribute : function(name){
		var attr = this.getAttributeNode(name);
		return attr && attr.value || '';
	},
	getAttributeNode : function(name){
		return this.attributes.getNamedItem(name);
	},
	setAttribute : function(name, value){
		var attr = this.ownerDocument.createAttribute(name);
		attr.value = attr.nodeValue = "" + value;
		this.setAttributeNode(attr)
	},
	removeAttribute : function(name){
		var attr = this.getAttributeNode(name)
		attr && this.removeAttributeNode(attr);
	},
	
	//four real opeartion method
	appendChild:function(newChild){
		if(newChild.nodeType === DOCUMENT_FRAGMENT_NODE){
			return this.insertBefore(newChild,null);
		}else{
			return _appendSingleChild(this,newChild);
		}
	},
	setAttributeNode : function(newAttr){
		return this.attributes.setNamedItem(newAttr);
	},
	setAttributeNodeNS : function(newAttr){
		return this.attributes.setNamedItemNS(newAttr);
	},
	removeAttributeNode : function(oldAttr){
		return this.attributes.removeNamedItem(oldAttr.nodeName);
	},
	//get real attribute name,and remove it by removeAttributeNode
	removeAttributeNS : function(namespaceURI, localName){
		var old = this.getAttributeNodeNS(namespaceURI, localName);
		old && this.removeAttributeNode(old);
	},
	
	hasAttributeNS : function(namespaceURI, localName){
		return this.getAttributeNodeNS(namespaceURI, localName)!=null;
	},
	getAttributeNS : function(namespaceURI, localName){
		var attr = this.getAttributeNodeNS(namespaceURI, localName);
		return attr && attr.value || '';
	},
	setAttributeNS : function(namespaceURI, qualifiedName, value){
		var attr = this.ownerDocument.createAttributeNS(namespaceURI, qualifiedName);
		attr.value = attr.nodeValue = value;
		this.setAttributeNode(attr)
	},
	getAttributeNodeNS : function(namespaceURI, localName){
		return this.attributes.getNamedItemNS(namespaceURI, localName);
	},
	
	getElementsByTagName : function(tagName){
		return new LiveNodeList(this,function(base){
			var ls = [];
			_visitNode(base,function(node){
				if(node !== base && node.nodeType == ELEMENT_NODE && (tagName === '*' || node.tagName == tagName)){
					ls.push(node);
				}
			});
			return ls;
		});
	},
	getElementsByTagNameNS : function(namespaceURI, localName){
		return new LiveNodeList(this,function(base){
			var ls = [];
			_visitNode(base,function(node){
				if(node !== base && node.nodeType === ELEMENT_NODE && node.namespaceURI === namespaceURI && (localName === '*' || node.localName == localName)){
					ls.push(node);
				}
			});
			return ls;
		});
	}
};
Document.prototype.getElementsByTagName = Element.prototype.getElementsByTagName;
Document.prototype.getElementsByTagNameNS = Element.prototype.getElementsByTagNameNS;


_extends(Element,Node);
function Attr() {
};
Attr.prototype.nodeType = ATTRIBUTE_NODE;
_extends(Attr,Node);


function CharacterData() {
};
CharacterData.prototype = {
	data : '',
	substringData : function(offset, count) {
		return this.data.substring(offset, offset+count);
	},
	appendData: function(text) {
		text = this.data+text;
		this.nodeValue = this.data = text;
		this.length = text.length;
	},
	insertData: function(offset,text) {
		this.replaceData(offset,0,text);
	
	},
	appendChild:function(newChild){
		//if(!(newChild instanceof CharacterData)){
			throw new Error(ExceptionMessage[3])
		//}
		return Node.prototype.appendChild.apply(this,arguments)
	},
	deleteData: function(offset, count) {
		this.replaceData(offset,count,"");
	},
	replaceData: function(offset, count, text) {
		var start = this.data.substring(0,offset);
		var end = this.data.substring(offset+count);
		text = start + text + end;
		this.nodeValue = this.data = text;
		this.length = text.length;
	}
}
_extends(CharacterData,Node);
function Text() {
};
Text.prototype = {
	nodeName : "#text",
	nodeType : TEXT_NODE,
	splitText : function(offset) {
		var text = this.data;
		var newText = text.substring(offset);
		text = text.substring(0, offset);
		this.data = this.nodeValue = text;
		this.length = text.length;
		var newNode = this.ownerDocument.createTextNode(newText);
		if(this.parentNode){
			this.parentNode.insertBefore(newNode, this.nextSibling);
		}
		return newNode;
	}
}
_extends(Text,CharacterData);
function Comment() {
};
Comment.prototype = {
	nodeName : "#comment",
	nodeType : COMMENT_NODE
}
_extends(Comment,CharacterData);

function CDATASection() {
};
CDATASection.prototype = {
	nodeName : "#cdata-section",
	nodeType : CDATA_SECTION_NODE
}
_extends(CDATASection,CharacterData);


function DocumentType() {
};
DocumentType.prototype.nodeType = DOCUMENT_TYPE_NODE;
_extends(DocumentType,Node);

function Notation() {
};
Notation.prototype.nodeType = NOTATION_NODE;
_extends(Notation,Node);

function Entity() {
};
Entity.prototype.nodeType = ENTITY_NODE;
_extends(Entity,Node);

function EntityReference() {
};
EntityReference.prototype.nodeType = ENTITY_REFERENCE_NODE;
_extends(EntityReference,Node);

function DocumentFragment() {
};
DocumentFragment.prototype.nodeName =	"#document-fragment";
DocumentFragment.prototype.nodeType =	DOCUMENT_FRAGMENT_NODE;
_extends(DocumentFragment,Node);


function ProcessingInstruction() {
}
ProcessingInstruction.prototype.nodeType = PROCESSING_INSTRUCTION_NODE;
_extends(ProcessingInstruction,Node);
function XMLSerializer(){}
XMLSerializer.prototype.serializeToString = function(node){
	var buf = [];
	serializeToString(node,buf);
	return buf.join('');
}
Node.prototype.toString =function(){
	return XMLSerializer.prototype.serializeToString(this);
}
function serializeToString(node,buf){
	switch(node.nodeType){
	case ELEMENT_NODE:
		var attrs = node.attributes;
		var len = attrs.length;
		var child = node.firstChild;
		var nodeName = node.tagName;
		var isHTML = htmlns === node.namespaceURI
		buf.push('<',nodeName);
		for(var i=0;i<len;i++){
			serializeToString(attrs.item(i),buf,isHTML);
		}
		if(child || isHTML && !/^(?:meta|link|img|br|hr|input)$/i.test(nodeName)){
			buf.push('>');
			//if is cdata child node
			if(isHTML && /^script$/i.test(nodeName)){
				if(child){
					buf.push(child.data);
				}
			}else{
				while(child){
					serializeToString(child,buf);
					child = child.nextSibling;
				}
			}
			buf.push('</',nodeName,'>');
		}else{
			buf.push('/>');
		}
		return;
	case DOCUMENT_NODE:
	case DOCUMENT_FRAGMENT_NODE:
		var child = node.firstChild;
		while(child){
			serializeToString(child,buf);
			child = child.nextSibling;
		}
		return;
	case ATTRIBUTE_NODE:
		return buf.push(' ',node.name,'="',node.value.replace(/[<&"]/g,_xmlEncoder),'"');
	case TEXT_NODE:
		return buf.push(node.data.replace(/[<&]/g,_xmlEncoder));
	case CDATA_SECTION_NODE:
		return buf.push( '<![CDATA[',node.data,']]>');
	case COMMENT_NODE:
		return buf.push( "<!--",node.data,"-->");
	case DOCUMENT_TYPE_NODE:
		var pubid = node.publicId;
		var sysid = node.systemId;
		buf.push('<!DOCTYPE ',node.name);
		if(pubid){
			buf.push(' PUBLIC "',pubid);
			if (sysid && sysid!='.') {
				buf.push( '" "',sysid);
			}
			buf.push('">');
		}else if(sysid && sysid!='.'){
			buf.push(' SYSTEM "',sysid,'">');
		}else{
			var sub = node.internalSubset;
			if(sub){
				buf.push(" [",sub,"]");
			}
			buf.push(">");
		}
		return;
	case PROCESSING_INSTRUCTION_NODE:
		return buf.push( "<?",node.target," ",node.data,"?>");
	case ENTITY_REFERENCE_NODE:
		return buf.push( '&',node.nodeName,';');
	//case ENTITY_NODE:
	//case NOTATION_NODE:
	default:
		buf.push('??',node.nodeName);
	}
}
function importNode(doc,node,deep){
	var node2;
	switch (node.nodeType) {
	case ELEMENT_NODE:
		node2 = node.cloneNode(false);
		node2.ownerDocument = doc;
		//var attrs = node2.attributes;
		//var len = attrs.length;
		//for(var i=0;i<len;i++){
			//node2.setAttributeNodeNS(importNode(doc,attrs.item(i),deep));
		//}
	case DOCUMENT_FRAGMENT_NODE:
		break;
	case ATTRIBUTE_NODE:
		deep = true;
		break;
	//case ENTITY_REFERENCE_NODE:
	//case PROCESSING_INSTRUCTION_NODE:
	////case TEXT_NODE:
	//case CDATA_SECTION_NODE:
	//case COMMENT_NODE:
	//	deep = false;
	//	break;
	//case DOCUMENT_NODE:
	//case DOCUMENT_TYPE_NODE:
	//cannot be imported.
	//case ENTITY_NODE:
	//case NOTATION_NODE：
	//can not hit in level3
	//default:throw e;
	}
	if(!node2){
		node2 = node.cloneNode(false);//false
	}
	node2.ownerDocument = doc;
	node2.parentNode = null;
	if(deep){
		var child = node.firstChild;
		while(child){
			node2.appendChild(importNode(doc,child,deep));
			child = child.nextSibling;
		}
	}
	return node2;
}
//
//var _relationMap = {firstChild:1,lastChild:1,previousSibling:1,nextSibling:1,
//					attributes:1,childNodes:1,parentNode:1,documentElement:1,doctype,};
function cloneNode(doc,node,deep){
	var node2 = new node.constructor();
	for(var n in node){
		var v = node[n];
		if(typeof v != 'object' ){
			if(v != node2[n]){
				node2[n] = v;
			}
		}
	}
	if(node.childNodes){
		node2.childNodes = new NodeList();
	}
	node2.ownerDocument = doc;
	switch (node2.nodeType) {
	case ELEMENT_NODE:
		var attrs	= node.attributes;
		var attrs2	= node2.attributes = new NamedNodeMap();
		var len = attrs.length
		attrs2._ownerElement = node2;
		for(var i=0;i<len;i++){
			node2.setAttributeNode(cloneNode(doc,attrs.item(i),true));
		}
		break;;
	case ATTRIBUTE_NODE:
		deep = true;
	}
	if(deep){
		var child = node.firstChild;
		while(child){
			node2.appendChild(cloneNode(doc,child,deep));
			child = child.nextSibling;
		}
	}
	return node2;
}

function __set__(object,key,value){
	object[key] = value
}
//do dynamic
try{
	if(Object.defineProperty){
		Object.defineProperty(LiveNodeList.prototype,'length',{
			get:function(){
				_updateLiveList(this);
				return this.$$length;
			}
		});
		Object.defineProperty(Node.prototype,'textContent',{
			get:function(){
				return getTextContent(this);
			},
			set:function(data){
				switch(this.nodeType){
				case 1:
				case 11:
					while(this.firstChild){
						this.removeChild(this.firstChild);
					}
					if(data || String(data)){
						this.appendChild(this.ownerDocument.createTextNode(data));
					}
					break;
				default:
					//TODO:
					this.data = data;
					this.value = value;
					this.nodeValue = data;
				}
			}
		})
		
		function getTextContent(node){
			switch(node.nodeType){
			case 1:
			case 11:
				var buf = [];
				node = node.firstChild;
				while(node){
					if(node.nodeType!==7 && node.nodeType !==8){
						buf.push(getTextContent(node));
					}
					node = node.nextSibling;
				}
				return buf.join('');
			default:
				return node.nodeValue;
			}
		}
		__set__ = function(object,key,value){
			//console.log(value)
			object['$$'+key] = value
		}
	}
}catch(e){//ie8
}

if(typeof require == 'function'){
	exports.DOMImplementation = DOMImplementation;
	exports.XMLSerializer = XMLSerializer;
}

},{}],"/Users/Jacob/workspace/scheduler/front-end/node_modules/cldr/node_modules/xmldom/sax.js":[function(require,module,exports){
//[4]   	NameStartChar	   ::=   	":" | [A-Z] | "_" | [a-z] | [#xC0-#xD6] | [#xD8-#xF6] | [#xF8-#x2FF] | [#x370-#x37D] | [#x37F-#x1FFF] | [#x200C-#x200D] | [#x2070-#x218F] | [#x2C00-#x2FEF] | [#x3001-#xD7FF] | [#xF900-#xFDCF] | [#xFDF0-#xFFFD] | [#x10000-#xEFFFF]
//[4a]   	NameChar	   ::=   	NameStartChar | "-" | "." | [0-9] | #xB7 | [#x0300-#x036F] | [#x203F-#x2040]
//[5]   	Name	   ::=   	NameStartChar (NameChar)*
var nameStartChar = /[A-Z_a-z\xC0-\xD6\xD8-\xF6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]///\u10000-\uEFFFF
var nameChar = new RegExp("[\\-\\.0-9"+nameStartChar.source.slice(1,-1)+"\u00B7\u0300-\u036F\\ux203F-\u2040]");
var tagNamePattern = new RegExp('^'+nameStartChar.source+nameChar.source+'*(?:\:'+nameStartChar.source+nameChar.source+'*)?$');
//var tagNamePattern = /^[a-zA-Z_][\w\-\.]*(?:\:[a-zA-Z_][\w\-\.]*)?$/
//var handlers = 'resolveEntity,getExternalSubset,characters,endDocument,endElement,endPrefixMapping,ignorableWhitespace,processingInstruction,setDocumentLocator,skippedEntity,startDocument,startElement,startPrefixMapping,notationDecl,unparsedEntityDecl,error,fatalError,warning,attributeDecl,elementDecl,externalEntityDecl,internalEntityDecl,comment,endCDATA,endDTD,endEntity,startCDATA,startDTD,startEntity'.split(',')

//S_TAG,	S_ATTR,	S_EQ,	S_V
//S_ATTR_S,	S_E,	S_S,	S_C
var S_TAG = 0;//tag name offerring
var S_ATTR = 1;//attr name offerring 
var S_ATTR_S=2;//attr name end and space offer
var S_EQ = 3;//=space?
var S_V = 4;//attr value(no quot value only)
var S_E = 5;//attr value end and no space(quot end)
var S_S = 6;//(attr value end || tag end ) && (space offer)
var S_C = 7;//closed el<el />

function XMLReader(){
	
}

XMLReader.prototype = {
	parse:function(source,defaultNSMap,entityMap){
		var domBuilder = this.domBuilder;
		domBuilder.startDocument();
		_copy(defaultNSMap ,defaultNSMap = {})
		parse(source,defaultNSMap,entityMap,
				domBuilder,this.errorHandler);
		domBuilder.endDocument();
	}
}
function parse(source,defaultNSMapCopy,entityMap,domBuilder,errorHandler){
  function fixedFromCharCode(code) {
		// String.prototype.fromCharCode does not supports
		// > 2 bytes unicode chars directly
		if (code > 0xffff) {
			code -= 0x10000;
			var surrogate1 = 0xd800 + (code >> 10)
				, surrogate2 = 0xdc00 + (code & 0x3ff);

			return String.fromCharCode(surrogate1, surrogate2);
		} else {
			return String.fromCharCode(code);
		}
	}
	function entityReplacer(a){
		var k = a.slice(1,-1);
		if(k in entityMap){
			return entityMap[k]; 
		}else if(k.charAt(0) === '#'){
			return fixedFromCharCode(parseInt(k.substr(1).replace('x','0x')))
		}else{
			errorHandler.error('entity not found:'+a);
			return a;
		}
	}
	function appendText(end){//has some bugs
		var xt = source.substring(start,end).replace(/&#?\w+;/g,entityReplacer);
		locator&&position(start);
		domBuilder.characters(xt,0,end-start);
		start = end
	}
	function position(start,m){
		while(start>=endPos && (m = linePattern.exec(source))){
			startPos = m.index;
			endPos = startPos + m[0].length;
			locator.lineNumber++;
			//console.log('line++:',locator,startPos,endPos)
		}
		locator.columnNumber = start-startPos+1;
	}
	var startPos = 0;
	var endPos = 0;
	var linePattern = /.+(?:\r\n?|\n)|.*$/g
	var locator = domBuilder.locator;
	
	var parseStack = [{currentNSMap:defaultNSMapCopy}]
	var closeMap = {};
	var start = 0;
	while(true){
		var i = source.indexOf('<',start);
		if(i<0){
			if(!source.substr(start).match(/^\s*$/)){
				var doc = domBuilder.document;
    			var text = doc.createTextNode(source.substr(start));
    			doc.appendChild(text);
    			domBuilder.currentElement = text;
			}
			return;
		}
		if(i>start){
			appendText(i);
		}
		switch(source.charAt(i+1)){
		case '/':
			var end = source.indexOf('>',i+3);
			var tagName = source.substring(i+2,end);
			var config = parseStack.pop();
			var localNSMap = config.localNSMap;
			
	        if(config.tagName != tagName){
	            errorHandler.fatalError("end tag name: "+tagName+' is not match the current start tagName:'+config.tagName );
	        }
			domBuilder.endElement(config.uri,config.localName,tagName);
			if(localNSMap){
				for(var prefix in localNSMap){
					domBuilder.endPrefixMapping(prefix) ;
				}
			}
			end++;
			break;
			// end elment
		case '?':// <?...?>
			locator&&position(i);
			end = parseInstruction(source,i,domBuilder);
			break;
		case '!':// <!doctype,<![CDATA,<!--
			locator&&position(i);
			end = parseDCC(source,i,domBuilder,errorHandler);
			break;
		default:
			try{
				locator&&position(i);
				
				var el = new ElementAttributes();
				
				//elStartEnd
				var end = parseElementStartPart(source,i,el,entityReplacer,errorHandler);
				var len = el.length;
				//position fixed
				if(len && locator){
					var backup = copyLocator(locator,{});
					for(var i = 0;i<len;i++){
						var a = el[i];
						position(a.offset);
						a.offset = copyLocator(locator,{});
					}
					copyLocator(backup,locator);
				}
				if(!el.closed && fixSelfClosed(source,end,el.tagName,closeMap)){
					el.closed = true;
					if(!entityMap.nbsp){
						errorHandler.warning('unclosed xml attribute');
					}
				}
				appendElement(el,domBuilder,parseStack);
				
				
				if(el.uri === 'http://www.w3.org/1999/xhtml' && !el.closed){
					end = parseHtmlSpecialContent(source,end,el.tagName,entityReplacer,domBuilder)
				}else{
					end++;
				}
			}catch(e){
				errorHandler.error('element parse error: '+e);
				end = -1;
			}

		}
		if(end<0){
			//TODO: 这里有可能sax回退，有位置错误风险
			appendText(i+1);
		}else{
			start = end;
		}
	}
}
function copyLocator(f,t){
	t.lineNumber = f.lineNumber;
	t.columnNumber = f.columnNumber;
	return t;
	
}

/**
 * @see #appendElement(source,elStartEnd,el,selfClosed,entityReplacer,domBuilder,parseStack);
 * @return end of the elementStartPart(end of elementEndPart for selfClosed el)
 */
function parseElementStartPart(source,start,el,entityReplacer,errorHandler){
	var attrName;
	var value;
	var p = ++start;
	var s = S_TAG;//status
	while(true){
		var c = source.charAt(p);
		switch(c){
		case '=':
			if(s === S_ATTR){//attrName
				attrName = source.slice(start,p);
				s = S_EQ;
			}else if(s === S_ATTR_S){
				s = S_EQ;
			}else{
				//fatalError: equal must after attrName or space after attrName
				throw new Error('attribute equal must after attrName');
			}
			break;
		case '\'':
		case '"':
			if(s === S_EQ){//equal
				start = p+1;
				p = source.indexOf(c,start)
				if(p>0){
					value = source.slice(start,p).replace(/&#?\w+;/g,entityReplacer);
					el.add(attrName,value,start-1);
					s = S_E;
				}else{
					//fatalError: no end quot match
					throw new Error('attribute value no end \''+c+'\' match');
				}
			}else if(s == S_V){
				value = source.slice(start,p).replace(/&#?\w+;/g,entityReplacer);
				//console.log(attrName,value,start,p)
				el.add(attrName,value,start);
				//console.dir(el)
				errorHandler.warning('attribute "'+attrName+'" missed start quot('+c+')!!');
				start = p+1;
				s = S_E
			}else{
				//fatalError: no equal before
				throw new Error('attribute value must after "="');
			}
			break;
		case '/':
			switch(s){
			case S_TAG:
				el.setTagName(source.slice(start,p));
			case S_E:
			case S_S:
			case S_C:
				s = S_C;
				el.closed = true;
			case S_V:
			case S_ATTR:
			case S_ATTR_S:
				break;
			//case S_EQ:
			default:
				throw new Error("attribute invalid close char('/')")
			}
			break;
		case ''://end document
			//throw new Error('unexpected end of input')
			errorHandler.error('unexpected end of input');
		case '>':
			switch(s){
			case S_TAG:
				el.setTagName(source.slice(start,p));
			case S_E:
			case S_S:
			case S_C:
				break;//normal
			case S_V://Compatible state
			case S_ATTR:
				value = source.slice(start,p);
				if(value.slice(-1) === '/'){
					el.closed  = true;
					value = value.slice(0,-1)
				}
			case S_ATTR_S:
				if(s === S_ATTR_S){
					value = attrName;
				}
				if(s == S_V){
					errorHandler.warning('attribute "'+value+'" missed quot(")!!');
					el.add(attrName,value.replace(/&#?\w+;/g,entityReplacer),start)
				}else{
					errorHandler.warning('attribute "'+value+'" missed value!! "'+value+'" instead!!')
					el.add(value,value,start)
				}
				break;
			case S_EQ:
				throw new Error('attribute value missed!!');
			}
//			console.log(tagName,tagNamePattern,tagNamePattern.test(tagName))
			return p;
		/*xml space '\x20' | #x9 | #xD | #xA; */
		case '\u0080':
			c = ' ';
		default:
			if(c<= ' '){//space
				switch(s){
				case S_TAG:
					el.setTagName(source.slice(start,p));//tagName
					s = S_S;
					break;
				case S_ATTR:
					attrName = source.slice(start,p)
					s = S_ATTR_S;
					break;
				case S_V:
					var value = source.slice(start,p).replace(/&#?\w+;/g,entityReplacer);
					errorHandler.warning('attribute "'+value+'" missed quot(")!!');
					el.add(attrName,value,start)
				case S_E:
					s = S_S;
					break;
				//case S_S:
				//case S_EQ:
				//case S_ATTR_S:
				//	void();break;
				//case S_C:
					//ignore warning
				}
			}else{//not space
//S_TAG,	S_ATTR,	S_EQ,	S_V
//S_ATTR_S,	S_E,	S_S,	S_C
				switch(s){
				//case S_TAG:void();break;
				//case S_ATTR:void();break;
				//case S_V:void();break;
				case S_ATTR_S:
					errorHandler.warning('attribute "'+attrName+'" missed value!! "'+attrName+'" instead!!')
					el.add(attrName,attrName,start);
					start = p;
					s = S_ATTR;
					break;
				case S_E:
					errorHandler.warning('attribute space is required"'+attrName+'"!!')
				case S_S:
					s = S_ATTR;
					start = p;
					break;
				case S_EQ:
					s = S_V;
					start = p;
					break;
				case S_C:
					throw new Error("elements closed character '/' and '>' must be connected to");
				}
			}
		}
		p++;
	}
}
/**
 * @return end of the elementStartPart(end of elementEndPart for selfClosed el)
 */
function appendElement(el,domBuilder,parseStack){
	var tagName = el.tagName;
	var localNSMap = null;
	var currentNSMap = parseStack[parseStack.length-1].currentNSMap;
	var i = el.length;
	while(i--){
		var a = el[i];
		var qName = a.qName;
		var value = a.value;
		var nsp = qName.indexOf(':');
		if(nsp>0){
			var prefix = a.prefix = qName.slice(0,nsp);
			var localName = qName.slice(nsp+1);
			var nsPrefix = prefix === 'xmlns' && localName
		}else{
			localName = qName;
			prefix = null
			nsPrefix = qName === 'xmlns' && ''
		}
		//can not set prefix,because prefix !== ''
		a.localName = localName ;
		//prefix == null for no ns prefix attribute 
		if(nsPrefix !== false){//hack!!
			if(localNSMap == null){
				localNSMap = {}
				//console.log(currentNSMap,0)
				_copy(currentNSMap,currentNSMap={})
				//console.log(currentNSMap,1)
			}
			currentNSMap[nsPrefix] = localNSMap[nsPrefix] = value;
			a.uri = 'http://www.w3.org/2000/xmlns/'
			domBuilder.startPrefixMapping(nsPrefix, value) 
		}
	}
	var i = el.length;
	while(i--){
		a = el[i];
		var prefix = a.prefix;
		if(prefix){//no prefix attribute has no namespace
			if(prefix === 'xml'){
				a.uri = 'http://www.w3.org/XML/1998/namespace';
			}if(prefix !== 'xmlns'){
				a.uri = currentNSMap[prefix]
				
				//{console.log('###'+a.qName,domBuilder.locator.systemId+'',currentNSMap,a.uri)}
			}
		}
	}
	var nsp = tagName.indexOf(':');
	if(nsp>0){
		prefix = el.prefix = tagName.slice(0,nsp);
		localName = el.localName = tagName.slice(nsp+1);
	}else{
		prefix = null;//important!!
		localName = el.localName = tagName;
	}
	//no prefix element has default namespace
	var ns = el.uri = currentNSMap[prefix || ''];
	domBuilder.startElement(ns,localName,tagName,el);
	//endPrefixMapping and startPrefixMapping have not any help for dom builder
	//localNSMap = null
	if(el.closed){
		domBuilder.endElement(ns,localName,tagName);
		if(localNSMap){
			for(prefix in localNSMap){
				domBuilder.endPrefixMapping(prefix) 
			}
		}
	}else{
		el.currentNSMap = currentNSMap;
		el.localNSMap = localNSMap;
		parseStack.push(el);
	}
}
function parseHtmlSpecialContent(source,elStartEnd,tagName,entityReplacer,domBuilder){
	if(/^(?:script|textarea)$/i.test(tagName)){
		var elEndStart =  source.indexOf('</'+tagName+'>',elStartEnd);
		var text = source.substring(elStartEnd+1,elEndStart);
		if(/[&<]/.test(text)){
			if(/^script$/i.test(tagName)){
				//if(!/\]\]>/.test(text)){
					//lexHandler.startCDATA();
					domBuilder.characters(text,0,text.length);
					//lexHandler.endCDATA();
					return elEndStart;
				//}
			}//}else{//text area
				text = text.replace(/&#?\w+;/g,entityReplacer);
				domBuilder.characters(text,0,text.length);
				return elEndStart;
			//}
			
		}
	}
	return elStartEnd+1;
}
function fixSelfClosed(source,elStartEnd,tagName,closeMap){
	//if(tagName in closeMap){
	var pos = closeMap[tagName];
	if(pos == null){
		//console.log(tagName)
		pos = closeMap[tagName] = source.lastIndexOf('</'+tagName+'>')
	}
	return pos<elStartEnd;
	//} 
}
function _copy(source,target){
	for(var n in source){target[n] = source[n]}
}
function parseDCC(source,start,domBuilder,errorHandler){//sure start with '<!'
	var next= source.charAt(start+2)
	switch(next){
	case '-':
		if(source.charAt(start + 3) === '-'){
			var end = source.indexOf('-->',start+4);
			//append comment source.substring(4,end)//<!--
			if(end>start){
				domBuilder.comment(source,start+4,end-start-4);
				return end+3;
			}else{
				errorHandler.error("Unclosed comment");
				return -1;
			}
		}else{
			//error
			return -1;
		}
	default:
		if(source.substr(start+3,6) == 'CDATA['){
			var end = source.indexOf(']]>',start+9);
			domBuilder.startCDATA();
			domBuilder.characters(source,start+9,end-start-9);
			domBuilder.endCDATA() 
			return end+3;
		}
		//<!DOCTYPE
		//startDTD(java.lang.String name, java.lang.String publicId, java.lang.String systemId) 
		var matchs = split(source,start);
		var len = matchs.length;
		if(len>1 && /!doctype/i.test(matchs[0][0])){
			var name = matchs[1][0];
			var pubid = len>3 && /^public$/i.test(matchs[2][0]) && matchs[3][0]
			var sysid = len>4 && matchs[4][0];
			var lastMatch = matchs[len-1]
			domBuilder.startDTD(name,pubid && pubid.replace(/^(['"])(.*?)\1$/,'$2'),
					sysid && sysid.replace(/^(['"])(.*?)\1$/,'$2'));
			domBuilder.endDTD();
			
			return lastMatch.index+lastMatch[0].length
		}
	}
	return -1;
}



function parseInstruction(source,start,domBuilder){
	var end = source.indexOf('?>',start);
	if(end){
		var match = source.substring(start,end).match(/^<\?(\S*)\s*([\s\S]*?)\s*$/);
		if(match){
			var len = match[0].length;
			domBuilder.processingInstruction(match[1], match[2]) ;
			return end+2;
		}else{//error
			return -1;
		}
	}
	return -1;
}

/**
 * @param source
 */
function ElementAttributes(source){
	
}
ElementAttributes.prototype = {
	setTagName:function(tagName){
		if(!tagNamePattern.test(tagName)){
			throw new Error('invalid tagName:'+tagName)
		}
		this.tagName = tagName
	},
	add:function(qName,value,offset){
		if(!tagNamePattern.test(qName)){
			throw new Error('invalid attribute:'+qName)
		}
		this[this.length++] = {qName:qName,value:value,offset:offset}
	},
	length:0,
	getLocalName:function(i){return this[i].localName},
	getOffset:function(i){return this[i].offset},
	getQName:function(i){return this[i].qName},
	getURI:function(i){return this[i].uri},
	getValue:function(i){return this[i].value}
//	,getIndex:function(uri, localName)){
//		if(localName){
//			
//		}else{
//			var qName = uri
//		}
//	},
//	getValue:function(){return this.getValue(this.getIndex.apply(this,arguments))},
//	getType:function(uri,localName){}
//	getType:function(i){},
}




function _set_proto_(thiz,parent){
	thiz.__proto__ = parent;
	return thiz;
}
if(!(_set_proto_({},_set_proto_.prototype) instanceof _set_proto_)){
	_set_proto_ = function(thiz,parent){
		function p(){};
		p.prototype = parent;
		p = new p();
		for(parent in thiz){
			p[parent] = thiz[parent];
		}
		return p;
	}
}

function split(source,start){
	var match;
	var buf = [];
	var reg = /'[^']+'|"[^"]+"|[^\s<>\/=]+=?|(\/?\s*>|<)/g;
	reg.lastIndex = start;
	reg.exec(source);//skip <
	while(match = reg.exec(source)){
		buf.push(match);
		if(match[1])return buf;
	}
}

if(typeof require == 'function'){
	exports.XMLReader = XMLReader;
}


},{}],"/Users/Jacob/workspace/scheduler/front-end/node_modules/cldr/node_modules/xpath/xpath.js":[function(require,module,exports){
/*
 * xpath.js
 *
 * An XPath 1.0 library for JavaScript.
 *
 * Cameron McCormack <cam (at) mcc.id.au>
 *
 * This work is licensed under the Creative Commons Attribution-ShareAlike
 * License. To view a copy of this license, visit
 *
 *   http://creativecommons.org/licenses/by-sa/2.0/
 *
 * or send a letter to Creative Commons, 559 Nathan Abbott Way, Stanford,
 * California 94305, USA.
 *
 * Revision 20: April 26, 2011
 *   Fixed a typo resulting in FIRST_ORDERED_NODE_TYPE results being wrong,
 *   thanks to <shi_a009 (at) hotmail.com>.
 *
 * Revision 19: November 29, 2005
 *   Nodesets now store their nodes in a height balanced tree, increasing
 *   performance for the common case of selecting nodes in document order,
 *   thanks to S閎astien Cramatte <contact (at) zeninteractif.com>.
 *   AVL tree code adapted from Raimund Neumann <rnova (at) gmx.net>.
 *
 * Revision 18: October 27, 2005
 *   DOM 3 XPath support.  Caveats:
 *     - namespace prefixes aren't resolved in XPathEvaluator.createExpression,
 *       but in XPathExpression.evaluate.
 *     - XPathResult.invalidIteratorState is not implemented.
 *
 * Revision 17: October 25, 2005
 *   Some core XPath function fixes and a patch to avoid crashing certain
 *   versions of MSXML in PathExpr.prototype.getOwnerElement, thanks to
 *   S閎astien Cramatte <contact (at) zeninteractif.com>.
 *
 * Revision 16: September 22, 2005
 *   Workarounds for some IE 5.5 deficiencies.
 *   Fixed problem with prefix node tests on attribute nodes.
 *
 * Revision 15: May 21, 2005
 *   Fixed problem with QName node tests on elements with an xmlns="...".
 *
 * Revision 14: May 19, 2005
 *   Fixed QName node tests on attribute node regression.
 *
 * Revision 13: May 3, 2005
 *   Node tests are case insensitive now if working in an HTML DOM.
 *
 * Revision 12: April 26, 2005
 *   Updated licence.  Slight code changes to enable use of Dean
 *   Edwards' script compression, http://dean.edwards.name/packer/ .
 *
 * Revision 11: April 23, 2005
 *   Fixed bug with 'and' and 'or' operators, fix thanks to
 *   Sandy McArthur <sandy (at) mcarthur.org>.
 *
 * Revision 10: April 15, 2005
 *   Added support for a virtual root node, supposedly helpful for
 *   implementing XForms.  Fixed problem with QName node tests and
 *   the parent axis.
 *
 * Revision 9: March 17, 2005
 *   Namespace resolver tweaked so using the document node as the context
 *   for namespace lookups is equivalent to using the document element.
 *
 * Revision 8: February 13, 2005
 *   Handle implicit declaration of 'xmlns' namespace prefix.
 *   Fixed bug when comparing nodesets.
 *   Instance data can now be associated with a FunctionResolver, and
 *     workaround for MSXML not supporting 'localName' and 'getElementById',
 *     thanks to Grant Gongaware.
 *   Fix a few problems when the context node is the root node.
 *
 * Revision 7: February 11, 2005
 *   Default namespace resolver fix from Grant Gongaware
 *   <grant (at) gongaware.com>.
 *
 * Revision 6: February 10, 2005
 *   Fixed bug in 'number' function.
 *
 * Revision 5: February 9, 2005
 *   Fixed bug where text nodes not getting converted to string values.
 *
 * Revision 4: January 21, 2005
 *   Bug in 'name' function, fix thanks to Bill Edney.
 *   Fixed incorrect processing of namespace nodes.
 *   Fixed NamespaceResolver to resolve 'xml' namespace.
 *   Implemented union '|' operator.
 *
 * Revision 3: January 14, 2005
 *   Fixed bug with nodeset comparisons, bug lexing < and >.
 *
 * Revision 2: October 26, 2004
 *   QName node test namespace handling fixed.  Few other bug fixes.
 *
 * Revision 1: August 13, 2004
 *   Bug fixes from William J. Edney <bedney (at) technicalpursuit.com>.
 *   Added minimal licence.
 *
 * Initial version: June 14, 2004
 */

// non-node wrapper
if(typeof exports === 'undefined' ) {
	xpath = {};
}
(function(exports) {
	
// XPathParser ///////////////////////////////////////////////////////////////

XPathParser.prototype = new Object();
XPathParser.prototype.constructor = XPathParser;
XPathParser.superclass = Object.prototype;

function XPathParser() {
	this.init();
}

XPathParser.prototype.init = function() {
	this.reduceActions = [];

	this.reduceActions[3] = function(rhs) {
		return new OrOperation(rhs[0], rhs[2]);
	};
	this.reduceActions[5] = function(rhs) {
		return new AndOperation(rhs[0], rhs[2]);
	};
	this.reduceActions[7] = function(rhs) {
		return new EqualsOperation(rhs[0], rhs[2]);
	};
	this.reduceActions[8] = function(rhs) {
		return new NotEqualOperation(rhs[0], rhs[2]);
	};
	this.reduceActions[10] = function(rhs) {
		return new LessThanOperation(rhs[0], rhs[2]);
	};
	this.reduceActions[11] = function(rhs) {
		return new GreaterThanOperation(rhs[0], rhs[2]);
	};
	this.reduceActions[12] = function(rhs) {
		return new LessThanOrEqualOperation(rhs[0], rhs[2]);
	};
	this.reduceActions[13] = function(rhs) {
		return new GreaterThanOrEqualOperation(rhs[0], rhs[2]);
	};
	this.reduceActions[15] = function(rhs) {
		return new PlusOperation(rhs[0], rhs[2]);
	};
	this.reduceActions[16] = function(rhs) {
		return new MinusOperation(rhs[0], rhs[2]);
	};
	this.reduceActions[18] = function(rhs) {
		return new MultiplyOperation(rhs[0], rhs[2]);
	};
	this.reduceActions[19] = function(rhs) {
		return new DivOperation(rhs[0], rhs[2]);
	};
	this.reduceActions[20] = function(rhs) {
		return new ModOperation(rhs[0], rhs[2]);
	};
	this.reduceActions[22] = function(rhs) {
		return new UnaryMinusOperation(rhs[1]);
	};
	this.reduceActions[24] = function(rhs) {
		return new BarOperation(rhs[0], rhs[2]);
	};
	this.reduceActions[25] = function(rhs) {
		return new PathExpr(undefined, undefined, rhs[0]);
	};
	this.reduceActions[27] = function(rhs) {
		rhs[0].locationPath = rhs[2];
		return rhs[0];
	};
	this.reduceActions[28] = function(rhs) {
		rhs[0].locationPath = rhs[2];
		rhs[0].locationPath.steps.unshift(new Step(Step.DESCENDANTORSELF, new NodeTest(NodeTest.NODE, undefined), []));
		return rhs[0];
	};
	this.reduceActions[29] = function(rhs) {
		return new PathExpr(rhs[0], [], undefined);
	};
	this.reduceActions[30] = function(rhs) {
		if (Utilities.instance_of(rhs[0], PathExpr)) {
			if (rhs[0].filterPredicates == undefined) {
				rhs[0].filterPredicates = [];
			}
			rhs[0].filterPredicates.push(rhs[1]);
			return rhs[0];
		} else {
			return new PathExpr(rhs[0], [rhs[1]], undefined);
		}
	};
	this.reduceActions[32] = function(rhs) {
		return rhs[1];
	};
	this.reduceActions[33] = function(rhs) {
		return new XString(rhs[0]);
	};
	this.reduceActions[34] = function(rhs) {
		return new XNumber(rhs[0]);
	};
	this.reduceActions[36] = function(rhs) {
		return new FunctionCall(rhs[0], []);
	};
	this.reduceActions[37] = function(rhs) {
		return new FunctionCall(rhs[0], rhs[2]);
	};
	this.reduceActions[38] = function(rhs) {
		return [ rhs[0] ];
	};
	this.reduceActions[39] = function(rhs) {
		rhs[2].unshift(rhs[0]);
		return rhs[2];
	};
	this.reduceActions[43] = function(rhs) {
		return new LocationPath(true, []);
	};
	this.reduceActions[44] = function(rhs) {
		rhs[1].absolute = true;
		return rhs[1];
	};
	this.reduceActions[46] = function(rhs) {
		return new LocationPath(false, [ rhs[0] ]);
	};
	this.reduceActions[47] = function(rhs) {
		rhs[0].steps.push(rhs[2]);
		return rhs[0];
	};
	this.reduceActions[49] = function(rhs) {
		return new Step(rhs[0], rhs[1], []);
	};
	this.reduceActions[50] = function(rhs) {
		return new Step(Step.CHILD, rhs[0], []);
	};
	this.reduceActions[51] = function(rhs) {
		return new Step(rhs[0], rhs[1], rhs[2]);
	};
	this.reduceActions[52] = function(rhs) {
		return new Step(Step.CHILD, rhs[0], rhs[1]);
	};
	this.reduceActions[54] = function(rhs) {
		return [ rhs[0] ];
	};
	this.reduceActions[55] = function(rhs) {
		rhs[1].unshift(rhs[0]);
		return rhs[1];
	};
	this.reduceActions[56] = function(rhs) {
		if (rhs[0] == "ancestor") {
			return Step.ANCESTOR;
		} else if (rhs[0] == "ancestor-or-self") {
			return Step.ANCESTORORSELF;
		} else if (rhs[0] == "attribute") {
			return Step.ATTRIBUTE;
		} else if (rhs[0] == "child") {
			return Step.CHILD;
		} else if (rhs[0] == "descendant") {
			return Step.DESCENDANT;
		} else if (rhs[0] == "descendant-or-self") {
			return Step.DESCENDANTORSELF;
		} else if (rhs[0] == "following") {
			return Step.FOLLOWING;
		} else if (rhs[0] == "following-sibling") {
			return Step.FOLLOWINGSIBLING;
		} else if (rhs[0] == "namespace") {
			return Step.NAMESPACE;
		} else if (rhs[0] == "parent") {
			return Step.PARENT;
		} else if (rhs[0] == "preceding") {
			return Step.PRECEDING;
		} else if (rhs[0] == "preceding-sibling") {
			return Step.PRECEDINGSIBLING;
		} else if (rhs[0] == "self") {
			return Step.SELF;
		}
		return -1;
	};
	this.reduceActions[57] = function(rhs) {
		return Step.ATTRIBUTE;
	};
	this.reduceActions[59] = function(rhs) {
		if (rhs[0] == "comment") {
			return new NodeTest(NodeTest.COMMENT, undefined);
		} else if (rhs[0] == "text") {
			return new NodeTest(NodeTest.TEXT, undefined);
		} else if (rhs[0] == "processing-instruction") {
			return new NodeTest(NodeTest.PI, undefined);
		} else if (rhs[0] == "node") {
			return new NodeTest(NodeTest.NODE, undefined);
		}
		return new NodeTest(-1, undefined);
	};
	this.reduceActions[60] = function(rhs) {
		return new NodeTest(NodeTest.PI, rhs[2]);
	};
	this.reduceActions[61] = function(rhs) {
		return rhs[1];
	};
	this.reduceActions[63] = function(rhs) {
		rhs[1].absolute = true;
		rhs[1].steps.unshift(new Step(Step.DESCENDANTORSELF, new NodeTest(NodeTest.NODE, undefined), []));
		return rhs[1];
	};
	this.reduceActions[64] = function(rhs) {
		rhs[0].steps.push(new Step(Step.DESCENDANTORSELF, new NodeTest(NodeTest.NODE, undefined), []));
		rhs[0].steps.push(rhs[2]);
		return rhs[0];
	};
	this.reduceActions[65] = function(rhs) {
		return new Step(Step.SELF, new NodeTest(NodeTest.NODE, undefined), []);
	};
	this.reduceActions[66] = function(rhs) {
		return new Step(Step.PARENT, new NodeTest(NodeTest.NODE, undefined), []);
	};
	this.reduceActions[67] = function(rhs) {
		return new VariableReference(rhs[1]);
	};
	this.reduceActions[68] = function(rhs) {
		return new NodeTest(NodeTest.NAMETESTANY, undefined);
	};
	this.reduceActions[69] = function(rhs) {
		var prefix = rhs[0].substring(0, rhs[0].indexOf(":"));
		return new NodeTest(NodeTest.NAMETESTPREFIXANY, prefix);
	};
	this.reduceActions[70] = function(rhs) {
		return new NodeTest(NodeTest.NAMETESTQNAME, rhs[0]);
	};
};

XPathParser.actionTable = [
	" s s        sssssssss    s ss  s  ss",
	"                 s                  ",
	"r  rrrrrrrrr         rrrrrrr rr  r  ",
	"                rrrrr               ",
	" s s        sssssssss    s ss  s  ss",
	"rs  rrrrrrrr s  sssssrrrrrr  rrs rs ",
	" s s        sssssssss    s ss  s  ss",
	"                            s       ",
	"                            s       ",
	"r  rrrrrrrrr         rrrrrrr rr rr  ",
	"r  rrrrrrrrr         rrrrrrr rr rr  ",
	"r  rrrrrrrrr         rrrrrrr rr rr  ",
	"r  rrrrrrrrr         rrrrrrr rr rr  ",
	"r  rrrrrrrrr         rrrrrrr rr rr  ",
	"  s                                 ",
	"                            s       ",
	" s           s  sssss          s  s ",
	"r  rrrrrrrrr         rrrrrrr rr  r  ",
	"a                                   ",
	"r       s                    rr  r  ",
	"r      sr                    rr  r  ",
	"r   s  rr            s       rr  r  ",
	"r   rssrr            rss     rr  r  ",
	"r   rrrrr            rrrss   rr  r  ",
	"r   rrrrrsss         rrrrr   rr  r  ",
	"r   rrrrrrrr         rrrrr   rr  r  ",
	"r   rrrrrrrr         rrrrrs  rr  r  ",
	"r   rrrrrrrr         rrrrrr  rr  r  ",
	"r   rrrrrrrr         rrrrrr  rr  r  ",
	"r  srrrrrrrr         rrrrrrs rr sr  ",
	"r  srrrrrrrr         rrrrrrs rr  r  ",
	"r  rrrrrrrrr         rrrrrrr rr rr  ",
	"r  rrrrrrrrr         rrrrrrr rr rr  ",
	"r  rrrrrrrrr         rrrrrrr rr rr  ",
	"r   rrrrrrrr         rrrrrr  rr  r  ",
	"r   rrrrrrrr         rrrrrr  rr  r  ",
	"r  rrrrrrrrr         rrrrrrr rr  r  ",
	"r  rrrrrrrrr         rrrrrrr rr  r  ",
	"                sssss               ",
	"r  rrrrrrrrr         rrrrrrr rr sr  ",
	"r  rrrrrrrrr         rrrrrrr rr  r  ",
	"r  rrrrrrrrr         rrrrrrr rr rr  ",
	"r  rrrrrrrrr         rrrrrrr rr rr  ",
	"                             s      ",
	"r  srrrrrrrr         rrrrrrs rr  r  ",
	"r   rrrrrrrr         rrrrr   rr  r  ",
	"              s                     ",
	"                             s      ",
	"                rrrrr               ",
	" s s        sssssssss    s sss s  ss",
	"r  srrrrrrrr         rrrrrrs rr  r  ",
	" s s        sssssssss    s ss  s  ss",
	" s s        sssssssss    s ss  s  ss",
	" s s        sssssssss    s ss  s  ss",
	" s s        sssssssss    s ss  s  ss",
	" s s        sssssssss    s ss  s  ss",
	" s s        sssssssss    s ss  s  ss",
	" s s        sssssssss    s ss  s  ss",
	" s s        sssssssss    s ss  s  ss",
	" s s        sssssssss    s ss  s  ss",
	" s s        sssssssss    s ss  s  ss",
	" s s        sssssssss    s ss  s  ss",
	" s s        sssssssss    s ss  s  ss",
	" s s        sssssssss    s ss  s  ss",
	" s s        sssssssss      ss  s  ss",
	" s s        sssssssss    s ss  s  ss",
	" s           s  sssss          s  s ",
	" s           s  sssss          s  s ",
	"r  rrrrrrrrr         rrrrrrr rr rr  ",
	" s           s  sssss          s  s ",
	" s           s  sssss          s  s ",
	"r  rrrrrrrrr         rrrrrrr rr sr  ",
	"r  rrrrrrrrr         rrrrrrr rr sr  ",
	"r  rrrrrrrrr         rrrrrrr rr  r  ",
	"r  rrrrrrrrr         rrrrrrr rr rr  ",
	"                             s      ",
	"r  rrrrrrrrr         rrrrrrr rr rr  ",
	"r  rrrrrrrrr         rrrrrrr rr rr  ",
	"                             rr     ",
	"                             s      ",
	"                             rs     ",
	"r      sr                    rr  r  ",
	"r   s  rr            s       rr  r  ",
	"r   rssrr            rss     rr  r  ",
	"r   rssrr            rss     rr  r  ",
	"r   rrrrr            rrrss   rr  r  ",
	"r   rrrrr            rrrss   rr  r  ",
	"r   rrrrr            rrrss   rr  r  ",
	"r   rrrrr            rrrss   rr  r  ",
	"r   rrrrrsss         rrrrr   rr  r  ",
	"r   rrrrrsss         rrrrr   rr  r  ",
	"r   rrrrrrrr         rrrrr   rr  r  ",
	"r   rrrrrrrr         rrrrr   rr  r  ",
	"r   rrrrrrrr         rrrrr   rr  r  ",
	"r   rrrrrrrr         rrrrrr  rr  r  ",
	"                                 r  ",
	"                                 s  ",
	"r  srrrrrrrr         rrrrrrs rr  r  ",
	"r  srrrrrrrr         rrrrrrs rr  r  ",
	"r  rrrrrrrrr         rrrrrrr rr  r  ",
	"r  rrrrrrrrr         rrrrrrr rr  r  ",
	"r  rrrrrrrrr         rrrrrrr rr  r  ",
	"r  rrrrrrrrr         rrrrrrr rr  r  ",
	"r  rrrrrrrrr         rrrrrrr rr rr  ",
	"r  rrrrrrrrr         rrrrrrr rr rr  ",
	" s s        sssssssss    s ss  s  ss",
	"r  rrrrrrrrr         rrrrrrr rr rr  ",
	"                             r      "
];

XPathParser.actionTableNumber = [
	" 1 0        /.-,+*)('    & %$  #  \"!",
	"                 J                  ",
	"a  aaaaaaaaa         aaaaaaa aa  a  ",
	"                YYYYY               ",
	" 1 0        /.-,+*)('    & %$  #  \"!",
	"K1  KKKKKKKK .  +*)('KKKKKK  KK# K\" ",
	" 1 0        /.-,+*)('    & %$  #  \"!",
	"                            N       ",
	"                            O       ",
	"e  eeeeeeeee         eeeeeee ee ee  ",
	"f  fffffffff         fffffff ff ff  ",
	"d  ddddddddd         ddddddd dd dd  ",
	"B  BBBBBBBBB         BBBBBBB BB BB  ",
	"A  AAAAAAAAA         AAAAAAA AA AA  ",
	"  P                                 ",
	"                            Q       ",
	" 1           .  +*)('          #  \" ",
	"b  bbbbbbbbb         bbbbbbb bb  b  ",
	"                                    ",
	"!       S                    !!  !  ",
	"\"      T\"                    \"\"  \"  ",
	"$   V  $$            U       $$  $  ",
	"&   &ZY&&            &XW     &&  &  ",
	")   )))))            )))\\[   ))  )  ",
	".   ....._^]         .....   ..  .  ",
	"1   11111111         11111   11  1  ",
	"5   55555555         55555`  55  5  ",
	"7   77777777         777777  77  7  ",
	"9   99999999         999999  99  9  ",
	":  c::::::::         ::::::b :: a:  ",
	"I  fIIIIIIII         IIIIIIe II  I  ",
	"=  =========         ======= == ==  ",
	"?  ?????????         ??????? ?? ??  ",
	"C  CCCCCCCCC         CCCCCCC CC CC  ",
	"J   JJJJJJJJ         JJJJJJ  JJ  J  ",
	"M   MMMMMMMM         MMMMMM  MM  M  ",
	"N  NNNNNNNNN         NNNNNNN NN  N  ",
	"P  PPPPPPPPP         PPPPPPP PP  P  ",
	"                +*)('               ",
	"R  RRRRRRRRR         RRRRRRR RR aR  ",
	"U  UUUUUUUUU         UUUUUUU UU  U  ",
	"Z  ZZZZZZZZZ         ZZZZZZZ ZZ ZZ  ",
	"c  ccccccccc         ccccccc cc cc  ",
	"                             j      ",
	"L  fLLLLLLLL         LLLLLLe LL  L  ",
	"6   66666666         66666   66  6  ",
	"              k                     ",
	"                             l      ",
	"                XXXXX               ",
	" 1 0        /.-,+*)('    & %$m #  \"!",
	"_  f________         ______e __  _  ",
	" 1 0        /.-,+*)('    & %$  #  \"!",
	" 1 0        /.-,+*)('    & %$  #  \"!",
	" 1 0        /.-,+*)('    & %$  #  \"!",
	" 1 0        /.-,+*)('    & %$  #  \"!",
	" 1 0        /.-,+*)('    & %$  #  \"!",
	" 1 0        /.-,+*)('    & %$  #  \"!",
	" 1 0        /.-,+*)('    & %$  #  \"!",
	" 1 0        /.-,+*)('    & %$  #  \"!",
	" 1 0        /.-,+*)('    & %$  #  \"!",
	" 1 0        /.-,+*)('    & %$  #  \"!",
	" 1 0        /.-,+*)('    & %$  #  \"!",
	" 1 0        /.-,+*)('    & %$  #  \"!",
	" 1 0        /.-,+*)('    & %$  #  \"!",
	" 1 0        /.-,+*)('      %$  #  \"!",
	" 1 0        /.-,+*)('    & %$  #  \"!",
	" 1           .  +*)('          #  \" ",
	" 1           .  +*)('          #  \" ",
	">  >>>>>>>>>         >>>>>>> >> >>  ",
	" 1           .  +*)('          #  \" ",
	" 1           .  +*)('          #  \" ",
	"Q  QQQQQQQQQ         QQQQQQQ QQ aQ  ",
	"V  VVVVVVVVV         VVVVVVV VV aV  ",
	"T  TTTTTTTTT         TTTTTTT TT  T  ",
	"@  @@@@@@@@@         @@@@@@@ @@ @@  ",
	"                             \x87      ",
	"[  [[[[[[[[[         [[[[[[[ [[ [[  ",
	"D  DDDDDDDDD         DDDDDDD DD DD  ",
	"                             HH     ",
	"                             \x88      ",
	"                             F\x89     ",
	"#      T#                    ##  #  ",
	"%   V  %%            U       %%  %  ",
	"'   'ZY''            'XW     ''  '  ",
	"(   (ZY((            (XW     ((  (  ",
	"+   +++++            +++\\[   ++  +  ",
	"*   *****            ***\\[   **  *  ",
	"-   -----            ---\\[   --  -  ",
	",   ,,,,,            ,,,\\[   ,,  ,  ",
	"0   00000_^]         00000   00  0  ",
	"/   /////_^]         /////   //  /  ",
	"2   22222222         22222   22  2  ",
	"3   33333333         33333   33  3  ",
	"4   44444444         44444   44  4  ",
	"8   88888888         888888  88  8  ",
	"                                 ^  ",
	"                                 \x8a  ",
	";  f;;;;;;;;         ;;;;;;e ;;  ;  ",
	"<  f<<<<<<<<         <<<<<<e <<  <  ",
	"O  OOOOOOOOO         OOOOOOO OO  O  ",
	"`  `````````         ``````` ``  `  ",
	"S  SSSSSSSSS         SSSSSSS SS  S  ",
	"W  WWWWWWWWW         WWWWWWW WW  W  ",
	"\\  \\\\\\\\\\\\\\\\\\         \\\\\\\\\\\\\\ \\\\ \\\\  ",
	"E  EEEEEEEEE         EEEEEEE EE EE  ",
	" 1 0        /.-,+*)('    & %$  #  \"!",
	"]  ]]]]]]]]]         ]]]]]]] ]] ]]  ",
	"                             G      "
];

XPathParser.gotoTable = [
	"3456789:;<=>?@ AB  CDEFGH IJ ",
	"                             ",
	"                             ",
	"                             ",
	"L456789:;<=>?@ AB  CDEFGH IJ ",
	"            M        EFGH IJ ",
	"       N;<=>?@ AB  CDEFGH IJ ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"            S        EFGH IJ ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"              e              ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                        h  J ",
	"              i          j   ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"o456789:;<=>?@ ABpqCDEFGH IJ ",
	"                             ",
	"  r6789:;<=>?@ AB  CDEFGH IJ ",
	"   s789:;<=>?@ AB  CDEFGH IJ ",
	"    t89:;<=>?@ AB  CDEFGH IJ ",
	"    u89:;<=>?@ AB  CDEFGH IJ ",
	"     v9:;<=>?@ AB  CDEFGH IJ ",
	"     w9:;<=>?@ AB  CDEFGH IJ ",
	"     x9:;<=>?@ AB  CDEFGH IJ ",
	"     y9:;<=>?@ AB  CDEFGH IJ ",
	"      z:;<=>?@ AB  CDEFGH IJ ",
	"      {:;<=>?@ AB  CDEFGH IJ ",
	"       |;<=>?@ AB  CDEFGH IJ ",
	"       };<=>?@ AB  CDEFGH IJ ",
	"       ~;<=>?@ AB  CDEFGH IJ ",
	"         \x7f=>?@ AB  CDEFGH IJ ",
	"\x80456789:;<=>?@ AB  CDEFGH IJ\x81",
	"            \x82        EFGH IJ ",
	"            \x83        EFGH IJ ",
	"                             ",
	"                     \x84 GH IJ ",
	"                     \x85 GH IJ ",
	"              i          \x86   ",
	"              i          \x87   ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"o456789:;<=>?@ AB\x8cqCDEFGH IJ ",
	"                             ",
	"                             "
];

XPathParser.productions = [
	[1, 1, 2],
	[2, 1, 3],
	[3, 1, 4],
	[3, 3, 3, -9, 4],
	[4, 1, 5],
	[4, 3, 4, -8, 5],
	[5, 1, 6],
	[5, 3, 5, -22, 6],
	[5, 3, 5, -5, 6],
	[6, 1, 7],
	[6, 3, 6, -23, 7],
	[6, 3, 6, -24, 7],
	[6, 3, 6, -6, 7],
	[6, 3, 6, -7, 7],
	[7, 1, 8],
	[7, 3, 7, -25, 8],
	[7, 3, 7, -26, 8],
	[8, 1, 9],
	[8, 3, 8, -12, 9],
	[8, 3, 8, -11, 9],
	[8, 3, 8, -10, 9],
	[9, 1, 10],
	[9, 2, -26, 9],
	[10, 1, 11],
	[10, 3, 10, -27, 11],
	[11, 1, 12],
	[11, 1, 13],
	[11, 3, 13, -28, 14],
	[11, 3, 13, -4, 14],
	[13, 1, 15],
	[13, 2, 13, 16],
	[15, 1, 17],
	[15, 3, -29, 2, -30],
	[15, 1, -15],
	[15, 1, -16],
	[15, 1, 18],
	[18, 3, -13, -29, -30],
	[18, 4, -13, -29, 19, -30],
	[19, 1, 20],
	[19, 3, 20, -31, 19],
	[20, 1, 2],
	[12, 1, 14],
	[12, 1, 21],
	[21, 1, -28],
	[21, 2, -28, 14],
	[21, 1, 22],
	[14, 1, 23],
	[14, 3, 14, -28, 23],
	[14, 1, 24],
	[23, 2, 25, 26],
	[23, 1, 26],
	[23, 3, 25, 26, 27],
	[23, 2, 26, 27],
	[23, 1, 28],
	[27, 1, 16],
	[27, 2, 16, 27],
	[25, 2, -14, -3],
	[25, 1, -32],
	[26, 1, 29],
	[26, 3, -20, -29, -30],
	[26, 4, -21, -29, -15, -30],
	[16, 3, -33, 30, -34],
	[30, 1, 2],
	[22, 2, -4, 14],
	[24, 3, 14, -4, 23],
	[28, 1, -35],
	[28, 1, -2],
	[17, 2, -36, -18],
	[29, 1, -17],
	[29, 1, -19],
	[29, 1, -18]
];

XPathParser.DOUBLEDOT = 2;
XPathParser.DOUBLECOLON = 3;
XPathParser.DOUBLESLASH = 4;
XPathParser.NOTEQUAL = 5;
XPathParser.LESSTHANOREQUAL = 6;
XPathParser.GREATERTHANOREQUAL = 7;
XPathParser.AND = 8;
XPathParser.OR = 9;
XPathParser.MOD = 10;
XPathParser.DIV = 11;
XPathParser.MULTIPLYOPERATOR = 12;
XPathParser.FUNCTIONNAME = 13;
XPathParser.AXISNAME = 14;
XPathParser.LITERAL = 15;
XPathParser.NUMBER = 16;
XPathParser.ASTERISKNAMETEST = 17;
XPathParser.QNAME = 18;
XPathParser.NCNAMECOLONASTERISK = 19;
XPathParser.NODETYPE = 20;
XPathParser.PROCESSINGINSTRUCTIONWITHLITERAL = 21;
XPathParser.EQUALS = 22;
XPathParser.LESSTHAN = 23;
XPathParser.GREATERTHAN = 24;
XPathParser.PLUS = 25;
XPathParser.MINUS = 26;
XPathParser.BAR = 27;
XPathParser.SLASH = 28;
XPathParser.LEFTPARENTHESIS = 29;
XPathParser.RIGHTPARENTHESIS = 30;
XPathParser.COMMA = 31;
XPathParser.AT = 32;
XPathParser.LEFTBRACKET = 33;
XPathParser.RIGHTBRACKET = 34;
XPathParser.DOT = 35;
XPathParser.DOLLAR = 36;

XPathParser.prototype.tokenize = function(s1) {
	var types = [];
	var values = [];
	var s = s1 + '\0';

	var pos = 0;
	var c = s.charAt(pos++);
	while (1) {
		while (c == ' ' || c == '\t' || c == '\r' || c == '\n') {
			c = s.charAt(pos++);
		}
		if (c == '\0' || pos >= s.length) {
			break;
		}

		if (c == '(') {
			types.push(XPathParser.LEFTPARENTHESIS);
			values.push(c);
			c = s.charAt(pos++);
			continue;
		}
		if (c == ')') {
			types.push(XPathParser.RIGHTPARENTHESIS);
			values.push(c);
			c = s.charAt(pos++);
			continue;
		}
		if (c == '[') {
			types.push(XPathParser.LEFTBRACKET);
			values.push(c);
			c = s.charAt(pos++);
			continue;
		}
		if (c == ']') {
			types.push(XPathParser.RIGHTBRACKET);
			values.push(c);
			c = s.charAt(pos++);
			continue;
		}
		if (c == '@') {
			types.push(XPathParser.AT);
			values.push(c);
			c = s.charAt(pos++);
			continue;
		}
		if (c == ',') {
			types.push(XPathParser.COMMA);
			values.push(c);
			c = s.charAt(pos++);
			continue;
		}
		if (c == '|') {
			types.push(XPathParser.BAR);
			values.push(c);
			c = s.charAt(pos++);
			continue;
		}
		if (c == '+') {
			types.push(XPathParser.PLUS);
			values.push(c);
			c = s.charAt(pos++);
			continue;
		}
		if (c == '-') {
			types.push(XPathParser.MINUS);
			values.push(c);
			c = s.charAt(pos++);
			continue;
		}
		if (c == '=') {
			types.push(XPathParser.EQUALS);
			values.push(c);
			c = s.charAt(pos++);
			continue;
		}
		if (c == '$') {
			types.push(XPathParser.DOLLAR);
			values.push(c);
			c = s.charAt(pos++);
			continue;
		}

		if (c == '.') {
			c = s.charAt(pos++);
			if (c == '.') {
				types.push(XPathParser.DOUBLEDOT);
				values.push("..");
				c = s.charAt(pos++);
				continue;
			}
			if (c >= '0' && c <= '9') {
				var number = "." + c;
				c = s.charAt(pos++);
				while (c >= '0' && c <= '9') {
					number += c;
					c = s.charAt(pos++);
				}
				types.push(XPathParser.NUMBER);
				values.push(number);
				continue;
			}
			types.push(XPathParser.DOT);
			values.push('.');
			continue;
		}

		if (c == '\'' || c == '"') {
			var delimiter = c;
			var literal = "";
			while ((c = s.charAt(pos++)) != delimiter) {
				literal += c;
			}
			types.push(XPathParser.LITERAL);
			values.push(literal);
			c = s.charAt(pos++);
			continue;
		}

		if (c >= '0' && c <= '9') {
			var number = c;
			c = s.charAt(pos++);
			while (c >= '0' && c <= '9') {
				number += c;
				c = s.charAt(pos++);
			}
			if (c == '.') {
				if (s.charAt(pos) >= '0' && s.charAt(pos) <= '9') {
					number += c;
					number += s.charAt(pos++);
					c = s.charAt(pos++);
					while (c >= '0' && c <= '9') {
						number += c;
						c = s.charAt(pos++);
					}
				}
			}
			types.push(XPathParser.NUMBER);
			values.push(number);
			continue;
		}

		if (c == '*') {
			if (types.length > 0) {
				var last = types[types.length - 1];
				if (last != XPathParser.AT
						&& last != XPathParser.DOUBLECOLON
						&& last != XPathParser.LEFTPARENTHESIS
						&& last != XPathParser.LEFTBRACKET
						&& last != XPathParser.AND
						&& last != XPathParser.OR
						&& last != XPathParser.MOD
						&& last != XPathParser.DIV
						&& last != XPathParser.MULTIPLYOPERATOR
						&& last != XPathParser.SLASH
						&& last != XPathParser.DOUBLESLASH
						&& last != XPathParser.BAR
						&& last != XPathParser.PLUS
						&& last != XPathParser.MINUS
						&& last != XPathParser.EQUALS
						&& last != XPathParser.NOTEQUAL
						&& last != XPathParser.LESSTHAN
						&& last != XPathParser.LESSTHANOREQUAL
						&& last != XPathParser.GREATERTHAN
						&& last != XPathParser.GREATERTHANOREQUAL) {
					types.push(XPathParser.MULTIPLYOPERATOR);
					values.push(c);
					c = s.charAt(pos++);
					continue;
				}
			}
			types.push(XPathParser.ASTERISKNAMETEST);
			values.push(c);
			c = s.charAt(pos++);
			continue;
		}

		if (c == ':') {
			if (s.charAt(pos) == ':') {
				types.push(XPathParser.DOUBLECOLON);
				values.push("::");
				pos++;
				c = s.charAt(pos++);
				continue;
			}
		}

		if (c == '/') {
			c = s.charAt(pos++);
			if (c == '/') {
				types.push(XPathParser.DOUBLESLASH);
				values.push("//");
				c = s.charAt(pos++);
				continue;
			}
			types.push(XPathParser.SLASH);
			values.push('/');
			continue;
		}

		if (c == '!') {
			if (s.charAt(pos) == '=') {
				types.push(XPathParser.NOTEQUAL);
				values.push("!=");
				pos++;
				c = s.charAt(pos++);
				continue;
			}
		}

		if (c == '<') {
			if (s.charAt(pos) == '=') {
				types.push(XPathParser.LESSTHANOREQUAL);
				values.push("<=");
				pos++;
				c = s.charAt(pos++);
				continue;
			}
			types.push(XPathParser.LESSTHAN);
			values.push('<');
			c = s.charAt(pos++);
			continue;
		}

		if (c == '>') {
			if (s.charAt(pos) == '=') {
				types.push(XPathParser.GREATERTHANOREQUAL);
				values.push(">=");
				pos++;
				c = s.charAt(pos++);
				continue;
			}
			types.push(XPathParser.GREATERTHAN);
			values.push('>');
			c = s.charAt(pos++);
			continue;
		}

		if (c == '_' || Utilities.isLetter(c.charCodeAt(0))) {
			var name = c;
			c = s.charAt(pos++);
			while (Utilities.isNCNameChar(c.charCodeAt(0))) {
				name += c;
				c = s.charAt(pos++);
			}
			if (types.length > 0) {
				var last = types[types.length - 1];
				if (last != XPathParser.AT
						&& last != XPathParser.DOUBLECOLON
						&& last != XPathParser.LEFTPARENTHESIS
						&& last != XPathParser.LEFTBRACKET
						&& last != XPathParser.AND
						&& last != XPathParser.OR
						&& last != XPathParser.MOD
						&& last != XPathParser.DIV
						&& last != XPathParser.MULTIPLYOPERATOR
						&& last != XPathParser.SLASH
						&& last != XPathParser.DOUBLESLASH
						&& last != XPathParser.BAR
						&& last != XPathParser.PLUS
						&& last != XPathParser.MINUS
						&& last != XPathParser.EQUALS
						&& last != XPathParser.NOTEQUAL
						&& last != XPathParser.LESSTHAN
						&& last != XPathParser.LESSTHANOREQUAL
						&& last != XPathParser.GREATERTHAN
						&& last != XPathParser.GREATERTHANOREQUAL) {
					if (name == "and") {
						types.push(XPathParser.AND);
						values.push(name);
						continue;
					}
					if (name == "or") {
						types.push(XPathParser.OR);
						values.push(name);
						continue;
					}
					if (name == "mod") {
						types.push(XPathParser.MOD);
						values.push(name);
						continue;
					}
					if (name == "div") {
						types.push(XPathParser.DIV);
						values.push(name);
						continue;
					}
				}
			}
			if (c == ':') {
				if (s.charAt(pos) == '*') {
					types.push(XPathParser.NCNAMECOLONASTERISK);
					values.push(name + ":*");
					pos++;
					c = s.charAt(pos++);
					continue;
				}
				if (s.charAt(pos) == '_' || Utilities.isLetter(s.charCodeAt(pos))) {
					name += ':';
					c = s.charAt(pos++);
					while (Utilities.isNCNameChar(c.charCodeAt(0))) {
						name += c;
						c = s.charAt(pos++);
					}
					if (c == '(') {
						types.push(XPathParser.FUNCTIONNAME);
						values.push(name);
						continue;
					}
					types.push(XPathParser.QNAME);
					values.push(name);
					continue;
				}
				if (s.charAt(pos) == ':') {
					types.push(XPathParser.AXISNAME);
					values.push(name);
					continue;
				}
			}
			if (c == '(') {
				if (name == "comment" || name == "text" || name == "node") {
					types.push(XPathParser.NODETYPE);
					values.push(name);
					continue;
				}
				if (name == "processing-instruction") {
					if (s.charAt(pos) == ')') {
						types.push(XPathParser.NODETYPE);
					} else {
						types.push(XPathParser.PROCESSINGINSTRUCTIONWITHLITERAL);
					}
					values.push(name);
					continue;
				}
				types.push(XPathParser.FUNCTIONNAME);
				values.push(name);
				continue;
			}
			types.push(XPathParser.QNAME);
			values.push(name);
			continue;
		}

		throw new Error("Unexpected character " + c);
	}
	types.push(1);
	values.push("[EOF]");
	return [types, values];
};

XPathParser.SHIFT = 's';
XPathParser.REDUCE = 'r';
XPathParser.ACCEPT = 'a';

XPathParser.prototype.parse = function(s) {
	var types;
	var values;
	var res = this.tokenize(s);
	if (res == undefined) {
		return undefined;
	}
	types = res[0];
	values = res[1];
	var tokenPos = 0;
	var state = [];
	var tokenType = [];
	var tokenValue = [];
	var s;
	var a;
	var t;

	state.push(0);
	tokenType.push(1);
	tokenValue.push("_S");

	a = types[tokenPos];
	t = values[tokenPos++];
	while (1) {
		s = state[state.length - 1];
		switch (XPathParser.actionTable[s].charAt(a - 1)) {
			case XPathParser.SHIFT:
				tokenType.push(-a);
				tokenValue.push(t);
				state.push(XPathParser.actionTableNumber[s].charCodeAt(a - 1) - 32);
				a = types[tokenPos];
				t = values[tokenPos++];
				break;
			case XPathParser.REDUCE:
				var num = XPathParser.productions[XPathParser.actionTableNumber[s].charCodeAt(a - 1) - 32][1];
				var rhs = [];
				for (var i = 0; i < num; i++) {
					tokenType.pop();
					rhs.unshift(tokenValue.pop());
					state.pop();
				}
				var s_ = state[state.length - 1];
				tokenType.push(XPathParser.productions[XPathParser.actionTableNumber[s].charCodeAt(a - 1) - 32][0]);
				if (this.reduceActions[XPathParser.actionTableNumber[s].charCodeAt(a - 1) - 32] == undefined) {
					tokenValue.push(rhs[0]);
				} else {
					tokenValue.push(this.reduceActions[XPathParser.actionTableNumber[s].charCodeAt(a - 1) - 32](rhs));
				}
				state.push(XPathParser.gotoTable[s_].charCodeAt(XPathParser.productions[XPathParser.actionTableNumber[s].charCodeAt(a - 1) - 32][0] - 2) - 33);
				break;
			case XPathParser.ACCEPT:
				return new XPath(tokenValue.pop());
			default:
				throw new Error("XPath parse error");
		}
	}
};

// XPath /////////////////////////////////////////////////////////////////////

XPath.prototype = new Object();
XPath.prototype.constructor = XPath;
XPath.superclass = Object.prototype;

function XPath(e) {
	this.expression = e;
}

XPath.prototype.toString = function() {
	return this.expression.toString();
};

XPath.prototype.evaluate = function(c) {
	c.contextNode = c.expressionContextNode;
	c.contextSize = 1;
	c.contextPosition = 1;
	c.caseInsensitive = false;
	if (c.contextNode != null) {
		var doc = c.contextNode;
		if (doc.nodeType != 9 /*Node.DOCUMENT_NODE*/) {
			doc = doc.ownerDocument;
		}
		try {
			c.caseInsensitive = doc.implementation.hasFeature("HTML", "2.0");
		} catch (e) {
			c.caseInsensitive = true;
		}
	}
	return this.expression.evaluate(c);
};

XPath.XML_NAMESPACE_URI = "http://www.w3.org/XML/1998/namespace";
XPath.XMLNS_NAMESPACE_URI = "http://www.w3.org/2000/xmlns/";

// Expression ////////////////////////////////////////////////////////////////

Expression.prototype = new Object();
Expression.prototype.constructor = Expression;
Expression.superclass = Object.prototype;

function Expression() {
}

Expression.prototype.init = function() {
};

Expression.prototype.toString = function() {
	return "<Expression>";
};

Expression.prototype.evaluate = function(c) {
	throw new Error("Could not evaluate expression.");
};

// UnaryOperation ////////////////////////////////////////////////////////////

UnaryOperation.prototype = new Expression();
UnaryOperation.prototype.constructor = UnaryOperation;
UnaryOperation.superclass = Expression.prototype;

function UnaryOperation(rhs) {
	if (arguments.length > 0) {
		this.init(rhs);
	}
}

UnaryOperation.prototype.init = function(rhs) {
	this.rhs = rhs;
};

// UnaryMinusOperation ///////////////////////////////////////////////////////

UnaryMinusOperation.prototype = new UnaryOperation();
UnaryMinusOperation.prototype.constructor = UnaryMinusOperation;
UnaryMinusOperation.superclass = UnaryOperation.prototype;

function UnaryMinusOperation(rhs) {
	if (arguments.length > 0) {
		this.init(rhs);
	}
}

UnaryMinusOperation.prototype.init = function(rhs) {
	UnaryMinusOperation.superclass.init.call(this, rhs);
};

UnaryMinusOperation.prototype.evaluate = function(c) {
	return this.rhs.evaluate(c).number().negate();
};

UnaryMinusOperation.prototype.toString = function() {
	return "-" + this.rhs.toString();
};

// BinaryOperation ///////////////////////////////////////////////////////////

BinaryOperation.prototype = new Expression();
BinaryOperation.prototype.constructor = BinaryOperation;
BinaryOperation.superclass = Expression.prototype;

function BinaryOperation(lhs, rhs) {
	if (arguments.length > 0) {
		this.init(lhs, rhs);
	}
}

BinaryOperation.prototype.init = function(lhs, rhs) {
	this.lhs = lhs;
	this.rhs = rhs;
};

// OrOperation ///////////////////////////////////////////////////////////////

OrOperation.prototype = new BinaryOperation();
OrOperation.prototype.constructor = OrOperation;
OrOperation.superclass = BinaryOperation.prototype;

function OrOperation(lhs, rhs) {
	if (arguments.length > 0) {
		this.init(lhs, rhs);
	}
}

OrOperation.prototype.init = function(lhs, rhs) {
	OrOperation.superclass.init.call(this, lhs, rhs);
};

OrOperation.prototype.toString = function() {
	return "(" + this.lhs.toString() + " or " + this.rhs.toString() + ")";
};

OrOperation.prototype.evaluate = function(c) {
	var b = this.lhs.evaluate(c).bool();
	if (b.booleanValue()) {
		return b;
	}
	return this.rhs.evaluate(c).bool();
};

// AndOperation //////////////////////////////////////////////////////////////

AndOperation.prototype = new BinaryOperation();
AndOperation.prototype.constructor = AndOperation;
AndOperation.superclass = BinaryOperation.prototype;

function AndOperation(lhs, rhs) {
	if (arguments.length > 0) {
		this.init(lhs, rhs);
	}
}

AndOperation.prototype.init = function(lhs, rhs) {
	AndOperation.superclass.init.call(this, lhs, rhs);
};

AndOperation.prototype.toString = function() {
	return "(" + this.lhs.toString() + " and " + this.rhs.toString() + ")";
};

AndOperation.prototype.evaluate = function(c) {
	var b = this.lhs.evaluate(c).bool();
	if (!b.booleanValue()) {
		return b;
	}
	return this.rhs.evaluate(c).bool();
};

// EqualsOperation ///////////////////////////////////////////////////////////

EqualsOperation.prototype = new BinaryOperation();
EqualsOperation.prototype.constructor = EqualsOperation;
EqualsOperation.superclass = BinaryOperation.prototype;

function EqualsOperation(lhs, rhs) {
	if (arguments.length > 0) {
		this.init(lhs, rhs);
	}
}

EqualsOperation.prototype.init = function(lhs, rhs) {
	EqualsOperation.superclass.init.call(this, lhs, rhs);
};

EqualsOperation.prototype.toString = function() {
	return "(" + this.lhs.toString() + " = " + this.rhs.toString() + ")";
};

EqualsOperation.prototype.evaluate = function(c) {
	return this.lhs.evaluate(c).equals(this.rhs.evaluate(c));
};

// NotEqualOperation /////////////////////////////////////////////////////////

NotEqualOperation.prototype = new BinaryOperation();
NotEqualOperation.prototype.constructor = NotEqualOperation;
NotEqualOperation.superclass = BinaryOperation.prototype;

function NotEqualOperation(lhs, rhs) {
	if (arguments.length > 0) {
		this.init(lhs, rhs);
	}
}

NotEqualOperation.prototype.init = function(lhs, rhs) {
	NotEqualOperation.superclass.init.call(this, lhs, rhs);
};

NotEqualOperation.prototype.toString = function() {
	return "(" + this.lhs.toString() + " != " + this.rhs.toString() + ")";
};

NotEqualOperation.prototype.evaluate = function(c) {
	return this.lhs.evaluate(c).notequal(this.rhs.evaluate(c));
};

// LessThanOperation /////////////////////////////////////////////////////////

LessThanOperation.prototype = new BinaryOperation();
LessThanOperation.prototype.constructor = LessThanOperation;
LessThanOperation.superclass = BinaryOperation.prototype;

function LessThanOperation(lhs, rhs) {
	if (arguments.length > 0) {
		this.init(lhs, rhs);
	}
}

LessThanOperation.prototype.init = function(lhs, rhs) {
	LessThanOperation.superclass.init.call(this, lhs, rhs);
};

LessThanOperation.prototype.evaluate = function(c) {
	return this.lhs.evaluate(c).lessthan(this.rhs.evaluate(c));
};

LessThanOperation.prototype.toString = function() {
	return "(" + this.lhs.toString() + " < " + this.rhs.toString() + ")";
};

// GreaterThanOperation //////////////////////////////////////////////////////

GreaterThanOperation.prototype = new BinaryOperation();
GreaterThanOperation.prototype.constructor = GreaterThanOperation;
GreaterThanOperation.superclass = BinaryOperation.prototype;

function GreaterThanOperation(lhs, rhs) {
	if (arguments.length > 0) {
		this.init(lhs, rhs);
	}
}

GreaterThanOperation.prototype.init = function(lhs, rhs) {
	GreaterThanOperation.superclass.init.call(this, lhs, rhs);
};

GreaterThanOperation.prototype.evaluate = function(c) {
	return this.lhs.evaluate(c).greaterthan(this.rhs.evaluate(c));
};

GreaterThanOperation.prototype.toString = function() {
	return "(" + this.lhs.toString() + " > " + this.rhs.toString() + ")";
};

// LessThanOrEqualOperation //////////////////////////////////////////////////

LessThanOrEqualOperation.prototype = new BinaryOperation();
LessThanOrEqualOperation.prototype.constructor = LessThanOrEqualOperation;
LessThanOrEqualOperation.superclass = BinaryOperation.prototype;

function LessThanOrEqualOperation(lhs, rhs) {
	if (arguments.length > 0) {
		this.init(lhs, rhs);
	}
}

LessThanOrEqualOperation.prototype.init = function(lhs, rhs) {
	LessThanOrEqualOperation.superclass.init.call(this, lhs, rhs);
};

LessThanOrEqualOperation.prototype.evaluate = function(c) {
	return this.lhs.evaluate(c).lessthanorequal(this.rhs.evaluate(c));
};

LessThanOrEqualOperation.prototype.toString = function() {
	return "(" + this.lhs.toString() + " <= " + this.rhs.toString() + ")";
};

// GreaterThanOrEqualOperation ///////////////////////////////////////////////

GreaterThanOrEqualOperation.prototype = new BinaryOperation();
GreaterThanOrEqualOperation.prototype.constructor = GreaterThanOrEqualOperation;
GreaterThanOrEqualOperation.superclass = BinaryOperation.prototype;

function GreaterThanOrEqualOperation(lhs, rhs) {
	if (arguments.length > 0) {
		this.init(lhs, rhs);
	}
}

GreaterThanOrEqualOperation.prototype.init = function(lhs, rhs) {
	GreaterThanOrEqualOperation.superclass.init.call(this, lhs, rhs);
};

GreaterThanOrEqualOperation.prototype.evaluate = function(c) {
	return this.lhs.evaluate(c).greaterthanorequal(this.rhs.evaluate(c));
};

GreaterThanOrEqualOperation.prototype.toString = function() {
	return "(" + this.lhs.toString() + " >= " + this.rhs.toString() + ")";
};

// PlusOperation /////////////////////////////////////////////////////////////

PlusOperation.prototype = new BinaryOperation();
PlusOperation.prototype.constructor = PlusOperation;
PlusOperation.superclass = BinaryOperation.prototype;

function PlusOperation(lhs, rhs) {
	if (arguments.length > 0) {
		this.init(lhs, rhs);
	}
}

PlusOperation.prototype.init = function(lhs, rhs) {
	PlusOperation.superclass.init.call(this, lhs, rhs);
};

PlusOperation.prototype.evaluate = function(c) {
	return this.lhs.evaluate(c).number().plus(this.rhs.evaluate(c).number());
};

PlusOperation.prototype.toString = function() {
	return "(" + this.lhs.toString() + " + " + this.rhs.toString() + ")";
};

// MinusOperation ////////////////////////////////////////////////////////////

MinusOperation.prototype = new BinaryOperation();
MinusOperation.prototype.constructor = MinusOperation;
MinusOperation.superclass = BinaryOperation.prototype;

function MinusOperation(lhs, rhs) {
	if (arguments.length > 0) {
		this.init(lhs, rhs);
	}
}

MinusOperation.prototype.init = function(lhs, rhs) {
	MinusOperation.superclass.init.call(this, lhs, rhs);
};

MinusOperation.prototype.evaluate = function(c) {
	return this.lhs.evaluate(c).number().minus(this.rhs.evaluate(c).number());
};

MinusOperation.prototype.toString = function() {
	return "(" + this.lhs.toString() + " - " + this.rhs.toString() + ")";
};

// MultiplyOperation /////////////////////////////////////////////////////////

MultiplyOperation.prototype = new BinaryOperation();
MultiplyOperation.prototype.constructor = MultiplyOperation;
MultiplyOperation.superclass = BinaryOperation.prototype;

function MultiplyOperation(lhs, rhs) {
	if (arguments.length > 0) {
		this.init(lhs, rhs);
	}
}

MultiplyOperation.prototype.init = function(lhs, rhs) {
	MultiplyOperation.superclass.init.call(this, lhs, rhs);
};

MultiplyOperation.prototype.evaluate = function(c) {
	return this.lhs.evaluate(c).number().multiply(this.rhs.evaluate(c).number());
};

MultiplyOperation.prototype.toString = function() {
	return "(" + this.lhs.toString() + " * " + this.rhs.toString() + ")";
};

// DivOperation //////////////////////////////////////////////////////////////

DivOperation.prototype = new BinaryOperation();
DivOperation.prototype.constructor = DivOperation;
DivOperation.superclass = BinaryOperation.prototype;

function DivOperation(lhs, rhs) {
	if (arguments.length > 0) {
		this.init(lhs, rhs);
	}
}

DivOperation.prototype.init = function(lhs, rhs) {
	DivOperation.superclass.init.call(this, lhs, rhs);
};

DivOperation.prototype.evaluate = function(c) {
	return this.lhs.evaluate(c).number().div(this.rhs.evaluate(c).number());
};

DivOperation.prototype.toString = function() {
	return "(" + this.lhs.toString() + " div " + this.rhs.toString() + ")";
};

// ModOperation //////////////////////////////////////////////////////////////

ModOperation.prototype = new BinaryOperation();
ModOperation.prototype.constructor = ModOperation;
ModOperation.superclass = BinaryOperation.prototype;

function ModOperation(lhs, rhs) {
	if (arguments.length > 0) {
		this.init(lhs, rhs);
	}
}

ModOperation.prototype.init = function(lhs, rhs) {
	ModOperation.superclass.init.call(this, lhs, rhs);
};

ModOperation.prototype.evaluate = function(c) {
	return this.lhs.evaluate(c).number().mod(this.rhs.evaluate(c).number());
};

ModOperation.prototype.toString = function() {
	return "(" + this.lhs.toString() + " mod " + this.rhs.toString() + ")";
};

// BarOperation //////////////////////////////////////////////////////////////

BarOperation.prototype = new BinaryOperation();
BarOperation.prototype.constructor = BarOperation;
BarOperation.superclass = BinaryOperation.prototype;

function BarOperation(lhs, rhs) {
	if (arguments.length > 0) {
		this.init(lhs, rhs);
	}
}

BarOperation.prototype.init = function(lhs, rhs) {
	BarOperation.superclass.init.call(this, lhs, rhs);
};

BarOperation.prototype.evaluate = function(c) {
	return this.lhs.evaluate(c).nodeset().union(this.rhs.evaluate(c).nodeset());
};

BarOperation.prototype.toString = function() {
	return this.lhs.toString() + " | " + this.rhs.toString();
};

// PathExpr //////////////////////////////////////////////////////////////////

PathExpr.prototype = new Expression();
PathExpr.prototype.constructor = PathExpr;
PathExpr.superclass = Expression.prototype;

function PathExpr(filter, filterPreds, locpath) {
	if (arguments.length > 0) {
		this.init(filter, filterPreds, locpath);
	}
}

PathExpr.prototype.init = function(filter, filterPreds, locpath) {
	PathExpr.superclass.init.call(this);
	this.filter = filter;
	this.filterPredicates = filterPreds;
	this.locationPath = locpath;
};

PathExpr.prototype.evaluate = function(c) {
	var nodes;
	var xpc = new XPathContext();
	xpc.variableResolver = c.variableResolver;
	xpc.functionResolver = c.functionResolver;
	xpc.namespaceResolver = c.namespaceResolver;
	xpc.expressionContextNode = c.expressionContextNode;
	xpc.virtualRoot = c.virtualRoot;
	xpc.caseInsensitive = c.caseInsensitive;
	if (this.filter == null) {
		nodes = [ c.contextNode ];
	} else {
		var ns = this.filter.evaluate(c);
		if (!Utilities.instance_of(ns, XNodeSet)) {
			if (this.filterPredicates != null && this.filterPredicates.length > 0 || this.locationPath != null) {
				throw new Error("Path expression filter must evaluate to a nodset if predicates or location path are used");
			}
			return ns;
		}
		nodes = ns.toArray();
		if (this.filterPredicates != null) {
			// apply each of the predicates in turn
			for (var j = 0; j < this.filterPredicates.length; j++) {
				var pred = this.filterPredicates[j];
				var newNodes = [];
				xpc.contextSize = nodes.length;
				for (xpc.contextPosition = 1; xpc.contextPosition <= xpc.contextSize; xpc.contextPosition++) {
					xpc.contextNode = nodes[xpc.contextPosition - 1];
					if (this.predicateMatches(pred, xpc)) {
						newNodes.push(xpc.contextNode);
					}
				}
				nodes = newNodes;
			}
		}
	}
	if (this.locationPath != null) {
		if (this.locationPath.absolute) {
			if (nodes[0].nodeType != 9 /*Node.DOCUMENT_NODE*/) {
				if (xpc.virtualRoot != null) {
					nodes = [ xpc.virtualRoot ];
				} else {
					if (nodes[0].ownerDocument == null) {
						// IE 5.5 doesn't have ownerDocument?
						var n = nodes[0];
						while (n.parentNode != null) {
							n = n.parentNode;
						}
						nodes = [ n ];
					} else {
						nodes = [ nodes[0].ownerDocument ];
					}
				}
			} else {
				nodes = [ nodes[0] ];
			}
		}
		for (var i = 0; i < this.locationPath.steps.length; i++) {
			var step = this.locationPath.steps[i];
			var newNodes = [];
			for (var j = 0; j < nodes.length; j++) {
				xpc.contextNode = nodes[j];
				switch (step.axis) {
					case Step.ANCESTOR:
						// look at all the ancestor nodes
						if (xpc.contextNode === xpc.virtualRoot) {
							break;
						}
						var m;
						if (xpc.contextNode.nodeType == 2 /*Node.ATTRIBUTE_NODE*/) {
							m = this.getOwnerElement(xpc.contextNode);
						} else {
							m = xpc.contextNode.parentNode;
						}
						while (m != null) {
							if (step.nodeTest.matches(m, xpc)) {
								newNodes.push(m);
							}
							if (m === xpc.virtualRoot) {
								break;
							}
							m = m.parentNode;
						}
						break;

					case Step.ANCESTORORSELF:
						// look at all the ancestor nodes and the current node
						for (var m = xpc.contextNode; m != null; m = m.nodeType == 2 /*Node.ATTRIBUTE_NODE*/ ? this.getOwnerElement(m) : m.parentNode) {
							if (step.nodeTest.matches(m, xpc)) {
								newNodes.push(m);
							}
							if (m === xpc.virtualRoot) {
								break;
							}
						}
						break;

					case Step.ATTRIBUTE:
						// look at the attributes
						var nnm = xpc.contextNode.attributes;
						if (nnm != null) {
							for (var k = 0; k < nnm.length; k++) {
								var m = nnm.item(k);
								if (step.nodeTest.matches(m, xpc)) {
									newNodes.push(m);
								}
							}
						}
						break;

					case Step.CHILD:
						// look at all child elements
						for (var m = xpc.contextNode.firstChild; m != null; m = m.nextSibling) {
							if (step.nodeTest.matches(m, xpc)) {
								newNodes.push(m);
							}
						}
						break;

					case Step.DESCENDANT:
						// look at all descendant nodes
						var st = [ xpc.contextNode.firstChild ];
						while (st.length > 0) {
							for (var m = st.pop(); m != null; ) {
								if (step.nodeTest.matches(m, xpc)) {
									newNodes.push(m);
								}
								if (m.firstChild != null) {
									st.push(m.nextSibling);
									m = m.firstChild;
								} else {
									m = m.nextSibling;
								}
							}
						}
						break;

					case Step.DESCENDANTORSELF:
						// look at self
						if (step.nodeTest.matches(xpc.contextNode, xpc)) {
							newNodes.push(xpc.contextNode);
						}
						// look at all descendant nodes
						var st = [ xpc.contextNode.firstChild ];
						while (st.length > 0) {
							for (var m = st.pop(); m != null; ) {
								if (step.nodeTest.matches(m, xpc)) {
									newNodes.push(m);
								}
								if (m.firstChild != null) {
									st.push(m.nextSibling);
									m = m.firstChild;
								} else {
									m = m.nextSibling;
								}
							}
						}
						break;

					case Step.FOLLOWING:
						if (xpc.contextNode === xpc.virtualRoot) {
							break;
						}
						var st = [];
						if (xpc.contextNode.firstChild != null) {
							st.unshift(xpc.contextNode.firstChild);
						} else {
							st.unshift(xpc.contextNode.nextSibling);
						}
						for (var m = xpc.contextNode.parentNode; m != null && m.nodeType != 9 /*Node.DOCUMENT_NODE*/ && m !== xpc.virtualRoot; m = m.parentNode) {
							st.unshift(m.nextSibling);
						}
						do {
							for (var m = st.pop(); m != null; ) {
								if (step.nodeTest.matches(m, xpc)) {
									newNodes.push(m);
								}
								if (m.firstChild != null) {
									st.push(m.nextSibling);
									m = m.firstChild;
								} else {
									m = m.nextSibling;
								}
							}
						} while (st.length > 0);
						break;

					case Step.FOLLOWINGSIBLING:
						if (xpc.contextNode === xpc.virtualRoot) {
							break;
						}
						for (var m = xpc.contextNode.nextSibling; m != null; m = m.nextSibling) {
							if (step.nodeTest.matches(m, xpc)) {
								newNodes.push(m);
							}
						}
						break;

					case Step.NAMESPACE:
						var n = {};
						if (xpc.contextNode.nodeType == 1 /*Node.ELEMENT_NODE*/) {
							n["xml"] = XPath.XML_NAMESPACE_URI;
							n["xmlns"] = XPath.XMLNS_NAMESPACE_URI;
							for (var m = xpc.contextNode; m != null && m.nodeType == 1 /*Node.ELEMENT_NODE*/; m = m.parentNode) {
								for (var k = 0; k < m.attributes.length; k++) {
									var attr = m.attributes.item(k);
									var nm = String(attr.name);
									if (nm == "xmlns") {
										if (n[""] == undefined) {
											n[""] = attr.value;
										}
									} else if (nm.length > 6 && nm.substring(0, 6) == "xmlns:") {
										var pre = nm.substring(6, nm.length);
										if (n[pre] == undefined) {
											n[pre] = attr.value;
										}
									}
								}
							}
							for (var pre in n) {
								var nsn = new NamespaceNode(pre, n[pre], xpc.contextNode);
								if (step.nodeTest.matches(nsn, xpc)) {
									newNodes.push(nsn);
								}
							}
						}
						break;

					case Step.PARENT:
						m = null;
						if (xpc.contextNode !== xpc.virtualRoot) {
							if (xpc.contextNode.nodeType == 2 /*Node.ATTRIBUTE_NODE*/) {
								m = this.getOwnerElement(xpc.contextNode);
							} else {
								m = xpc.contextNode.parentNode;
							}
						}
						if (m != null && step.nodeTest.matches(m, xpc)) {
							newNodes.push(m);
						}
						break;

					case Step.PRECEDING:
						var st;
						if (xpc.virtualRoot != null) {
							st = [ xpc.virtualRoot ];
						} else {
							st = xpc.contextNode.nodeType == 9 /*Node.DOCUMENT_NODE*/
								? [ xpc.contextNode ]
								: [ xpc.contextNode.ownerDocument ];
						}
						outer: while (st.length > 0) {
							for (var m = st.pop(); m != null; ) {
								if (m == xpc.contextNode) {
									break outer;
								}
								if (step.nodeTest.matches(m, xpc)) {
									newNodes.unshift(m);
								}
								if (m.firstChild != null) {
									st.push(m.nextSibling);
									m = m.firstChild;
								} else {
									m = m.nextSibling;
								}
							}
						}
						break;

					case Step.PRECEDINGSIBLING:
						if (xpc.contextNode === xpc.virtualRoot) {
							break;
						}
						for (var m = xpc.contextNode.previousSibling; m != null; m = m.previousSibling) {
							if (step.nodeTest.matches(m, xpc)) {
								newNodes.push(m);
							}
						}
						break;

					case Step.SELF:
						if (step.nodeTest.matches(xpc.contextNode, xpc)) {
							newNodes.push(xpc.contextNode);
						}
						break;

					default:
				}
			}
			nodes = newNodes;
			// apply each of the predicates in turn
			for (var j = 0; j < step.predicates.length; j++) {
				var pred = step.predicates[j];
				var newNodes = [];
				xpc.contextSize = nodes.length;
				for (xpc.contextPosition = 1; xpc.contextPosition <= xpc.contextSize; xpc.contextPosition++) {
					xpc.contextNode = nodes[xpc.contextPosition - 1];
					if (this.predicateMatches(pred, xpc)) {
						newNodes.push(xpc.contextNode);
					} else {
					}
				}
				nodes = newNodes;
			}
		}
	}
	var ns = new XNodeSet();
	ns.addArray(nodes);
	return ns;
};

PathExpr.prototype.predicateMatches = function(pred, c) {
	var res = pred.evaluate(c);
	if (Utilities.instance_of(res, XNumber)) {
		return c.contextPosition == res.numberValue();
	}
	return res.booleanValue();
};

PathExpr.prototype.toString = function() {
	if (this.filter != undefined) {
		var s = this.filter.toString();
		if (Utilities.instance_of(this.filter, XString)) {
			s = "'" + s + "'";
		}
		if (this.filterPredicates != undefined) {
			for (var i = 0; i < this.filterPredicates.length; i++) {
				s = s + "[" + this.filterPredicates[i].toString() + "]";
			}
		}
		if (this.locationPath != undefined) {
			if (!this.locationPath.absolute) {
				s += "/";
			}
			s += this.locationPath.toString();
		}
		return s;
	}
	return this.locationPath.toString();
};

PathExpr.prototype.getOwnerElement = function(n) {
	// DOM 2 has ownerElement
	if (n.ownerElement) {
		return n.ownerElement;
	}
	// DOM 1 Internet Explorer can use selectSingleNode (ironically)
	try {
		if (n.selectSingleNode) {
			return n.selectSingleNode("..");
		}
	} catch (e) {
	}
	// Other DOM 1 implementations must use this egregious search
	var doc = n.nodeType == 9 /*Node.DOCUMENT_NODE*/
			? n
			: n.ownerDocument;
	var elts = doc.getElementsByTagName("*");
	for (var i = 0; i < elts.length; i++) {
		var elt = elts.item(i);
		var nnm = elt.attributes;
		for (var j = 0; j < nnm.length; j++) {
			var an = nnm.item(j);
			if (an === n) {
				return elt;
			}
		}
	}
	return null;
};

// LocationPath //////////////////////////////////////////////////////////////

LocationPath.prototype = new Object();
LocationPath.prototype.constructor = LocationPath;
LocationPath.superclass = Object.prototype;

function LocationPath(abs, steps) {
	if (arguments.length > 0) {
		this.init(abs, steps);
	}
}

LocationPath.prototype.init = function(abs, steps) {
	this.absolute = abs;
	this.steps = steps;
};

LocationPath.prototype.toString = function() {
	var s;
	if (this.absolute) {
		s = "/";
	} else {
		s = "";
	}
	for (var i = 0; i < this.steps.length; i++) {
		if (i != 0) {
			s += "/";
		}
		s += this.steps[i].toString();
	}
	return s;
};

// Step //////////////////////////////////////////////////////////////////////

Step.prototype = new Object();
Step.prototype.constructor = Step;
Step.superclass = Object.prototype;

function Step(axis, nodetest, preds) {
	if (arguments.length > 0) {
		this.init(axis, nodetest, preds);
	}
}

Step.prototype.init = function(axis, nodetest, preds) {
	this.axis = axis;
	this.nodeTest = nodetest;
	this.predicates = preds;
};

Step.prototype.toString = function() {
	var s;
	switch (this.axis) {
		case Step.ANCESTOR:
			s = "ancestor";
			break;
		case Step.ANCESTORORSELF:
			s = "ancestor-or-self";
			break;
		case Step.ATTRIBUTE:
			s = "attribute";
			break;
		case Step.CHILD:
			s = "child";
			break;
		case Step.DESCENDANT:
			s = "descendant";
			break;
		case Step.DESCENDANTORSELF:
			s = "descendant-or-self";
			break;
		case Step.FOLLOWING:
			s = "following";
			break;
		case Step.FOLLOWINGSIBLING:
			s = "following-sibling";
			break;
		case Step.NAMESPACE:
			s = "namespace";
			break;
		case Step.PARENT:
			s = "parent";
			break;
		case Step.PRECEDING:
			s = "preceding";
			break;
		case Step.PRECEDINGSIBLING:
			s = "preceding-sibling";
			break;
		case Step.SELF:
			s = "self";
			break;
	}
	s += "::";
	s += this.nodeTest.toString();
	for (var i = 0; i < this.predicates.length; i++) {
		s += "[" + this.predicates[i].toString() + "]";
	}
	return s;
};

Step.ANCESTOR = 0;
Step.ANCESTORORSELF = 1;
Step.ATTRIBUTE = 2;
Step.CHILD = 3;
Step.DESCENDANT = 4;
Step.DESCENDANTORSELF = 5;
Step.FOLLOWING = 6;
Step.FOLLOWINGSIBLING = 7;
Step.NAMESPACE = 8;
Step.PARENT = 9;
Step.PRECEDING = 10;
Step.PRECEDINGSIBLING = 11;
Step.SELF = 12;

// NodeTest //////////////////////////////////////////////////////////////////

NodeTest.prototype = new Object();
NodeTest.prototype.constructor = NodeTest;
NodeTest.superclass = Object.prototype;

function NodeTest(type, value) {
	if (arguments.length > 0) {
		this.init(type, value);
	}
}

NodeTest.prototype.init = function(type, value) {
	this.type = type;
	this.value = value;
};

NodeTest.prototype.toString = function() {
	switch (this.type) {
		case NodeTest.NAMETESTANY:
			return "*";
		case NodeTest.NAMETESTPREFIXANY:
			return this.value + ":*";
		case NodeTest.NAMETESTRESOLVEDANY:
			return "{" + this.value + "}*";
		case NodeTest.NAMETESTQNAME:
			return this.value;
		case NodeTest.NAMETESTRESOLVEDNAME:
			return "{" + this.namespaceURI + "}" + this.value;
		case NodeTest.COMMENT:
			return "comment()";
		case NodeTest.TEXT:
			return "text()";
		case NodeTest.PI:
			if (this.value != undefined) {
				return "processing-instruction(\"" + this.value + "\")";
			}
			return "processing-instruction()";
		case NodeTest.NODE:
			return "node()";
	}
	return "<unknown nodetest type>";
};

NodeTest.prototype.matches = function(n, xpc) {
	switch (this.type) {
		case NodeTest.NAMETESTANY:
			if (n.nodeType == 2 /*Node.ATTRIBUTE_NODE*/
					|| n.nodeType == 1 /*Node.ELEMENT_NODE*/
					|| n.nodeType == XPathNamespace.XPATH_NAMESPACE_NODE) {
				return true;
			}
			return false;
		case NodeTest.NAMETESTPREFIXANY:
			if ((n.nodeType == 2 /*Node.ATTRIBUTE_NODE*/ || n.nodeType == 1 /*Node.ELEMENT_NODE*/)) {
				var ns = xpc.namespaceResolver.getNamespace(this.value, xpc.expressionContextNode);
				if (ns == null) {
					throw new Error("Cannot resolve QName " + this.value);
				}
				return ns == (n.namespaceURI || '');
			}
			return false;
		case NodeTest.NAMETESTQNAME:
			if (n.nodeType == 2 /*Node.ATTRIBUTE_NODE*/
					|| n.nodeType == 1 /*Node.ELEMENT_NODE*/
					|| n.nodeType == XPathNamespace.XPATH_NAMESPACE_NODE) {
				var test = Utilities.resolveQName(this.value, xpc.namespaceResolver, xpc.expressionContextNode, false);
				if (test[0] == null) {
					throw new Error("Cannot resolve QName " + this.value);
				}
				test[0] = String(test[0]);
				test[1] = String(test[1]);
				if (test[0] == "") {
					test[0] = null;
				}
				var node = [n.namespaceURI || '', n.localName];
				node[0] = String(node[0]);
				node[1] = String(node[1]);
				if (node[0] == "") {
					node[0] = null;
				}
				if (xpc.caseInsensitive) {
					return test[0] == node[0] && String(test[1]).toLowerCase() == String(node[1]).toLowerCase();
				}
				return test[0] == node[0] && test[1] == node[1];
			}
			return false;
		case NodeTest.COMMENT:
			return n.nodeType == 8 /*Node.COMMENT_NODE*/;
		case NodeTest.TEXT:
			return n.nodeType == 3 /*Node.TEXT_NODE*/ || n.nodeType == 4 /*Node.CDATA_SECTION_NODE*/;
		case NodeTest.PI:
			return n.nodeType == 7 /*Node.PROCESSING_INSTRUCTION_NODE*/
				&& (this.value == null || n.nodeName == this.value);
		case NodeTest.NODE:
			return n.nodeType == 9 /*Node.DOCUMENT_NODE*/
				|| n.nodeType == 1 /*Node.ELEMENT_NODE*/
				|| n.nodeType == 2 /*Node.ATTRIBUTE_NODE*/
				|| n.nodeType == 3 /*Node.TEXT_NODE*/
				|| n.nodeType == 4 /*Node.CDATA_SECTION_NODE*/
				|| n.nodeType == 8 /*Node.COMMENT_NODE*/
				|| n.nodeType == 7 /*Node.PROCESSING_INSTRUCTION_NODE*/;
	}
	return false;
};

NodeTest.NAMETESTANY = 0;
NodeTest.NAMETESTPREFIXANY = 1;
NodeTest.NAMETESTQNAME = 2;
NodeTest.COMMENT = 3;
NodeTest.TEXT = 4;
NodeTest.PI = 5;
NodeTest.NODE = 6;

// VariableReference /////////////////////////////////////////////////////////

VariableReference.prototype = new Expression();
VariableReference.prototype.constructor = VariableReference;
VariableReference.superclass = Expression.prototype;

function VariableReference(v) {
	if (arguments.length > 0) {
		this.init(v);
	}
}

VariableReference.prototype.init = function(v) {
	this.variable = v;
};

VariableReference.prototype.toString = function() {
	return "$" + this.variable;
};

VariableReference.prototype.evaluate = function(c) {
	return c.variableResolver.getVariable(this.variable, c);
};

// FunctionCall //////////////////////////////////////////////////////////////

FunctionCall.prototype = new Expression();
FunctionCall.prototype.constructor = FunctionCall;
FunctionCall.superclass = Expression.prototype;

function FunctionCall(fn, args) {
	if (arguments.length > 0) {
		this.init(fn, args);
	}
}

FunctionCall.prototype.init = function(fn, args) {
	this.functionName = fn;
	this.arguments = args;
};

FunctionCall.prototype.toString = function() {
	var s = this.functionName + "(";
	for (var i = 0; i < this.arguments.length; i++) {
		if (i > 0) {
			s += ", ";
		}
		s += this.arguments[i].toString();
	}
	return s + ")";
};

FunctionCall.prototype.evaluate = function(c) {
	var f = c.functionResolver.getFunction(this.functionName, c);
	if (f == undefined) {
		throw new Error("Unknown function " + this.functionName);
	}
	var a = [c].concat(this.arguments);
	return f.apply(c.functionResolver.thisArg, a);
};

// XString ///////////////////////////////////////////////////////////////////

XString.prototype = new Expression();
XString.prototype.constructor = XString;
XString.superclass = Expression.prototype;

function XString(s) {
	if (arguments.length > 0) {
		this.init(s);
	}
}

XString.prototype.init = function(s) {
	this.str = s;
};

XString.prototype.toString = function() {
	return this.str;
};

XString.prototype.evaluate = function(c) {
	return this;
};

XString.prototype.string = function() {
	return this;
};

XString.prototype.number = function() {
	return new XNumber(this.str);
};

XString.prototype.bool = function() {
	return new XBoolean(this.str);
};

XString.prototype.nodeset = function() {
	throw new Error("Cannot convert string to nodeset");
};

XString.prototype.stringValue = function() {
	return this.str;
};

XString.prototype.numberValue = function() {
	return this.number().numberValue();
};

XString.prototype.booleanValue = function() {
	return this.bool().booleanValue();
};

XString.prototype.equals = function(r) {
	if (Utilities.instance_of(r, XBoolean)) {
		return this.bool().equals(r);
	}
	if (Utilities.instance_of(r, XNumber)) {
		return this.number().equals(r);
	}
	if (Utilities.instance_of(r, XNodeSet)) {
		return r.compareWithString(this, Operators.equals);
	}
	return new XBoolean(this.str == r.str);
};

XString.prototype.notequal = function(r) {
	if (Utilities.instance_of(r, XBoolean)) {
		return this.bool().notequal(r);
	}
	if (Utilities.instance_of(r, XNumber)) {
		return this.number().notequal(r);
	}
	if (Utilities.instance_of(r, XNodeSet)) {
		return r.compareWithString(this, Operators.notequal);
	}
	return new XBoolean(this.str != r.str);
};

XString.prototype.lessthan = function(r) {
	if (Utilities.instance_of(r, XNodeSet)) {
		return r.compareWithNumber(this.number(), Operators.greaterthanorequal);
	}
	return this.number().lessthan(r.number());
};

XString.prototype.greaterthan = function(r) {
	if (Utilities.instance_of(r, XNodeSet)) {
		return r.compareWithNumber(this.number(), Operators.lessthanorequal);
	}
	return this.number().greaterthan(r.number());
};

XString.prototype.lessthanorequal = function(r) {
	if (Utilities.instance_of(r, XNodeSet)) {
		return r.compareWithNumber(this.number(), Operators.greaterthan);
	}
	return this.number().lessthanorequal(r.number());
};

XString.prototype.greaterthanorequal = function(r) {
	if (Utilities.instance_of(r, XNodeSet)) {
		return r.compareWithNumber(this.number(), Operators.lessthan);
	}
	return this.number().greaterthanorequal(r.number());
};

// XNumber ///////////////////////////////////////////////////////////////////

XNumber.prototype = new Expression();
XNumber.prototype.constructor = XNumber;
XNumber.superclass = Expression.prototype;

function XNumber(n) {
	if (arguments.length > 0) {
		this.init(n);
	}
}

XNumber.prototype.init = function(n) {
	this.num = Number(n);
};

XNumber.prototype.toString = function() {
	return this.num;
};

XNumber.prototype.evaluate = function(c) {
	return this;
};

XNumber.prototype.string = function() {
	return new XString(this.num);
};

XNumber.prototype.number = function() {
	return this;
};

XNumber.prototype.bool = function() {
	return new XBoolean(this.num);
};

XNumber.prototype.nodeset = function() {
	throw new Error("Cannot convert number to nodeset");
};

XNumber.prototype.stringValue = function() {
	return this.string().stringValue();
};

XNumber.prototype.numberValue = function() {
	return this.num;
};

XNumber.prototype.booleanValue = function() {
	return this.bool().booleanValue();
};

XNumber.prototype.negate = function() {
	return new XNumber(-this.num);
};

XNumber.prototype.equals = function(r) {
	if (Utilities.instance_of(r, XBoolean)) {
		return this.bool().equals(r);
	}
	if (Utilities.instance_of(r, XString)) {
		return this.equals(r.number());
	}
	if (Utilities.instance_of(r, XNodeSet)) {
		return r.compareWithNumber(this, Operators.equals);
	}
	return new XBoolean(this.num == r.num);
};

XNumber.prototype.notequal = function(r) {
	if (Utilities.instance_of(r, XBoolean)) {
		return this.bool().notequal(r);
	}
	if (Utilities.instance_of(r, XString)) {
		return this.notequal(r.number());
	}
	if (Utilities.instance_of(r, XNodeSet)) {
		return r.compareWithNumber(this, Operators.notequal);
	}
	return new XBoolean(this.num != r.num);
};

XNumber.prototype.lessthan = function(r) {
	if (Utilities.instance_of(r, XNodeSet)) {
		return r.compareWithNumber(this, Operators.greaterthanorequal);
	}
	if (Utilities.instance_of(r, XBoolean) || Utilities.instance_of(r, XString)) {
		return this.lessthan(r.number());
	}
	return new XBoolean(this.num < r.num);
};

XNumber.prototype.greaterthan = function(r) {
	if (Utilities.instance_of(r, XNodeSet)) {
		return r.compareWithNumber(this, Operators.lessthanorequal);
	}
	if (Utilities.instance_of(r, XBoolean) || Utilities.instance_of(r, XString)) {
		return this.greaterthan(r.number());
	}
	return new XBoolean(this.num > r.num);
};

XNumber.prototype.lessthanorequal = function(r) {
	if (Utilities.instance_of(r, XNodeSet)) {
		return r.compareWithNumber(this, Operators.greaterthan);
	}
	if (Utilities.instance_of(r, XBoolean) || Utilities.instance_of(r, XString)) {
		return this.lessthanorequal(r.number());
	}
	return new XBoolean(this.num <= r.num);
};

XNumber.prototype.greaterthanorequal = function(r) {
	if (Utilities.instance_of(r, XNodeSet)) {
		return r.compareWithNumber(this, Operators.lessthan);
	}
	if (Utilities.instance_of(r, XBoolean) || Utilities.instance_of(r, XString)) {
		return this.greaterthanorequal(r.number());
	}
	return new XBoolean(this.num >= r.num);
};

XNumber.prototype.plus = function(r) {
	return new XNumber(this.num + r.num);
};

XNumber.prototype.minus = function(r) {
	return new XNumber(this.num - r.num);
};

XNumber.prototype.multiply = function(r) {
	return new XNumber(this.num * r.num);
};

XNumber.prototype.div = function(r) {
	return new XNumber(this.num / r.num);
};

XNumber.prototype.mod = function(r) {
	return new XNumber(this.num % r.num);
};

// XBoolean //////////////////////////////////////////////////////////////////

XBoolean.prototype = new Expression();
XBoolean.prototype.constructor = XBoolean;
XBoolean.superclass = Expression.prototype;

function XBoolean(b) {
	if (arguments.length > 0) {
		this.init(b);
	}
}

XBoolean.prototype.init = function(b) {
	this.b = Boolean(b);
};

XBoolean.prototype.toString = function() {
	return this.b.toString();
};

XBoolean.prototype.evaluate = function(c) {
	return this;
};

XBoolean.prototype.string = function() {
	return new XString(this.b);
};

XBoolean.prototype.number = function() {
	return new XNumber(this.b);
};

XBoolean.prototype.bool = function() {
	return this;
};

XBoolean.prototype.nodeset = function() {
	throw new Error("Cannot convert boolean to nodeset");
};

XBoolean.prototype.stringValue = function() {
	return this.string().stringValue();
};

XBoolean.prototype.numberValue = function() {
	return this.num().numberValue();
};

XBoolean.prototype.booleanValue = function() {
	return this.b;
};

XBoolean.prototype.not = function() {
	return new XBoolean(!this.b);
};

XBoolean.prototype.equals = function(r) {
	if (Utilities.instance_of(r, XString) || Utilities.instance_of(r, XNumber)) {
		return this.equals(r.bool());
	}
	if (Utilities.instance_of(r, XNodeSet)) {
		return r.compareWithBoolean(this, Operators.equals);
	}
	return new XBoolean(this.b == r.b);
};

XBoolean.prototype.notequal = function(r) {
	if (Utilities.instance_of(r, XString) || Utilities.instance_of(r, XNumber)) {
		return this.notequal(r.bool());
	}
	if (Utilities.instance_of(r, XNodeSet)) {
		return r.compareWithBoolean(this, Operators.notequal);
	}
	return new XBoolean(this.b != r.b);
};

XBoolean.prototype.lessthan = function(r) {
	if (Utilities.instance_of(r, XNodeSet)) {
		return r.compareWithNumber(this.number(), Operators.greaterthanorequal);
	}
	return this.number().lessthan(r.number());
};

XBoolean.prototype.greaterthan = function(r) {
	if (Utilities.instance_of(r, XNodeSet)) {
		return r.compareWithNumber(this.number(), Operators.lessthanorequal);
	}
	return this.number().greaterthan(r.number());
};

XBoolean.prototype.lessthanorequal = function(r) {
	if (Utilities.instance_of(r, XNodeSet)) {
		return r.compareWithNumber(this.number(), Operators.greaterthan);
	}
	return this.number().lessthanorequal(r.number());
};

XBoolean.prototype.greaterthanorequal = function(r) {
	if (Utilities.instance_of(r, XNodeSet)) {
		return r.compareWithNumber(this.number(), Operators.lessthan);
	}
	return this.number().greaterthanorequal(r.number());
};

// AVLTree ///////////////////////////////////////////////////////////////////

AVLTree.prototype = new Object();
AVLTree.prototype.constructor = AVLTree;
AVLTree.superclass = Object.prototype;

function AVLTree(n) {
	this.init(n);
}

AVLTree.prototype.init = function(n) {
	this.left = null;
    this.right = null;
	this.node = n;
	this.depth = 1;
};

AVLTree.prototype.balance = function() {
    var ldepth = this.left  == null ? 0 : this.left.depth;
    var rdepth = this.right == null ? 0 : this.right.depth;

	if (ldepth > rdepth + 1) {
        // LR or LL rotation
        var lldepth = this.left.left  == null ? 0 : this.left.left.depth;
        var lrdepth = this.left.right == null ? 0 : this.left.right.depth;

        if (lldepth < lrdepth) {
            // LR rotation consists of a RR rotation of the left child
            this.left.rotateRR();
            // plus a LL rotation of this node, which happens anyway
        }
        this.rotateLL();
    } else if (ldepth + 1 < rdepth) {
        // RR or RL rorarion
		var rrdepth = this.right.right == null ? 0 : this.right.right.depth;
		var rldepth = this.right.left  == null ? 0 : this.right.left.depth;

        if (rldepth > rrdepth) {
            // RR rotation consists of a LL rotation of the right child
            this.right.rotateLL();
            // plus a RR rotation of this node, which happens anyway
        }
        this.rotateRR();
    }
};

AVLTree.prototype.rotateLL = function() {
    // the left side is too long => rotate from the left (_not_ leftwards)
    var nodeBefore = this.node;
    var rightBefore = this.right;
    this.node = this.left.node;
    this.right = this.left;
    this.left = this.left.left;
    this.right.left = this.right.right;
    this.right.right = rightBefore;
    this.right.node = nodeBefore;
    this.right.updateInNewLocation();
    this.updateInNewLocation();
};

AVLTree.prototype.rotateRR = function() {
    // the right side is too long => rotate from the right (_not_ rightwards)
    var nodeBefore = this.node;
    var leftBefore = this.left;
    this.node = this.right.node;
    this.left = this.right;
    this.right = this.right.right;
    this.left.right = this.left.left;
    this.left.left = leftBefore;
    this.left.node = nodeBefore;
    this.left.updateInNewLocation();
    this.updateInNewLocation();
};

AVLTree.prototype.updateInNewLocation = function() {
    this.getDepthFromChildren();
};

AVLTree.prototype.getDepthFromChildren = function() {
    this.depth = this.node == null ? 0 : 1;
    if (this.left != null) {
        this.depth = this.left.depth + 1;
    }
    if (this.right != null && this.depth <= this.right.depth) {
        this.depth = this.right.depth + 1;
    }
};

AVLTree.prototype.order = function(n1, n2) {
	if (n1 === n2) {
		return 0;
	}
	var d1 = 0;
	var d2 = 0;
	for (var m1 = n1; m1 != null; m1 = m1.parentNode) {
		d1++;
	}
	for (var m2 = n2; m2 != null; m2 = m2.parentNode) {
		d2++;
	}
	if (d1 > d2) {
		while (d1 > d2) {
			n1 = n1.parentNode;
			d1--;
		}
		if (n1 == n2) {
			return 1;
		}
	} else if (d2 > d1) {
		while (d2 > d1) {
			n2 = n2.parentNode;
			d2--;
		}
		if (n1 == n2) {
			return -1;
		}
	}
	while (n1.parentNode != n2.parentNode) {
		n1 = n1.parentNode;
		n2 = n2.parentNode;
	}
	while (n1.previousSibling != null && n2.previousSibling != null) {
		n1 = n1.previousSibling;
		n2 = n2.previousSibling;
	}
	if (n1.previousSibling == null) {
		return -1;
	}
	return 1;
};

AVLTree.prototype.add = function(n)  {
	if (n === this.node) {
        return false;
    }

	var o = this.order(n, this.node);

    var ret = false;
    if (o == -1) {
        if (this.left == null) {
            this.left = new AVLTree(n);
            ret = true;
        } else {
            ret = this.left.add(n);
            if (ret) {
                this.balance();
            }
        }
    } else if (o == 1) {
        if (this.right == null) {
            this.right = new AVLTree(n);
            ret = true;
        } else {
            ret = this.right.add(n);
            if (ret) {
                this.balance();
            }
        }
    }

    if (ret) {
        this.getDepthFromChildren();
    }
    return ret;
};

// XNodeSet //////////////////////////////////////////////////////////////////

XNodeSet.prototype = new Expression();
XNodeSet.prototype.constructor = XNodeSet;
XNodeSet.superclass = Expression.prototype;

function XNodeSet() {
	this.init();
}

XNodeSet.prototype.init = function() {
	this.tree = null;
	this.size = 0;
};

XNodeSet.prototype.toString = function() {
	var p = this.first();
	if (p == null) {
		return "";
	}
	return this.stringForNode(p);
};

XNodeSet.prototype.evaluate = function(c) {
	return this;
};

XNodeSet.prototype.string = function() {
	return new XString(this.toString());
};

XNodeSet.prototype.stringValue = function() {
	return this.toString();
};

XNodeSet.prototype.number = function() {
	return new XNumber(this.string());
};

XNodeSet.prototype.numberValue = function() {
	return Number(this.string());
};

XNodeSet.prototype.bool = function() {
	return new XBoolean(this.tree != null);
};

XNodeSet.prototype.booleanValue = function() {
	return this.tree != null;
};

XNodeSet.prototype.nodeset = function() {
	return this;
};

XNodeSet.prototype.stringForNode = function(n) {
	if (n.nodeType == 9 /*Node.DOCUMENT_NODE*/) {
		n = n.documentElement;
	}
	if (n.nodeType == 1 /*Node.ELEMENT_NODE*/) {
		return this.stringForNodeRec(n);
	}
	if (n.isNamespaceNode) {
		return n.namespace;
	}
	return n.nodeValue;
};

XNodeSet.prototype.stringForNodeRec = function(n) {
	var s = "";
	for (var n2 = n.firstChild; n2 != null; n2 = n2.nextSibling) {
		if (n2.nodeType == 3 /*Node.TEXT_NODE*/) {
			s += n2.nodeValue;
		} else if (n2.nodeType == 1 /*Node.ELEMENT_NODE*/) {
			s += this.stringForNodeRec(n2);
		}
	}
	return s;
};

XNodeSet.prototype.first = function() {
	var p = this.tree;
	if (p == null) {
		return null;
	}
	while (p.left != null) {
		p = p.left;
	}
	return p.node;
};

XNodeSet.prototype.add = function(n) {
    var added;
    if (this.tree == null) {
        this.tree = new AVLTree(n);
        added = true;
    } else {
        added = this.tree.add(n);
    }
    if (added) {
        this.size++;
    }
};

XNodeSet.prototype.addArray = function(ns) {
	for (var i = 0; i < ns.length; i++) {
		this.add(ns[i]);
	}
};

XNodeSet.prototype.toArray = function() {
	var a = [];
	this.toArrayRec(this.tree, a);
	return a;
};

XNodeSet.prototype.toArrayRec = function(t, a) {
	if (t != null) {
		this.toArrayRec(t.left, a);
		a.push(t.node);
		this.toArrayRec(t.right, a);
	}
};

XNodeSet.prototype.compareWithString = function(r, o) {
	var a = this.toArray();
	for (var i = 0; i < a.length; i++) {
		var n = a[i];
		var l = new XString(this.stringForNode(n));
		var res = o(l, r);
		if (res.booleanValue()) {
			return res;
		}
	}
	return new XBoolean(false);
};

XNodeSet.prototype.compareWithNumber = function(r, o) {
	var a = this.toArray();
	for (var i = 0; i < a.length; i++) {
		var n = a[i];
		var l = new XNumber(this.stringForNode(n));
		var res = o(l, r);
		if (res.booleanValue()) {
			return res;
		}
	}
	return new XBoolean(false);
};

XNodeSet.prototype.compareWithBoolean = function(r, o) {
	return o(this.bool(), r);
};

XNodeSet.prototype.compareWithNodeSet = function(r, o) {
	var a = this.toArray();
	for (var i = 0; i < a.length; i++) {
		var n = a[i];
		var l = new XString(this.stringForNode(n));
		var b = r.toArray();
		for (var j = 0; j < b.length; j++) {
			var n2 = b[j];
			var r = new XString(this.stringForNode(n2));
			var res = o(l, r);
			if (res.booleanValue()) {
				return res;
			}
		}
	}
	return new XBoolean(false);
};

XNodeSet.prototype.equals = function(r) {
	if (Utilities.instance_of(r, XString)) {
		return this.compareWithString(r, Operators.equals);
	}
	if (Utilities.instance_of(r, XNumber)) {
		return this.compareWithNumber(r, Operators.equals);
	}
	if (Utilities.instance_of(r, XBoolean)) {
		return this.compareWithBoolean(r, Operators.equals);
	}
	return this.compareWithNodeSet(r, Operators.equals);
};

XNodeSet.prototype.notequal = function(r) {
	if (Utilities.instance_of(r, XString)) {
		return this.compareWithString(r, Operators.notequal);
	}
	if (Utilities.instance_of(r, XNumber)) {
		return this.compareWithNumber(r, Operators.notequal);
	}
	if (Utilities.instance_of(r, XBoolean)) {
		return this.compareWithBoolean(r, Operators.notequal);
	}
	return this.compareWithNodeSet(r, Operators.notequal);
};

XNodeSet.prototype.lessthan = function(r) {
	if (Utilities.instance_of(r, XString)) {
		return this.compareWithNumber(r.number(), Operators.lessthan);
	}
	if (Utilities.instance_of(r, XNumber)) {
		return this.compareWithNumber(r, Operators.lessthan);
	}
	if (Utilities.instance_of(r, XBoolean)) {
		return this.compareWithBoolean(r, Operators.lessthan);
	}
	return this.compareWithNodeSet(r, Operators.lessthan);
};

XNodeSet.prototype.greaterthan = function(r) {
	if (Utilities.instance_of(r, XString)) {
		return this.compareWithNumber(r.number(), Operators.greaterthan);
	}
	if (Utilities.instance_of(r, XNumber)) {
		return this.compareWithNumber(r, Operators.greaterthan);
	}
	if (Utilities.instance_of(r, XBoolean)) {
		return this.compareWithBoolean(r, Operators.greaterthan);
	}
	return this.compareWithNodeSet(r, Operators.greaterthan);
};

XNodeSet.prototype.lessthanorequal = function(r) {
	if (Utilities.instance_of(r, XString)) {
		return this.compareWithNumber(r.number(), Operators.lessthanorequal);
	}
	if (Utilities.instance_of(r, XNumber)) {
		return this.compareWithNumber(r, Operators.lessthanorequal);
	}
	if (Utilities.instance_of(r, XBoolean)) {
		return this.compareWithBoolean(r, Operators.lessthanorequal);
	}
	return this.compareWithNodeSet(r, Operators.lessthanorequal);
};

XNodeSet.prototype.greaterthanorequal = function(r) {
	if (Utilities.instance_of(r, XString)) {
		return this.compareWithNumber(r.number(), Operators.greaterthanorequal);
	}
	if (Utilities.instance_of(r, XNumber)) {
		return this.compareWithNumber(r, Operators.greaterthanorequal);
	}
	if (Utilities.instance_of(r, XBoolean)) {
		return this.compareWithBoolean(r, Operators.greaterthanorequal);
	}
	return this.compareWithNodeSet(r, Operators.greaterthanorequal);
};

XNodeSet.prototype.union = function(r) {
	var ns = new XNodeSet();
	ns.tree = this.tree;
	ns.size = this.size;
	ns.addArray(r.toArray());
	return ns;
};

// XPathNamespace ////////////////////////////////////////////////////////////

XPathNamespace.prototype = new Object();
XPathNamespace.prototype.constructor = XPathNamespace;
XPathNamespace.superclass = Object.prototype;

function XPathNamespace(pre, ns, p) {
	this.isXPathNamespace = true;
	this.ownerDocument = p.ownerDocument;
	this.nodeName = "#namespace";
	this.prefix = pre;
	this.localName = pre;
	this.namespaceURI = ns;
	this.nodeValue = ns;
	this.ownerElement = p;
	this.nodeType = XPathNamespace.XPATH_NAMESPACE_NODE;
}

XPathNamespace.prototype.toString = function() {
	return "{ \"" + this.prefix + "\", \"" + this.namespaceURI + "\" }";
};

// Operators /////////////////////////////////////////////////////////////////

var Operators = new Object();

Operators.equals = function(l, r) {
	return l.equals(r);
};

Operators.notequal = function(l, r) {
	return l.notequal(r);
};

Operators.lessthan = function(l, r) {
	return l.lessthan(r);
};

Operators.greaterthan = function(l, r) {
	return l.greaterthan(r);
};

Operators.lessthanorequal = function(l, r) {
	return l.lessthanorequal(r);
};

Operators.greaterthanorequal = function(l, r) {
	return l.greaterthanorequal(r);
};

// XPathContext //////////////////////////////////////////////////////////////

XPathContext.prototype = new Object();
XPathContext.prototype.constructor = XPathContext;
XPathContext.superclass = Object.prototype;

function XPathContext(vr, nr, fr) {
	this.variableResolver = vr != null ? vr : new VariableResolver();
	this.namespaceResolver = nr != null ? nr : new NamespaceResolver();
	this.functionResolver = fr != null ? fr : new FunctionResolver();
}

// VariableResolver //////////////////////////////////////////////////////////

VariableResolver.prototype = new Object();
VariableResolver.prototype.constructor = VariableResolver;
VariableResolver.superclass = Object.prototype;

function VariableResolver() {
}

VariableResolver.prototype.getVariable = function(vn, c) {
	var parts = Utilities.splitQName(vn);
	if (parts[0] != null) {
		parts[0] = c.namespaceResolver.getNamespace(parts[0], c.expressionContextNode);
        if (parts[0] == null) {
            throw new Error("Cannot resolve QName " + fn);
        }
	}
	return this.getVariableWithName(parts[0], parts[1], c.expressionContextNode);
};

VariableResolver.prototype.getVariableWithName = function(ns, ln, c) {
	return null;
};

// FunctionResolver //////////////////////////////////////////////////////////

FunctionResolver.prototype = new Object();
FunctionResolver.prototype.constructor = FunctionResolver;
FunctionResolver.superclass = Object.prototype;

function FunctionResolver(thisArg) {
	this.thisArg = thisArg != null ? thisArg : Functions;
	this.functions = new Object();
	this.addStandardFunctions();
}

FunctionResolver.prototype.addStandardFunctions = function() {
	this.functions["{}last"] = Functions.last;
	this.functions["{}position"] = Functions.position;
	this.functions["{}count"] = Functions.count;
	this.functions["{}id"] = Functions.id;
	this.functions["{}local-name"] = Functions.localName;
	this.functions["{}namespace-uri"] = Functions.namespaceURI;
	this.functions["{}name"] = Functions.name;
	this.functions["{}string"] = Functions.string;
	this.functions["{}concat"] = Functions.concat;
	this.functions["{}starts-with"] = Functions.startsWith;
	this.functions["{}contains"] = Functions.contains;
	this.functions["{}substring-before"] = Functions.substringBefore;
	this.functions["{}substring-after"] = Functions.substringAfter;
	this.functions["{}substring"] = Functions.substring;
	this.functions["{}string-length"] = Functions.stringLength;
	this.functions["{}normalize-space"] = Functions.normalizeSpace;
	this.functions["{}translate"] = Functions.translate;
	this.functions["{}boolean"] = Functions.boolean_;
	this.functions["{}not"] = Functions.not;
	this.functions["{}true"] = Functions.true_;
	this.functions["{}false"] = Functions.false_;
	this.functions["{}lang"] = Functions.lang;
	this.functions["{}number"] = Functions.number;
	this.functions["{}sum"] = Functions.sum;
	this.functions["{}floor"] = Functions.floor;
	this.functions["{}ceiling"] = Functions.ceiling;
	this.functions["{}round"] = Functions.round;
};

FunctionResolver.prototype.addFunction = function(ns, ln, f) {
	this.functions["{" + ns + "}" + ln] = f;
};

FunctionResolver.prototype.getFunction = function(fn, c) {
	var parts = Utilities.resolveQName(fn, c.namespaceResolver, c.contextNode, false);
    if (parts[0] == null) {
        throw new Error("Cannot resolve QName " + fn);
    }
	return this.getFunctionWithName(parts[0], parts[1], c.contextNode);
};

FunctionResolver.prototype.getFunctionWithName = function(ns, ln, c) {
	return this.functions["{" + ns + "}" + ln];
};

// NamespaceResolver /////////////////////////////////////////////////////////

NamespaceResolver.prototype = new Object();
NamespaceResolver.prototype.constructor = NamespaceResolver;
NamespaceResolver.superclass = Object.prototype;

function NamespaceResolver() {
}

NamespaceResolver.prototype.getNamespace = function(prefix, n) {
	if (prefix == "xml") {
		return XPath.XML_NAMESPACE_URI;
	} else if (prefix == "xmlns") {
		return XPath.XMLNS_NAMESPACE_URI;
	}
	if (n.nodeType == 9 /*Node.DOCUMENT_NODE*/) {
		n = n.documentElement;
	} else if (n.nodeType == 2 /*Node.ATTRIBUTE_NODE*/) {
		n = PathExpr.prototype.getOwnerElement(n);
	} else if (n.nodeType != 1 /*Node.ELEMENT_NODE*/) {
		n = n.parentNode;
	}
	while (n != null && n.nodeType == 1 /*Node.ELEMENT_NODE*/) {
		var nnm = n.attributes;
		for (var i = 0; i < nnm.length; i++) {
			var a = nnm.item(i);
			var aname = a.nodeName;
			if (aname == "xmlns" && prefix == ""
					|| aname == "xmlns:" + prefix) {
				return String(a.nodeValue);
			}
		}
		n = n.parentNode;
	}
	return null;
};

// Functions /////////////////////////////////////////////////////////////////

Functions = new Object();

Functions.last = function() {
	var c = arguments[0];
	if (arguments.length != 1) {
		throw new Error("Function last expects ()");
	}
	return new XNumber(c.contextSize);
};

Functions.position = function() {
	var c = arguments[0];
	if (arguments.length != 1) {
		throw new Error("Function position expects ()");
	}
	return new XNumber(c.contextPosition);
};

Functions.count = function() {
	var c = arguments[0];
	var ns;
	if (arguments.length != 2 || !Utilities.instance_of(ns = arguments[1].evaluate(c), XNodeSet)) {
		throw new Error("Function count expects (node-set)");
	}
	return new XNumber(ns.size);
};

Functions.id = function() {
	var c = arguments[0];
	var id;
	if (arguments.length != 2) {
		throw new Error("Function id expects (object)");
	}
	id = arguments[1].evaluate(c);
	if (Utilities.instance_of(id, XNodeSet)) {
		id = id.toArray().join(" ");
	} else {
		id = id.stringValue();
	}
	var ids = id.split(/[\x0d\x0a\x09\x20]+/);
	var count = 0;
	var ns = new XNodeSet();
	var doc = c.contextNode.nodeType == 9 /*Node.DOCUMENT_NODE*/
			? c.contextNode
			: c.contextNode.ownerDocument;
	for (var i = 0; i < ids.length; i++) {
		var n;
		if (doc.getElementById) {
			n = doc.getElementById(ids[i]);
		} else {
			n = Utilities.getElementById(doc, ids[i]);
		}
		if (n != null) {
			ns.add(n);
			count++;
		}
	}
	return ns;
};

Functions.localName = function() {
	var c = arguments[0];
	var n;
	if (arguments.length == 1) {
		n = c.contextNode;
	} else if (arguments.length == 2) {
		n = arguments[1].evaluate(c).first();
	} else {
		throw new Error("Function local-name expects (node-set?)");
	}
	if (n == null) {
		return new XString("");
	}
	return new XString(n.localName ? n.localName : n.baseName);
};

Functions.namespaceURI = function() {
	var c = arguments[0];
	var n;
	if (arguments.length == 1) {
		n = c.contextNode;
	} else if (arguments.length == 2) {
		n = arguments[1].evaluate(c).first();
	} else {
		throw new Error("Function namespace-uri expects (node-set?)");
	}
	if (n == null) {
		return new XString("");
	}
	return new XString(n.namespaceURI);
};

Functions.name = function() {
	var c = arguments[0];
	var n;
	if (arguments.length == 1) {
		n = c.contextNode;
	} else if (arguments.length == 2) {
		n = arguments[1].evaluate(c).first();
	} else {
		throw new Error("Function name expects (node-set?)");
	}
	if (n == null) {
		return new XString("");
	}
	if (n.nodeType == 1 /*Node.ELEMENT_NODE*/ || n.nodeType == 2 /*Node.ATTRIBUTE_NODE*/) {
		return new XString(n.nodeName);
	} else if (n.localName == null) {
		return new XString("");
	} else {
		return new XString(n.localName);
	}
};

Functions.string = function() {
	var c = arguments[0];
	if (arguments.length == 1) {
		return XNodeSet.prototype.stringForNode(c.contextNode);
	} else if (arguments.length == 2) {
		return arguments[1].evaluate(c).string();
	}
	throw new Error("Function string expects (object?)");
};

Functions.concat = function() {
	var c = arguments[0];
	if (arguments.length < 3) {
		throw new Error("Function concat expects (string, string, string*)");
	}
	var s = "";
	for (var i = 1; i < arguments.length; i++) {
		s += arguments[i].evaluate(c).stringValue();
	}
	return new XString(s);
};

Functions.startsWith = function() {
	var c = arguments[0];
	if (arguments.length != 3) {
		throw new Error("Function startsWith expects (string, string)");
	}
	var s1 = arguments[1].evaluate(c).stringValue();
	var s2 = arguments[2].evaluate(c).stringValue();
	return new XBoolean(s1.substring(0, s2.length) == s2);
};

Functions.contains = function() {
	var c = arguments[0];
	if (arguments.length != 3) {
		throw new Error("Function contains expects (string, string)");
	}
	var s1 = arguments[1].evaluate(c).stringValue();
	var s2 = arguments[2].evaluate(c).stringValue();
	return new XBoolean(s1.indexOf(s2) != -1);
};

Functions.substringBefore = function() {
	var c = arguments[0];
	if (arguments.length != 3) {
		throw new Error("Function substring-before expects (string, string)");
	}
	var s1 = arguments[1].evaluate(c).stringValue();
	var s2 = arguments[2].evaluate(c).stringValue();
	return new XString(s1.substring(0, s1.indexOf(s2)));
};

Functions.substringAfter = function() {
	var c = arguments[0];
	if (arguments.length != 3) {
		throw new Error("Function substring-after expects (string, string)");
	}
	var s1 = arguments[1].evaluate(c).stringValue();
	var s2 = arguments[2].evaluate(c).stringValue();
	if (s2.length == 0) {
		return new XString(s1);
	}
	var i = s1.indexOf(s2);
	if (i == -1) {
		return new XString("");
	}
	return new XString(s1.substring(s1.indexOf(s2) + 1));
};

Functions.substring = function() {
	var c = arguments[0];
	if (!(arguments.length == 3 || arguments.length == 4)) {
		throw new Error("Function substring expects (string, number, number?)");
	}
	var s = arguments[1].evaluate(c).stringValue();
	var n1 = Math.round(arguments[2].evaluate(c).numberValue()) - 1;
	var n2 = arguments.length == 4 ? n1 + Math.round(arguments[3].evaluate(c).numberValue()) : undefined;
	return new XString(s.substring(n1, n2));
};

Functions.stringLength = function() {
	var c = arguments[0];
	var s;
	if (arguments.length == 1) {
		s = XNodeSet.prototype.stringForNode(c.contextNode);
	} else if (arguments.length == 2) {
		s = arguments[1].evaluate(c).stringValue();
	} else {
		throw new Error("Function string-length expects (string?)");
	}
	return new XNumber(s.length);
};

Functions.normalizeSpace = function() {
	var c = arguments[0];
	var s;
	if (arguments.length == 1) {
		s = XNodeSet.prototype.stringForNode(c.contextNode);
	} else if (arguments.length == 2) {
		s = arguments[1].evaluate(c).stringValue();
	} else {
		throw new Error("Function normalize-space expects (string?)");
	}
	var i = 0;
	var j = s.length - 1;
	while (Utilities.isSpace(s.charCodeAt(j))) {
		j--;
	}
	var t = "";
	while (i <= j && Utilities.isSpace(s.charCodeAt(i))) {
		i++;
	}
	while (i <= j) {
		if (Utilities.isSpace(s.charCodeAt(i))) {
			t += " ";
			while (i <= j && Utilities.isSpace(s.charCodeAt(i))) {
				i++;
			}
		} else {
			t += s.charAt(i);
			i++;
		}
	}
	return new XString(t);
};

Functions.translate = function() {
	var c = arguments[0];
	if (arguments.length != 4) {
		throw new Error("Function translate expects (string, string, string)");
	}
	var s1 = arguments[1].evaluate(c).stringValue();
	var s2 = arguments[2].evaluate(c).stringValue();
	var s3 = arguments[3].evaluate(c).stringValue();
	var map = [];
	for (var i = 0; i < s2.length; i++) {
		var j = s2.charCodeAt(i);
		if (map[j] == undefined) {
			var k = i > s3.length ? "" : s3.charAt(i);
			map[j] = k;
		}
	}
	var t = "";
	for (var i = 0; i < s1.length; i++) {
		var c = s1.charCodeAt(i);
		var r = map[c];
		if (r == undefined) {
			t += s1.charAt(i);
		} else {
			t += r;
		}
	}
	return new XString(t);
};

Functions.boolean_ = function() {
	var c = arguments[0];
	if (arguments.length != 2) {
		throw new Error("Function boolean expects (object)");
	}
	return arguments[1].evaluate(c).bool();
};

Functions.not = function() {
	var c = arguments[0];
	if (arguments.length != 2) {
		throw new Error("Function not expects (object)");
	}
	return arguments[1].evaluate(c).bool().not();
};

Functions.true_ = function() {
	if (arguments.length != 1) {
		throw new Error("Function true expects ()");
	}
	return new XBoolean(true);
};

Functions.false_ = function() {
	if (arguments.length != 1) {
		throw new Error("Function false expects ()");
	}
	return new XBoolean(false);
};

Functions.lang = function() {
	var c = arguments[0];
	if (arguments.length != 2) {
		throw new Error("Function lang expects (string)");
	}
	var lang;
	for (var n = c.contextNode; n != null && n.nodeType != 9 /*Node.DOCUMENT_NODE*/; n = n.parentNode) {
		var a = n.getAttributeNS(XPath.XML_NAMESPACE_URI, "lang");
		if (a != null) {
			lang = String(a);
			break;
		}
	}
	if (lang == null) {
		return new XBoolean(false);
	}
	var s = arguments[1].evaluate(c).stringValue();
	return new XBoolean(lang.substring(0, s.length) == s
				&& (lang.length == s.length || lang.charAt(s.length) == '-'));
};

Functions.number = function() {
	var c = arguments[0];
	if (!(arguments.length == 1 || arguments.length == 2)) {
		throw new Error("Function number expects (object?)");
	}
	if (arguments.length == 1) {
		return new XNumber(XNodeSet.prototype.stringForNode(c.contextNode));
	}
	return arguments[1].evaluate(c).number();
};

Functions.sum = function() {
	var c = arguments[0];
	var ns;
	if (arguments.length != 2 || !Utilities.instance_of((ns = arguments[1].evaluate(c)), XNodeSet)) {
		throw new Error("Function sum expects (node-set)");
	}
	ns = ns.toArray();
	var n = 0;
	for (var i = 0; i < ns.length; i++) {
		n += new XNumber(XNodeSet.prototype.stringForNode(ns[i])).numberValue();
	}
	return new XNumber(n);
};

Functions.floor = function() {
	var c = arguments[0];
	if (arguments.length != 2) {
		throw new Error("Function floor expects (number)");
	}
	return new XNumber(Math.floor(arguments[1].evaluate(c).numberValue()));
};

Functions.ceiling = function() {
	var c = arguments[0];
	if (arguments.length != 2) {
		throw new Error("Function ceiling expects (number)");
	}
	return new XNumber(Math.ceil(arguments[1].evaluate(c).numberValue()));
};

Functions.round = function() {
	var c = arguments[0];
	if (arguments.length != 2) {
		throw new Error("Function round expects (number)");
	}
	return new XNumber(Math.round(arguments[1].evaluate(c).numberValue()));
};

// Utilities /////////////////////////////////////////////////////////////////

Utilities = new Object();

Utilities.splitQName = function(qn) {
	var i = qn.indexOf(":");
	if (i == -1) {
		return [ null, qn ];
	}
	return [ qn.substring(0, i), qn.substring(i + 1) ];
};

Utilities.resolveQName = function(qn, nr, n, useDefault) {
	var parts = Utilities.splitQName(qn);
	if (parts[0] != null) {
		parts[0] = nr.getNamespace(parts[0], n);
	} else {
		if (useDefault) {
			parts[0] = nr.getNamespace("", n);
			if (parts[0] == null) {
				parts[0] = "";
			}
		} else {
			parts[0] = "";
		}
	}
	return parts;
};

Utilities.isSpace = function(c) {
	return c == 0x9 || c == 0xd || c == 0xa || c == 0x20;
};

Utilities.isLetter = function(c) {
	return c >= 0x0041 && c <= 0x005A ||
		c >= 0x0061 && c <= 0x007A ||
		c >= 0x00C0 && c <= 0x00D6 ||
		c >= 0x00D8 && c <= 0x00F6 ||
		c >= 0x00F8 && c <= 0x00FF ||
		c >= 0x0100 && c <= 0x0131 ||
		c >= 0x0134 && c <= 0x013E ||
		c >= 0x0141 && c <= 0x0148 ||
		c >= 0x014A && c <= 0x017E ||
		c >= 0x0180 && c <= 0x01C3 ||
		c >= 0x01CD && c <= 0x01F0 ||
		c >= 0x01F4 && c <= 0x01F5 ||
		c >= 0x01FA && c <= 0x0217 ||
		c >= 0x0250 && c <= 0x02A8 ||
		c >= 0x02BB && c <= 0x02C1 ||
		c == 0x0386 ||
		c >= 0x0388 && c <= 0x038A ||
		c == 0x038C ||
		c >= 0x038E && c <= 0x03A1 ||
		c >= 0x03A3 && c <= 0x03CE ||
		c >= 0x03D0 && c <= 0x03D6 ||
		c == 0x03DA ||
		c == 0x03DC ||
		c == 0x03DE ||
		c == 0x03E0 ||
		c >= 0x03E2 && c <= 0x03F3 ||
		c >= 0x0401 && c <= 0x040C ||
		c >= 0x040E && c <= 0x044F ||
		c >= 0x0451 && c <= 0x045C ||
		c >= 0x045E && c <= 0x0481 ||
		c >= 0x0490 && c <= 0x04C4 ||
		c >= 0x04C7 && c <= 0x04C8 ||
		c >= 0x04CB && c <= 0x04CC ||
		c >= 0x04D0 && c <= 0x04EB ||
		c >= 0x04EE && c <= 0x04F5 ||
		c >= 0x04F8 && c <= 0x04F9 ||
		c >= 0x0531 && c <= 0x0556 ||
		c == 0x0559 ||
		c >= 0x0561 && c <= 0x0586 ||
		c >= 0x05D0 && c <= 0x05EA ||
		c >= 0x05F0 && c <= 0x05F2 ||
		c >= 0x0621 && c <= 0x063A ||
		c >= 0x0641 && c <= 0x064A ||
		c >= 0x0671 && c <= 0x06B7 ||
		c >= 0x06BA && c <= 0x06BE ||
		c >= 0x06C0 && c <= 0x06CE ||
		c >= 0x06D0 && c <= 0x06D3 ||
		c == 0x06D5 ||
		c >= 0x06E5 && c <= 0x06E6 ||
		c >= 0x0905 && c <= 0x0939 ||
		c == 0x093D ||
		c >= 0x0958 && c <= 0x0961 ||
		c >= 0x0985 && c <= 0x098C ||
		c >= 0x098F && c <= 0x0990 ||
		c >= 0x0993 && c <= 0x09A8 ||
		c >= 0x09AA && c <= 0x09B0 ||
		c == 0x09B2 ||
		c >= 0x09B6 && c <= 0x09B9 ||
		c >= 0x09DC && c <= 0x09DD ||
		c >= 0x09DF && c <= 0x09E1 ||
		c >= 0x09F0 && c <= 0x09F1 ||
		c >= 0x0A05 && c <= 0x0A0A ||
		c >= 0x0A0F && c <= 0x0A10 ||
		c >= 0x0A13 && c <= 0x0A28 ||
		c >= 0x0A2A && c <= 0x0A30 ||
		c >= 0x0A32 && c <= 0x0A33 ||
		c >= 0x0A35 && c <= 0x0A36 ||
		c >= 0x0A38 && c <= 0x0A39 ||
		c >= 0x0A59 && c <= 0x0A5C ||
		c == 0x0A5E ||
		c >= 0x0A72 && c <= 0x0A74 ||
		c >= 0x0A85 && c <= 0x0A8B ||
		c == 0x0A8D ||
		c >= 0x0A8F && c <= 0x0A91 ||
		c >= 0x0A93 && c <= 0x0AA8 ||
		c >= 0x0AAA && c <= 0x0AB0 ||
		c >= 0x0AB2 && c <= 0x0AB3 ||
		c >= 0x0AB5 && c <= 0x0AB9 ||
		c == 0x0ABD ||
		c == 0x0AE0 ||
		c >= 0x0B05 && c <= 0x0B0C ||
		c >= 0x0B0F && c <= 0x0B10 ||
		c >= 0x0B13 && c <= 0x0B28 ||
		c >= 0x0B2A && c <= 0x0B30 ||
		c >= 0x0B32 && c <= 0x0B33 ||
		c >= 0x0B36 && c <= 0x0B39 ||
		c == 0x0B3D ||
		c >= 0x0B5C && c <= 0x0B5D ||
		c >= 0x0B5F && c <= 0x0B61 ||
		c >= 0x0B85 && c <= 0x0B8A ||
		c >= 0x0B8E && c <= 0x0B90 ||
		c >= 0x0B92 && c <= 0x0B95 ||
		c >= 0x0B99 && c <= 0x0B9A ||
		c == 0x0B9C ||
		c >= 0x0B9E && c <= 0x0B9F ||
		c >= 0x0BA3 && c <= 0x0BA4 ||
		c >= 0x0BA8 && c <= 0x0BAA ||
		c >= 0x0BAE && c <= 0x0BB5 ||
		c >= 0x0BB7 && c <= 0x0BB9 ||
		c >= 0x0C05 && c <= 0x0C0C ||
		c >= 0x0C0E && c <= 0x0C10 ||
		c >= 0x0C12 && c <= 0x0C28 ||
		c >= 0x0C2A && c <= 0x0C33 ||
		c >= 0x0C35 && c <= 0x0C39 ||
		c >= 0x0C60 && c <= 0x0C61 ||
		c >= 0x0C85 && c <= 0x0C8C ||
		c >= 0x0C8E && c <= 0x0C90 ||
		c >= 0x0C92 && c <= 0x0CA8 ||
		c >= 0x0CAA && c <= 0x0CB3 ||
		c >= 0x0CB5 && c <= 0x0CB9 ||
		c == 0x0CDE ||
		c >= 0x0CE0 && c <= 0x0CE1 ||
		c >= 0x0D05 && c <= 0x0D0C ||
		c >= 0x0D0E && c <= 0x0D10 ||
		c >= 0x0D12 && c <= 0x0D28 ||
		c >= 0x0D2A && c <= 0x0D39 ||
		c >= 0x0D60 && c <= 0x0D61 ||
		c >= 0x0E01 && c <= 0x0E2E ||
		c == 0x0E30 ||
		c >= 0x0E32 && c <= 0x0E33 ||
		c >= 0x0E40 && c <= 0x0E45 ||
		c >= 0x0E81 && c <= 0x0E82 ||
		c == 0x0E84 ||
		c >= 0x0E87 && c <= 0x0E88 ||
		c == 0x0E8A ||
		c == 0x0E8D ||
		c >= 0x0E94 && c <= 0x0E97 ||
		c >= 0x0E99 && c <= 0x0E9F ||
		c >= 0x0EA1 && c <= 0x0EA3 ||
		c == 0x0EA5 ||
		c == 0x0EA7 ||
		c >= 0x0EAA && c <= 0x0EAB ||
		c >= 0x0EAD && c <= 0x0EAE ||
		c == 0x0EB0 ||
		c >= 0x0EB2 && c <= 0x0EB3 ||
		c == 0x0EBD ||
		c >= 0x0EC0 && c <= 0x0EC4 ||
		c >= 0x0F40 && c <= 0x0F47 ||
		c >= 0x0F49 && c <= 0x0F69 ||
		c >= 0x10A0 && c <= 0x10C5 ||
		c >= 0x10D0 && c <= 0x10F6 ||
		c == 0x1100 ||
		c >= 0x1102 && c <= 0x1103 ||
		c >= 0x1105 && c <= 0x1107 ||
		c == 0x1109 ||
		c >= 0x110B && c <= 0x110C ||
		c >= 0x110E && c <= 0x1112 ||
		c == 0x113C ||
		c == 0x113E ||
		c == 0x1140 ||
		c == 0x114C ||
		c == 0x114E ||
		c == 0x1150 ||
		c >= 0x1154 && c <= 0x1155 ||
		c == 0x1159 ||
		c >= 0x115F && c <= 0x1161 ||
		c == 0x1163 ||
		c == 0x1165 ||
		c == 0x1167 ||
		c == 0x1169 ||
		c >= 0x116D && c <= 0x116E ||
		c >= 0x1172 && c <= 0x1173 ||
		c == 0x1175 ||
		c == 0x119E ||
		c == 0x11A8 ||
		c == 0x11AB ||
		c >= 0x11AE && c <= 0x11AF ||
		c >= 0x11B7 && c <= 0x11B8 ||
		c == 0x11BA ||
		c >= 0x11BC && c <= 0x11C2 ||
		c == 0x11EB ||
		c == 0x11F0 ||
		c == 0x11F9 ||
		c >= 0x1E00 && c <= 0x1E9B ||
		c >= 0x1EA0 && c <= 0x1EF9 ||
		c >= 0x1F00 && c <= 0x1F15 ||
		c >= 0x1F18 && c <= 0x1F1D ||
		c >= 0x1F20 && c <= 0x1F45 ||
		c >= 0x1F48 && c <= 0x1F4D ||
		c >= 0x1F50 && c <= 0x1F57 ||
		c == 0x1F59 ||
		c == 0x1F5B ||
		c == 0x1F5D ||
		c >= 0x1F5F && c <= 0x1F7D ||
		c >= 0x1F80 && c <= 0x1FB4 ||
		c >= 0x1FB6 && c <= 0x1FBC ||
		c == 0x1FBE ||
		c >= 0x1FC2 && c <= 0x1FC4 ||
		c >= 0x1FC6 && c <= 0x1FCC ||
		c >= 0x1FD0 && c <= 0x1FD3 ||
		c >= 0x1FD6 && c <= 0x1FDB ||
		c >= 0x1FE0 && c <= 0x1FEC ||
		c >= 0x1FF2 && c <= 0x1FF4 ||
		c >= 0x1FF6 && c <= 0x1FFC ||
		c == 0x2126 ||
		c >= 0x212A && c <= 0x212B ||
		c == 0x212E ||
		c >= 0x2180 && c <= 0x2182 ||
		c >= 0x3041 && c <= 0x3094 ||
		c >= 0x30A1 && c <= 0x30FA ||
		c >= 0x3105 && c <= 0x312C ||
		c >= 0xAC00 && c <= 0xD7A3 ||
		c >= 0x4E00 && c <= 0x9FA5 ||
		c == 0x3007 ||
		c >= 0x3021 && c <= 0x3029;
};

Utilities.isNCNameChar = function(c) {
	return c >= 0x0030 && c <= 0x0039
		|| c >= 0x0660 && c <= 0x0669
		|| c >= 0x06F0 && c <= 0x06F9
		|| c >= 0x0966 && c <= 0x096F
		|| c >= 0x09E6 && c <= 0x09EF
		|| c >= 0x0A66 && c <= 0x0A6F
		|| c >= 0x0AE6 && c <= 0x0AEF
		|| c >= 0x0B66 && c <= 0x0B6F
		|| c >= 0x0BE7 && c <= 0x0BEF
		|| c >= 0x0C66 && c <= 0x0C6F
		|| c >= 0x0CE6 && c <= 0x0CEF
		|| c >= 0x0D66 && c <= 0x0D6F
		|| c >= 0x0E50 && c <= 0x0E59
		|| c >= 0x0ED0 && c <= 0x0ED9
		|| c >= 0x0F20 && c <= 0x0F29
		|| c == 0x002E
		|| c == 0x002D
		|| c == 0x005F
		|| Utilities.isLetter(c)
		|| c >= 0x0300 && c <= 0x0345
		|| c >= 0x0360 && c <= 0x0361
		|| c >= 0x0483 && c <= 0x0486
		|| c >= 0x0591 && c <= 0x05A1
		|| c >= 0x05A3 && c <= 0x05B9
		|| c >= 0x05BB && c <= 0x05BD
		|| c == 0x05BF
		|| c >= 0x05C1 && c <= 0x05C2
		|| c == 0x05C4
		|| c >= 0x064B && c <= 0x0652
		|| c == 0x0670
		|| c >= 0x06D6 && c <= 0x06DC
		|| c >= 0x06DD && c <= 0x06DF
		|| c >= 0x06E0 && c <= 0x06E4
		|| c >= 0x06E7 && c <= 0x06E8
		|| c >= 0x06EA && c <= 0x06ED
		|| c >= 0x0901 && c <= 0x0903
		|| c == 0x093C
		|| c >= 0x093E && c <= 0x094C
		|| c == 0x094D
		|| c >= 0x0951 && c <= 0x0954
		|| c >= 0x0962 && c <= 0x0963
		|| c >= 0x0981 && c <= 0x0983
		|| c == 0x09BC
		|| c == 0x09BE
		|| c == 0x09BF
		|| c >= 0x09C0 && c <= 0x09C4
		|| c >= 0x09C7 && c <= 0x09C8
		|| c >= 0x09CB && c <= 0x09CD
		|| c == 0x09D7
		|| c >= 0x09E2 && c <= 0x09E3
		|| c == 0x0A02
		|| c == 0x0A3C
		|| c == 0x0A3E
		|| c == 0x0A3F
		|| c >= 0x0A40 && c <= 0x0A42
		|| c >= 0x0A47 && c <= 0x0A48
		|| c >= 0x0A4B && c <= 0x0A4D
		|| c >= 0x0A70 && c <= 0x0A71
		|| c >= 0x0A81 && c <= 0x0A83
		|| c == 0x0ABC
		|| c >= 0x0ABE && c <= 0x0AC5
		|| c >= 0x0AC7 && c <= 0x0AC9
		|| c >= 0x0ACB && c <= 0x0ACD
		|| c >= 0x0B01 && c <= 0x0B03
		|| c == 0x0B3C
		|| c >= 0x0B3E && c <= 0x0B43
		|| c >= 0x0B47 && c <= 0x0B48
		|| c >= 0x0B4B && c <= 0x0B4D
		|| c >= 0x0B56 && c <= 0x0B57
		|| c >= 0x0B82 && c <= 0x0B83
		|| c >= 0x0BBE && c <= 0x0BC2
		|| c >= 0x0BC6 && c <= 0x0BC8
		|| c >= 0x0BCA && c <= 0x0BCD
		|| c == 0x0BD7
		|| c >= 0x0C01 && c <= 0x0C03
		|| c >= 0x0C3E && c <= 0x0C44
		|| c >= 0x0C46 && c <= 0x0C48
		|| c >= 0x0C4A && c <= 0x0C4D
		|| c >= 0x0C55 && c <= 0x0C56
		|| c >= 0x0C82 && c <= 0x0C83
		|| c >= 0x0CBE && c <= 0x0CC4
		|| c >= 0x0CC6 && c <= 0x0CC8
		|| c >= 0x0CCA && c <= 0x0CCD
		|| c >= 0x0CD5 && c <= 0x0CD6
		|| c >= 0x0D02 && c <= 0x0D03
		|| c >= 0x0D3E && c <= 0x0D43
		|| c >= 0x0D46 && c <= 0x0D48
		|| c >= 0x0D4A && c <= 0x0D4D
		|| c == 0x0D57
		|| c == 0x0E31
		|| c >= 0x0E34 && c <= 0x0E3A
		|| c >= 0x0E47 && c <= 0x0E4E
		|| c == 0x0EB1
		|| c >= 0x0EB4 && c <= 0x0EB9
		|| c >= 0x0EBB && c <= 0x0EBC
		|| c >= 0x0EC8 && c <= 0x0ECD
		|| c >= 0x0F18 && c <= 0x0F19
		|| c == 0x0F35
		|| c == 0x0F37
		|| c == 0x0F39
		|| c == 0x0F3E
		|| c == 0x0F3F
		|| c >= 0x0F71 && c <= 0x0F84
		|| c >= 0x0F86 && c <= 0x0F8B
		|| c >= 0x0F90 && c <= 0x0F95
		|| c == 0x0F97
		|| c >= 0x0F99 && c <= 0x0FAD
		|| c >= 0x0FB1 && c <= 0x0FB7
		|| c == 0x0FB9
		|| c >= 0x20D0 && c <= 0x20DC
		|| c == 0x20E1
		|| c >= 0x302A && c <= 0x302F
		|| c == 0x3099
		|| c == 0x309A
		|| c == 0x00B7
		|| c == 0x02D0
		|| c == 0x02D1
		|| c == 0x0387
		|| c == 0x0640
		|| c == 0x0E46
		|| c == 0x0EC6
		|| c == 0x3005
		|| c >= 0x3031 && c <= 0x3035
		|| c >= 0x309D && c <= 0x309E
		|| c >= 0x30FC && c <= 0x30FE;
};

Utilities.coalesceText = function(n) {
	for (var m = n.firstChild; m != null; m = m.nextSibling) {
		if (m.nodeType == 3 /*Node.TEXT_NODE*/ || m.nodeType == 4 /*Node.CDATA_SECTION_NODE*/) {
			var s = m.nodeValue;
			var first = m;
			m = m.nextSibling;
			while (m != null && (m.nodeType == 3 /*Node.TEXT_NODE*/ || m.nodeType == 4 /*Node.CDATA_SECTION_NODE*/)) {
				s += m.nodeValue;
				var del = m;
				m = m.nextSibling;
				del.parentNode.removeChild(del);
			}
			if (first.nodeType == 4 /*Node.CDATA_SECTION_NODE*/) {
				var p = first.parentNode;
				if (first.nextSibling == null) {
					p.removeChild(first);
					p.appendChild(p.ownerDocument.createTextNode(s));
				} else {
					var next = first.nextSibling;
					p.removeChild(first);
					p.insertBefore(p.ownerDocument.createTextNode(s), next);
				}
			} else {
				first.nodeValue = s;
			}
			if (m == null) {
				break;
			}
		} else if (m.nodeType == 1 /*Node.ELEMENT_NODE*/) {
			Utilities.coalesceText(m);
		}
	}
};

Utilities.instance_of = function(o, c) {
	while (o != null) {
		if (o.constructor === c) {
			return true;
		}
		if (o === Object) {
			return false;
		}
		o = o.constructor.superclass;
	}
	return false;
};

Utilities.getElementById = function(n, id) {
	// Note that this does not check the DTD to check for actual
	// attributes of type ID, so this may be a bit wrong.
	if (n.nodeType == 1 /*Node.ELEMENT_NODE*/) {
		if (n.getAttribute("id") == id
				|| n.getAttributeNS(null, "id") == id) {
			return n;
		}
	}
	for (var m = n.firstChild; m != null; m = m.nextSibling) {
		var res = Utilities.getElementById(m, id);
		if (res != null) {
			return res;
		}
	}
	return null;
};

// XPathException ////////////////////////////////////////////////////////////

XPathException.prototype = {};
XPathException.prototype.constructor = XPathException;
XPathException.superclass = Object.prototype;

function XPathException(c, e) {
	this.code = c;
	this.exception = e;
}

XPathException.prototype.toString = function() {
	var msg = this.exception ? ": " + this.exception.toString() : "";
	switch (this.code) {
		case XPathException.INVALID_EXPRESSION_ERR:
			return "Invalid expression" + msg;
		case XPathException.TYPE_ERR:
			return "Type error" + msg;
	}
};

XPathException.INVALID_EXPRESSION_ERR = 51;
XPathException.TYPE_ERR = 52;

// XPathExpression ///////////////////////////////////////////////////////////

XPathExpression.prototype = {};
XPathExpression.prototype.constructor = XPathExpression;
XPathExpression.superclass = Object.prototype;

function XPathExpression(e, r, p) {
	this.xpath = p.parse(e);
	this.context = new XPathContext();
	this.context.namespaceResolver = new XPathNSResolverWrapper(r);
}

XPathExpression.prototype.evaluate = function(n, t, res) {
	this.context.expressionContextNode = n;
	var result = this.xpath.evaluate(this.context);
	return new XPathResult(result, t);
}

// XPathNSResolverWrapper ////////////////////////////////////////////////////

XPathNSResolverWrapper.prototype = {};
XPathNSResolverWrapper.prototype.constructor = XPathNSResolverWrapper;
XPathNSResolverWrapper.superclass = Object.prototype;

function XPathNSResolverWrapper(r) {
	this.xpathNSResolver = r;
}

XPathNSResolverWrapper.prototype.getNamespace = function(prefix, n) {
    if (this.xpathNSResolver == null) {
        return null;
    }
	return this.xpathNSResolver.lookupNamespaceURI(prefix);
};

// NodeXPathNSResolver ///////////////////////////////////////////////////////

NodeXPathNSResolver.prototype = {};
NodeXPathNSResolver.prototype.constructor = NodeXPathNSResolver;
NodeXPathNSResolver.superclass = Object.prototype;

function NodeXPathNSResolver(n) {
	this.node = n;
	this.namespaceResolver = new NamespaceResolver();
}

NodeXPathNSResolver.prototype.lookupNamespaceURI = function(prefix) {
	return this.namespaceResolver.getNamespace(prefix, this.node);
};

// XPathResult ///////////////////////////////////////////////////////////////

XPathResult.prototype = {};
XPathResult.prototype.constructor = XPathResult;
XPathResult.superclass = Object.prototype;

function XPathResult(v, t) {
	if (t == XPathResult.ANY_TYPE) {
		if (v.constructor === XString) {
			t = XPathResult.STRING_TYPE;
		} else if (v.constructor === XNumber) {
			t = XPathResult.NUMBER_TYPE;
		} else if (v.constructor === XBoolean) {
			t = XPathResult.BOOLEAN_TYPE;
		} else if (v.constructor === XNodeSet) {
			t = XPathResult.UNORDERED_NODE_ITERATOR_TYPE;
		}
	}
	this.resultType = t;
	switch (t) {
		case XPathResult.NUMBER_TYPE:
			this.numberValue = v.numberValue();
			return;
		case XPathResult.STRING_TYPE:
			this.stringValue = v.stringValue();
			return;
		case XPathResult.BOOLEAN_TYPE:
			this.booleanValue = v.booleanValue();
			return;
		case XPathResult.ANY_UNORDERED_NODE_TYPE:
		case XPathResult.FIRST_ORDERED_NODE_TYPE:
			if (v.constructor === XNodeSet) {
				this.singleNodeValue = v.first();
				return;
			}
			break;
		case XPathResult.UNORDERED_NODE_ITERATOR_TYPE:
		case XPathResult.ORDERED_NODE_ITERATOR_TYPE:
			if (v.constructor === XNodeSet) {
				this.invalidIteratorState = false;
				this.nodes = v.toArray();
				this.iteratorIndex = 0;
				return;
			}
			break;
		case XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE:
		case XPathResult.ORDERED_NODE_SNAPSHOT_TYPE:
			if (v.constructor === XNodeSet) {
				this.nodes = v.toArray();
				this.snapshotLength = this.nodes.length;
				return;
			}
			break;
	}
	throw new XPathException(XPathException.TYPE_ERR);
};

XPathResult.prototype.iterateNext = function() {
	if (this.resultType != XPathResult.UNORDERED_NODE_ITERATOR_TYPE
			&& this.resultType != XPathResult.ORDERED_NODE_ITERATOR_TYPE) {
		throw new XPathException(XPathException.TYPE_ERR);
	}
	return this.nodes[this.iteratorIndex++];
};

XPathResult.prototype.snapshotItem = function(i) {
	if (this.resultType != XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE
			&& this.resultType != XPathResult.ORDERED_NODE_SNAPSHOT_TYPE) {
		throw new XPathException(XPathException.TYPE_ERR);
	}
	return this.nodes[i];
};

XPathResult.ANY_TYPE = 0;
XPathResult.NUMBER_TYPE = 1;
XPathResult.STRING_TYPE = 2;
XPathResult.BOOLEAN_TYPE = 3;
XPathResult.UNORDERED_NODE_ITERATOR_TYPE = 4;
XPathResult.ORDERED_NODE_ITERATOR_TYPE = 5;
XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE = 6;
XPathResult.ORDERED_NODE_SNAPSHOT_TYPE = 7;
XPathResult.ANY_UNORDERED_NODE_TYPE = 8;
XPathResult.FIRST_ORDERED_NODE_TYPE = 9;

// DOM 3 XPath support ///////////////////////////////////////////////////////

function installDOM3XPathSupport(doc, p) {
	doc.createExpression = function(e, r) {
		try {
			return new XPathExpression(e, r, p);
		} catch (e) {
			throw new XPathException(XPathException.INVALID_EXPRESSION_ERR, e);
		}
	};
	doc.createNSResolver = function(n) {
		return new NodeXPathNSResolver(n);
	};
	doc.evaluate = function(e, cn, r, t, res) {
		if (t < 0 || t > 9) {
			throw { code: 0, toString: function() { return "Request type not supported"; } };
		}
        return doc.createExpression(e, r, p).evaluate(cn, t, res);
	};
};

// ---------------------------------------------------------------------------

// Install DOM 3 XPath support for the current document.
try {
	var shouldInstall = true;
	try {
		if (document.implementation
				&& document.implementation.hasFeature
				&& document.implementation.hasFeature("XPath", null)) {
			shouldInstall = false;
		}
	} catch (e) {
	}
	if (shouldInstall) {
		installDOM3XPathSupport(document, new XPathParser());
	}
} catch (e) {
}

// ---------------------------------------------------------------------------
// exports for node.js

installDOM3XPathSupport(exports, new XPathParser());

exports.XPathResult = XPathResult;

// helper
exports.select = function(e, doc, single) {
	return exports.selectWithResolver(e, doc, null, single);
};

exports.useNamespaces = function(mappings) {
	var resolver = {
		mappings: mappings || {},
		lookupNamespaceURI: function(prefix) {
			return this.mappings[prefix];
		}
	};

	return function(e, doc, single) {
		return exports.selectWithResolver(e, doc, resolver, single);
	};
};

exports.selectWithResolver = function(e, doc, resolver, single) {
	var expression = new XPathExpression(e, resolver, new XPathParser());
	var type = XPathResult.ANY_TYPE;

	var result = expression.evaluate(doc, type, null);

	if (result.resultType == XPathResult.STRING_TYPE) {
		result = result.stringValue;
	}
	else if (result.resultType == XPathResult.NUMBER_TYPE) {
		result = result.numberValue;
	}
	else if (result.resultType == XPathResult.BOOLEAN_TYPE) {
		result = result.booleanValue;
	}
	else {
		result = result.nodes;
		if (single) {
			result = result[0];
		}
	}

	return result;
};

exports.select1 = function(e, doc) {
	return exports.select(e, doc, true);
};

// end non-node wrapper
})(typeof exports !== 'undefined' ? exports : xpath);

},{}],"/Users/Jacob/workspace/scheduler/front-end/node_modules/events/events.js":[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],"/Users/Jacob/workspace/scheduler/front-end/node_modules/flux/index.js":[function(require,module,exports){
/**
 * Copyright (c) 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

module.exports.Dispatcher = require('./lib/Dispatcher');

},{"./lib/Dispatcher":"/Users/Jacob/workspace/scheduler/front-end/node_modules/flux/lib/Dispatcher.js"}],"/Users/Jacob/workspace/scheduler/front-end/node_modules/flux/lib/Dispatcher.js":[function(require,module,exports){
(function (process){
/**
 * Copyright (c) 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule Dispatcher
 * 
 * @preventMunge
 */

'use strict';

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var invariant = require('fbjs/lib/invariant');

var _prefix = 'ID_';

/**
 * Dispatcher is used to broadcast payloads to registered callbacks. This is
 * different from generic pub-sub systems in two ways:
 *
 *   1) Callbacks are not subscribed to particular events. Every payload is
 *      dispatched to every registered callback.
 *   2) Callbacks can be deferred in whole or part until other callbacks have
 *      been executed.
 *
 * For example, consider this hypothetical flight destination form, which
 * selects a default city when a country is selected:
 *
 *   var flightDispatcher = new Dispatcher();
 *
 *   // Keeps track of which country is selected
 *   var CountryStore = {country: null};
 *
 *   // Keeps track of which city is selected
 *   var CityStore = {city: null};
 *
 *   // Keeps track of the base flight price of the selected city
 *   var FlightPriceStore = {price: null}
 *
 * When a user changes the selected city, we dispatch the payload:
 *
 *   flightDispatcher.dispatch({
 *     actionType: 'city-update',
 *     selectedCity: 'paris'
 *   });
 *
 * This payload is digested by `CityStore`:
 *
 *   flightDispatcher.register(function(payload) {
 *     if (payload.actionType === 'city-update') {
 *       CityStore.city = payload.selectedCity;
 *     }
 *   });
 *
 * When the user selects a country, we dispatch the payload:
 *
 *   flightDispatcher.dispatch({
 *     actionType: 'country-update',
 *     selectedCountry: 'australia'
 *   });
 *
 * This payload is digested by both stores:
 *
 *   CountryStore.dispatchToken = flightDispatcher.register(function(payload) {
 *     if (payload.actionType === 'country-update') {
 *       CountryStore.country = payload.selectedCountry;
 *     }
 *   });
 *
 * When the callback to update `CountryStore` is registered, we save a reference
 * to the returned token. Using this token with `waitFor()`, we can guarantee
 * that `CountryStore` is updated before the callback that updates `CityStore`
 * needs to query its data.
 *
 *   CityStore.dispatchToken = flightDispatcher.register(function(payload) {
 *     if (payload.actionType === 'country-update') {
 *       // `CountryStore.country` may not be updated.
 *       flightDispatcher.waitFor([CountryStore.dispatchToken]);
 *       // `CountryStore.country` is now guaranteed to be updated.
 *
 *       // Select the default city for the new country
 *       CityStore.city = getDefaultCityForCountry(CountryStore.country);
 *     }
 *   });
 *
 * The usage of `waitFor()` can be chained, for example:
 *
 *   FlightPriceStore.dispatchToken =
 *     flightDispatcher.register(function(payload) {
 *       switch (payload.actionType) {
 *         case 'country-update':
 *         case 'city-update':
 *           flightDispatcher.waitFor([CityStore.dispatchToken]);
 *           FlightPriceStore.price =
 *             getFlightPriceStore(CountryStore.country, CityStore.city);
 *           break;
 *     }
 *   });
 *
 * The `country-update` payload will be guaranteed to invoke the stores'
 * registered callbacks in order: `CountryStore`, `CityStore`, then
 * `FlightPriceStore`.
 */

var Dispatcher = (function () {
  function Dispatcher() {
    _classCallCheck(this, Dispatcher);

    this._callbacks = {};
    this._isDispatching = false;
    this._isHandled = {};
    this._isPending = {};
    this._lastID = 1;
  }

  /**
   * Registers a callback to be invoked with every dispatched payload. Returns
   * a token that can be used with `waitFor()`.
   */

  Dispatcher.prototype.register = function register(callback) {
    var id = _prefix + this._lastID++;
    this._callbacks[id] = callback;
    return id;
  };

  /**
   * Removes a callback based on its token.
   */

  Dispatcher.prototype.unregister = function unregister(id) {
    !this._callbacks[id] ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Dispatcher.unregister(...): `%s` does not map to a registered callback.', id) : invariant(false) : undefined;
    delete this._callbacks[id];
  };

  /**
   * Waits for the callbacks specified to be invoked before continuing execution
   * of the current callback. This method should only be used by a callback in
   * response to a dispatched payload.
   */

  Dispatcher.prototype.waitFor = function waitFor(ids) {
    !this._isDispatching ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Dispatcher.waitFor(...): Must be invoked while dispatching.') : invariant(false) : undefined;
    for (var ii = 0; ii < ids.length; ii++) {
      var id = ids[ii];
      if (this._isPending[id]) {
        !this._isHandled[id] ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Dispatcher.waitFor(...): Circular dependency detected while ' + 'waiting for `%s`.', id) : invariant(false) : undefined;
        continue;
      }
      !this._callbacks[id] ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Dispatcher.waitFor(...): `%s` does not map to a registered callback.', id) : invariant(false) : undefined;
      this._invokeCallback(id);
    }
  };

  /**
   * Dispatches a payload to all registered callbacks.
   */

  Dispatcher.prototype.dispatch = function dispatch(payload) {
    !!this._isDispatching ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Dispatch.dispatch(...): Cannot dispatch in the middle of a dispatch.') : invariant(false) : undefined;
    this._startDispatching(payload);
    try {
      for (var id in this._callbacks) {
        if (this._isPending[id]) {
          continue;
        }
        this._invokeCallback(id);
      }
    } finally {
      this._stopDispatching();
    }
  };

  /**
   * Is this Dispatcher currently dispatching.
   */

  Dispatcher.prototype.isDispatching = function isDispatching() {
    return this._isDispatching;
  };

  /**
   * Call the callback stored with the given id. Also do some internal
   * bookkeeping.
   *
   * @internal
   */

  Dispatcher.prototype._invokeCallback = function _invokeCallback(id) {
    this._isPending[id] = true;
    this._callbacks[id](this._pendingPayload);
    this._isHandled[id] = true;
  };

  /**
   * Set up bookkeeping needed when dispatching.
   *
   * @internal
   */

  Dispatcher.prototype._startDispatching = function _startDispatching(payload) {
    for (var id in this._callbacks) {
      this._isPending[id] = false;
      this._isHandled[id] = false;
    }
    this._pendingPayload = payload;
    this._isDispatching = true;
  };

  /**
   * Clear bookkeeping used for dispatching.
   *
   * @internal
   */

  Dispatcher.prototype._stopDispatching = function _stopDispatching() {
    delete this._pendingPayload;
    this._isDispatching = false;
  };

  return Dispatcher;
})();

module.exports = Dispatcher;
}).call(this,require('_process'))

},{"_process":"/Users/Jacob/workspace/scheduler/front-end/node_modules/browserify/node_modules/process/browser.js","fbjs/lib/invariant":"/Users/Jacob/workspace/scheduler/front-end/node_modules/flux/node_modules/fbjs/lib/invariant.js"}],"/Users/Jacob/workspace/scheduler/front-end/node_modules/flux/node_modules/fbjs/lib/invariant.js":[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule invariant
 */

"use strict";

/**
 * Use invariant() to assert state which your program assumes to be true.
 *
 * Provide sprintf-style format (only %s is supported) and arguments
 * to provide information about what broke and what you were
 * expecting.
 *
 * The invariant message will be stripped in production, but the invariant
 * will remain to ensure logic does not differ in production.
 */

var invariant = function (condition, format, a, b, c, d, e, f) {
  if (process.env.NODE_ENV !== 'production') {
    if (format === undefined) {
      throw new Error('invariant requires an error message argument');
    }
  }

  if (!condition) {
    var error;
    if (format === undefined) {
      error = new Error('Minified exception occurred; use the non-minified dev environment ' + 'for the full error message and additional helpful warnings.');
    } else {
      var args = [a, b, c, d, e, f];
      var argIndex = 0;
      error = new Error('Invariant Violation: ' + format.replace(/%s/g, function () {
        return args[argIndex++];
      }));
    }

    error.framesToPop = 1; // we don't care about invariant's own frame
    throw error;
  }
};

module.exports = invariant;
}).call(this,require('_process'))

},{"_process":"/Users/Jacob/workspace/scheduler/front-end/node_modules/browserify/node_modules/process/browser.js"}],"/Users/Jacob/workspace/scheduler/front-end/node_modules/node-calendar/node-calendar.js":[function(require,module,exports){
/*!
 * node-calendar
 * Copyright(c) 2013 Armin Tamzarian <tamzarian1989@gmail.com>
 * MIT Licensed
 */

(function() {

    var _DAYS_IN_MONTH = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    var _DAYS_BEFORE_MONTH = [-1, 0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];

    try {
      var cldr = require("cldr");
    }
    catch(err) {
      cldr = false;
    }

    /**
     * Adjust the provided weekday index from the Javascript index scheme
     * (SUN=0, MON=1, ...) to the Python scheme (MON=0, TUE=1, ...)
     *
     * @api private
     */
    function _adjustWeekday(weekday) {
      return weekday > 0 ? weekday - 1 : 6
    };

    /**
     * Extracts the wide or abbreviated day names for a specified locale.
     * If cldr is not installed values default to that for locale en_US.
     *
     * @param {Boolean} abbr
     * @param {String} locale
     * @api private
     */
    function _extractLocaleDays(abbr, locale) {
      short = typeof(abbr) === "undefined" ? false : abbr;

      if(abbr) {
        return cldr ? cldr.extractDayNames(locale).format.abbreviated : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      }
      else {
        return cldr ? cldr.extractDayNames(locale).format.wide : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      }
    };

    /**
     * Extracts the wide or abbreviated month names for a specified locale.
     * If cldr is not installed values default to that for locale en_US.
     *
     * @param {Boolean} abbr
     * @param {String} locale
     * @api private
     */
    function _extractLocaleMonths(abbr, locale) {
      short = typeof(abbr) === "undefined" ? false : abbr;

      var months = []
      if(abbr) {
        months = cldr ? cldr.extractMonthNames(locale).format.abbreviated : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      }
      else {
        months = cldr ? cldr.extractMonthNames(locale).format.wide : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      }

      months.unshift('');
      return months;
    };

    /**
     * Calculates the ordinal time from given year, month, day values.
     *
     * @param {Number} year
     * @param {Number} month
     * @param {Number} day
     * @api private
     */
    function _toordinal(year, month, day) {
      var days_before_year = ((year - 1) * 365) + Math.floor((year - 1) / 4) - Math.floor((year - 1) / 100) + Math.floor((year - 1) / 400);
      var days_before_month = _DAYS_BEFORE_MONTH[month] + (month > 2 && isleap(year) ? 1 : 0);
      return (days_before_year + days_before_month + day);
    }

    /**
     * Return true for leap years, false for non-leap years.
     *
     * @param {Number} year
     * @api public
     */
    function isleap(year) {
      return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
    };

    /**
     * Return number of leap years in range [y1, y2).
     * Assumes y1 <= y2.
     *
     * @param {Number} y1
     * @param {Number} y2
     * @api public
     */
    function leapdays(y1, y2) {
      y1--;
      y2--;
      return (Math.floor(y2/4) - Math.floor(y1/4)) - (Math.floor(y2/100) - Math.floor(y1/100)) + (Math.floor(y2/400) - Math.floor(y1/400));
    };

    /**
     * Return starting weekday (0-6 ~ Mon-Sun) and number of days (28-31) for
     * year, month.
     *
     * @param {Number} year
     * @param {Number} month
     * @throws {IllegalMonthError} If the provided month is invalid.
     * @api public
     */
    function monthrange(year, month) {
      if(month < 1 || month > 12) {
        throw new IllegalMonthError();
      }

      var day1 = weekday(year, month, 1);
      var ndays = _DAYS_IN_MONTH[month] + (month === 2 && isleap(year));

      return [day1, ndays];
    };

    /**
     * Sets the locale for use in extracting month and weekday names.
     *
     * @param {String} locale
     * @throws {IllegalLocaleError} If the provided locale is invalid.
     * @api public
     */
    function setlocale(locale) {
      locale = typeof(locale) === "undefined" ? "en_US" : locale;

      if((cldr && (cldr.localeIds.indexOf(locale.replace(/-/g, '_').toLowerCase()) === -1)) || (!cldr && ((locale.replace(/-/g, '_').toLowerCase() !== "en_us")))) {
         throw new IllegalLocaleError();
      }

      this.day_name   = _extractLocaleDays(false, locale);
      this.day_abbr   = _extractLocaleDays(true, locale);
      this.month_name = _extractLocaleMonths(false, locale);
      this.month_abbr = _extractLocaleMonths(true, locale);
    };

    /**
      * Unrelated but handy function to calculate Unix timestamp from GMT.
      *
      * @param {Array} tuple
      * @throws {IllegalMonthError} If the provided month element is invalid.
      * @throws {IllegalDayError} If the provided day element is invalid.
      * @api public
      */
    function timegm(timegmt) {
      var year   = timegmt[0];
      var month  = timegmt[1];
      var day    = timegmt[2];
      var hour   = timegmt[3];
      var minute = timegmt[4];
      var second = timegmt[5];

      if(month < 1 || month > 12) {
        throw new IllegalMonthError();
      }

      if(day < 1 || day > (_DAYS_IN_MONTH[month] + (month === 2 && isleap(year)))) {
        throw new IllegalDayError();
      }

      if(hour < 0 || hour > 23 || minute < 0 || minute > 59 || second < 0 || second > 59) {
        throw new IllegalTimeError();
      }

      var days = _toordinal(year, month, 1) - 719163 + day - 1;
      var hours = (days * 24) + hour;
      var minutes = (hours * 60) + minute;
      var seconds = (minutes * 60) + second;

      return seconds;
    }

    /**
     * Return weekday (0-6 ~ Mon-Sun) for year (1970-...), month (1-12),
     * day (1-31).
     *
     * @param {Number} year
     * @param {Number} month
     * @param {Number} day
     * @throws {IllegalMonthError} If the provided month element is invalid.
     * @throws {IllegalDayError} If the provided day element is invalid.
     * @api public
     */
    function weekday(year, month, day) {
      if(month < 1 || month > 12) {
        throw new IllegalMonthError();
      }

      if(day < 1 || day > (_DAYS_IN_MONTH[month] + (month === 2 && isleap(year)))) {
        throw new IllegalDayError();
      }

      var date = new Date(year, month - 1, day);
      return _adjustWeekday(date.getDay());
    };


    /**
     * Base calendar class. This class doesn't do any formatting. It simply
     * provides data to subclasses.
     *
     * @param {Number} firstweekday
     * @throws {IllegalWeekdayError} If the provided firstweekday is invalid.
     * @api public
     */
    function Calendar(firstweekday) {
      this._firstweekday = typeof(firstweekday) === "undefined" ? 0 : firstweekday;

      if(firstweekday < 0 || firstweekday > 6) {
        throw new IllegalWeekdayError();
      }

      this._oneday = 1000 * 60 * 60 * 24;
      this._onehour = 1000 * 60 * 60;
    };

    /**
     * GET-er for firstweekday
     *
     * @api public
     */
    Calendar.prototype.getfirstweekday = function() {
      return this._firstweekday;
    };

    /**
     * SET-er for firstweekday
     *
     * @param {Number} firstweekday
     * @throws {IllegalWeekdayError} If the provided firstweekday is invalid.
     * @api public
     */
    Calendar.prototype.setfirstweekday = function(firstweekday) {
      if(firstweekday < 0 || firstweekday > 6) {
        throw new IllegalWeekdayError();
      }

      this._firstweekday = firstweekday;
    };

    /**
     * Return an array for one week of weekday numbers starting with the
     * configured first one.
     *
     * @api public
     */
    Calendar.prototype.iterweekdays = function() {
      var weekdays = [];
      for(var i = this._firstweekday; i < this._firstweekday + 7; i++) {
        weekdays.push(i % 7);
      }

      return weekdays;
    };

    /**
     * Return an array for one month. The array will contain Date
     * values and will always iterate through complete weeks, so it will yield
     * dates outside the specified month.
     *
     * @param {Number} year
     * @param {Number} month
     * @api public
     */

    Calendar.prototype.itermonthdates = function(year, month) {
      if(month < 1 || month > 12) {
        throw new IllegalMonthError();
      }

      var date = new Date(year, month - 1, 1);
      var day = _adjustWeekday(date.getDay());
      var days = (day - this._firstweekday)  >= 0 ? (day - this._firstweekday) % 7 : 7 + (day - this._firstweekday);

      date.setTime(date.getTime() - (days * this._oneday));

      var dates = [];
      while(true) {
        dates.push(new Date(date.getTime()));

        var currentDate = date.getDate();
        date.setTime(date.getTime() + this._oneday);

        // Hack to account for DST
        while(date.getDate() === currentDate) {
          date.setTime(date.getTime() + this._onehour);
        }

        if(date.getMonth() !== month - 1 && _adjustWeekday(date.getDay()) === this._firstweekday) {
          break;
        }
      }

      return dates;
    };
    /**
     * Like itermonthdates(), but will yield day numbers. For days outside
     * the specified month the day number is 0.
     *
     * @param {Number} year
     * @param {Number} month
     * @api public
     */
    Calendar.prototype.itermonthdays = function(year, month) {
      return this.itermonthdates(year, month).map(function(value){
        return value.getMonth() === month - 1 ? value.getDate() : 0;
      });
    };

    /**
     * Like itermonthdates(), but will yield [day number, weekday number]
     * arrays. For days outside the specified month the day number is 0.
     *
     * @param {Number} year
     * @param {Number} month
     * @api public
     */
    Calendar.prototype.itermonthdays2 = function(year, month) {
      return this.itermonthdates(year, month).map(function(value){
        return value.getMonth() === month - 1 ? [value.getDate(), _adjustWeekday(value.getDay())] : [0, _adjustWeekday(value.getDay())];
      }, this);
    };

    /**
     * Return a matrix (array of array) representing a month's calendar.
     * Each row represents a week; week entries are Date values.
     *
     * @param {Number} year
     * @param {Number} month
     * @api public
     */
    Calendar.prototype.monthdatescalendar = function(year, month) {
      var days = [];
      dates = this.itermonthdates(year, month);
      for(var i = 0; i < dates.length; i += 7) {
        days.push(dates.slice(i, i + 7));
      }

      return days;
    };

    /**
     * Return a matrix representing a month's calendar.
     * Each row represents a week; days outside this month are zero.
     *
     * @param {Number} year
     * @param {Number} month
     * @api public
     */
    Calendar.prototype.monthdayscalendar = function(year, month) {
      var days = [];
      dates = this.itermonthdays(year, month);
      for(var i = 0; i < dates.length; i += 7) {
        days.push(dates.slice(i, i + 7));
      }

      return days;
    };

    /**
     * Return a matrix representing a month's calendar.
     * Each row represents a week; week entries are
     * [day number, weekday number] arrays. Day numbers outside this month
     * are zero.
     *
     * @param {Number} year
     * @param {Number} month
     * @api public
     */
    Calendar.prototype.monthdays2calendar = function(year, month) {
      var days = [];
      dates = this.itermonthdays2(year, month);
      for(var i = 0; i < dates.length; i += 7) {
        days.push(dates.slice(i, i + 7));
      }

      return days;
    };

    /**
     * Return the data for the specified year ready for formatting. The return
     * value is an array of month rows. Each month row contains up to width months.
     * Each month contains between 4 and 6 weeks and each week contains 1-7
     * days. Days are Date objects.
     *
     * @param {Number} year
     * @param {Number} width
     * @api public
     */
    Calendar.prototype.yeardatescalendar = function(year, width) {
      width = typeof(width) === "undefined" ? 3 : width;

      var months = [];
      for(var month = 1; month <= 12; month++) {
        months.push(this.monthdatescalendar(year, month));
      }

      var rows = [];
      for(var i = 0; i < months.length; i += width) {
        rows.push(months.slice(i, i + width));
      }
      return rows;
    };

    /**
     * Return the data for the specified year ready for formatting (similar to
     * yeardatescalendar()). Entries in the week arrays are day numbers.
     * Day numbers outside this month are zero.
     *
     * @param {Number} year
     * @param {Number} width
     * @api public
     */
    Calendar.prototype.yeardayscalendar = function(year, width) {
      width = typeof(width) === "undefined" ? 3 : width;

      var months = [];
      for(var month = 1; month <= 12; month++) {
        months.push(this.monthdayscalendar(year, month));
      }

      var rows = [];
      for(var i = 0; i < months.length; i += width) {
        rows.push(months.slice(i, i + width));
      }
      return rows;
    };

    /**
     * Return the data for the specified year ready for formatting (similar to
     * yeardatescalendar()). Entries in the week arrays are
     * [day number, weekday number] arrays. Day numbers outside this month are
     * zero.
     *
     * @param {Number} year
     * @param {Number} width
     * @api public
     */
    Calendar.prototype.yeardays2calendar = function(year, width) {
      width = typeof(width) === "undefined" ? 3 : width;

      var months = [];
      for(var month = 1; month <= 12; month++) {
        months.push(this.monthdays2calendar(year, month));
      }

      var rows = [];
      for(var i = 0; i < months.length; i += width) {
        rows.push(months.slice(i, i + width));
      }
      return rows;
    };

    /**
     * Error indicating a nonexistent or unsupported locale specified.
     *
     * @param {String} message
     * @api public
     */
    function IllegalLocaleError(message) {
      this.name = "IllegalLocaleError";
      this.message = typeof(message) === "undefined" ? "Invalid locale specified." : message;
    };
    IllegalLocaleError.prototype = new Error();
    IllegalLocaleError.prototype.constructor = IllegalLocaleError;

    /**
     * Error indicating a day index specified outside of the valid range.
     *
     * @param {String} message
     * @api public
     */
    function IllegalDayError(message) {
      this.name = "IllegalDayError";
      this.message = typeof(message) === "undefined" ? "Invalid day specified." : message;
    };
    IllegalDayError.prototype = new Error();
    IllegalDayError.prototype.constructor = IllegalDayError;

    /**
     * Error indicating a month index specified outside of the expected range (1-12 ~ Jan-Dec).
     *
     * @param {String} message
     * @api public
     */
    function IllegalMonthError(message) {
      this.name = "IllegalMonthError";
      this.message = typeof(message) === "undefined" ? "Invalid month specified." : message;
    };
    IllegalMonthError.prototype = new Error();
    IllegalMonthError.prototype.constructor = IllegalMonthError;

    /**
     * Error indicating a time element is outside of the valid range.
     *
     * @param {String} message
     * @api public
     */
    function IllegalTimeError(message) {
      this.name = "IllegalTimeError";
      this.message = typeof(message) === "undefined" ? "Invalid time element specified." : message;
    };
    IllegalTimeError.prototype = new Error();
    IllegalTimeError.prototype.constructor = IllegalTimeError;

    /**
     * Error indicating a weekday index specified outside of the expected range (0-6 ~ Mon-Sun).
     *
     * @param {String} message
     * @api public
     */
    function IllegalWeekdayError(message) {
      this.name = "IllegalWeekdayError";
      this.message = typeof(message) === "undefined" ? "Invalid weekday specified." : message;
    };
    IllegalWeekdayError .prototype = new Error();
    IllegalWeekdayError .prototype.constructor = IllegalWeekdayError ;

    // export of package-like object with explicit public API
    var calendar = function() {};

    calendar.isleap     = isleap;
    calendar.leapdays   = leapdays;
    calendar.monthrange = monthrange;
    calendar.weekday    = weekday;
    calendar.setlocale  = setlocale;
    calendar.timegm     = timegm;
    calendar.Calendar   = Calendar;

    calendar.IllegalLocaleError  = IllegalLocaleError;
    calendar.IllegalDayError     = IllegalDayError;
    calendar.IllegalMonthError   = IllegalMonthError;
    calendar.IllegalTimeError    = IllegalTimeError;
    calendar.IllegalWeekdayError = IllegalWeekdayError;

    calendar.MONDAY     = 0;
    calendar.TUESDAY    = 1;
    calendar.WEDNESDAY  = 2;
    calendar.THURSDAY   = 3;
    calendar.FRIDAY     = 4;
    calendar.SATURDAY   = 5;
    calendar.SUNDAY     = 6;

    calendar.JANUARY    =  1;
    calendar.FEBRUARY   =  2;
    calendar.MARCH      =  3;
    calendar.APRIL      =  4;
    calendar.MAY        =  5;
    calendar.JUNE       =  6;
    calendar.JULY       =  7;
    calendar.AUGUST     =  8;
    calendar.SEPTEMBER  =  9;
    calendar.OCTOBER    = 10;
    calendar.NOVEMBER   = 11;
    calendar.DECEMBER   = 12;

    calendar.setlocale();

    // Initialization methodology and noConflict courtesy node-uuid:
    // https://github.com/broofa/node-uuid

    var _global = this;

    // Publish as node.js module
    if (typeof(module) != 'undefined' && module.exports) {
      module.exports = calendar;
    }

    // Publish as global (in browsers)
    else {
      var _previousRoot = _global.calendar;

      /**
        * Reset global 'calendar' variable
        *
        * @api public
        */
      calendar.noconflict = function() {
        _global.calendar = _previousRoot;
        return calendar;
      };

      _global.calendar = calendar;
    }

}).call(this);

},{"cldr":"/Users/Jacob/workspace/scheduler/front-end/node_modules/cldr/lib/cldr.js"}],"/Users/Jacob/workspace/scheduler/front-end/node_modules/react/lib/Object.assign.js":[function(require,module,exports){
/**
 * Copyright 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule Object.assign
 */

// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.assign

'use strict';

function assign(target, sources) {
  if (target == null) {
    throw new TypeError('Object.assign target cannot be null or undefined');
  }

  var to = Object(target);
  var hasOwnProperty = Object.prototype.hasOwnProperty;

  for (var nextIndex = 1; nextIndex < arguments.length; nextIndex++) {
    var nextSource = arguments[nextIndex];
    if (nextSource == null) {
      continue;
    }

    var from = Object(nextSource);

    // We don't currently support accessors nor proxies. Therefore this
    // copy cannot throw. If we ever supported this then we must handle
    // exceptions and side-effects. We don't support symbols so they won't
    // be transferred.

    for (var key in from) {
      if (hasOwnProperty.call(from, key)) {
        to[key] = from[key];
      }
    }
  }

  return to;
}

module.exports = assign;

},{}],"/Users/Jacob/workspace/scheduler/front-end/src/js/Action.js":[function(require,module,exports){
var AppDispatcher = require('./Dispatcher.js');
var appConstants = require('./Constants.js');

var plannerActions = {
  newMonth: function (date) {
    AppDispatcher.handleViewAction({
      actionType: appConstants.NEW_MONTH,
      data: date
    });
  },
  findMonth: function (direction) {
    AppDispatcher.handleViewAction({
      actionType: appConstants.FIND_MONTH,
      data: direction
    });
  },
  selectedDay: function (dayNum) {
    AppDispatcher.handleViewAction({
      actionType: appConstants.SELECTED_DAY,
      data: dayNum
    });
  },
  addEvents: function (evt) {
    AppDispatcher.handleViewAction({
      actionType: appConstants.ADD_EVENTS,
      data: evt
    });
  },
  deleteEvents: function (evt) {
    AppDispatcher.handleViewAction({
      actionType: appConstants.DELETE_EVENTS,
      data: evt
    })
  },
  addToDo: function (toDo) {
    AppDispatcher.handleViewAction({
      actionType: appConstants.ADD_TODO,
      data: toDo
    })
  },
  deleteToDo: function (toDo) {
    AppDispatcher.handleViewAction({
      actionType: appConstants.DELETE_TODO,
      data: toDo
    })
  },
  toDoStatus: function (toDo) {
    AppDispatcher.handleViewAction({
      actionType: appConstants.TODO_STATUS,
      data: toDo
    })
  }
};

module.exports = plannerActions;

},{"./Constants.js":"/Users/Jacob/workspace/scheduler/front-end/src/js/Constants.js","./Dispatcher.js":"/Users/Jacob/workspace/scheduler/front-end/src/js/Dispatcher.js"}],"/Users/Jacob/workspace/scheduler/front-end/src/js/Constants.js":[function(require,module,exports){
var appConstants = {
  NEW_MONTH: 'NEW_MONTH',
  FIND_MONTH: 'FIND_MONTH',
  SELECTED_DAY: 'SELECTED_DAY',
  ADD_EVENTS: 'ADD_EVENTS',
  DELETE_EVENTS: 'DELETE_EVENTS',
  ADD_TODO: 'ADD_TODO',
  DELETE_TODO: 'DELETE_TODO',
  TODO_STATUS: 'TODO_STATUS'
};

module.exports = appConstants;

},{}],"/Users/Jacob/workspace/scheduler/front-end/src/js/Dispatcher.js":[function(require,module,exports){
var Dispatcher = require('flux').Dispatcher;
var AppDispatcher = new Dispatcher();

AppDispatcher.handleViewAction = function(action) {
  this.dispatch({
    source: 'VIEW_ACTION',
    action: action
  });
}

module.exports = AppDispatcher;

},{"flux":"/Users/Jacob/workspace/scheduler/front-end/node_modules/flux/index.js"}],"/Users/Jacob/workspace/scheduler/front-end/src/js/assets/calendarConversions.js":[function(require,module,exports){
var monthConversion = {
  Jan : [1, 'January'],
  Feb : [2, 'February'],
  Mar : [3, 'March'],
  Apr : [4, 'April'],
  May : [5, 'May'],
  Jun : [6, 'June'],
  Jul : [7, 'July'],
  Aug : [8, 'August'],
  Sep : [9, 'September'],
  Oct : [10, 'October'],
  Nov : [11, 'November'],
  Dec : [12, 'December'],
  1 : 'Jan',
  2 : 'Feb',
  3 : 'Mar',
  4 : 'Apr',
  5 : 'May',
  6 : 'Jun',
  7 : 'Jul',
  8 : 'Aug',
  9 : 'Sep',
  10 : 'Oct',
  11 : 'Nov',
  12 : 'Dec',
}

var monthAnimation = function (direction) {
  if(direction) {
    var mon = document.getElementsByClassName('monthGrid')[0].classList;
    mon.add('animated', 'bounceInLeft');
    setTimeout(function(){ mon.remove('animated', 'bounceInLeft') }, 1000);
  } else {
    var mon = document.getElementsByClassName('monthGrid')[0].classList;
    mon.add('animated', 'bounceInRight');
    setTimeout(function(){ mon.remove('animated', 'bounceInRight') }, 1000);
  }
}

var sortedEvents = function (evt1, evt2) {
  return parseInt(evt1.time.start.replace(':', '')) - parseInt(evt2.time.start.replace(':', ''));
}

module.exports = {
  monthConversion: monthConversion,
  monthAnimation: monthAnimation,
  sortedEvents: sortedEvents
}

},{}],"/Users/Jacob/workspace/scheduler/front-end/src/js/assets/taskHelpers.js":[function(require,module,exports){
var handlers = {
  dateToggle: function () {
    this.setState({
      dateToggle: this.state.dateToggle ? this.state.dateToggle = false : this.state.dateToggle = true
    })
  },
  eventsToggle: function () {
    this.setState({
      eventsToggle: this.state.eventsToggle ? this.state.eventsToggle = false : this.state.eventsToggle = true
    })
  },
  toDoToggle: function () {
    this.setState({
      toDoToggle: this.state.toDoToggle ? this.state.toDoToggle = false : this.state.toDoToggle = true
    })
  }
}

var toggleState = {
  dateToggle: true,
  eventsToggle: false,
  toDoToggle: false
}

module.exports = {
  handlers: handlers,
  toggleState: toggleState
}

},{}],"/Users/Jacob/workspace/scheduler/front-end/src/js/components/Day.jsx":[function(require,module,exports){
var Day = React.createClass({displayName: "Day",
  render: function () {
    return (
      React.createElement("div", {className: "monthDay"}, 
        
         this.props.currentMonth.items.events[parseInt(this.props.day)]
         ? this.props.currentMonth.items.events[parseInt(this.props.day)].map(function (evt, i) {
            return React.createElement("p", {className: "calendarEvent", key: i}, evt.title)
           })
         : null, 
        
        
         this.props.currentMonth.items.todos[parseInt(this.props.day)]
         ? this.props.currentMonth.items.todos[parseInt(this.props.day)].map(function (toDo, i) {
            return React.createElement("p", {className: toDo.completed ? "calendarToDoC" : "calendarToDoNC", key: i}, toDo.title) 
           })
         : null
        
      )
    )
  }
})

module.exports = Day;

},{}],"/Users/Jacob/workspace/scheduler/front-end/src/js/components/events.jsx":[function(require,module,exports){
var Events = React.createClass({displayName: "Events",
  getEvents: function () {
    var dayEvents = this.props.currentMonth.items.events[this.props.currentMonth.selectedDay];
    return dayEvents || null;
  },
  render: function () {
    return (
      React.createElement("div", {className: "dayEvents animated zoomIn"}, 
         this.getEvents() != null
          ? this.getEvents().map(function (day, i) {
            return (
              React.createElement("div", {className: "dayEventContainer", key: day.time.start + day.title}, 
                React.createElement("form", null, 
                  React.createElement("span", {className: "eventMarker fa fa-calendar-check-o"}), 
                  React.createElement("input", {type: "text", placeholder: "Title", name: "title", defaultValue: day.title}), 
                  React.createElement("input", {type: "time", placeholder: "Start", name: "start", defaultValue: day.time.start}), 
                  React.createElement("input", {type: "time", placeholder: "End", name: "end", defaultValue: day.time.end}), 
                  React.createElement("textarea", {defaultValue: "Description", name: "description", defaultValue: day.description}), 
                  React.createElement("span", {className: "deleteEvent glyphicon glyphicon-minus-sign", onClick: this.props.deleteEvents.bind(this, {day: day.day, evtIndex: i})})
                )
              )
            )
          }, this)
          :
          React.createElement("p", null, "No Events Today")
        
      )
    )
  }
})

module.exports = Events;

},{}],"/Users/Jacob/workspace/scheduler/front-end/src/js/components/month.jsx":[function(require,module,exports){
var Day = require('./Day.jsx');

var Month = React.createClass({displayName: "Month",
  render: function () {
    var that = this;
    return (
      React.createElement("section", null, 
        React.createElement("div", {className: "calendarHeader"}, 
          React.createElement("button", {className: "btn btn-primary", onClick: this.props.handlers.displayMonth}, "Back"), 
          React.createElement("div", {className: "monthName"}, 
            React.createElement("h1", null, this.props.currentMonth.name), 
            React.createElement("h4", null, this.props.currentMonth.year)
          ), 
          React.createElement("button", {className: "btn btn-primary", onClick: this.props.handlers.displayMonth}, "Forward")
        ), 
        React.createElement("table", {className: "monthGrid table-bordered"}, 
          React.createElement("thead", null, 
            React.createElement("tr", null, 
              React.createElement("th", null, "Sunday"), " ", React.createElement("th", null, "Monday"), " ", React.createElement("th", null, "Tuesday"), " ", React.createElement("th", null, "Wednesday"), " ", React.createElement("th", null, "Thursday"), " ", React.createElement("th", null, "Friday"), " ", React.createElement("th", null, "Saturday")
            )
          ), 
          React.createElement("tbody", null, 
            this.props.currentMonth.monthMatrix.map(function(week) {
              return (
                React.createElement("tr", {key: week}, 
                  week.map(function(day, i) {
                    return day === 0
                      ? React.createElement("td", {className: "nonMonth", key: i})
                      : day == parseInt(this.props.currentMonth.selectedDay)
                        ? React.createElement("td", {className: "selectedDay", key: i}, 
                            React.createElement("div", {className: "scroll"}, 
                              React.createElement("b", null, React.createElement("p", null, day)), 
                              React.createElement(Day, {day: day, currentMonth: this.props.currentMonth})
                            )
                          )
                        : React.createElement("td", {onClick: this.props.handlers.selectedDay.bind(this, day), key: i}, 
                            React.createElement("div", {className: "scroll"}, 
                              React.createElement("b", null, React.createElement("p", null, day)), 
                              React.createElement(Day, {day: day, currentMonth: this.props.currentMonth})
                            )
                          )
                  },this)
                )
              );
            },this)
          )
        )
      )
    );
  }
})

module.exports = Month;

},{"./Day.jsx":"/Users/Jacob/workspace/scheduler/front-end/src/js/components/Day.jsx"}],"/Users/Jacob/workspace/scheduler/front-end/src/js/components/planner.jsx":[function(require,module,exports){
var Month = require('./month.jsx');
var SelectedDay = require('./selectedDay.jsx');
var TaskManager = require('./taskManager.jsx');
var plannerStore = require('../stores/plannerStore.js');
var plannerActions = require('../Action.js');
var monthAnimation = require('../assets/calendarConversions').monthAnimation;

var Planner = React.createClass({displayName: "Planner",

  getInitialState: function () {
    var now = new Date().toString().split(' ');
    plannerActions.newMonth([now[1], now[3], now[2]]);
    return {
      currentMonth: plannerStore.getCurrentMonth(),
    }
  },
  componentDidMount: function () {
    plannerStore.addChangeListener(this._onChange);
  },
  componentWillUnmount: function () {
    plannerStore.removeChangeListener(this._onChange);
  },
  monthHandlers: {
    selectedDay:  function (day) {
      plannerActions.selectedDay(day);
    },
    displayMonth: function (e) {
      monthAnimation(e.target.innerHTML == 'Forward' ? true : false);
      e.target.innerHTML == 'Forward' ? plannerActions.findMonth(true) : plannerActions.findMonth(false);
    }
  },
  taskHandlers: {
    addEvents: function (e) {
      plannerActions.addEvents(e);
    },
    deleteEvents: function (e) {
      plannerActions.deleteEvents(e);
    },
    addToDo: function (e) {
      plannerActions.addToDo(e);
    },
    deleteToDo: function (e) {
      plannerActions.deleteToDo(e)
    },
    toDoStatus: function (e) {
      plannerActions.toDoStatus(e);
    }
  },
  _onChange: function () {
    this.setState({
      currentMonth: plannerStore.getCurrentMonth()
    })
  },
  render: function() {
    return (
      React.createElement("div", {className: "animated zoomIn container-fluid"}, 
        React.createElement("div", {className: "row text-center"}, 
          React.createElement("div", {className: "col-md-8"}, 
            React.createElement(Month, {currentMonth: this.state.currentMonth, handlers: this.monthHandlers})
          ), 
          React.createElement("div", {className: "col-md-4"}, 
            React.createElement(TaskManager, {currentMonth: this.state.currentMonth, handlers: this.taskHandlers})
          )
        )
      )
    );
  }

});


React.render(React.createElement(Planner, null), document.getElementById('app'));

},{"../Action.js":"/Users/Jacob/workspace/scheduler/front-end/src/js/Action.js","../assets/calendarConversions":"/Users/Jacob/workspace/scheduler/front-end/src/js/assets/calendarConversions.js","../stores/plannerStore.js":"/Users/Jacob/workspace/scheduler/front-end/src/js/stores/plannerStore.js","./month.jsx":"/Users/Jacob/workspace/scheduler/front-end/src/js/components/month.jsx","./selectedDay.jsx":"/Users/Jacob/workspace/scheduler/front-end/src/js/components/selectedDay.jsx","./taskManager.jsx":"/Users/Jacob/workspace/scheduler/front-end/src/js/components/taskManager.jsx"}],"/Users/Jacob/workspace/scheduler/front-end/src/js/components/selectedDay.jsx":[function(require,module,exports){
var SelectedDay = React.createClass ({displayName: "SelectedDay",
  handleEventSubmit: function () {
    var form = document.getElementsByName('newEvent');
    this.props.addEvents({
      day: this.props.currentMonth.selectedDay, time: {start: form[1].value, end: form[2].value}, title: form[0].value, description: form[3].value
    });
    for (var i = 0; i < form.length; i++) {
      form[i].value = null;
    }
    form[form.length -1].value = 'Description';
  },
  handleToDoSubmit: function () {
    var form = document.getElementsByName('newToDo');
    this.props.addToDo({
      day: this.props.currentMonth.selectedDay, title: form[0].value, priority: form[1].value, description: form[2].value, completed: false
    });
    console.log(form[0].value, form[1].value, form[2].value);
    form[0].value = null;
    form[1].value = 3;
    form[2].value = 'Description';
  },
  render: function () {
    return (
      React.createElement("div", {className: "animated zoomIn selectedDayContainer"}, 
        /* New Event */
        React.createElement("div", {className: "categoryOne"}, 
          React.createElement("h4", null, "Add Event"), 
          React.createElement("input", {type: "text", placeholder: "Title", name: "newEvent"}), 
          React.createElement("div", {className: "time"}, 
            React.createElement("span", {className: "fa fa-hourglass-start"}, " "), 
            React.createElement("input", {type: "time", placeholder: "Start", name: "newEvent"})
          ), 
          React.createElement("div", {className: "time"}, 
            React.createElement("span", {className: "fa fa-hourglass-end"}, " "), 
            React.createElement("input", {type: "time", placeholder: "End", name: "newEvent"})
          ), 
          React.createElement("textarea", {defaultValue: "Description", name: "newEvent"}), 
          React.createElement("span", {className: "btnSpan glyphicon glyphicon-plus-sign", onClick: this.handleEventSubmit})
        ), 
        /* New ToDo */
        React.createElement("div", null, 
          React.createElement("h4", {className: "toDoHeader"}, "Add ToDo"), 
          React.createElement("input", {type: "text", placeholder: "Title", name: "newToDo"}), 
          React.createElement("div", {className: "toDoPriority"}, 
            React.createElement("span", {className: "prioritySpan"}, "Priority"), 
            React.createElement("input", {type: "range", min: "1", max: "5", list: "interest", defaultValue: 3, name: "newToDo"}), 
              React.createElement("datalist", {id: "interest"}, 
                React.createElement("option", null, "1"), 
                React.createElement("option", null, "2"), 
                React.createElement("option", null, "3"), 
                React.createElement("option", null, "4"), 
                React.createElement("option", null, "5")
              )
          ), 
          React.createElement("textarea", {defaultValue: "Description", name: "newToDo"}), 
          React.createElement("span", {className: "btnSpan glyphicon glyphicon-plus-sign", onClick: this.handleToDoSubmit})
        )
      )
    )
  }
})

module.exports = SelectedDay

},{}],"/Users/Jacob/workspace/scheduler/front-end/src/js/components/taskManager.jsx":[function(require,module,exports){
var SelectedDay = require('./selectedDay.jsx');
var Events = require('./events.jsx');
var ToDo = require('./toDo.jsx');
var taskHelpers = require('../assets/taskHelpers.js');

var TaskManager = React.createClass({displayName: "TaskManager",

  getInitialState: function () {
    return taskHelpers.toggleState
  },
  toggleHandlers: taskHelpers.handlers,

  render: function () {
    return (
      React.createElement("section", {className: "taskManager"}, 
        React.createElement("h1", {className: "taskHeader"}, "Task Manager"), 
        React.createElement("div", {className: "taskContainer"}, 
          React.createElement("div", {className: "taskSection"}, 
            React.createElement("div", {onClick: this.toggleHandlers.dateToggle.bind(this)}, 
              React.createElement("span", {className: "taskIcon glyphicon glyphicon-triangle-" + (this.state.dateToggle ? "bottom" : "right")}), 
              React.createElement("h3", null, this.props.currentMonth.name +" "+ this.props.currentMonth.selectedDay +", "+ this.props.currentMonth.year)
            ), 
            this.state.dateToggle ? React.createElement(SelectedDay, {currentMonth: this.props.currentMonth, addEvents: this.props.handlers.addEvents, addToDo: this.props.handlers.addToDo}) : null
          ), 
          React.createElement("div", {className: "taskSection"}, 
            React.createElement("div", {onClick: this.toggleHandlers.eventsToggle.bind(this)}, 
              React.createElement("span", {className: "taskIcon glyphicon glyphicon-triangle-" + (this.state.eventsToggle ? "bottom" : "right")}), 
              React.createElement("h3", null, "Events")
            ), 
            this.state.eventsToggle ? React.createElement(Events, {currentMonth: this.props.currentMonth, deleteEvents: this.props.handlers.deleteEvents}) : null
          ), 
          React.createElement("div", {className: "taskSection"}, 
            React.createElement("div", {onClick: this.toggleHandlers.toDoToggle.bind(this)}, 
              React.createElement("span", {className: "taskIcon glyphicon glyphicon-triangle-" + (this.state.toDoToggle ? "bottom" : "right")}), 
              React.createElement("h3", null, "ToDo's")
            ), 
            this.state.toDoToggle ? React.createElement(ToDo, {currentMonth: this.props.currentMonth, toDoStatus: this.props.handlers.toDoStatus, deleteToDo: this.props.handlers.deleteToDo}) : null
          )
        )
      )
    )
  }
})

module.exports = TaskManager;

},{"../assets/taskHelpers.js":"/Users/Jacob/workspace/scheduler/front-end/src/js/assets/taskHelpers.js","./events.jsx":"/Users/Jacob/workspace/scheduler/front-end/src/js/components/events.jsx","./selectedDay.jsx":"/Users/Jacob/workspace/scheduler/front-end/src/js/components/selectedDay.jsx","./toDo.jsx":"/Users/Jacob/workspace/scheduler/front-end/src/js/components/toDo.jsx"}],"/Users/Jacob/workspace/scheduler/front-end/src/js/components/toDo.jsx":[function(require,module,exports){
var ToDo = React.createClass({displayName: "ToDo",
  getToDos: function () {
    var dayToDos = this.props.currentMonth.items.todos[this.props.currentMonth.selectedDay];
    return dayToDos || null;
  },
  render: function () {
    return (
      React.createElement("div", {className: "dayToDos animated zoomIn"}, 
         this.getToDos() != null
          ? this.getToDos().map(function (toDo, i) {
            return (
              React.createElement("div", {className: "dayToDoContainer", key: toDo.title + toDo.priority}, 
                React.createElement("span", {className: "toDoMarker fa fa-thumb-tack"}), 
                React.createElement("input", {type: "text", placeholder: "Title", name: "newToDo", defaultValue: toDo.title}), 
                React.createElement("div", {className: "toDoPriority"}, 
                  React.createElement("span", {className: "prioritySpan"}, "Priority"), 
                  React.createElement("input", {type: "range", min: "1", max: "5", list: "interest", defaultValue: toDo.priority, name: "newToDo"}), 
                    React.createElement("datalist", {id: "interest"}, 
                      React.createElement("option", null, "1"), 
                      React.createElement("option", null, "2"), 
                      React.createElement("option", null, "3"), 
                      React.createElement("option", null, "4"), 
                      React.createElement("option", null, "5")
                    )
                ), 
                React.createElement("textarea", {defaultValue: "Description", name: "newToDo", defaultValue: toDo.description}), 
                React.createElement("span", {className: toDo.completed ? "completedToDo fa fa-check-square-o" : "notCompletedToDo fa fa-square-o", onClick: this.props.toDoStatus.bind(this, {day: toDo.day, index: i})}), 
                React.createElement("span", {className: "deleteToDo glyphicon glyphicon-minus-sign", onClick: this.props.deleteToDo.bind(this, {toDo: toDo, index: i})})
              )
            )
          }, this)
          :
          React.createElement("p", null, "No ToDo's Today")
        
      )
    )
  }
})

module.exports = ToDo;

},{}],"/Users/Jacob/workspace/scheduler/front-end/src/js/stores/plannerStore.js":[function(require,module,exports){
var AppDispatcher = require('../Dispatcher.js');
var appConstants = require('../Constants.js');
var objectAssign = require('react/lib/Object.assign');
var EventEmitter = require('events').EventEmitter;
var calendar = require('node-calendar');
var assets = require('../assets/calendarConversions');

var CHANGE_EVENT = 'change';

var years = {};
var current = {};

function Month(date) {
  this.name = assets.monthConversion[date[0]][1];
  this.monthKey = assets.monthConversion[date[0]][0];
  this.year = parseInt(date[1]);
  this.monthMatrix = date;
  this.selectedDay = date[2] || 1;
  this.items = {
    events: {},
    todos: {}
  };
}

Month.prototype.newMonth = function () {
  this.monthMatrix = new calendar.Calendar(calendar.SUNDAY).monthdayscalendar(this.monthMatrix[1], assets.monthConversion[this.monthMatrix[0]][0]);
};

var newMonth = function (date) {
  current = new Month(date);
  current.newMonth();
  years[current.year] ? years[current.year].push(current) : years[current.year] = [current];
}

var findMonth = function (direction) {
  if(direction)
    current.monthKey +1 < 13 ? newCurrent = [current.monthKey +1, current.year] : newCurrent = [1, current.year +1];
  else
    current.monthKey -1 > 0 ? newCurrent = [current.monthKey -1, current.year] : newCurrent = [12, current.year -1];
  if(years[newCurrent[1]]){
    var checker = years[newCurrent[1]].filter(function (mon) {
      if(mon.monthKey === newCurrent[0])
        return mon;
    })
    checker.length > 0 ? current = checker[0] : newMonth([assets.monthConversion[newCurrent[0]], newCurrent[1]]);
  } else {
    newMonth([assets.monthConversion[newCurrent[0]], newCurrent[1]]);
  }
}

var selectedDay = function (dayNum) {
  current.selectedDay = dayNum;
}

var addEvents = function (evt) {
  current.items.events[evt.day] ? current.items.events[evt.day].push(evt) : current.items.events[evt.day] = [evt];
  current.items.events[evt.day].sort(assets.sortedEvents);
}

var deleteEvents = function (day, evtIndex) {
  current.items.events[day].splice(evtIndex, 1);
}

var addToDo = function (toDo) {
  current.items.todos[toDo.day] ? current.items.todos[toDo.day].push(toDo) : current.items.todos[toDo.day] = [toDo];
}

var deleteToDo = function (toDo, index) {
  current.items.todos[toDo.day].splice(index, 1);
}

var toDoStatus = function (toDo) {
  current.items.todos[toDo.day][toDo.index].completed ? current.items.todos[toDo.day][toDo.index].completed = false : current.items.todos[toDo.day][toDo.index].completed = true;
}

var plannerStore = objectAssign({}, EventEmitter.prototype, {
  addChangeListener: function (cb) {
    this.on(CHANGE_EVENT, cb);
  },
  removeChangeListener: function (cb) {
    this.removeListener(CHANGE_EVENT, cb);
  },
  getCurrentMonth: function () {
    console.log(years, current);
    return current;
  }
});

AppDispatcher.register(function (payload) {
  var action = payload.action;
  switch(action.actionType){
    case appConstants.NEW_MONTH:
      newMonth(action.data);
      plannerStore.emit(CHANGE_EVENT);
      break;
    case appConstants.FIND_MONTH:
      findMonth(action.data);
      plannerStore.emit(CHANGE_EVENT);
      break;
    case appConstants.SELECTED_DAY:
      selectedDay(action.data);
      plannerStore.emit(CHANGE_EVENT);
      break;
    case appConstants.ADD_EVENTS:
      addEvents(action.data);
      plannerStore.emit(CHANGE_EVENT);
      break;
    case appConstants.DELETE_EVENTS:
      deleteEvents(action.data.day, action.data.evtIndex);
      plannerStore.emit(CHANGE_EVENT);
      break;
    case appConstants.ADD_TODO:
      addToDo(action.data);
      plannerStore.emit(CHANGE_EVENT);
      break;
    case appConstants.TODO_STATUS:
      toDoStatus(action.data);
      plannerStore.emit(CHANGE_EVENT);
      break;
    case appConstants.DELETE_TODO:
      deleteToDo(action.data.toDo, action.data.index);
      plannerStore.emit(CHANGE_EVENT);
      break;
    default:
      return true;
  }
});

module.exports = plannerStore;

},{"../Constants.js":"/Users/Jacob/workspace/scheduler/front-end/src/js/Constants.js","../Dispatcher.js":"/Users/Jacob/workspace/scheduler/front-end/src/js/Dispatcher.js","../assets/calendarConversions":"/Users/Jacob/workspace/scheduler/front-end/src/js/assets/calendarConversions.js","events":"/Users/Jacob/workspace/scheduler/front-end/node_modules/events/events.js","node-calendar":"/Users/Jacob/workspace/scheduler/front-end/node_modules/node-calendar/node-calendar.js","react/lib/Object.assign":"/Users/Jacob/workspace/scheduler/front-end/node_modules/react/lib/Object.assign.js"}]},{},["/Users/Jacob/workspace/scheduler/front-end/src/js/components/planner.jsx"])
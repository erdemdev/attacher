'use strict';

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

/**
 * Base Attacher Class
 */

var Attacher =
/*#__PURE__*/
function () {
  /**
   * Pass arguments to class properties.
   * @constructor
   * @param {Element} reference element.
   * @param {Element} target element to attach reference to.
   * @param {Object} options
   */
  function Attacher(reference, target, _ref) {
    var _ref$debug = _ref.debug,
        debug = _ref$debug === void 0 ? false : _ref$debug,
        _ref$offset = _ref.offset,
        offset = _ref$offset === void 0 ? {
      x: 10,
      y: 10
    } : _ref$offset;

    _classCallCheck(this, Attacher);

    this.reference = reference;
    this.target = target;
    this.debug = debug;
    this.offset = offset;
    if (debug) console.log(this, 'Attacher component created.');
  }
  /**
   * Binds reference to target.
   */


  _createClass(Attacher, [{
    key: "bind",
    value: function bind() {}
  }]);

  return Attacher;
}();

/**
 * Import Styles
 */

var reference = document.querySelector('.reference');
var targets = document.querySelectorAll('.target');
var i = 0;

for (i; i < targets.length; i++) {
  var target = targets[i];
  /* let attacher = null; */

  new Attacher(reference, target, {
    debug: true
  });
  /* target.addEventListener('click', (e) => {
    e.preventDefault();
    if (attacher) return;
    attacher = new Attacher(reference, target, {
      debug: true,
    });
  }); */
}

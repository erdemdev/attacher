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
  function Attacher(reference, _ref) {
    var _ref$target = _ref.target,
        target = _ref$target === void 0 ? undefined : _ref$target,
        _ref$debug = _ref.debug,
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
    if (debug) console.log(this, 'attacher component created.');
    this.init();
    if (target) this.bind(target);
  }
  /**
   * Set up reference element
   */


  _createClass(Attacher, [{
    key: "init",
    value: function init() {
      this.reference.style.position = 'absolute';
      this.reference.style.transition = '2s';
    }
    /**
     * Binds reference element to target element.
     * @param {Element} target could be a new target element.
     */

  }, {
    key: "bind",
    value: function bind(target) {
      var newPos = {
        x: target.offsetLeft - this.reference.offsetLeft,
        y: target.offsetTop - this.reference.offsetTop
      };
      if (this.debug) console.log(newPos, 'is new position of reference.');
      this.reference.style.transform = "translate(".concat(newPos.x, "px, ").concat(newPos.y, "px)");
    }
    /**
     * Unbinds reference element from target element.
     */

  }, {
    key: "unbind",
    value: function unbind() {
      this.reference.style.transform = '';
    }
  }]);

  return Attacher;
}();

/**
 * Import Styles
 */
var reference = document.querySelector('.reference');
var targets = document.querySelectorAll('.target');
var attacher = attacher = new Attacher(reference, {
  debug: true
});
reference.addEventListener('click', function (e) {
  e.preventDefault();
  attacher.unbind();
});
var i = 0;

for (i; i < targets.length; i++) {
  var target = targets[i];
  target.addEventListener('click', function (e) {
    e.preventDefault();
    attacher.bind(e.target);
  });
}

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
   * @arg {Element} reference element.
   * @arg {Object} options of attacher.
   * @prop {Element} target element.
   * @prop {Boolean} debug mode.
   * @prop {String} position of reference to target.
   */
  function Attacher(reference, _ref) {
    var _ref$target = _ref.target,
        target = _ref$target === void 0 ? undefined : _ref$target,
        _ref$debug = _ref.debug,
        debug = _ref$debug === void 0 ? false : _ref$debug,
        _ref$position = _ref.position,
        position = _ref$position === void 0 ? 'top' : _ref$position;

    _classCallCheck(this, Attacher);

    this.reference = reference;
    this.target = target;
    this.debug = debug;
    this.position = position;
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
      this.reference.style.left = 0;
      this.reference.style.bottom = 0;
      if (this.debug) this.reference.style.transition = '2s';
    }
    /**
     * Binds reference element to target element.
     * @arg {Element} target could be a new target element.
     */

  }, {
    key: "bind",
    value: function bind(target) {
      this.target = target;
      this.refresh();
      if (this.debug) console.log("Attacher bind method fired. ", this);
    }
    /**
     * Unbinds reference element from target element.
     */

  }, {
    key: "unbind",
    value: function unbind() {
      this.reference.style.transform = '';
      this.target = undefined;
      if (this.debug) console.log("Attacher unbind method fired. ", this);
    }
    /**
     * Refresh position of reference element.
     */

  }, {
    key: "refresh",
    value: function refresh() {
      if (this.target == undefined) {
        if (this.debug) {
          console.warn("Attacher can't refresh. Target is undefined.");
        }

        return;
      }

      var targetPosX = this.target.offsetLeft + this.target.offsetWidth / 2;
      var targetPosY = this.target.offsetTop + this.target.offsetHeight / 2;
      var referencePosX = this.reference.offsetLeft + this.reference.offsetWidth / 2;
      var referencePosY = this.reference.offsetTop + this.reference.offsetHeight / 2;
      var newPos = {
        x: targetPosX - referencePosX,
        y: targetPosY - referencePosY
      };
      if (this.debug) console.log(newPos, 'is new position of reference.');
      this.reference.style.transform = "translate(".concat(newPos.x, "px, ").concat(newPos.y, "px)");
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
window.addEventListener('resize', function () {
  document.body.style.display = 'none';
  setTimeout(function () {
    document.body.style.display = '';
    attacher.refresh();
  }, 50);
});
var i = 0;

for (i; i < targets.length; i++) {
  var target = targets[i];
  target.addEventListener('click', function (e) {
    e.preventDefault();
    attacher.bind(e.target);
  });
}

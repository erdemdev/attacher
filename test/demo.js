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
   * @prop {String} position ("top", "bottom", "center") of target.
   */
  function Attacher(reference, _ref) {
    var _ref$target = _ref.target,
        target = _ref$target === void 0 ? undefined : _ref$target,
        _ref$debug = _ref.debug,
        debug = _ref$debug === void 0 ? false : _ref$debug,
        _ref$posPriority = _ref.posPriority,
        posPriority = _ref$posPriority === void 0 ? 'top' : _ref$posPriority,
        _ref$transition = _ref.transition,
        transition = _ref$transition === void 0 ? 2 : _ref$transition,
        _ref$offset = _ref.offset,
        offset = _ref$offset === void 0 ? {
      x: 0,
      y: 10
    } : _ref$offset;

    _classCallCheck(this, Attacher);

    this.reference = reference;
    this.target = target;
    this.debug = debug;
    this.posPriority = posPriority;
    this.transition = transition;
    this.offset = offset;
    this.init();
    if (target) this.bind(target);
  }
  /**
   * Set up reference element styles.
   * Listen window resize event to refresh attacher.
   */


  _createClass(Attacher, [{
    key: "init",
    value: function init() {
      var _this = this;

      this.reference.style.position = 'absolute';
      this.reference.style.left = 0;
      this.reference.style.bottom = 0;
      window.addEventListener('resize', function () {
        _this.reference.style.display = 'none';
        setTimeout(function () {
          _this.reference.style.display = '';

          _this.refresh();
        }, 10);
      });

      if (this.debug) {
        console.log('attacher event listener added.');
        console.log('attacher component created.', this);
      }
    }
    /**
     * Binds reference element to target element.
     * @arg {Element} target could be a new target element.
     */

  }, {
    key: "bind",
    value: function bind(target) {
      var _this2 = this;

      this.target = target;
      this.refresh();
      setTimeout(function () {
        _this2.reference.style.transition = "".concat(_this2.transition, "s");
      }, 10);
      if (this.debug) console.log("Attacher bind method fired. ", this);
    }
    /**
     * Unbinds reference element from target element.
     */

  }, {
    key: "unbind",
    value: function unbind() {
      this.reference.style.transition = '';
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

      this.setPosition(this.getPosition());
    }
    /**
     * Decide new position according to window size and priority.
     * @return {Object} new position of target element.
     */

  }, {
    key: "getPosition",
    value: function getPosition() {
      var position = {
        x: this.getDistanceX(),
        y: this.getDistanceY()
      };
      if (this.debug) console.log(position, 'is new position of reference.');
      return position;
    }
    /**
     * Set position of reference element.
     * @arg {Object} position of reference element.
     */

  }, {
    key: "setPosition",
    value: function setPosition(position) {
      this.reference.style.transform = "translate(".concat(position.x, "px, ").concat(position.y, "px)");
    }
    /**
     * check if X axis is out of border.
     * @return {Float} X distance between reference and target.
     */

  }, {
    key: "getDistanceX",
    value: function getDistanceX() {
      var targetPosX = this.target.offsetLeft + this.target.offsetWidth / 2;
      var refCenterDistance = this.reference.offsetWidth / 2;
      var referencePosX = this.reference.offsetLeft + refCenterDistance;
      /**
       * Check is out of Boundary.
       */

      var bodyWidth = document.body.clientWidth;
      var distanceX = targetPosX - referencePosX; // TODO if bleeds position to clicked point.

      if (targetPosX + refCenterDistance + 20 > bodyWidth) {
        distanceX = this.reference.offsetLeft + this.reference.offsetWidth;
        distanceX = bodyWidth - distanceX - 20;
        if (this.debug) console.warn('Element bleeds from right.');
      }

      return distanceX;
    }
    /**
     * check if Y axis is out of border.
     * @arg {String} posPriority position priority.
     * @return {Float} Y distance between reference and target.
     */

  }, {
    key: "getDistanceY",
    value: function getDistanceY() {
      var posPriority = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.posPriority;
      var targetPosY = 0;
      var referencePosY = 0; // TODO: ADD WINDOW SIZE PRIORITY

      /**
       * Select position according to priority.
       */

      switch (posPriority) {
        case 'center':
          targetPosY = this.target.offsetTop + this.target.offsetHeight / 2;
          referencePosY = this.reference.offsetTop + this.reference.offsetHeight / 2;
          break;

        case 'top':
          targetPosY = this.target.offsetTop;
          referencePosY = this.reference.offsetTop + this.reference.offsetHeight + this.offset.y;
          break;

        case 'bottom':
          targetPosY = this.target.offsetTop + this.target.offsetHeight + this.offset.y;
          referencePosY = this.reference.offsetTop;
          break;
      }

      return targetPosY - referencePosY;
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
    console.log(e);
  });
}

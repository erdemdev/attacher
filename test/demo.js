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
 * @class Attacher
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
   * @prop {String} posPriority ("top", "bottom", "center") of target.
   * @prop {Float} transition seconds.
   * @prop {Object} offset of reference to target.
   * @prop {Object} bPadding padding of boundary.
   * @prop {Float} refreshSeconds of attacher.
   */
  function Attacher(reference, _ref) {
    var _ref$target = _ref.target,
        target = _ref$target === void 0 ? undefined : _ref$target,
        _ref$debug = _ref.debug,
        debug = _ref$debug === void 0 ? false : _ref$debug,
        _ref$posPriority = _ref.posPriority,
        posPriority = _ref$posPriority === void 0 ? 'top' : _ref$posPriority,
        _ref$transition = _ref.transition,
        transition = _ref$transition === void 0 ? 1 : _ref$transition,
        _ref$offset = _ref.offset,
        offset = _ref$offset === void 0 ? {
      left: 0,
      top: 10
    } : _ref$offset,
        _ref$bPadding = _ref.bPadding,
        bPadding = _ref$bPadding === void 0 ? {
      left: 20,
      top: 50
    } : _ref$bPadding,
        _ref$refreshSeconds = _ref.refreshSeconds,
        refreshSeconds = _ref$refreshSeconds === void 0 ? .2 : _ref$refreshSeconds;

    _classCallCheck(this, Attacher);

    this.reference = reference;
    this.target = target;
    this.debug = debug;
    this.posPriority = posPriority;
    this.transition = transition;
    this.offset = offset;
    this.bPadding = bPadding;
    this.forcedPosPriority = false;
    this.refreshTimer = null;
    this.refreshSeconds = refreshSeconds;
    this.init();
    if (target) this.bind(target);
  }
  /**
   * Set up reference element styles.
   * Listen window resize event to refresh attacher.
   * Listen document scroll event to recalculate reference position.
   */


  _createClass(Attacher, [{
    key: "init",
    value: function init() {
      this.reference.style.position = 'absolute';
      this.reference.style.zIndex = 1;
      this.reference.style.left = 0;
      this.reference.style.bottom = 0;
      if (this.debug) console.log('attacher component created.', this);
    }
    /**
     * Binds reference element to target element.
     * @arg {Element} target could be a new target element.
     */

  }, {
    key: "bind",
    value: function bind(target) {
      var _this = this;

      this.target = target;
      this.refresh();
      setTimeout(function () {
        _this.reference.style.transition = "".concat(_this.transition, "s");
      }, 10);
      this.startWatch();
      if (this.debug) console.log("Attacher bind method fired. ", this);
    }
    /**
     * Unbinds reference element from target element.
     */

  }, {
    key: "unbind",
    value: function unbind() {
      this.reference.style.transition = '';
      this.reference.style.left = '0';
      this.reference.style.top = '0';
      this.target = undefined;
      this.stopWatch();
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
     * Listen document scroll change.
     */

  }, {
    key: "startWatch",
    value: function startWatch() {
      var _this2 = this;

      document.addEventListener('scroll', this.scrollWatcher = function (e) {
        if (_this2.forcedPosPriority == _this2.checkBleedingY(_this2.targetPosY)) {
          return;
        }
        if (_this2.debug) console.warn('Refresh requested.');
        clearTimeout(_this2.refreshTimer);
        _this2.refreshTimer = setTimeout(function () {
          _this2.refresh();

          if (_this2.debug) console.warn('Refreshed.');
        }, _this2.refreshSeconds * 1000);
      }, {
        passive: true
      });
      window.addEventListener('resize', this.resizeWatcher = function () {
        _this2.reference.style.display = 'none';
        setTimeout(function () {
          _this2.reference.style.display = '';

          _this2.refresh();

          if (_this2.debug) console.warn('Document resized.');
        }, 10);
      });
      if (this.debug) console.warn('attacher started watching.');
    }
    /**
     * Stop listening document scroll change.
     */

  }, {
    key: "stopWatch",
    value: function stopWatch() {
      document.removeEventListener('scroll', this.scrollWatcher);
      window.removeEventListener('resize', this.resizeWatcher);
      if (this.debug) console.warn('attacher stopped watching.');
    }
    /**
     * Decide new position according to window size and priority.
     * @return {Object} new position of target element.
     */

  }, {
    key: "getPosition",
    value: function getPosition() {
      var clientRect = this.target.getBoundingClientRect();
      var positionX = this.offsetPositionX(clientRect.left + document.body.scrollLeft);
      var positionY = this.offsetPositionY(clientRect.top + document.body.scrollTop);
      this.targetPosY = positionY;
      return {
        left: positionX,
        top: positionY
      };
    }
    /**
     * Set position of reference element.
     * @arg {Object} position of reference element.
     */

  }, {
    key: "setPosition",
    value: function setPosition(position) {
      this.reference.style.left = "".concat(position.left, "px");
      this.reference.style.top = "".concat(position.top, "px");
    }
    /**
     * check if X axis is out of border.
     * @arg {FLoat} position of target in x-axis.
     * @return {Float} X distance between reference and target.
     */

  }, {
    key: "offsetPositionX",
    value: function offsetPositionX(position) {
      var newPosition = position - this.reference.offsetWidth / 2 + this.target.offsetWidth / 2;
      /**
       * Check if reference is out-of-bounds.
       */

      var bodyWidth = document.body.clientWidth;

      if (newPosition + this.reference.offsetWidth + this.bPadding.left > bodyWidth) {
        if (this.debug) console.warn('Reference bleeds from right.');
        return bodyWidth - this.reference.offsetWidth - this.bPadding.left;
      }

      if (newPosition - this.bPadding.left < 0) {
        if (this.debug) console.warn('Reference bleeds from left.');
        return 0 + this.bPadding.left;
      }

      return newPosition;
    }
    /**
     * Calculate Y distance first.
     * Check if Y distance is out of boundary.
     * If out of boundary. Recalculate Y distance.
     * @arg {Float} position of target in y-axis.
     * @return {Float} Y distance between reference and target.
     */

  }, {
    key: "offsetPositionY",
    value: function offsetPositionY(position) {
      var newPosition = this.repositionPivotY(position);

      switch (this.checkBleedingY(newPosition)) {
        case 'top':
          newPosition = this.repositionPivotY(position, 'bottom');
          break;

        case 'bottom':
          newPosition = this.repositionPivotY(position, 'top');
          break;
      }

      return newPosition;
    }
    /**
    * Calculate position priority of reference element.
    * @arg {Float} position of target in y-axis.
    * @arg {String} posPriority position priority.
    * @return {Float} Y distance between reference and target.
     */

  }, {
    key: "repositionPivotY",
    value: function repositionPivotY(position) {
      var posPriority = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.posPriority;
      var newPosition = 0;

      switch (posPriority) {
        case 'center':
          newPosition = position;
          break;

        case 'top':
          newPosition = position - this.reference.offsetHeight - this.offset.top;
          break;

        case 'bottom':
          newPosition = position + this.target.offsetHeight + this.offset.top;
          break;
      }

      return newPosition;
    }
    /**
     * Check if target position is out-of-bounds in y-axis.
     * @arg {Float} position of target in y-axis.
     * @return {Boolean | String} the bleeding position of reference.
     * false for no bleeding.
     */

  }, {
    key: "checkBleedingY",
    value: function checkBleedingY(position) {
      var topBoundary = document.body.scrollTop;
      var refTopBoundary = position - this.bPadding.top;

      if (topBoundary >= refTopBoundary) {
        if (this.debug) console.warn('Reference bleeds from top.');
        this.forcedPosPriority = 'bottom';
        return 'top';
      }

      var bottomBoundary = topBoundary + document.body.clientHeight;
      var refBottomBoundary = position + this.reference.offsetHeight + this.bPadding.top;

      if (refBottomBoundary > bottomBoundary) {
        if (this.debug) console.warn('Reference bleeds from bottom.');
        this.forcedPosPriority = 'top';
        return 'bottom';
      }

      this.forcedPosPriority = false;
      return false;
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
  target: targets[0],
  posPriority: 'top',
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

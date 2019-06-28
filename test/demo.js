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
      x: 0,
      y: 10
    } : _ref$offset,
        _ref$bPadding = _ref.bPadding,
        bPadding = _ref$bPadding === void 0 ? {
      x: 20,
      y: 50
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
      var _this = this;

      this.reference.style.position = 'absolute';
      this.reference.style.zIndex = 1;
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
      this.reference.style.transform = '';
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
      var _this3 = this;

      document.addEventListener('scroll', this.eventlistener = function (e) {
        if (_this3.forcedPosPriority == _this3.checkBoundaryY()) return;
        if (_this3.debug) console.warn('New bleeding detected. Refreshing...');
        clearTimeout(_this3.refreshTimer);
        _this3.refreshTimer = setTimeout(function () {
          _this3.refresh();

          if (_this3.debug) console.warn('Refreshed.');
        }, _this3.refreshSeconds * 1000);
      }, {
        passive: true
      });
      if (this.debug) console.warn('attacher started watching.');
    }
    /**
     * Stop listening document scroll change
     */

  }, {
    key: "stopWatch",
    value: function stopWatch() {
      document.removeEventListener('scroll', this.eventlistener);
      if (this.debug) console.warn('attacher stopped watching.');
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
      var targetCenterDistanceX = this.target.offsetWidth / 2;
      var targetPosX = this.target.offsetLeft + targetCenterDistanceX;
      var refCenterDistanceX = this.reference.offsetWidth / 2;
      var referencePosX = this.reference.offsetLeft + refCenterDistanceX;
      var distanceX = targetPosX - referencePosX;
      /**
       * Check if reference is out of boundary.
       */

      var bodyWidth = document.body.clientWidth;

      if (targetPosX + refCenterDistanceX + this.bPadding.x > bodyWidth) {
        distanceX = this.reference.offsetLeft + this.reference.offsetWidth;
        distanceX = bodyWidth - distanceX - this.bPadding.x;
        if (this.debug) console.warn('Element bleeds from right.');
      } else if (0 > targetPosX - refCenterDistanceX - this.bPadding.x) {
        distanceX += refCenterDistanceX - targetPosX + this.bPadding.x;
        if (this.debug) console.warn('Element bleeds from left.');
      }

      return distanceX;
    }
    /**
     * Calculate Y distance first.
     * Check if Y distance is out of boundary.
     * If out of boundary. Recalculate Y distance.
     * @return {Float} Y distance between reference and target.
     */

  }, {
    key: "getDistanceY",
    value: function getDistanceY() {
      var distanceY = this.calculateDistanceY();

      switch (this.checkBoundaryY(distanceY)) {
        case 'top':
          distanceY = this.calculateDistanceY('bottom');
          break;

        case 'bottom':
          distanceY = this.calculateDistanceY('top');
          break;
      }

      return distanceY;
    }
    /**
    * Calculate position priority of reference element.
    * @arg {String} posPriority position priority.
    * @return {Float} Y distance between reference and target.
     */

  }, {
    key: "calculateDistanceY",
    value: function calculateDistanceY() {
      var posPriority = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.posPriority;
      var targetPosY = 0;
      var referencePosY = 0;

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
    /**
     * Check if reference is out-of-bounds in Y axis.
     * @return {Boolean | String} the bleeding position of reference.
     * false for no bleeding.
     */

  }, {
    key: "checkBoundaryY",
    value: function checkBoundaryY() {
      var topBoundary = document.body.scrollTop;
      var refTopBoundary = this.target.offsetTop - this.reference.offsetHeight - this.offset.y - this.bPadding.y;

      if (topBoundary >= refTopBoundary) {
        if (this.debug) console.warn('Reference bleeds from top.');
        this.forcedPosPriority = 'bottom';
        return 'top';
      }

      var bottomBoundary = topBoundary + document.body.clientHeight;
      var refBottomBoundary = this.target.offsetTop + this.target.offsetHeight + this.reference.offsetHeight + this.offset.y + this.bPadding.y;

      if (refBottomBoundary > bottomBoundary) {
        if (this.debug) console.warn('Reference bleeds from bottom.');
        this.forcedPosPriority = 'top';
        return 'bottom';
      }

      if (this.debug) console.warn('No bleeding detected.');
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

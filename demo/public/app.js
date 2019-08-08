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
   * @arg {Element} target element.
   * @arg {Boolean} debug mode.
   * @arg {Float} transition seconds.
   * @arg {Float} focusIndex
   * @arg {String} posPriority ("top", "bottom", "center") of target.
   * @arg {Object} padding of reference to target.
   * @arg {Object} bPadding padding of boundary.
   * @arg {Float} watchRefreshSeconds of attacher.
   */
  function Attacher(reference, _ref) {
    var _ref$target = _ref.target,
        target = _ref$target === void 0 ? null : _ref$target,
        _ref$autoActivate = _ref.autoActivate,
        autoActivate = _ref$autoActivate === void 0 ? false : _ref$autoActivate,
        _ref$debug = _ref.debug,
        debug = _ref$debug === void 0 ? false : _ref$debug,
        _ref$styles = _ref.styles;
    _ref$styles = _ref$styles === void 0 ? {} : _ref$styles;
    var _ref$styles$transitio = _ref$styles.transition,
        transition = _ref$styles$transitio === void 0 ? 1 : _ref$styles$transitio,
        _ref$styles$focusInde = _ref$styles.focusIndex,
        focusIndex = _ref$styles$focusInde === void 0 ? 10 : _ref$styles$focusInde,
        _ref$posPriority = _ref.posPriority,
        posPriority = _ref$posPriority === void 0 ? 'bottom' : _ref$posPriority,
        _ref$padding = _ref.padding;
    _ref$padding = _ref$padding === void 0 ? {} : _ref$padding;
    var _ref$padding$x = _ref$padding.x,
        paddingX = _ref$padding$x === void 0 ? 10 : _ref$padding$x,
        _ref$padding$y = _ref$padding.y,
        paddingY = _ref$padding$y === void 0 ? 20 : _ref$padding$y,
        _ref$bPadding = _ref.bPadding;
    _ref$bPadding = _ref$bPadding === void 0 ? {} : _ref$bPadding;
    var _ref$bPadding$x = _ref$bPadding.x,
        bPaddingX = _ref$bPadding$x === void 0 ? 25 : _ref$bPadding$x,
        _ref$bPadding$y = _ref$bPadding.y,
        bPaddingY = _ref$bPadding$y === void 0 ? 50 : _ref$bPadding$y,
        _ref$watchRefreshSeco = _ref.watchRefreshSeconds,
        watchRefreshSeconds = _ref$watchRefreshSeco === void 0 ? .5 : _ref$watchRefreshSeco;

    _classCallCheck(this, Attacher);

    if (debug) console.warn('attacher component created.', this);
    /**
     * Set up global properties.
     */

    this.reference = reference;
    this.target = target;
    this.debug = debug;
    this.autoActivate = autoActivate;
    this.focusIndex = focusIndex;
    this.posPriority = posPriority;
    this.transition = transition;
    this.paddingX = paddingX;
    this.paddingY = paddingY;
    this.bPaddingX = bPaddingX;
    this.bPaddingY = bPaddingY;
    this.forcedPosPriority = false;
    this.watchRefreshSeconds = watchRefreshSeconds;
    this.windowWidth = window.innerWidth;
    this.autoRefreshTimer = undefined;
    /**
     * Bind reference to target if target exists.
     */

    if (target) this.bind(target);
  }
  /**
   * Binds reference element to target element.
   * @arg {Element} target could be a new target element.
   */


  _createClass(Attacher, [{
    key: "bind",
    value: function bind(target) {
      var _this = this;

      this.target = target;
      this.setStyles();

      if (this.autoActivate) {
        setTimeout(function () {
          _this.activate();
        }, 100);
      }

      if (this.debug) console.log("Attacher bind method fired.");
    }
    /**
     * Unbinds reference element from target element.
     */

  }, {
    key: "unbind",
    value: function unbind() {
      if (this.debug) console.log("Attacher unbind method fired.");
      this.resetStyles();
      this.target = undefined;
      this.deactivate();
    }
    /**
     * Make reference visible. Start watching.
     */

  }, {
    key: "activate",
    value: function activate() {
      var _this2 = this;

      this.switchFocus();
      this.refresh();
      setTimeout(function () {
        _this2.setTransitionStyle();
      }, 100);
      this.startWatch();
    }
    /**
     * Make reference invisible. Stop watching.
     */

  }, {
    key: "deactivate",
    value: function deactivate() {
      this.reference.style.transition = '';
      this.reference.style.left = '-100%';
      this.stopWatch();
    }
    /**
     * Switch focus function
     */

  }, {
    key: "switchFocus",
    value: function switchFocus() {
      document.dispatchEvent(new CustomEvent('blurAttacher'));
      this.reference.style.zIndex = this.focusIndex;
    }
    /**
     * Set up reference element's styles.
     */

  }, {
    key: "setStyles",
    value: function setStyles() {
      this.reference.style.position = 'absolute';
      this.reference.style.zIndex = 1;
    }
    /**
     * Clear reference element's styles.
     */

  }, {
    key: "resetStyles",
    value: function resetStyles() {
      this.reference.style.position = '';
      this.reference.style.zIndex = '';
      this.reference.style.transition = '';
      this.reference.style.left = '';
      this.reference.style.top = '';
    }
    /**
     * Set reference and content's default transition
     * @arg {Element} reference
     * @arg {Float} transition
     */

  }, {
    key: "setTransitionStyle",
    value: function setTransitionStyle() {
      var reference = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.reference;
      var transition = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.transition;
      reference.style.transition = "".concat(transition, "s");
    }
    /**
     * Unset reference and content's default transition
     * @arg {Element} reference
     * @arg {Element} content
     */

  }, {
    key: "unsetTransitionStyle",
    value: function unsetTransitionStyle() {
      var reference = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.reference;
      var content = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.content;
      reference.style.transition = '';
    }
    /**
     * Refresh position of reference element.
     * It is the function to reposition reference element.
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
      var coords = this.target.getBoundingClientRect();
      var positionX = this.offsetPositionX(coords.left + window.scrollX);
      var positionY = this.offsetPositionY(coords.top + window.scrollY);
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
      this.reference.style.transform = '';
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

      var bodyWidth = window.innerWidth;

      if (newPosition + this.reference.offsetWidth + this.paddingX > bodyWidth) {
        if (this.debug) console.log('Reference bleeds from right.');
        return bodyWidth - this.reference.offsetWidth - this.paddingX;
      }

      if (newPosition - this.paddingX < 0) {
        if (this.debug) console.log('Reference bleeds from left.');
        return 0 + this.paddingX;
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
          newPosition = position - this.reference.offsetHeight - this.paddingY;
          break;

        case 'bottom':
          newPosition = position + this.target.offsetHeight + this.paddingY;
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
      var topBoundary = window.scrollY;
      var refTopBoundary = position - this.bPaddingY;

      if (topBoundary >= refTopBoundary) {
        if (this.debug) console.log('Reference bleeds from top.');
        this.forcedPosPriority = 'bottom';
        return 'top';
      }

      var bottomBoundary = topBoundary + window.innerHeight;
      var refBottomBoundary = position + this.reference.offsetHeight + this.bPaddingY;

      if (refBottomBoundary > bottomBoundary) {
        if (this.debug) console.log('Reference bleeds from bottom.');
        this.forcedPosPriority = 'top';
        return 'bottom';
      }

      this.forcedPosPriority = false;
      return false;
    }
    /**
     * Listen document scroll change.
     */

  }, {
    key: "startWatch",
    value: function startWatch() {
      var _this3 = this;

      /**
       * Check if event listeners assigned.
       */
      if (this.eventListenersCreated) return;
      /**
       * Refresh reference element when the user scrolls the page.
       */

      document.addEventListener('scroll', this.scrollWatcher = function () {
        if (!_this3.sleepMode) _this3.autoRefresh();

        _this3.switchToSleepMode();
      }, {
        passive: true
      });
      /**
       * Refresh when window object resized by the user.
       */

      window.addEventListener('resize', this.resizeWatcher = function () {
        if (_this3.windowWidth == window.innerWidth) return;
        if (_this3.debug) console.warn('Document resized.');
        _this3.reference.style.display = 'none';

        _this3.resetStyles();

        setTimeout(function () {
          _this3.reference.style.display = '';

          _this3.setStyles();

          _this3.refresh();
        }, 100);
        setTimeout(function () {
          _this3.setTransitionStyle();
        }, 200);
        _this3.windowWidth = window.innerWidth;
        if (_this3.debug) console.warn('new screen width set to default');
      });
      document.addEventListener('blurAttacher', this.blurAttacher = function () {
        _this3.reference.style.zIndex = 1;
        if (_this3.debug) console.log('blurAttacher event fired.');
      });
      this.eventListenersCreated = true;
      if (this.debug) console.warn('attacher started watching.');
    }
    /**
     * Stop listening scroll and resize events.
     */

  }, {
    key: "stopWatch",
    value: function stopWatch() {
      document.removeEventListener('scroll', this.scrollWatcher);
      window.removeEventListener('resize', this.resizeWatcher);
      document.removeEventListener('blurAttacher', this.blurAttacher);
      clearTimeout(this.autoRefreshTimer);
      this.eventListenersCreated = false;
      if (this.debug) console.warn('attacher stopped watching.');
    }
    /**
     * Auto refreshes attacher on scroll event.
     */

  }, {
    key: "autoRefresh",
    value: function autoRefresh() {
      var _this4 = this;

      if (this.checkBleedingTimer) return;

      if (this.forcedPosPriority == this.checkBleedingY(this.targetPosY)) {
        return;
      }
      if (this.debug) console.log('Refresh requested.');
      this.autoRefreshTimer = setTimeout(function () {
        _this4.checkBleedingTimer = false;

        _this4.refresh();

        if (_this4.debug) console.log('Refreshed.');
      }, this.watchRefreshSeconds * 1000);
      this.checkBleedingTimer = true;
    }
    /**
     * Whether to switch sleep mode for watch.
     */

  }, {
    key: "switchToSleepMode",
    value: function switchToSleepMode() {
      if (window.scrollY > this.reference.offsetTop + this.reference.offsetHeight || this.reference.offsetTop > window.scrollY + window.innerHeight) {
        if (this.debug && this.sleepMode == false) {
          console.warn('attacher switched to sleep mode.');
        }

        clearTimeout(this.autoRefreshTimer);
        this.sleepMode = true;
        return;
      }

      if (this.debug && this.sleepMode == true) {
        console.warn('attacher switched off sleep mode.');
      }

      this.sleepMode = false;
    }
  }]);

  return Attacher;
}();

/**
 * Import Styles
 */
/**
 * Get reference and target elements.
 */

var reference = document.querySelector('.reference--interactive');
var referenceSurface = document.querySelector('.reference-touch');
var targets = document.querySelectorAll('.target');
/**
 * Create interactive attacher example. (Only for demonstration.)
 */

var attacher = new Attacher(reference, {
  touchSurface: referenceSurface,
  target: targets[0],
  posPriority: 'top',
  debug: true,
  autoActivate: true,
  styles: {
    focusIndex: 10
  }
});
/**
 * Create static attacher example.
 */

/* new Attacher(document.querySelector('.reference--static'), {
  target: document.querySelector('.target--static'),
  debug: true,
}); */

/**
 * Click and key events for debugging.
 */

var isVisible = true;
document.addEventListener('keyup', function (e) {
  e.preventDefault(); // Document reference bleeding test.

  if (e.keyCode == 66) reference.classList.toggle('reference--bleed'); // Attacher activate/deactivate test.

  if (e.keyCode == 32) {
    isVisible ? attacher.deactivate() : attacher.activate();
    isVisible = !isVisible;
  }
}); // Unbind Attacher

reference.addEventListener('click', function (e) {
  /* attacher.unbind(); */
}); // Bind Attacher to clicked targets.

var i = 0;

for (i; i < targets.length; i++) {
  var target = targets[i];
  target.addEventListener('click', function (e) {
    e.preventDefault();
    attacher.bind(e.target);
  });
}
//# sourceMappingURL=app.js.map

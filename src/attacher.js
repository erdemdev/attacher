/**
 * Attacher Styles
 */
import './attacher.scss';

/**
 * @class Attacher
 */
export default class Attacher {
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
  constructor(reference, {
    target = null,
    autoActivate = false,
    debug = false,
    styles: {
      transition = 1,
      focusIndex = 10,
    } = {},
    posPriority = 'bottom',
    padding: {
      x: paddingX = 10,
      y: paddingY = 20,
    } = {},
    bPadding: {
      x: bPaddingX = 25,
      y: bPaddingY = 50,
    } = {},
    watchRefreshSeconds = .5,
  }) {
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

    /**
     * Bind reference to target if target exists.
     */
    if (target) this.bind(target);

    this.watchBlurEvents();
  }

  /**
   * Binds reference element to target element.
   * @arg {Element} target could be a new target element.
   */
  bind(target) {
    this.target = target;
    this.setStyles();

    if (this.autoActivate) {
      setTimeout(() => {
        this.activate();
      }, 100);
    }

    if (this.debug) console.log(`Attacher bind method fired.`);
  }

  /**
   * Unbinds reference element from target element.
   */
  unbind() {
    if (this.debug) console.log(`Attacher unbind method fired.`);
    this.resetStyles();
    this.target = undefined;
    this.deactivate();
  }

  /**
   * Make reference visible. Start watching.
   */
  activate() {
    this.switchFocus();
    this.refresh();
    setTimeout(() => {
      this.setTransitionStyle();
    }, 100);
    this.startWatch();
  }

  /**
   * Make reference invisible. Stop watching.
   */
  deactivate() {
    this.reference.style.transition = '';
    this.reference.style.left = '';
    this.stopWatch();
  }

  /**
   * Switch focus function
   */
  switchFocus() {
    document.dispatchEvent(new CustomEvent('blurAttacher'));
    this.reference.style.zIndex = this.focusIndex;
  }

  /**
   * Set up reference element's styles.
   */
  setStyles() {
    this.reference.style.position = 'absolute';
    this.reference.style.zIndex = 1;
  }

  /**
   * Clear reference element's styles.
   */
  resetStyles() {
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
  setTransitionStyle(
      reference = this.reference,
      transition = this.transition,
  ) {
    reference.style.transition = `${transition}s`;
  }

  /**
   * Unset reference and content's default transition
   * @arg {Element} reference
   * @arg {Element} content
   */
  unsetTransitionStyle(
      reference = this.reference,
      content = this.content,
  ) {
    reference.style.transition = '';
  }

  /**
   * Refresh position of reference element.
   * It is the function to reposition reference element.
   */
  refresh() {
    if (this.target == undefined) {
      if (this.debug) {
        console.warn(`Attacher can't refresh. Target is undefined.`);
      }
      return;
    }

    this.setPosition(this.getPosition());
  }

  /**
   * Decide new position according to window size and priority.
   * @return {Object} new position of target element.
   */
  getPosition() {
    const coords = this.target.getBoundingClientRect();
    const positionX = this.offsetPositionX(coords.left + window.scrollX);
    const positionY = this.offsetPositionY(coords.top + window.scrollY);
    this.targetPosY = positionY;

    return {
      left: positionX,
      top: positionY,
    };
  }

  /**
   * Set position of reference element.
   * @arg {Object} position of reference element.
   */
  setPosition(position) {
    this.reference.style.left = `${position.left}px`;
    this.reference.style.top = `${position.top}px`;
    this.reference.style.transform = '';
  }

  /**
   * check if X axis is out of border.
   * @arg {FLoat} position of target in x-axis.
   * @return {Float} X distance between reference and target.
   */
  offsetPositionX(position) {
    const newPosition = position - (this.reference.offsetWidth / 2) +
    (this.target.offsetWidth / 2);

    /**
     * Check if reference is out-of-bounds.
     */
    const bodyWidth = window.innerWidth;

    if (newPosition + this.reference.offsetWidth +
      this.paddingX > bodyWidth) {
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
  offsetPositionY(position) {
    let newPosition = this.repositionPivotY(position);

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
  repositionPivotY(position, posPriority = this.posPriority) {
    let newPosition = 0;

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
  checkBleedingY(position) {
    const topBoundary = window.scrollY;
    const refTopBoundary = position - this.bPaddingY;

    if (topBoundary >= refTopBoundary ) {
      if (this.debug) console.log('Reference bleeds from top.');
      this.forcedPosPriority = 'bottom';
      return 'top';
    }

    const bottomBoundary = topBoundary + window.innerHeight;
    const refBottomBoundary = position +
    this.reference.offsetHeight + this.bPaddingY;

    if (refBottomBoundary > bottomBoundary) {
      if (this.debug) console.log('Reference bleeds from bottom.');
      this.forcedPosPriority = 'top';
      return 'bottom';
    }

    this.forcedPosPriority = false;

    return false;
  }

  /**
   * Watch Global Events
   */
  watchBlurEvents() {
    document.addEventListener('blurAttacher', this.blurAttacher = () => {
      this.reference.style.zIndex = 1;
      if (this.debug) console.log('blurAttacher event fired.');
    });
  }

  /**
   * Listen document scroll change.
   */
  startWatch() {
    /**
     * Check if event listeners assigned.
     */
    if (this.eventListenersCreated) return;

    /**
     * Refresh reference element when the user scrolls the page.
     */
    document.addEventListener('scroll', this.scrollWatcher = () => {
      if (!this.sleepMode) this.autoRefresh();
      this.switchToSleepMode();
    }, {passive: true});

    /**
     * Refresh when window object resized by the user.
     */
    window.addEventListener('resize', this.resizeWatcher = () => {
      if (this.windowWidth == window.innerWidth) return;

      if (this.debug) console.warn('Document resized.');

      this.reference.style.display = 'none';
      this.resetStyles();

      setTimeout(() => {
        this.reference.style.display = '';
        this.setStyles();
        this.refresh();
      }, 100);

      setTimeout(() => {
        this.setTransitionStyle();
      }, 200);

      this.windowWidth = window.innerWidth;

      if (this.debug) console.warn('new screen width set to default');
    });

    this.eventListenersCreated = true;

    if (this.debug) console.warn('attacher started watching.');
  }

  /**
   * Stop listening scroll and resize events.
   */
  stopWatch() {
    document.removeEventListener('scroll', this.scrollWatcher);
    window.removeEventListener('resize', this.resizeWatcher);

    this.eventListenersCreated = false;

    if (this.debug) console.warn('attacher stopped watching.');
  }

  /**
   * Auto refreshes attacher on scroll event.
   */
  autoRefresh() {
    if (this.checkBleedingTimer) return;

    if (this.forcedPosPriority == this.checkBleedingY(this.targetPosY)) {
      return;
    };

    if (this.debug) console.log('Refresh requested.');

    setTimeout(() => {
      this.checkBleedingTimer = false;
      this.refresh();

      if (this.debug) console.log('Refreshed.');
    }, this.watchRefreshSeconds * 1000);

    this.checkBleedingTimer = true;
  }

  /**
   * Whether to switch sleep mode for watch.
   */
  switchToSleepMode() {
    if (window.scrollY >
      this.reference.offsetTop + this.reference.offsetHeight ||
      this.reference.offsetTop > window.scrollY + window.innerHeight
    ) {
      if (this.debug && this.sleepMode == false) {
        console.warn('attacher switched to sleep mode.');
      }

      this.sleepMode = true;

      return;
    }

    if (this.debug && this.sleepMode == true) {
      console.warn('attacher switched off sleep mode.');
    }

    this.sleepMode = false;
  }
};

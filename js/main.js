/**
 * Attacher Styles
 */
import '../sass/main.scss';

/**
 * @class Attacher
 */
export default class Attacher {
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
  constructor(reference, {
    target = undefined,
    debug = false,
    posPriority = 'top',
    transition = 1,
    offset = {left: 0, top: 10},
    bPadding = {left: 20, top: 50},
    refreshSeconds = .2,
  }) {
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
  init() {
    console.log('attacher component created.', this);
    this.reference.style.position = 'absolute';
    this.reference.style.zIndex = 1;
    this.reference.style.left = 0;
    this.reference.style.bottom = 0;
    if (this.debug) {
      window.attacherDebug = () => {
        return {
          window: getEventListeners(window),
          document: getEventListeners(document),
        };
      };
    }
  }

  /**
   * Binds reference element to target element.
   * @arg {Element} target could be a new target element.
   */
  bind(target) {
    if (this.debug) console.log(`Attacher bind method fired.`);
    this.target = target;
    this.refresh();
    setTimeout(() => {
      this.reference.style.transition = `${this.transition}s`;
    }, 10);
    this.startWatch();
  }

  /**
   * Unbinds reference element from target element.
   */
  unbind() {
    if (this.debug) console.log(`Attacher unbind method fired.`);
    this.reference.style.transition = '';
    this.reference.style.left = '0';
    this.reference.style.top = '0';
    this.target = undefined;
    this.stopWatch();
  }

  /**
   * Refresh position of reference element.
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
   * Listen document scroll change.
   */
  startWatch() {
    if (this.eventListenersCreated) return;
    document.addEventListener('scroll', this.scrollWatcher = (e) => {
      if (this.forcedPosPriority ==
        this.checkBleedingY(this.targetPosY)) {
        return;
      };
      if (this.debug) console.warn('Refresh requested.');
      clearTimeout(this.refreshTimer);
      this.refreshTimer = setTimeout(() => {
        this.refresh();
        if (this.debug) console.warn('Refreshed.');
      }, this.refreshSeconds * 1000);
    }, {passive: true});
    window.addEventListener('resize', this.resizeWatcher = () => {
      this.reference.style.display = 'none';
      setTimeout(() => {
        this.reference.style.display = '';
        this.refresh();
        if (this.debug) console.warn('Document resized.');
      }, 10);
    });
    this.eventListenersCreated = true;
    if (this.debug) console.warn('attacher started watching.');
  }

  /**
   * Stop listening document scroll change.
   */
  stopWatch() {
    document.removeEventListener('scroll', this.scrollWatcher);
    window.removeEventListener('resize', this.resizeWatcher);
    this.eventListenersCreated = false;
    if (this.debug) console.warn('attacher stopped watching.');
  }

  /**
   * Decide new position according to window size and priority.
   * @return {Object} new position of target element.
   */
  getPosition() {
    const positionX =
    this.offsetPositionX(this.target.offsetLeft);
    const positionY =
    this.offsetPositionY(this.target.offsetTop);
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
    const bodyWidth = document.body.clientWidth;
    if (newPosition + this.reference.offsetWidth +
      this.bPadding.left > bodyWidth) {
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
        newPosition = position - this.reference.offsetHeight -
        this.offset.top;
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
  checkBleedingY(position) {
    const topBoundary = window.scrollY;
    const refTopBoundary = position - this.bPadding.top;
    if (topBoundary >= refTopBoundary ) {
      if (this.debug) console.warn('Reference bleeds from top.');
      this.forcedPosPriority = 'bottom';
      return 'top';
    }
    const bottomBoundary = topBoundary + document.body.clientHeight;
    const refBottomBoundary = position + this.reference.offsetHeight +
    this.bPadding.top;
    if (refBottomBoundary > bottomBoundary) {
      if (this.debug) console.warn('Reference bleeds from bottom.');
      this.forcedPosPriority = 'top';
      return 'bottom';
    }
    this.forcedPosPriority = false;
    return false;
  }
};

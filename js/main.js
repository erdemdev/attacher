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
    this.reference.style.position = 'absolute';
    this.reference.style.zIndex = 1;
    this.reference.style.left = 0;
    this.reference.style.bottom = 0;
    window.addEventListener('resize', () => {
      this.reference.style.display = 'none';
      setTimeout(() => {
        this.reference.style.display = '';
        this.refresh();
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
  bind(target) {
    this.target = target;
    this.refresh();
    setTimeout(() => {
      this.reference.style.transition = `${this.transition}s`;
    }, 10);
    this.startWatch();
    if (this.debug) console.log(`Attacher bind method fired. `, this);
  }

  /**
   * Unbinds reference element from target element.
   */
  unbind() {
    this.reference.style.transition = '';
    this.reference.style.transform = '';
    this.target = undefined;
    this.stopWatch();
    if (this.debug) console.log(`Attacher unbind method fired. `, this);
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
    document.addEventListener('scroll', this.eventlistener = (e) => {
      if (this.forcedPosPriority ==
        this.checkBleedingY(this.targetPosY)) {
        return;
      };
      if (this.debug) console.warn('New bleeding detected. Refreshing...');
      clearTimeout(this.refreshTimer);
      this.refreshTimer = setTimeout(() => {
        this.refresh();
        if (this.debug) console.warn('Refreshed.');
      }, this.refreshSeconds * 1000);
    }, {passive: true});
    if (this.debug) console.warn('attacher started watching.');
  }

  /**
   * Stop listening document scroll change
   */
  stopWatch() {
    document.removeEventListener('scroll', this.eventlistener);
    if (this.debug) console.warn('attacher stopped watching.');
  }

  /**
   * Decide new position according to window size and priority.
   * @return {Object} new position of target element.
   */
  getPosition() {
    const clientRect = this.target.getBoundingClientRect();
    const positionX = clientRect.left + document.body.scrollLeft;
    const positionY = clientRect.top + document.body.scrollTop;
    this.targetPosY = positionY;
    return {
      left: this.offsetPositionX(positionX),
      top: this.offsetPositionY(positionY),
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
     * Check if reference is out of boundary.
     */
    // const bodyWidth = document.body.clientWidth;
    // if (targetPosX + refCenterDistanceX + this.bPadding.left > bodyWidth) {
    //   distanceX = this.reference.offsetLeft + this.reference.offsetWidth;
    //   distanceX = bodyWidth - distanceX - this.bPadding.left;
    //   if (this.debug) console.warn('Element bleeds from right.');
    // } else if (0 > targetPosX - refCenterDistanceX - this.bPadding.left) {
    //   distanceX += refCenterDistanceX - targetPosX + this.bPadding.left;
    //   if (this.debug) console.warn('Element bleeds from left.');
    // }
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
    const topBoundary = document.body.scrollTop;
    const refTopBoundary = position - this.reference.offsetHeight -
    this.bPadding.top;
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
    if (this.debug) console.warn('No bleeding detected.');
    this.forcedPosPriority = false;
    return false;
  }
};

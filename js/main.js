/**
 * Attacher Styles
 */
import '../sass/main.scss';

/**
 * Base Attacher Class
 * TODO WATCH BLEEDING Y REALTIME.
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
   */
  constructor(reference, {
    target = undefined,
    debug = false,
    posPriority = 'top',
    transition = 1,
    offset = {x: 0, y: 10},
    bPadding = {x: 20, y: 50},
  }) {
    this.reference = reference;
    this.target = target;
    this.debug = debug;
    this.posPriority = posPriority;
    this.transition = transition;
    this.offset = offset;
    this.bPadding = bPadding;
    this.init();
    if (target) this.bind(target);
  }

  /**
   * Set up reference element styles.
   * Listen window resize event to refresh attacher.
   */
  init() {
    this.reference.style.position = 'absolute';
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
    if (this.debug) console.log(`Attacher bind method fired. `, this);
  }

  /**
   * Unbinds reference element from target element.
   */
  unbind() {
    this.reference.style.transition = '';
    this.reference.style.transform = '';
    this.target = undefined;
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
   * Decide new position according to window size and priority.
   * @return {Object} new position of target element.
   */
  getPosition() {
    const position = {
      x: this.getDistanceX(),
      y: this.getDistanceY(),
    };
    if (this.debug) console.log(position, 'is new position of reference.');
    return position;
  }

  /**
   * Set position of reference element.
   * @arg {Object} position of reference element.
   */
  setPosition(position) {
    this.reference.style.transform =
    `translate(${position.x}px, ${position.y}px)`;
  }

  /**
   * check if X axis is out of border.
   * @return {Float} X distance between reference and target.
   */
  getDistanceX() {
    const targetCenterDistanceX = this.target.offsetWidth / 2;
    const targetPosX = this.target.offsetLeft + targetCenterDistanceX;
    const refCenterDistanceX = this.reference.offsetWidth / 2;
    const referencePosX = this.reference.offsetLeft + refCenterDistanceX;
    let distanceX = targetPosX - referencePosX;
    /**
     * Check if reference is out of boundary.
     */
    const bodyWidth = document.body.clientWidth;
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
  getDistanceY() {
    let distanceY = this.calculateDistanceY();
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
  calculateDistanceY(posPriority = this.posPriority) {
    let targetPosY = 0;
    let referencePosY = 0;
    switch (posPriority) {
      case 'center':
        targetPosY =
        this.target.offsetTop + (this.target.offsetHeight / 2);
        referencePosY = this.reference.offsetTop +
        (this.reference.offsetHeight / 2);
        break;
      case 'top':
        targetPosY = this.target.offsetTop;
        referencePosY = this.reference.offsetTop + this.reference.offsetHeight +
        this.offset.y;
        break;
      case 'bottom':
        targetPosY = this.target.offsetTop + this.target.offsetHeight +
        this.offset.y;
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
  checkBoundaryY() {
    const topBoundary = document.body.scrollTop;
    const refTopBoundary = this.target.offsetTop -
    this.reference.offsetHeight - this.offset.y - this.bPadding.y;
    if (topBoundary >= refTopBoundary ) {
      console.warn('Reference bleeds from top.');
      return 'top';
    }
    const bottomBoundary = topBoundary + document.body.clientHeight;
    const refBottomBoundary = this.target.offsetTop +
    this.target.offsetHeight + this.reference.offsetHeight +
    this.offset.y + this.bPadding.y;
    if (refBottomBoundary > bottomBoundary) {
      console.warn('Reference bleeds from bottom.');
      return 'bottom';
    }
    return false;
  }
};

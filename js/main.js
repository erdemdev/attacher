/**
 * Attacher Styles
 */
import '../sass/main.scss';

/**
 * Base Attacher Class
 */
export default class Attacher {
  /**
   * Pass arguments to class properties.
   * @constructor
   * @arg {Element} reference element.
   * @arg {Object} options of attacher.
   * @prop {Element} target element.
   * @prop {Boolean} debug mode.
   * @prop {String} position ("top", "bottom", "center") of target.
   */
  constructor(reference, {
    target = undefined,
    debug = false,
    posPriority = 'top', // TODO add position priority support.
    transition = 2,
    offset = {x: 0, y: 10},
  }) {
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
    const targetPosX =
    this.target.offsetLeft + (this.target.offsetWidth / 2);
    const refCenterDistance = this.reference.offsetWidth / 2;
    const referencePosX = this.reference.offsetLeft + refCenterDistance;
    /**
     * Check is out of Boundary.
     */
    const bodyWidth = document.body.clientWidth;
    let distanceX = targetPosX - referencePosX;
    // TODO if bleeds position to clicked point.
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
  getDistanceY(posPriority = this.posPriority) {
    let targetPosY = 0;
    let referencePosY = 0;
    // TODO: ADD WINDOW SIZE PRIORITY
    /**
     * Select position according to priority.
     */
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
};

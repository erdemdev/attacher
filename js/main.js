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
   * @prop {String} position of reference to target.
   */
  constructor(reference, {
    target = undefined,
    debug = false,
    position = 'top',
    transition = 2,
  }) {
    this.reference = reference;
    this.target = target;
    this.debug = debug;
    this.position = position;
    this.transition = transition;
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
    const targetPosX = this.target.offsetLeft + (this.target.offsetWidth / 2);
    const targetPosY = this.target.offsetTop + (this.target.offsetHeight / 2);
    const referencePosX =
    this.reference.offsetLeft + (this.reference.offsetWidth / 2);
    const referencePosY =
    this.reference.offsetTop + (this.reference.offsetHeight / 2);
    const newPos = {
      x: targetPosX - referencePosX,
      y: targetPosY - referencePosY,
    };
    if (this.debug) console.log(newPos, 'is new position of reference.');
    this.reference.style.transform = `translate(${newPos.x}px, ${newPos.y}px)`;
  }
};

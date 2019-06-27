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
   * @param {Element} reference element.
   * @param {Element} target element to attach reference to.
   * @param {Object} options
   */
  constructor(reference, {
    target = undefined,
    debug = false,
    offset = {x: 10, y: 10},
  }) {
    this.reference = reference;
    this.target = target;
    this.debug = debug;
    this.offset = offset;
    if (debug) console.log(this, 'attacher component created.');
    this.init();
    if (target) this.bind(target);
  }

  /**
   * Set up reference element
   */
  init() {
    this.reference.style.position = 'absolute';
    this.reference.style.transition = '2s';
  }

  /**
   * Binds reference element to target element.
   * @param {Element} target could be a new target element.
   */
  bind(target) {
    const newPos = {
      x: target.offsetLeft - this.reference.offsetLeft,
      y: target.offsetTop - this.reference.offsetTop,
    };
    if (this.debug) console.log(newPos, 'is new position of reference.');
    this.reference.style.transform = `translate(${newPos.x}px, ${newPos.y}px)`;
  }

  /**
   * Unbinds reference element from target element.
   */
  unbind() {
    this.reference.style.transform = '';
  }
};

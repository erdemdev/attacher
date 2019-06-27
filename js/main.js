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
  constructor(reference, target, {
    debug = false,
    offset = {x: 10, y: 10},
  }) {
    this.reference = reference;
    this.target = target;
    this.debug = debug;
    this.offset = offset;
    if (debug) console.log(this, 'Attacher component created.');
  }

  /**
   * Binds reference to target.
   */
  bind() {
  }
};

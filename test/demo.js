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
 * Base Attacher Class
 */

var Attacher =
/*#__PURE__*/
function () {
  /**
   * Set up Attacher properties.
   */
  function Attacher() {
    _classCallCheck(this, Attacher);
  }
  /**
   * Attacher binds reference element to target element.
   * @param {element} reference
   * @param {element} target
   */


  _createClass(Attacher, [{
    key: "bind",
    value: function bind(reference, target) {}
  }]);

  return Attacher;
}();

/**
 * Import Styles
 */
var sample = new Attacher();
console.log(sample);

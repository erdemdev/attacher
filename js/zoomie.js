import Hammer from 'hammerjs';

/**
 * Zoomie Class
 */
export default class Zoomie {
  /**
   * @constructor
   * @arg {Element} element
   */
  constructor(element = undefined, {
    panStartCallback = () => {},
    panEndCallback = () => {},
    pinchStartCallback = () => {},
    pinchEndCallback = () => {},
    doubleTapStartCallback = () => {},
    doubleTapEndCallback = () => {},
    zoomOutLimit = 1,
    zoomInLimit = 7,
    viewportLockLimit = 2,
    bPadding = 100,
    activateDoubleTap = false,
    unlockedTapCallback = () => {},
  }) {
    this.element = element;
    this.panStartCallback = panStartCallback;
    this.panEndCallback = panEndCallback;
    this.pinchStartCallback = pinchStartCallback;
    this.pinchEndCallback = pinchEndCallback;
    this.doubleTapStartCallback = doubleTapStartCallback;
    this.doubleTapEndCallback = doubleTapEndCallback;
    this.zoomOutLimit = zoomOutLimit;
    this.zoomInLimit = zoomInLimit;
    this.viewportLockLimit = viewportLockLimit;
    this.bPadding = bPadding;
    this.activateDoubleTap = activateDoubleTap;
    this.isViewportLocked = false;
    this.unlockedTapCallback = unlockedTapCallback;
    this.originalSize = {
      width: element.offsetWidth,
      height: element.offsetHeight,
    };
    this.current = {
      x: 0,
      y: 0,
      z: 1,
      zooming: false,
      width: this.originalSize.width * 1,
      height: this.originalSize.height * 1,
    };
    this.last = {
      x: this.current.x,
      y: this.current.y,
      z: this.current.z,
    };
    this.lastEvent = undefined;
    this.fixHammerjsDeltaIssue = undefined;
    this.pinchZoomOrigin = undefined;
    this.pinchStart = {
      x: undefined,
      y: undefined,
    };
    /**
     * Hammer-js instance and options.
     */
    this.hammertime = new Hammer(this.element, {});
    this.hammertime.get('pinch').set({
      enable: true,
      threshold: 0,
    });
    this.hammertime.get('pan').set({
      threshold: 10,
    });
  }

  /**
   * Registers hammer-js event listeners.
   */
  startWatch() {
    this.tapWatch();
    if (this.activateDoubleTap) this.doubleTapWatch();
    this.panStartWatch();
    this.panWatch();
    this.panEndWatch();
    this.pinchStartWatch();
    this.pinchWatch();
    this.pinchEndWatch();
  }

  /**
   * Hammerjs tap watch.
   */
  tapWatch() {
    this.hammertime.on('tap', this.tapFunction = () => {
      if (this.isViewportLocked) {
        this.reset();
        this.element.style.transform = '';
      } else {
        this.unlockedTapCallback();
      }
    });
  }

  /**
   * Hammerjs doubletap watch
   */
  doubleTapWatch() {
    this.hammertime.on('doubletap', this.doubleTapFunction = (e) => {
      this.doubleTapStartCallback();
      let scaleFactor = 1;
      if (this.current.zooming === false) {
        this.current.zooming = true;
      } else {
        this.current.zooming = false;
        scaleFactor = -scaleFactor;
      }
      this.element.style.transition = '0.3s';
      setTimeout(() => {
        this.element.style.transition = 'none';
        this.doubleTapEndCallback(this.last.z);
      }, 300);
      const zoomOrigin = this.getRelativePosition(this.element, {
        x: e.center.x + window.scrollX,
        y: e.center.y + window.scrollY,
      }, this.originalSize, this.current.z);
      const d =
      this.scaleFrom(zoomOrigin, this.current.z, this.current.z + scaleFactor);
      this.current.x += d.x;
      this.current.y += d.y;
      this.current.z += d.z;
      this.last.x = this.current.x;
      this.last.y = this.current.y;
      this.last.z = this.current.z;
      this.update();
      this.lockViewport();
    });
  }

  /**
   * Hammerjs panstart watch
   */
  panStartWatch() {
    this.hammertime.on('panstart', this.panStartFunction = () => {
      this.element.style.transition = '';
      this.calculateBorders();
      this.panStartCallback();
    });
  }

  /**
   * Hammerjs pan watch
   */
  panWatch() {
    this.hammertime.on('pan', this.panFunction = (e) => {
      if (this.lastEvent !== 'pan') {
        this.fixHammerjsDeltaIssue = {
          x: e.deltaX,
          y: e.deltaY,
        };
      }
      this.current.x = this.last.x + e.deltaX - this.fixHammerjsDeltaIssue.x;
      this.current.x = Math.max(this.current.x, this.negativeBorderX);
      this.current.x = Math.min(this.current.x, this.positiveBorderX);
      this.current.y = this.last.y + e.deltaY - this.fixHammerjsDeltaIssue.y;
      this.lastEvent = 'pan';
      this.update();
    });
  }

  /**
   * Hammerjs panend watch
   */
  panEndWatch() {
    this.hammertime.on('panend', this.panEndFunction = () => {
      this.last.x = this.current.x;
      this.last.y = this.current.y;
      this.lastEvent = 'panend';
      this.panEndCallback();
    });
  }

  /**
   * Hammerjs pinchstart watch
   */
  pinchStartWatch() {
    this.hammertime.on('pinchstart', this.pinchStartFunction = (e) => {
      this.pinchStart.x = e.center.x + window.scrollX;
      this.pinchStart.y = e.center.y + window.scrollY;
      this.pinchZoomOrigin = this.getRelativePosition(this.element, {
        x: this.pinchStart.x,
        y: this.pinchStart.y,
      }, this.originalSize, this.current.z);
      this.element.style.transition = '';
      this.lastEvent = 'pinchstart';
      this.pinchStartCallback();
    });
  }

  /**
   * Hammerjs pinch watch
   */
  pinchWatch() {
    this.hammertime.on('pinch', this.pinchFunction = (e) => {
      const d =
      this.scaleFrom(this.pinchZoomOrigin, this.last.z, this.last.z * e.scale);
      this.current.x = d.x + this.last.x + e.deltaX;
      this.current.y = d.y + this.last.y + e.deltaY;
      this.current.z = Math.min(d.z + this.last.z, this.zoomInLimit);
      this.current.z = Math.max(this.current.z, this.zoomOutLimit);
      this.lastEvent = 'pinch';
      this.update();
    });
  }

  /**
   * Hammerjs pinchend watch
   */
  pinchEndWatch() {
    this.hammertime.on('pinchend', this.pinchEndFunction = () => {
      this.last.x = this.current.x;
      this.last.y = this.current.y;
      this.last.z = this.current.z;
      this.lastEvent = 'pinchend';
      this.pinchEndCallback(this.last.z);
    });
  }

  /**
   * Lock viewport if element size breaches limit.
   */
  lockViewport() {
    if (this.last.z > this.viewportLockLimit) {
      this.isViewportLocked = true;
    }
    if (this.last.z < this.viewportLockLimit) {
      this.isViewportLocked = false;
    }
  }

  /**
   * Unregisters hammer-js event listeners.
   */
  stopWatch() {
    if (this.activateDoubleTap) this.hammertime.off('doubletap');
    this.hammertime.off('pan');
    this.hammertime.off('panend');
    this.hammertime.off('pinchstart');
    this.hammertime.off('pinch');
    this.hammertime.off('pinchend');
  }

  /**
   * Resets the zoomie transforms
   */
  reset() {
    this.current = {
      x: 0,
      y: 0,
      z: 1,
      zooming: false,
      width: this.originalSize.width * 1,
      height: this.originalSize.height * 1,
    };
    this.last = {
      x: this.current.x,
      y: this.current.y,
      z: this.current.z,
    };
  }

  /**
  * Final function to modify element.
  */
  update() {
    this.current.height = this.originalSize.height * this.current.z;
    this.current.width = this.originalSize.width * this.current.z;
    this.element.style.transform =
    `translate3d(${this.current.x}px, ${this.current.y}px, 0) ` +
    `scale(${this.current.z})`;
    this.lockViewport();
  }

  /**
   * Calculates all pannable borders in both axis.
   */
  calculateBorders() {
    this.negativeBorderX = this.calculateNegativeBorderX();
    this.positiveBorderX = this.calculatePositiveBorderX();
  }

  /**
   * Limit pan value on negative x-axis.
   * @return {Float} border limit.
   */
  calculateNegativeBorderX() {
    const coords = this.element.getBoundingClientRect();
    const border = (coords.left + coords.width +
      window.scrollX - this.current.x) * -1;
    return border + this.bPadding;
  }

  /**
   * Limit pan value on positive x-axis.
   * @return {Float} border limit.
   */
  calculatePositiveBorderX() {
    const coords = this.element.getBoundingClientRect();
    const border = window.innerWidth -
    (coords.left + window.scrollX - this.current.x);
    return border - this.bPadding;
  }

  /**
  * @param {Element} element
  * @param {Object} point
  * @param {Object} originalSize
  * @param {Float} scale
  * @return {Object}
  */
  getRelativePosition(element, point, originalSize, scale) {
    const domCoords = this.getCoords(element);
    const elementX = point.x - domCoords.x;
    const elementY = point.y - domCoords.y;
    const relativeX = elementX / (originalSize.width * scale / 2) - 1;
    const relativeY = elementY / (originalSize.height * scale / 2) - 1;
    return {
      x: relativeX,
      y: relativeY,
    };
  }

  /**
  * @param {Element} elem
  * @return {Object}
  */
  getCoords(elem) { // crossbrowser version
    const box = elem.getBoundingClientRect();
    const body = document.body;
    const docEl = document.documentElement;
    const scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
    const scrollLeft =
    window.pageXOffset || docEl.scrollLeft || body.scrollLeft;
    const clientTop = docEl.clientTop || body.clientTop || 0;
    const clientLeft = docEl.clientLeft || body.clientLeft || 0;
    const top = box.top + scrollTop - clientTop;
    const left = box.left + scrollLeft - clientLeft;
    return {
      x: Math.round(left),
      y: Math.round(top),
    };
  }

  /**
  * @param {Object} zoomOrigin
  * @param {Float} currentScale
  * @param {Float} newScale
  * @return {Object}
  */
  scaleFrom(zoomOrigin, currentScale, newScale) {
    const originalSize = this.originalSize;
    const currentShift =
    this.getCoordinateShiftDueToScale(originalSize, currentScale);
    const newShift = this.getCoordinateShiftDueToScale(originalSize, newScale);
    const zoomDistance = newScale - currentScale;
    const shift = {
      x: currentShift.x - newShift.x,
      y: currentShift.y - newShift.y,
    };
    const output = {
      x: zoomOrigin.x * shift.x,
      y: zoomOrigin.y * shift.y,
      z: zoomDistance,
    };
    return output;
  }

  /**
  * @param {Object} size
  * @param {Float} scale
  * @return {Object}
  */
  getCoordinateShiftDueToScale(size, scale) {
    const newWidth = scale * size.width;
    const newHeight = scale * size.height;
    const dx = (newWidth - size.width) / 2;
    const dy = (newHeight - size.height) / 2;
    return {
      x: dx,
      y: dy,
    };
  }
};

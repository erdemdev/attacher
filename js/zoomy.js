import Hammer from 'hammerjs';

/**
 * Zoomy Class
 */
export default class Zoomy {
  /**
   * @constructor
   * @arg {Element} element
   */
  constructor(element = null) {
    this.element = element;
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
    this.hammertime = undefined;
  }

  /**
   * Registers hammer-js event listeners.
   */
  startWatch() {
    this.hammertime = new Hammer(this.element, {});
    this.hammertime.get('pinch').set({
      enable: true,
    });
    this.hammertime.get('pan').set({
      threshold: 10,
    });
    this.hammertime.on('doubletap', this.doubleTapCallback = (e) => {
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
      }, 300);
      const zoomOrigin = this.getRelativePosition(this.element, {
        x: e.center.x,
        y: e.center.y,
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
    });
    this.hammertime.on('pan', this.panCallback = (e) => {
      if (this.lastEvent !== 'pan') {
        this.fixHammerjsDeltaIssue = {
          x: e.deltaX,
          y: e.deltaY,
        };
      }
      this.current.x = this.last.x + e.deltaX - this.fixHammerjsDeltaIssue.x;
      this.current.y = this.last.y + e.deltaY - this.fixHammerjsDeltaIssue.y;
      this.lastEvent = 'pan';
      this.update();
    });
    this.hammertime.on('panend', this.panEndCallback = () => {
      this.last.x = this.current.x;
      this.last.y = this.current.y;
      this.lastEvent = 'panend';
    });
    this.hammertime.on('pinchstart', this.pinchStartCallback = (e) => {
      this.pinchStart.x = e.center.x + window.scrollX;
      this.pinchStart.y = e.center.y + window.scrollY;
      this.pinchZoomOrigin = this.getRelativePosition(this.element, {
        x: this.pinchStart.x,
        y: this.pinchStart.y,
      }, this.originalSize, this.current.z);
      this.lastEvent = 'pinchstart';
    });
    this.hammertime.on('pinch', this.pinchCallback = (e) => {
      const d =
      this.scaleFrom(this.pinchZoomOrigin, this.last.z, this.last.z * e.scale);
      this.current.x = d.x + this.last.x + e.deltaX;
      this.current.y = d.y + this.last.y + e.deltaY;
      this.current.z = d.z + this.last.z;
      this.lastEvent = 'pinch';
      this.update();
    });
    this.hammertime.on('pinchend', this.pinchEndCallback = () => {
      this.last.x = this.current.x;
      this.last.y = this.current.y;
      this.last.z = this.current.z;
      this.lastEvent = 'pinchend';
    });
  }

  /**
   * Unregisters hammer-js event listeners.
   */
  stopWatch() {
    this.hammertime.off('doubletap');
    this.hammertime.off('pan');
    this.hammertime.off('panend');
    this.hammertime.off('pinchstart');
    this.hammertime.off('pinch');
    this.hammertime.off('pinchend');
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

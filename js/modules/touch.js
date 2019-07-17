import interact from 'interactjs';

/**
 * @param {Element} gestureArea
 * @param {Element} scaleElement
 */
export default class Touch {
  /**
   * @constructor
   * @param {Element} gestureArea
   * @param {Element} scaleElement
   */
  constructor(gestureArea, scaleElement, {
    zoom: {
      enable: canZoom = true,
      min: zoomOutLimit = 1,
      max: zoomInLimit = 5,
      threshold: zoomThreshold = 2.5,
    } = {},
    pan: {
      enable: canPan = true,
    } = {},
    callbacks: {
      pinchStartCallback = () => {},
      pinchEndCallback = () => {},
      dragStartCallback = () => {},
      dragEndCallback = () => {},
    } = {},
  }) {
    this.gestureArea = gestureArea;
    this.scaleElement = scaleElement;
    this.gestureArea.style.touchAction = 'none';
    this.canZoom = canZoom;
    this.zoomOutLimit = zoomOutLimit;
    this.zoomInLimit = zoomInLimit;
    this.zoomThreshold = zoomThreshold;
    this.zoomLockActive = false;
    this.canPan = canPan;
    this.pinchStartCallback = pinchStartCallback;
    this.pinchEndCallback = pinchEndCallback;
    this.dragStartCallback = dragStartCallback;
    this.dragEndCallback = dragEndCallback;
    this.originalSize = {
      width: scaleElement.offsetWidth,
      height: scaleElement.offsetHeight,
    };
    this.current = {
      x: 0,
      y: 0,
      z: 1,
      width: this.originalSize.width,
      height: this.originalSize.height,
    };
    this.last = {
      x: this.current.x,
      y: this.current.y,
      z: this.current.z,
    };
    this.pinchZoomOrigin = undefined;
    this.pinchStart = {
      x: undefined,
      y: undefined,
    };
    this.interactable = interact(this.gestureArea);
    this.startTouch();
  }

  /**
   * Enable Touch Events with interact-js
   */
  startTouch() {
    this.activateZoomWatch();
    this.activatePanWatch();
  }

  /**
   * Interact-js zoom watch
   */
  activateZoomWatch() {
    if (this.canZoom) {
      this.interactable.gesturable({
        onstart: (e) => {
          this.pinchStartCallback();
        },
        onmove: (e) => {
          this.current.x = this.last.x + e.dx;
          this.last.x = this.current.x;
          this.current.y = this.last.y + e.dy;
          this.last.y = this.current.y;
          this.current.z = this.last.z * e.scale;
          this.update(e);
        },
        onend: () => {
          this.last.z = this.current.z;
          this.setMaxMinScale();
          this.switchZoomMode();
          this.pinchEndCallback();
        },
      });
    }
  }

  /**
   * Interact-js pan watch
   */
  activatePanWatch() {
    if (this.canPan) {
      this.interactable.draggable({
        inertia: true,
        modifiers: [
          interact.modifiers.restrict({
            restriction: 'parent',
            endOnly: true,
            elementRect: {
              top: 0,
              left: 0,
              bottom: 1,
              right: 1,
            },
          }),
        ],
        autoScroll: true,
        onstart: () => {
          this.dragStartCallback();
        },
        onmove: (e) => {
          this.current.x = this.last.x + e.dx;
          this.last.x = this.current.x;
          this.current.y = this.last.y + e.dy;
          this.last.y = this.current.y;
          this.current.z = this.last.z;
          this.update(e);
        },
        onend: () => {
          this.dragEndCallback();
        },
      });
    }
  }

  /**
   * Decides between min and max value.
   * Then changes element size accordingly.
   */
  setMaxMinScale() {
    if (this.last.z > this.zoomInLimit) {
      this.setMaxScale();
    }

    if (this.last.z < this.zoomOutLimit) {
      this.setMinScale();
    }
  }

  /**
   * Switches zoom mode.
   */
  switchZoomMode() {
    if (this.last.z > this.zoomThreshold && this.zoomLockActive == false) {
      this.interactable.options.drag.modifiers[0].options.enabled = false;
      this.zoomLockActive = true;
      document.addEventListener('click', this.cancelZoom = (e) => {
        e.preventDefault();
        this.resetTransform();
      });
    }

    if (this.last.z < this.zoomThreshold && this.zoomLockActive == true) {
      this.interactable.options.drag.modifiers[0].options.enabled = true;
      this.zoomLockActive = false;
      document.removeEventListener('click', this.cancelZoom);
    }
  }

  /**
  * @param {Event} e
  */
  update(e) {
    this.gestureArea.style.webkitTransform =
    this.gestureArea.style.transform =
    `translate(${this.current.x}px, ${this.current.y}px)`;

    this.scaleElement.style.webkitTransform =
    this.scaleElement.style.transform = `scale(${this.current.z})`;
  }

  /**
   * Get two fingers' center
   * @param {Event} event
   * @return {Object} return center points of two fingers.
   */
  getPinchOrigin(event) {
    return {
      x: event.x0,
      y: event.y0,
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
    const newShift =
    this.getCoordinateShiftDueToScale(originalSize, newScale);
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
   * Add interact-js event listeners.
   */
  enableTouch() {
    if (this.canZoom) this.interactable.gesturable(true);
    if (this.canPan) this.interactable.draggable(true);
  }

  /**
   * Remove interact-js event listeners.
   */
  disableTouch() {
    this.interactable
        .gesturable(false)
        .draggable(false);
  }

  /**
   * Set scaleElement's scale to max.
   */
  setMaxScale() {
    this.scaleElement.style.webkitTransform =
    this.scaleElement.style.transform = `scale(${this.zoomInLimit})`;

    this.last.z = this.zoomInLimit;
  }

  /**
   * Set scaleElement's scale to min.
   */
  setMinScale() {
    this.scaleElement.style.webkitTransform =
    this.scaleElement.style.transform = `scale(${this.zoomOutLimit})`;

    this.last.z = this.zoomOutLimit;
  }

  /**
   * Reset Scale and Position
   */
  resetTransform() {
    this.resetScale();
    this.resetPosition();
  }

  /**
  * Reset Scale
  */
  resetScale() {
    this.scaleElement.style.webkitTransform =
    this.scaleElement.style.transform = 'scale(1)';

    this.last.z = 1;
  }

  /**
   * Reset Position
   */
  resetPosition() {
    this.gestureArea.style.webkitTransform =
    this.gestureArea.style.transform = '';

    this.last.x = 0;
    this.last.y = 0;
  }
};

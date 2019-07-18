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
      threshold: zoomThreshold = 2,
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
    debug = false,
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
    this.current = {x: 0, y: 0, z: 1};
    this.last = {
      x: this.current.x,
      y: this.current.y,
      z: this.current.z,
    };
    this.debug = debug;
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
          this.scaleStartListener(e);
          this.pinchStartCallback();
        },
        onmove: (e) => {
          this.dragMoveListener(e);
          this.scaleMoveListener(e);
        },
        onend: (e) => {
          this.scaleEndListener(e);
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
          this.dragMoveListener(e);
        },
        onend: () => {
          this.dragEndCallback();
        },
      });
    }
  }

  /**
  * @param {Event} e
  */
  dragMoveListener(e) {
    const target = e.target;

    this.current.x += e.dx;
    this.current.y += e.dy;

    target.style.webkitTransform =
    target.style.transform =
    `translate(${this.current.x}px, ${this.current.y}px)`;
  }

  /**
  * @param {Event} e
  */
  scaleStartListener(e) {
    const pinchOrigin = this.getPinchOrigin(e);

    this.current.x = this.last.x;
    this.current.y = this.last.y;

    this.scaleElement.style.webkitTransformOrigin =
    this.scaleElement.style.transformOrigin =
    `${pinchOrigin.x}% ${pinchOrigin.y}%`;
  }

  /**
  * @param {Event} e
  */
  scaleMoveListener(e) {
    this.current.z = this.last.z * e.scale;
    this.scaleElement.style.webkitTransform =
    this.scaleElement.style.transform = `scale(${this.current.z})`;
  }

  /**
   * Finish listening
  * @param {Event} e
   */
  scaleEndListener(e) {
    this.last.x = this.current.x;
    this.last.y = this.current.y;
    this.last.z = this.current.z;

    const scaleElemRect = this.scaleElement.getBoundingClientRect();
    const gestureAreaRect = this.gestureArea.getBoundingClientRect();
    const offsetGestureArea = {
      x: scaleElemRect.left - gestureAreaRect.left,
      y: scaleElemRect.top - gestureAreaRect.top,
    };

    this.current.x += offsetGestureArea.x;
    this.current.y += offsetGestureArea.y;

    this.dragMoveListener(e);

    this.scaleElement.style.webkitTransition =
    this.scaleElement.style.transition = '0s';
    this.scaleElement.style.webkitTransformOrigin =
    this.scaleElement.style.transformOrigin = '0% 0%';
  }

  /**
   * Get two fingers' center
   * @param {Event} e
   * @return {Object} return center points of two fingers.
   */
  getPinchOrigin(e) {
    const scaleElemRect = this.scaleElement.getBoundingClientRect();

    const pinchCoords = {
      x: (e.clientX + e.clientX0) / 2,
      y: (e.clientY + e.clientY0) / 2,
    };

    const clientCoords = {
      x: pinchCoords.x - scaleElemRect.left,
      y: pinchCoords.y - scaleElemRect.top,
    };

    const result = {
      x: clientCoords.x * 100 / scaleElemRect.width,
      y: clientCoords.y * 100 / scaleElemRect.height,
    };

    return result;
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
      if (this.debug) console.warn('zoom mode switched on.');
    }

    if (this.last.z < this.zoomThreshold && this.zoomLockActive == true) {
      this.interactable.options.drag.modifiers[0].options.enabled = true;
      this.zoomLockActive = false;
      document.removeEventListener('click', this.cancelZoom);
      if (this.debug) console.warn('zoom mode switched off.');
    }
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

    this.current.x = 0;
    this.current.y = 0;
  }
};

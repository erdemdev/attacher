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
      zoomOutLimit = 1,
      zoomInLimit = 7,
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
    this.pinchStartCallback = pinchStartCallback;
    this.pinchEndCallback = pinchEndCallback;
    this.dragStartCallback = dragStartCallback;
    this.dragEndCallback = dragEndCallback;
    this.zoomOutLimit = zoomOutLimit;
    this.zoomInLimit = zoomInLimit;
    this.scale = 1;
    this.resetTimeout;
    this.interactInstance = interact(this.gestureArea);
    this.startTouch();
  }

  /**
   * Enable Touch Events with interact-js
   */
  startTouch() {
    // Start interactjs
    this.interactInstance.gesturable({
      onstart: (event) => {
        clearTimeout(this.resetTimeout);
        this.scaleElement.classList.remove('reset');
        this.pinchStartCallback();
      },
      onmove: (event) => {
        this.dragMoveListener(event);
        const currentScale = event.scale * this.scale;

        if (currentScale > this.zoomInLimit) {
          this.setMaxScale();
          return;
        }

        if (currentScale < this.zoomOutLimit) {
          this.resetScale();
          return;
        }

        this.scaleElement.style.webkitTransform =
        this.scaleElement.style.transform = `scale(${currentScale})`;
      },
      onend: (event) => {
        this.scale = this.scale * event.scale;
        this.scaleElement.classList.add('reset');
        this.pinchEndCallback();
      },
    }).draggable({
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
      onmove: this.dragMoveListener,
      onend: () => {
        this.dragEndCallback();
      },
    });
  }

  /**
   * Add interact-js event listeners.
   */
  enableTouch() {
    this.interactInstance.gesturable(true).draggable(true);
  }

  /**
   * Remove interact-js event listeners.
   */
  disableTouch() {
    this.interactInstance.gesturable(false).draggable(false);
  }

  /**
   * Set scaleElement's scale to max.
   */
  setMaxScale() {
    this.scaleElement.style.webkitTransform =
    this.scaleElement.style.transform = `scale(${this.zoomInLimit})`;

    this.scale = this.zoomInLimit;
  }

  /**
  * Reset Scale
  */
  resetScale() {
    this.scaleElement.style.webkitTransform =
    this.scaleElement.style.transform = 'scale(1)';

    this.scale = 1;
  }

  /**
   * Reset Position
   */
  resetPosition() {
    this.gestureArea.style.webkitTransform =
    this.gestureArea.style.transform = '';

    this.gestureArea.setAttribute('data-x', 0);
    this.gestureArea.setAttribute('data-y', 0);
  }

  /**
   * Reset Scale and Position
   */
  resetTransform() {
    this.resetScale();
    this.resetPosition();
  }

  /**
  * @param {Event} event
  */
  dragMoveListener(event) {
    const target = event.target;
    const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
    const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

    target.style.webkitTransform =
      target.style.transform = `translate(${x}px, ${y}px)`;

    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
  }
};

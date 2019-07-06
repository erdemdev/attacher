import Hammer from 'hammerjs';

/**
 * Zooming functions.
 * @param {Element} refElem
 */
export default function zoomy(refElem) {
  const element = refElem;

  const originalSize = {
    width: 200,
    height: 100,
  };

  const current = {
    x: 0,
    y: 0,
    z: 1,
    zooming: false,
    width: originalSize.width * 1,
    height: originalSize.height * 1,
  };

  const last = {
    x: current.x,
    y: current.y,
    z: current.z,
  };

  let lastEvent = undefined;
  let fixHammerjsDeltaIssue = undefined;

  let pinchZoomOrigin = undefined;

  const pinchStart = {
    x: undefined,
    y: undefined,
  };

  const hammertime = new Hammer(element, {});

  hammertime.get('pinch').set({
    enable: true,
  });

  hammertime.get('pan').set({
    threshold: 0,
  });

  hammertime.on('doubletap', function(e) {
    let scaleFactor = 1;
    if (current.zooming === false) {
      current.zooming = true;
    } else {
      current.zooming = false;
      scaleFactor = -scaleFactor;
    }
    element.style.transition = '0.3s';
    setTimeout(function() {
      element.style.transition = 'none';
    }, 300);
    const zoomOrigin = getRelativePosition(element, {
      x: e.center.x,
      y: e.center.y,
    }, originalSize, current.z);
    const d = scaleFrom(zoomOrigin, current.z, current.z + scaleFactor);
    current.x += d.x;
    current.y += d.y;
    current.z += d.z;
    last.x = current.x;
    last.y = current.y;
    last.z = current.z;
    update();
  });

  hammertime.on('pan', function(e) {
    if (lastEvent !== 'pan') {
      fixHammerjsDeltaIssue = {
        x: e.deltaX,
        y: e.deltaY,
      };
    }
    current.x = last.x + e.deltaX - fixHammerjsDeltaIssue.x;
    current.y = last.y + e.deltaY - fixHammerjsDeltaIssue.y;
    lastEvent = 'pan';
    update();
  });

  hammertime.on('pinch', function(e) {
    const d = scaleFrom(pinchZoomOrigin, last.z, last.z * e.scale);
    current.x = d.x + last.x + e.deltaX;
    current.y = d.y + last.y + e.deltaY;
    current.z = d.z + last.z;
    lastEvent = 'pinch';
    update();
  });

  hammertime.on('pinchstart', function(e) {
    pinchStart.x = e.center.x;
    pinchStart.y = e.center.y;
    pinchZoomOrigin = getRelativePosition(element, {
      x: pinchStart.x,
      y: pinchStart.y,
    }, originalSize, current.z);
    lastEvent = 'pinchstart';
  });

  hammertime.on('panend', function(e) {
    last.x = current.x;
    last.y = current.y;
    lastEvent = 'panend';
  });

  hammertime.on('pinchend', function(e) {
    last.x = current.x;
    last.y = current.y;
    last.z = current.z;
    lastEvent = 'pinchend';
  });

  /**
  * Final function to modify element.
  */
  function update() {
    current.height = originalSize.height * current.z;
    current.width = originalSize.width * current.z;
    element.style.transform =
    `translate3d(${current.x}px, ${current.y}px, 0) scale(${current.z})`;
  }

  /**
  * @param {Element} element
  * @param {Object} point
  * @param {Object} originalSize
  * @param {Float} scale
  * @return {Object}
  */
  function getRelativePosition(element, point, originalSize, scale) {
    const domCoords = getCoords(element);
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
  function getCoords(elem) { // crossbrowser version
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
  function scaleFrom(zoomOrigin, currentScale, newScale) {
    const currentShift =
    getCoordinateShiftDueToScale(originalSize, currentScale);
    const newShift = getCoordinateShiftDueToScale(originalSize, newScale);
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
  function getCoordinateShiftDueToScale(size, scale) {
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

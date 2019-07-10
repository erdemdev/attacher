/**
 * Import Styles
 */
import '../sass/demo.scss';

/**
 * Import Main.js module
 */
import Attacher from './main';

/**
 * Get reference and target elements.
 */
const reference = document.querySelector('.reference--interactive');
const targets = document.querySelectorAll('.target');

/**
 * Create interactive attacher example. (Only for demonstration.)
 */
const attacher = new Attacher(reference, {
  target: targets[0],
  posPriority: 'top',
  transition: 1,
  debug: true,
  touch: {
    canZoom: true,
    canPan: false,
  },
});

/**
 * Create static attacher example.
 */
new Attacher(document.querySelector('.reference--static'), {
  target: document.querySelector('.target--static'),
  debug: true,
});

/**
 * Click and key events for debugging.
 */
let isVisible = true;

document.addEventListener('keyup', (e) => {
  e.preventDefault();

  // Document reference bleeding test.
  if (e.keyCode == 66) reference.classList.toggle('reference--bleed');

  // Attacher activate/deactivate test.
  if (e.keyCode == 32) {
    isVisible ? attacher.deactivate() : attacher.activate();
    isVisible = !isVisible;
  }
});

// Unbind Attacher
reference.addEventListener('click', (e) => {
  /* attacher.unbind(); */
});

// Bind Attacher to clicked targets.
let i = 0; for (i; i < targets.length; i++) {
  const target = targets[i];

  target.addEventListener('click', (e) => {
    e.preventDefault();
    attacher.bind(e.target);
  });
}

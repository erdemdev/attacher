/**
 * Import Styles
 */
import '../sass/demo.scss';

/**
 * Import Main.js module
 */
import Attacher from './main';

// eslint-disable-next-line prefer-const
const reference = document.querySelector('.reference');
const targets = document.querySelectorAll('.target');

let i = 0; for (i; i < targets.length; i++) {
  const target = targets[i];
  /* let attacher = null; */
  new Attacher(reference, target, {
    debug: true,
  });
  /* target.addEventListener('click', (e) => {
    e.preventDefault();
    if (attacher) return;
    attacher = new Attacher(reference, target, {
      debug: true,
    });
  }); */
}

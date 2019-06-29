/**
 * Import Styles
 */
import '../sass/demo.scss';

/**
 * Import Main.js module
 */
import Attacher from './main';

const reference = document.querySelector('.reference');
const targets = document.querySelectorAll('.target');

let attacher = attacher = new Attacher(reference, {
  target: targets[0],
  posPriority: 'top',
  debug: true,
});

reference.addEventListener('click', (e) => {
  e.preventDefault();
  attacher.unbind();
});

let i = 0; for (i; i < targets.length; i++) {
  const target = targets[i];

  target.addEventListener('click', (e) => {
    e.preventDefault();
    attacher.bind(e.target);
  });
}

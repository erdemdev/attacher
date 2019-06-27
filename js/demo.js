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
  debug: true,
});

reference.addEventListener('click', (e) => {
  e.preventDefault();
  attacher.unbind();
});

window.addEventListener('resize', () => {
  document.body.style.display = 'none';
  setTimeout(() => {
    document.body.style.display = '';
    attacher.refresh();
  }, 50);
});

let i = 0; for (i; i < targets.length; i++) {
  const target = targets[i];

  target.addEventListener('click', (e) => {
    e.preventDefault();
    attacher.bind(e.target);
  });
}

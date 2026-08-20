export const cleanupBootstrapModals = () => {
  document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
  document.body.classList.remove('modal-open');
  document.body.removeAttribute('style');
  document.documentElement.style.overflow = '';
};

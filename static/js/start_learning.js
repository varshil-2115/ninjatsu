document.addEventListener('DOMContentLoaded', () => {
  const trainingButtons = document.querySelectorAll('.scroll-btn');

  trainingButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {

      console.log('Entering training station:', btn.href);
    });
  });
});
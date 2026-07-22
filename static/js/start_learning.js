

document.addEventListener('DOMContentLoaded', () => {
  const drillButtons = document.querySelectorAll('.scroll-btn');

  drillButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      console.log('Entering skill training drill...');
    });
  });
});
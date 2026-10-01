export const initCollageStripe = () => {
  const path = document.querySelector('.collage-stripe__svg path');
  const section = document.querySelector('.collage');
  if (!path || !section) return;


  const durationMs = 9500; // Скорость анимации в миллисекундах
  path.style.setProperty('--collage-stripe-duration', `${durationMs}ms`);

  const run = () => {
    requestAnimationFrame(() => {
      path.style.strokeDashoffset = '0';
    });
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          run();
          observer.disconnect();
        });
      },
      { threshold: 0.35 }
    );

    observer.observe(section);
    return;
  }

  // Fallback: run on first load if observer is unavailable
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run, { once: true });
  } else {
    run();
  }
};

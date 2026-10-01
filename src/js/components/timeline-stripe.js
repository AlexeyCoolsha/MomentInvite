const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export const initTimelineStripe = () => {
  const section = document.querySelector('.timeline');
  const stripe = document.querySelector('.timeline-stripe');
  const path = stripe?.querySelector('path');

  if (!section || !stripe || !path) return;

  const updateStripe = () => {
    const rect = section.getBoundingClientRect();
    const viewportHeight = window.innerHeight || 0;
    const distance = Math.max(1, rect.height + viewportHeight);

    const speed = 1.2;
    const progress = clamp(((viewportHeight - rect.top) / distance) * speed, 0, 1);
    // const progress = clamp((viewportHeight - rect.top) / distance, 0, 1);
    path.style.strokeDashoffset = (1 - progress).toFixed(3);
  };

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateStripe();
      ticking = false;
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);

  updateStripe();
};

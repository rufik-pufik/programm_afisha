function initHeroDot() {
  const hero = document.querySelector(".hero");
  const dot = document.querySelector(".hero__dot");
  const photo = document.querySelector(".hero__photo");

  if (!hero || !dot || !photo) {
    return;
  }

  function onScroll() {
    const top = hero.getBoundingClientRect().top;
    const total = hero.offsetHeight - window.innerHeight;
    const fillSpeed = 2.5;
    let progress = 0;

    if (total > 0) {
      progress = -top / total * fillSpeed;
    }

    if (progress < 0) {
      progress = 0;
    }

    if (progress > 1) {
      progress = 1;
    }

    const size = dot.offsetWidth;
    const w = photo.offsetWidth;
    const h = photo.offsetHeight;
    const x = w * 0.505;
    const y = h * 0.45;
    const maxDist = Math.max(
      Math.sqrt(x * x + y * y),
      Math.sqrt((w - x) * (w - x) + y * y),
      Math.sqrt(x * x + (h - y) * (h - y)),
      Math.sqrt((w - x) * (w - x) + (h - y) * (h - y))
    );
    const need = (maxDist * 2.1) / size;
    const scale = 1 + progress * (need - 1);

    dot.style.transform = "translate(-50%, -50%) scale(" + scale + ")";
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();
}

function initSliders() {
  const sliders = document.querySelectorAll(".js-slider");

  sliders.forEach(function (slider) {
    const effect = slider.dataset.effect || "slide";
    const loop = slider.dataset.loop !== "false";
    const autoplay = slider.dataset.autoplay;
    const perView = slider.dataset.perView;
    const space = slider.dataset.space;
    const speed = slider.dataset.speed;

    const options = {
      slidesPerView: 1,
      spaceBetween: space ? Number(space) : 12,
      loop: loop,
      speed: speed ? Number(speed) : 500,
    };

    if (perView === "auto") {
      options.slidesPerView = "auto";
    } else if (perView) {
      options.slidesPerView = Number(perView);
    }

    if (effect === "fade") {
      options.effect = "fade";
      options.fadeEffect = {
        crossFade: true,
      };
    }

    if (effect === "coverflow") {
      options.effect = "coverflow";
      options.slidesPerView = "auto";
      options.centeredSlides = true;
      options.coverflowEffect = {
        rotate: 20,
        stretch: 0,
        depth: 120,
        modifier: 1,
        slideShadows: false,
      };
    }

    if (effect === "cards") {
      options.effect = "cards";
      options.grabCursor = true;
      options.cardsEffect = {
        perSlideOffset: 8,
        perSlideRotate: 2,
      };
    }

    if (effect === "flip") {
      options.effect = "flip";
    }

    if (effect === "creative") {
      options.effect = "creative";
      options.creativeEffect = {
        prev: {
          translate: ["-20%", 0, -1],
          opacity: 0,
        },
        next: {
          translate: ["100%", 0, 0],
        },
      };
    }

    const pagination = slider.querySelector(".swiper-pagination");
    if (pagination) {
      options.pagination = {
        el: pagination,
        clickable: true,
      };
    }

    const nextBtn = slider.querySelector(".slider-next");
    const prevBtn = slider.querySelector(".slider-prev");
    if (nextBtn && prevBtn) {
      options.navigation = {
        nextEl: nextBtn,
        prevEl: prevBtn,
      };
    }

    if (autoplay) {
      options.autoplay = {
        delay: Number(autoplay),
        disableOnInteraction: false,
      };
    }

    new Swiper(slider, options);
  });
}

function flipQueue(root, itemSel) {
  if (!root) {
    return;
  }

  const track = root.firstElementChild;
  let busy = false;

  root.addEventListener("click", function (e) {
    const target = e.target.closest(itemSel);

    if (!target || target.classList.contains("is-main") || busy) {
      return;
    }

    const current = track.querySelector(".is-main");

    if (!current) {
      return;
    }

    const leaving = [];
    let node = current;

    while (node && node !== target) {
      leaving.push(node);
      node = node.nextElementSibling;
    }

    if (!node) {
      return;
    }

    busy = true;
    current.classList.remove("is-main");

    leaving.forEach(function (el) {
      el.classList.add("is-leave");
    });

    target.classList.add("is-main");

    setTimeout(function () {
      leaving.forEach(function (el) {
        el.classList.remove("is-leave");
        track.appendChild(el);
      });
      busy = false;
    }, 560);
  });
}

function initRehearsal() {
  flipQueue(document.querySelector(".js-rehearsal"), ".rehearsal__card");
}

function initActors() {
  flipQueue(document.querySelector(".js-actors"), ".actors__slide");
}

function initHScroll() {
  const wraps = document.querySelectorAll(".js-hscroll");

  wraps.forEach(function (wrap) {
    let startX = 0;
    let startY = 0;
    let lock = "";
    let mouseOn = false;
    let mouseStart = 0;
    let mouseLeft = 0;

    wrap.addEventListener(
      "touchstart",
      function (e) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        lock = "";
        wrap.dragMoved = false;
      },
      { passive: true }
    );

    wrap.addEventListener(
      "touchmove",
      function (e) {
        if (lock === "y") {
          return;
        }

        const dx = Math.abs(e.touches[0].clientX - startX);
        const dy = Math.abs(e.touches[0].clientY - startY);

        if (dx < 8 && dy < 8) {
          return;
        }

        lock = dy > dx ? "y" : "x";

        if (lock === "y") {
          wrap.style.overflowX = "hidden";
        }

        if (lock === "x") {
          wrap.dragMoved = true;
        }
      },
      { passive: true }
    );

    wrap.addEventListener("touchend", function () {
      wrap.style.overflowX = "";
      lock = "";
    });

    wrap.addEventListener("touchcancel", function () {
      wrap.style.overflowX = "";
      lock = "";
    });

    wrap.addEventListener("mousedown", function (e) {
      if (e.button !== 0) {
        return;
      }

      mouseOn = true;
      wrap.dragMoved = false;
      mouseStart = e.clientX;
      mouseLeft = wrap.scrollLeft;
      wrap.classList.add("is-drag");
      e.preventDefault();
    });

    window.addEventListener("mousemove", function (e) {
      if (!mouseOn) {
        return;
      }

      const dx = e.clientX - mouseStart;

      if (Math.abs(dx) > 4) {
        wrap.dragMoved = true;
      }

      wrap.scrollLeft = mouseLeft - dx;
    });

    window.addEventListener("mouseup", function () {
      if (!mouseOn) {
        return;
      }

      mouseOn = false;
      wrap.classList.remove("is-drag");
    });
  });
}

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

function flipQueue(root, itemSel, loop) {
  if (!root) {
    return;
  }

  const track = root.firstElementChild;
  const looped = loop !== false;

  // очередь должна выходить за правый край: иначе клон, который goTo дописывает
  // в хвост, рождается на виду. Дублируем набор, пока трек короче полутора экранов.
  // без цикла хвоста не существует, дублировать нечего.
  const originals = Array.prototype.slice.call(track.children);

  for (let pass = 0; looped && pass < 10; pass++) {
    const viewport = root.clientWidth;
    // при неготовом layout clientWidth отдаёт одни паддинги: замеру верить нельзя,
    // тогда страхуемся лишней копией набора вместо сравнения ширин
    const measurable = viewport > 100;
    const enough = measurable
      ? track.getBoundingClientRect().width >= viewport * 1.5
      : track.children.length >= originals.length * 2;

    if (enough) {
      break;
    }

    originals.forEach(function (el) {
      const copy = el.cloneNode(true);
      copy.classList.remove("is-main");
      track.appendChild(copy);
    });
  }

  const step = 50;
  let busy = false;
  let dragX = 0;
  let dragging = false;

  function goTo(target) {
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
      if (looped) {
        // копия сразу занимает место в хвосте, иначе справа дыра до конца анимации
        const copy = el.cloneNode(true);
        copy.classList.remove("is-main");
        copy.classList.add("is-leave");
        track.appendChild(copy);
        void copy.offsetWidth; // reflow: зафиксировать нулевую ширину до раскрытия
        copy.classList.remove("is-leave");
      }

      el.classList.add("is-leave");
    });

    target.classList.add("is-main");

    setTimeout(function () {
      if (looped) {
        leaving.forEach(function (el) {
          el.remove();
        });
      }

      busy = false;
    }, 560);
  }

  function goBack() {
    const current = track.querySelector(".is-main");

    if (busy || !current) {
      return;
    }

    if (!looped) {
      const prev = current.previousElementSibling;

      // начало очереди: дальше назад некуда
      if (!prev) {
        return;
      }

      busy = true;
      current.classList.remove("is-main");
      prev.classList.remove("is-leave");
      prev.classList.add("is-main");

      setTimeout(function () {
        busy = false;
      }, 560);

      return;
    }

    const back = track.lastElementChild;

    if (!back || back === current) {
      return;
    }

    busy = true;
    back.classList.add("is-leave");
    track.insertBefore(back, current);
    void back.offsetWidth; // reflow: зафиксировать нулевую ширину до анимации раскрытия
    current.classList.remove("is-main");
    back.classList.remove("is-leave");
    back.classList.add("is-main");

    setTimeout(function () {
      busy = false;
    }, 560);
  }

  root.addEventListener("pointerdown", function (e) {
    if (e.button !== 0) {
      return;
    }

    dragging = true;
    dragX = e.clientX;
    root.dragMoved = false;

    if (e.pointerType === "mouse") {
      e.preventDefault();
    }
  });

  root.addEventListener("pointermove", function (e) {
    if (!dragging) {
      return;
    }

    // пока идёт анимация, жест не копим: иначе накопленный за 560мс путь
    // перепрыгнет порог сразу после busy и переход сработает рывком
    if (busy) {
      dragX = e.clientX;
      return;
    }

    const dx = e.clientX - dragX;

    if (Math.abs(dx) < step) {
      return;
    }

    dragX = e.clientX;
    root.dragMoved = true;

    if (dx < 0) {
      const current = track.querySelector(".is-main");
      goTo(current && current.nextElementSibling);
    } else {
      goBack();
    }
  });

  function dragStop() {
    dragging = false;
  }

  root.addEventListener("pointerup", dragStop);
  root.addEventListener("pointercancel", dragStop);
  root.addEventListener("pointerleave", dragStop);

  root.addEventListener("click", function (e) {
    if (root.dragMoved) {
      return;
    }

    goTo(e.target.closest(itemSel));
  });
}

function initRehearsal() {
  flipQueue(document.querySelector(".js-rehearsal"), ".rehearsal__card");
}

function initActors() {
  flipQueue(document.querySelector(".js-actors"), ".actors__slide", false);
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

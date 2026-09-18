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

function initRehearsal() {
  const viewport = document.querySelector(".js-rehearsal");

  if (!viewport) {
    return;
  }

  const track = viewport.querySelector(".rehearsal__track");
  let busy = false;

  viewport.addEventListener("click", function (e) {
    const nextCard = e.target.closest(".rehearsal__card.is-next");

    if (!nextCard || busy) {
      return;
    }

    const mainCard = track.querySelector(".is-main");
    const upcoming = track.querySelector(".rehearsal__card:not(.is-main):not(.is-next)");

    busy = true;
    mainCard.classList.remove("is-main");
    nextCard.classList.remove("is-next");
    nextCard.classList.add("is-main");

    if (upcoming) {
      upcoming.classList.add("is-next");
    }

    let done = false;

    function finish() {
      if (done) {
        return;
      }

      done = true;
      nextCard.removeEventListener("transitionend", onEnd);
      track.appendChild(mainCard);
      busy = false;
    }

    function onEnd(event) {
      if (event.propertyName === "width") {
        finish();
      }
    }

    nextCard.addEventListener("transitionend", onEnd);
    setTimeout(finish, 500);
  });
}

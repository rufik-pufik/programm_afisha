function initMenu() {
  const nav = document.querySelector(".nav");
  const openBtn = document.querySelector(".header__menu");
  const closeBtn = document.querySelector(".nav__close");
  const links = document.querySelectorAll(".nav__link");

  if (!nav || !openBtn || !closeBtn) {
    return;
  }

  function openMenu() {
    nav.classList.add("is-open");
    document.body.classList.add("is-lock");
  }

  function closeMenu() {
    nav.classList.remove("is-open");
    document.body.classList.remove("is-lock");
  }

  openBtn.addEventListener("click", openMenu);
  closeBtn.addEventListener("click", closeMenu);

  links.forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute("href"));
      closeMenu();

      if (target) {
        setTimeout(function () {
          target.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 80);
      }
    });
  });
}

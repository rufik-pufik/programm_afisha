function initLines() {
  const lines = document.querySelectorAll(".js-line");

  if (!lines.length) {
    return;
  }

  if (!("IntersectionObserver" in window)) {
    lines.forEach(function (line) {
      line.classList.add("is-on");
    });
    return;
  }

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-on");
        } else {
          entry.target.classList.remove("is-on");
        }
      });
    },
    {
      threshold: 0.45,
      rootMargin: "0px 0px -10% 0px",
    }
  );

  lines.forEach(function (line) {
    observer.observe(line);
  });
}

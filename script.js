document.addEventListener("DOMContentLoaded", function () {

  /* =========================================
     LAOYU MOBILE NAVIGATION
     ========================================= */

  const nav = document.querySelector(".nav");
  const navIn = document.querySelector(".navin");
  const links = document.querySelector(".links");

  if (nav && navIn && links) {

    // Create mobile menu button
    const menuButton = document.createElement("button");

    menuButton.className = "mobileMenu";
    menuButton.setAttribute("type", "button");
    menuButton.setAttribute("aria-label", "Open navigation menu");
    menuButton.setAttribute("aria-expanded", "false");

    menuButton.innerHTML = `
      <span></span>
      <span></span>
      <span></span>
    `;

    navIn.appendChild(menuButton);

    // Open / close mobile menu
    menuButton.addEventListener("click", function () {

      const isOpen = nav.classList.toggle("menuOpen");

      menuButton.setAttribute(
        "aria-expanded",
        isOpen ? "true" : "false"
      );

      menuButton.setAttribute(
        "aria-label",
        isOpen ? "Close navigation menu" : "Open navigation menu"
      );
    });

    // Close menu after selecting a page
    const navLinks = links.querySelectorAll("a");

    navLinks.forEach(function (link) {

      link.addEventListener("click", function () {

        nav.classList.remove("menuOpen");

        menuButton.setAttribute(
          "aria-expanded",
          "false"
        );

        menuButton.setAttribute(
          "aria-label",
          "Open navigation menu"
        );

      });

    });

  }


  /* =========================================
     CURRENT PAGE NAVIGATION
     ========================================= */

  const currentPage =
    window.location.pathname.split("/").pop() || "index.html";

  const pageLinks =
    document.querySelectorAll(".links a");

  pageLinks.forEach(function (link) {

    const linkPage =
      link.getAttribute("href");

    if (linkPage === currentPage) {
      link.classList.add("active");
    }

  });


  /* =========================================
     SMOOTH SCROLL
     ========================================= */

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {

    link.addEventListener("click", function (event) {

      const targetId =
        this.getAttribute("href");

      if (targetId === "#") {
        return;
      }

      const target =
        document.querySelector(targetId);

      if (target) {

        event.preventDefault();

        target.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });

      }

    });

  });

});

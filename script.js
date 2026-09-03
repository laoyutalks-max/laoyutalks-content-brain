/* =========================================================
   LAOYU WEBSITE JAVASCRIPT
   Mobile Navigation
   Active Page Navigation
   Smooth Scrolling
   Copyright Year
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {


  /* =======================================================
     COPYRIGHT YEAR
     ======================================================= */

  const yearElements =
    document.querySelectorAll("[data-year]");

  yearElements.forEach(function (element) {
    element.textContent =
      new Date().getFullYear();
  });


  /* =======================================================
     MOBILE NAVIGATION
     ======================================================= */

  const nav =
    document.querySelector(".nav");

  const navIn =
    document.querySelector(".navin");

  const links =
    document.querySelector(".links");


  if (nav && navIn && links) {


    /* Create mobile menu button */

    const menuButton =
      document.createElement("button");

    menuButton.className =
      "mobileMenu";

    menuButton.type =
      "button";

    menuButton.setAttribute(
      "aria-label",
      "Open navigation menu"
    );

    menuButton.setAttribute(
      "aria-expanded",
      "false"
    );

    menuButton.innerHTML = `
      <span></span>
      <span></span>
      <span></span>
    `;

    navIn.appendChild(menuButton);


    /* Open / close menu */

    menuButton.addEventListener(
      "click",
      function () {

        const isOpen =
          nav.classList.toggle("menuOpen");


        menuButton.setAttribute(
          "aria-expanded",
          isOpen ? "true" : "false"
        );


        menuButton.setAttribute(
          "aria-label",
          isOpen
            ? "Close navigation menu"
            : "Open navigation menu"
        );

      }
    );


    /* Close menu after selecting a page */

    const navLinks =
      links.querySelectorAll("a");


    navLinks.forEach(
      function (link) {

        link.addEventListener(
          "click",
          function () {

            nav.classList.remove(
              "menuOpen"
            );

            menuButton.setAttribute(
              "aria-expanded",
              "false"
            );

            menuButton.setAttribute(
              "aria-label",
              "Open navigation menu"
            );

          }
        );

      }
    );


    /* Close menu with Escape key */

    document.addEventListener(
      "keydown",
      function (event) {

        if (event.key === "Escape") {

          nav.classList.remove(
            "menuOpen"
          );

          menuButton.setAttribute(
            "aria-expanded",
            "false"
          );

          menuButton.setAttribute(
            "aria-label",
            "Open navigation menu"
          );

        }

      }
    );

  }


  /* =======================================================
     ACTIVE PAGE NAVIGATION
     ======================================================= */

  let currentPage =
    window.location.pathname
      .split("/")
      .pop();


  if (!currentPage) {
    currentPage = "index.html";
  }


  const pageLinks =
    document.querySelectorAll(
      ".links a"
    );


  pageLinks.forEach(
    function (link) {

      const href =
        link.getAttribute("href");


      if (!href) {
        return;
      }


      const linkPage =
        href.split("#")[0];


      if (
        linkPage === currentPage
      ) {

        link.classList.add(
          "active"
        );

      }

    }
  );


  /* =======================================================
     SMOOTH SCROLLING
     ======================================================= */

  const anchorLinks =
    document.querySelectorAll(
      'a[href^="#"]'
    );


  anchorLinks.forEach(
    function (link) {

      link.addEventListener(
        "click",
        function (event) {

          const targetId =
            this.getAttribute("href");


          if (
            !targetId ||
            targetId === "#"
          ) {
            return;
          }


          const target =
            document.querySelector(
              targetId
            );


          if (!target) {
            return;
          }


          event.preventDefault();


          target.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });

        }
      );

    }
  );

});

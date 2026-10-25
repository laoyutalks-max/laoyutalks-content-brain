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


/* =========================================================
   LAOYU HUD EDITION
   Boot sequence · status strip · node network background
   hero rings · eyebrow typing · reveal-on-scroll
   ========================================================= */

(function () {

  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function safeSession(key, value) {
    try {
      if (value === undefined) return sessionStorage.getItem(key);
      sessionStorage.setItem(key, value);
    } catch (e) { return null; }
  }


  /* ---------- Boot sequence (once per browser session) ---------- */

  if (!reduceMotion && !safeSession("laoyuBooted")) {
    var boot = document.createElement("div");
    boot.className = "boot";
    boot.innerHTML =
      '<div class="bootCore">' +
        '<div class="bootRing"></div>' +
        '<div class="bootText">INITIALIZING</div>' +
        '<div class="bootBar"><i></i></div>' +
      '</div>';
    document.documentElement.appendChild(boot);

    var steps = [
      "INITIALIZING LAOYU AI CORE",
      "LOADING KNOWLEDGE MODULES",
      "CALIBRATING CONTENT BRAIN",
      "SYSTEMS ONLINE"
    ];
    var text = boot.querySelector(".bootText");
    var bar = boot.querySelector(".bootBar i");
    var i = 0;
    var timer = setInterval(function () {
      text.textContent = steps[i];
      bar.style.width = ((i + 1) / steps.length * 100) + "%";
      i++;
      if (i === steps.length) {
        clearInterval(timer);
        setTimeout(function () {
          boot.classList.add("done");
          setTimeout(function () { boot.remove(); }, 700);
        }, 380);
      }
    }, 330);

    safeSession("laoyuBooted", "1");
  }


  document.addEventListener("DOMContentLoaded", function () {

    /* ---------- Status strip under the header ---------- */

    var nav = document.querySelector(".nav");
    if (nav) {
      var page = (document.title.split("|")[0] || "HOME").trim().toUpperCase();
      var strip = document.createElement("div");
      strip.className = "hudStatus";
      strip.innerHTML =
        '<div class="wrap">' +
          '<span><i class="dot"></i>SYSTEM <b>ONLINE</b></span>' +
          '<span class="hide-sm">MODULE <b>' + page + '</b></span>' +
          '<span>LOCAL <b data-clock>--:--:--</b></span>' +
        '</div>';
      nav.insertAdjacentElement("afterend", strip);

      var clock = strip.querySelector("[data-clock]");
      var tick = function () {
        var d = new Date();
        clock.textContent = [d.getHours(), d.getMinutes(), d.getSeconds()]
          .map(function (n) { return String(n).padStart(2, "0"); })
          .join(":");
      };
      tick();
      setInterval(tick, 1000);
    }


    /* ---------- Rings around the hero logo ---------- */

    var heroLogo = document.querySelector(".heroLogo");
    if (heroLogo) {
      heroLogo.insertAdjacentHTML(
        "afterbegin",
        '<span class="ring"></span><span class="ring r2"></span>'
      );
    }


    /* ---------- Typing effect on the first hero eyebrow ---------- */

    var eyebrow = document.querySelector(".hero .eyebrow");
    if (eyebrow && !reduceMotion) {
      var full = eyebrow.textContent.trim();
      eyebrow.textContent = "";
      eyebrow.style.minHeight = "1.6em";
      var k = 0;
      setTimeout(function type() {
        eyebrow.textContent = full.slice(0, ++k) + (k < full.length ? "▌" : "");
        if (k < full.length) setTimeout(type, 38);
      }, safeSession("laoyuBooted") ? 1700 : 300);
    }


    /* ---------- Reveal on scroll ---------- */

    var targets = document.querySelectorAll(
      ".featureGrid, .card, .resource, .intro, .brain, .panel, .cta, .section.alt .feature, .head, .section-head"
    );
    if ("IntersectionObserver" in window && !reduceMotion) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      }, { threshold: 0.12 });
      targets.forEach(function (el, n) {
        el.classList.add("reveal");
        el.style.transitionDelay = (n % 5) * 70 + "ms";
        io.observe(el);
      });
    }


    /* ---------- Node-network background ---------- */

    if (reduceMotion) return;

    var canvas = document.createElement("canvas");
    canvas.id = "hudCanvas";
    document.body.prepend(canvas);
    var ctx = canvas.getContext("2d");
    var nodes = [];
    var W, H, dpr;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.round(Math.min(70, (W * H) / 22000));
      nodes = [];
      for (var n = 0; n < count; n++) {
        nodes.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          o: Math.random() < 0.12
        });
      }
    }

    var mouse = { x: -999, y: -999 };
    window.addEventListener("mousemove", function (e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    function frame() {
      ctx.clearRect(0, 0, W, H);
      for (var a = 0; a < nodes.length; a++) {
        var p = nodes[a];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;

        for (var b = a + 1; b < nodes.length; b++) {
          var q = nodes[b];
          var dx = p.x - q.x, dy = p.y - q.y;
          var dist = dx * dx + dy * dy;
          if (dist < 17000) {
            ctx.strokeStyle = "rgba(53,224,255," + (0.14 * (1 - dist / 17000)) + ")";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }

        var mx = p.x - mouse.x, my = p.y - mouse.y;
        var md = mx * mx + my * my;
        if (md < 26000) {
          ctx.strokeStyle = "rgba(53,224,255," + (0.35 * (1 - md / 26000)) + ")";
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }

        ctx.fillStyle = p.o ? "rgba(255,122,26,0.9)" : "rgba(53,224,255,0.7)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.o ? 2 : 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
      requestAnimationFrame(frame);
    }

    resize();
    window.addEventListener("resize", resize);
    requestAnimationFrame(frame);
  });

})();

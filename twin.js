/* =========================================================
   LAOYU — SMART FACTORY DIGITAL TWIN (Oct 2026)
   Line-status ticker · sub-page mini line · scroll rail ·
   reveal-on-scroll · animated production-line hero.
   Loaded after i18n.js and script.js on every page.
   ========================================================= */
(function () {
  "use strict";

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function t(s) { return window.LAOYU_I18N ? window.LAOYU_I18N.t(s) : s; }
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  document.addEventListener("DOMContentLoaded", function () {
    ticker();
    subHero();
    reveal();
    rail();
    counters();
    hero();
    if (window.LAOYU_I18N) window.LAOYU_I18N.apply();
  });

  /* ---------- Line-status ticker in the strip under the header ---------- */
  function ticker() {
    var strip = $(".hudStatus .wrap");
    if (!strip) return;
    var clock = strip.querySelector("[data-clock]");
    var clockSpan = clock ? clock.parentNode : null;
    var items = [
      ["LINE 01", "RUNNING", "ok"],
      ["OEE", "87.4%", ""],
      ["AI VISION QC", "ONLINE", "ok"],
      ["PREDICTIVE MAINTENANCE", "WATCHING", "warn"],
      ["FREE TOOLS", "16", ""],
      ["LANGUAGE", "EN / 中文", ""],
      ["TIKTOK", "@laoyu.talks", ""],
      ["DATA", "SIMULATED", ""]
    ];
    var html = items.map(function (i) {
      return "<span>" + i[0] + " <b class=\"" + i[2] + "\">" + i[1] + "</b></span>";
    }).join("");
    var wrap = document.createElement("div");
    wrap.className = "tickWrap";
    wrap.innerHTML = '<div class="tick">' + html + html + "</div>";
    strip.innerHTML = "";
    var dot = document.createElement("span");
    dot.innerHTML = '<i class="dot"></i>SYSTEM <b>ONLINE</b>';
    strip.appendChild(dot);
    strip.appendChild(wrap);
    if (clockSpan) strip.appendChild(clockSpan);
  }

  /* ---------- Sub-page hero: blueprint floor + mini production line ---------- */
  function subHero() {
    if ($(".tHero")) return;
    var h = $("main > .hero, main > section.hero, .resHero");
    if (!h) return;
    h.classList.add("subHero");
    var w = h.querySelector(".wrap") || h;
    var line = document.createElement("div");
    line.className = "miniLine";
    line.setAttribute("aria-hidden", "true");
    line.innerHTML = "<i></i><i></i><i></i><i></i><b></b>";
    w.appendChild(line);
  }

  /* ---------- Reveal on scroll ---------- */
  function reveal() {
    var els = $$(".stHead, .machine, .bay, .bayIntro, .outGrid .panel, .station .card");
    if (reduce || !("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    els.forEach(function (el, i) {
      el.classList.remove("reveal");
      el.classList.add("rv");
      el.style.transitionDelay = (i % 5) * 80 + "ms";
      io.observe(el);
    });
  }

  /* ---------- Scroll rail: a part rides a vertical conveyor past each station ---------- */
  function rail() {
    var st = $$("[data-station]");
    if (st.length < 2) return;
    var r = document.createElement("div");
    r.className = "rail";
    r.setAttribute("aria-hidden", "true");
    st.forEach(function (s, i) {
      var n = document.createElement("span");
      n.className = "node";
      n.style.top = (i / (st.length - 1) * 100) + "%";
      n.style.marginTop = "-8px";
      n.innerHTML = "<em>" + s.getAttribute("data-station") + " · " + s.getAttribute("data-station-name") + "</em>";
      n.addEventListener("click", function () { s.scrollIntoView({ behavior: "smooth" }); });
      r.appendChild(n);
    });
    var pk = document.createElement("span");
    pk.className = "pk";
    r.appendChild(pk);
    document.body.appendChild(r);
    var nodes = $$(".node", r);

    function upd() {
      var mid = window.innerHeight * 0.45;
      var first = st[0].getBoundingClientRect().top;
      var last = st[st.length - 1].getBoundingClientRect().top;
      var p = (mid - first) / Math.max(1, last - first);
      p = Math.max(0, Math.min(1, p));
      pk.style.top = (p * 100) + "%";
      r.style.opacity = st[0].getBoundingClientRect().top < window.innerHeight * 0.9 ? 1 : 0.35;
      st.forEach(function (s, i) {
        nodes[i].classList.toggle("on", s.getBoundingClientRect().top < mid);
      });
    }
    r.style.transition = "opacity .4s";
    window.addEventListener("scroll", upd, { passive: true });
    window.addEventListener("resize", upd);
    upd();
  }

  /* ---------- Count-up numbers ---------- */
  function counters() {
    $$("[data-count]").forEach(function (el) {
      var end = +el.getAttribute("data-count");
      if (reduce) { el.textContent = end; return; }
      var t0 = null;
      el.textContent = "0";
      function step(ts) {
        if (!t0) t0 = ts;
        var p = Math.min(1, (ts - t0) / 1400);
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      }
      setTimeout(function () { requestAnimationFrame(step); }, 500);
    });
  }

  /* =========================================================
     HERO — animated digital twin of a production line
     ========================================================= */
  function hero() {
    var stage = $(".tStage");
    var svg = stage && stage.querySelector(".twinSvg");
    if (!svg) return;
    var is3d = stage.classList.contains("is3d");

    var stats = { inspected: 0, rejected: 0, oee: 87.4 };
    var alertNow = function () {};
    if (!is3d) (function () {
    var K = 1.55, C = Math.cos(Math.PI / 6), S = 0.5;
    function iso(x, y, z) { return [(x - y) * C * K, (x + y) * S * K - z * K]; }
    function P(a) { return a.map(function (p) { var q = iso(p[0], p[1], p[2]); return q[0].toFixed(1) + "," + q[1].toFixed(1); }).join(" "); }
    var NS = "http://www.w3.org/2000/svg";

    var cubeFaces = {
      fl: P([[0, 10, 0], [10, 10, 0], [10, 10, 10], [0, 10, 10]]),
      fr: P([[10, 0, 0], [10, 10, 0], [10, 10, 10], [10, 0, 10]]),
      ft: P([[0, 0, 10], [10, 0, 10], [10, 10, 10], [0, 10, 10]])
    };
    var layer = svg.querySelector("#prods");
    var slats = svg.querySelector("#slats");
    var scan = svg.querySelector("#scan");
    var flag = svg.querySelector("#flag");
    var pusher = svg.querySelector(".push");

    var V = 30, GAP = 1.25, SCAN_X = 183, PUSH_X = 214, END_X = 292;
    var prods = [], n = 0, since = GAP, time = 0, last = 0, running = true, visible = true;

    function make() {
      var g = document.createElementNS(NS, "g");
      g.setAttribute("class", "prod");
      ["fl", "fr", "ft"].forEach(function (k) {
        var p = document.createElementNS(NS, "polygon");
        p.setAttribute("class", k);
        p.setAttribute("points", cubeFaces[k]);
        g.appendChild(p);
      });
      layer.appendChild(g);
      n++;
      return { g: g, x: 30, y: 50, z: 22, bad: n % 6 === 4, scanned: false, phase: "ride", t: 0 };
    }

    function place(o) {
      var q = iso(o.x, o.y, o.z);
      o.g.setAttribute("transform", "translate(" + q[0].toFixed(1) + " " + q[1].toFixed(1) + ")");
    }

    var flagOwner = null, flagHide = 0;
    function showFlag(o) {
      flagOwner = o; flagHide = 0;
      flag.setAttribute("opacity", "1");
    }

    function ease(p) { return p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; }

    function step(dt) {
      time += dt;
      since += dt;
      if (since >= GAP) { since = 0; prods.push(make()); }

      // belt slats + scanner sweep
      var off = (time * V) % 10, q = iso(off, 0, 0);
      slats.setAttribute("transform", "translate(" + q[0].toFixed(2) + " " + q[1].toFixed(2) + ")");
      var sx = 11 + 11 * Math.sin(time * 5), qs = iso(sx, 0, 0);
      scan.setAttribute("transform", "translate(" + qs[0].toFixed(2) + " " + qs[1].toFixed(2) + ")");

      var push = 0;
      for (var i = prods.length - 1; i >= 0; i--) {
        var o = prods[i];
        if (o.phase === "ride") {
          o.x += V * dt;
          if (!o.scanned && o.x >= SCAN_X) {
            o.scanned = true;
            stats.inspected++;
            if (o.bad) { o.g.classList.add("bad"); stats.rejected++; showFlag(o); alertNow("defect"); }
            else { o.g.classList.add("ok"); }
            hud();
          }
          if (o.bad && o.x >= PUSH_X) { o.x = PUSH_X; o.phase = "push"; o.t = 0; }
          if (o.x > END_X) { o.g.remove(); prods.splice(i, 1); continue; }
        } else if (o.phase === "push") {
          o.t += dt;
          var p = Math.min(1, o.t / 0.55);
          o.y = 50 + 40 * ease(p);
          o.z = p < 0.5 ? 22 : 22 - 20 * ((p - 0.5) / 0.5);
          push = Math.max(push, Math.min(16, 40 * ease(p)));
          if (p >= 1) { o.phase = "sit"; o.t = 0; }
        } else if (o.phase === "sit") {
          o.t += dt;
          push = Math.max(push, 16 * Math.max(0, 1 - o.t / 0.4));
          if (o.t > 1.2) o.g.style.opacity = Math.max(0, 1 - (o.t - 1.2) / 0.6);
          if (o.t > 1.8) { o.g.remove(); prods.splice(i, 1); continue; }
        }
        place(o);
      }
      if (pusher) {
        pusher.setAttribute("transform", "translate(" + (-push * C * K).toFixed(1) + " " + (push * S * K).toFixed(1) + ")");
      }

      if (flagOwner) {
        var fq = iso(flagOwner.x + 5, flagOwner.y + 5, flagOwner.z + 12);
        flag.setAttribute("transform", "translate(" + fq[0].toFixed(1) + " " + fq[1].toFixed(1) + ")");
        if (flagOwner.phase !== "ride") {
          flagHide += dt;
          if (flagHide > 0.9) { flag.setAttribute("opacity", "0"); flagOwner = null; }
        }
      }
    }

    function loop(ts) {
      if (!last) last = ts;
      var dt = Math.min(0.05, (ts - last) / 1000);
      last = ts;
      if (running && visible) step(dt);
      requestAnimationFrame(loop);
    }

    // Static, readable frame for reduced motion
    if (reduce) {
      [60, 100, 140, 228, 250].forEach(function (x, i) {
        var o = make(); o.x = x; if (i === 3) { o.g.classList.add("ok"); } place(o);
      });
    } else {
      // pre-fill the belt so the first frame isn't empty
      for (var k = 0; k < 140; k++) step(0.05);
      requestAnimationFrame(loop);
    }

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }).observe(stage);
    }
    document.addEventListener("visibilitychange", function () { running = !document.hidden; last = 0; });

    })();

    /* ---- HUD panels ---- */
    var elIns = $("[data-k=inspected]"), elRej = $("[data-k=rejected]"), elOee = $("[data-k=oee]"), elMeter = $("[data-k=meter]");
    function hud() {
      if (elIns) elIns.textContent = stats.inspected.toLocaleString();
      if (elRej) elRej.textContent = stats.rejected.toLocaleString();
    }
    function oee() {
      stats.oee = Math.max(85.6, Math.min(89.4, stats.oee + (Math.random() - 0.45) * 0.5));
      if (elOee) elOee.textContent = stats.oee.toFixed(1);
      if (elMeter) elMeter.style.width = stats.oee + "%";
    }
    oee(); hud();
    if (!reduce) setInterval(oee, 2200);

    var ALERTS = {
      defect: "Vision QC caught a defect — rejected before it reached the customer.",
      list: [
        "CNC spindle temperature rising — plan a check before it stops the line.",
        "Robot cycle time stable — no action needed.",
        "Shift handover ready — 3 open actions carried over.",
        "Changeover on Line 01 finished 6 minutes faster than standard."
      ]
    };
    var alertEl = $("[data-k=alert]"), ai = 0, lastDefect = 0;
    function setAlert(s) {
      if (!alertEl) return;
      alertEl.style.opacity = 0;
      setTimeout(function () { alertEl.setAttribute("data-en", s); alertEl.textContent = t(s); alertEl.style.opacity = 1; }, 250);
    }
    alertNow = function (kind) {
      var now = Date.now();
      if (kind === "defect" && now - lastDefect > 12000) { lastDefect = now; setAlert(ALERTS.defect); }
    };
    document.addEventListener("twin3d:part", function (e) {
      stats.inspected++;
      if (e.detail && e.detail.bad) { stats.rejected++; alertNow("defect"); }
      hud();
    });
    setAlert(ALERTS.list[0]);
    if (!reduce) setInterval(function () {
      if (Date.now() - lastDefect < 4000) return;
      ai = (ai + 1) % ALERTS.list.length;
      setAlert(ALERTS.list[ai]);
    }, 5200);
    document.addEventListener("laoyu:lang", function () {
      if (alertEl && alertEl.getAttribute("data-en")) alertEl.textContent = t(alertEl.getAttribute("data-en"));
      if (tip.classList.contains("show") && curKey) fillTip(curKey);
    });

    /* ---- Machine tooltips ---- */
    var TIPS = {
      cnc: ["TOPIC", "Manufacturing Excellence", "Process improvement, automation and data-driven systems.", "#station-1"],
      robot: ["TOPIC", "AI Solutions", "Smart tools and AI-powered systems to help you work intelligently.", "#station-1"],
      vision: ["TOPIC", "Continuous Improvement", "Small changes, big impact. Build better systems every day.", "#station-1"],
      ctrl: ["TOPIC", "Manager Thinking", "Leadership, planning and decision-making frameworks.", "#station-1"],
      pack: ["FREE TOOLS", "Free Resources", "Templates, prompts and practical tools.", "#station-3"]
    };
    var tip = document.createElement("div");
    tip.className = "tTip";
    tip.setAttribute("role", "tooltip");
    stage.appendChild(tip);
    var curKey = null, hideT = null;

    function fillTip(key) {
      var d = TIPS[key];
      tip.innerHTML = "<small>" + t(d[0]) + "</small><h4>" + t(d[1]) + "</h4><p>" + t(d[2]) + "</p><a href=\"" + d[3] + "\">" + t("Explore →") + "</a>";
    }
    function show(hs) {
      clearTimeout(hideT);
      var key = hs.getAttribute("data-tip");
      curKey = key;
      fillTip(key);
      var sr = stage.getBoundingClientRect(), b = hs.getBoundingClientRect();
      var x = b.left + b.width / 2 - sr.left;
      x = Math.max(130, Math.min(sr.width - 130, x));
      tip.style.left = x + "px";
      tip.style.top = Math.max(110, b.top - sr.top) + "px";
      tip.classList.add("show");
      $$(".hs", svg).forEach(function (h) { h.classList.toggle("hot", h.getAttribute("data-tip") === key); });
    }
    function hide() {
      hideT = setTimeout(function () {
        tip.classList.remove("show");
        $$(".hs.hot", svg).forEach(function (h) { h.classList.remove("hot"); });
        curKey = null;
      }, 260);
    }
    $$(".hs", svg).forEach(function (hs) {
      hs.setAttribute("tabindex", "0");
      hs.addEventListener("mouseenter", function () { idle = false; show(hs); });
      hs.addEventListener("mouseleave", hide);
      hs.addEventListener("focus", function () { show(hs); });
      hs.addEventListener("blur", hide);
      hs.addEventListener("click", function (e) { e.preventDefault(); idle = false; show(hs); });
    });
    function showAt(key, x, y) {
      clearTimeout(hideT);
      curKey = key; fillTip(key);
      var sr = stage.getBoundingClientRect();
      tip.style.left = Math.max(130, Math.min(sr.width - 130, x)) + "px";
      tip.style.top = Math.max(110, y) + "px";
      tip.classList.add("show");
    }
    document.addEventListener("twin3d:hover", function (e) { idle = false; showAt(e.detail.key, e.detail.x, e.detail.y); });
    document.addEventListener("twin3d:leave", hide);
    tip.addEventListener("mouseenter", function () { clearTimeout(hideT); });
    tip.addEventListener("mouseleave", hide);
    document.addEventListener("click", function (e) {
      if (!e.target.closest(".tStage")) { tip.classList.remove("show"); }
    });

    // Gentle attention cue: light up each machine in turn until the visitor interacts
    var idle = true, order = ["cnc", "robot", "vision", "pack", "ctrl"], oi = 0;
    if (!reduce) setInterval(function () {
      if (!idle || tip.classList.contains("show")) return;
      var key = order[oi++ % order.length];
      if (is3d && window.LAOYU_3D) { window.LAOYU_3D.highlight(key); setTimeout(function () { if (idle) window.LAOYU_3D.highlight(null); }, 1100); return; }
      $$(".hs", svg).forEach(function (h) { h.classList.toggle("hot", h.getAttribute("data-tip") === key); });
      setTimeout(function () { if (idle) $$(".hs.hot", svg).forEach(function (h) { h.classList.remove("hot"); }); }, 1100);
    }, 2600);
  }
})();

/* nav.js — 当前页高亮 + 移动端菜单开合 */
(function () {
  "use strict";

  /* ---------- 1. 当前页高亮：读 body.dataset.page ---------- */
  var current = document.body.dataset.page;
  if (current) {
    document.querySelectorAll(".nav-links a[data-page]").forEach(function (a) {
      if (a.dataset.page === current) {
        a.classList.add("active");
        a.setAttribute("aria-current", "page");
      }
    });
  }

  /* ---------- 2. 移动端汉堡菜单 ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var navLinks = document.getElementById("navLinks");

  if (toggle && navLinks) {
    // 初始化同步，让 aria-expanded 始终由 DOM 状态决定
    toggle.setAttribute(
      "aria-expanded",
      navLinks.classList.contains("is-open") ? "true" : "false"
    );

    toggle.addEventListener("click", function () {
      var open = navLinks.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    // 点击链接后关闭菜单
    navLinks.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        navLinks.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });

    // 点击菜单外部关闭
    document.addEventListener("click", function (e) {
      if (!navLinks.classList.contains("is-open")) return;
      if (navLinks.contains(e.target) || toggle.contains(e.target)) return;
      navLinks.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  }
})();
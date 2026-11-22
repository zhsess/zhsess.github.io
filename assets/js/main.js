/**
* Template Name: iPortfolio
* Updated: Nov 17 2023 with Bootstrap v5.3.2
* Template URL: https://bootstrapmade.com/iportfolio-bootstrap-portfolio-websites-template/
* Author: BootstrapMade.com
* License: https://bootstrapmade.com/license/
*/
(function() {
  "use strict";

  const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /**
   * Theme toggle (Catppuccin Mocha / Latte).
   * Uses the saved choice; otherwise follows the system setting.
   */
  const store = {
    get: (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  const systemTheme = () =>
    window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  const getTheme = () => store.get('theme') || systemTheme();

  const applyTheme = (theme, persist) => {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    if (persist) store.set('theme', theme);
  };

  applyTheme(getTheme(), false);

  // Follow system changes until the visitor picks a theme manually
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => {
      if (!store.get('theme')) applyTheme(systemTheme(), false);
    });
  }

  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', (e) => {
      e.preventDefault();
      applyTheme(getTheme() === 'light' ? 'dark' : 'light', true);
    });
  }

  /**
   * Easy selector helper function
   */
  const select = (el, all = false) => {
    el = el.trim()
    if (all) {
      return [...document.querySelectorAll(el)]
    } else {
      return document.querySelector(el)
    }
  }

  /**
   * Easy event listener function
   */
  const on = (type, el, listener, all = false) => {
    let selectEl = select(el, all)
    if (selectEl) {
      if (all) {
        selectEl.forEach(e => e.addEventListener(type, listener))
      } else {
        selectEl.addEventListener(type, listener)
      }
    }
  }

  /**
   * Easy on scroll event listener 
   */
  const onscroll = (el, listener) => {
    el.addEventListener('scroll', listener, { passive: true })
  }

  /**
   * Navbar links active state on scroll
   */
  let navbarlinks = select('#navbar .scrollto', true)
  const navbarlinksActive = () => {
    let position = window.scrollY + 200
    navbarlinks.forEach(navbarlink => {
      if (!navbarlink.hash) return
      let section = select(navbarlink.hash)
      if (!section) return
      if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
        navbarlink.classList.add('active')
      } else {
        navbarlink.classList.remove('active')
      }
    })
  }
  window.addEventListener('load', navbarlinksActive)
  onscroll(document, navbarlinksActive)

  /**
   * Scrolls to an element with header offset
   */
  const scrollto = (el) => {
    let elementPos = select(el).offsetTop
    window.scrollTo({
      top: elementPos,
      behavior: reducedMotion ? 'auto' : 'smooth'
    })
  }

  /**
   * Back to top button
   */
  let backtotop = select('.back-to-top')
  if (backtotop) {
    const toggleBacktotop = () => {
      if (window.scrollY > 100) {
        backtotop.classList.add('active')
      } else {
        backtotop.classList.remove('active')
      }
    }
    window.addEventListener('load', toggleBacktotop)
    onscroll(document, toggleBacktotop)
  }

  /**
   * Mobile nav toggle (click or keyboard)
   */
  const mobileToggle = select('.mobile-nav-toggle')
  const toggleMobileNav = () => {
    select('body').classList.toggle('mobile-nav-active')
    mobileToggle.classList.toggle('bi-list')
    mobileToggle.classList.toggle('bi-x')
    mobileToggle.setAttribute('aria-expanded', mobileToggle.classList.contains('bi-x') ? 'true' : 'false')
  }
  if (mobileToggle) {
    mobileToggle.addEventListener('click', toggleMobileNav)
    mobileToggle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        toggleMobileNav()
      }
    })
  }

  /**
   * Scroll with offset on links with a class name .scrollto
   */
  on('click', '.scrollto', function(e) {
    if (select(this.hash)) {
      e.preventDefault()

      let body = select('body')
      if (body.classList.contains('mobile-nav-active')) {
        toggleMobileNav()
      }
      scrollto(this.hash)
    }
  }, true)

  /**
   * Scroll with offset on page load with hash links in the url
   */
  window.addEventListener('load', () => {
    if (window.location.hash) {
      if (select(window.location.hash)) {
        scrollto(window.location.hash)
      }
    }
  });

  /**
   * Hero type effect (static text when reduced motion is requested)
   */
  const typed = select('.typed')
  if (typed) {
    let typed_strings = typed.getAttribute('data-typed-items').split(',').map(s => s.trim())
    if (reducedMotion || typeof Typed === 'undefined') {
      typed.textContent = typed_strings.join(', ')
    } else {
      new Typed('.typed', {
        strings: typed_strings,
        loop: true,
        typeSpeed: 100,
        backSpeed: 50,
        backDelay: 2000
      });
    }
  }

  /**
   * Photos slider
   */
  if (typeof Swiper !== 'undefined' && select('.photos-slider')) {
    new Swiper('.photos-slider', {
      speed: reducedMotion ? 0 : 600,
      loop: true,
      slidesPerView: 1,
      spaceBetween: 0,
      watchOverflow: true,
      roundLengths: true,
      autoplay: reducedMotion ? false : {
        delay: 4000,
        disableOnInteraction: false
      },
      navigation: {
        nextEl: '.photos-next',
        prevEl: '.photos-prev'
      },
      pagination: {
        el: '.photos-pagination',
        clickable: true
      }
    });
  }

  /**
   * Animation on scroll
   */
  window.addEventListener('load', () => {
    if (typeof AOS === 'undefined') return
    AOS.init({
      duration: 1000,
      easing: 'ease-in-out',
      once: true,
      mirror: false,
      disable: reducedMotion
    })
  });

})()

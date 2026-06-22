/**
 * AVNEET DIGITAL — script.js
 * Handles: sticky nav, burger menu, smooth scroll,
 *          counter animation, scroll reveal,
 *          portfolio filter, form validation & submission
 */

'use strict';

/* ─── DOM Ready ──────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initBurgerMenu();
  initSmoothScroll();
  initScrollReveal();
  initActiveNavLinks();
  initCounterAnimation();
  initPortfolioFilter();
  initContactForm();
  initFooterYear();
});

/* ─── 1. Sticky Navbar ───────────────────────────────── */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  const onScroll = () => {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load
}

/* ─── 2. Burger / Mobile Menu ────────────────────────── */
function initBurgerMenu() {
  const burger     = document.getElementById('burger');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  if (!burger || !mobileMenu) return;

  let isOpen = false;

  function openMenu() {
    isOpen = true;
    burger.classList.add('open');
    mobileMenu.classList.add('open');
    burger.setAttribute('aria-expanded', 'true');
    mobileMenu.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // prevent background scroll
  }

  function closeMenu() {
    isOpen = false;
    burger.classList.remove('open');
    mobileMenu.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  burger.addEventListener('click', () => {
    isOpen ? closeMenu() : openMenu();
  });

  // Close on mobile link click
  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) closeMenu();
  });
}

/* ─── 3. Smooth Scroll ───────────────────────────────── */
function initSmoothScroll() {
  // Native CSS scroll-behavior handles most cases;
  // this adds offset compensation for the sticky nav.
  const NAV_HEIGHT = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--nav-h') || '72',
    10
  );

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      const top = target.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT;

      window.scrollTo({ top, behavior: 'smooth' });

      // Update URL hash without jumping
      history.pushState(null, null, href);
    });
  });
}

/* ─── 4. Active Nav Links (Intersection Observer) ────── */
function initActiveNavLinks() {
  const sections  = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-link[data-section]');

  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const id = entry.target.getAttribute('id');

        navLinks.forEach(link => {
          link.classList.toggle('active', link.dataset.section === id);
        });
      });
    },
    {
      rootMargin: '-30% 0px -60% 0px',
      threshold: 0
    }
  );

  sections.forEach(s => observer.observe(s));
}

/* ─── 5. Scroll Reveal ───────────────────────────────── */
function initScrollReveal() {
  // Add .reveal class to elements we want to animate in
  const revealTargets = [
    '.service-card',
    '.portfolio-card',
    '.about-content',
    '.about-visual',
    '.contact-info__block',
    '.contact-form-wrap',
    '.section-header',
    '.pillar',
  ];

  revealTargets.forEach((selector) => {
    document.querySelectorAll(selector).forEach((el, i) => {
      el.classList.add('reveal');
      // Stagger within each group
      const delayClass = `reveal-delay-${(i % 4) + 1}`;
      el.classList.add(delayClass);
    });
  });

  // Special: section headers get no stagger delay
  document.querySelectorAll('.section-header').forEach(el => {
    el.classList.remove('reveal-delay-1', 'reveal-delay-2', 'reveal-delay-3', 'reveal-delay-4');
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // animate once
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/* ─── 6. Animated Number Counter ─────────────────────── */
function initCounterAnimation() {
  const stats = document.querySelectorAll('.stat-number[data-target]');
  if (!stats.length) return;

  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const DURATION = 1800; // ms

  const animateCounter = (el) => {
    const target   = parseFloat(el.dataset.target);
    const decimals = target % 1 !== 0 ? 1 : 0;
    const start    = performance.now();

    const tick = (now) => {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / DURATION, 1);
      const value    = target * easeOut(progress);

      el.textContent = value.toFixed(decimals);

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = target.toFixed(decimals);
      }
    };

    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  stats.forEach(stat => observer.observe(stat));
}

/* ─── 7. Portfolio Filter ────────────────────────────── */
function initPortfolioFilter() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const cards      = document.querySelectorAll('.portfolio-card');

  if (!tabButtons.length || !cards.length) return;

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      // Update active tab
      tabButtons.forEach(b => {
        b.classList.remove('tab-btn--active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('tab-btn--active');
      btn.setAttribute('aria-selected', 'true');

      // Filter cards
      cards.forEach(card => {
        const category = card.dataset.category;

        if (filter === 'all' || category === filter) {
          card.classList.remove('hidden');
          // FIX: ensure cards are always visible after filter (observer already fired)
          // Small timeout lets display:none removal reflow before adding visible
          requestAnimationFrame(() => {
            card.classList.remove('visible');
            requestAnimationFrame(() => card.classList.add('visible'));
          });
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
}

/* ─── 8. Contact Form Validation ─────────────────────── */
function initContactForm() {
  const form    = document.getElementById('contactForm');
  if (!form) return;

  const submitBtn    = form.querySelector('.form-submit');
  const successMsg   = document.getElementById('form-success');

  // Real-time validation on blur
  form.querySelectorAll('.form-input').forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.classList.contains('error')) validateField(input);
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validate all required fields
    let isValid = true;
    form.querySelectorAll('[required]').forEach(field => {
      if (!validateField(field)) isValid = false;
    });

    if (!isValid) {
      // Focus first error
      const firstError = form.querySelector('.form-input.error, input.error');
      if (firstError) firstError.focus();
      return;
    }

    // Simulate async submission (replace with your API endpoint)
    setLoadingState(submitBtn, true);

    try {
      await simulateFormSubmit(form);

      // Success state
      form.style.opacity = '0.4';
      form.style.pointerEvents = 'none';
      successMsg.setAttribute('aria-hidden', 'false');
      successMsg.style.display = 'flex';

      // Reset after delay
      setTimeout(() => {
        form.reset();
        // FIX: also clear all error states left from validation
        form.querySelectorAll('.form-input, input[type="checkbox"]').forEach(el => {
          el.classList.remove('error');
        });
        form.querySelectorAll('.form-error').forEach(el => {
          el.textContent = '';
        });
        form.style.opacity = '';
        form.style.pointerEvents = '';
        successMsg.setAttribute('aria-hidden', 'true');
        successMsg.style.display = '';
        setLoadingState(submitBtn, false);
      }, 5000);

    } catch (err) {
      console.error('Form submission error:', err);
      setLoadingState(submitBtn, false);
      showFormError('Something went wrong. Please try again or email us directly.');
    }
  });
}

/**
 * Validate a single form field. Returns true if valid.
 */
function validateField(field) {
  const id    = field.id;
  const value = field.value.trim();
  const errorEl = document.getElementById(`${id}-error`);

  // Clear previous error
  field.classList.remove('error');
  if (errorEl) errorEl.textContent = '';

  // FIX: Handle checkbox FIRST — value is always "on" so the generic
  // required/empty check below would never catch an unchecked checkbox.
  if (field.type === 'checkbox') {
    if (field.hasAttribute('required') && !field.checked) {
      field.classList.add('error');
      const consentErr = document.getElementById('consent-error');
      if (consentErr) consentErr.textContent = 'Please accept to continue.';
      return false;
    }
    return true;
  }

  // Skip non-required empty fields
  if (!field.hasAttribute('required') && value === '') return true;

  // Required check
  if (field.hasAttribute('required') && value === '') {
    setFieldError(field, errorEl, getRequiredMessage(field));
    return false;
  }

  // Type-specific validation
  if (field.type === 'email') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setFieldError(field, errorEl, 'Please enter a valid email address.');
      return false;
    }
  }

  if (field.type === 'url' && value !== '') {
    try { new URL(value); }
    catch {
      setFieldError(field, errorEl, 'Please enter a valid URL (e.g. https://yoursite.com).');
      return false;
    }
  }

  if (id === 'message' && value.length < 20) {
    setFieldError(field, errorEl, 'Please provide a bit more detail (at least 20 characters).');
    return false;
  }

  return true;
}

function setFieldError(field, errorEl, message) {
  field.classList.add('error');
  if (errorEl) errorEl.textContent = message;
}

function getRequiredMessage(field) {
  const labels = {
    name:    'Please enter your full name.',
    email:   'Please enter your email address.',
    message: 'Please tell us a bit about your business.',
    consent: 'Please accept to continue.',
  };
  return labels[field.id] || 'This field is required.';
}

function setLoadingState(btn, isLoading) {
  btn.classList.toggle('loading', isLoading);
  btn.disabled = isLoading;
}

function showFormError(message) {
  // Simple inline error banner
  const existing = document.getElementById('form-global-error');
  if (existing) existing.remove();

  const el = document.createElement('p');
  el.id = 'form-global-error';
  el.style.cssText = 'color:#ff4d6d;font-size:0.85rem;margin-top:-0.5rem;font-family:var(--font-mono)';
  el.textContent = message;

  const form = document.getElementById('contactForm');
  const btn  = form.querySelector('.form-submit');
  form.insertBefore(el, btn);

  setTimeout(() => el.remove(), 6000);
}

/**
 * Simulates a form submission delay.
 * Replace with your actual fetch() to a backend / Formspree / Resend endpoint.
 *
 * Example with Formspree:
 *   const data = new FormData(form);
 *   const res  = await fetch('https://formspree.io/f/YOUR_ID', { method: 'POST', body: data });
 *   if (!res.ok) throw new Error('Network response not ok');
 */
function simulateFormSubmit(form) {
  return new Promise((resolve) => {
    setTimeout(resolve, 1400);
  });
}

/* ─── 9. Footer Year ─────────────────────────────────── */
function initFooterYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
}

/* ============================================================
   PORTFOLIO — INTERACTIVE SCRIPT
   ============================================================ */

'use strict';

/* ── CUSTOM CURSOR ── */
const cursor = document.getElementById('cursorFollower');
document.addEventListener('mousemove', e => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top  = e.clientY + 'px';
});

/* ── NAV: shrink on scroll + mobile toggle ── */
const nav = document.getElementById('nav');
const navToggle = document.getElementById('navToggle');
const navLinks  = document.querySelector('.nav__links');

window.addEventListener('scroll', () => {
  nav.classList.toggle('nav--scrolled', window.scrollY > 40);
});

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('nav__links--open');
  navToggle.classList.toggle('nav__toggle--open');
});
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navLinks.classList.remove('nav__links--open');
    navToggle.classList.remove('nav__toggle--open');
  });
});

/* ── DRAGGABLE ELEMENTS ── */
function makeDraggable(el) {
  let startX, startY, initLeft, initTop, isDragging = false;

  const getPos = (e) => {
    const src = e.touches ? e.touches[0] : e;
    return { x: src.clientX, y: src.clientY };
  };

  const onStart = (e) => {
    if (e.target.tagName === 'A') return; // don't drag on links
    isDragging = true;
    const pos = getPos(e);
    startX = pos.x;
    startY = pos.y;

    const rect = el.getBoundingClientRect();
    initLeft = rect.left + window.scrollX;
    initTop  = rect.top  + window.scrollY;

    el.style.position = 'absolute';
    el.style.left = initLeft + 'px';
    el.style.top  = initTop  + 'px';
    el.style.margin = '0';

    el.classList.add('dragging');
    e.preventDefault();
  };

  const onMove = (e) => {
    if (!isDragging) return;
    const pos = getPos(e);
    const dx  = pos.x - startX;
    const dy  = pos.y - startY;
    el.style.left = (initLeft + dx) + 'px';
    el.style.top  = (initTop  + dy) + 'px';
  };

  const onEnd = () => {
    isDragging = false;
    el.classList.remove('dragging');
    // Save position to sessionStorage so drags survive minor page events
    const id = el.dataset.id;
    if (id) {
      sessionStorage.setItem('pos_' + id, JSON.stringify({
        left: el.style.left,
        top: el.style.top
      }));
    }
  };

  // Restore saved position
  const id = el.dataset.id;
  if (id) {
    const saved = sessionStorage.getItem('pos_' + id);
    if (saved) {
      const { left, top } = JSON.parse(saved);
      el.style.position = 'absolute';
      el.style.left = left;
      el.style.top  = top;
      el.style.margin = '0';
    }
  }

  el.addEventListener('mousedown',  onStart, { passive: false });
  el.addEventListener('touchstart', onStart, { passive: false });
  window.addEventListener('mousemove',  onMove);
  window.addEventListener('touchmove',  onMove, { passive: false });
  window.addEventListener('mouseup',  onEnd);
  window.addEventListener('touchend', onEnd);
}

document.querySelectorAll('.draggable').forEach(makeDraggable);

/* ── FLIP CARDS ── */
document.querySelectorAll('.flip-card').forEach(card => {
  card.addEventListener('click', () => {
    card.classList.toggle('flipped');
  });
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      card.classList.toggle('flipped');
    }
  });
});

/* ── SKILL BARS: animate when in view ── */
const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.skill-bar').forEach(bar => {
        bar.style.width = bar.dataset.level + '%';
      });
      skillObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

const skillSection = document.getElementById('skills');
if (skillSection) skillObserver.observe(skillSection);

/* ── SCROLL REVEAL ── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Stagger children if it's a group
      const children = entry.target.querySelectorAll(':scope > *');
      if (children.length > 0 && entry.target.classList.contains('reveal-group')) {
        children.forEach((child, idx) => {
          setTimeout(() => child.classList.add('visible'), idx * 100);
        });
      } else {
        entry.target.classList.add('visible');
      }
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal, .reveal-group').forEach(el => {
  revealObserver.observe(el);
});

/* ── AUTO-ADD REVEAL CLASS to major sections ── */
document.querySelectorAll(
  '.notebook-card, .about__notes, .flip-card, .skill-list, ' +
  '.skills__right, .manifesto-card, .timeline, .vision__quote, ' +
  '.contact__card, .contact__sticky'
).forEach(el => {
  if (!el.classList.contains('reveal')) {
    el.classList.add('reveal');
    revealObserver.observe(el);
  }
});

document.querySelectorAll('.projects-grid').forEach(grid => {
  grid.classList.add('reveal-group');
  revealObserver.observe(grid);
});

/* ── STICKY NOTE: random slight rotation on load ── */
document.querySelectorAll('.sticky:not([style*="transform"])').forEach(sticky => {
  const deg = (Math.random() * 6 - 3).toFixed(1);
  sticky.style.transform = `rotate(${deg}deg)`;
});

/* ── PARALLAX: subtle background offset on hero ── */
const hero = document.getElementById('hero');
if (hero) {
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y < window.innerHeight) {
      hero.style.backgroundPositionY = (y * 0.3) + 'px';
    }
  }, { passive: true });
}

/* ── ACTIVE NAV LINK on scroll ── */
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav__links a');

const activeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navAnchors.forEach(a => a.removeAttribute('aria-current'));
      const match = document.querySelector(`.nav__links a[href="#${entry.target.id}"]`);
      if (match) match.setAttribute('aria-current', 'page');
    }
  });
}, { threshold: 0.5 });

sections.forEach(s => activeObserver.observe(s));

/* ── POLAROID TILT on mouse-enter ── */
document.querySelectorAll('.polaroid').forEach(p => {
  p.addEventListener('mouseenter', () => {
    p.style.setProperty('--tilt', '-3deg');
  });
  p.addEventListener('mouseleave', () => {
    p.style.removeProperty('--tilt');
  });
});

/* ── TAG HOVER: fun micro-rotation ── */
document.querySelectorAll('.tag').forEach(tag => {
  tag.addEventListener('mouseenter', () => {
    const r = (Math.random() * 6 - 3).toFixed(1);
    tag.style.transform = `scale(1.08) rotate(${r}deg)`;
  });
  tag.addEventListener('mouseleave', () => {
    tag.style.transform = '';
  });
});

console.log(
  '%c✦ Portfolio loaded — edit index.html to make it yours! ✦',
  'color: #FF6B35; font-size: 14px; font-weight: bold;'
);

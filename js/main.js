// Smartkid Abacus – interactions & animations
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Preloader
  window.addEventListener('load', () => setTimeout(() => $('#preloader').classList.add('hide'), 400));

  $('#year').textContent = new Date().getFullYear();

  // Header shadow, back-to-top, active nav link
  const header = $('#header');
  const toTop = $('#toTop');
  const sections = $$('section[id]');
  const navLinks = $$('.nav a[href^="#"]');
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 30);
    toTop.classList.toggle('show', y > 600);
    let current = '';
    sections.forEach(s => { if (y >= s.offsetTop - 120) current = s.id; });
    navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current));
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu
  const toggle = $('#menuToggle');
  const nav = $('#nav');
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open);
  });
  navLinks.concat($$('.nav .btn')).forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open');
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }));

  // Scroll reveal + counters
  const animateCount = el => {
    const to = +el.dataset.to;
    const start = performance.now();
    const tick = now => {
      const p = Math.min((now - start) / 1200, 1);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      setTimeout(() => el.classList.add('visible'), +(el.dataset.delay || 0));
      $$('.count', el).forEach(animateCount);
      io.unobserve(el);
    });
  }, { threshold: 0.15 });
  $$('.reveal, .reveal-left, .reveal-right').forEach(el => io.observe(el));

  // Typed headline
  const typed = $('#typed');
  const words = ['super brain', 'maths magic', 'sharp focus', 'confidence'];
  if (!reduceMotion) {
    let w = 0, i = words[0].length, deleting = true;
    const type = () => {
      const word = words[w];
      i += deleting ? -1 : 1;
      typed.textContent = word.slice(0, i);
      let delay = deleting ? 50 : 100;
      if (!deleting && i === word.length) { deleting = true; delay = 2200; }
      else if (deleting && i === 0) { deleting = false; w = (w + 1) % words.length; delay = 300; }
      setTimeout(type, delay);
    };
    setTimeout(type, 2600);
  }

  // Animated abacus (4 rods: thousands → units)
  const abacus = $('#abacus');
  const colors = ['#ff7a1a', '#ff4f8b', '#8b5cf6', '#2563eb'];
  const H = 158; // inner height in px
  const beam = document.createElement('div');
  beam.className = 'beam';
  abacus.appendChild(beam);
  const rods = colors.map(color => {
    const rod = document.createElement('div');
    rod.className = 'rod';
    const heaven = document.createElement('div');
    heaven.className = 'bead';
    heaven.style.background = color;
    rod.appendChild(heaven);
    const earth = [0, 1, 2, 3].map(() => {
      const b = document.createElement('div');
      b.className = 'bead';
      b.style.background = color;
      rod.appendChild(b);
      return b;
    });
    abacus.appendChild(rod);
    return { heaven, earth };
  });
  const setDigit = (rod, d) => {
    const five = d >= 5, ones = d % 5;
    rod.heaven.style.top = (five ? 24 : 2) + 'px';             // heaven bead drops to beam when counting 5
    rod.earth.forEach((b, k) => {
      const active = k < ones;
      // active beads push up against the beam, inactive rest at bottom
      b.style.top = (active ? 52 + k * 19 : H - 18 - (3 - k) * 19) + 'px';
    });
  };
  const display = $('#abacusNumber');
  const showNumber = n => {
    const digits = String(n).padStart(4, '0').split('').map(Number);
    rods.forEach((r, k) => setDigit(r, digits[k]));
    display.textContent = String(n).padStart(4, '0');
  };
  const demo = [2025, 1234, 5678, 9050, 4321, 786, 2468, 1357];
  let di = 0;
  showNumber(0);
  setTimeout(function cycle() {
    showNumber(demo[di++ % demo.length]);
    if (!reduceMotion) setTimeout(cycle, 2600);
  }, 1200);

  // 3D tilt on hero card
  const card = $('.tilt');
  if (card && !reduceMotion && matchMedia('(hover: hover)').matches) {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  }

  // Mini mental-math quiz
  const quizQ = $('#quizQ'), quizOpts = $('#quizOpts'), quizMsg = $('#quizMsg');
  const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const newQuestion = () => {
    const a = rand(11, 59), b = rand(11, 39), plus = Math.random() > 0.35;
    const x = plus ? a : a + b;
    const ans = plus ? a + b : a;
    quizQ.textContent = plus ? `${a} + ${b}` : `${x} − ${b}`;
    const opts = new Set([ans]);
    while (opts.size < 4) opts.add(ans + rand(-12, 12) || ans + 1);
    quizOpts.innerHTML = '';
    [...opts].sort(() => Math.random() - 0.5).forEach(v => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = v;
      btn.addEventListener('click', () => {
        if (v === ans) {
          btn.classList.add('right');
          quizMsg.textContent = '🎉 Brilliant! That\'s abacus thinking!';
          $$('button', quizOpts).forEach(b => (b.disabled = true));
          setTimeout(() => { quizMsg.textContent = ''; newQuestion(); }, 1600);
        } else {
          btn.classList.add('wrong');
          quizMsg.textContent = 'Almost! Try again 💪';
          setTimeout(() => btn.classList.remove('wrong'), 450);
        }
      });
      quizOpts.appendChild(btn);
    });
  };
  newQuestion();

  // Gallery lightbox
  const lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.innerHTML = '<img alt="">';
  document.body.appendChild(lb);
  $$('.g-item img').forEach(img => img.addEventListener('click', () => {
    lb.firstChild.src = img.src;
    lb.firstChild.alt = img.alt;
    lb.classList.add('open');
  }));
  lb.addEventListener('click', () => lb.classList.remove('open'));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') lb.classList.remove('open'); });

  // Enquiry → WhatsApp
  $('#enquiry').addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(e.target);
    const msg = `Hello Smartkid Abacus Boragaon! I'd like a free demo class.\nParent: ${f.get('parent')}\nChild: ${f.get('child')}\nPhone: ${f.get('phone')}`;
    window.open('https://wa.me/918638289113?text=' + encodeURIComponent(msg), '_blank', 'noopener');
  });
})();

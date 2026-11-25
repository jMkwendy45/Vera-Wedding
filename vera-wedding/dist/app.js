const welcome = document.querySelector('#welcome');
const invitation = document.querySelector('#invitation');
const openButton = document.querySelector('#open-invitation');
const music = document.querySelector('#wedding-music');
const musicToggle = document.querySelector('#music-toggle');
const musicLabel = document.querySelector('#music-label');
const musicConfig = window.WEDDING_MUSIC || {};
const hasMusic = Boolean(musicConfig.src);
const heroPhoto = document.querySelector('#hero-photo');
const heroPhotos = [
  {src:'images/0Q9A1013.jpg.jpeg',alt:'Hans and Vera together in traditional attire'},
  {src:'images/0Q9A0909.jpg.jpeg',alt:'Vera in wine red beside Hans in a white shirt'},
  {src:'images/0Q9A0993.jpg.jpeg',alt:'Vera and Hans’s pre-wedding portrait'},
  {src:'images/0Q9A0923.jpg.jpeg',alt:'Another beautiful moment with Vera and Hans'}
];
let heroPhotoIndex = 0;
let heroSlideshow = null;
function showNextHeroPhoto() {
  heroPhoto.parentElement.classList.add('is-changing');
  setTimeout(() => {
    heroPhotoIndex = (heroPhotoIndex + 1) % heroPhotos.length;
    heroPhoto.src = heroPhotos[heroPhotoIndex].src;
    heroPhoto.alt = heroPhotos[heroPhotoIndex].alt;
    heroPhoto.parentElement.classList.remove('is-changing');
  }, 700);
}
function startHeroSlideshow() {
  if (heroSlideshow === null) heroSlideshow = setInterval(showNextHeroPhoto, 6000);
}
if (hasMusic) {
  music.src = musicConfig.src;
  music.volume = 0.35;
  if (musicConfig.title) musicToggle.title = musicConfig.title;
}
function syncMusicControl() {
  const playing = !music.paused;
  musicToggle.setAttribute('aria-pressed', String(playing));
  musicToggle.setAttribute('aria-label', playing ? 'Pause wedding music' : 'Play wedding music');
  musicLabel.textContent = playing ? 'Pause music' : 'Play music';
}
async function playMusic() {
  try { await music.play(); } catch { /* The guest can retry with the music button. */ }
  syncMusicControl();
}
musicToggle.addEventListener('click', () => {
  if (music.paused) playMusic();
  else { music.pause(); syncMusicControl(); }
});
music.addEventListener('play', syncMusicControl);
music.addEventListener('pause', syncMusicControl);
music.addEventListener('error', () => {
  musicLabel.textContent = 'Retry music';
  musicToggle.setAttribute('aria-label', 'Retry wedding music');
  musicToggle.setAttribute('aria-pressed', 'false');
});
let opening = false;
openButton.addEventListener('click', () => {
  if (opening) return;
  opening = true;
  if (hasMusic) { musicToggle.hidden = false; playMusic(); }
  openButton.classList.add('opening');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  setTimeout(() => {
    invitation.hidden = false;
    invitation.classList.add('is-revealed');
    if (typeof setupMainAnimations === 'function') setupMainAnimations();
    startHeroSlideshow();
    document.body.classList.remove('sealed');
    welcome.classList.add('dismissed');
    window.scrollTo(0, 0);
    document.querySelector('.brand').focus({ preventScroll: true });
    setTimeout(() => { welcome.hidden = true; }, reduced ? 0 : 900);
  }, reduced ? 50 : 2050);
});
document.querySelector('#replay').addEventListener('click', () => {
  clearInterval(heroSlideshow);
  heroSlideshow = null;
  if (hasMusic) { music.pause(); musicToggle.hidden = true; }
  welcome.hidden = false;
  welcome.classList.remove('dismissed');
  openButton.classList.remove('opening');
  invitation.classList.remove('is-revealed');
  document.body.classList.add('sealed');
  opening = false;
  openButton.focus();
});
const wedding = new Date('2026-12-19T14:00:00+01:00').getTime();
const prevCountdown = {};
function updateCountdown() {
  const remaining = Math.max(0, wedding - Date.now());
  const values = [Math.floor(remaining / 86400000), Math.floor(remaining / 3600000) % 24, Math.floor(remaining / 60000) % 60, Math.floor(remaining / 1000) % 60];
  ['days', 'hours', 'minutes', 'seconds'].forEach((key, index) => {
    const el = document.getElementById(key);
    const nextVal = String(values[index]).padStart(2, '0');
    if (prevCountdown[key] !== undefined && prevCountdown[key] !== nextVal && el.classList) {
      el.classList.remove('is-tick');
      void el.offsetWidth;
      el.classList.add('is-tick');
    }
    prevCountdown[key] = nextVal;
    el.textContent = nextVal;
  });
  if (!remaining) document.querySelector('#countdown-note').textContent = 'The day is here. Here’s to a beautiful forever!';
}
updateCountdown(); setInterval(updateCountdown, 1000);

/* Progressive scroll-reveal animations & subtle reading progress bar for main page */
let animationsReady = false;
function setupMainAnimations() {
  if (animationsReady || typeof IntersectionObserver === 'undefined') return;
  animationsReady = true;
  const groups = [
    ['.invitation-card', 'scale', 0],
    ['.invitation-card > .eyebrow, .invitation-card h2, .invitation-card-message, .invitation-card-signoff', 'fade', 110],
    ['.invite-text > *', 'fade', 95],
    ['.full-names', 'bloom', 120],
    ['.countdown-section > .eyebrow, .countdown-section h2, .countdown-section > p, .countdown-section .text-button', 'fade', 90],
    ['.countdown > div', 'scale', 95],
    ['.gallery-heading > div', 'left', 0],
    ['.gallery-heading > p', 'right', 140],
    ['.gallery-photo', 'scale', 140],
    ['.details .section-heading > *', 'fade', 90],
    ['.date-panel', 'left', 0],
    ['.venue-panel', 'right', 140],
    ['.dress-code > .eyebrow, .dress-code h3', 'fade', 90],
    ['.swatches > span', 'scale', 110],
    ['.rsvp > .eyebrow, .rsvp h2, .rsvp > p, .contact-links, .rsvp-monogram, .rsvp .closing', 'fade', 95]
  ];
  const targets = [];
  groups.forEach(([selector, mode, stagger]) => {
    document.querySelectorAll(selector).forEach((el, idx) => {
      if (!el.hasAttribute('data-reveal')) {
        el.setAttribute('data-reveal', mode);
        if (stagger) el.style.setProperty('--reveal-delay', (idx * stagger) + 'ms');
        targets.push(el);
      }
    });
  });
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    targets.forEach(el => el.classList.add('is-in'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
  targets.forEach(el => observer.observe(el));

  if (document.body && typeof document.createElement === 'function' && typeof window.addEventListener === 'function') {
    const bar = document.createElement('div');
    bar.className = 'scroll-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);
    const updateProgress = () => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const ratio = Math.min(1, Math.max(0, window.scrollY / maxScroll));
      bar.style.transform = 'scaleX(' + ratio.toFixed(4) + ')';
      bar.classList.toggle('is-active', window.scrollY > 40);
    };
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }
}
document.querySelector('#calendar').addEventListener('click', () => {
  const calendar = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//HV Forever//Wedding Invitation//EN','BEGIN:VEVENT','UID:vera-hans-20261219@hvforever','DTSTAMP:20261124T000000Z','DTSTART:20261219T130000Z','SUMMARY:Vera & Hans — Igba Nkwu','LOCATION:Mr. Nwoha Atuma Johnson’s Compound\\, Ezi Atuma\\, Obuohia Ibere\\, Ikwuano LGA\\, Abia State','DESCRIPTION:Traditional marriage ceremony of Veronica Amarachi Johnson and Hans Munachiso Ezewoko. RSVP: 07046851272 or 08168712334.','END:VEVENT','END:VCALENDAR'].join('\r\n');
  const url = URL.createObjectURL(new Blob([calendar], {type:'text/calendar;charset=utf-8'}));
  const link = document.createElement('a'); link.href = url; link.download = 'Vera-and-Hans-Save-the-Date.ics'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
});
const lightbox = document.querySelector('#lightbox');
document.querySelectorAll('[data-photo]').forEach(button => button.addEventListener('click', () => { lightbox.querySelector('img').src = button.dataset.photo; lightbox.querySelector('img').alt = button.querySelector('img').alt; lightbox.showModal(); }));
lightbox.querySelector('button').addEventListener('click', () => lightbox.close());
lightbox.addEventListener('click', event => { if(event.target === lightbox) lightbox.close(); });

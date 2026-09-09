document.getElementById('year').textContent = new Date().getFullYear();

const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');

navToggle.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('is-open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

mainNav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    mainNav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

const header = document.getElementById('siteHeader');
window.addEventListener('scroll', () => {
  header.classList.toggle('is-scrolled', window.scrollY > 10);
});

const revealItems = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

revealItems.forEach((item) => observer.observe(item));

/* In-season contact form: builds a mailto with the entered details.
   Static site, no backend — mailto keeps it a working, honest zero-dependency form. */
const devForm = document.getElementById('devForm');
if (devForm) {
  devForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(devForm);
    const name = data.get('name') || '';
    const email = data.get('email') || '';
    const phone = data.get('phone') || '';
    const role = data.get('role') || '';
    const program = data.get('program') || '';
    const message = data.get('message') || '';

    const subject = `ESD Hoops Inquiry — ${name}`;
    const body =
      `Name: ${name}\n` +
      `Email: ${email}\n` +
      `Phone: ${phone}\n` +
      `Role: ${role}\n` +
      `Program: ${program}\n\n` +
      `Message:\n${message}`;

    window.location.href =
      `mailto:info@esdhoops.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
}

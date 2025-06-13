// script.js
let t;

const navList     = document.getElementById('nav-list');
const footerNav   = document.getElementById('footer-nav');
const mainContent = document.getElementById('main-content');
const yearSpan    = document.getElementById('year');
const logoLink    = document.getElementById('logo-link');
const langSelect  = document.getElementById('lang-select');

const savedLang = localStorage.getItem('lang') || 'en';
langSelect.value = savedLang;

langSelect.addEventListener('change', () => {
  localStorage.setItem('lang', langSelect.value);
  loadTranslations(langSelect.value);
});

async function loadTranslations(lang) {
  try {
    const res = await fetch(`./translations/${lang}.json`);
    if (!res.ok) throw new Error('Not found');
    t = await res.json();
  } catch {
    const fallback = await fetch(`./translations/en.json`);
    t = await fallback.json();
  }
  init();
}

function init() {
  yearSpan.textContent = new Date().getFullYear();
  buildNav();
  buildFooterNav();
  showPage('home');
  logoLink.onclick = e => { e.preventDefault(); showPage('home'); };
}

function buildNav() {
  navList.innerHTML = '';
  t.navItems.forEach(({ title, page }) => {
    const li = document.createElement('li');
    li.textContent = title;
    li.dataset.page = page;
    navList.appendChild(li);
  });
  navList.onclick = e => {
    if (e.target.tagName === 'LI') showPage(e.target.dataset.page);
  };
}

// after buildNav() in your init or DOMContentLoaded handler:
const navToggle = document.getElementById('nav-toggle');
const header    = document.querySelector('.site-header');

navToggle.addEventListener('click', () => {
  header.classList.toggle('nav-open');
});


function buildFooterNav() {
  footerNav.innerHTML = '';
  t.navItems.forEach(({ title, page }) => {
    const li = document.createElement('li');
    li.innerHTML = `<a href="#" data-page="${page}">${title}</a>`;
    footerNav.appendChild(li);
  });
  footerNav.onclick = e => {
    if (e.target.tagName === 'A') {
      e.preventDefault();
      showPage(e.target.dataset.page);
    }
  };
}

function showPage(page) {
  // 1️⃣ Close mobile menu (remove the nav-open flag)
  document.querySelector('.site-header').classList.remove('nav-open');

  // 2️⃣ Highlight the active nav item
  Array.from(navList.children).forEach(li =>
    li.classList.toggle('active', li.dataset.page === page)
  );

  // 3️⃣ Fade out existing content
  mainContent.classList.remove('visible');

  // 4️⃣ After a brief pause, render the new page and fade it in
  setTimeout(() => {
    switch (page) {
      case 'home':     renderHome();     break;
      case 'about':    renderAbout();    break;
      case 'services': renderServices(); break;
      case 'faq':      renderFAQ();      break;
      case 'contact':  renderContact();  break;
      default:         renderHome();
    }
    mainContent.classList.add('visible');
    mainContent.focus();
  }, 100);
}


function renderHome() {
  const c = t.content.home;
  mainContent.innerHTML = `
    <section class="carousel">
      <div class="slides">
        ${t.carouselAlts.map((alt,i)=>
          `<img src="photo${i+1}.jpg" alt="${alt}">`).join('')}
      </div>
      <button class="carousel-button prev">&lt;</button>
      <button class="carousel-button next">&gt;</button>
    </section>
    <section>
      <h1>${c.aboutTitle}</h1>
      <p>${c.aboutText}</p>
    </section>
    <section>
      <h1>${c.ourServicesTitle}</h1>
      <div class="services-grid">
        ${t.services.map(s=>
          `<div class="service-card"><h3>${s.name}</h3><p>${s.description}</p></div>`
        ).join('')}
      </div>
    </section>
    <section class="quote-section">
      <h1>${c.getQuoteTitle}</h1>
      <p>${c.getQuoteText}</p>
      <ul>${c.getQuoteList.map(li=>`<li>${li}</li>`).join('')}</ul>
    </section>
    <section class="download-section">
      <button class="pdf-btn" onclick="window.open('OmniSyn_Services_Catalogue_2025.pdf','_blank')">
        ${c.downloadButton}
      </button>
    </section>
  `;
  initCarousel();
}

function initCarousel() {
  const slides = document.querySelector('.slides');
  const total  = slides.children.length;
  let idx = 0;
  document.querySelector('.prev').onclick = () => {
    idx = (idx - 1 + total) % total;
    slides.style.transform = `translateX(-${idx*100}%)`;
  };
  document.querySelector('.next').onclick = () => {
    idx = (idx + 1) % total;
    slides.style.transform = `translateX(-${idx*100}%)`;
  };
  setInterval(() => {
    idx = (idx + 1) % total;
    slides.style.transform = `translateX(-${idx*100}%)`;
  }, 5000);
}

function renderAbout() {
  const c = t.content.about;
  mainContent.innerHTML = `
    <h1>${c.title}</h1>
    <p>${c.intro}</p>
    <h2>${c.missionTitle}</h2>
    <p>${c.missionText}</p>
    <h2>${c.visionTitle}</h2>
    <p>${c.visionText}</p>
  `;
}

function renderServices() {
  const c = t.content.servicesPage;
  mainContent.innerHTML = `
    <h1>${c.title}</h1>
    <input id="service-search" class="service-search" placeholder="${c.searchPlaceholder}">
    <div id="services-grid" class="services-grid"></div>
  `;
  const grid   = document.getElementById('services-grid');
  const search = document.getElementById('service-search');
  function populate(filter='') {
    grid.innerHTML = t.services
      .filter(s => s.name.toLowerCase().includes(filter.toLowerCase()))
      .map(s => `<div class="service-card"><h3>${s.name}</h3><p>${s.description}</p></div>`)
      .join('');
  }
  populate();
  search.oninput = e => populate(e.target.value);
}

function renderFAQ() {
  mainContent.innerHTML = `
    <h1>${t.content.faqPage.title}</h1>
    ${t.faq.map(item => `
      <div class="faq-item">
        <h3>${item.q}</h3>
        <p>${item.a}</p>
      </div>`).join('')}
  `;
}

function renderContact() {
  mainContent.innerHTML = `
    <h1>${t.content.contactPage.title}</h1>
    <div class="contact-card">
      <p>${t.content.home.getQuoteText}</p>
      <ul>${t.content.home.getQuoteList.map(li=>`<li>${li}</li>`).join('')}</ul>
    </div>
  `;
}

// Start:
loadTranslations(savedLang);

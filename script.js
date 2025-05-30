document.addEventListener("DOMContentLoaded", async () => {
  // Mapping of content keys to possible aliases (without 'repair')
  const keyAliases = {
    "refrigerator repair": ["refrigerator", "fridge", "fridges"],
    "washing machine repair": ["washing machine", "washing machines", "washer", "washers"],
    "dryer repair": ["dryer", "dryers"],
    "dishwasher repair": ["dishwasher", "dish washers", "dishwashers"],
    "oven repair": ["oven", "ovens"],
    "cooktop repair": ["cooktop", "cook top", "cooktops"],
    "microwave repair": ["microwave", "microwaves"],
    "freezer repair": ["freezer", "freezers"],
    "ice maker repair": ["ice maker", "ice-maker", "ice makers"],
    "garbage disposal repair": ["garbage disposal", "garbage-disposal", "disposal"],
    "range hood repair": ["range hood", "rangehood", "hood"],
    "wine cooler repair": ["wine cooler", "wine coolers"]
  };

  // Get search parameter
  const params = new URLSearchParams(window.location.search);
  const kw = (params.get('kw') || '').toLowerCase();

  // Load detailed content data
  let data = {};
  try {
    const res = await fetch('full_appliance_repairs_detailed.json');
    data = await res.json();
  } catch (err) {
    console.error('Error loading full_appliance_repairs_detailed.json', err);
  }

  // Geolocation for user city
  let userCity = 'your area';
  try {
    const locRes = await fetch("https://ipapi.co/json/");
    const locData = await locRes.json();
    if (locData.city) userCity = locData.city;
    const locationEl = document.getElementById('user-location');
    if (locationEl) {
      locationEl.textContent = `Service available in ${userCity} area`;
    }
  } catch (err) {
    console.warn("Geolocation failed or blocked.");
  }

  // Determine which content to render
  const contentContainer = document.getElementById('dynamic-content');
  let matchedKey = null;
  for (const contentKey in keyAliases) {
    if (keyAliases[contentKey].some(alias => new RegExp(`\\b${alias}\\b`, 'i').test(kw))) {
      matchedKey = contentKey;
      break;
    }
  }

  if (matchedKey && data[matchedKey]) {
    // — Specific service page (unchanged) —
    const contentItem = data[matchedKey];
    const imageUrl = contentItem.image || 'default-hero.jpg';

    document.body.style.backgroundImage = `url('${imageUrl}')`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundRepeat = 'no-repeat';
    document.body.style.backgroundAttachment = 'fixed';

    contentContainer.innerHTML = `
      <section class="hero">
        <div class="hero-overlay">
          <h1>${contentItem.title}</h1>
          <p>Ready to get your ${contentItem.title.replace(' repair','')} serviced today in ${userCity}? Book now!</p>
          <button id="book-btn" class="book-btn">Book an Appointment</button>
        </div>
      </section>
      <section class="service-details">
        <h2>Common Problems</h2>
        <div class="problems-wrapper">
          <button class="scroll-btn left-problems" aria-label="Scroll problems left">‹</button>
          <div id="problems-container" class="problems-container"></div>
          <button class="scroll-btn right-problems" aria-label="Scroll problems right">›</button>
        </div>
        <h2>Why Choose Us</h2>
        <ul>
          ${contentItem.solutions.map(s => `<li>${s}</li>`).join('')}
        </ul>
        <h2>Customer Reviews</h2>
        <div class="reviews-wrapper">
          <button class="scroll-btn left-reviews" aria-label="Scroll reviews left">‹</button>
          <div id="reviews-container" class="reviews-container"></div>
          <button class="scroll-btn right-reviews" aria-label="Scroll reviews right">›</button>
        </div>
      </section>
    `;

    // Smooth scroll to booking widget
    document.getElementById('book-btn').addEventListener('click', e => {
      e.preventDefault();
      const widget = document.getElementById('booking-widget');
      if (widget) widget.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    // Render Problems carousel
    const problemsContainer = document.getElementById('problems-container');
    if (problemsContainer) {
      problemsContainer.innerHTML = '';
      contentItem.problems.forEach(p => {
        const card = document.createElement('div');
        card.className = 'problem-card';
        card.innerHTML = `
          <h3 class="issue">${p.issue}</h3>
          <p class="causes">${p.causes}</p>
          <ul class="costs">${p.costs.map(c => `<li>${c}</li>`).join('')}</ul>
        `;
        problemsContainer.appendChild(card);
      });
      setupScrollButtons('#problems-container', '.left-problems', '.right-problems');
    }

    // Load and render Reviews carousel
    try {
      const revRes = await fetch('reviews.json');
      const reviews = await revRes.json();
      const reviewsContainer = document.getElementById('reviews-container');
      if (reviewsContainer) {
        reviewsContainer.innerHTML = '';
        reviews.forEach(r => {
          const card = document.createElement('div');
          card.className = 'review-card';
          card.innerHTML = `
            <div class="text">${r.text}</div>
            <div class="stars">${'★'.repeat(r.stars)}</div>
            <div class="author">— ${r.author}</div>
          `;
          reviewsContainer.appendChild(card);
        });
        setupScrollButtons('#reviews-container', '.left-reviews', '.right-reviews');
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    }

  } else {
    // — Default home page with Services first, then Reviews —
    document.body.style.backgroundImage = '';
    renderDefault();

    // Detach the reviews wrapper so we can reinsert it below Services
    const reviewsWrapper = contentContainer.querySelector('.reviews-wrapper');
    if (reviewsWrapper) reviewsWrapper.remove();

    // Our Services carousel
    const servicesSection = document.createElement('section');
    servicesSection.className = 'services-section';
    servicesSection.innerHTML = `
      <h2>Our Services</h2>
      <div class="problems-wrapper services-wrapper">
        <button class="scroll-btn left-services" aria-label="Scroll services left">‹</button>
        <div id="services-container" class="problems-container"></div>
        <button class="scroll-btn right-services" aria-label="Scroll services right">›</button>
      </div>
    `;
    contentContainer.appendChild(servicesSection);

    // Render Services carousel items
    const servicesContainer = document.getElementById('services-container');
    if (servicesContainer) {
      servicesContainer.innerHTML = '';
      Object.keys(keyAliases).forEach(key => {
        const item = data[key];
        if (!item || !Array.isArray(item.problems)) return;
        const card = document.createElement('div');
        card.className = 'problem-card';
        const listItems = item.problems.slice(0, 3).map(p => {
          const price = Array.isArray(p.costs) && p.costs.length ? p.costs[0] : '';
          return `<li><strong>${p.issue}</strong>: ${price}</li>`;
        }).join('');
        card.innerHTML = `
          <h3>${item.title}</h3>
          <ul class="costs">${listItems}</ul>
        `;
        servicesContainer.appendChild(card);
      });
      setupScrollButtons('#services-container', '.left-services', '.right-services');
    }

    // Re-attach Reviews wrapper below Services
    if (reviewsWrapper) contentContainer.appendChild(reviewsWrapper);

    // Load and render Reviews carousel in default view
    try {
      const revRes = await fetch('reviews.json');
      const reviews = await revRes.json();
      const reviewsContainer = document.getElementById('reviews-container');
      if (reviewsContainer) {
        reviewsContainer.innerHTML = '';
        reviews.forEach(r => {
          const card = document.createElement('div');
          card.className = 'review-card';
          card.innerHTML = `
            <div class="text">${r.text}</div>
            <div class="stars">${'★'.repeat(r.stars)}</div>
            <div class="author">— ${r.author}</div>
          `;
          reviewsContainer.appendChild(card);
        });
        setupScrollButtons('#reviews-container', '.left-reviews', '.right-reviews');
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    }
  }
});

/**
 * Universal function to wire up horizontal scrolling buttons
 */
function setupScrollButtons(containerSelector, leftBtnSelector, rightBtnSelector) {
  const container = document.querySelector(containerSelector);
  const leftBtn = document.querySelector(leftBtnSelector);
  const rightBtn = document.querySelector(rightBtnSelector);
  if (!container || !leftBtn || !rightBtn) return;

  leftBtn.addEventListener('click', () => {
    container.scrollBy({ left: -container.clientWidth, behavior: 'smooth' });
  });
  rightBtn.addEventListener('click', () => {
    container.scrollBy({ left: container.clientWidth, behavior: 'smooth' });
  });
}

/**
 * Default render if no specific appliance key matched
 */
function renderDefault() {
  const contentContainer = document.getElementById('dynamic-content');
  contentContainer.innerHTML = `
    <h1>Home Appliance Repair</h1>
    <p>We fix all types of appliances in ${document.getElementById('user-location')?.textContent || 'your area'}.</p>
    <div class="reviews-wrapper">
      <button class="scroll-btn left-reviews" aria-label="Scroll reviews left">‹</button>
      <div id="reviews-container" class="reviews-container"></div>
      <button class="scroll-btn right-reviews" aria-label="Scroll reviews right">›</button>
    </div>
  `;
}

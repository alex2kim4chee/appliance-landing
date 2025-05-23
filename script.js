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
    if (keyAliases[contentKey].some(alias => new RegExp(`\\b${alias}\\b`).test(kw))) {
      matchedKey = contentKey;
      break;
    }
  }

  if (matchedKey && data[matchedKey]) {
    const contentItem = data[matchedKey];
    const imageUrl = contentItem.image || 'default-hero.jpg';

    // Set body background
    document.body.style.backgroundImage = `url('${imageUrl}')`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundRepeat = 'no-repeat';
    document.body.style.backgroundAttachment = 'fixed';

    // Render Hero section and service details
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
        <ul>
          ${contentItem.problems.map(p => `
            <li class="problem-item">
              <strong>${p.issue}</strong>
              <p>${p.causes}</p>
              <p><em>Estimated cost:</em> ${p.costs.join(', ')}</p>
            </li>
          `).join('')}
        </ul>
        <h2>Why Choose Us</h2>
        <ul>
          ${contentItem.solutions.map(s => `<li>${s}</li>`).join('')}
        </ul>
        <h2>Customer Reviews</h2>
        <div class="reviews-wrapper">
          <div id="reviews-container" class="reviews-container"></div>
          <button class="scroll-btn left" aria-label="Scroll left">&lt;</button>
          <button class="scroll-btn right" aria-label="Scroll right">&gt;</button>
        </div>
      </section>
    `;

    // Setup booking button popup
    document.getElementById('book-btn').addEventListener('click', () => {
      window.open(
        'https://docs.google.com/forms/d/e/FORM_ID/viewform',
        'appointment',
        'width=600,height=800,menubar=no,toolbar=no'
      );
    });

    // Load and render reviews
    try {
      const revRes = await fetch('reviews.json');
      const reviews = await revRes.json();
      const reviewsContainer = document.getElementById('reviews-container');
      if (reviewsContainer) {
        reviewsContainer.innerHTML = '';
        reviews.forEach(r => {
          const card = document.createElement('div');
          card.className = 'review-card';
          const text = document.createElement('div');
          text.className = 'text';
          text.textContent = r.text;
          const stars = document.createElement('div');
          stars.className = 'stars';
          stars.textContent = '★'.repeat(r.stars);
          const author = document.createElement('div');
          author.className = 'author';
          author.textContent = `— ${r.author}`;
          card.append(text, stars, author);
          reviewsContainer.appendChild(card);
        });
        setupScrollButtons();
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    }

  } else {
    // Reset body background if no match
    document.body.style.backgroundImage = '';
    renderDefault();
  }
});

function setupScrollButtons() {
  const leftBtn = document.querySelector('.scroll-btn.left');
  const rightBtn = document.querySelector('.scroll-btn.right');
  const container = document.getElementById('reviews-container');
  if (!leftBtn || !rightBtn || !container) return;

  leftBtn.addEventListener('click', () => {
    container.scrollBy({ left: -320, behavior: 'smooth' });
  });
  rightBtn.addEventListener('click', () => {
    container.scrollBy({ left: 320, behavior: 'smooth' });
  });
}

function renderDefault() {
  const contentContainer = document.getElementById('dynamic-content');
  contentContainer.innerHTML = `
    <h1>Home Appliance Repair</h1>
    <p>We fix all types of appliances in ${document.getElementById('user-location')?.textContent || 'your area'}.</p>
    <div class="reviews-wrapper">
      <div id="reviews-container" class="reviews-container"></div>
      <button class="scroll-btn left" aria-label="Scroll left">&lt;</button>
      <button class="scroll-btn right" aria-label="Scroll right">&gt;</button>
    </div>
  `;
}

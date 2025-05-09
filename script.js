document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const kw = (params.get('kw') || '').toLowerCase();

  const res = await fetch('content.json');
  const data = await res.json();

  let userCity = "your city"; // default
  try {
    const locRes = await fetch("https://ipapi.co/json/");
    const locData = await locRes.json();
    if (locData.city) userCity = locData.city;
    const locationEl = document.getElementById('user-location');
if (locationEl) {
  locationEl.textContent = `Service available in ${userCity}`;
}
  } catch (e) {
    console.warn("Geolocation failed or blocked.");
  }

  const container = document.getElementById('dynamic-content');
  for (const key in data) {
    if (kw.includes(key)) {
      const content = data[key];
      container.innerHTML = `
        <h1>${content.title}</h1>
        <p>${content.subtitle.replace("your area", userCity)}</p>

        <h2>Common Problems:</h2>
        <ul>${content.problems.map(p => `<li>${p}</li>`).join('')}</ul>

        <h2>Why Choose Us:</h2>
        <ul>${content.solutions.map(s => `<li>${s}</li>`).join('')}</ul>

        <h2>Customer Reviews:</h2>
        <div class="reviews-wrapper">
          <button class="scroll-btn left" aria-label="Scroll left">‹</button>
          <div class="reviews-carousel" id="reviews-container"></div>
          <button class="scroll-btn right" aria-label="Scroll right">›</button>
        </div>
      `;
      await loadReviews();
      setupScrollButtons();
      return;
    }
  }

  container.innerHTML = `
    <h1>Home Appliance Repair</h1>
    <p>Enter your service request to get matched with a local technician in ${userCity}.</p>
    <div class="reviews-wrapper">
      <button class="scroll-btn left" aria-label="Scroll left">‹</button>
      <div class="reviews-carousel" id="reviews-container"></div>
      <button class="scroll-btn right" aria-label="Scroll right">›</button>
    </div>
  `;
  await loadReviews();
  setupScrollButtons();
});

// Загрузка отзывов из reviews.json и отображение карточек
async function loadReviews() {
  try {
    const res = await fetch('reviews.json');
    const reviews = await res.json();
    const container = document.getElementById('reviews-container');
    if (!container) return;

    reviews.forEach(r => {
      const card = document.createElement('div');
      card.className = 'review-card';

      const text = document.createElement('p');
      text.textContent = `“${r.text}”`;

      const stars = document.createElement('div');
      stars.className = 'stars';
      stars.textContent = '★'.repeat(r.stars);

      const author = document.createElement('div');
      author.className = 'author';
      author.textContent = `— ${r.author}`;

      card.appendChild(text);
      card.appendChild(stars);
      card.appendChild(author);
      container.appendChild(card);
    });
  } catch (err) {
    console.error('Failed to load reviews:', err);
  }
}

// Управление прокруткой отзывов стрелками
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

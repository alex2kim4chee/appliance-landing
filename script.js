
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

                <h2>Customer Review:</h2>
                <blockquote>${content.review}</blockquote>
            `;
            return;
        }
    }

    container.innerHTML = `
        <h1>Home Appliance Repair</h1>
        <p>Enter your service request to get matched with a local technician in ${userCity}.</p>
    `;
});

const API_URL = '/api/weather';
const container = document.getElementById('weather-container');
const loadingDiv = document.getElementById('loading');
const errorDiv = document.getElementById('error');





// Function to get weather image based on WMO code
function getWeatherImage(code) {
  if (code === 0) return 'images/sunny.png'; // ☀️
  if (code === 1 || code === 2 || code === 3) return 'images/over cast.png'; // ☁️
  if (code === 45 || code === 48) return 'images/foggy.png'; // 🌫️
  if (code >= 51 && code <= 65) return 'images/rain.png'; // 🌧️
  if (code >= 71 && code <= 77) return 'images/snowy.jpg'; // 🌨️
  if (code >= 80 && code <= 82) return 'images/rain.png'; // 🌧️
  if (code >= 85 && code <= 86) return 'images/snowy.jpg'; // ❄️
  if (code >= 95) return 'images/stormy.jpg'; // ⛈️
  return 'images/sunny.png'; // ☀️
}



// Function to create weather card HTML
function createWeatherCard(data) {
  if (data.error) {
    return `
      <div class="col-md-6 col-lg-4">
        <div class="weather-card">
          <div class="card-body text-center">
            <h5 class="city-name">${data.city}</h5>
            <p class="text-danger">${data.error}</p>
          </div>
        </div>
      </div>
    `;
  }

  const imageUrl = getWeatherImage(data.weatherCode);
  return `
    <div class="col-md-6 col-lg-4">
      <div class="weather-card" style="background-image: url('${imageUrl}')">
        <div class="card-body">
          <h5 class="city-name">${data.city}</h5>
          <div class="temperature">${Math.round(data.temp)}°C</div>
          <p class="description">${data.description}</p>
          <div class="weather-details">
            <div class="detail-item">
              <span class="detail-label">Feels Like</span>
              <span class="detail-value">${Math.round(data.feelsLike)}°C</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Humidity</span>
              <span class="detail-value">${data.humidity}%</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Wind</span>
              <span class="detail-value">${data.wind} m/s</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Fetch weather data and render
async function fetchWeather() {
  try {
    const response = await axios.get(API_URL);
    loadingDiv.style.display = 'none';
    
    const html = response.data.map(createWeatherCard).join('');
    container.innerHTML = html;
  } catch (error) {
    loadingDiv.style.display = 'none';
    errorDiv.classList.remove('d-none');
    errorDiv.textContent = 'Failed to fetch weather data. Make sure backend is running.';
    console.error('Error:', error);
  }
}

// Initial load
fetchWeather();

// Function to display current date
function displayCurrentDate() {
  const dateElement = document.getElementById('current-date');
  if (dateElement) {
    const now = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    dateElement.textContent = now.toLocaleDateString('en-US', options);
  }
}

// Display the current date on load
displayCurrentDate();

// About Modal
const aboutLink = document.getElementById('about-link');
const aboutModal = new bootstrap.Modal(document.getElementById('aboutModal'));

aboutLink.addEventListener('click', (e) => {
  e.preventDefault();
  aboutModal.show();
});
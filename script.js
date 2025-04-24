const searchForm = document.getElementById('search-form');
const countryInput = document.getElementById('country-input');
const resultsContainer = document.getElementById('results');
const loadingIndicator = document.getElementById('loading');
const errorMessage = document.getElementById('error-message');
const modal = document.getElementById('country-modal');
const closeModal = document.getElementById('close-modal');
const modalContentContainer = document.getElementById('modal-content-container');

const COUNTRIES_API = 'https://restcountries.com/v3.1';
const WEATHER_API = 'https://api.openweathermap.org/data/2.5/weather';
const WEATHER_API_KEY = '4d8fb5b93d4af21d66a2948710284366';

searchForm.addEventListener('submit', handleSearch);
closeModal.addEventListener('click', () => modal.style.display = 'none');
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});
async function handleSearch(e) {
    e.preventDefault();
    const searchTerm = countryInput.value.trim();
    
    if (!searchTerm) return;
    loadingIndicator.style.display = 'block';
    errorMessage.style.display = 'none';
    resultsContainer.innerHTML = '';
    
    try {
        const countries = await fetchCountries(searchTerm);
        displayCountries(countries);
    } catch (error) {
        showError('Failed to fetch countries. Please try again.');
        console.error('Error fetching countries:', error);
    } finally {
        loadingIndicator.style.display = 'none';
    }
}
async function fetchCountries(searchTerm) {
    const response = await fetch(`${COUNTRIES_API}/name/${searchTerm}`);
    
    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('No countries found with that name');
        }
        throw new Error('Failed to fetch countries');
    }
    
    return await response.json();
}
function displayCountries(countries) {
    if (!countries || countries.length === 0) {
        showError('No countries found with that name');
        return;
    }

    resultsContainer.innerHTML = '';
    countries.slice(0, 6).forEach(country => {
        const card = document.createElement('div');
        card.className = 'country-card';
        
        card.innerHTML = `
            <img class="country-flag" src="${country.flags.png}" alt="${country.name.common} flag">
            <div class="country-info">
                <h3 class="country-name">${country.name.common}</h3>
                <p class="country-region">${country.region}</p>
                <button class="more-details-btn" data-country="${country.cca2}">More Details</button>
            </div>
        `;
        
        resultsContainer.appendChild(card);

        const detailsButton = card.querySelector('.more-details-btn');
        detailsButton.addEventListener('click', () => showCountryDetails(country));
    });
}

async function showCountryDetails(country) {
    modalContentContainer.innerHTML = `
        <div class="loading">
            <div class="loading-spinner"></div>
            <p>Loading details...</p>
        </div>
    `;
    modal.style.display = 'block';
    
    try {
        let weatherData = null;
        if (country.capital && country.capital.length > 0) {
            weatherData = await fetchWeatherData(country.capital[0], country.cca2);
        }
        const languages = country.languages ? Object.values(country.languages).join(', ') : 'N/A';
        const currencies = country.currencies ? 
            Object.values(country.currencies).map(c => `${c.name} (${c.symbol || 'N/A'})`).join(', ') : 
            'N/A';
        
        modalContentContainer.innerHTML = `
            <div class="modal-header">
                <img class="modal-flag" src="${country.flags.png}" alt="${country.name.common} flag">
                <h2 class="modal-country-name">${country.name.common}</h2>
            </div>
            
            <div class="country-details">
                <div>
                    <p class="detail-item">
                        <span class="detail-label">Official Name:</span><br>
                        <span class="detail-value">${country.name.official}</span>
                    </p>
                </div>
                <div>
                    <p class="detail-item">
                        <span class="detail-label">Capital:</span><br>
                        <span class="detail-value">${country.capital ? country.capital[0] : 'N/A'}</span>
                    </p>
                </div>
                <div>
                    <p class="detail-item">
                        <span class="detail-label">Population:</span><br>
                        <span class="detail-value">${country.population.toLocaleString()}</span>
                    </p>
                </div>
                <div>
                    <p class="detail-item">
                        <span class="detail-label">Region:</span><br>
                        <span class="detail-value">${country.region}</span>
                    </p>
                </div>
                <div>
                    <p class="detail-item">
                        <span class="detail-label">Subregion:</span><br>
                        <span class="detail-value">${country.subregion || 'N/A'}</span>
                    </p>
                </div>
                <div>
                    <p class="detail-item">
                        <span class="detail-label">Languages:</span><br>
                        <span class="detail-value">${languages}</span>
                    </p>
                </div>
                <div>
                    <p class="detail-item">
                        <span class="detail-label">Currencies:</span><br>
                        <span class="detail-value">${currencies}</span>
                    </p>
                </div>
                <div>
                    <p class="detail-item">
                        <span class="detail-label">Area:</span><br>
                        <span class="detail-value">${country.area ? `${country.area.toLocaleString()} km²` : 'N/A'}</span>
                    </p>
                </div>
            </div>
            
            ${weatherData ? `
                <div class="weather-section">
                    <h3 class="weather-title">Current Weather in ${country.capital[0]}</h3>
                    <div class="weather-info">
                        <div>
                            <span class="weather-temp">${Math.round(weatherData.main.temp)}°C</span>
                            <p class="weather-desc">${weatherData.weather[0].description}</p>
                        </div>
                        <img src="https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png" alt="${weatherData.weather[0].description}">
                    </div>
                    <div class="weather-details">
                        <div>
                            <p class="detail-item">
                                <span class="detail-label">Feels Like:</span><br>
                                <span class="detail-value">${Math.round(weatherData.main.feels_like)}°C</span>
                            </p>
                        </div>
                        <div>
                            <p class="detail-item">
                                <span class="detail-label">Humidity:</span><br>
                                <span class="detail-value">${weatherData.main.humidity}%</span>
                            </p>
                        </div>
                        <div>
                            <p class="detail-item">
                                <span class="detail-label">Wind Speed:</span><br>
                                <span class="detail-value">${weatherData.wind.speed} m/s</span>
                            </p>
                        </div>
                    </div>
                </div>
            ` : `
                <div class="weather-section">
                    <h3 class="weather-title">Weather Data Unavailable</h3>
                    <p>Weather information is not available for this country.</p>
                </div>
            `}
        `;
    } catch (error) {
        modalContentContainer.innerHTML = `
            <div class="modal-header">
                <img class="modal-flag" src="${country.flags.png}" alt="${country.name.common} flag">
                <h2 class="modal-country-name">${country.name.common}</h2>
            </div>
            
            <div class="country-details">
                <!-- Country details as above -->
            </div>
            
            <div class="weather-section">
                <h3 class="weather-title">Weather Data Unavailable</h3>
                <p>Failed to load weather information. Please try again later.</p>
            </div>
        `;
        console.error('Error fetching weather data:', error);
    }
}

async function fetchWeatherData(city, countryCode) {
    const response = await fetch(
        `${WEATHER_API}?q=${city},${countryCode}&units=metric&appid=${WEATHER_API_KEY}`
    );
    
    if (!response.ok) {
        throw new Error('Failed to fetch weather data');
    }
    
    return await response.json();
}
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}
window.addEventListener('DOMContentLoaded', async () => {
    loadingIndicator.style.display = 'block';
    
    try {
        const popularCountries = await fetch(`${COUNTRIES_API}/alpha?codes=US,GB,FR,DE,JP,CA,AU,IN,BR,CN`);
        
        if (!popularCountries.ok) {
            throw new Error('Failed to fetch initial countries');
        }
        
        const countries = await popularCountries.json();
        displayCountries(countries);
    } catch (error) {
        showError('Failed to load initial countries. Please try searching for a country.');
        console.error('Error loading initial countries:', error);
    } finally {
        loadingIndicator.style.display = 'none';
    }
});
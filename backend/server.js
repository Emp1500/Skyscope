const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const { getAllCities, cacheWeatherData, getCachedWeather, logWeatherView } = require('./queries');

// Middleware
app.use(cors());
app.use(express.json());


const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast';

// Get weather for all cities
app.get('/api/weather', async (req, res) => {
  try {
  
    const cities = await getAllCities();
    
    if (cities.length === 0) {
      return res.json([]);
    }

    const weatherPromises = cities.map(async (city) => {
      try {
      
        const cached = await getCachedWeather(city.id, 30); 
        
        if (cached) {
          
          logWeatherView(city.id, req.ip);
          return {
            id: city.id,
            city: city.name,
            temp: cached.temp,
            feelsLike: cached.feels_like,
            humidity: cached.humidity,
            wind: cached.wind,
            description: cached.description,
            weatherCode: cached.weather_code,
            fromCache: true
          };
        }
        const response = await axios.get(WEATHER_API_URL, {
          params: {
            latitude: city.latitude,
            longitude: city.longitude,
            current: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,apparent_temperature',
            timezone: 'auto'
          }
        });

        const current = response.data.current;
        const weatherData = {
          temp: current.temperature_2m,
          feelsLike: current.apparent_temperature,
          humidity: current.relative_humidity_2m,
          wind: current.wind_speed_10m,
          weatherCode: current.weather_code,
          description: getWeatherDescription(current.weather_code)
        };

        await cacheWeatherData(city.id, weatherData);

        logWeatherView(city.id, req.ip);

        return {
          id: city.id,
          city: city.name,
          ...weatherData,
          fromCache: false
        };
      } catch (error) {
        console.error(`Error for ${city.name}:`, error.message);
        return {
          id: city.id,
          city: city.name,
          error: 'Unable to fetch weather'
        };
      }
    });

    const weatherData = await Promise.all(weatherPromises);
    res.json(weatherData);
  } catch (error) {
    console.error('API Error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get list of cities from database
app.get('/api/cities', async (req, res) => {
  try {
    const cities = await getAllCities();
    const cityNames = cities.map(c => c.name);
    res.json(cityNames);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cities' });
  }
});

// Helper function for weather descriptions
function getWeatherDescription(code) {
  const weatherCodes = {
    0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
    45: 'Foggy', 48: 'Depositing rime fog', 51: 'Light drizzle', 53: 'Moderate drizzle',
    55: 'Dense drizzle', 61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
    71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow', 77: 'Snow grains',
    80: 'Slight rain showers', 81: 'Moderate rain showers', 82: 'Violent rain showers',
    85: 'Slight snow showers', 86: 'Heavy snow showers', 95: 'Thunderstorm',
    96: 'Thunderstorm with hail', 99: 'Thunderstorm with heavy hail'
  };
  return weatherCodes[code] || 'Unknown';
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
const pool = require('./db');

// Get all cities from database
async function getAllCities() {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, latitude, longitude FROM cities ORDER BY name'
    );
    return rows;
  } catch (error) {
    console.error('Error fetching cities:', error.message);
    throw error;
  }
}

// Get single city by ID
async function getCityById(cityId) {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, latitude, longitude FROM cities WHERE id = ?',
      [cityId]
    );
    return rows[0] || null;
  } catch (error) {
    console.error('Error fetching city:', error.message);
    throw error;
  }
}

// Cache weather data to database
async function cacheWeatherData(cityId, weatherData) {
  try {
    const query = `
      INSERT INTO weather_cache (city_id, temp, feels_like, humidity, wind, description, weather_code, cached_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
      temp = VALUES(temp),
      feels_like = VALUES(feels_like),
      humidity = VALUES(humidity),
      wind = VALUES(wind),
      description = VALUES(description),
      weather_code = VALUES(weather_code),
      cached_at = NOW()
    `;
    
    const [result] = await pool.query(query, [
      cityId,
      weatherData.temp,
      weatherData.feelsLike,
      weatherData.humidity,
      weatherData.wind,
      weatherData.description,
      weatherData.weatherCode
    ]);
    return result;
  } catch (error) {
    console.error('Error caching weather:', error.message);
    throw error;
  }
}

// Get cached weather data
async function getCachedWeather(cityId, maxAgeMinutes = 30) {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM weather_cache 
       WHERE city_id = ? AND cached_at > DATE_SUB(NOW(), INTERVAL ? MINUTE)`,
      [cityId, maxAgeMinutes]
    );
    return rows[0] || null;
  } catch (error) {
    console.error('Error fetching cached weather:', error.message);
    throw error;
  }
}

// Log weather view (for analytics)
async function logWeatherView(cityId, userIp) {
  try {
    const [result] = await pool.query(
      'INSERT INTO weather_logs (city_id, user_ip, viewed_at) VALUES (?, ?, NOW())',
      [cityId, userIp]
    );
    return result;
  } catch (error) {
    console.error('Error logging view:', error.message);
    // Don't throw - logging failures shouldn't break the app
  }
}

module.exports = {
  getAllCities,
  getCityById,
  cacheWeatherData,
  getCachedWeather,
  logWeatherView
};